import React, { useState } from 'react';
import { CaseButton, BadgeCounts } from './CaseButton';
import './CaseButtonRow.css';

interface CaseData {
  id: string;
  title: string;
  backgroundColor: string;
  badgeCounts: BadgeCounts;
}

export interface CaseButtonRowProps {
  cases?: CaseData[];
}

const defaultCases: CaseData[] = [
  {
    id: '1',
    title: 'Anna',
    backgroundColor: '#FFFFFF',
    badgeCounts: { unreadEmails: 3, urgentItems: 1, aiPending: 0 }
  },
  {
    id: '2',
    title: 'Erik',
    backgroundColor: '#FFFFFF',
    badgeCounts: { unreadEmails: 0, urgentItems: 0, aiPending: 2 }
  },
  {
    id: '3',
    title: 'Sofia',
    backgroundColor: '#FFFFFF',
    badgeCounts: { unreadEmails: 5, urgentItems: 3, aiPending: 1 }
  },
  {
    id: '4',
    title: 'Johan',
    backgroundColor: '#FFFFFF',
    badgeCounts: { unreadEmails: 1, urgentItems: 0, aiPending: 0 }
  },
  {
    id: '5',
    title: 'Maria',
    backgroundColor: '#FFFFFF',
    badgeCounts: { unreadEmails: 0, urgentItems: 0, aiPending: 1 }
  }
];

export const CaseButtonRow: React.FC<CaseButtonRowProps> = ({ cases = defaultCases }) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(cases[0]?.id || '');

  return (
    <div className="case-button-row">
      <div className="case-button-row__scroll">
        {cases.map((caseData) => (
          <CaseButton
            key={caseData.id}
            title={caseData.title}
            backgroundColor={caseData.backgroundColor}
            badgeCounts={caseData.badgeCounts}
            isActive={activeCaseId === caseData.id}
            onClick={() => setActiveCaseId(caseData.id)}
          />
        ))}
      </div>
    </div>
  );
};
