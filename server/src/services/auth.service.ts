import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/db";

export async function registerUser(
  email: string,
  password: string
) {
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email`,
    [email, passwordHash]
  );

  return result.rows[0];
}

export async function loginUser(
  email: string,
  password: string
) {
  const result = await db.query(
    `SELECT id, email, password_hash
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  };
}