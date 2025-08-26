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
  education: string[];
  currentCompany: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary?: string;
  createdAt: Date;
  isArchived: boolean;
  matchScore?: number;
  status: 'active' | 'contacted' | 'interviewed' | 'hired' | 'rejected' | 'archived';
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salary: string;
  experienceLevel: string;
  description: string;
  responsibilities: string;
  requirements: string;
  skills: string;
  niceToHave: string;
  benefits: string;
  perks: string;
  startDate: string;
  status: 'draft' | 'active' | 'closed';
  applications: number;
  interviews: number;
  finalists: number;
  createdAt: Date;
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

// ===== DUMMY CANDIDATES DATA =====

const dummyCandidates: Candidate[] = [
  {
    id: 'a2949235-6748-435b-8bef-9487c79969e7',
    name: 'Lee Ladke',
    email: 'lee.k.ladke@gmail.com',
    phone: '425-241-7532',
    title: 'Senior Software Engineer',
    location: 'Renton, WA',
    experience: '8 years',
    skills: ['Python', 'React', 'Vue.js', 'Node.js', 'AWS', 'Docker'],
    education: ['BS Computer Science', 'University of Washington'],
    currentCompany: 'TechCorp Inc.',
    linkedin: 'linkedin.com/in/leekladke',
    github: 'github.com/leeladke',
    summary: 'Experienced full-stack developer with expertise in modern web technologies and cloud infrastructure.',
    createdAt: new Date('2024-01-15'),
    isArchived: false,
    matchScore: 92,
    status: 'active'
  },
  {
    id: 'b3850346-7859-546c-9cfg-0598d80070f8',
    name: 'Sarah Chen',
    email: 'sarah.chen@outlook.com',
    phone: '206-555-0123',
    title: 'Product Manager',
    location: 'Seattle, WA',
    experience: '6 years',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'JIRA', 'Figma'],
    education: ['MBA', 'Stanford University', 'BS Engineering', 'MIT'],
    currentCompany: 'InnovateTech Solutions',
    linkedin: 'linkedin.com/in/sarahchen',
    summary: 'Strategic product leader with a track record of launching successful SaaS products.',
    createdAt: new Date('2024-01-20'),
    isArchived: false,
    matchScore: 88,
    status: 'contacted'
  },
  {
    id: 'c4761457-8960-657d-0dgh-1609e91181g9',
    name: 'Marcus Rodriguez',
    email: 'm.rodriguez@yahoo.com',
    phone: '415-555-0456',
    title: 'DevOps Engineer',
    location: 'San Francisco, CA',
    experience: '5 years',
    skills: ['Kubernetes', 'Terraform', 'Jenkins', 'AWS', 'Linux', 'Python'],
    education: ['BS Information Technology', 'UC Berkeley'],
    currentCompany: 'CloudScale Systems',
    github: 'github.com/marcusrodriguez',
    summary: 'DevOps specialist focused on scalable infrastructure and CI/CD pipelines.',
    createdAt: new Date('2024-01-25'),
    isArchived: false,
    matchScore: 85,
    status: 'interviewed'
  },
  {
    id: 'd5672568-9071-768e-1ehi-2710f02292h0',
    name: 'Emily Watson',
    email: 'emily.watson@gmail.com',
    phone: '512-555-0789',
    title: 'UX/UI Designer',
    location: 'Austin, TX',
    experience: '4 years',
    skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    education: ['BFA Design', 'Parsons School of Design'],
    currentCompany: 'DesignForward Studio',
    linkedin: 'linkedin.com/in/emilywatson',
    portfolio: 'emilywatson.design',
    summary: 'Creative designer passionate about user-centered design and digital experiences.',
    createdAt: new Date('2024-02-01'),
    isArchived: false,
    matchScore: 90,
    status: 'active'
  },
  {
    id: 'e6783679-0182-879f-2fij-3821g13303i1',
    name: 'David Kim',
    email: 'david.kim@hotmail.com',
    phone: '303-555-0122',
    title: 'Data Scientist',
    location: 'Denver, CO',
    experience: '7 years',
    skills: ['Python', 'R', 'Machine Learning', 'SQL', 'TensorFlow', 'Tableau'],
    education: ['PhD Computer Science', 'University of Colorado', 'MS Statistics', 'Stanford'],
    currentCompany: 'DataInsight Analytics',
    linkedin: 'linkedin.com/in/davidkim',
    github: 'github.com/davidkim',
    summary: 'Data scientist with expertise in machine learning and statistical modeling.',
    createdAt: new Date('2024-02-05'),
    isArchived: false,
    matchScore: 87,
    status: 'hired'
  },
  {
    id: 'f7894780-1293-980g-3gjk-4932h24414j2',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@protonmail.com',
    phone: '617-555-0555',
    title: 'Frontend Developer',
    location: 'Boston, MA',
    experience: '3 years',
    skills: ['JavaScript', 'React', 'TypeScript', 'CSS', 'Webpack', 'Jest'],
    education: ['BS Computer Science', 'Northeastern University'],
    currentCompany: 'WebCraft Solutions',
    linkedin: 'linkedin.com/in/lisathompson',
    github: 'github.com/lisathompson',
    summary: 'Frontend developer focused on creating responsive and accessible web applications.',
    createdAt: new Date('2024-02-10'),
    isArchived: false,
    matchScore: 83,
    status: 'rejected'
  },
  {
    id: 'g8905891-2304-091h-4hkl-5043i35525k3',
    name: 'James Wilson',
    email: 'james.wilson@icloud.com',
    phone: '404-555-0888',
    title: 'Backend Engineer',
    location: 'Atlanta, GA',
    experience: '9 years',
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Redis', 'Microservices', 'Docker'],
    education: ['BS Software Engineering', 'Georgia Tech'],
    currentCompany: 'BackendPro Systems',
    linkedin: 'linkedin.com/in/jameswilson',
    github: 'github.com/jameswilson',
    summary: 'Senior backend engineer with expertise in scalable microservices architecture.',
    createdAt: new Date('2024-02-15'),
    isArchived: false,
    matchScore: 89,
    status: 'active'
  },
  {
    id: 'h9016902-3415-102i-5ilm-6154j46636l4',
    name: 'Rachel Green',
    email: 'rachel.green@outlook.com',
    phone: '305-555-0221',
    title: 'Marketing Manager',
    location: 'Miami, FL',
    experience: '5 years',
    skills: ['Digital Marketing', 'SEO', 'Google Analytics', 'HubSpot', 'Social Media', 'Content Strategy'],
    education: ['MBA Marketing', 'University of Miami', 'BS Communications', 'Florida State'],
    currentCompany: 'MarketingMasters Inc.',
    linkedin: 'linkedin.com/in/rachelgreen',
    summary: 'Digital marketing expert with a proven track record of driving growth through data-driven strategies.',
    createdAt: new Date('2024-02-20'),
    isArchived: true,
    matchScore: 76,
    status: 'archived'
  }
];

// ===== DUMMY JOBS DATA =====

const dummyJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Seattle, WA (Hybrid)',
    employmentType: 'Full-time',
    salary: '$120,000 - $150,000',
    experienceLevel: 'Senior',
    description: 'We are looking for a Senior Full-Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining web applications using modern technologies.',
    responsibilities: 'Design and implement scalable web applications, Collaborate with cross-functional teams, Mentor junior developers, Participate in code reviews',
    requirements: '5+ years of experience in full-stack development, Proficiency in React, Node.js, and TypeScript, Experience with cloud platforms (AWS/Azure), Strong problem-solving skills',
    skills: 'React, Node.js, TypeScript, AWS, PostgreSQL, Docker',
    niceToHave: 'Experience with GraphQL, Knowledge of microservices architecture, Familiarity with CI/CD pipelines',
    benefits: 'Health insurance, 401(k) matching, Flexible PTO, Remote work options',
    perks: 'Free lunch, Gym membership, Professional development budget',
    startDate: '2024-03-01',
    status: 'active',
    applications: 24,
    interviews: 8,
    finalists: 3,
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'job-002',
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA (Remote)',
    employmentType: 'Full-time',
    salary: '$130,000 - $160,000',
    experienceLevel: 'Mid-Senior',
    description: 'Join our product team to drive the development of innovative SaaS solutions. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
    responsibilities: 'Define product strategy and roadmap, Gather and prioritize user requirements, Work with engineering teams to deliver features, Analyze product metrics',
    requirements: '3+ years of product management experience, Strong analytical and communication skills, Experience with agile methodologies, Technical background preferred',
    skills: 'Product Strategy, User Research, Data Analysis, Agile, JIRA, Figma',
    niceToHave: 'Experience with B2B SaaS products, Knowledge of SQL and analytics tools, MBA or technical degree',
    benefits: 'Comprehensive health coverage, Stock options, Unlimited PTO, Home office setup',
    perks: 'Annual retreat, Learning stipend, Wellness programs',
    startDate: '2024-03-15',
    status: 'active',
    applications: 18,
    interviews: 6,
    finalists: 2,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'job-003',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Austin, TX (On-site)',
    employmentType: 'Full-time',
    salary: '$110,000 - $140,000',
    experienceLevel: 'Mid-Senior',
    description: 'Help us build and maintain scalable infrastructure that supports our growing platform. You will work on automation, monitoring, and deployment processes.',
    responsibilities: 'Design and implement CI/CD pipelines, Manage cloud infrastructure, Monitor system performance, Automate deployment processes',
    requirements: '4+ years of DevOps experience, Proficiency in AWS or Azure, Experience with Docker and Kubernetes, Strong scripting skills',
    skills: 'AWS, Docker, Kubernetes, Terraform, Jenkins, Python',
    niceToHave: 'Experience with monitoring tools (Prometheus, Grafana), Knowledge of security best practices, Certifications (AWS, Kubernetes)',
    benefits: 'Health, dental, and vision insurance, 401(k) with matching, Flexible work hours',
    perks: 'Free parking, On-site gym, Catered lunches',
    startDate: '2024-04-01',
    status: 'active',
    applications: 15,
    interviews: 5,
    finalists: 2,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 'job-004',
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    salary: '$90,000 - $120,000',
    experienceLevel: 'Mid-Level',
    description: 'Create beautiful and intuitive user experiences for our digital products. You will work closely with product and engineering teams to bring designs to life.',
    responsibilities: 'Design user interfaces and experiences, Conduct user research and testing, Create wireframes and prototypes, Collaborate with development teams',
    requirements: '3+ years of UX/UI design experience, Proficiency in Figma and Adobe Creative Suite, Strong portfolio demonstrating user-centered design, Experience with design systems',
    skills: 'Figma, Adobe Creative Suite, User Research, Prototyping, Design Systems',
    niceToHave: 'Experience with animation tools, Knowledge of front-end development, Experience with accessibility design',
    benefits: 'Health insurance, 401(k), Flexible PTO, Professional development',
    perks: 'Design conference attendance, Latest design tools, Creative workspace',
    startDate: '2024-03-20',
    status: 'draft',
    applications: 0,
    interviews: 0,
    finalists: 0,
    createdAt: new Date('2024-01-25')
  },
  {
    id: 'job-005',
    title: 'Data Scientist',
    department: 'Analytics',
    location: 'Remote (US)',
    employmentType: 'Full-time',
    salary: '$100,000 - $130,000',
    experienceLevel: 'Mid-Senior',
    description: 'Join our data science team to extract insights from large datasets and build machine learning models that drive business decisions.',
    responsibilities: 'Develop machine learning models, Analyze large datasets, Create data visualizations, Present findings to stakeholders',
    requirements: '3+ years of data science experience, Proficiency in Python and R, Experience with SQL and data visualization tools, Strong statistical background',
    skills: 'Python, R, SQL, Machine Learning, TensorFlow, Tableau',
    niceToHave: 'Experience with big data technologies (Spark, Hadoop), Knowledge of deep learning, PhD in quantitative field',
    benefits: 'Comprehensive benefits package, Remote work flexibility, Professional development',
    perks: 'Data science conference attendance, Latest tools and software, Collaborative team environment',
    startDate: '2024-04-15',
    status: 'closed',
    applications: 32,
    interviews: 12,
    finalists: 4,
    createdAt: new Date('2024-01-30')
  }
];

// ===== DUMMY ANALYTICS DATA =====

const dummyAnalytics: Analytics = {
  totalCandidates: 156,
  totalJobs: 23,
  totalCampaigns: 89,
  responseRate: '85.5%',
  timeToHire: 28,
  costPerHire: 4500,
  qualityOfHire: 4.2,
  candidateSources: [
    { source: 'LinkedIn', count: 45 },
    { source: 'Indeed', count: 32 },
    { source: 'Referrals', count: 28 },
    { source: 'Company Website', count: 25 },
    { source: 'Glassdoor', count: 18 },
    { source: 'Other', count: 8 }
  ],
  topSkills: [
    { skill: 'JavaScript', count: 67 },
    { skill: 'Python', count: 54 },
    { skill: 'React', count: 48 },
    { skill: 'AWS', count: 42 },
    { skill: 'SQL', count: 38 },
    { skill: 'Node.js', count: 35 },
    { skill: 'Docker', count: 31 },
    { skill: 'TypeScript', count: 28 }
  ],
  hiringFunnel: [
    { stage: 'Applications', count: 156 },
    { stage: 'Screening', count: 89 },
    { stage: 'Interviews', count: 45 },
    { stage: 'Finalists', count: 18 },
    { stage: 'Offers', count: 12 },
    { stage: 'Hires', count: 8 }
  ],
  monthlyHires: [
    { month: 'Jan', count: 3 },
    { month: 'Feb', count: 5 },
    { month: 'Mar', count: 4 },
    { month: 'Apr', count: 6 },
    { month: 'May', count: 7 },
    { month: 'Jun', count: 5 }
  ]
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

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'isArchived' | 'matchScore' | 'status'>): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...candidateData,
      id: uuidv4(),
      createdAt: new Date(),
      isArchived: false,
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      status: 'active'
    };
    
    this.candidates.push(newCandidate);
    this.analytics.totalCandidates++;
    
    return newCandidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | null> {
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
    return this.candidates.filter(candidate => 
      !candidate.isArchived && (
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.title.toLowerCase().includes(searchTerm) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        candidate.location.toLowerCase().includes(searchTerm)
      )
    );
  }

  // ===== JOBS METHODS =====

  async getAllJobs(): Promise<Job[]> {
    return this.jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobs.find(job => job.id === id) || null;
  }

  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'applications' | 'interviews' | 'finalists'>): Promise<Job> {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date(),
      applications: 0,
      interviews: 0,
      finalists: 0
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
    return this.jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.department.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm) ||
      job.skills.toLowerCase().includes(searchTerm)
    );
  }

  // ===== ANALYTICS METHODS =====

  async getAnalytics(): Promise<Analytics> {
    // Update analytics with real-time data
    this.analytics.totalCandidates = this.candidates.filter(c => !c.isArchived).length;
    this.analytics.totalJobs = this.jobs.length;
    
    // Calculate response rate based on candidate status
    const contactedCandidates = this.candidates.filter(c => c.status === 'contacted' || c.status === 'interviewed' || c.status === 'hired').length;
    const totalActiveCandidates = this.candidates.filter(c => !c.isArchived).length;
    this.analytics.responseRate = totalActiveCandidates > 0 ? `${((contactedCandidates / totalActiveCandidates) * 100).toFixed(1)}%` : '0%';
    
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
      responseRate: analytics.responseRate
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
