// server.js
import express from "express";
import cors from "cors";
import { fetchPlacementMails } from "./src/data/fetchEmails.js";

const app = express();

// allow your Vite dev server
app.use(cors({ origin: "http://localhost:5173" }));

// simple root + ping to verify server identity
app.get("/", (_req, res) => res.send("Placement API OK"));
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.get("/api/placements", async (_req, res) => {
  try {
    const data = await fetchPlacementMails();
    res.json({ ok: true, count: data.length, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Failed to fetch emails" });
  }
});

const PORT = 5050; // <-- changed
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
