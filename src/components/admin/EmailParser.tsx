import React, { useState } from 'react';
import { EmailData } from '../../types';
import { Mail, Calendar, DollarSign, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface EmailParserProps {
  emails: EmailData[];
}

const EmailParser: React.FC<EmailParserProps> = ({ emails }) => {
  const [parsing, setParsing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);

  const handleParseEmail = async (email: EmailData) => {
    setParsing(true);
    setSelectedEmail(email);
    
    // Simulate AI parsing
    setTimeout(() => {
      setParsing(false);
      // In a real app, this would update the email with parsed data
      alert('Email parsed successfully! Job details extracted.');
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(1)}L`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Parser & Job Extractor</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          {emails.length} emails
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">AI-Powered Email Parsing</h3>
        <p className="text-blue-700 text-sm">
          Our system automatically extracts job details from recruitment emails including company names, 
          roles, packages, eligibility criteria, and deadlines using advanced NLP processing.
        </p>
      </div>

      <div className="grid gap-6">
        {emails.map((email) => (
          <div key={email.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    email.processed ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Mail className={`w-6 h-6 ${
                      email.processed ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{email.subject}</h3>
                    <p className="text-sm text-gray-600">From: {email.from}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    email.processed 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {email.processed ? (
                      <>
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Processed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 inline mr-1" />
                        Pending
                      </>
                    )}
                  </span>

                  {!email.processed && (
                    <button
                      onClick={() => handleParseEmail(email)}
                      disabled={parsing && selectedEmail?.id === email.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
                    >
                      {parsing && selectedEmail?.id === email.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Parse Email
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Email Content Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Email Content</h4>
                <div className="text-sm text-gray-700 whitespace-pre-line max-h-32 overflow-y-auto">
                  {email.content}
                </div>
              </div>

              {/* Parsed Data */}
              {email.parsedData && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Extracted Job Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Company</span>
                      </div>
                      <p className="text-blue-800 font-semibold">{email.parsedData.company}</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Role</span>
                      </div>
                      <p className="text-green-800 font-semibold">{email.parsedData.role}</p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Package</span>
                      </div>
                      <p className="text-purple-800 font-semibold">
                        {email.parsedData.package ? formatCurrency(email.parsedData.package) : 'Not specified'}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Deadline</span>
                      </div>
                      <p className="text-orange-800 font-semibold">
                        {email.parsedData.deadline ? email.parsedData.deadline.toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {email.parsedData.eligibility && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Eligibility Criteria</h5>
                      <p className="text-sm text-gray-700">{email.parsedData.eligibility}</p>
                    </div>
                  )}

                  {email.processedDate && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3" />
                      Processed on {email.processedDate.toLocaleDateString()} at {email.processedDate.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{emails.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total Emails</h3>
          <p className="text-sm text-gray-600">Received this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {emails.filter(e => e.processed).length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Processed</h3>
          <p className="text-sm text-gray-600">Successfully parsed</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">
              {emails.filter(e => !e.processed).length}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">Pending</h3>
          <p className="text-sm text-gray-600">Awaiting processing</p>
        </div>
      </div>
    </div>
  );
};

export default EmailParser;