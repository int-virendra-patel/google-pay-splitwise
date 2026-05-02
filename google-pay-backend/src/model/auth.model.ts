import { pool } from "../config/db";

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT id, name, email, password, phone_number FROM users WHERE email=$1`,
    [email],
  );
  return result.rows[0];
};
