import express from "express";
import { requestLogger } from "./middleware/logger.middleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";
import quoteRoutes from "./routes/quote.routes";

export const app = express();

app.use(express.json()); //parsing JSON
app.use(requestLogger); //logging request-response data

// Simple health check for confirming the server is up.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

//Mounting API routes
app.use(quoteRoutes);


//Error handling
app.use(notFoundHandler);
app.use(errorHandler);
