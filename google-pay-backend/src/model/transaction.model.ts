import { pool } from "../config/db";
import { settlePaymentDebt } from "./expense.model";

export const createTransaction = async (
  fromUserId: string,
  toUserId: string,
  amount: number,
  type: string,
) => {
  const result = await pool.query(
    `INSERT INTO transactions (from_user, to_user, amount, type) VALUES ($1, $2, $3, $4) RETURNING *`,
    [fromUserId, toUserId, amount, type],
  );
  await settlePaymentDebt(fromUserId, toUserId, amount);
  return result.rows[0];
};

export const getTransactionWithUser = async (
  fromUserId: string,
  toUserId: string,
) => {
  const result = await pool.query(
    `SELECT 
    t.id,
    t.from_user,
    u1.name AS from_user_name,
    t.to_user,
    u2.name AS to_user_name,
    t.amount,
    t.type,
    t.created_at
    FROM transactions t
    LEFT JOIN users u1 ON t.from_user = u1.id
    LEFT JOIN users u2 ON t.to_user = u2.id
    WHERE 
    (t.from_user = $1 AND t.to_user = $2)
    OR
    (t.from_user = $2 AND t.to_user = $1)
    ORDER BY t.created_at DESC`,
    [fromUserId, toUserId],
  );
  return result.rows;
};

export const getMyTransactions = async (userId: string) => {
  const result = await pool.query(
    `SELECT 
      t.id,
      t.from_user,
      u1.name AS from_user_name,
      t.to_user,
      u2.name AS to_user_name,
      t.amount,
      t.type,
      t.created_at
      FROM transactions t
      JOIN users u1 ON t.from_user = u1.id
      JOIN users u2 ON t.to_user = u2.id
      WHERE t.from_user = $1 OR t.to_user = $1
      ORDER BY t.created_at DESC;`,
    [userId],
  );

  return result.rows;
};
