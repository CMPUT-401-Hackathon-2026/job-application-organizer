import { useQuery } from '@tanstack/react-query';
import { resume } from '../api';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface ATSScoreCardProps {
  applicationId: string;
}

export function ATSScoreCard({ applicationId }: ATSScoreCardProps) {
  const { data: atsResult, isLoading } = useQuery({
    queryKey: ['ats-scan', applicationId],
    queryFn: () => resume.atsScan(applicationId),
    enabled: !!applicationId,
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 mt-4">
        <p className="text-sm text-muted-foreground">Loading ATS score...</p>
      </div>
    );
  }

  if (!atsResult) return null;

  const scoreColor =
    atsResult.score >= 80
      ? 'text-green-600 dark:text-green-400'
      : atsResult.score >= 60
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={20} className="text-primary" />
        <h3 className="font-semibold">ATS Score</h3>
      </div>
      <div className={`text-3xl font-bold mb-2 ${scoreColor}`}>{atsResult.score}/100</div>
      {atsResult.missingKeywords.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm font-medium">Missing Keywords</p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {atsResult.missingKeywords.slice(0, 5).map((keyword, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                {keyword}
              </li>
            ))}
            {atsResult.missingKeywords.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{atsResult.missingKeywords.length - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
