import { Router } from "express";

import {
  upload,
  getDocuments,
  removeDocument,
  previewDocument,
} from "../controllers/document.controller";

import { requireAuth } from "../middleware/auth.middleware";
import { upload as uploadFile } from "../middleware/upload.middleware";

const router = Router();

// Get all documents belonging to the authenticated user
router.get(
  "/",
  requireAuth,
  getDocuments
);

// Upload a document
router.post(
  "/",
  requireAuth,
  uploadFile.single("file"),
  upload
);

// Delete a document
router.delete(
  "/:id",
  requireAuth,
  removeDocument
);

// Generate a temporary signed URL for preview
router.get(
  "/:id/preview",
  requireAuth,
  previewDocument
);

export default router;