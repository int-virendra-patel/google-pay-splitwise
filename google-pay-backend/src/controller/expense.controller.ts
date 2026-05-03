import { Request, Response } from "express";
import { createExpense, getAllExpense } from "../model/expense.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const paid_by = req.user.userId;
    const { amount, description } = req.body;

    const expense = await createExpense(paid_by, amount, description);

    return res.status(201).json({
      expense,
      message: "expense Created Successfully!",
    });
  } catch (error: any) {
        console.log(error);
        return res.status(error.status ?? 500).json({
        message: error.message ?? "Internal Server Error",
        });
  }
};


export const getAll = async (req: AuthRequest, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.userId;

    const result = await getAllExpense(userId);

    return res.status(201).json({
      result,
      message: "expense splits successfully",
    });
  } catch (error : any) {
    console.log(error)
    return res.status(error.status ?? 500).json({
        message: error.message ?? "Internal Server Error",
        });
  }
};
