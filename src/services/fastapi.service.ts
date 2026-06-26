// Talks to the external (or mocked) FastAPI analysis service over HTTP.
// Keeping this in its own file means the rest of the app doesn't need to
// know or care that the call happens over HTTP with axios.

import axios from "axios";
import { ApiError } from "../utils/ApiError";
import { FastApiAnalysisResponse } from "../types";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";
const TIMEOUT_MS = Number(process.env.FASTAPI_TIMEOUT_MS) || 5000;

export async function callAnalyzeService(quoteId: string): Promise<FastApiAnalysisResponse> {
  try {
    const response = await axios.post<FastApiAnalysisResponse>(
      `${FASTAPI_URL}/analyze`,
      { quote_id: quoteId },
      { timeout: TIMEOUT_MS }
    );

    const data = response.data;

    // The FastAPI service is someone else's system - never trust its shape
    // blindly. If it ever sends back something malformed, fail clearly
    // instead of saving garbage into our database.
    if (
      typeof data.risk !== "string" ||
      typeof data.confidence !== "number" ||
      !Array.isArray(data.missing_items)
    ) {
      throw new ApiError(502, "FastAPI service returned an unexpected response shape");
    }

    return data;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;

    // No response came back at all -> service is down, or too slow (timeout).
    if (err.code === "ECONNABORTED") {
      throw new ApiError(504, "FastAPI service timed out");
    }
    if (err.code === "ECONNREFUSED" || !err.response) {
      throw new ApiError(503, "FastAPI service is unavailable");
    }

    // FastAPI responded, but with an error status.
    throw new ApiError(502, "FastAPI service returned an error");
  }
}
