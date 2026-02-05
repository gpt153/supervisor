import React, { createContext, useContext, useState } from 'react';

// Auth Context
interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mockUser = { id: '1', email: 'admin@example.com', role: 'ADMIN' };

  return (
    <AuthContext.Provider value={{
      user: mockUser,
      isAuthenticated: true,
      logout: () => console.log('Logout clicked'),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// Active Case Context
interface ActiveCaseContextType {
  activeCaseId: string | null;
  setActiveCaseId: (id: string) => void;
}

const ActiveCaseContext = createContext<ActiveCaseContextType | undefined>(undefined);

export function ActiveCaseProvider({ children }: { children: React.ReactNode }) {
  const [activeCaseId, setActiveCaseId] = useState<string | null>('1');

  return (
    <ActiveCaseContext.Provider value={{ activeCaseId, setActiveCaseId }}>
      {children}
    </ActiveCaseContext.Provider>
  );
}

export function useActiveCase() {
  const context = useContext(ActiveCaseContext);
  if (!context) throw new Error('useActiveCase must be used within ActiveCaseProvider');
  return context;
}

// Settings Context
interface SettingsContextType {
  maxVisibleCases: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SettingsContext.Provider value={{ maxVisibleCases: '5' }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useCaseSwitcherSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useCaseSwitcherSettings must be used within SettingsProvider');
  return context;
}

// Badge Counts Hook
export function useBadgeCounts() {
  return {
    data: [
      { caseId: '1', unreadEmails: 3, urgentItems: 1, aiPending: 0 },
      { caseId: '2', unreadEmails: 0, urgentItems: 2, aiPending: 1 },
      { caseId: '3', unreadEmails: 15, urgentItems: 5, aiPending: 2 },
      { caseId: '4', unreadEmails: 0, urgentItems: 0, aiPending: 0 },
      { caseId: '5', unreadEmails: 7, urgentItems: 0, aiPending: 3 },
    ],
  };
}
