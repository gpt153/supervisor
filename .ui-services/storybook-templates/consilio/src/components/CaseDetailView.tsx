import React, { useState } from 'react';
import { CaseButtonRow } from './CaseButtonRow';
import './CaseDetailView.css';

export interface CaseDetailViewProps {
  backgroundColor: string;
  activeTab?: string;
}

const tabs = [
  { id: 'oversikt', label: 'Översikt' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tidslinje', label: 'Tidslinje' },
  { id: 'kommunikation', label: 'Kommunikation' },
  { id: 'epost', label: 'E-post' },
  { id: 'dokument', label: 'Dokument' },
  { id: 'uppgifter', label: 'Uppgifter' },
  { id: 'kalender', label: 'Kalender' },
  { id: 'uppladdning', label: 'Uppladdning' },
  { id: 'matchning', label: 'Matchning' }
];

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  backgroundColor,
  activeTab: initialActiveTab = 'oversikt'
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  return (
    <div className="case-detail-view" style={{ backgroundColor }}>
      {/* Sticky Case Button Row - Fixed at Top */}
      <div className="case-detail-view__button-row-container">
        <CaseButtonRow />
      </div>

      {/* Sticky Navigation Tabs - Fixed Below Button Row */}
      <div className="case-detail-view__tabs-container" style={{ backgroundColor }}>
        <div className="case-detail-view__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`case-tab ${activeTab === tab.id ? 'case-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="case-detail-view__content">
        <div className="case-detail-view__content-inner">
          <h2 className="content-heading">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>

          <div className="content-placeholder">
            <p>This is the content area for the <strong>{tabs.find(t => t.id === activeTab)?.label}</strong> tab.</p>
            <p>Notice how:</p>
            <ul>
              <li>There's no case ID or name at the top</li>
              <li>The background color matches the case button</li>
              <li>The case button row stays fixed at the top when you scroll</li>
              <li>The navigation tabs stay fixed right below the button row</li>
              <li>All 10 tabs are visible in the navigation bar</li>
            </ul>

            {/* Dummy content to demonstrate scrolling */}
            <div className="dummy-content">
              <h3>Sample Content Section 1</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>

              <h3>Sample Content Section 2</h3>
              <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

              <h3>Sample Content Section 3</h3>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>

              <h3>Sample Content Section 4</h3>
              <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

              <h3>Sample Content Section 5</h3>
              <p>Scroll down to see that both the case button row AND navigation tabs remain fixed at the top.</p>

              <h3>Sample Content Section 6</h3>
              <p>The sticky positioning ensures users can always access both the case switcher and navigation without scrolling back up.</p>

              <h3>Sample Content Section 7</h3>
              <p>Continue scrolling to test the sticky behavior - both elements should remain visible as you scroll.</p>

              <h3>Sample Content Section 8</h3>
              <p>More content here to demonstrate the scrolling behavior and sticky positioning of both elements.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
