import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { create, getAll, getSummary } from "../controller/expense.controller";

const router = Router();

router.post("/", auth, create)
router.get("/all", auth, getAll)
router.get("/summary", auth, getSummary)

export default router
