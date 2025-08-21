import React, { useState } from 'react';
import { mockAdminStats, mockEmails, mockJobs } from '../../data/mockData';
import { AdminStats } from '../../types';
import { Users, Briefcase, FileText, TrendingUp, Mail, Settings } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import EmailParser from './EmailParser';
import JobManagement from './JobManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'jobs' | 'emails' | 'students'>('overview');
  const [stats] = useState<AdminStats>(mockAdminStats);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Administration</h1>
          <p className="text-gray-600">Manage placements, track progress, and analyze trends</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalJobs}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalApplications}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Placement Rate</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.placementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'analytics', label: 'Analytics', icon: Users },
              { id: 'jobs', label: 'Job Management', icon: Briefcase },
              { id: 'emails', label: 'Email Parser', icon: Mail },
              { id: 'students', label: 'Student Management', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Placement Overview</h2>
                
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h3>
                    <div className="space-y-3">
                      {stats.branchWiseStats.map((branch) => (
                        <div key={branch.branch} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{branch.branch}</span>
                            <p className="text-sm text-gray-600">
                              {branch.placed}/{branch.students} placed
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-blue-600">
                              {((branch.placed / branch.students) * 100).toFixed(1)}%
                            </span>
                            <p className="text-xs text-gray-600">
                              ₹{(branch.avgPackage / 100000).toFixed(1)}L avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recruiters</h3>
                    <div className="space-y-3">
                      {stats.companyStats.map((company) => (
                        <div key={company.company} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{company.company}</span>
                            <p className="text-sm text-gray-600">
                              {company.studentsHired} hired
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-green-600">
                              {company.jobsPosted} jobs
                            </span>
                            <p className="text-xs text-gray-600">
                              ₹{(company.avgPackage / 100000).toFixed(1)}L avg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard stats={stats} />}
            {activeTab === 'jobs' && <JobManagement jobs={mockJobs} />}
            {activeTab === 'emails' && <EmailParser emails={mockEmails} />}
            
            {activeTab === 'students' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Student Management</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">Student management features coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;