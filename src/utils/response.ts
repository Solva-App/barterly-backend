import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export const send = <T>(
  res: Response,
  status: number,
  message: string,
  data: T | null = null,
  success: boolean = false
) => {
  const response: { success: boolean; status: number; message: string; data?: T } = {
    success,
    status,
    message,
  };

  if (
    data !== null &&
    data !== undefined &&
    (typeof data === "object" ? Object.keys(data).length > 0 || Array.isArray(data) : true)
  ) {
    response.data = data;
  }

  return res.status(status).json(response);
};

export const success = <T>(
  res: Response,
  message: string = "Operation successful",
  data: T = {} as T,
  code: number = StatusCodes.OK
) => {
  return send(res, code, message, data, true);
};

export const created = <T>(
  res: Response,
  message: string = "Resource created successfully",
  data: T = {} as T
) => {
  return send(res, StatusCodes.CREATED, message, data, true);
};

export const accepted = <T>(
  res: Response,
  message: string = "Request accepted and processing",
  data: T = {} as T
) => {
  return send(res, StatusCodes.ACCEPTED, message, data, true);
};

export const noContent = (res: Response) => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

export const badRequest = (res: Response, message: string = "Invalid request data") => {
  return send(res, StatusCodes.BAD_REQUEST, message, null, false);
};

export const unAuthorized = (res: Response, message: string = "Authentication required") => {
  return send(res, StatusCodes.UNAUTHORIZED, message, null, false);
};

export const forbidden = (res: Response, message: string = "Permission denied") => {
  return send(res, StatusCodes.FORBIDDEN, message, null, false);
};

export const notFound = (res: Response, message: string = "Resource not found") => {
  return send(res, StatusCodes.NOT_FOUND, message, null, false);
};

export const conflict = (res: Response, message: string = "Resource already exists") => {
  return send(res, StatusCodes.CONFLICT, message, null, false);
};

export const validationError = (res: Response, message: string = "Validation failed") => {
  return send(res, StatusCodes.UNPROCESSABLE_ENTITY, message, null, false);
};

export const serverError = (
  res: Response,
  message: string = "An internal server error occurred",
  code: number = StatusCodes.INTERNAL_SERVER_ERROR
) => {
  return send(res, code, message, null, false);
};
