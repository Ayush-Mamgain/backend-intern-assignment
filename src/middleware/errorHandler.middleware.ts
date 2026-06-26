// Centralized error handler. Every route forwards errors here with next(err)
// instead of each route formatting its own error response.

import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  // Errors we threw on purpose (validation, not found, etc.)
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma throws errors with a "code" field for known database problems.
  // P2002 = unique constraint failed, P2025 = record not found, etc.
  if (err && typeof err.code === "string" && err.code.startsWith("P")) {
    console.error("Database error:", err.code, err.message);
    return res.status(500).json({ error: "A database error occurred" });
  }

  // Anything else is unexpected - log the full error for debugging but
  // never leak internal details to the client.
  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Something went wrong" });
}

// Catches requests to routes that don't exist.
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
}
