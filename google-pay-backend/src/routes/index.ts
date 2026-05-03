import { Router } from "express";
import authRoutes from "../routes/auth.routes";
import expenseRoute from "./expense.route"
import transactionRoutes from "../routes/transaction.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/expense", expenseRoute)
router.use("/transaction", transactionRoutes);

export default router;
