import { Router } from "express";
import {
  AuthRequest,
  requireAuth,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/me",
  requireAuth,
  (req: AuthRequest, res) => {
    res.json({
      userId: req.userId,
    });
  }
);

export default router;