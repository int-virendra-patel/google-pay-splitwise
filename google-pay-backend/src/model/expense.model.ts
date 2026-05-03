import { pool } from "../config/db";

const toNumber = (value: string | number) => Number(value);
const mapUserAmountRows = (rows: any[]) =>
  rows.map((row) => ({
    user_id: row.user_id,
    name: row.name,
    amount: toNumber(row.amount),
  }));

const getDebtsForUsers = async (owingUserId: string, paidToUserId: string) => {
  const result = await pool.query(
    `SELECT es.id, es.amount_owed
     FROM expense_splits es
     INNER JOIN expenses e ON e.id = es.expense_id
     WHERE es.user_id = $1 AND e.paid_by = $2 AND es.amount_owed > 0
     ORDER BY e.created_at ASC`,
    [owingUserId, paidToUserId],
  );
  return result.rows;
};

const getTotalDebtBetweenUsers = async (
  owingUserId: string,
  paidToUserId: string,
) => {
  const debts = await getDebtsForUsers(owingUserId, paidToUserId);
  const total = debts.reduce((sum, row) => sum + toNumber(row.amount_owed), 0);
  return total;
};

const reduceDebt = async (
  owingUserId: string,
  paidToUserId: string,
  settleAmount: number,
) => {
  if (settleAmount <= 0) return;

  const debts = await getDebtsForUsers(owingUserId, paidToUserId);
  let remaining = settleAmount;

  for (const debt of debts) {
    if (remaining <= 0) break;

    const owed = toNumber(debt.amount_owed);
    const settled = Math.min(owed, remaining);

    await pool.query(`UPDATE expense_splits SET amount_owed = $1 WHERE id = $2`, [
      owed - settled,
      debt.id,
    ]);

    remaining -= settled;
  }
};

const autoSettleOppositeDebts = async (
  firstUserId: string,
  secondUserId: string,
) => {
  const firstUserOwesSecond = await getTotalDebtBetweenUsers(
    firstUserId,
    secondUserId,
  );
  const secondUserOwesFirst = await getTotalDebtBetweenUsers(
    secondUserId,
    firstUserId,
  );
  const settleAmount = Math.min(firstUserOwesSecond, secondUserOwesFirst);

  if (settleAmount <= 0) return;

  await reduceDebt(firstUserId, secondUserId, settleAmount);
  await reduceDebt(secondUserId, firstUserId, settleAmount);
};

const settlePaymentDebt = async (
  payingUserId: string,
  receivingUserId: string,
  amount: number,
) => {
  if (amount <= 0) return;
  await reduceDebt(payingUserId, receivingUserId, amount);
};

export const createExpense = async (
  paidByUserId: string,
  totalAmount: number,
  description: string,
  splitUserIds: string[],
) => {
  const expenseResult = await pool.query(
    `INSERT INTO expenses (paid_by, amount, description)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [paidByUserId, totalAmount, description],
  );
  const createdExpense = expenseResult.rows[0];

  if (splitUserIds.length > 0) {
    const splitAmountPerUser = totalAmount / splitUserIds.length;
    for (const splitUserId of splitUserIds) {
      await pool.query(
        `INSERT INTO expense_splits (expense_id, user_id, amount_owed)
         VALUES ($1, $2, $3)`,
        [createdExpense.id, splitUserId, splitAmountPerUser],
      );
      await autoSettleOppositeDebts(splitUserId, paidByUserId);
    }
  }

  const expenseWithUserNameResult = await pool.query(
    `SELECT e.*, u.name AS paid_by_name
     FROM expenses e
     INNER JOIN users u ON u.id = e.paid_by
     WHERE e.id = $1`,
    [createdExpense.id],
  );

  const splitRowsWithUserNamesResult = await pool.query(
    `SELECT 
       es.id,
       es.expense_id,
       es.user_id,
       u.name AS user_name,
       es.amount_owed
     FROM expense_splits es
     INNER JOIN users u ON u.id = es.user_id
     WHERE es.expense_id = $1`,
    [createdExpense.id],
  );

  return {
    expense: expenseWithUserNameResult.rows[0],
    splits: splitRowsWithUserNamesResult.rows,
  };
};

export const getAllExpense = async(userId : string) => {
  const getAllResult = await pool.query(
    `SELECT * FROM expenses WHERE paid_by = $1`,
    [userId],
  );
  return getAllResult.rows;
};

export const getUserExpenseSummary = async (userId: string) => {
  const [
    iOweUsersResult,
    owesMeUsersResult,
  ] = await Promise.all([
    pool.query(
      `SELECT 
         e.paid_by AS user_id,
         u.name,
         COALESCE(SUM(es.amount_owed), 0) AS amount
       FROM expense_splits es
       INNER JOIN expenses e ON e.id = es.expense_id
       INNER JOIN users u ON u.id = e.paid_by
       WHERE es.user_id = $1 AND e.paid_by != $1 AND es.amount_owed > 0
       GROUP BY e.paid_by, u.name`,
      [userId],
    ),
    pool.query(
      `SELECT 
         es.user_id,
         u.name,
         COALESCE(SUM(es.amount_owed), 0) AS amount
       FROM expense_splits es
       INNER JOIN expenses e ON e.id = es.expense_id
       INNER JOIN users u ON u.id = es.user_id
       WHERE e.paid_by = $1 AND es.user_id != $1 AND es.amount_owed > 0
       GROUP BY es.user_id, u.name`,
      [userId],
    ),
  ]);

  const iOweRows = mapUserAmountRows(iOweUsersResult.rows);
  const owesMeRows = mapUserAmountRows(owesMeUsersResult.rows);

  return {
    total_owe: iOweRows.reduce((sum, row) => sum + row.amount, 0),
    total_to_receive: owesMeRows.reduce((sum, row) => sum + row.amount, 0),
    i_owe: iOweRows,
    owes_me: owesMeRows,
  };
};

export { settlePaymentDebt };
