import { Request, Response, NextFunction } from "express";
import { serverError } from "@/utils/response";
import logger from "@/utils/logger";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled Error Stack:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path || "Field";
    return serverError(res, `${field} is already in use.`);
  }

  if (err.name === "SequelizeValidationError") {
    const message = err.errors?.map((e: any) => e.message).join(", ") || "Validation error";
    return serverError(res, message);
  }

  const message =
    process.env.NODE_ENV === "development" ? err.message : "An internal server error occurred";
  return serverError(res, message);
};
