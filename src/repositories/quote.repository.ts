// Repository layer: only place in the app that talks to Prisma directly.
// Controllers and services never import @prisma/client themselves

import { prisma } from "../utils/prisma";
import { CreateQuoteInput, QuoteStatus } from "../types";

export function findAllQuotes() {
  return prisma.quoteRequest.findMany({
    include: { analysisResult: true },
    orderBy: { createdDate: "desc" },
  });
}

export function findQuoteById(id: number) {
  return prisma.quoteRequest.findUnique({
    where: { id },
    include: { analysisResult: true },
  });
}

export function createQuote(data: CreateQuoteInput) {
  return prisma.quoteRequest.create({
    data: {
      customer: data.customer,
      project: data.project,
      estimatedValue: data.estimatedValue,
      // Defaults to "New" if not given
      status: data.status ?? "New",
    },
  });
}

export function updateQuoteStatus(id: number, status: QuoteStatus) {
  return prisma.quoteRequest.update({
    where: { id },
    data: { status },
  });
}

// We only ever keep the LATEST analysis result for a quote.
// "upsert" creates it the first time and overwrites it on every later analysis.
export function saveAnalysisResult(
  quoteId: number,
  data: { risk: string; confidence: number; missingItems: string }
) {
  return prisma.analysisResult.upsert({
    where: { quoteId },
    create: { quoteId, ...data },
    update: { ...data, analyzedAt: new Date() },
  });
}
