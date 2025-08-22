// server.js (ESM)
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { fetchPlacementMails } from "./src/data/fetchEmails.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// CORS for your Vite dev server
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ---------- Static for uploaded files ----------
const UPLOAD_DIR = path.join(__dirname, "uploads", "resumes");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------- Multer config (PDF only) ----------
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // keep .pdf
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      path.extname(file.originalname).toLowerCase() === ".pdf";
    if (!isPdf) return cb(new Error("Only PDF files are allowed."));
    cb(null, true);
  },
});

// ---------- Root & health ----------
app.get("/", (_req, res) => res.send("Placement API OK"));
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---------- Placements (kept intact, just parameterized days) ----------
app.get("/api/placements", async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const data = await fetchPlacementMails(days);
    res.json({ ok: true, count: data.length, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Failed to fetch emails" });
  }
});

// ---------- Upload Resume ----------
app.post("/api/resumes/upload", upload.single("resume"), async (req, res) => {
  try {
    const userName = (req.body.userName || "").trim();  // from your form
    const userEmail = (req.body.userEmail || "").trim(); // from your form

    if (!userName || !userEmail) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({ ok: false, error: "userName and userEmail are required" });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, error: "No file uploaded" });
    }

    const f = req.file;

    // Save DB row
    const created = await prisma.resume.create({
      data: {
        userName,                 // <-- ensure this field exists in schema
        userEmail,
        originalName: f.originalname,
        fileName: f.filename,
        mimeType: f.mimetype,
        size: f.size,
        path: path.join("uploads", "resumes", f.filename), // relative, served via /uploads
      },
    });

    res.json({ ok: true, data: created });
  } catch (e) {
    console.error("upload error:", e);
    res.status(500).json({ ok: false, error: "Upload failed" });
  }
});

// ---------- List resumes (optional for testing) ----------
app.get("/api/resumes", async (_req, res) => {
  try {
    const rows = await prisma.resume.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    res.json({ ok: true, count: rows.length, data: rows });
  } catch (e) {
    console.error("list resumes error:", e);
    res.status(500).json({ ok: false, error: "Failed to list resumes" });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
