import { MapPin, Calendar, Building2 } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
  isApplied?: boolean;
  detailed?: boolean;
}

export function JobCard({ 
  job, 
  onClick, 
  isSelected = false, 
  isApplied = false,
  detailed = false 
}: JobCardProps) {
  
  // Detailed view for modal
  if (detailed) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-border pb-4">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <Building2 size={20} />
            <span>{job.company}</span>
          </div>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-base font-medium">{job.location || 'Not specified'}</p>
            </div>
          </div>

          {/* Posted Date */}
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-primary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Posted</p>
              <p className="text-base font-medium">
                {job.postedDate || (job as any).date || 'Recently'}
              </p>
            </div>
          </div>
        </div>

        {/* Pay Range - Large Display */}
        {(job.salary || ((job as any).salary_min && (job as any).salary_max)) && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Salary Range</p>
            <p className="text-2xl font-bold text-primary">
              {job.salary || 
               `$${(job as any).salary_min?.toLocaleString()} - $${(job as any).salary_max?.toLocaleString()}`}
            </p>
          </div>
        )}

        {/* Technologies/Tags */}
        {((job.tags && job.tags.length > 0) || 
          ((job as any).tech_stack && (job as any).tech_stack.length > 0)) && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Tech Stack & Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {(job.tags || (job as any).tech_stack || []).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fallback message if no data */}
        {!job.salary && !((job as any).salary_min && (job as any).salary_max) && 
         (!job.tags || job.tags.length === 0) && 
         (!(job as any).tech_stack || (job as any).tech_stack.length === 0) && (
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Additional details not available for this job posting
            </p>
          </div>
        )}

        {/* Original Link */}
        {(job as any).link && (
          <div className="pt-4 border-t border-border">
            <a
              href={(job as any).link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
            >
              View Original Job Posting
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    );
  }

  // Compact view for list/cards (original)
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
          <p className="text-muted-foreground font-medium">{job.company}</p>
        </div>
        {isApplied && (
          <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 rounded">
            Applied
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{job.postedDate}</span>
        </div>
      </div>

      {job.salary && (
        <p className="text-sm font-medium text-primary mb-3">{job.salary}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {job.tags && job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {job.tags && job.tags.length > 3 && (
          <span className="px-2 py-1 text-xs text-muted-foreground">
            +{job.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}