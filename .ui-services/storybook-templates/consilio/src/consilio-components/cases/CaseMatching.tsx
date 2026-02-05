import { Users } from 'lucide-react';
import { EmptyTabContent } from './EmptyTabContent';

/**
 * Matching tab component (placeholder for Phase 2)
 * Will display placement matching features for foster care
 */
export function CaseMatching(): JSX.Element {
  return (
    <EmptyTabContent
      icon={Users}
      title="Placement Matching"
      description="AI-powered matching system to find suitable foster homes for placement requests. This feature will be available in Phase 2."
      comingSoon
    />
  );
}
