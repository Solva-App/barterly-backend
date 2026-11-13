import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  saveListing,
  unsaveListing,
} from "@/controllers/listingController";
import { protect } from "@/middleware/authMiddleware";
import { uploadMultipleImages } from "@/middleware/uploadMiddleware";
import { validate } from "@/middleware/validate";
import { createListingSchema, getListingsQuerySchema } from "@/validators/listingValidator";
import { Router } from "express";

const router = Router();

router.get("/", validate(getListingsQuerySchema), getListings);
router.post("/", protect, uploadMultipleImages(4), validate(createListingSchema), createListing);
router.get("/:id", getListingById);
router.delete("/:id", protect, deleteListing);
router.put("/:id/save", protect, saveListing);
router.delete("/:id/save", protect, unsaveListing);

export default router;
