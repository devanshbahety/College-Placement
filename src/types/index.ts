export interface Job {
  id: string;
  title: string;
  company: string;
  logo?: string;
  description: string;
  eligibility: {
    branches: string[];
    minCGPA: number;
    maxBacklogs: number;
  };
  package: {
    ctc: number;
    stipend?: number;
    bond?: string;
  };
  deadline: Date;
  applicationLink: string;
  status: 'active' | 'closed' | 'upcoming';
  location: string;
  type: 'full-time' | 'internship';
  skills: string[];
  postedDate: Date;
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  phone: string;
  year: number;
  skills: string[];
  projects: string[];
  resumes: Resume[];
  applications: Application[];
}

export interface Resume {
  id: string;
  name: string;
  fileName: string;
  uploadDate: Date;
  skills: string[];
  projects: string[];
  experiences: string[];
  isRecommended?: boolean;
  matchScore?: number;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: 'pending' | 'applied' | 'shortlisted' | 'rejected' | 'selected';
  appliedDate: Date;
  resumeUsed: string;
  lastUpdated: Date;
}

export interface AdminStats {
  totalStudents: number;
  totalJobs: number;
  totalApplications: number;
  placementRate: number;
  avgPackage: number;
  branchWiseStats: Array<{
    branch: string;
    students: number;
    placed: number;
    avgPackage: number;
  }>;
  companyStats: Array<{
    company: string;
    jobsPosted: number;
    studentsHired: number;
    avgPackage: number;
  }>;
}

export interface EmailData {
  id: string;
  from: string;
  subject: string;
  content: string;
  parsedData?: {
    company?: string;
    role?: string;
    deadline?: Date;
    package?: number;
    eligibility?: string;
  };
  processed: boolean;
  processedDate?: Date;
}