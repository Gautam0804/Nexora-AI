import {
  createConversation,
  getUserConversations,
  getConversation,
  getConversationMessages,
  addConversationMessage,
  updateConversationTitle,
  deleteConversation,
  ConversationMessage,
} from "./conversation.repository";

import {
  answerQuestion,
  ConversationHistoryMessage,
} from "./rag.service";

export interface SendConversationMessageResult {
  conversation: {
    id: string;
    user_id: string;
    document_id: string | null;
    title: string;
    created_at: Date;
    updated_at: Date;
  };

  userMessage: ConversationMessage;

  assistantMessage: ConversationMessage;

  answer: string;

  citations: unknown[];
}

/* ==========================================================================
   CREATE CONVERSATION
   ========================================================================== */

export async function createNewConversation(
  userId: string,
  documentId?: string,
  title = "New conversation"
) {
  return createConversation(
    userId,
    documentId,
    title
  );
}

/* ==========================================================================
   LIST CONVERSATIONS
   ========================================================================== */

export async function listConversations(
  userId: string
) {
  return getUserConversations(userId);
}

/* ==========================================================================
   GET CONVERSATION WITH MESSAGES
   ========================================================================== */

export async function getConversationWithMessages(
  userId: string,
  conversationId: string
) {
  const conversation = await getConversation(
    userId,
    conversationId
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await getConversationMessages(
    userId,
    conversationId
  );

  return {
    conversation,
    messages,
  };
}

/* ==========================================================================
   SEND MESSAGE
   ========================================================================== */

export async function sendConversationMessage(
  userId: string,
  conversationId: string,
  question: string
): Promise<SendConversationMessageResult> {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Message is required");
  }

  /* ------------------------------------------------------------------------
     Get conversation
     ------------------------------------------------------------------------ */

  const conversation = await getConversation(
    userId,
    conversationId
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  /* ------------------------------------------------------------------------
     Get selected document
     ------------------------------------------------------------------------ */

  const documentId =
    conversation.document_id ?? undefined;

  /* ------------------------------------------------------------------------
     Load previous conversation messages
     ------------------------------------------------------------------------ */

  const previousMessages =
    await getConversationMessages(
      userId,
      conversationId
    );

  /*
   * Keep the latest 12 messages as conversational
   * context so prompts don't grow indefinitely.
   */

  const conversationHistory: ConversationHistoryMessage[] =
    previousMessages.slice(-12).map((message) => ({
      role:
        message.role === "user"
          ? "user"
          : "assistant",
      content: message.content,
    }));

  console.log(
    "CONVERSATION HISTORY MESSAGES:",
    conversationHistory.length
  );

  /* ------------------------------------------------------------------------
     Ask RAG
     ------------------------------------------------------------------------ */

  const ragResult = await answerQuestion(
    userId,
    cleanQuestion,
    documentId,
    conversationHistory
  );

  /* ------------------------------------------------------------------------
     Save user message
     ------------------------------------------------------------------------ */

  const userMessage =
    await addConversationMessage(
      userId,
      conversationId,
      "user",
      cleanQuestion
    );

  /* ------------------------------------------------------------------------
     Save assistant message
     ------------------------------------------------------------------------ */

  const assistantMessage =
    await addConversationMessage(
      userId,
      conversationId,
      "assistant",
      ragResult.answer
    );

  /* ------------------------------------------------------------------------
     Auto-generate title
     ------------------------------------------------------------------------ */

  let updatedConversation = conversation;

  if (
    !conversation.title ||
    conversation.title === "New conversation"
  ) {
    const title =
      generateConversationTitle(
        cleanQuestion
      );

    const renamedConversation =
      await updateConversationTitle(
        userId,
        conversationId,
        title
      );

    if (renamedConversation) {
      updatedConversation =
        renamedConversation;
    }
  } else {
    /*
     * Fetch again so the returned object contains
     * the latest conversation data.
     */

    const refreshedConversation =
      await getConversation(
        userId,
        conversationId
      );

    if (refreshedConversation) {
      updatedConversation =
        refreshedConversation;
    }
  }

  return {
    conversation: updatedConversation,
    userMessage,
    assistantMessage,
    answer: ragResult.answer,
    citations: ragResult.citations,
  };
}

/* ==========================================================================
   RENAME CONVERSATION
   ========================================================================== */

export async function renameConversation(
  userId: string,
  conversationId: string,
  title: string
) {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error(
      "Conversation title is required"
    );
  }

  const conversation =
    await getConversation(
      userId,
      conversationId
    );

  if (!conversation) {
    return null;
  }

  return updateConversationTitle(
    userId,
    conversationId,
    cleanTitle
  );
}

/* ==========================================================================
   GENERATE CONVERSATION TITLE
   ========================================================================== */

function generateConversationTitle(
  question: string
): string {
  const clean = question
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "New conversation";
  }

  const maxLength = 60;

  if (clean.length <= maxLength) {
    return clean;
  }

  return (
    clean
      .slice(0, maxLength)
      .trimEnd() + "..."
  );
}

/* ==========================================================================
   DELETE CONVERSATION
   ========================================================================== */

export async function removeConversation(
  userId: string,
  conversationId: string
) {
  const conversation =
    await getConversation(
      userId,
      conversationId
    );

  if (!conversation) {
    return {
      success: false,
    };
  }

  await deleteConversation(
    userId,
    conversationId
  );

  return {
    success: true,
  };
}