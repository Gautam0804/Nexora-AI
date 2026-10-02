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

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/queries", queryRoutes);
app.use(
  "/api/ai-queries",
  aiQueryRoutes
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

export default app;