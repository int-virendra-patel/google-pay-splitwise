import { Response } from "express";
import {
  createExpense,
  getAllExpense,
  getUserExpenseSummary,
} from "../model/expense.model";
import { AuthRequest } from "../middleware/auth.middleware";

type SplitUserInput = string | { user_id?: string };

const getAuthenticatedUserId = (
  req: AuthRequest,
  res: Response,
): string | null => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return req.user.userId;
};

const getSplitUserIds = (
  users: unknown,
  paidByUserId: string,
): string[] => {
  if (!Array.isArray(users)) return [];
  return (users as SplitUserInput[])
    .map((user) => (typeof user === "string" ? user : user?.user_id ?? ""))
    .filter((userId) => userId && userId !== paidByUserId);
};

const handleServerError = (res: Response, error: any) => {
  console.error(error);
  return res.status(error.status ?? 500).json({
    message: error.message ?? "Internal Server Error",
  });
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const paidByUserId = getAuthenticatedUserId(req, res);
    if (!paidByUserId) return;

    const { amount, description, users } = req.body;
    const expenseAmount = Number(amount);

    if (!Number.isFinite(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const otherSplitUserIds = getSplitUserIds(users, paidByUserId);

    const allSplitUserIds = [paidByUserId, ...otherSplitUserIds];

    const createdExpense = await createExpense(
      paidByUserId,
      expenseAmount,
      description,
      allSplitUserIds,
    );

    return res.status(201).json({
      expense: createdExpense,
      message: "expense Created Successfully!",
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const summary = await getUserExpenseSummary(userId);

    return res.status(200).json({
      result: summary,
      message: "Expense summary fetched successfully",
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};


export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const result = await getAllExpense(userId);

    return res.status(200).json({
      result,
      message: "expense splits successfully",
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};
