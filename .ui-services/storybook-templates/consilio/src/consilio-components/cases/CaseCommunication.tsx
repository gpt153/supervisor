import { useParams } from 'react-router-dom';
import { EmailViewer } from '@/features/emails/EmailViewer';

/**
 * Communication tab component
 * Displays emails for the current case using EmailViewer
 */
export function CaseCommunication(): JSX.Element {
  const { id: caseId } = useParams<{ id: string }>();

  return (
    <div className="h-[calc(100vh-300px)]">
      <EmailViewer caseId={caseId} />
    </div>
  );
}
