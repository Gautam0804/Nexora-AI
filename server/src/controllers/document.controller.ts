import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { uploadDocument } from "../services/document.service";

import {
  getUserDocuments,
  deleteDocument,
  getDocumentPreview,
} from "../services/document.repository";

export async function upload(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.file || !req.userId) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const document = await uploadDocument(
      req.userId,
      req.file
    );

    return res.status(201).json(document);
  } catch (error) {
    console.error(
      "Document upload error:",
      error
    );

    return res.status(500).json({
      message: "Document upload failed",
    });
  }
}

export async function getDocuments(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const documents = await getUserDocuments(
      req.userId
    );

    return res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error(
      "GET DOCUMENTS ERROR:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch documents",
    });
  }
}

export async function removeDocument(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    const document = await deleteDocument(
      req.userId,
      id
    );

    return res.status(200).json({
      message: "Document deleted successfully",
      document,
    });
  } catch (error) {
    console.error(
      "DELETE DOCUMENT ERROR:",
      error
    );

    return res.status(404).json({
      message: "Document not found",
    });
  }
}

export async function previewDocument(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return res.status(400).json({
        message: "Document ID is required",
      });
    }

    const document = await getDocumentPreview(
      req.userId,
      id
    );

    return res.status(200).json({
      document,
    });
  } catch (error) {
    console.error(
      "DOCUMENT PREVIEW ERROR:",
      error
    );

    return res.status(404).json({
      message: "Document not found",
    });
  }
}