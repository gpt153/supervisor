import React, { useState } from 'react';
import { IntegratedTopNav } from './IntegratedTopNav';
import './IntegratedCaseView.css';

export interface IntegratedCaseViewProps {
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

export const IntegratedCaseView: React.FC<IntegratedCaseViewProps> = ({
  backgroundColor,
  activeTab: initialActiveTab = 'oversikt'
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  return (
    <div className="integrated-case-view" style={{ backgroundColor }}>
      {/* Integrated Top Navigation with Case Filing Tabs */}
      <IntegratedTopNav />

      {/* Sticky Navigation Tabs - Now Directly Below Integrated Nav */}
      <div className="integrated-case-view__tabs-container" style={{ backgroundColor }}>
        <div className="integrated-case-view__tabs">
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
      <div className="integrated-case-view__content">
        <div className="integrated-case-view__content-inner">
          <h2 className="content-heading">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>

          <div className="content-placeholder">
            <p>This is the <strong>NEW INTEGRATED LAYOUT</strong> for the {tabs.find(t => t.id === activeTab)?.label} tab.</p>
            <p>Notice how:</p>
            <ul>
              <li><strong>Case filing tabs are now in the main top navigation</strong> (no separate row)</li>
              <li>Search field and "Ny" button have been removed</li>
              <li>Profile icon moved to side menu (not shown in this mockup)</li>
              <li>The filing tabs use the same beautiful design with filing cabinet effect</li>
              <li>Active tab (white) stands out prominently</li>
              <li>Inactive tabs (medium gray) are visible but subdued</li>
              <li>Background (dark gray) provides depth</li>
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
              <p>Scroll down to see that both the integrated top nav AND navigation tabs remain fixed at the top.</p>

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
