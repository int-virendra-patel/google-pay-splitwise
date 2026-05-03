
import { pool } from "../config/db";

export const createExpense = async(
    paid_by:string,
    amount:number,
    description:string,
) => {
    const result = await pool.query(`
        INSERT INTO expenses (paid_by, amount, description)
        VALUES ($1, $2, $3)
        RETURNING *
    `,[paid_by, amount, description])

    return result.rows[0];
}

export const getAllExpense = async(userId : string) => {
    const getAllResult = await pool.query(
        `SELECT * FROM expenses WHERE paid_by = $1`,
        [userId]
    )
    return  getAllResult.rows
}