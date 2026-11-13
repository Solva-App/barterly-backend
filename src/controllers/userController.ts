import { Response } from "express";
import { Op } from "sequelize";
import { User } from "@/models/User";
import { Listing } from "@/models/Listing";
import { SavedListing } from "@/models/SavedListing";
import { catchAsync } from "@/utils/catchAsync";
import { AuthRequest } from "@/middleware/authMiddleware";
import { success, badRequest, notFound } from "@/utils/response";
import { uploadToFirebase } from "@/utils/upload";

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user?.id, {
    attributes: { exclude: ["password_hash", "reset_token_hash", "reset_token_expires"] },
  });

  if (!user) {
    return notFound(res, "User profile not found");
  }

  return success(res, "User profile fetched successfully", { user });
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, username, bio, phone, photo_url } = req.body;

  const user = await User.findByPk(req.user?.id);
  if (!user) {
    return notFound(res, "User not found");
  }

  if (username && username !== user.username) {
    const existingUsername = await User.findOne({ where: { username: username.toLowerCase() } });
    if (existingUsername) {
      return badRequest(res, "Username is already taken");
    }
    user.username = username.toLowerCase();
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (phone !== undefined) user.phone = phone;
  if (photo_url !== undefined) user.photo_url = photo_url;

  await user.save();

  return success(res, "Profile updated successfully", {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      phone: user.phone,
      photo_url: user.photo_url,
    },
  });
});

export const getMyListings = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { status } = req.query;

  const whereCondition: any = { owner_id: userId };
  if (status && typeof status === "string") {
    whereCondition.status = status;
  }

  const listings = await Listing.findAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
  });

  return success(res, "User listings fetched successfully", { listings });
});

export const getMySavedListings = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  const savedEntries = await SavedListing.findAll({
    where: { user_id: userId },
    order: [["createdAt", "DESC"]],
  });

  const listingIds = savedEntries.map((item) => item.listing_id);

  const listings = await Listing.findAll({
    where: {
      id: { [Op.in]: listingIds },
    },
  });

  return success(res, "Saved listings fetched successfully", { listings });
});

export const getVerificationStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user?.id);
  if (!user) return notFound(res, "User not found");

  return success(res, "Verification status fetched", {
    is_verified: user.verification_status === "VERIFIED",
    verification_status: user.verification_status,
  });
});

export const submitVerification = catchAsync(async (req: AuthRequest, res: Response) => {
  const { document_type, document_number } = req.body;
  const file = req.file;

  if (!file) {
    return badRequest(res, "Please upload your identification document image.");
  }

  const user = await User.findByPk(req.user?.id);
  if (!user) {
    return notFound(res, "User not found");
  }

  const documentUrl = await uploadToFirebase(file, "verifications");

  user.verification_status = "pending";
  user.id_type = document_type;
  user.id_number = document_number;
  user.id_image_path = documentUrl;

  await user.save();

  return success(res, "Verification documents submitted successfully. Pending review.");
});
