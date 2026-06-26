import { Router } from "express";
import * as quoteController from "../controllers/quote.controller";

const router = Router();

router.get("/quotes", quoteController.getAllQuotes);
router.get("/quotes/:id", quoteController.getQuoteById);
router.post("/quotes", quoteController.createQuote);
router.post("/quotes/:id/analyze", quoteController.analyzeQuote);
router.patch("/quotes/:id/status", quoteController.updateQuoteStatus);

export default router;
