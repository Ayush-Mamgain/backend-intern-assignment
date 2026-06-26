// Plain handwritten validation functions.

import { ALLOWED_STATUSES, CreateQuoteInput, QuoteStatus, UpdateStatusInput } from "../types";
import { ApiError } from "./ApiError";

export function validateCreateQuote(body: any): CreateQuoteInput {
  const errors: string[] = [];

  if (!body.customer || typeof body.customer !== "string" || !body.customer.trim()) {
    errors.push("customer is required");
  }

  if (!body.project || typeof body.project !== "string" || !body.project.trim()) {
    errors.push("project is required");
  }

  const estimatedValue = body.estimatedValue;
  if (estimatedValue === undefined || estimatedValue === null || typeof estimatedValue !== "number" || Number.isNaN(estimatedValue)) {
    errors.push("estimatedValue is required and must be a number");
  } else if (estimatedValue < 0) {
    errors.push("estimatedValue cannot be negative");
  }

  let status: QuoteStatus | undefined;
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
    } else {
      status = body.status;
    }
  }

  if (errors.length > 0) {
    throw new ApiError(400, errors.join("; "));
  }

  return {
    customer: body.customer.trim(),
    project: body.project.trim(),
    estimatedValue,
    status,
  };
}

export function validateUpdateStatus(body: any): UpdateStatusInput {
  if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
    throw new ApiError(400, `status must be one of: ${ALLOWED_STATUSES.join(", ")}`);
  }
  return { status: body.status };
}

export function validateQuoteId(idParam: string): number {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, "id must be a positive integer");
  }
  return id;
}
