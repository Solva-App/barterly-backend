import { Router } from "express";
import {
  getMe,
  updateMe,
  getMyListings,
  getMySavedListings,
  getVerificationStatus,
  submitVerification,
} from "@/controllers/userController";
import { protect } from "@/middleware/authMiddleware";
import { validate } from "@/middleware/validate";
import { uploadSingleImage } from "@/middleware/uploadMiddleware";
import { updateMeSchema, verificationSchema } from "@/validators/userValidator";

const router = Router();

// All user/me routes require authentication
router.use(protect);

router.get("/me", getMe);
router.patch("/me", validate(updateMeSchema), updateMe);
router.get("/me/listings", getMyListings);
router.get("/me/saved", getMySavedListings);
router.get("/me/verification", getVerificationStatus);
router.post(
  "/me/verification",
  uploadSingleImage,
  validate(verificationSchema),
  submitVerification
);

export default router;
