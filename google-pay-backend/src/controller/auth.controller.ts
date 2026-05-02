import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "../model/auth.model";
import { AuthRequest } from "../middleware/auth.middleware";

// +++++++++++++++++++++++ login +++++++++++++++++++++++

export const login = async (
  req: Request<{}, any, { email: string; password: string }>,
  res: Response,
) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // const match = await bcrypt.compare(password, user.password);

    // if (!match) {
    //   return res.status(400).json({
    //     message: "Invalid credentials",
    //   });
    // }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing");
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: `Log In Successful as ${user.name} (${user.email})`,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// +++++++++++++++++++++++ logout +++++++++++++++++++++++

export const logout = (req: AuthRequest, res: Response) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      message: `Logout Successful as ${req.user?.name ?? "User"}`,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
