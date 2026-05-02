import app from "./app";
import { retryConn } from "./config/db";

const startServer = async () => {
  await retryConn();
  app.listen(3000, () => {
    console.log("Server Started on port 3000");
  });
};

startServer();
