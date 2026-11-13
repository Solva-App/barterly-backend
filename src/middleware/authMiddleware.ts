import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "@/utils/jwt";
import { unAuthorized } from "@/utils/response";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return unAuthorized(res, "Authentication token missing");
  }

  try {
    const decoded = await verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    return unAuthorized(res, "Invalid or expired token");
  }
};
