import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { split } from "../controller/expemseSplit.controller";

const router = Router();

router.post("/", auth, split)

export default router