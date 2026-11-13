import { AuthRequest } from "@/middleware/authMiddleware";
import { Listing } from "@/models/Listing";
import { SavedListing } from "@/models/SavedListing";
import { catchAsync } from "@/utils/catchAsync";
import { badRequest, created, forbidden, notFound, success } from "@/utils/response";
import { uploadToFirebase } from "@/utils/upload";
import { Response } from "express";
import { Op } from "sequelize";

export const getListings = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    category,
    state,
    search,
    page = "1",
    limit = "10",
  } = req.query as {
    category?: string;
    state?: string;
    search?: string;
    page?: string;
    limit?: string;
  };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  const whereClause: any = {};
  if (category) whereClause.category = category;
  if (state) whereClause.state = state;
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { want: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows: listings, count } = await Listing.findAndCountAll({
    where: whereClause,
    limit: limitNum,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return success(res, "Listings fetched successfully", {
    listings,
    pagination: {
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    },
  });
});

export const createListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, category, state, want, status } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return badRequest(res, "Please upload at least one image for the listing.");
  }

  if (files.length > 4) {
    return badRequest(res, "You can upload a maximum of 4 images.");
  }

  const uploadPromises = files.map((file) => uploadToFirebase(file, "listings"));
  const imageUrls = await Promise.all(uploadPromises);

  const newListing = await Listing.create({
    owner_id: req.user!.id,
    title,
    category,
    state,
    want,
    image_urls: imageUrls,
    status: status || "Ready to Swap",
  });

  return created(res, "Listing created successfully", { listing: newListing });
});

export const getListingById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const listing = await Listing.findByPk(id);
  if (!listing) {
    return notFound(res, "Listing not found");
  }

  return success(res, "Listing fetched successfully", { listing });
});

export const deleteListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };

  const listing = await Listing.findByPk(id);
  if (!listing) {
    return notFound(res, "Listing not found");
  }

  if (listing.owner_id !== req.user?.id) {
    return forbidden(res, "You do not have permission to delete this listing");
  }

  await listing.destroy();

  return success(res, "Listing deleted successfully");
});

export const saveListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  const listing = await Listing.findByPk(id);
  if (!listing) {
    return notFound(res, "Listing not found");
  }

  const existingSave = await SavedListing.findOne({
    where: { user_id: userId, listing_id: id },
  });

  if (existingSave) {
    return badRequest(res, "Listing is already saved");
  }

  await SavedListing.create({
    user_id: userId,
    listing_id: id,
  });

  return success(res, "Listing saved successfully");
});

export const unsaveListing = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user!.id;

  const listing = await Listing.findByPk(id);
  if (!listing) {
    return notFound(res, "Listing not found");
  }

  const deletedCount = await SavedListing.destroy({
    where: { user_id: userId, listing_id: id },
  });

  if (!deletedCount) {
    return notFound(res, "Saved listing not found");
  }

  return success(res, "Listing removed from saved items");
});
