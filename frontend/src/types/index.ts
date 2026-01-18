export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Job {
  id: string; // Changed from number to string
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string; // Changed: single formatted string from backend
  tags?: string[]; // Changed from tech_stack
  postedDate?: string; // Changed from date
}

export interface Application {
  id: string;
  job_id: string; // Changed from jobId (matches Django naming)
  job: Job; // This is the actual Job object
  date_applied: string; // Changed from dateApplied
  stage: ApplicationStatus; // Changed from status (matches Django)
  created_at?: string;
  updated_at?: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejection'
  | 'withdrawn';

export interface ApplicationResponse {
  id: string;
  application_id: string;
  response_type: 'email' | 'call' | 'interview' | 'offer' | 'rejection' | 'note';
  received_at: string;
  summary: string;
  details: string;
  contact?: string;
}

export interface Communication {
  id: string;
  applicationId: string;
  date: string;
  type: 'email' | 'call' | 'message';
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
}

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