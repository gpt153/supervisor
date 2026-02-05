import React, { useState } from 'react';
import { CaseButton, BadgeCounts } from './CaseButton';
import './IntegratedTopNav.css';

interface CaseData {
  id: string;
  title: string;
  backgroundColor: string;
  badgeCounts: BadgeCounts;
}

export interface IntegratedTopNavProps {
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

export const IntegratedTopNav: React.FC<IntegratedTopNavProps> = ({ cases = defaultCases }) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(cases[0]?.id || '');

  return (
    <nav className="integrated-top-nav">
      <div className="integrated-top-nav__container">
        {/* Case Filing Tabs - Now Integrated into Top Navigation */}
        <div className="integrated-top-nav__case-tabs">
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

        {/* Profile moved to side menu - not shown in top nav anymore */}
      </div>
    </nav>
  );
};
