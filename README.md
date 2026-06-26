# Backend Internship Assignment — Quote Requests + FastAPI Analysis

A Node.js + TypeScript + Express backend that manages "quote requests" and
integrates with a FastAPI document-analysis service. SQLite is used as the
database, accessed through Prisma ORM. A mock FastAPI service is included in
the same project so the whole thing runs end-to-end without any external
dependencies.

## Project structure

```
backend-internship-assignment/
├──API_Screenshots/                #screenshots of Postman tested APIs in png format
├── src/
│   ├── server.ts                  # starts the HTTP server
│   ├── app.ts                     # express app + middleware + routes wiring
│   ├── routes/                    # URL -> controller mapping
│   ├── controllers/               # HTTP request/response handling
│   ├── services/                  # business logic (incl. the FastAPI client)
│   ├── repositories/               # the only place that talks to Prisma
│   ├── middleware/                 # logging + centralized error handling
│   ├── utils/                      # ApiError, validation, Prisma client
│   └── types/                      # shared TypeScript types
├── prisma/
│   └── schema.prisma               # QuoteRequest + AnalysisResult tables
├── fastapi-mock/                   # standalone mock of the FastAPI service
│   ├── main.py
│   └── requirements.txt
├── postman_collection.json
├── API_DOCUMENTATION.md
└── .env.example
```

This follows the suggested structure from the assignment
(`controllers / routes / services / repositories / models / middleware / utils`),
with Prisma's `schema.prisma` standing in for `models/`.

## How the pieces fit together

```
Client → Express routes → Controller → Service → Repository → Prisma → SQLite
                                   │
                                   └──→ FastAPI service (axios, /analyze)
```

- **Controllers** only read the request and shape the response. No business
  rules live here.
- **Services** hold the business logic (e.g. "find the quote, then call
  FastAPI, then save the result, then return both combined").
- **Repositories** are the only files that import `@prisma/client`. If the
  database ever changed (e.g. SQLite → Postgres), this is the only layer that
  would need to change.

## Prerequisites

- Node.js 18+
- Python 3.10+ (for the mock FastAPI service)

## Setup

### 1. Install Node dependencies

```bash
cd backend-internship-assignment
npm install
cp .env.example .env
```

### 2. Set up the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This creates `prisma/dev.db` (SQLite file) with the `quote_requests` and
`analysis_results` tables.

> **Note:** `prisma generate` / `migrate` download a small query-engine binary
> the first time you run them, so you'll need normal internet access once.
> After that they work fully offline.

### 3. Start the mock FastAPI service

In a separate terminal:

```bash
cd fastapi-mock
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

This exposes `POST http://localhost:8000/analyze`, matching the contract
described in the assignment. It returns a deterministic fake result based on
the `quote_id` you send it (same id → same "analysis" every time), so it's
easy to test against.

### 4. Start the Node.js backend

```bash
npm run dev
```

The API is now available at `http://localhost:3000`.

## Running in production mode

```bash
npm run build
npm start
```

## Quick test

```bash
curl -X POST http://localhost:3000/quotes \
  -H "Content-Type: application/json" \
  -d '{"customer": "Acme Corp", "project": "Warehouse Roof", "estimatedValue": 15000}'

curl -X POST http://localhost:3000/quotes/1/analyze
```

See `API_DOCUMENTATION.md` for the full list of endpoints, request/response
examples, and error cases. Import `postman_collection.json` into Postman for
a ready-made collection of all requests. See `API_Screenshots\` for Postman tested APIs results.

