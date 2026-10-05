import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    const payload = jwt.verify(
      token,
      secret
    ) as {
      userId: string;
    };

    if (!payload.userId) {
      return res.status(401).json({
        message: "Invalid authentication token",
      });
    }

    req.userId = payload.userId;

    next();
  } catch (error) {
    console.error("JWT VERIFY ERROR:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}