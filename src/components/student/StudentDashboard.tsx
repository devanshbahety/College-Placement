// src/components/student/StudentDashboard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { mockJobs, mockStudent } from '../../data/mockData';
import { Job } from '../../types';
import { Users, TrendingUp, Calendar, Target, Upload } from 'lucide-react';
import JobCard from './JobCard';
import ApplicationStatus from './ApplicationStatus';
import PlacementCard, { type Placement as PlacementCardType } from './PlacementCard';
import { Link } from 'react-router-dom';

type Profile = {
  name?: string;
  phone?: string;
  thaparEmail?: string;
  personalEmail?: string;
  cgpa?: string;          // stored as string in the form
  branch?: string;
  tenthPercent?: string;
  twelfthPercent?: string;
};

const PROFILE_STORAGE_KEY = 'studentProfile';
const APPLIED_STORAGE_KEY = 'appliedPlacements';
const RESUME_META_KEY = 'uploadedResumeMeta';

function readProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : {};
  } catch {
    return {};
  }
}

function readAppliedCount(): number {
  try {
    const raw = localStorage.getItem(APPLIED_STORAGE_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, boolean>;
    return Object.values(map).filter(Boolean).length;
  } catch {
    return 0;
  }
}

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'placements'>('jobs');
  const [jobs] = useState<Job[]>(mockJobs);

  // ---- Load profile from localStorage to drive name/eligibility ----
  const [profile, setProfile] = useState<Profile>(() => readProfile());

  // ---- Dynamic Applications count from Placement Notices checkboxes ----
  const [appliedCount, setAppliedCount] = useState<number>(() => readAppliedCount());

  // hidden file input ref for Upload Resume
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    const refreshProfile = () => setProfile(readProfile());
    const refreshApplied = () => setAppliedCount(readAppliedCount());

    const onFocus = () => {
      refreshProfile();
      refreshApplied();
    };
    window.addEventListener('focus', onFocus);

    // Update if another tab modifies localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === APPLIED_STORAGE_KEY) refreshApplied();
      if (e.key === PROFILE_STORAGE_KEY) refreshProfile();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Start with mock student, then override with profile values where available
  const student = {
    ...mockStudent,
    name: profile.name?.trim() || mockStudent.name,
    branch: profile.branch?.trim() || mockStudent.branch,
    cgpa:
      (() => {
        const n = Number(profile.cgpa);
        return Number.isFinite(n) ? n : mockStudent.cgpa;
      })(),
  };

  // Choose an email for uploading (prefer institutional, then personal, then mock)
  const userEmail = (profile.thaparEmail?.trim() ||
    profile.personalEmail?.trim() ||
    mockStudent.email) as string;

  // ---- Placements state (use the type from PlacementCard) ----
  const [placements, setPlacements] = useState<PlacementCardType[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState<boolean>(false);
  const [placementsError, setPlacementsError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoadingPlacements(true);
        setPlacementsError(null);

        // Last 30 days
        const res = await fetch('/api/placements?days=30', { signal: ctrl.signal });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || 'Failed to load placements');

        // Map API result into the PlacementCard prop shape
        const mapped: PlacementCardType[] = (json.data || []).map((x: any) => ({
          id: x.id || undefined,
          date: x.date || new Date().toISOString(),
          subject: x.subject || 'Placement Notice',
          from: x.from || '',
          company: x.company || '',
          role: x.role || '',
          ctc: x.ctc || '',
          location: x.location || '',
          importantDates: x.importantDates || '',
          eligibility: x.eligibility || '',
          link: x.link || '',
          attachments: Array.isArray(x.attachments) ? x.attachments : [],
          snippet: x.snippet || '',
        }));

        // Sort newest first
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPlacements(mapped);
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error('placements fetch failed:', e);
          setPlacementsError(e?.message || 'Failed to load placements');
        }
      } finally {
        setLoadingPlacements(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const eligibleJobs = jobs.filter(job => 
    job.eligibility.branches.includes(student.branch) &&
    student.cgpa >= job.eligibility.minCGPA &&
    student.backlogs <= job.eligibility.maxBacklogs
  );

  // Still using mock student's application states for these two
  const shortlistedApplications = student.applications.filter(app => app.status === 'shortlisted').length;
  const selectedApplications = student.applications.filter(app => app.status === 'selected').length;

  // ---- Upload Resume (front-end -> backend) ----
  const onClickUpload = () => {
    fileInputRef.current?.click();
  };

const onFileChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
  setUploadMsg(null);
  const file = e.target.files?.[0];
  e.target.value = ''; // reset immediately so same file can be re-picked
  if (!file) return;

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    setUploadMsg('Please upload a PDF file.');
    return;
  }

  try {
    const profile = readProfile();
    const userName  = (profile.name || '').trim();
    const userEmail = (profile.thaparEmail || profile.personalEmail || '').trim();

    if (!userName || !userEmail) {
      setUploadMsg('Please fill your Name and Email in Profile first.');
      return;
    }

    const form = new FormData();
    form.append('resume', file);
    form.append('userName', userName);
    form.append('userEmail', userEmail);

    const res = await fetch('/api/resumes/upload', {
      method: 'POST',
      body: form,
    });

    const ct = res.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await res.json() : { ok: false, error: await res.text() };

    if (!res.ok || !payload.ok) {
      setUploadMsg(`Upload failed: ${payload.error || res.statusText}`);
      return;
    }

    setUploadMsg('Resume uploaded successfully!');
  } catch (err: any) {
    console.error(err);
    setUploadMsg('Upload failed. See console for details.');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {student.name}!
            </h1>
            <p className="text-gray-600">Track your placement journey and explore new opportunities</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClickUpload}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              aria-label="Upload your resume (PDF)"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload Resume (PDF)'}
            </button>

            {/* hidden input for file selection */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChosen}
            />

            <Link
              to="/profile"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              aria-label="Edit your student profile"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {uploadMsg && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {uploadMsg}
          </div>
        )}

        {/* Stats Cards (now clickable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className="text-left bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow transition"
            aria-label="View eligible jobs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eligible Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{eligibleJobs.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className="text-left bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow transition"
            aria-label="View applications"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-amber-600">{appliedCount}</p>
              </div>
              <Users className="w-8 h-8 text-amber-600" />
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className="text-left bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow transition"
            aria-label="View shortlisted applications"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-green-600">{shortlistedApplications}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className="text-left bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow transition"
            aria-label="View selected applications"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-emerald-600">{selectedApplications}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
          </button>
        </div>

        {/* Tab Navigation (no Resume Manager tab) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'jobs', label: 'Available Jobs', count: eligibleJobs.length },
              { id: 'applications', label: 'My Applications', count: appliedCount },
              { id: 'placements', label: 'Placement Notices', count: placements.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === (tab.id as any)
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Jobs */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Available Jobs</h2>
                  <p className="text-sm text-gray-600">{eligibleJobs.length} jobs match your profile</p>
                </div>
                
                <div className="grid gap-6">
                  {eligibleJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      student={student}
                      timeRemaining={getTimeRemaining(job.deadline)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            {activeTab === 'applications' && (
              <ApplicationStatus applications={student.applications} jobs={jobs} />
            )}

            {/* Placement Notices */}
            {activeTab === 'placements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Placement Notices (Last 30 days)</h2>
                  <div className="text-sm text-gray-600">
                    {loadingPlacements ? 'Loading…' : `${placements.length} found`}
                  </div>
                </div>

                {placementsError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                    {placementsError}
                  </div>
                )}

                {!loadingPlacements && !placementsError && placements.length === 0 && (
                  <p className="text-gray-600">No recent notices.</p>
                )}

                <div className="grid gap-4">
                  {placements.map((p, idx) => (
                    <PlacementCard key={p.id || `${p.subject}-${idx}`} p={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
