import { Request, Response } from "express";

import {
  createNewConversation,
  listConversations,
  getConversationWithMessages,
  sendConversationMessage,
  renameConversation,
  removeConversation,
} from "../services/conversation.service";

/* -------------------------------------------------------------------------- */
/* Authenticated Request                                                      */
/* -------------------------------------------------------------------------- */

interface AuthenticatedRequest extends Request {
  userId?: string;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getUserId(
  req: AuthenticatedRequest
): string | null {
  return req.userId ?? null;
}

function getConversationId(
  req: AuthenticatedRequest
): string | null {
  const value = req.params.conversationId;

  return typeof value === "string"
    ? value
    : null;
}

/* -------------------------------------------------------------------------- */
/* Create Conversation                                                        */
/* POST /api/conversations                                                     */
/* -------------------------------------------------------------------------- */

export async function createConversation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      documentId,
      title,
    } = req.body ?? {};

    const conversation =
      await createNewConversation(
        userId,
        documentId,
        title
      );

    return res.status(201).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* List Conversations                                                         */
/* GET /api/conversations                                                      */
/* -------------------------------------------------------------------------- */

export async function getConversations(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const conversations =
      await listConversations(userId);

    return res.status(200).json({
      conversations,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to load conversations",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Get Conversation + Messages                                                */
/* GET /api/conversations/:conversationId                                      */
/* -------------------------------------------------------------------------- */

export async function getConversation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const conversationId =
      getConversationId(req);

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const result =
      await getConversationWithMessages(
        userId,
        conversationId
      );

    if (!result) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "GET CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to load conversation",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Send Message                                                               */
/* POST /api/conversations/:conversationId/messages                           */
/* -------------------------------------------------------------------------- */

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const conversationId =
      getConversationId(req);

    const {
      question,
    } = req.body ?? {};

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Send message                                                           */
    /* ---------------------------------------------------------------------- */

    const result =
      await sendConversationMessage(
        userId,
        conversationId,
        question.trim()
      );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "SEND CONVERSATION MESSAGE ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send conversation message";

    if (
      message
        .toLowerCase()
        .includes("conversation not found")
    ) {
      return res.status(404).json({
        message,
      });
    }

    return res.status(500).json({
      message,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Rename Conversation                                                        */
/* PATCH /api/conversations/:conversationId                                   */
/* -------------------------------------------------------------------------- */

export async function renameConversationController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const conversationId =
      getConversationId(req);

    const {
      title,
    } = req.body ?? {};

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        message: "Conversation title is required",
      });
    }

    const conversation =
      await renameConversation(
        userId,
        conversationId,
        title.trim()
      );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error(
      "RENAME CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to rename conversation",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Delete Conversation                                                        */
/* DELETE /api/conversations/:conversationId                                  */
/* -------------------------------------------------------------------------- */

export async function deleteConversation(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const conversationId =
      getConversationId(req);

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    const result =
      await removeConversation(
        userId,
        conversationId
      );

    if (!result.success) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete conversation",
    });
  }
}