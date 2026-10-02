import { Router } from "express";
import { getQueryStats } from "../controllers/query.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/stats",
  requireAuth,
  getQueryStats
);

export default router;