# API Documentation

Base URL: `http://localhost:3000`

All request/response bodies are JSON. All error responses have the shape:

```json
{ "error": "human readable message" }
```

---

## GET /health

Quick check that the server is running.

**Response `200`**
```json
{ "status": "ok" }
```

---

## GET /quotes

Returns every quote request, newest first, each with its latest analysis
result (if one exists).

**Response `200`**
```json
[
  {
    "id": 1,
    "customer": "Acme Corp",
    "project": "Warehouse Roof",
    "status": "New",
    "estimatedValue": 15000,
    "createdDate": "2026-06-20T10:00:00.000Z",
    "analysisResult": {
      "risk": "Medium",
      "confidence": 91,
      "missingItems": ["Structural drawings", "Load requirements"],
      "analyzedAt": "2026-06-20T10:05:00.000Z"
    }
  }
]
```

`analysisResult` is `null` if the quote has never been analyzed.

---

## GET /quotes/:id

Returns one quote with its analysis result.

**Response `200`** — same shape as one item above.

**Errors**
| Status | When |
|--------|------|
| 400 | `:id` is not a positive integer |
| 404 | No quote with that id exists |

---

## POST /quotes

Creates a new quote request.

**Request body**
```json
{
  "customer": "Acme Corp",
  "project": "Warehouse Roof",
  "estimatedValue": 15000,
  "status": "New"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `customer` | string | yes | non-empty |
| `project` | string | yes | non-empty |
| `estimatedValue` | number | yes | must be `>= 0`, a plain number (not a string) |
| `status` | string | no | one of `New`, `In Review`, `Needs Info`, `Completed`. Defaults to `"New"` if omitted. |

**Response `201`** — the created quote (same shape as in `GET /quotes`,
`analysisResult` will be `null`).

**Errors**
| Status | When |
|--------|------|
| 400 | `customer` or `project` missing, `estimatedValue` missing/not a number/negative, or `status` is not one of the allowed values |

Example error:
```json
{ "error": "customer is required; estimatedValue cannot be negative" }
```

---

## POST /quotes/:id/analyze

Runs (or re-runs) analysis for a quote:

1. Looks up the quote.
2. Calls the FastAPI service's `POST /analyze` with `{ "quote_id": "<id>" }`.
3. Saves the result, **overwriting any previous analysis** for that quote
   (only the latest analysis is kept).
4. Returns the quote combined with the new analysis.

**Response `200`** — same shape as `GET /quotes/:id`, now with
`analysisResult` populated.

**Errors**
| Status | When |
|--------|------|
| 400 | `:id` is not a positive integer |
| 404 | No quote with that id exists |
| 502 | FastAPI responded but with an error, or with an unexpected response shape |
| 503 | FastAPI service is unreachable (e.g. not running) |
| 504 | FastAPI service did not respond within `FASTAPI_TIMEOUT_MS` (default 5s) |

---

## PATCH /quotes/:id/status

Updates a quote's status.

**Request body**
```json
{ "status": "In Review" }
```

`status` must be one of: `New`, `In Review`, `Needs Info`, `Completed`.

**Response `200`** — the updated quote.

**Errors**
| Status | When |
|--------|------|
| 400 | `:id` is not a positive integer, or `status` missing/not one of the allowed values |
| 404 | No quote with that id exists |

---

## Mock FastAPI service

Included separately in `fastapi-mock/`, run on port `8000` by default.

### POST /analyze

**Request**
```json
{ "quote_id": "1" }
```

**Response**
```json
{
  "risk": "Medium",
  "missing_items": ["Structural drawings", "Load requirements"],
  "confidence": 91
}
```

The result is deterministic per `quote_id` (same id always returns the same
fake result) but otherwise randomly generated — it does not perform any real
analysis.

---

## Logging

Every request is logged to the console by `requestLogger` middleware in this
format:

```
[2026-06-20T10:05:00.123Z] POST /quotes/1/analyze -> 200 (842ms)
```

This includes the timestamp, method, path, response status code, and how
long the request took — useful for spotting slow FastAPI calls during
debugging.
