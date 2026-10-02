import { Router } from "express";
import { askQuestion } from "../controllers/rag.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/ask",
  requireAuth,
  askQuestion
);

export default router;