import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { create, getAll } from "../controller/expense.controller";

const router = Router();

router.post("/", auth, create)
router.get("/expenses", auth, getAll)

export default router
