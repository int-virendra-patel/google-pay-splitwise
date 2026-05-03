import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createTransaction,
  getMyTransactions,
  getTransactionWithUser,
} from "../model/transaction.model";

export const createTransactionController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const from_user = req.user.userId;
    const { to_user, amount, type } = req.body;
    const data = await createTransaction(from_user, to_user, amount, type);
    return res.status(201).json({
      data,
      message: "Transaction Created Successfully!",
    });
  } catch (error: any) {
    console.error(error);
    return res.status(error.status ?? 500).json({
      message: error.message ?? "Internal Server Error",
    });
  }
};

export const getTransactionWithUserController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const from_user = req.user.userId;
    const to_user = req.params.id as string;
    const data = await getTransactionWithUser(from_user, to_user);

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No transactions found between users",
        data: [],
      });
    }

    return res.status(201).json({
      data,
      message: `Transaction fetched Successfully!`,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(error.status ?? 500).json({
      message: error.message ?? "Internal Server Error",
    });
  }
};

export const getMyTransactionsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.userId;
    const data = await getMyTransactions(userId);

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No transactions Found!",
        data: [],
      });
    }

    return res.status(201).json({
      data,
      message: `Transaction fetched Successfully!`,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(error.status ?? 500).json({
      message: error.message ?? "Internal Server Error",
    });
  }
};
