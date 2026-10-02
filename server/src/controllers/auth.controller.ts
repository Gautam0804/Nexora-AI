import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
} from "../services/auth.service";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Create user
    const user = await registerUser(email, password);

    return res.status(201).json(user);
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(400).json({
      message: "Unable to create account",
    });
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Login user
    const result = await loginUser(email, password);

    return res.status(200).json(result);
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
}