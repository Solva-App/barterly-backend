import { Router } from "express";
import { getCategories, getStates } from "@/controllers/metadataController";

const router = Router();

router.get("/categories", getCategories);
router.get("/states", getStates);

export default router;
