import { db } from "../config/db";

export async function saveAiQuery(
  userId: string,
  question: string
) {
  await db.query(
    `
      INSERT INTO ai_queries
        (user_id, question)
      VALUES
        ($1, $2)
    `,
    [
      userId,
      question,
    ]
  );
}

export async function getAiQueryCount(
  userId: string
) {
  const result = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM ai_queries
      WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0].count;
}