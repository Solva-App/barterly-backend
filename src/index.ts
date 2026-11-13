import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { globalErrorHandler } from "@/middleware/errorHandler";
import { apiLimiter } from "@/middleware/rateLimiter";

import authRouter from "@/routes/authRoutes";
import chatRoutes from "@/routes/chatRoutes";
import listingRoutes from "@/routes/listingRoutes";
import userRoutes from "@/routes/userRoutes";
import metadataRoutes from "@/routes/metadataRoutes";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "success", message: "API is running smoothly" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/", apiLimiter);
app.use("/api/v1/users", apiLimiter, userRoutes);
app.use("/api/v1/listings", apiLimiter, listingRoutes);
app.use("/api/v1/chats", apiLimiter, chatRoutes);
app.use("/api/v1", metadataRoutes);

// 404 Route Handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ status: "error", message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
