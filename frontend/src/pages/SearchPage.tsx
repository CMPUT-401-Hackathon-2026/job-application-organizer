import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Building2, Briefcase, Save, FileText } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobs, applications } from '../api';
import { useJobStore } from '../store/jobStore';
import { useToastStore } from '../components/ui/Toast';
import { JobCard } from '../components/JobCard';
import type { Application } from '../types';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedJob, setSelectedJob } = useJobStore();
  const { addToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const jobIdFromUrl = searchParams.get('jobId');
  const selectedJobId = selectedJob?.id || jobIdFromUrl;

  const { data: jobsList = [], isLoading } = useQuery({
    queryKey: ['jobs', 'search', searchQuery || 'all'],
    queryFn: () => (searchQuery ? jobs.search(searchQuery) : jobs.search('')),
  });

  const { data: applicationsList = [], refetch: refetchApplications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applications.list(),
  });

  const { data: jobDetail } = useQuery({
    queryKey: ['job', selectedJobId],
    queryFn: () => jobs.get(selectedJobId!),
    enabled: !!selectedJobId,
  });

  useEffect(() => {
    if (jobDetail && (!selectedJob || selectedJob.id !== jobDetail.id)) {
      setSelectedJob(jobDetail);
    }
  }, [jobDetail, selectedJob, setSelectedJob]);

  useEffect(() => {
    if (jobIdFromUrl && !selectedJob) {
      const job = jobsList.find((j) => j.id === jobIdFromUrl);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [jobIdFromUrl, jobsList, selectedJob, setSelectedJob]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleApply = async () => {
    const jobToApply = selectedJob || selectedJobForDisplay;
    if (!jobToApply) {
      addToast('Please select a job to apply', 'error');
      return;
    }
    
    try {
      // First, refresh the applications list to get the latest data (including any Drafts created from Build)
      const { data: freshApps = [] } = await refetchApplications();
      
      // Check if there's already an application for this job
      const existingApp = freshApps.find((app) => app.jobId === jobToApply.id);
      
      if (existingApp && existingApp.status === 'Draft') {
        // Update draft to Applied
        const updatedApp = await applications.updateStatus(existingApp.id, 'Applied');
        addToast('Application submitted successfully', 'success');
        
        // Manually update the query cache to ensure UI updates immediately
        queryClient.setQueryData(['applications'], (old: Application[] = []) => {
          return old.map((app) => (app.id === updatedApp.id ? updatedApp : app));
        });
      } else if (!existingApp) {
        // Create new application with Applied status
        const newApp = await applications.create(jobToApply.id, 'Applied');
        addToast('Application submitted successfully', 'success');
        
        // Manually update the query cache to ensure UI updates immediately
        queryClient.setQueryData(['applications'], (old: Application[] = []) => {
          return [...old, newApp];
        });
      } else if (existingApp.status === 'Applied') {
        // Already applied
        addToast('You have already applied for this job', 'info');
        return; // Don't update if already applied
      }
      
      // Also trigger a refetch to ensure consistency
      await refetchApplications();
    } catch (error) {
      console.error('Apply error:', error);
      addToast('Failed to submit application', 'error');
    }
  };

  const handleBuild = async () => {
    const jobToBuild = selectedJob || selectedJobForDisplay;
    if (!jobToBuild) return;
    
    // First, refresh the applications list to get the latest data
    await refetchApplications();
    
    // Get fresh applications list after refetch
    const freshApps = await applications.list();
    
    // Check if application already exists for this job
    const existingApp = freshApps.find((app) => app.jobId === jobToBuild.id);
    
    if (existingApp) {
      // Navigate to builder with existing application
      navigate(`/builder/${existingApp.id}`);
    } else {
      // Create a draft application (not marked as Applied)
      try {
        const app = await applications.create(jobToBuild.id, 'Draft');
        // Invalidate queries to ensure list is updated when user comes back
        await queryClient.invalidateQueries({ queryKey: ['applications'] });
        navigate(`/builder/${app.id}`);
      } catch {
        addToast('Failed to open resume builder', 'error');
      }
    }
  };

  const isApplied = (jobId: string) => {
    return applicationsList.some((app) => app.jobId === jobId && app.status === 'Applied');
  };

  const selectedJobForDisplay = selectedJob || jobDetail;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Left Column - Job List */}
      <div className="w-full md:w-1/2 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
          ) : jobsList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>No jobs found</p>
            </div>
          ) : (
            jobsList.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={job.id === selectedJobId}
                isApplied={isApplied(job.id)}
                onClick={() => {
                  setSelectedJob(job);
                  const params: Record<string, string> = { jobId: job.id };
                  if (searchQuery) params.q = searchQuery;
                  setSearchParams(params);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Column - Job Details */}
      <div className="w-full md:w-1/2 flex flex-col bg-background">
        {selectedJobForDisplay ? (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{selectedJobForDisplay.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Building2 size={18} />
                    <span className="font-medium">{selectedJobForDisplay.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={18} />
                    <span>{selectedJobForDisplay.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={18} />
                    <span>{selectedJobForDisplay.postedDate}</span>
                  </div>
                </div>

                {selectedJobForDisplay.salary && (
                  <p className="text-lg font-semibold text-primary mb-4">{selectedJobForDisplay.salary}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedJobForDisplay.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted rounded-md text-sm text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h2 className="text-xl font-semibold mb-4">Job Description</h2>
                <div className="max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                    {selectedJobForDisplay.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4 bg-muted/30 flex gap-3">
              <button
                onClick={handleApply}
                disabled={isApplied(selectedJobForDisplay.id)}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {isApplied(selectedJobForDisplay.id) ? 'Applied' : 'Apply'}
              </button>
              <button
                onClick={handleBuild}
                className="flex-1 border border-border bg-background py-3 rounded-md font-medium hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Build Resume
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a job to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
