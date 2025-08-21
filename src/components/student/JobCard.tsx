import React, { useState } from 'react';
import { Job, Student } from '../../types';
import { Clock, MapPin, DollarSign, Users, ExternalLink, CheckCircle, AlertCircle, Star } from 'lucide-react';

interface JobCardProps {
  job: Job;
  student: Student;
  timeRemaining: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, student, timeRemaining }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [applying, setApplying] = useState(false);

  const isEligible = job.eligibility.branches.includes(student.branch) &&
    student.cgpa >= job.eligibility.minCGPA &&
    student.backlogs <= job.eligibility.maxBacklogs;

  const hasApplied = student.applications.some(app => app.jobId === job.id);

  const getRecommendedResume = () => {
    const jobSkills = job.skills;
    let bestMatch = student.resumes[0];
    let maxScore = 0;

    student.resumes.forEach(resume => {
      const matchingSkills = resume.skills.filter(skill => 
        jobSkills.some(jobSkill => 
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
  };

  const { resume: recommendedResume, score: matchScore } = getRecommendedResume();

  const handleApply = async () => {
    setApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      setApplying(false);
      // In a real app, this would update the student's applications
      alert(`Applied for ${job.title} at ${job.company} using ${recommendedResume.name}`);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {job.logo && (
              <img 
                src={job.logo} 
                alt={job.company}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
              <p className="text-blue-600 font-medium">{job.company}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              timeRemaining === 'Expired' 
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
            }`}>
              <Clock className="w-3 h-3 inline mr-1" />
              {timeRemaining}
            </span>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.type === 'full-time' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {job.type === 'full-time' ? 'Full Time' : 'Internship'}
            </span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>
              {job.package.ctc > 0 
                ? `₹${(job.package.ctc / 100000).toFixed(1)}L`
                : `₹${job.package.stipend}/month`
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{job.eligibility.branches.join(', ')}</span>
          </div>

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
        {isEligible && (
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
            
            <div className="mt-2">
              <p className="text-xs text-blue-600 mb-1">Matching Skills:</p>
              <div className="flex flex-wrap gap-1">
                {job.skills.filter(skill => 
                  recommendedResume.skills.some(resumeSkill => 
                    resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
                    skill.toLowerCase().includes(resumeSkill.toLowerCase())
                  )
                ).map(skill => (
                  <span key={skill} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
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
            <a
              href={job.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              External Link
            </a>

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Branches:</span>
                  <p className="font-medium">{job.eligibility.branches.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Min CGPA:</span>
                  <p className="font-medium">{job.eligibility.minCGPA}</p>
                </div>
                <div>
                  <span className="text-gray-600">Max Backlogs:</span>
                  <p className="font-medium">{job.eligibility.maxBacklogs}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
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
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">CTC:</span>
                  <p className="font-medium">
                    {job.package.ctc > 0 ? `₹${(job.package.ctc / 100000).toFixed(1)} LPA` : 'Not specified'}
                  </p>
                </div>
                {job.package.stipend && (
                  <div>
                    <span className="text-gray-600">Stipend:</span>
                    <p className="font-medium">₹{job.package.stipend}/month</p>
                  </div>
                )}
                {job.package.bond && (
                  <div>
                    <span className="text-gray-600">Bond:</span>
                    <p className="font-medium">{job.package.bond}</p>
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