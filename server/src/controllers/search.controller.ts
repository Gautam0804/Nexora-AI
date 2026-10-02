import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { searchDocuments } from "../services/search.service";

export async function search(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { query, limit } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const parsedLimit = limit ? Number(limit) : 5;

    if (
      !Number.isInteger(parsedLimit) ||
      parsedLimit < 1 ||
      parsedLimit > 20
    ) {
      return res.status(400).json({
        message: "Limit must be an integer between 1 and 20",
      });
    }

    const results = await searchDocuments(
      req.userId,
      query,
      parsedLimit
    );

    return res.status(200).json({
      query,
      results,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);

    return res.status(500).json({
      message: "Search failed",
    });
  }
}