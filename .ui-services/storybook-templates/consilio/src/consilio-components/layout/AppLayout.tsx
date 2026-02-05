import { useState } from 'react';
import { TopBar } from './TopBar';
import { SideMenu } from './SideMenu';
import { MobileMenu } from './MobileMenu';
import { CaseSwitcherDropdown } from '@/components/cases/CaseSwitcherDropdown';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';
import { ActiveCaseProvider } from '@/contexts/ActiveCaseContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatPanel } from '@/components/chat/ChatPanel';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout wrapper
 * Provides TopBar with integrated case tabs, SideMenu, responsive mobile menu
 */
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = (): void => {
    setMobileMenuOpen(false);
  };

  return (
    <ActiveCaseProvider>
      <ChatProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Side Menu (Desktop/Tablet) */}
          <SideMenu />

          {/* Mobile Menu */}
          <MobileMenu isOpen={mobileMenuOpen} onClose={handleMenuClose} />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Top Bar with Integrated Case Tabs */}
            <TopBar onMenuClick={handleMenuToggle} />

            {/* Case Switcher - Mobile */}
            <CaseSwitcherDropdown />

            {/* Page Content - Account for fixed header with pt-16 */}
            <main className="flex-1 overflow-y-auto bg-gray-50 pt-16">
              {children}
            </main>
          </div>
        </div>

        {/* Internal Chat Panel (Floating) */}
        <ChatPanel />

        {/* Beta Testing Feedback Button */}
        <FeedbackButton />
      </ChatProvider>
    </ActiveCaseProvider>
  );
}
