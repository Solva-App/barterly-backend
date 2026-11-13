import { Response } from "express";

export const setRefreshTokenCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", token, {
    httpOnly: true, // Prevents JavaScript (XSS) access
    secure: isProduction, // true in production (HTTPS), false locally (HTTP)
    sameSite: isProduction ? "strict" : "lax", // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};
