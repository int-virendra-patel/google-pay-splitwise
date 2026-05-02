import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { login, logout } from "../controller/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/logout", auth, logout);

export default router;
