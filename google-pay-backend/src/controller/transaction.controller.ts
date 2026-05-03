import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTransaction,
  getMyTransactions,
  getTransactionWithUser,
} from "../model/transaction.model";

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

const handleServerError = (res: Response, error: any) => {
  console.error(error);
  return res.status(error.status ?? 500).json({
    message: error.message ?? "Internal Server Error",
  });
};

const isValidUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

export const createTransactionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const fromUserId = getAuthenticatedUserId(req, res);
    if (!fromUserId) return;

    const { to_user: toUserId, amount, type } = req.body;
    const transactionAmount = Number(amount);

    if (!isValidUuid(toUserId)) {
      return res.status(400).json({ message: "Invalid to_user id" });
    }
    if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const data = await createTransaction(
      fromUserId,
      toUserId,
      transactionAmount,
      type,
    );
    return res.status(201).json({
      data,
      message: "Transaction Created Successfully!",
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};

export const getTransactionWithUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const fromUserId = getAuthenticatedUserId(req, res);
    if (!fromUserId) return;

    const toUserId = req.params.id as string;

    if (!isValidUuid(toUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const data = await getTransactionWithUser(fromUserId, toUserId);

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No transactions found between users",
        data: [],
      });
    }

    return res.status(200).json({
      data,
      message: `Transaction fetched Successfully!`,
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};

export const getMyTransactionsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = getAuthenticatedUserId(req, res);
    if (!userId) return;

    const data = await getMyTransactions(userId);

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No transactions Found!",
        data: [],
      });
    }

    return res.status(200).json({
      data,
      message: `Transaction fetched Successfully!`,
    });
  } catch (error: any) {
    return handleServerError(res, error);
  }
};
