// Controller layer: translates HTTP requests into service calls, and service
// results back into HTTP responses. No business logic and no direct database here

import { NextFunction, Request, Response } from "express";
import * as quoteService from "../services/quote.service";
import { validateCreateQuote, validateQuoteId, validateUpdateStatus } from "../utils/validate";

export async function getAllQuotes(req: Request, res: Response, next: NextFunction) {
  try {
    const quotes = await quoteService.getAllQuotes();
    res.json(quotes);
  } catch (err) {
    next(err);
  }
}

export async function getQuoteById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateQuoteId(req.params.id);
    const quote = await quoteService.getQuoteById(id);
    res.json(quote);
  } catch (err) {
    next(err);
  }
}

export async function createQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateCreateQuote(req.body);
    const quote = await quoteService.createQuote(input);
    res.status(201).json(quote);
  } catch (err) {
    next(err);
  }
}

export async function analyzeQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateQuoteId(req.params.id);
    const result = await quoteService.analyzeQuote(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateQuoteStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = validateQuoteId(req.params.id);
    const { status } = validateUpdateStatus(req.body);
    const quote = await quoteService.updateQuoteStatus(id, status);
    res.json(quote);
  } catch (err) {
    next(err);
  }
}
