import React, { useState, useEffect } from 'react';
import { mockJobs, mockStudent } from '../../data/mockData';
import { Job, Application } from '../../types';
import { Clock, MapPin, DollarSign, Users, TrendingUp, Calendar, Target } from 'lucide-react';
import JobCard from './JobCard';
import ApplicationStatus from './ApplicationStatus';
import ResumeManager from './ResumeManager';

const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'resumes'>('jobs');
  const [jobs] = useState<Job[]>(mockJobs);
  const [student] = useState(mockStudent);

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
          <div className="flex border-b border-gray-200">
            {[
              { id: 'jobs', label: 'Available Jobs', count: eligibleJobs.length },
              { id: 'applications', label: 'My Applications', count: appliedJobs },
              { id: 'resumes', label: 'Resume Manager', count: student.resumes.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-6">
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

            {activeTab === 'applications' && (
              <ApplicationStatus applications={student.applications} jobs={jobs} />
            )}

            {activeTab === 'resumes' && (
              <ResumeManager student={student} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;