import { db } from "../config/db";

export interface Conversation {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  citations: unknown[];
  created_at: Date;
}

/* -------------------------------------------------------------------------- */
/* Create Conversation                                                        */
/* -------------------------------------------------------------------------- */

export async function createConversation(
  userId: string,
  documentId?: string,
  title = "New conversation"
): Promise<Conversation> {
  const result = await db.query(
    `
      INSERT INTO conversations (
        user_id,
        document_id,
        title
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        user_id,
        document_id,
        title,
        created_at,
        updated_at
    `,
    [
      userId,
      documentId ?? null,
      title.trim() || "New conversation",
    ]
  );

  return result.rows[0];
}

/* -------------------------------------------------------------------------- */
/* Get User Conversations                                                     */
/* -------------------------------------------------------------------------- */

export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  const result = await db.query(
    `
      SELECT
        id,
        user_id,
        document_id,
        title,
        created_at,
        updated_at
      FROM conversations
      WHERE user_id = $1
      ORDER BY updated_at DESC, created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

/* -------------------------------------------------------------------------- */
/* Get Single Conversation                                                    */
/* -------------------------------------------------------------------------- */

export async function getConversation(
  userId: string,
  conversationId: string
): Promise<Conversation | null> {
  const result = await db.query(
    `
      SELECT
        id,
        user_id,
        document_id,
        title,
        created_at,
        updated_at
      FROM conversations
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [conversationId, userId]
  );

  return result.rows[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Get Conversation Messages                                                  */
/* -------------------------------------------------------------------------- */

export async function getConversationMessages(
  userId: string,
  conversationId: string
): Promise<ConversationMessage[]> {
  const result = await db.query(
    `
      SELECT
        m.id,
        m.conversation_id,
        m.role,
        m.content,
        m.citations,
        m.created_at
      FROM conversation_messages m
      INNER JOIN conversations c
        ON c.id = m.conversation_id
      WHERE m.conversation_id = $1
        AND c.user_id = $2
      ORDER BY m.created_at ASC
    `,
    [conversationId, userId]
  );

  return result.rows;
}

/* -------------------------------------------------------------------------- */
/* Add Conversation Message                                                   */
/* -------------------------------------------------------------------------- */

export async function addConversationMessage(
  userId: string,
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  citations: unknown[] = []
): Promise<ConversationMessage> {
  /*
   * First verify that the conversation belongs to the current user.
   * This prevents inserting messages into another user's conversation.
   */
  const conversation = await getConversation(
    userId,
    conversationId
  );

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const result = await db.query(
    `
      INSERT INTO conversation_messages (
        conversation_id,
        role,
        content,
        citations
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        conversation_id,
        role,
        content,
        citations,
        created_at
    `,
    [
      conversationId,
      role,
      content,
      JSON.stringify(citations ?? []),
    ]
  );

  /*
   * IMPORTANT:
   * A new message means the conversation was just updated.
   *
   * This makes:
   *
   *   ORDER BY updated_at DESC
   *
   * correctly put the latest conversation at the top.
   */
  await db.query(
    `
      UPDATE conversations
      SET updated_at = NOW()
      WHERE id = $1
        AND user_id = $2
    `,
    [conversationId, userId]
  );

  return result.rows[0];
}

/* -------------------------------------------------------------------------- */
/* Update Conversation Title                                                  */
/* -------------------------------------------------------------------------- */

export async function updateConversationTitle(
  userId: string,
  conversationId: string,
  title: string
): Promise<Conversation | null> {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error("Conversation title is required");
  }

  const result = await db.query(
    `
      UPDATE conversations
      SET
        title = $1,
        updated_at = NOW()
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        user_id,
        document_id,
        title,
        created_at,
        updated_at
    `,
    [
      cleanTitle,
      conversationId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Delete Conversation                                                        */
/* -------------------------------------------------------------------------- */

export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const result = await db.query(
    `
      DELETE FROM conversations
      WHERE id = $1
        AND user_id = $2
    `,
    [
      conversationId,
      userId,
    ]
  );

  return result.rowCount === 1;
}