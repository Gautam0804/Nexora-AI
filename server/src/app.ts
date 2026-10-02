import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import documentRoutes from "./routes/document.routes";
import searchRoutes from "./routes/search.routes";
import ragRoutes from "./routes/rag.routes";
import queryRoutes from "./routes/query.routes";
import aiQueryRoutes from "./routes/ai-query.routes";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/ai-queries", aiQueryRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

export default app;