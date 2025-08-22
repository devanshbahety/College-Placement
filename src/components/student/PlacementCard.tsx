// src/components/student/PlacementCard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Link as LinkIcon,
  Paperclip,
  Mail,
} from "lucide-react";

// Define the shape we render. No external import needed.
export type Placement = {
  id?: string;
  date: string; // ISO string preferred
  subject: string;
  from: string;
  company: string;
  role: string;
  ctc: string;
  location: string;
  importantDates: string;
  eligibility: string;
  link: string;
  attachments?: { filename: string; contentType: string; size: number }[];
  snippet?: string;
};

const APPLIED_STORAGE_KEY = "appliedPlacements"; // { [placementKey]: true }

function safeDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  // Uses the viewer's locale/timezone (which is ideal in-app)
  return d.toLocaleString();
}

function cleanFrom(from: string) {
  // Remove any angle-bracketed email parts and stray tags
  const noTags = (from || "").replace(/<.*?>/g, "");
  return noTags.trim();
}

function humanSize(bytes: number) {
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function truncate(s: string, max = 220) {
  if (!s) return "";
  return s.length > max ? `${s.slice(0, max).trim()}…` : s;
}

export default function PlacementCard({ p }: { p: Placement }) {
  const title = p.company?.trim() || p.subject?.trim() || "Placement update";
  const showCtc = !!p.ctc;
  const showLoc = !!p.location;
  const showDates = !!p.importantDates;
  const showRole = !!p.role;
  const showEligibility = !!p.eligibility;
  const showSnippet = !!p.snippet;
  const hasAttachments = !!p.attachments?.length;

  // ---- NEW: Applied? checkbox state persisted to localStorage ----
  const placementKey = useMemo(
    () => (p.id && p.id.trim() ? p.id : `${p.subject}|${p.date}`),
    [p.id, p.subject, p.date]
  );
  const [applied, setApplied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APPLIED_STORAGE_KEY);
      if (raw) {
        const map = JSON.parse(raw) as Record<string, boolean>;
        if (Object.prototype.hasOwnProperty.call(map, placementKey)) {
          setApplied(!!map[placementKey]);
        }
      }
    } catch {
      /* ignore */
    }
  }, [placementKey]);

  function toggleApplied(next: boolean) {
    setApplied(next);
    try {
      const raw = localStorage.getItem(APPLIED_STORAGE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      map[placementKey] = next;
      localStorage.setItem(APPLIED_STORAGE_KEY, JSON.stringify(map));
    } catch {
      /* ignore storage errors */
    }
  }
  // ----------------------------------------------------------------

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          {title}
        </h3>
        <span className="shrink-0 text-xs text-gray-500">
          {safeDateLabel(p.date)}
        </span>
      </div>

      {/* Role */}
      {showRole && (
        <p className="mt-1 text-sm text-gray-700">
          <span className="font-medium">Role:</span> {p.role}
        </p>
      )}

      {/* Meta */}
      <div className="mt-3 grid gap-2 text-sm text-gray-700">
        {showCtc && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" aria-hidden />
            <span className="truncate">{p.ctc}</span>
          </div>
        )}

        {showLoc && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden />
            <span className="truncate">{p.location}</span>
          </div>
        )}

        {showDates && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden />
            <span className="whitespace-pre-wrap">{p.importantDates}</span>
          </div>
        )}
      </div>

      {/* Eligibility */}
      {showEligibility && (
        <p className="mt-3 text-sm text-gray-700">
          <span className="font-medium">Eligibility: </span>
          <span className="whitespace-pre-wrap">{p.eligibility}</span>
        </p>
      )}

      {/* Snippet preview */}
      {showSnippet && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          {truncate(p.snippet!, 260)}
        </div>
      )}

      {/* Attachments */}
      {hasAttachments && (
        <div className="mt-3 flex flex-wrap gap-2">
          {p.attachments!.map((att, idx) => (
            <span
              key={`${att.filename}-${idx}`}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
              title={`${att.filename} • ${att.contentType || "file"}${
                att.size ? ` • ${humanSize(att.size)}` : ""
              }`}
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              <span className="max-w-[16rem] truncate">{att.filename}</span>
              {att.size ? (
                <span className="text-gray-500">· {humanSize(att.size)}</span>
              ) : null}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Mail className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate">From: {cleanFrom(p.from)}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Applied checkbox */}
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={applied}
              onChange={(e) => toggleApplied(e.target.checked)}
              aria-label="Mark this placement as applied"
            />
            Applied?
          </label>

          {p.link ? (
            <a
              className="inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              href={p.link}
              target="_blank"
              rel="noreferrer"
              aria-label="Open application/details link in a new tab"
            >
              <LinkIcon className="h-4 w-4" aria-hidden />
              <span>Apply / Details</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400">No link provided</span>
          )}
        </div>
      </div>
    </div>
  );
}
