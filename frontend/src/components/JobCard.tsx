import { MapPin, Calendar } from 'lucide-react';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  isSelected?: boolean;
  isApplied?: boolean;
}

export function JobCard({ job, onClick, isSelected = false, isApplied = false }: JobCardProps) {
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
        {job.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {job.tags.length > 3 && (
          <span className="px-2 py-1 text-xs text-muted-foreground">
            +{job.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
