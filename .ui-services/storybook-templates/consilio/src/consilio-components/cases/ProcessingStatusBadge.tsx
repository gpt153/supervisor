import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  AlertCircle,
  Music,
  Sparkles,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export type ProcessingStatus =
  | 'pending'
  | 'processing'
  | 'transcribing'
  | 'parsing'
  | 'completed'
  | 'failed';

interface ProcessingStatusBadgeProps {
  status: ProcessingStatus | null;
  fileCategory: 'document' | 'audio' | 'email';
  onRetry?: () => void;
  className?: string;
  showProgress?: boolean;
  createdAt?: string;
}

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'secondary' | 'default' | 'destructive' | 'outline';
  animate?: boolean;
}

const getStatusConfig = (
  status: ProcessingStatus | null,
  category: 'document' | 'audio' | 'email'
): StatusConfig | null => {
  if (!status || status === 'completed') return null;

  const configs: Record<string, StatusConfig> = {
    pending: {
      label: 'Väntar...',
      icon: Loader2,
      variant: 'secondary',
      animate: true,
    },
    processing: {
      label: 'Bearbetar...',
      icon: Sparkles,
      variant: 'secondary',
      animate: true,
    },
    transcribing: {
      label: 'Transkriberas...',
      icon: Music,
      variant: 'secondary',
      animate: true,
    },
    parsing: {
      label: 'Tolkar e-post...',
      icon: Mail,
      variant: 'secondary',
      animate: true,
    },
    failed: {
      label: 'Misslyckades',
      icon: AlertCircle,
      variant: 'destructive',
      animate: false,
    },
  };

  // Map generic statuses to category-specific labels
  if (status === 'pending' || status === 'processing') {
    if (category === 'audio') {
      return configs.transcribing;
    }
    if (category === 'email') {
      return configs.parsing;
    }
    return configs.processing;
  }

  return configs[status] || null;
};

/**
 * Calculate elapsed time in human-readable format
 */
const useElapsedTime = (createdAt: string): string => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateElapsed = () => {
      const start = new Date(createdAt);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      if (diffSeconds < 60) {
        setElapsed(`${diffSeconds}s`);
      } else {
        const minutes = Math.floor(diffSeconds / 60);
        const seconds = diffSeconds % 60;
        setElapsed(`${minutes}m ${seconds}s`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return elapsed;
};

export function ProcessingStatusBadge({
  status,
  fileCategory,
  onRetry,
  className,
  showProgress = false,
  createdAt,
}: ProcessingStatusBadgeProps): JSX.Element | null {
  const config = getStatusConfig(status, fileCategory);
  const elapsed = useElapsedTime(createdAt || new Date().toISOString());

  if (!config) return null;

  const Icon = config.icon;

  // Show progress for transcribing/processing states when showProgress is true
  const shouldShowProgress = showProgress &&
    (status === 'transcribing' || status === 'processing' || status === 'pending') &&
    fileCategory === 'audio';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-1">
        <Badge
          variant={config.variant}
          className={cn('text-xs gap-1', config.animate && 'animate-pulse')}
        >
          <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} />
          {config.label}
          {shouldShowProgress && createdAt && (
            <span className="ml-1 text-[10px] opacity-70">({elapsed})</span>
          )}
        </Badge>

        {status === 'failed' && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="h-6 px-2"
            title="Försök igen"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Indeterminate Progress Bar for Audio Transcription */}
      {shouldShowProgress && (
        <div className="w-full max-w-[200px] relative">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 bg-gradient-to-r from-blue-400 to-purple-500 progress-indeterminate" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Map backend extraction_status to ProcessingStatus
 */
export function mapExtractionStatus(
  extractionStatus: string | null | undefined,
  fileCategory: 'document' | 'audio' | 'email'
): ProcessingStatus | null {
  if (!extractionStatus) return null;

  const statusMap: Record<string, ProcessingStatus> = {
    pending: 'processing',
    processing: 'processing',
    completed: 'completed',
    failed: 'failed',
    // Audio-specific
    queued: 'pending',
    transcribing: 'transcribing',
    // Document-specific
    extracting: 'processing',
  };

  return statusMap[extractionStatus.toLowerCase()] || null;
}
