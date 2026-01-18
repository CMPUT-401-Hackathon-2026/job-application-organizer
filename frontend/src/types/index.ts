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

// export interface Application {
//   id: string;
//   title: string;
//   company: string;
//   dateApplied: string;
//   status: ApplicationStatus;
//   notes?: string;
// }

// export type ApplicationStatus = 'Draft' | 'Applied' | 'Interview' | 'Offer' | 'Rejection' | 'Archived';

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

// export interface Communication {
//   id: string;
//   applicationId: string;
//   date: string;
//   type: 'email' | 'call' | 'message';
//   from: string;
//   to: string;
//   subject: string;
//   body: string;
// }

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


export type ApplicationStage =
  | 'draft'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejection'
  | 'withdrawn';

export interface Application {
  id: string;
  profileId?: string;
  title: string;
  company: string;
  link?: string;
  description?: string;
  location?: string;
  date?: string;         
  dateApplied?: string;
  durationDays?: number;
  stage: ApplicationStage;
  createdAt: string;
  updatedAt: string;
  responses?: ApplicationResponse[];
}

export type ResponseType =
  | 'email'
  | 'call'
  | 'interview'
  | 'offer'
  | 'rejection'
  | 'note';

export interface ApplicationResponse {
  id: string;

  applicationId: string;

  responseType: ResponseType;
  receivedAt: string;

  summary: string;
  details?: string;
  contact?: string;
}
