// src/components/student/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { mockJobs, mockStudent } from '../../data/mockData';
import { Job } from '../../types';
import { Users, TrendingUp, Calendar, Target, DollarSign, MapPin, Link as LinkIcon } from 'lucide-react';
import JobCard from './JobCard';
import ApplicationStatus from './ApplicationStatus';
import ResumeManager from './ResumeManager';
import PlacementCard, { type Placement as PlacementCardType } from './PlacementCard';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'resumes' | 'placements'>('jobs');
  const [jobs] = useState<Job[]>(mockJobs);
  const [student] = useState(mockStudent);

  // ---- Placements state (use the type from PlacementCard) ----
  const [placements, setPlacements] = useState<PlacementCardType[]>([]);
  const [loadingPlacements, setLoadingPlacements] = useState<boolean>(false);
  const [placementsError, setPlacementsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPlacements(true);
        setPlacementsError(null);

        // Call your working API
        const res = await fetch('/api/placements?days=7');
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || 'Failed to load placements');

        // Map API result into the PlacementCard prop shape
        const mapped: PlacementCardType[] = (json.data || []).map((x: any) => ({
          id: x.id || undefined,
          date: x.date || new Date().toISOString(),
          subject: x.subject || 'Placement Notice',
          from: x.from || '',
          company: x.company || '',
          role: x.role || '',                    // not parsed yet; leave blank
          ctc: x.ctc || '',
          location: x.location || '',            // not parsed yet; leave blank
          importantDates: x.importantDates || '',// not parsed yet; leave blank
          eligibility: x.eligibility || '',      // not parsed yet; leave blank
          link: x.link || '',
          attachments: x.attachments || [],
          snippet: x.snippet || '',
        }));

        setPlacements(mapped);
      } catch (e: any) {
        console.error('placements fetch failed:', e);
        setPlacementsError(e?.message || 'Failed to load placements');
      } finally {
        setLoadingPlacements(false);
      }
    })();
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

  const appliedJobs = student.applications.length;
  const shortlistedApplications = student.applications.filter(app => app.status === 'shortlisted').length;
  const selectedApplications = student.applications.filter(app => app.status === 'selected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {student.name}!</h1>
          <p className="text-gray-600">Track your placement journey and explore new opportunities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eligible Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{eligibleJobs.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-amber-600">{appliedJobs}</p>
              </div>
              <Users className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-green-600">{shortlistedApplications}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-emerald-600">{selectedApplications}</p>
              </div>
              <Calendar className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'jobs', label: 'Available Jobs', count: eligibleJobs.length },
              { id: 'applications', label: 'My Applications', count: appliedJobs },
              { id: 'resumes', label: 'Resume Manager', count: student.resumes.length },
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

            {/* Resumes */}
            {activeTab === 'resumes' && (
              <ResumeManager student={student} />
            )}

            {/* Placement Notices */}
            {activeTab === 'placements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Placement Notices (Last 7 days)</h2>
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
                    <div
                      key={p.id || `${p.subject}-${idx}`}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {p.company || p.subject || 'Placement Notice'}
                          </h3>
                          {p.role && (
                            <p className="mt-0.5 text-sm text-gray-700">
                              Role: <span className="font-medium">{p.role}</span>
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-500">
                            {new Date(p.date).toLocaleString()}
                            {p.from && <> • From: {p.from.replace(/<.*?>/g, '').trim()}</>}
                          </p>
                        </div>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Details / Apply
                          </a>
                        )}
                      </div>

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

                     {Array.isArray(p.attachments) && p.attachments.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500">
                            Attachments: {p.attachments.map((a) => a.filename).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
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
