import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType<any>) => async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body ?? {},
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.filter((p) => p !== "body").join(".") || "request",
        message: issue.message,
      }));

      return res.status(422).json({
        success: false,
        status: 422,
        message: errors.map((e) => `${e.field}: ${e.message}`).join(", "),
        data: { errors },
      });
    }

    req.body = result.data.body;
    return next();
  };
