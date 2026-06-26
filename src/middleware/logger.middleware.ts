// Simple logging middleware (bonus item).
// Logs one line per request: method, URL, status code and how long it took.

import { NextFunction, Request, Response } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });

  next();
}
