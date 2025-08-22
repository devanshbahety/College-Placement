// server.js (ESM)
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import { fetchPlacementMails } from "./src/data/fetchEmails.js";
// ✅ IMPORTANT: import the ESM-friendly entry to avoid the test-file read
import pdf from "pdf-parse/lib/pdf-parse.js";

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

// ---------- Placements ----------
app.get("/api/placements", async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const data = await fetchPlacementMails(days);
    res.json({ ok: true, count: data.length, data });
  } catch (e) {
    console.error("placements error:", e);
    res.status(500).json({ ok: false, error: "Failed to fetch emails" });
  }
});

// ---------- Upload Resume + parse & store structured data ----------
app.post("/api/resumes/upload", upload.single("resume"), async (req, res) => {
  try {
    const userName = (req.body.userName || "").trim();
    const userEmail = (req.body.userEmail || "").trim();

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

    // 1) Save the base Resume row
    const resume = await prisma.resume.create({
      data: {
        userName,
        userEmail,
        originalName: f.originalname,
        fileName: f.filename,
        mimeType: f.mimetype,
        size: f.size,
        path: path.join("uploads", "resumes", f.filename),
      },
    });

    // 2) Parse PDF text
    const dataBuffer = fs.readFileSync(f.path);
    const parsed = await pdf(dataBuffer);
    const text = (parsed.text || "").replace(/\r/g, "");
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    // 3) Segment by headings
    const sections = splitByHeaders(lines, [
      "EDUCATION",
      "INTERNSHIP",
      "INTERNSHIPS",
      "ACADEMIC PROJECTS",
      "ACADEMIC ACHIEVEMENTS AND AWARDS",
      "POSITIONS OF RESPONSIBILITY",
      "EXTRA-CURRICULAR ACTIVITIES AND ACHIEVEMENTS",
      "SKILL / INTEREST",
      "SKILLS / INTEREST",
      "SKILLS",
    ]);

    // 4) Parse and insert per section
    const txOps = [];

    if (sections["EDUCATION"]) {
      const eduRows = parseEducation(sections["EDUCATION"]);
      if (eduRows.length) {
        txOps.push(prisma.education.createMany({
          data: eduRows.map(e => ({ ...e, resumeId: resume.id })),
          skipDuplicates: true,
        }));
      }
    }

    const internshipsBlock = sections["INTERNSHIPS"] || sections["INTERNSHIP"];
    if (internshipsBlock) {
      const rows = parseInternships(internshipsBlock);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.internship.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    if (sections["ACADEMIC PROJECTS"]) {
      const rows = parseProjects(sections["ACADEMIC PROJECTS"]);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.project.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    if (sections["ACADEMIC ACHIEVEMENTS AND AWARDS"]) {
      const rows = parseAchievements(sections["ACADEMIC ACHIEVEMENTS AND AWARDS"]);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.achievement.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    if (sections["POSITIONS OF RESPONSIBILITY"]) {
      const rows = parsePositions(sections["POSITIONS OF RESPONSIBILITY"]);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.position.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    if (sections["EXTRA-CURRICULAR ACTIVITIES AND ACHIEVEMENTS"]) {
      const rows = parseExtras(sections["EXTRA-CURRICULAR ACTIVITIES AND ACHIEVEMENTS"]);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.extraActivity.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    const skillsBlock =
      sections["SKILL / INTEREST"] ||
      sections["SKILLS / INTEREST"] ||
      sections["SKILLS"];
    if (skillsBlock) {
      const rows = parseSkills(skillsBlock);
      if (rows.length) {
        txOps.push(...rows.map(r =>
          prisma.skill.create({ data: { ...r, resumeId: resume.id } })
        ));
      }
    }

    if (txOps.length) await prisma.$transaction(txOps);

    res.json({ ok: true, data: resume });
  } catch (e) {
    console.error("upload+parse error:", e);
    res.status(500).json({ ok: false, error: "Upload/parse failed" });
  }
});

// ---------- List resumes ----------
app.get("/api/resumes", async (_req, res) => {
  try {
    const rows = await prisma.resume.findMany({ orderBy: { uploadedAt: "desc" } });
    res.json({ ok: true, count: rows.length, data: rows });
  } catch (e) {
    console.error("list resumes error:", e);
    res.status(500).json({ ok: false, error: "Failed to list resumes" });
  }
});

// ---------- Global JSON error handler ----------
app.use((err, _req, res, _next) => {
  console.error("Global error handler:", err);
  if (err && err.name === "MulterError") {
    return res.status(400).json({ ok: false, error: err.message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  return res.status(500).json({ ok: false, error: "Unexpected server error" });
});

// ---------- Start server on fixed port ----------
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

/* -------------------- Helpers -------------------- */
function splitByHeaders(lines, headers) {
  const map = {};
  let current = null;
  for (const raw of lines) {
    const line = raw.replace(/\s+/g, " ").trim();
    const isAllCaps = line === line.toUpperCase() && line.length > 2;
    const normalized = line.toUpperCase();
    if (isAllCaps || headers.includes(normalized)) {
      current = normalized;
      map[current] = map[current] || [];
      continue;
    }
    if (current) map[current].push(raw);
  }
  return map;
}
function parseEducation(lines) {
  const rows = joinWrap(lines);
  const out = [];
  for (const r of rows) {
    const parts = r.split(/\s{2,}|\s\|\s/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const obj = {
        institute: parts[2] || "",
        degree: parts[0] || "",
        start: parts[1]?.split(/[–-]/)[0]?.trim() || "",
        end: parts[1]?.split(/[–-]/)[1]?.trim() || "",
        grade: parts[3] || "",
      };
      if (obj.degree || obj.institute) out.push(obj);
    }
  }
  return out;
}
function parseInternships(lines) {
  const blocks = splitByBullets(lines);
  const out = [];
  for (const b of blocks) {
    const head = (b.header || "").replace(/^[-•\u2022]\s*/, "").trim();
    if (!head) continue;
    const [titlePart, companyPart, locationPart] = head.split(",").map(s => s.trim());
    const bullets = (b.bullets || []).map(cleanBullet);
    out.push({
      company: companyPart || titlePart || "Company",
      title: titlePart || "",
      location: locationPart || "",
      start: "", end: "",
      bullets,
    });
  }
  return out;
}
function parseProjects(lines) {
  const blocks = splitByBullets(lines);
  const out = [];
  for (const b of blocks) {
    const name = (b.header || "").replace(/^[-•\u2022]\s*/, "").trim();
    const bullets = (b.bullets || []).map(cleanBullet);
    if (name || bullets.length) out.push({ name: name || "Project", summary: "", bullets });
  }
  return out;
}
function parseAchievements(lines) {
  const rows = listBullets(lines);
  return rows.map(t => ({ title: t, detail: "" }));
}
function parseExtras(lines) {
  const rows = listBullets(lines);
  return rows.map(t => ({ title: t, detail: "" }));
}
function parseSkills(lines) {
  const rows = joinWrap(lines);
  const out = [];
  for (const r of rows) {
    const m = r.match(/^([A-Za-z &/]+)\s*:\s*(.+)$/);
    if (m) {
      const category = m[1].trim();
      const items = m[2].split(/[,;]|\s·\s/).map(s => s.trim()).filter(Boolean);
      out.push({ category, items });
    }
  }
  return out;
}
function cleanBullet(s) { return s.replace(/^[-•\u2022]\s*/, "").trim(); }
function listBullets(lines) {
  return lines
    .map(l => l.trim())
    .filter(l => /^[-•\u2022]/.test(l))
    .map(cleanBullet);
}
function joinWrap(lines) {
  const out = []; let buf = [];
  const push = () => { if (buf.length) { out.push(buf.join(" ").trim()); buf = []; } };
  for (const l of lines) {
    if (!l.trim()) { push(); continue; }
    buf.push(l.trim());
    if (/[.;:]$/.test(l.trim())) push();
  }
  push();
  return out;
}
function splitByBullets(lines) {
  const out = []; let current = { header: "", bullets: [] };
  const flush = () => { if (current.header || current.bullets.length) out.push(current); current = { header: "", bullets: [] }; };
  for (const l of lines) {
    if (!l.trim()) continue;
    if (!/^[-•\u2022]/.test(l) && !current.header) current.header = l.trim();
    else if (/^[-•\u2022]/.test(l)) current.bullets.push(l);
    else { flush(); current.header = l.trim(); }
  }
  flush();
  return out;
}
