import React, { useState } from 'react';
import { Job } from '../../types';
import { Plus, Edit, Eye, Calendar, MapPin, DollarSign, Users, Clock, Search } from 'lucide-react';

interface JobManagementProps {
  jobs: Job[];
}

const JobManagement: React.FC<JobManagementProps> = ({ jobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d remaining`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Job Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all">
          <Plus className="w-4 h-4" />
          Add New Job
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Jobs</span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Active Jobs</span>
            <Clock className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.status === 'active').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Upcoming Jobs</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {jobs.filter(j => j.status === 'upcoming').length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Avg Package</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            ₹{(jobs.reduce((acc, job) => acc + job.package.ctc, 0) / jobs.length / 100000).toFixed(1)}L
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
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
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {getTimeRemaining(job.deadline)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.package.ctc > 0 
                        ? `₹${(job.package.ctc / 100000).toFixed(1)}L`
                        : `₹${job.package.stipend}/month`
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.type === 'full-time' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {job.type === 'full-time' ? 'Full Time' : 'Internship'}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                <div className="flex flex-wrap gap-1">
                  {job.eligibility.branches.map(branch => (
                    <span key={branch} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {branch}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Min CGPA: {job.eligibility.minCGPA}, Max Backlogs: {job.eligibility.maxBacklogs}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{job.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
                <div className="text-sm text-gray-600">
                  {job.package.ctc > 0 && (
                    <p>CTC: ₹{(job.package.ctc / 100000).toFixed(1)}L</p>
                  )}
                  {job.package.stipend && (
                    <p>Stipend: ₹{job.package.stipend}/month</p>
                  )}
                  {job.package.bond && (
                    <p>Bond: {job.package.bond}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Posted on {job.postedDate.toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add new jobs.</p>
        </div>
      )}
    </div>
  );
};

export default JobManagement;