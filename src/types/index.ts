// Shared types used across the project.

// The only statuses a QuoteRequest is allowed to have.
export const ALLOWED_STATUSES = ["New", "In Review", "Needs Info", "Completed"] as const;
export type QuoteStatus = (typeof ALLOWED_STATUSES)[number];

// Shape of the body for POST /quotes
export interface CreateQuoteInput {
  customer: string;
  project: string;
  estimatedValue: number;
  status?: QuoteStatus;
}

// Shape of the body for PATCH /quotes/:id/status
export interface UpdateStatusInput {
  status: QuoteStatus;
}

// Shape of the response returned by the FastAPI /analyze endpoint
export interface FastApiAnalysisResponse {
  risk: string;
  missing_items: string[];
  confidence: number;
}
