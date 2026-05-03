import { pool } from "../config/db";

export const splitExpense = async (
  expense_id: string,
  users: string[]
) => {
    const expenseResult = await pool.query(
      `SELECT amount FROM expenses WHERE id = $1`,
      [expense_id]
    );

    if (expenseResult.rows.length === 0) {
      throw new Error("expense not found");
    }

    const totalAmount = expenseResult.rows[0].amount

    const splitAmount = totalAmount / users.length;

    for(const userId of users){
        const result = await pool.query(
            `INSERT INTO expense_splits (expense_id, user_id, amount_owed)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [expense_id, userId, splitAmount],
        );
        return result.rows
            // return { message: "Split created successfully" };
    }
    return 
}
