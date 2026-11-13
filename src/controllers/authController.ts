import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "@/models/User";
import { AuthRequest } from "@/middleware/authMiddleware";
import { catchAsync } from "@/utils/catchAsync";
import { badRequest, created, notFound, success, unAuthorized } from "@/utils/response";
import { generateTokens, verifyRefreshToken } from "@/utils/jwt";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/utils/email";
import { setRefreshTokenCookie } from "@/utils/cookie";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return badRequest(res, "Email is already in use");
  }

  const existingUsername = await User.findOne({ where: { username: username.toLowerCase() } });
  if (existingUsername) {
    return badRequest(res, "Username is already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password_hash: hashedPassword,
  });

  const { accessToken, refreshToken } = await generateTokens({
    id: newUser.id,
    email: newUser.email,
    username: newUser.username,
  });

  sendWelcomeEmail(newUser.email, newUser.name);

  setRefreshTokenCookie(res, refreshToken);

  return created(res, "Account created successfully", {
    token: accessToken,
    user: {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return badRequest(res, "Incorrect email or password");
  }

  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  setRefreshTokenCookie(res, refreshToken);

  return success(res, "Logged in successfully", {
    token: accessToken,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    return unAuthorized(res, "Refresh token cookie missing");
  }

  const incomingRefreshToken = cookies.refreshToken;

  const payload = await verifyRefreshToken(incomingRefreshToken);

  const user = await User.findByPk(payload.id);
  if (!user) {
    return notFound(res, "User no longer exists");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  setRefreshTokenCookie(res, newRefreshToken);

  return success(res, "Token refreshed successfully", {
    token: newAccessToken,
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    return notFound(res, "No user found with that email address");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.reset_token_hash = resetTokenHash;
  user.reset_token_expires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  return success(res, "Password reset token generated", { resetToken });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: {
      reset_token_hash: resetTokenHash,
    },
  });

  if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
    return badRequest(res, "Token is invalid or has expired");
  }

  user.password_hash = await bcrypt.hash(newPassword, 12);
  user.reset_token_hash = null;
  user.reset_token_expires = null;
  await user.save();

  const { accessToken, refreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  sendPasswordResetEmail(user.email, user.name);

  setRefreshTokenCookie(res, refreshToken);

  return success(res, "Password successfully reset", { token: accessToken });
});

export const updatePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user?.id);
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return badRequest(res, "Your current password is incorrect");
  }

  user.password_hash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return success(res, "Password updated successfully");
});

export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return unAuthorized(res, "Refresh token missing");
  }

  const decoded = await verifyRefreshToken(token);

  const user = await User.findByPk(decoded.id);
  if (!user) {
    return notFound(res, "User no longer exists");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens({
    id: user.id,
    email: user.email,
    username: user.username,
  });

  setRefreshTokenCookie(res, newRefreshToken);

  return success(res, "Token refreshed successfully", { token: accessToken });
});

export const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  });

  return success(res, "Logged out successfully");
});
