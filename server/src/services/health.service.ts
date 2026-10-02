import { db } from "../config/db";

export async function checkDatabase() {
  const result = await db.query("SELECT NOW()");
  return result.rows[0];
}