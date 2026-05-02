import express, {Application, Request, Response} from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

app.use("/api", routes);
  
export default app;
