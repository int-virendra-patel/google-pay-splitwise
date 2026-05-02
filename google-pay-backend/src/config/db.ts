import { Pool, QueryResult } from "pg";

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASS || process.env.DB_PASSWORD || ""),
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

const MAX_RETRIES: number = 5;
const RETRY_DELAY: number = 2000;

export async function retryConn(retries: number = MAX_RETRIES): Promise<void> {
  try {
    const result: QueryResult = await pool.query("SELECT NOW()");
    console.log(`Connected to PostgreSQL at ${result.rows[0].now}`);
  } catch (err) {
    console.error("DB connection failed. Retrying...");

    if (retries <= 1) {
      console.error("Could not connect to DB. Shutting down server.");
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return retryConn(retries - 1);
  }
}
