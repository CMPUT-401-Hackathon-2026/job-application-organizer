import { create } from 'zustand';
import type { Job } from '../types';

interface JobStore {
  selectedJobId: string | null;
  selectedJob: Job | null;
  setSelectedJob: (job: Job | null) => void;
  setSelectedJobId: (id: string | null) => void;
}

export const useJobStore = create<JobStore>((set) => ({
  selectedJobId: null,
  selectedJob: null,
  setSelectedJob: (job) => set({ selectedJob: job, selectedJobId: job?.id || null }),
  setSelectedJobId: (id) => set({ selectedJobId: id, selectedJob: null }),
}));
