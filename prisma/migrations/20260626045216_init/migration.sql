-- CreateTable
CREATE TABLE "quote_requests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "estimated_value" REAL NOT NULL,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quote_id" INTEGER NOT NULL,
    "risk" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "missing_items" TEXT NOT NULL,
    "analyzed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analysis_results_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_quote_id_key" ON "analysis_results"("quote_id");
