export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  tags: string[];
  salary?: string;
  postedDate: string;
}

export interface Application {
  id: number;
  jobId: string;
  job: Job;
  dateApplied: string;
  status: ApplicationStatus;
  notes?: string;
}

export type ApplicationStatus = 'Draft' | 'Applied' | 'Interview' | 'Offer' | 'Rejection' | 'Archived';

export interface Profile {
  id: string;
  name: string;
  email: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  techStack: string[];
  frameworks: string[];
  libraries: string[];
  programmingLanguages: string[];
  links: Link[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Communication {
  id: number;
  applicationId: number;
  date: string;
  type: 'email' | 'call' | 'message';
  from: string;
  to: string;
  subject: string;
  body: string;
}

export interface Resume {
  id: string;
  applicationId: string;
  header: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  techStack: string[];
  lastUpdated: string;
}

export interface ATSResult {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
}
