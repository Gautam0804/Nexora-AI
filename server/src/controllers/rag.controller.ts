import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { answerQuestion } from "../services/rag.service";

export async function askQuestion(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { question, documentId } = req.body;

    // Validate question
    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    // Validate documentId if provided
    if (
      documentId !== undefined &&
      documentId !== null &&
      typeof documentId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid documentId",
      });
    }

    console.log("RAG CONTROLLER QUESTION:", question);
    console.log(
      "RAG CONTROLLER DOCUMENT:",
      documentId ?? "ALL DOCUMENTS"
    );

    const result = await answerQuestion(
      req.userId,
      question.trim(),
      documentId
    );

    return res.status(200).json({
      question: question.trim(),
      documentId: documentId ?? null,
      ...result,
    });
  } catch (error) {
    console.error("RAG ERROR:", error);

    return res.status(500).json({
      message: "Failed to answer question",
    });
  }
}