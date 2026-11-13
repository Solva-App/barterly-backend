import {
  forgotPassword,
  login,
  refreshToken,
  resetPassword,
  signup,
  updatePassword,
} from "@/controllers/authController";
import { protect } from "@/middleware/authMiddleware";
import { validate } from "@/middleware/validate";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  updatePasswordSchema,
} from "@/validators/authValidator";
import { Router } from "express";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.post("/forgot", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset", validate(resetPasswordSchema), resetPassword);
router.post("/password", protect, validate(updatePasswordSchema), updatePassword);

export default router;
