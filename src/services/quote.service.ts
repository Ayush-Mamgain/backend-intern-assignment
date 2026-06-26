// Service layer: business logic lives here. Controllers stay "thin" (just
// HTTP in/out) and repositories stay "dumb" (just database in/out).

import * as quoteRepository from "../repositories/quote.repository";
import { callAnalyzeService } from "./fastapi.service";
import { ApiError } from "../utils/ApiError";
import { CreateQuoteInput, QuoteStatus } from "../types";

// Reshapes a quote (with its raw analysisResult row) into the response shape
function formatQuote(quote: any) {
  return {
    id: quote.id,
    customer: quote.customer,
    project: quote.project,
    status: quote.status,
    estimatedValue: quote.estimatedValue,
    createdDate: quote.createdDate,
    analysisResult: quote.analysisResult
      ? {
          risk: quote.analysisResult.risk,
          confidence: quote.analysisResult.confidence,
          missingItems: JSON.parse(quote.analysisResult.missingItems),
          analyzedAt: quote.analysisResult.analyzedAt,
        }
      : null,
  };
}

export async function getAllQuotes() {
  const quotes = await quoteRepository.findAllQuotes();
  return quotes.map(formatQuote);
}

export async function getQuoteById(id: number) {
  const quote = await quoteRepository.findQuoteById(id);
  if (!quote) {
    throw new ApiError(404, `Quote ${id} not found`);
  }
  return formatQuote(quote);
}

export async function createQuote(input: CreateQuoteInput) {
  const quote = await quoteRepository.createQuote(input);
  return formatQuote(quote);
}

export async function updateQuoteStatus(id: number, status: QuoteStatus) {
  const existing = await quoteRepository.findQuoteById(id);
  if (!existing) {
    throw new ApiError(404, `Quote ${id} not found`);
  }
  const updated = await quoteRepository.updateQuoteStatus(id, status);
  return formatQuote(updated);
}

export async function analyzeQuote(id: number) {
  const quote = await quoteRepository.findQuoteById(id);
  if (!quote) {
    throw new ApiError(404, `Quote ${id} not found`);
  }

  const analysis = await callAnalyzeService(String(quote.id));

  await quoteRepository.saveAnalysisResult(quote.id, {
    risk: analysis.risk,
    confidence: analysis.confidence,
    missingItems: JSON.stringify(analysis.missing_items),
  });

  const updatedQuote = await quoteRepository.findQuoteById(id);
  return formatQuote(updatedQuote);
}
