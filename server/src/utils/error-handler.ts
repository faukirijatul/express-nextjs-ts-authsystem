import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  CONFLICT = "CONFLICT_ERROR",
  SERVER = "SERVER_ERROR",
}

// Base error class
export class AppError extends Error {
  statusCode: number;
  type: ErrorType;

  constructor(message: string, statusCode: number, type: ErrorType) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  details?: any;

  constructor(message: string, details?: any) {
    super(message, 400, ErrorType.VALIDATION);
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, ErrorType.AUTHENTICATION);
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = "You are not authorized to perform this action"
  ) {
    super(message, 403, ErrorType.AUTHORIZATION);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, ErrorType.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409, ErrorType.CONFLICT);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error("Error:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      type: ErrorType.VALIDATION,
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Handle our custom errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      type: err.type,
      ...(err instanceof ValidationError && err.details
        ? { errors: err.details }
        : {}),
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      type: ErrorType.AUTHENTICATION,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      type: ErrorType.AUTHENTICATION,
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message || "Server error",
    type: ErrorType.SERVER,
  });
};

// Async handler to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
