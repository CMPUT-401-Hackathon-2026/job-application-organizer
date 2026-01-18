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
      return await apiFetch('/profile/'); // Ensure trailing slash
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
      const saved = await apiFetch<Profile>('/profile/', { // Ensure trailing slash
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
      return await apiFetch(`/jobs/search?q=${encodeURIComponent(query)}`);
    } catch {
      const lowerQuery = query.toLowerCase();
      return mockJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.company.toLowerCase().includes(lowerQuery) ||
          job.description.toLowerCase().includes(lowerQuery) ||
          job.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }
  },

  get: async (id: string): Promise<Job> => {
    try {
      return await apiFetch(`/jobs/${id}`);
    } catch {
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
      return await apiFetch('/applications');
    } catch {
      return mockApplications;
    }
  },

  create: async (jobId: string, status: ApplicationStatus = 'Applied'): Promise<Application> => {
    try {
      return await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId, status }),
      });
    } catch {
      const job = mockJobs.find((j) => j.id === jobId);
      if (!job) throw new Error('Job not found');
      const newApp: Application = {
        id: Date.now(),  // TEMP numeric ID
        jobId,
        job,
        dateApplied: status === 'Applied' ? new Date().toISOString().split('T')[0] : '',
        status,
        };
      mockApplications.push(newApp);
      return newApp;
    }
  },

  updateStatus: async (id: number, status: ApplicationStatus): Promise<Application> => {
    try {
      return await apiFetch(`/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const app = mockApplications.find((a) => a.id === id);
      if (!app) throw new Error('Application not found');
      app.status = status;
      // Set dateApplied when status changes to Applied
      if (status === 'Applied' && !app.dateApplied) {
        app.dateApplied = new Date().toISOString().split('T')[0];
      }
      return app;
    }
  },
};

// Resume API
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
//       const resume = mockResumes[applicationId];
//       const app = mockApplications.find((a) => a.id === applicationId);
//       if (!app) throw new Error('Application not found');

//       const jobTags = app.job.tags.map((t) => t.toLowerCase());
//       const resumeTags = resume?.techStack.map((t) => t.toLowerCase()) || [];
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
//       const resume = mockResumes[applicationId];
//       if (!resume) throw new Error('Resume not found');

//       // Generate LaTeX content
//       const latex = `\\documentclass[11pt,a4paper]{article}
// \\begin{document}
// ${resume.header.split('\n').map((line) => `\\textbf{${line}}`).join(' \\\\\n')}
// \\section*{Education}
// ${resume.education.map((edu) => `\\textbf{${edu.school}} - ${edu.degree} in ${edu.field}`).join('\n')}
// \\section*{Experience}
// ${resume.experience.map((exp) => `\\textbf{${exp.company}} - ${exp.position}`).join('\n')}
// \\section*{Skills}
// ${resume.techStack.join(', ')}
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
// export const resume = {
//   // build: async (applicationId: string): Promise<Resume> => {
//   //   return apiFetch(`/applications/${applicationId}/resume/`);
//   // },

//   build: async (applicationId: string, jobDescription: string): Promise<Resume> => {
//   return apiFetch(`/applications/${applicationId}/resume/build/`, {
//     method: 'POST',
//     body: JSON.stringify({ job_description: jobDescription }),
//   });
// },
//   buildFromProfile: async (applicationId: string, jobDescription: string) => {
//   return apiFetch(`/applications/${applicationId}/resume/build/`, {
//     method: 'POST',
//     body: JSON.stringify({ job_description: jobDescription }),
//   });
// },



//   update: async (applicationId: string, data: Partial<Resume>): Promise<Resume> => {
//     return apiFetch(`/applications/${applicationId}/resume/`, {
//       method: 'PATCH',
//       body: JSON.stringify(data),
//     });
//   },

//   atsScan: async (applicationId: string, jobDescription: string): Promise<ATSResult> => {
//     return apiFetch(`/applications/${applicationId}/resume/ats/`, {
//       method: 'POST',
//       body: JSON.stringify({ job_description: jobDescription }),
//     });
//   },

//   downloadLatex: async (applicationId: string): Promise<void> => {
//     const blob = await apiFetch<Blob>(
//       `/applications/${applicationId}/resume/latex/`,
//       { responseType: 'blob' }
//     );

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `resume-${applicationId}.tex`;
//     a.click();
//     URL.revokeObjectURL(url);
//   },

//   downloadPdf: async (applicationId: string): Promise<void> => {
//     const blob = await apiFetch<Blob>(
//       `/applications/${applicationId}/resume/pdf/`,
//       { responseType: 'blob' }
//     );

//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `resume-${applicationId}.pdf`;
//     a.click();
//     URL.revokeObjectURL(url);
//   },
// };

// Communications API
export const communications = {
  list: async (applicationId: number): Promise<Communication[]> => {
    try {
      return await apiFetch(`/applications/${applicationId}/communications`);
    } catch {
      return mockCommunications.filter((c) => c.applicationId === applicationId);
    }
  },

  add: async (applicationId: number, data: Omit<Communication, 'id' | 'applicationId' | 'date'>): Promise<Communication> => {
    try {
      return await apiFetch(`/applications/${applicationId}/communications`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      const newComm: Communication = {
        id: Date.now(),
        applicationId,
        date: new Date().toISOString().split('T')[0],
        ...data,
      };
      mockCommunications.push(newComm);
      return newComm;
    }
  },

  generateReply: async (applicationId: number, context?: string): Promise<string> => {
    try {
      const result = await apiFetch<{ reply: string }>(`/applications/${applicationId}/communications/generate-reply`, {
        method: 'POST',
        body: JSON.stringify({ context }),
      });
      return result.reply;
    } catch {
      // Mock reply generation
      const app = mockApplications.find((a) => a.id === applicationId);
      return `Thank you for reaching out regarding the ${app?.job.title || 'position'} at ${app?.job.company || 'your company'}. I am very interested in this opportunity and would be happy to discuss how my skills and experience align with your needs. Please let me know when would be a convenient time to connect. Best regards, John Doe`;
    }
  },
};
export const resume = {
  get: async (applicationId: number): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/`);
  },

  buildFromProfile: async (applicationId: number, jobDescription: string): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/build/`, {
      method: 'POST',
      body: JSON.stringify({ job_description: jobDescription }),
    });
  },

  update: async (applicationId: number, data: Partial<Resume>): Promise<Resume> => {
    return apiFetch(`/applications/${applicationId}/resume/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  downloadLatex: async (applicationId: number): Promise<void> => {
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
};

