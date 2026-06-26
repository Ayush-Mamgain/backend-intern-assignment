"""
Mock FastAPI analysis service.

This stands in for the "real" AI document analysis service described in the
assignment. It does not do any real analysis - it just returns a plausible,
deterministic fake result for a given quote_id so the Node.js backend has
something real to call.

Run it with:
    uvicorn main:app --reload --port 8000
"""

import hashlib
import random

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Document Analysis Mock Service")

RISK_LEVELS = ["Low", "Medium", "High"]

POSSIBLE_MISSING_ITEMS = [
    "Structural drawings",
    "Load requirements",
    "Site survey",
    "Insurance certificate",
    "Material specifications",
    "Safety compliance report",
]


class AnalyzeRequest(BaseModel):
    quote_id: str


class AnalyzeResponse(BaseModel):
    risk: str
    missing_items: list[str]
    confidence: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):

    rng = random.Random()

    risk = rng.choice(RISK_LEVELS)
    missing_items = rng.sample(POSSIBLE_MISSING_ITEMS, k=rng.randint(0, 3))
    confidence = rng.randint(60, 99)

    return AnalyzeResponse(risk=risk, missing_items=missing_items, confidence=confidence)
