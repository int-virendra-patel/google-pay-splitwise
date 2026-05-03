import { Router } from "express";
import { auth } from "../middleware/auth.middleware";

import {
  createTransactionController,
  getMyTransactionsController,
  getTransactionWithUserController,
} from "../controller/transaction.controller";

const router = Router();
router.post("/create", auth, createTransactionController);
router.get("/:id", auth, getTransactionWithUserController);
router.get("/my", auth, getMyTransactionsController);

export default router;
