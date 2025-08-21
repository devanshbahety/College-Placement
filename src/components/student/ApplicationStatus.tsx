import React from 'react';
import { Application, Job } from '../../types';
import { Clock, CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';

interface ApplicationStatusProps {
  applications: Application[];
  jobs: Job[];
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ applications, jobs }) => {
  const getJobDetails = (jobId: string) => {
    return jobs.find(job => job.id === jobId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'selected':
        return <Trophy className="w-5 h-5 text-gold-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'selected':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
        <p className="text-sm text-gray-600">{applications.length} total applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600">Start applying to jobs that match your profile!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const job = getJobDetails(application.jobId);
            
            if (!job) return null;

            return (
              <div key={application.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
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
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-blue-600 font-medium">{job.company}</p>
                      <p className="text-sm text-gray-600">{job.location}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(application.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {formatStatus(application.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Applied: {application.appliedDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Package</p>
                    <p className="font-medium">
                      {job.package.ctc > 0 
                        ? `₹${(job.package.ctc / 100000).toFixed(1)}L`
                        : `₹${job.package.stipend}/month`
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Resume Used</p>
                    <p className="font-medium">
                      {application.resumeUsed === 'resume1' ? 'Full Stack Resume' : 'Python Developer Resume'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">{application.lastUpdated.toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Timeline/Progress */}
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Applied</p>
                        <p className="text-xs text-gray-600">{application.appliedDate.toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className={`flex-1 h-0.5 mx-4 ${
                      ['shortlisted', 'selected'].includes(application.status) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>

                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['shortlisted', 'selected'].includes(application.status) 
                          ? 'bg-green-500' 
                          : application.status === 'rejected'
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }`}>
                        {['shortlisted', 'selected'].includes(application.status) ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : application.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Review</p>
                        <p className="text-xs text-gray-600">
                          {['shortlisted', 'selected', 'rejected'].includes(application.status) 
                            ? application.lastUpdated.toLocaleDateString()
                            : 'Pending'
                          }
                        </p>
                      </div>
                    </div>

                    <div className={`flex-1 h-0.5 mx-4 ${
                      application.status === 'selected' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>

                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        application.status === 'selected' ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Selected</p>
                        <p className="text-xs text-gray-600">
                          {application.status === 'selected' ? application.lastUpdated.toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatus;