import React from 'react';
import './CaseButton.css';

export interface BadgeCounts {
  unreadEmails: number;
  urgentItems: number;
  aiPending: number;
}

export interface CaseButtonProps {
  title: string;
  backgroundColor: string;
  badgeCounts: BadgeCounts;
  isActive?: boolean;
  onClick?: () => void;
}

export const CaseButton: React.FC<CaseButtonProps> = ({
  title,
  backgroundColor,
  badgeCounts,
  isActive = false,
  onClick
}) => {
  return (
    <button
      className={`case-button ${isActive ? 'case-button--active' : ''}`}
      style={isActive ? { backgroundColor } : undefined}
      onClick={onClick}
    >
      <div className="case-button__content">
        <h3 className="case-button__title">{title}</h3>

        <div className="case-button__badges">
          {/* Unread Emails Badge */}
          <div className="badge badge--blue" title="Unread emails">
            <svg className="badge__icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="badge__count">{badgeCounts.unreadEmails}</span>
          </div>

          {/* Urgent Items Badge */}
          <div className="badge badge--red" title="Urgent items">
            <svg className="badge__icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="badge__count">{badgeCounts.urgentItems}</span>
          </div>

          {/* AI Pending Badge */}
          <div className="badge badge--yellow" title="AI pending">
            <svg className="badge__icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="badge__count">{badgeCounts.aiPending}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
