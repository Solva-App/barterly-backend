import { CATEGORIES, STATES } from "@/constants/appConstants";
import { catchAsync } from "@/utils/catchAsync";
import { success } from "@/utils/response";
import { Request, Response } from "express";

export const getCategories = catchAsync(async (req: Request, res: Response) => {
  return success(res, "Categories retrieved successfully", {
    categories: CATEGORIES,
  });
});

export const getStates = catchAsync(async (req: Request, res: Response) => {
  return success(res, "States retrieved successfully", {
    states: STATES,
  });
});
