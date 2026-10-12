import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.set('trust proxy', true);

  // Enable CORS for all origins in development, or specific origin in production
  app.use(cors({
    origin: process.env.APP_URL || true,
    credentials: true
  }));

  app.use(express.json());
  app.use(cookieParser());

  // Health check endpoints for Google Cloud Run / Kubernetes / App Engine
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "healthy", uptime: process.uptime() });
  });

  // Gemini AI Assistant Proxy Endpoint
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: "Gemini API key is not configured on server" });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("[Server] Gemini assistant error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate AI response" });
    }
  });

  // Development vs Production serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine dist directory path reliably
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 5 compatible SPA fallback handler (avoids path-to-regexp v8 crash with "*")
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
