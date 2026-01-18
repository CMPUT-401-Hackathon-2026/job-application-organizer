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
      // Mock fallback
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
      // Mock fallback - create a user with the provided email and name
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
      // Check localStorage for saved profile
      const savedProfile = localStorage.getItem('user_profile');
      const authUserStr = localStorage.getItem('auth_user');

      if (savedProfile && authUserStr) {
        const profile = JSON.parse(savedProfile);
        const authUser = JSON.parse(authUserStr);
        // Only return saved profile if it belongs to current user
        if (profile.email === authUser.email) {
          return profile;
        } else {
          // Clear profile if it belongs to different user
          localStorage.removeItem('user_profile');
        }
      }
      // Return empty profile for new users
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
      // Store in localStorage for mock fallback
      localStorage.setItem('user_profile', JSON.stringify(saved));
      return saved;
    } catch {
      // Store in localStorage for mock fallback
      localStorage.setItem('user_profile', JSON.stringify(data));
      return data;
    }
  },
};

// Jobs API
export const jobs = {
  search: async (query: string): Promise<Job[]> => {
    try {
      // Fetch from Django backend
      const response = await apiFetch(`/jobs/?q=${encodeURIComponent(query)}`);
      // Make sure it returns an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch jobs from backend:', error);
      // fallback to mockJobs if backend fails
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
      // Fetch specific job from Django backend
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
        job_id: parseInt(job_id), // Convert to integer since Django expects int
        stage: stage.toLowerCase(), // Ensure lowercase
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
      // Set date_applied when stage changes to applied
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
  // Get resume for a job application
  get: async (applicationId: string): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/`);
  },

  // Build resume from profile + job description using DeepSeek
  build: async (applicationId: string): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/build/`, {
      method: 'POST',
    });
  },

  // Update resume data
  update: async (applicationId: string, data: Partial<Resume>): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Perform ATS scan using Gemini
  atsScan: async (applicationId: string): Promise<ATSResult> => {
    return apiFetch(`/applications/${applicationId}/resume/ats-scan/`, {
      method: 'POST',
    });
  },

  // Download LaTeX file
  downloadLatex: async (applicationId: string): Promise<void> => {
    const blob = await apiFetch<Blob>(`/applications/${applicationId}/resume/latex/`, {
      responseType: 'blob',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${applicationId}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Download compiled PDF
  downloadPdf: async (applicationId: string): Promise<void> => {
    const blob = await apiFetch<Blob>(`/applications/${applicationId}/resume/pdf/`, {
      responseType: 'blob',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${applicationId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};



// export const resume = {
//   get: async (applicationId: number): Promise<Resume> => {
//     return apiFetch(`/applications/${applicationId}/resume/`);
//   },

//   buildFromProfile: async (applicationId: number, jobDescription: string): Promise<Resume> => {
//     return apiFetch(`/applications/${applicationId}/resume/build/`, {
//       method: 'POST',
//       body: JSON.stringify({ job_description: jobDescription }),
//     });
//   },

//   update: async (applicationId: number, data: Partial<Resume>): Promise<Resume> => {
//     return apiFetch(`/applications/${applicationId}/resume/`, {
//       method: 'PATCH',
//       body: JSON.stringify(data),
//     });
//   },

//   downloadLatex: async (applicationId: number): Promise<void> => {
//     const blob = await apiFetch<Blob>(`/applications/${applicationId}/resume/latex/`, {
//       responseType: 'blob',
//     });

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `resume-${applicationId}.tex`;
//     a.click();
//     URL.revokeObjectURL(url);
//   },
// };
// export const resume = {
//   build: async (applicationId: string): Promise<Resume> => {
//     try {
//       return await apiFetch(`/resume/build`, {
//         method: 'POST',
//         body: JSON.stringify({ applicationId }),
//       });
//     } catch {
//       if (!mockResumes[applicationId]) {
//         const app = mockApplications.find((a) => a.id === applicationId);
//         if (!app) throw new Error('Application not found');
//         mockResumes[applicationId] = {
//           id: `resume-${applicationId}`,
//           applicationId,
//           header: mockProfile.name + '\n' + mockProfile.email,
//           education: mockProfile.education,
//           experience: mockProfile.experience,
//           projects: mockProfile.projects,
//           techStack: mockProfile.techStack,
//           lastUpdated: new Date().toISOString().split('T')[0],
//         };
//       }
//       return mockResumes[applicationId];
//     }
//   },

//   update: async (applicationId: string, data: Partial<Resume>): Promise<Resume> => {
//     try {
//       return await apiFetch(`/resume/${applicationId}`, {
//         method: 'PATCH',
//         body: JSON.stringify(data),
//       });
//     } catch {
//       if (!mockResumes[applicationId]) {
//         await resume.build(applicationId);
//       }
//       mockResumes[applicationId] = { ...mockResumes[applicationId]!, ...data };
//       return mockResumes[applicationId]!;
//     }
//   },

//   atsScan: async (applicationId: string): Promise<ATSResult> => {
//     try {
//       return await apiFetch(`/resume/${applicationId}/ats-scan`);
//     } catch {
//       const res = mockResumes[applicationId];
//       const app = mockApplications.find((a) => a.id === applicationId);
//       if (!app) throw new Error('Application not found');

//       const jobTags = app.job.tags?.map((t) => t.toLowerCase()) || [];
//       const resumeTags = res?.techStack.map((t) => t.toLowerCase()) || [];
//       const missingKeywords = jobTags.filter((tag) => !resumeTags.some((rt) => rt.includes(tag) || tag.includes(rt)));

//       const score = Math.max(0, Math.min(100, 100 - missingKeywords.length * 15));

//       return {
//         score,
//         missingKeywords,
//         suggestions: missingKeywords.slice(0, 5),
//       };
//     }
//   },

//   downloadLatex: async (applicationId: string): Promise<void> => {
//     try {
//       const blob = await apiFetch<Blob>(`/resume/${applicationId}/latex`, {
//         headers: { Accept: 'application/x-latex' },
//       });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `resume-${applicationId}.tex`;
//       a.click();
//       URL.revokeObjectURL(url);
//     } catch {
//       const res = mockResumes[applicationId];
//       if (!res) throw new Error('Resume not found');

//       // Generate LaTeX content
//       const latex = `\\documentclass[11pt,a4paper]{article}
// \\begin{document}
// ${res.header.split('\n').map((line) => `\\textbf{${line}}`).join(' \\\\\n')}
// \\section*{Education}
// ${res.education.map((edu) => `\\textbf{${edu.school}} - ${edu.degree} in ${edu.field}`).join('\n')}
// \\section*{Experience}
// ${res.experience.map((exp) => `\\textbf{${exp.company}} - ${exp.position}`).join('\n')}
// \\section*{Skills}
// ${res.techStack.join(', ')}
// \\end{document}`;

//       const blob = new Blob([latex], { type: 'application/x-latex' });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `resume-${applicationId}.tex`;
//       a.click();
//       URL.revokeObjectURL(url);
//     }
//   },
// };

// Communications API - Now using ApplicationResponse
export const communications = {
  list: async (applicationId: string): Promise<ApplicationResponse[]> => {
    try {
      return await apiFetch(`/applications/${applicationId}/responses/`);
    } catch {
      // Return empty array if backend fails
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
      // Mock reply generation
      const app = mockApplications.find((a) => a.id === applicationId);
      return `Thank you for reaching out regarding the ${app?.job.title || 'position'} at ${app?.job.company || 'your company'}. I am very interested in this opportunity and would be happy to discuss how my skills and experience align with your needs. Please let me know when would be a convenient time to connect. Best regards, John Doe`;
    }
  },
};