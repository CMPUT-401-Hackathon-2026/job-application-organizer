import { MapPin, Calendar } from 'lucide-react';
import type { Application } from '../types';

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  isSelected?: boolean;
}

export function ApplicationCard({
  application,
  onClick,
  isSelected = false,
}: ApplicationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{application.title}</h3>
          <p className="text-muted-foreground font-medium">{application.company}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            application.stage === 'applied'
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-muted/20 text-muted-foreground'
          }`}
        >
          {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        {application.location && (
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{application.location}</span>
          </div>
        )}
        {application.dateApplied && (
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{application.dateApplied}</span>
          </div>
        )}
      </div>

      {application.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
          {application.description}
        </p>
      )}
    </div>
  );
}
