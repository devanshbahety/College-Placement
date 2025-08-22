// src/components/student/ApplicationStatus.tsx
import React, { useEffect, useState } from 'react';
import { Application, Job } from '../../types';
import { Clock } from 'lucide-react';

interface ApplicationStatusProps {
  applications: Application[]; // kept for compatibility (unused)
  jobs: Job[];
}

type AppliedPlacementLite = {
  key: string;     // storage key (id or subject|date)
  subject: string; // parsed subject (or key fallback)
  date?: Date;     // parsed from key when possible
  job?: Job | null;
};

const STORAGE_KEY = 'appliedPlacements';

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applications: _unused, jobs }) => {
  const [appliedFromPlacements, setAppliedFromPlacements] = useState<AppliedPlacementLite[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setAppliedFromPlacements([]);
        return;
      }
      const map = JSON.parse(raw) as Record<string, boolean>;
      const keys = Object.entries(map)
        .filter(([, v]) => !!v)
        .map(([k]) => k);

      const items: AppliedPlacementLite[] = keys.map((k) => {
        let subject = k;
        let date: Date | undefined;
        if (k.includes('|')) {
          const [s, d] = k.split('|');
          subject = s;
          const parsed = new Date(d);
          if (!Number.isNaN(parsed.getTime())) date = parsed;
        }

        const sLc = subject.toLowerCase();
        const matched =
          jobs.find(j => j.company && sLc.includes(j.company.toLowerCase())) ||
          jobs.find(j => j.title && sLc.includes(j.title.toLowerCase())) ||
          null;

        return { key: k, subject, date, job: matched };
      });

      setAppliedFromPlacements(items);
    } catch {
      setAppliedFromPlacements([]);
    }
  }, [jobs]);

  const totalMarkedFromPlacements = appliedFromPlacements.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Marked from Placement Notices</h2>
        <p className="text-sm text-gray-600">{totalMarkedFromPlacements} marked</p>
      </div>

      {appliedFromPlacements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Nothing marked as applied from placement notices yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appliedFromPlacements.map((ap) => {
            const job = ap.job;
            return (
              <div key={ap.key} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-md font-semibold text-gray-900">
                      {job?.title || ap.subject}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {job?.company || 'Placement Notice'}
                    </p>
                    {job?.location && <p className="text-sm text-gray-600">{job.location}</p>}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Applied
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {ap.date ? `Applied: ${ap.date.toLocaleDateString()}` : 'Applied: —'}
                    </p>
                  </div>
                </div>

                {job && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Package</p>
                      <p className="font-medium">
                        {job.package?.ctc && job.package.ctc > 0
                          ? `₹${(job.package.ctc / 100000).toFixed(1)}L`
                          : job.package?.stipend
                          ? `₹${job.package.stipend}/month`
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium">{job.type || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-medium">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;
