import rateLimit from "express-rate-limit";

// Helper check for production environment
const isProduction = process.env.NODE_ENV === "production";

// General API Rate Limiter (Active ONLY in production)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction,
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// Strict Auth Rate Limiter (Active ONLY in production)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !isProduction, //  Bypasses rate limiting in dev/test
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
});
