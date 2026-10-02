import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { db } from "../config/db";

export async function getAiQueryStats(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await db.query(
      `
      SELECT COUNT(*)::int AS count
      FROM ai_queries
      WHERE user_id = $1
      `,
      [req.userId]
    );

    const count =
      Number(result.rows[0]?.count) || 0;

    return res.status(200).json({
      count,
      totalQueries: count,
      total_queries: count,
    });
  } catch (error) {
    console.error(
      "AI QUERY STATS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch AI query statistics",
    });
  }
}