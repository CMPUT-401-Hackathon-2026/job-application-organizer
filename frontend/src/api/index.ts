import { apiFetch } from './client';

import {
  mockJobs,
  mockApplications,
  mockProfile,
  mockCommunications,
  mockResumes,
  mockUser,
} from './mockData';
import type {
  Job,
  Application,
  Profile,
  Communication,
  Resume,
  ATSResult,
  ApplicationStatus,
  ApplicationResponse,
} from '../types';

// Auth API
export const auth = {
  login: async (email: string, password: string): Promise<{ token: string; user: typeof mockUser }> => {
    try {
      return await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch {
      return {
        token: 'mock-token-' + Date.now(),
        user: mockUser,
      };
    }
  },

  signup: async (email: string, name: string, password: string): Promise<{ token: string; user: typeof mockUser }> => {
    try {
      return await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, password }),
      });
    } catch {
      return {
        token: 'mock-token-' + Date.now(),
        user: {
          id: String(Date.now()),
          name: name,
          email: email,
          avatar: undefined,
        },
      };
    }
  },

  google: async (): Promise<{ token: string; user: typeof mockUser }> => {
    try {
      return await apiFetch('/auth/google', {
        method: 'POST',
      });
    } catch {
      return {
        token: 'mock-token-google-' + Date.now(),
        user: mockUser,
      };
    }
  },
};

// Profile API
export const profile = {
  get: async (): Promise<Profile> => {
    try {
      return await apiFetch('/profile/');
    } catch {
      const savedProfile = localStorage.getItem('user_profile');
      const authUserStr = localStorage.getItem('auth_user');

      if (savedProfile && authUserStr) {
        const profile = JSON.parse(savedProfile);
        const authUser = JSON.parse(authUserStr);
        if (profile.email === authUser.email) {
          return profile;
        } else {
          localStorage.removeItem('user_profile');
        }
      }
      return {
        id: '',
        name: '',
        email: '',
        education: [],
        experience: [],
        projects: [],
        techStack: [],
        frameworks: [],
        libraries: [],
        programmingLanguages: [],
        links: [],
      };
    }
  },

  save: async (data: Profile): Promise<Profile> => {
    try {
      const saved = await apiFetch<Profile>('/profile/', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      localStorage.setItem('user_profile', JSON.stringify(saved));
      return saved;
    } catch {
      localStorage.setItem('user_profile', JSON.stringify(data));
      return data;
    }
  },
};

// Jobs API
export const jobs = {
  search: async (query: string): Promise<Job[]> => {
    try {
      const response = await apiFetch(`/jobs/?q=${encodeURIComponent(query)}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch jobs from backend:', error);
      const lowerQuery = query.toLowerCase();
      return mockJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.company.toLowerCase().includes(lowerQuery) ||
          job.description.toLowerCase().includes(lowerQuery)
      );
    }
  },

  get: async (id: string): Promise<Job> => {
    try {
      const response = await apiFetch<Job>(`/jobs/${id}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch job from backend:', error);
      const job = mockJobs.find((j) => j.id === id);
      if (!job) throw new Error('Job not found');
      return job;
    }
  },
};

// Applications API
export const applications = {
  list: async (): Promise<Application[]> => {
    try {
      return await apiFetch('/applications/');
    } catch {
      return mockApplications;
    }
  },

  create: async (job_id: string, stage: ApplicationStatus = 'applied'): Promise<Application> => {
    try {
      const date_applied = stage === 'applied' ? new Date().toISOString().split('T')[0] : null;
      const payload = { 
        job_id: parseInt(job_id),
        stage: stage.toLowerCase(),
        date_applied 
      };
      console.log('Creating application with payload:', payload);
      return await apiFetch('/applications/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to create application:', error);
      const job = mockJobs.find((j) => j.id === job_id);
      if (!job) throw new Error('Job not found');
      const newApp: Application = {
        id: `app-${Date.now()}`,
        job_id,
        job,
        date_applied: stage === 'applied' ? new Date().toISOString().split('T')[0] : '',
        stage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockApplications.push(newApp);
      return newApp;
    }
  },

  updateStatus: async (id: string, stage: ApplicationStatus): Promise<Application> => {
    try {
      return await apiFetch(`/applications/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
    } catch {
      const app = mockApplications.find((a) => a.id === id);
      if (!app) throw new Error('Application not found'); 
      app.stage = stage;
      if (stage === 'applied' && !app.date_applied) {
        app.date_applied = new Date().toISOString().split('T')[0];
      }
      app.updated_at = new Date().toISOString();
      return app;
    }
  },
};

// Resume API
export const resume = {
  get: async (applicationId: string): Promise<Resume> => {
    try {
      return await apiFetch(`/resumes/${applicationId}/resume/`);
    } catch (error) {
      console.error('Failed to fetch resume:', error);
      throw error;
    }
  },

  build: async (applicationId: string): Promise<Resume> => {
    try {
      return await apiFetch(`/resumes/${applicationId}/resume/build/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to build resume:', error);
      throw error;
    }
  },

  update: async (applicationId: string, data: Partial<Resume>): Promise<Resume> => {
    try {
      return await apiFetch(`/resumes/${applicationId}/resume/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to update resume:', error);
      throw error;
    }
  },

  atsScan: async (applicationId: string): Promise<ATSResult> => {
    try {
      return await apiFetch(`/resumes/${applicationId}/resume/ats-scan/`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to perform ATS scan:', error);
      throw error;
    }
  },

  downloadLatex: async (applicationId: string): Promise<void> => {
    try {
      const blob = await apiFetch<Blob>(`/resumes/${applicationId}/resume/latex/`, {
        responseType: 'blob',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${applicationId}.tex`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download LaTeX:', error);
      throw error;
    }
  },

  downloadPdf: async (applicationId: string): Promise<void> => {
    try {
      const blob = await apiFetch<Blob>(`/resumes/${applicationId}/resume/pdf/`, {
        responseType: 'blob',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${applicationId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      throw error;
    }
  },
};

// Communications API
export const communications = {
  list: async (applicationId: string): Promise<ApplicationResponse[]> => {
    try {
      return await apiFetch(`/applications/${applicationId}/responses/`);
    } catch {
      return [];
    }
  },

  add: async (
    applicationId: string,
    data: Omit<ApplicationResponse, 'id' | 'received_at'>
  ): Promise<ApplicationResponse> => {
    try {
      return await apiFetch(`/applications/${applicationId}/responses/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newResponse: ApplicationResponse = {
        id: `resp-${Date.now()}`,
        application_id: applicationId,
        response_type: data.response_type,
        received_at: new Date().toISOString(),
        summary: data.summary,
        details: data.details,
        contact: data.contact,
      };
      return newResponse;
    }
  },

  generateReply: async (applicationId: string, context?: string): Promise<string> => {
    try {
      const result = await apiFetch<{ reply: string }>(
        `/applications/${applicationId}/responses/generate-reply`,
        {
          method: 'POST',
          body: JSON.stringify({ context }),
        }
      );
      return result.reply;
    } catch {
      const app = mockApplications.find((a) => a.id === applicationId);
      return `Thank you for reaching out regarding the ${app?.job.title || 'position'} at ${app?.job.company || 'your company'}. I am very interested in this opportunity and would be happy to discuss how my skills and experience align with your needs. Please let me know when would be a convenient time to connect. Best regards, John Doe`;
    }
  },
}