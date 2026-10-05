import { Router } from "express";

import {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  renameConversationController,
  deleteConversation,
} from "../controllers/conversation.controller";

import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/*
 * All conversation endpoints require authentication.
 */
router.use(requireAuth);

/* -------------------------------------------------------------------------- */
/* Conversations                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Create conversation
 *
 * POST /api/conversations
 */
router.post("/", createConversation);

/**
 * Get all conversations for current user
 *
 * GET /api/conversations
 */
router.get("/", getConversations);

/**
 * Get one conversation with its messages
 *
 * GET /api/conversations/:conversationId
 */
router.get("/:conversationId", getConversation);

/**
 * Send message to conversation
 *
 * POST /api/conversations/:conversationId/messages
 */
router.post("/:conversationId/messages", sendMessage);

/**
 * Rename conversation
 *
 * PATCH /api/conversations/:conversationId
 */
router.patch("/:conversationId", renameConversationController);

/**
 * Delete conversation
 *
 * DELETE /api/conversations/:conversationId
 */
router.delete("/:conversationId", deleteConversation);

export default router;