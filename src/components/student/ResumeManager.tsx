import React, { useState } from 'react';
import { Student, Resume } from '../../types';
import { FileText, Upload, Download, Star, Calendar, CheckCircle } from 'lucide-react';

interface ResumeManagerProps {
  student: Student;
}

const ResumeManager: React.FC<ResumeManagerProps> = ({ student }) => {
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleResumeUpload = async () => {
    setUploadingResume(true);
    
    // Simulate file upload
    setTimeout(() => {
      setUploadingResume(false);
      alert('Resume uploaded successfully!');
    }, 2000);
  };

  const getSkillMatchColor = (skill: string, hasSkill: boolean) => {
    return hasSkill ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Resume Manager</h2>
        <button
          onClick={handleResumeUpload}
          disabled={uploadingResume}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
        >
          {uploadingResume ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Resume
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6">
        {student.resumes.map((resume) => (
          <div key={resume.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {resume.name}
                    {resume.isRecommended && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{resume.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Uploaded {resume.uploadDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {resume.matchScore && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {resume.matchScore}% match
                  </span>
                )}
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Skills ({resume.skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        getSkillMatchColor(skill, student.skills.includes(skill))
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  Projects ({resume.projects.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resume.projects.map((project) => (
                    <span 
                      key={project} 
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-500" />
                  Experience ({resume.experiences.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resume.experiences.map((experience) => (
                    <span 
                      key={experience} 
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                    >
                      {experience}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Resume Analytics */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{resume.skills.length}</p>
                  <p className="text-gray-600">Skills Listed</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{resume.projects.length}</p>
                  <p className="text-gray-600">Projects</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{resume.experiences.length}</p>
                  <p className="text-gray-600">Experiences</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resume Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Resume Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Optimization Tips:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Tailor your resume for each job application</li>
              <li>• Include relevant keywords from job descriptions</li>
              <li>• Quantify your achievements with numbers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">AI Recommendations:</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Our system analyzes job requirements automatically</li>
              <li>• Get personalized resume suggestions for each role</li>
              <li>• Track which skills are in high demand</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;