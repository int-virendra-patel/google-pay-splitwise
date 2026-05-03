import { Router } from "express";
import authRoutes from "../routes/auth.routes";
import expenseRoute from "./expense.route"
import expenseSplit from "./expenseSplit.route"
const router = Router();

router.use("/auth", authRoutes);
router.use("/expense", expenseRoute)
router.use("/split", expenseSplit)

export default router;
