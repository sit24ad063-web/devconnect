import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import { initSocket } from "./config/socket";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import skillRoutes from "./routes/skills";
import projectRoutes from "./routes/projects";
import postRoutes from "./routes/posts";
import connectionRoutes from "./routes/connections";
import dashboardRoutes from "./routes/dashboard";
import notificationRoutes from "./routes/notifications";
import uploadRoutes from "./routes/uploads";

import { notFound, errorHandler } from "./middleware/errorHandler";
import { sendSuccess } from "./utils/apiResponse";

export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(cookieParser());
app.use(express.json());
if (env.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  sendSuccess(res, { timestamp: new Date().toISOString() }, "DevConnect API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

// Only boot the HTTP+socket server outside of tests (tests import `app` directly).
if (env.nodeEnv !== "test") {
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`DevConnect API + Socket.io running on http://localhost:${env.port}`);
  });
}
