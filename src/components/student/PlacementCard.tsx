// src/components/student/PlacementCard.tsx
import React from "react";
import { Calendar, MapPin, DollarSign, Link as LinkIcon } from "lucide-react";

// Define the shape we render. No external import needed.
export type Placement = {
  id?: string;
  date: string;
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

export default function PlacementCard({ p }: { p: Placement }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{p.company || p.subject}</h3>
        <span className="text-xs text-gray-500">
          {new Date(p.date).toLocaleString()}
        </span>
      </div>

      {p.role && <p className="mt-1 text-sm text-gray-700">Role: {p.role}</p>}

      <div className="mt-3 grid gap-2 text-sm text-gray-700">
        {p.ctc && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> <span>{p.ctc}</span>
          </div>
        )}
        {p.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> <span>{p.location}</span>
          </div>
        )}
        {p.importantDates && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> <span>{p.importantDates}</span>
          </div>
        )}
      </div>

      {p.eligibility && (
        <p className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Eligibility: </span>
          {p.eligibility}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          From: {p.from?.replace(/<.*?>/g, "").trim()}
        </div>
        {p.link && (
          <a
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
            href={p.link}
            target="_blank"
            rel="noreferrer"
          >
            <LinkIcon className="h-4 w-4" />
            Apply / Details
          </a>
        )}
      </div>
    </div>
  );
}
