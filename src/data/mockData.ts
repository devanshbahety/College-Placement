import { Job, Student, Application, AdminStats, EmailData } from '../types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Software Development Engineer',
    company: 'TechCorp',
    logo: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Join our dynamic team as a Software Development Engineer working on cutting-edge technologies.',
    eligibility: {
      branches: ['CSE', 'IT', 'ECE'],
      minCGPA: 7.0,
      maxBacklogs: 0
    },
    package: {
      ctc: 1200000,
      stipend: 25000
    },
    deadline: new Date('2024-02-15T23:59:59'),
    applicationLink: 'https://techcorp.com/careers',
    status: 'active',
    location: 'Bangalore',
    type: 'full-time',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    postedDate: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Data Science Intern',
    company: 'DataViz Analytics',
    logo: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Summer internship opportunity in data science and machine learning.',
    eligibility: {
      branches: ['CSE', 'IT', 'EEE', 'ECE'],
      minCGPA: 6.5,
      maxBacklogs: 1
    },
    package: {
      ctc: 0,
      stipend: 35000
    },
    deadline: new Date('2024-02-20T23:59:59'),
    applicationLink: 'https://dataviz.com/internships',
    status: 'active',
    location: 'Remote',
    type: 'internship',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    postedDate: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'WebSolutions',
    logo: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Create stunning user interfaces and exceptional user experiences.',
    eligibility: {
      branches: ['CSE', 'IT'],
      minCGPA: 6.0,
      maxBacklogs: 2
    },
    package: {
      ctc: 800000
    },
    deadline: new Date('2024-02-10T23:59:59'),
    applicationLink: 'https://websolutions.com/jobs',
    status: 'active',
    location: 'Hyderabad',
    type: 'full-time',
    skills: ['React', 'Vue.js', 'CSS', 'TypeScript'],
    postedDate: new Date('2024-01-10')
  },
  {
    id: '4',
    title: 'Cloud Engineer',
    company: 'CloudTech',
    logo: 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    description: 'Design and maintain scalable cloud infrastructure.',
    eligibility: {
      branches: ['CSE', 'IT', 'ECE'],
      minCGPA: 7.5,
      maxBacklogs: 0
    },
    package: {
      ctc: 1500000,
      bond: '2 years'
    },
    deadline: new Date('2024-02-25T23:59:59'),
    applicationLink: 'https://cloudtech.com/careers',
    status: 'upcoming',
    location: 'Pune',
    type: 'full-time',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
    postedDate: new Date('2024-01-20')
  }
];

export const mockStudent: Student = {
  id: 'student1',
  name: 'Rahul Sharma',
  rollNo: '20CS001',
  email: 'rahul.sharma@student.edu',
  branch: 'CSE',
  cgpa: 8.2,
  backlogs: 0,
  phone: '+91 9876543210',
  year: 4,
  skills: ['JavaScript', 'React', 'Python', 'SQL', 'Node.js'],
  projects: ['E-commerce Platform', 'Chat Application', 'Task Manager'],
  resumes: [
    {
      id: 'resume1',
      name: 'Full Stack Resume',
      fileName: 'rahul_fullstack_resume.pdf',
      uploadDate: new Date('2024-01-01'),
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
      projects: ['E-commerce Platform', 'Chat Application'],
      experiences: ['Intern at TechStart', 'Freelance Developer']
    },
    {
      id: 'resume2',
      name: 'Python Developer Resume',
      fileName: 'rahul_python_resume.pdf',
      uploadDate: new Date('2024-01-05'),
      skills: ['Python', 'Django', 'SQL', 'Machine Learning'],
      projects: ['Task Manager', 'Data Analysis Tool'],
      experiences: ['Python Developer Intern']
    }
  ],
  applications: [
    {
      id: 'app1',
      jobId: '1',
      studentId: 'student1',
      status: 'shortlisted',
      appliedDate: new Date('2024-01-16'),
      resumeUsed: 'resume1',
      lastUpdated: new Date('2024-01-20')
    },
    {
      id: 'app2',
      jobId: '2',
      studentId: 'student1',
      status: 'applied',
      appliedDate: new Date('2024-01-19'),
      resumeUsed: 'resume2',
      lastUpdated: new Date('2024-01-19')
    }
  ]
};

export const mockAdminStats: AdminStats = {
  totalStudents: 450,
  totalJobs: 25,
  totalApplications: 1200,
  placementRate: 78.5,
  avgPackage: 950000,
  branchWiseStats: [
    { branch: 'CSE', students: 120, placed: 98, avgPackage: 1100000 },
    { branch: 'IT', students: 80, placed: 68, avgPackage: 950000 },
    { branch: 'ECE', students: 100, placed: 72, avgPackage: 850000 },
    { branch: 'EEE', students: 90, placed: 65, avgPackage: 800000 },
    { branch: 'MECH', students: 60, placed: 40, avgPackage: 700000 }
  ],
  companyStats: [
    { company: 'TechCorp', jobsPosted: 3, studentsHired: 15, avgPackage: 1200000 },
    { company: 'DataViz Analytics', jobsPosted: 2, studentsHired: 8, avgPackage: 900000 },
    { company: 'WebSolutions', jobsPosted: 2, studentsHired: 12, avgPackage: 800000 },
    { company: 'CloudTech', jobsPosted: 1, studentsHired: 5, avgPackage: 1500000 }
  ]
};

export const mockEmails: EmailData[] = [
  {
    id: 'email1',
    from: 'hr@microsoft.com',
    subject: 'Campus Recruitment Drive 2024 - Microsoft',
    content: `Dear Placement Officer,

Microsoft is conducting campus recruitment for Software Engineer positions.

Position: Software Development Engineer
Package: ₹18 LPA
Eligibility: CSE/IT/ECE with CGPA >= 7.0, No backlogs
Deadline: March 1, 2024
Application Link: https://microsoft.com/campus2024

Best regards,
Microsoft HR Team`,
    parsedData: {
      company: 'Microsoft',
      role: 'Software Development Engineer',
      deadline: new Date('2024-03-01'),
      package: 1800000,
      eligibility: 'CSE/IT/ECE with CGPA >= 7.0, No backlogs'
    },
    processed: true,
    processedDate: new Date('2024-01-22')
  },
  {
    id: 'email2',
    from: 'careers@google.com',
    subject: 'Google Summer Internship Program 2024',
    content: `Hello,

Google is offering summer internship opportunities for exceptional students.

Role: Software Engineering Intern
Stipend: ₹80,000/month
Duration: 10-12 weeks
Eligibility: All branches, CGPA >= 8.0
Apply by: February 28, 2024
Portal: https://google.com/students/internships

Regards,
Google Recruitment Team`,
    processed: false
  }
];