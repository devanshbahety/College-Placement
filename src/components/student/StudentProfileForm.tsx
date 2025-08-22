// src/components/student/StudentProfileForm.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Profile = {
  name: string;
  phone: string;
  thaparEmail: string;
  personalEmail: string;
  cgpa: string;            // store as string for input control, validate as number
  branch: string;
  tenthPercent: string;    // 10th %
  twelfthPercent: string;  // 12th %
};

const STORAGE_KEY = "studentProfile";

const initialState: Profile = {
  name: "",
  phone: "",
  thaparEmail: "",
  personalEmail: "",
  cgpa: "",
  branch: "",
  tenthPercent: "",
  twelfthPercent: "",
};

function InputRow({
  label,
  children,
  required,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-gray-800">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function StudentProfileForm() {
  const [form, setForm] = useState<Profile>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Prefill from localStorage if present
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm({ ...initialState, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function update<K extends keyof Profile>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = "Name is required.";
    if (!/^\+?\d{7,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number (7–15 digits).";

    if (!/^[^\s@]+@thapar\.edu$/i.test(form.thaparEmail.trim()))
      e.thaparEmail = "Use your @thapar.edu email.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personalEmail.trim()))
      e.personalEmail = "Enter a valid personal email.";

    const cgpaNum = Number(form.cgpa);
    if (!Number.isFinite(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)
      e.cgpa = "CGPA must be between 0 and 10.";

    if (!form.branch.trim()) e.branch = "Branch is required.";

    const p10 = Number(form.tenthPercent);
    if (!Number.isFinite(p10) || p10 < 0 || p10 > 100)
      e.tenthPercent = "10th % must be 0–100.";

    const p12 = Number(form.twelfthPercent);
    if (!Number.isFinite(p12) || p12 < 0 || p12 > 100)
      e.twelfthPercent = "12th % must be 0–100.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setSaving(true);
    try {
      // For now: persist locally. Later: POST to /api/profile
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      setMessage("Profile saved.");
    } catch {
      setMessage("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    setForm(initialState);
    setErrors({});
    setMessage(null);
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Keep your details up to date for accurate eligibility checks.
            </p>
          </div>
          {/* Back to dashboard */}
          <Link
            to="/"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-label="Back to dashboard"
          >
            ← Back
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-6 grid gap-5">
          {/* SINGLE COLUMN: one section per line */}
          <InputRow label="Full Name" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Rahul Sharma"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </InputRow>

          <InputRow label="Phone Number" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91XXXXXXXXXX"
              inputMode="tel"
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </InputRow>

          <InputRow label="Thapar Email" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.thaparEmail}
              onChange={(e) => update("thaparEmail", e.target.value)}
              placeholder="you@thapar.edu"
              inputMode="email"
            />
            {errors.thaparEmail && (
              <p className="text-xs text-red-600">{errors.thaparEmail}</p>
            )}
          </InputRow>

          <InputRow label="Personal Email" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.personalEmail}
              onChange={(e) => update("personalEmail", e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
            />
            {errors.personalEmail && (
              <p className="text-xs text-red-600">{errors.personalEmail}</p>
            )}
          </InputRow>

          <InputRow label="Current CGPA (0–10)" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.cgpa}
              onChange={(e) => update("cgpa", e.target.value)}
              placeholder="8.41"
              inputMode="decimal"
            />
            {errors.cgpa && <p className="text-xs text-red-600">{errors.cgpa}</p>}
          </InputRow>

          <InputRow label="Branch" required>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
            >
              <option value="">Select branch</option>
              <option value="CSE">CSE</option>
              <option value="COE">COE</option>
              <option value="ENC">ENC</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="BIO">BIO</option>
              <option value="CHE">CHE</option>
              {/* add others if needed */}
            </select>
            {errors.branch && <p className="text-xs text-red-600">{errors.branch}</p>}
          </InputRow>

          <InputRow label="10th Percentage" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.tenthPercent}
              onChange={(e) => update("tenthPercent", e.target.value)}
              placeholder="92.4"
              inputMode="decimal"
            />
            {errors.tenthPercent && (
              <p className="text-xs text-red-600">{errors.tenthPercent}</p>
            )}
          </InputRow>

          <InputRow label="12th Percentage" required>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={form.twelfthPercent}
              onChange={(e) => update("twelfthPercent", e.target.value)}
              placeholder="89.5"
              inputMode="decimal"
            />
            {errors.twelfthPercent && (
              <p className="text-xs text-red-600">{errors.twelfthPercent}</p>
            )}
          </InputRow>

          {message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
