import { Request, Response } from "express";
import { checkDatabase } from "../services/health.service";

export async function healthCheck(_req: Request, res: Response) {
  try {
    const result = await checkDatabase();

    res.json({
      status: "ok",
      database: "connected",
      time: result.now,
    });
  } catch {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
}