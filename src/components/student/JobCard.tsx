import React, { useState } from 'react';
import { Job, Student } from '../../types';
import { Clock, MapPin, DollarSign, Users, ExternalLink, CheckCircle, AlertCircle, Star } from 'lucide-react';

type Resume = Student['resumes'][number];

interface JobCardProps {
  job: Partial<Job> & {
    subject?: string;
    link?: string;
    ctc?: string;   // e.g. "* ₹12.24 LPA"
    date?: string;
    from?: string;
  };
  student: Student;
  timeRemaining: string;
}

// Guess company from common subject formats like "Campus Details - Alstom ..."
function inferCompanyFromSubject(subject?: string): string {
  if (!subject) return '';
  const parts = subject.split('-').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const mid = parts[1];
    const m = mid.match(/[A-Z][A-Za-z0-9.&()/'\s]+/);
    return (m?.[0] || mid).trim();
  }
  const m = subject.match(/[A-Z][A-Za-z0-9.&()/'\s]+/);
  return (m?.[0] || '').trim();
}

function formatCtc(job: JobCardProps['job']): string {
  const numericCtc = (job as any)?.package?.ctc as number | undefined;
  if (typeof numericCtc === 'number' && numericCtc > 0) return `₹${(numericCtc / 100000).toFixed(1)}L`;
  const stipend = (job as any)?.package?.stipend as number | undefined;
  if (!numericCtc && stipend) return `₹${stipend}/month`;
  if (typeof job.ctc === 'string' && job.ctc.trim()) return job.ctc.trim();
  return '—';
}

const JobCard: React.FC<JobCardProps> = ({ job, student, timeRemaining }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [applying, setApplying] = useState(false);

  const title = (job as Job).title || job.subject || 'Placement Opportunity';
  const company = (job as Job).company || inferCompanyFromSubject(job.subject) || '';

  const hasEligibility = !!(job as Job).eligibility;
  const isEligible = hasEligibility
    ? (job as Job).eligibility!.branches.includes(student.branch) &&
      student.cgpa >= (job as Job).eligibility!.minCGPA &&
      student.backlogs <= (job as Job).eligibility!.maxBacklogs
    : true;

  const hasApplied =
    !!(job as Job).id &&
    student.applications.some(app => app.jobId === (job as Job).id);

  const jobSkills: string[] = Array.isArray((job as Job).skills) ? (job as Job).skills : [];

  function getRecommendedResume(): { resume: Resume | null; score: number } {
    if (!student.resumes || student.resumes.length === 0) {
      return { resume: null, score: 0 };
    }
    if (jobSkills.length === 0) {
      // No skills to compare; pick first purely for display
      return { resume: student.resumes[0], score: 0 };
    }

    let bestMatch: Resume = student.resumes[0];
    let maxScore = 0;

    student.resumes.forEach((resume: Resume) => {
      const matchingSkills = resume.skills.filter((skill: string) =>
        jobSkills.some((jobSkill: string) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );
      const score = (matchingSkills.length / jobSkills.length) * 100;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = resume;
      }
    });

    return { resume: bestMatch, score: Math.round(maxScore) };
  }

  const { resume: recommendedResume, score: matchScore } = getRecommendedResume();

  const handleApply = async () => {
    setApplying(true);
    setTimeout(() => {
      setApplying(false);
      const co = company || (job as Job).company || 'Company';
      const rn = recommendedResume?.name ?? 'your resume';
      alert(`Applied for ${title} at ${co} using ${rn}`);
    }, 1200);
  };

  const applicationHref = (job as Job).applicationLink || job.link || '#';
  const description = (job as Job).description || job.subject || 'No description available.';
  const type: 'full-time' | 'internship' | undefined = (job as Job).type as any;
  const location = (job as Job).location || '';
  const ctcDisplay = formatCtc(job);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {(job as Job).logo ? (
              <img
                src={(job as Job).logo!}
                alt={company || 'Company'}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">
                {company ? company[0]?.toUpperCase() : '•'}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {company && <p className="text-blue-600 font-medium">{company}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                timeRemaining === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              {timeRemaining}
            </span>

            {type && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  type === 'full-time' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}
              >
                {type === 'full-time' ? 'Full Time' : 'Internship'}
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>{ctcDisplay}</span>
          </div>

          {location ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Location N/A</span>
            </div>
          )}

          {hasEligibility ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{(job as Job).eligibility!.branches.join(', ')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>Eligibility N/A</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            {isEligible ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Eligible</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-medium">Not Eligible</span>
              </>
            )}
          </div>
        </div>

        {/* Resume Recommendation */}
        {isEligible && recommendedResume && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Recommended Resume</span>
              </div>
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                {matchScore}% match
              </span>
            </div>
            <p className="text-sm text-blue-700">{recommendedResume.name}</p>

            {jobSkills.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-blue-600 mb-1">Matching Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {jobSkills
                    .filter((skill: string) =>
                      recommendedResume.skills.some((resumeSkill: string) =>
                        resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(resumeSkill.toLowerCase())
                      )
                    )
                    .map((skill: string) => (
                      <span key={skill} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>

          <div className="flex items-center gap-3">
            {applicationHref && applicationHref !== '#' ? (
              <a
                href={applicationHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                External Link
              </a>
            ) : (
              <span className="flex items-center gap-1 text-gray-400 text-sm">
                <ExternalLink className="w-4 h-4" />
                No link
              </span>
            )}

            {isEligible && !hasApplied && (
              <button
                onClick={handleApply}
                disabled={applying || timeRemaining === 'Expired'}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Applying...
                  </div>
                ) : (
                  'Quick Apply'
                )}
              </button>
            )}

            {hasApplied && (
              <span className="px-6 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                Applied
              </span>
            )}
          </div>
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h4>
              {hasEligibility ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Branches:</span>
                    <p className="font-medium">{(job as Job).eligibility!.branches.join(', ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Min CGPA:</span>
                    <p className="font-medium">{(job as Job).eligibility!.minCGPA}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Backlogs:</span>
                    <p className="font-medium">{(job as Job).eligibility!.maxBacklogs}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Eligibility not specified.</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
              {jobSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        student.skills.includes(skill)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Skills not specified.</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">CTC:</span>
                  <p className="font-medium">
                    {(job as any)?.package?.ctc
                      ? `₹${(((job as any).package.ctc as number) / 100000).toFixed(1)} LPA`
                      : job.ctc && job.ctc.trim()
                      ? job.ctc.trim()
                      : 'Not specified'}
                  </p>
                </div>
                {(job as any)?.package?.stipend && (
                  <div>
                    <span className="text-gray-600">Stipend:</span>
                    <p className="font-medium">₹{(job as any).package.stipend}/month</p>
                  </div>
                )}
                {(job as any)?.package?.bond && (
                  <div>
                    <span className="text-gray-600">Bond:</span>
                    <p className="font-medium">{(job as any).package.bond}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
