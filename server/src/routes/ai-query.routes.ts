import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getAiQueryStats } from "../controllers/ai-query.controller";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  getAiQueryStats
);

export default router;