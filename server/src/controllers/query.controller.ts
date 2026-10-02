import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { getAiQueryCount } from "../services/query.repository";

export async function getQueryStats(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const count = await getAiQueryCount(req.userId);

    return res.status(200).json({
      count,
    });
  } catch (error) {
    console.error("GET AI QUERY STATS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch AI query statistics",
    });
  }
}