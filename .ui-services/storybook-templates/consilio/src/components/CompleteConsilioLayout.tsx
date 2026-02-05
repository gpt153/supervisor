import React, { useState, useRef, useEffect } from 'react';
import './CompleteConsilioLayout.css';

// Mock data types
interface Case {
  id: string;
  case_number: string;
  title: string;
}

interface BadgeCounts {
  unreadEmails: number;
  urgentItems: number;
  aiPending: number;
}

interface BadgeIndicatorProps {
  type: 'email' | 'urgent' | 'ai-pending';
  count: number;
}

const badgeConfig = {
  email: {
    icon: '📧',
    bgColor: '#dbeafe',
    textColor: '#1e40af',
    label: 'unread emails',
  },
  urgent: {
    icon: '⚠️',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    label: 'urgent items',
  },
  'ai-pending': {
    icon: '🤖',
    bgColor: '#e9d5ff',
    textColor: '#581c87',
    label: 'AI pending approvals',
  },
} as const;

// Badge Indicator Component
const BadgeIndicator: React.FC<BadgeIndicatorProps> = ({ type, count }) => {
  if (count === 0) return null;

  const config = badgeConfig[type];
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div
      className="badge-indicator"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
      aria-label={`${count} ${config.label}`}
    >
      <span>{config.icon}</span>
      <span>{displayCount}</span>
    </div>
  );
};

// Case Button Component
interface CaseButtonProps {
  caseItem: Case;
  badgeCounts: BadgeCounts;
  isActive: boolean;
  onClick: () => void;
}

const CaseButton: React.FC<CaseButtonProps> = ({ caseItem, badgeCounts, isActive, onClick }) => {
  return (
    <button
      data-case-id={caseItem.id}
      onClick={onClick}
      className={`case-filing-tab ${isActive ? 'case-filing-tab--active' : ''}`}
    >
      <div className="case-filing-tab__title">{caseItem.title}</div>
      <div className="case-filing-tab__badges">
        <BadgeIndicator type="email" count={badgeCounts.unreadEmails} />
        <BadgeIndicator type="urgent" count={badgeCounts.urgentItems} />
        <BadgeIndicator type="ai-pending" count={badgeCounts.aiPending} />
      </div>
    </button>
  );
};

// Navigation tabs
const navigationTabs = [
  { id: 'oversikt', label: 'Översikt' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tidslinje', label: 'Tidslinje' },
  { id: 'kommunikation', label: 'Kommunikation' },
  { id: 'epost', label: 'E-post' },
  { id: 'dokument', label: 'Dokument' },
  { id: 'uppgifter', label: 'Uppgifter' },
  { id: 'kalender', label: 'Kalender' },
  { id: 'matchning', label: 'Matchning' },
];

// Sidebar navigation items
const sidebarItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Ärenden', path: '/cases', icon: '📁' },
  { name: 'AI Approvals', path: '/approvals', icon: '✨' },
  { name: 'Kalender', path: '/calendar', icon: '📅' },
  { name: 'Dokument', path: '/documents', icon: '📄' },
  { name: 'Uppgifter', path: '/tasks', icon: '☑️' },
  { name: 'Inställningar', path: '/settings', icon: '⚙️' },
];

export interface CompleteConsilioLayoutProps {
  cases?: Case[];
  badgeData?: { caseId: string; unreadEmails: number; urgentItems: number; aiPending: number }[];
  initialActiveCaseId?: string;
  initialActiveTab?: string;
  children?: React.ReactNode;
}

export const CompleteConsilioLayout: React.FC<CompleteConsilioLayoutProps> = ({
  cases = [],
  badgeData = [],
  initialActiveCaseId = '',
  initialActiveTab = 'oversikt',
  children,
}) => {
  const [activeCaseId, setActiveCaseId] = useState(initialActiveCaseId || (cases.length > 0 ? cases[0].id : ''));
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll active case into view
  useEffect(() => {
    if (activeCaseId && containerRef.current) {
      const activeButton = containerRef.current.querySelector(
        `[data-case-id="${activeCaseId}"]`
      );
      activeButton?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCaseId]);

  const handleCaseClick = (caseId: string): void => {
    setActiveCaseId(caseId);
  };

  const handleLogout = (): void => {
    console.log('Logout clicked');
  };

  return (
    <div className="consilio-layout">
      {/* Fixed Top Bar with Case Filing Tabs */}
      <header className="consilio-layout__topbar">
        <div className="consilio-layout__topbar-left">
          <button className="menu-button" aria-label="Menu">
            ☰
          </button>
        </div>

        {/* Case Filing Tabs - horizontally scrollable */}
        {cases.length > 0 && (
          <div className="consilio-layout__case-tabs-container" ref={containerRef}>
            <div className="consilio-layout__case-tabs">
              {cases.map((caseItem) => {
                const badges = badgeData?.find((b) => b.caseId === caseItem.id) || {
                  unreadEmails: 0,
                  urgentItems: 0,
                  aiPending: 0,
                };

                return (
                  <CaseButton
                    key={caseItem.id}
                    caseItem={caseItem}
                    badgeCounts={badges}
                    isActive={activeCaseId === caseItem.id}
                    onClick={() => handleCaseClick(caseItem.id)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Fixed Left Sidebar */}
      <aside className={`consilio-layout__sidebar ${sidebarCollapsed ? 'consilio-layout__sidebar--collapsed' : ''}`}>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const isActive = item.path === '/cases';
            return (
              <button
                key={item.path}
                className={`sidebar-tab ${isActive ? 'sidebar-tab--active' : ''}`}
                title={item.name}
              >
                <span className="sidebar-tab__icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-tab__label">{item.name}</span>}
              </button>
            );
          })}

          {/* Logout Button */}
          <div className="sidebar-nav__logout">
            <button
              onClick={handleLogout}
              className="sidebar-tab"
              title="Logga ut"
            >
              <span className="sidebar-tab__icon">🚪</span>
              {!sidebarCollapsed && <span className="sidebar-tab__label">Logga ut</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Fixed Navigation Tabs (below top bar) */}
      <div className="consilio-layout__nav-tabs">
        {navigationTabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'nav-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="consilio-layout__content">
        <div className="consilio-layout__content-inner">
          {children || (
            <>
              <h2 className="content-heading">
                {navigationTabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <div className="content-section">
                <h3>Case: {cases.find((c) => c.id === activeCaseId)?.title || 'No case selected'}</h3>
                <p>This is a fully integrated, gap-free, border-free Consilio layout.</p>

                <div className="content-demo">
                  <h4>Design Features</h4>
                  <ul>
                    <li><strong>Fixed Top Bar:</strong> Case filing tabs stay at the top when scrolling</li>
                    <li><strong>Fixed Left Sidebar:</strong> Vertical navigation tabs connect seamlessly to main content</li>
                    <li><strong>Fixed Navigation Tabs:</strong> Horizontal content tabs below top bar</li>
                    <li><strong>No Gaps:</strong> All elements align perfectly with no spacing</li>
                    <li><strong>No Borders:</strong> Connection points have no visible borders</li>
                    <li><strong>Perfect Colors:</strong> Active (#f9fafb), Inactive (#e5e7eb), Main (#f9fafb), Inputs (#ffffff)</li>
                  </ul>

                  <h4>Active Elements</h4>
                  <p>Active case tab: <strong>{cases.find((c) => c.id === activeCaseId)?.title}</strong></p>
                  <p>Active navigation: <strong>{navigationTabs.find((t) => t.id === activeTab)?.label}</strong></p>

                  <h4>Sample Input (White Background)</h4>
                  <input
                    type="text"
                    className="sample-input"
                    placeholder="Input fields have #ffffff background to stand out"
                  />

                  <h4>Scrollable Content</h4>
                  <p>Scroll down to see that the top bar, sidebar, and navigation tabs all stay fixed.</p>

                  {Array.from({ length: 20 }).map((_, i) => (
                    <p key={i}>
                      Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
