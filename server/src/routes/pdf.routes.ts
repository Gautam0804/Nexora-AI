import { Router } from "express";
import { extractPdf } from "../controllers/pdf.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/extract",
  requireAuth,
  upload.single("file"),
  extractPdf
);

export default router;