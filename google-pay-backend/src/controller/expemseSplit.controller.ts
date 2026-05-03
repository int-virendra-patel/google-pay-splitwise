import { Request, Response } from "express";
import { splitExpense } from "../model/expenseSplit.model";
import { AuthRequest } from "../middleware/auth.middleware";


export const split = async (req: AuthRequest, res: Response) => {
    try{
        const {expense_id, users} = req.body;

        if (!expense_id || !users || users.length === 0) {
            return res.status(400).json({ message: "Invalid data" });
        }

        const userIds = users.map((user:any) => user.user_id)

        const result = await splitExpense(expense_id, userIds)

        return res.status(201).json({
            result,
            message: "expense splits successfully",
        });

    }catch(error:any){
        console.log(error)
        res.status(error.status?? 500 ).json({
        message: error.message ?? "Internal Server Error",
        });
    }
}