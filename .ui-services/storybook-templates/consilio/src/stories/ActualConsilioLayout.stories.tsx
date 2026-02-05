import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopBar } from '../consilio-components/layout/TopBar';
import { SideMenu } from '../consilio-components/layout/SideMenu';
import { AuthProvider, ActiveCaseProvider, SettingsProvider } from '../mocks/contexts';
import '../consilio-components/theme.css';

// Query client with mock data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Mock cases data
queryClient.setQueryData(['cases', 'all'], [
  { id: '1', case_number: 'CASE-001', title: 'Andersson Family' },
  { id: '2', case_number: 'CASE-002', title: 'Johansson Child' },
  { id: '3', case_number: 'CASE-003', title: 'Karlsson Emergency' },
  { id: '4', case_number: 'CASE-004', title: 'Nilsson Adoption' },
  { id: '5', case_number: 'CASE-005', title: 'Eriksson Custody' },
]);

const ActualConsilioLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cases/1']}>
        <AuthProvider>
          <ActiveCaseProvider>
            <SettingsProvider>
              <div className="fixed inset-0 flex bg-gray-50">
                <SideMenu />
                <div className="flex-1 flex flex-col">
                  <TopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
                  <main className="flex-1 bg-gray-50 pt-16 px-4 overflow-auto">
                    <div className="max-w-7xl mx-auto py-6">
                      <h1 className="text-2xl font-bold mb-4">Actual Consilio Layout</h1>
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2">Using Real Components</h2>
                        <p className="text-gray-600 mb-4">
                          This layout uses the actual Consilio components copied directly from the frontend.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                          <li>TopBar - Actual component from /components/layout/TopBar.tsx</li>
                          <li>SideMenu - Actual component from /components/layout/SideMenu.tsx</li>
                          <li>CaseButton - Actual component with badges</li>
                          <li>theme.css - Actual styling</li>
                        </ul>
                        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-800 font-medium">
                            ✅ Any changes made here can be copied directly back to Consilio
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            No more time wasted trying to match styling!
                          </p>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </SettingsProvider>
          </ActiveCaseProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const meta = {
  title: 'Actual/ConsilioLayout',
  component: ActualConsilioLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Actual Consilio Layout

**This story uses the ACTUAL Consilio components** copied directly from the frontend source code.

## How It Works

1. **Components copied from**: \`/home/samuel/sv/consilio-s/frontend/src/components/\`
2. **Stored in**: \`src/consilio-components/\`
3. **Mock contexts provided** for useAuth, useActiveCase, etc.
4. **Changes flow**: Edit here → Copy back to Consilio

## Benefits

✅ **Guaranteed identical** - Uses the real code
✅ **Direct copy-paste** - Changes go straight back
✅ **Zero styling effort** - No time matching colors/spacing
✅ **True preview** - What you see is what you get

## Making Changes

1. Edit the components in \`src/consilio-components/\`
2. See changes instantly in Storybook
3. When satisfied, copy files back to Consilio frontend
4. Done!
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActualConsilioLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
