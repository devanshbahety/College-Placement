import React from 'react';
import { AdminStats } from '../../types';
import { TrendingUp, Users, DollarSign, Building } from 'lucide-react';

interface AnalyticsDashboardProps {
  stats: AdminStats;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  const getPlacementRate = (placed: number, total: number) => {
    return ((placed / total) * 100).toFixed(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Placement Analytics</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          Academic Year 2023-24
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.placementRate}%</span>
          </div>
          <h3 className="font-semibold">Overall Placement Rate</h3>
          <p className="text-blue-100 text-sm mt-1">
            {stats.branchWiseStats.reduce((acc, branch) => acc + branch.placed, 0)} out of {stats.totalStudents} students
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(stats.avgPackage)}</span>
          </div>
          <h3 className="font-semibold">Average Package</h3>
          <p className="text-green-100 text-sm mt-1">Across all branches</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Building className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.companyStats.length}</span>
          </div>
          <h3 className="font-semibold">Partner Companies</h3>
          <p className="text-purple-100 text-sm mt-1">Active recruiters</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{formatCurrency(Math.max(...stats.companyStats.map(c => c.avgPackage)))}</span>
          </div>
          <h3 className="font-semibold">Highest Package</h3>
          <p className="text-orange-100 text-sm mt-1">This academic year</p>
        </div>
      </div>

      {/* Branch Performance Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Branch-wise Performance</h3>
        <div className="space-y-4">
          {stats.branchWiseStats.map((branch) => {
            const placementRate = (branch.placed / branch.students) * 100;
            return (
              <div key={branch.branch} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{branch.branch}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      ({branch.placed}/{branch.students} students)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{placementRate.toFixed(1)}%</span>
                    <div className="text-sm text-gray-600">{formatCurrency(branch.avgPackage)} avg</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      placementRate >= 80 ? 'bg-green-500' :
                      placementRate >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${placementRate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Company Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Recruiters by Hiring</h3>
          <div className="space-y-4">
            {stats.companyStats
              .sort((a, b) => b.studentsHired - a.studentsHired)
              .map((company, index) => (
                <div key={company.company} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{company.company}</p>
                      <p className="text-sm text-gray-600">{company.jobsPosted} job postings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{company.studentsHired} hired</p>
                    <p className="text-sm text-gray-600">{formatCurrency(company.avgPackage)} avg</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Package Distribution</h3>
          <div className="space-y-4">
            {[
              { range: '15+ LPA', count: 15, color: 'bg-green-500' },
              { range: '10-15 LPA', count: 45, color: 'bg-blue-500' },
              { range: '7-10 LPA', count: 78, color: 'bg-yellow-500' },
              { range: '5-7 LPA', count: 124, color: 'bg-orange-500' },
              { range: '3-5 LPA', count: 89, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.range} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{item.range}</span>
                  <span className="text-sm text-gray-600">{item.count} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${(item.count / 351) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Monthly Placement Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">+23%</div>
            <div className="text-sm text-gray-600">Applications vs Last Year</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">+18%</div>
            <div className="text-sm text-gray-600">Placement Rate Improvement</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">+35%</div>
            <div className="text-sm text-gray-600">Average Package Growth</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;