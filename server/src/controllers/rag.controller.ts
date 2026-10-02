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

    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const result = await answerQuestion(
      req.userId,
      question
    );

    return res.status(200).json({
      question,
      ...result,
    });
  } catch (error) {
    console.error("RAG ERROR:", error);

    return res.status(500).json({
      message: "Failed to answer question",
    });
  }
}