// src/databaseService.ts

import { v4 as uuidv4 } from 'uuid';

// ===== DUMMY DATA STRUCTURES =====

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  education?: string[];
  currentCompany?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  createdAt: Date;
  isArchived: boolean;
  matchScore?: number;
  status:
    | 'active'
    | 'contacted'
    | 'interviewed'
    | 'hired'
    | 'rejected'
    | 'archived';
  resumeUrl?: string;
  notes?: string;
  stage?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  status: 'draft' | 'active' | 'closed';
  applications: number;
  createdAt: Date;
  skills: string[];
}

interface Analytics {
  totalCandidates: number;
  totalJobs: number;
  totalCampaigns: number;
  responseRate: string;
  timeToHire: number;
  costPerHire: number;
  qualityOfHire: number;
  candidateSources: { source: string; count: number }[];
  topSkills: { skill: string; count: number }[];
  hiringFunnel: { stage: string; count: number }[];
  monthlyHires: { month: string; count: number }[];
}

// ===== DUMMY DATA =====

// Dummy candidates data
const dummyCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    title: 'Senior Software Engineer',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
    experience: '5 years',
    location: 'San Francisco, CA',
    matchScore: 95,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    isArchived: false,
    resumeUrl: '/resumes/sarah-johnson.pdf',
    notes: 'Strong React experience, excellent communication skills',
    stage: 'Interviews',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    title: 'Full Stack Developer',
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'Docker'],
    experience: '3 years',
    location: 'New York, NY',
    matchScore: 88,
    status: 'active',
    createdAt: new Date('2024-01-20'),
    isArchived: false,
    resumeUrl: '/resumes/michael-chen.pdf',
    notes: 'Good Python skills, needs improvement in React',
    stage: 'Screening',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    title: 'Frontend Developer',
    skills: ['JavaScript', 'Vue.js', 'CSS', 'HTML', 'Webpack'],
    experience: '4 years',
    location: 'Austin, TX',
    matchScore: 92,
    status: 'active',
    createdAt: new Date('2024-01-25'),
    isArchived: false,
    resumeUrl: '/resumes/emily-rodriguez.pdf',
    notes: 'Excellent Vue.js skills, great UI/UX sense',
    stage: 'Finalists',
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    title: 'DevOps Engineer',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins'],
    experience: '6 years',
    location: 'Seattle, WA',
    matchScore: 87,
    status: 'active',
    createdAt: new Date('2024-01-30'),
    isArchived: false,
    resumeUrl: '/resumes/david-kim.pdf',
    notes: 'Strong DevOps background, AWS certified',
    stage: 'Offers',
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 567-8901',
    title: 'Backend Engineer',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Kafka'],
    experience: '4 years',
    location: 'Boston, MA',
    matchScore: 90,
    status: 'active',
    createdAt: new Date('2024-02-05'),
    isArchived: false,
    resumeUrl: '/resumes/lisa-wang.pdf',
    notes: 'Solid Java skills, good system design knowledge',
    stage: 'Hires',
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 (555) 678-9012',
    title: 'Data Scientist',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL'],
    experience: '3 years',
    location: 'Chicago, IL',
    matchScore: 85,
    status: 'active',
    createdAt: new Date('2024-02-10'),
    isArchived: false,
    resumeUrl: '/resumes/james-wilson.pdf',
    notes: 'Good ML skills, needs more production experience',
    stage: 'Applications',
  },
  {
    id: '7',
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+1 (555) 789-0123',
    title: 'Mobile Developer',
    skills: ['Swift', 'iOS', 'React Native', 'Firebase', 'Git'],
    experience: '5 years',
    location: 'Miami, FL',
    matchScore: 93,
    status: 'active',
    createdAt: new Date('2024-02-15'),
    isArchived: false,
    resumeUrl: '/resumes/maria-garcia.pdf',
    notes: 'Excellent iOS skills, good React Native experience',
    stage: 'Interviews',
  },
  {
    id: '8',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    phone: '+1 (555) 890-1234',
    title: 'QA Engineer',
    skills: ['Selenium', 'Jest', 'Cypress', 'Postman', 'JIRA'],
    experience: '4 years',
    location: 'Denver, CO',
    matchScore: 82,
    status: 'active',
    createdAt: new Date('2024-02-20'),
    isArchived: false,
    resumeUrl: '/resumes/robert-taylor.pdf',
    notes: 'Good testing skills, needs automation experience',
    stage: 'Screening',
  },
];

// Dummy jobs data
const dummyJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120,000 - $150,000',
    description:
      'We are looking for a Senior Frontend Developer to join our team...',
    requirements: ['React', 'TypeScript', '5+ years experience', 'CSS/SCSS'],
    status: 'active',
    createdAt: new Date('2024-01-10'),
    applications: 45,
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'HTML'],
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'StartupXYZ',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$100,000 - $130,000',
    description: 'Join our fast-growing startup as a Backend Engineer...',
    requirements: ['Node.js', 'MongoDB', '3+ years experience', 'REST APIs'],
    status: 'active',
    createdAt: new Date('2024-01-15'),
    applications: 32,
    skills: ['Node.js', 'MongoDB', 'Express', 'REST APIs', 'JavaScript'],
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    company: 'Enterprise Solutions',
    location: 'Seattle, WA',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    description:
      'We need a DevOps Engineer to help us scale our infrastructure...',
    requirements: ['AWS', 'Docker', 'Kubernetes', '4+ years experience'],
    status: 'active',
    createdAt: new Date('2024-01-20'),
    applications: 28,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins'],
  },
];

// Dummy analytics data
const dummyAnalytics: Analytics = {
  totalCandidates: 247,
  totalJobs: 34,
  totalCampaigns: 156,
  responseRate: '78.3%',
  timeToHire: 32,
  costPerHire: 5200,
  qualityOfHire: 4.1,
  candidateSources: [
    { source: 'LinkedIn', count: 89 },
    { source: 'Indeed', count: 67 },
    { source: 'Referrals', count: 45 },
    { source: 'Company Website', count: 34 },
    { source: 'Glassdoor', count: 12 },
  ],
  topSkills: [
    { skill: 'JavaScript', count: 156 },
    { skill: 'React', count: 134 },
    { skill: 'Python', count: 98 },
    { skill: 'Node.js', count: 87 },
    { skill: 'SQL', count: 76 },
    { skill: 'AWS', count: 65 },
    { skill: 'Docker', count: 42 },
    { skill: 'TypeScript', count: 38 },
    { skill: 'Kubernetes', count: 31 },
    { skill: 'GraphQL', count: 28 },
  ],
  hiringFunnel: [
    { stage: 'Applications', count: 247 },
    { stage: 'Screening', count: 156 },
    { stage: 'Interviews', count: 89 },
    { stage: 'Finalists', count: 34 },
    { stage: 'Offers', count: 23 },
    { stage: 'Hires', count: 18 },
  ],
  monthlyHires: [
    { month: 'Jan', count: 4 },
    { month: 'Feb', count: 6 },
    { month: 'Mar', count: 5 },
    { month: 'Apr', count: 8 },
    { month: 'May', count: 9 },
    { month: 'Jun', count: 7 },
    { month: 'Jul', count: 11 },
    { month: 'Aug', count: 8 },
    { month: 'Sep', count: 10 },
    { month: 'Oct', count: 12 },
    { month: 'Nov', count: 9 },
    { month: 'Dec', count: 6 },
  ],
};

// Stage performance over time data
const stagePerformanceOverTime = {
  Applications: [
    { week: 'Week 1', candidates: 45, conversions: 28, avgTime: 2.1 },
    { week: 'Week 2', candidates: 52, conversions: 33, avgTime: 2.3 },
    { week: 'Week 3', candidates: 38, conversions: 24, avgTime: 2.7 },
    { week: 'Week 4', candidates: 61, conversions: 39, avgTime: 2.4 },
    { week: 'Week 5', candidates: 47, conversions: 30, avgTime: 2.6 },
    { week: 'Week 6', candidates: 55, conversions: 35, avgTime: 2.2 },
  ],
  Screening: [
    { week: 'Week 1', candidates: 28, conversions: 16, avgTime: 3.0 },
    { week: 'Week 2', candidates: 33, conversions: 19, avgTime: 3.2 },
    { week: 'Week 3', candidates: 24, conversions: 14, avgTime: 3.5 },
    { week: 'Week 4', candidates: 39, conversions: 22, avgTime: 3.1 },
    { week: 'Week 5', candidates: 30, conversions: 17, avgTime: 3.3 },
    { week: 'Week 6', candidates: 35, conversions: 20, avgTime: 3.0 },
  ],
  Interviews: [
    { week: 'Week 1', candidates: 16, conversions: 6, avgTime: 5.5 },
    { week: 'Week 2', candidates: 19, conversions: 7, avgTime: 5.8 },
    { week: 'Week 3', candidates: 14, conversions: 5, avgTime: 6.2 },
    { week: 'Week 4', candidates: 22, conversions: 8, avgTime: 5.9 },
    { week: 'Week 5', candidates: 17, conversions: 6, avgTime: 6.1 },
    { week: 'Week 6', candidates: 20, conversions: 8, avgTime: 5.7 },
  ],
  Finalists: [
    { week: 'Week 1', candidates: 6, conversions: 4, avgTime: 4.0 },
    { week: 'Week 2', candidates: 7, conversions: 5, avgTime: 4.2 },
    { week: 'Week 3', candidates: 5, conversions: 3, avgTime: 4.5 },
    { week: 'Week 4', candidates: 8, conversions: 6, avgTime: 4.1 },
    { week: 'Week 5', candidates: 6, conversions: 4, avgTime: 4.3 },
    { week: 'Week 6', candidates: 8, conversions: 5, avgTime: 4.0 },
  ],
  Offers: [
    { week: 'Week 1', candidates: 4, conversions: 3, avgTime: 2.5 },
    { week: 'Week 2', candidates: 5, conversions: 4, avgTime: 2.8 },
    { week: 'Week 3', candidates: 3, conversions: 2, avgTime: 3.0 },
    { week: 'Week 4', candidates: 6, conversions: 5, avgTime: 2.7 },
    { week: 'Week 5', candidates: 4, conversions: 3, avgTime: 2.9 },
    { week: 'Week 6', candidates: 5, conversions: 4, avgTime: 2.6 },
  ],
  Hires: [
    { week: 'Week 1', candidates: 3, conversions: 3, avgTime: 1.5 },
    { week: 'Week 2', candidates: 4, conversions: 4, avgTime: 1.6 },
    { week: 'Week 3', candidates: 2, conversions: 2, avgTime: 1.4 },
    { week: 'Week 4', candidates: 5, conversions: 5, avgTime: 1.5 },
    { week: 'Week 5', candidates: 3, conversions: 3, avgTime: 1.7 },
    { week: 'Week 6', candidates: 4, conversions: 4, avgTime: 1.5 },
  ],
};

// Detailed stage data for expanded funnel view
const stageDetails = {
  Applications: {
    conversionRate: '63.2%',
    avgTimeInStage: '2.5 days',
    successRate: '78.5%',
    dropoffRate: '21.5%',
    isBottleneck: false,
    efficiency: '85.2%',
    candidates: [
      {
        id: '6',
        name: 'James Wilson',
        title: 'Data Scientist',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '9',
        name: 'Alex Thompson',
        title: 'UX Designer',
        status: 'active',
        daysInStage: 2,
      },
      {
        id: '10',
        name: 'Rachel Green',
        title: 'Product Manager',
        status: 'active',
        daysInStage: 3,
      },
      {
        id: '11',
        name: 'Tom Anderson',
        title: 'System Architect',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '12',
        name: 'Jessica Lee',
        title: 'QA Lead',
        status: 'active',
        daysInStage: 2,
      },
    ],
    insights: [
      {
        type: 'success',
        title: 'High Application Quality',
        description:
          '78.5% of applications meet basic requirements, indicating good job posting targeting.',
      },
      {
        type: 'warning',
        title: 'Slow Response Time',
        description:
          'Average response time of 2.5 days could be improved to maintain candidate interest.',
      },
    ],
  },
  Screening: {
    conversionRate: '57.1%',
    avgTimeInStage: '3.2 days',
    successRate: '65.3%',
    dropoffRate: '34.7%',
    isBottleneck: false,
    efficiency: '72.1%',
    candidates: [
      {
        id: '2',
        name: 'Michael Chen',
        title: 'Full Stack Developer',
        status: 'active',
        daysInStage: 2,
      },
      {
        id: '8',
        name: 'Robert Taylor',
        title: 'QA Engineer',
        status: 'active',
        daysInStage: 3,
      },
      {
        id: '13',
        name: 'Kevin Martinez',
        title: 'Backend Developer',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '14',
        name: 'Amanda White',
        title: 'Frontend Developer',
        status: 'active',
        daysInStage: 4,
      },
      {
        id: '15',
        name: 'Daniel Brown',
        title: 'DevOps Engineer',
        status: 'active',
        daysInStage: 2,
      },
    ],
    insights: [
      {
        type: 'success',
        title: 'Good Technical Assessment',
        description:
          '65.3% pass rate indicates effective screening criteria and assessment methods.',
      },
      {
        type: 'warning',
        title: 'Screening Bottleneck',
        description:
          '3.2 days average time suggests need for more screening resources or streamlined process.',
      },
    ],
  },
  Interviews: {
    conversionRate: '38.2%',
    avgTimeInStage: '5.8 days',
    successRate: '52.1%',
    dropoffRate: '47.9%',
    isBottleneck: true,
    efficiency: '68.4%',
    candidates: [
      {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Senior Software Engineer',
        status: 'active',
        daysInStage: 4,
      },
      {
        id: '7',
        name: 'Maria Garcia',
        title: 'Mobile Developer',
        status: 'active',
        daysInStage: 6,
      },
      {
        id: '16',
        name: 'Chris Davis',
        title: 'Data Engineer',
        status: 'active',
        daysInStage: 3,
      },
      {
        id: '17',
        name: 'Sophie Turner',
        title: 'UI/UX Designer',
        status: 'active',
        daysInStage: 5,
      },
      {
        id: '18',
        name: 'Ryan Cooper',
        title: 'Security Engineer',
        status: 'active',
        daysInStage: 7,
      },
    ],
    insights: [
      {
        type: 'error',
        title: 'Interview Bottleneck',
        description:
          '5.8 days average time and 47.9% dropoff rate indicate significant interview process issues.',
      },
      {
        type: 'warning',
        title: 'High Dropoff Rate',
        description:
          'Nearly half of candidates drop out during interviews, suggesting process improvements needed.',
      },
    ],
  },
  Finalists: {
    conversionRate: '67.6%',
    avgTimeInStage: '4.1 days',
    successRate: '82.4%',
    dropoffRate: '17.6%',
    isBottleneck: false,
    efficiency: '89.7%',
    candidates: [
      {
        id: '3',
        name: 'Emily Rodriguez',
        title: 'Frontend Developer',
        status: 'active',
        daysInStage: 3,
      },
      {
        id: '19',
        name: 'Mark Johnson',
        title: 'Senior Backend Engineer',
        status: 'active',
        daysInStage: 5,
      },
      {
        id: '20',
        name: 'Lisa Chen',
        title: 'Product Designer',
        status: 'active',
        daysInStage: 2,
      },
      {
        id: '21',
        name: 'David Park',
        title: 'Machine Learning Engineer',
        status: 'active',
        daysInStage: 4,
      },
    ],
    insights: [
      {
        type: 'success',
        title: 'Strong Finalist Quality',
        description:
          '82.4% success rate shows excellent candidate selection for final round.',
      },
      {
        type: 'success',
        title: 'Efficient Process',
        description:
          '4.1 days average time indicates well-organized finalist evaluation process.',
      },
    ],
  },
  Offers: {
    conversionRate: '78.3%',
    avgTimeInStage: '2.8 days',
    successRate: '91.3%',
    dropoffRate: '8.7%',
    isBottleneck: false,
    efficiency: '94.2%',
    candidates: [
      {
        id: '4',
        name: 'David Kim',
        title: 'DevOps Engineer',
        status: 'active',
        daysInStage: 2,
      },
      {
        id: '22',
        name: 'Anna Wilson',
        title: 'Senior Frontend Developer',
        status: 'active',
        daysInStage: 3,
      },
      {
        id: '23',
        name: 'Mike Thompson',
        title: 'Backend Lead',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '24',
        name: 'Sarah Davis',
        title: 'UX Researcher',
        status: 'active',
        daysInStage: 4,
      },
    ],
    insights: [
      {
        type: 'success',
        title: 'High Offer Acceptance',
        description:
          '91.3% acceptance rate indicates competitive compensation and strong candidate experience.',
      },
      {
        type: 'success',
        title: 'Quick Decision Making',
        description:
          '2.8 days average time shows efficient offer negotiation and decision process.',
      },
    ],
  },
  Hires: {
    conversionRate: '100%',
    avgTimeInStage: '1.5 days',
    successRate: '100%',
    dropoffRate: '0%',
    isBottleneck: false,
    efficiency: '100%',
    candidates: [
      {
        id: '5',
        name: 'Lisa Wang',
        title: 'Backend Engineer',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '25',
        name: 'John Smith',
        title: 'Full Stack Developer',
        status: 'active',
        daysInStage: 2,
      },
      {
        id: '26',
        name: 'Emma Wilson',
        title: 'DevOps Engineer',
        status: 'active',
        daysInStage: 1,
      },
      {
        id: '27',
        name: 'Carlos Rodriguez',
        title: 'Frontend Developer',
        status: 'active',
        daysInStage: 1,
      },
    ],
    insights: [
      {
        type: 'success',
        title: 'Perfect Onboarding',
        description:
          '100% success rate and 1.5 days average time indicate excellent onboarding process.',
      },
      {
        type: 'success',
        title: 'Strong Retention',
        description:
          'All hired candidates successfully completed onboarding and started their roles.',
      },
    ],
  },
};

// ===== DATABASE SERVICE CLASS =====

export class DatabaseService {
  private candidates: Candidate[] = [...dummyCandidates];
  private jobs: Job[] = [...dummyJobs];
  private analytics: Analytics = { ...dummyAnalytics };

  // ===== CANDIDATES METHODS =====

  async getAllCandidates(): Promise<Candidate[]> {
    return this.candidates.filter(candidate => !candidate.isArchived);
  }

  async getCandidateById(id: string): Promise<Candidate | null> {
    return this.candidates.find(candidate => candidate.id === id) || null;
  }

  async createCandidate(
    candidateData: Omit<
      Candidate,
      'id' | 'createdAt' | 'isArchived' | 'matchScore' | 'status'
    >
  ): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...candidateData,
      id: uuidv4(),
      createdAt: new Date(),
      isArchived: false,
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      status: 'active',
    };

    this.candidates.push(newCandidate);
    this.analytics.totalCandidates++;

    return newCandidate;
  }

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>
  ): Promise<Candidate | null> {
    const index = this.candidates.findIndex(candidate => candidate.id === id);
    if (index === -1) return null;

    this.candidates[index] = { ...this.candidates[index], ...updates };
    return this.candidates[index];
  }

  async archiveCandidate(id: string): Promise<boolean> {
    const candidate = await this.getCandidateById(id);
    if (!candidate) return false;

    candidate.isArchived = true;
    candidate.status = 'archived';
    return true;
  }

  async searchCandidates(query: string): Promise<Candidate[]> {
    const searchTerm = query.toLowerCase();
    return this.candidates.filter(
      candidate =>
        !candidate.isArchived &&
        (candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.title.toLowerCase().includes(searchTerm) ||
          candidate.skills.some(skill =>
            skill.toLowerCase().includes(searchTerm)
          ) ||
          candidate.location.toLowerCase().includes(searchTerm))
    );
  }

  // ===== JOBS METHODS =====

  async getAllJobs(): Promise<Job[]> {
    return this.jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobs.find(job => job.id === id) || null;
  }

  async createJob(
    jobData: Omit<Job, 'id' | 'createdAt' | 'applications'>
  ): Promise<Job> {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date(),
      applications: 0,
    };

    this.jobs.push(newJob);
    this.analytics.totalJobs++;

    return newJob;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return null;

    this.jobs[index] = { ...this.jobs[index], ...updates };
    return this.jobs[index];
  }

  async deleteJob(id: string): Promise<boolean> {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index === -1) return false;

    this.jobs.splice(index, 1);
    this.analytics.totalJobs--;
    return true;
  }

  async searchJobs(query: string): Promise<Job[]> {
    const searchTerm = query.toLowerCase();
    return this.jobs.filter(
      job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }

  // ===== ANALYTICS METHODS =====

  async getAnalytics(): Promise<Analytics> {
    // Update analytics with real-time data
    this.analytics.totalCandidates = this.candidates.filter(
      c => !c.isArchived
    ).length;
    this.analytics.totalJobs = this.jobs.length;

    // Calculate response rate based on candidate status
    const contactedCandidates = this.candidates.filter(
      c =>
        c.status === 'contacted' ||
        c.status === 'interviewed' ||
        c.status === 'hired'
    ).length;
    const totalActiveCandidates = this.candidates.filter(
      c => !c.isArchived
    ).length;
    this.analytics.responseRate =
      totalActiveCandidates > 0
        ? `${((contactedCandidates / totalActiveCandidates) * 100).toFixed(1)}%`
        : '0%';

    return this.analytics;
  }

  async getCandidateSources(): Promise<{ source: string; count: number }[]> {
    return this.analytics.candidateSources;
  }

  async getTopSkills(): Promise<{ skill: string; count: number }[]> {
    return this.analytics.topSkills;
  }

  async getHiringFunnel(): Promise<{ stage: string; count: number }[]> {
    return this.analytics.hiringFunnel;
  }

  async getStageDetails(stage: string): Promise<any> {
    return stageDetails[stage as keyof typeof stageDetails] || null;
  }

  async getStagePerformanceOverTime(stage: string): Promise<any[]> {
    return (
      stagePerformanceOverTime[
        stage as keyof typeof stagePerformanceOverTime
      ] || []
    );
  }

  async getCandidatesByStage(stage: string): Promise<Candidate[]> {
    return this.candidates.filter(
      candidate => candidate.stage === stage && !candidate.isArchived
    );
  }

  async getMonthlyHires(): Promise<{ month: string; count: number }[]> {
    return this.analytics.monthlyHires;
  }

  // ===== UTILITY METHODS =====

  async getDashboardStats(): Promise<{
    totalCandidates: number;
    totalJobs: number;
    totalCampaigns: number;
    responseRate: string;
  }> {
    const analytics = await this.getAnalytics();
    return {
      totalCandidates: analytics.totalCandidates,
      totalJobs: analytics.totalJobs,
      totalCampaigns: analytics.totalCampaigns,
      responseRate: analytics.responseRate,
    };
  }

  async resetDatabase(): Promise<void> {
    this.candidates = [...dummyCandidates];
    this.jobs = [...dummyJobs];
    this.analytics = { ...dummyAnalytics };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
