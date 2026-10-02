import { Router } from "express";
import { search } from "../controllers/search.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  search
);

export default router;