// Updated: 2026-02-05 - Replaced profile dropdown with logout navigation item
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Folder,
  Calendar,
  FileText,
  CheckSquare,
  Settings,
  Sparkles,
  FileStack,
  Users,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const baseNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Ärenden', path: '/cases', icon: Folder },
  { name: 'AI Approvals', path: '/approvals', icon: Sparkles },
  { name: 'Kalender', path: '/calendar', icon: Calendar },
  { name: 'Dokument', path: '/documents', icon: FileText },
  { name: 'Uppgifter', path: '/tasks', icon: CheckSquare },
  { name: 'Inställningar', path: '/settings', icon: Settings },
];

const adminNavItems = [
  { name: 'Familjehem', path: '/familjehem', icon: Users },
  { name: 'Placement Requests', path: '/placement-requests', icon: ClipboardList },
  { name: 'Dokumentmallar', path: '/admin/templates', icon: FileStack },
];

interface SideMenuProps {
  className?: string;
}

export function SideMenu({ className }: SideMenuProps): JSX.Element {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1920;

  // Check if we're on a case detail page - if so, sidebar items should be inactive
  const isOnCaseDetailPage = location.pathname.includes('/cases/') && !location.pathname.endsWith('/cases');

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const handleLogout = (): void => {
    logout();
  };

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col border-r bg-background',
        isTablet ? 'w-16' : 'w-60',
        className
      )}
    >
      <nav className="flex-1 pt-16 px-4 space-y-1">
        {/* Base Navigation Items */}
        {baseNavItems.map((item) => {
          const Icon = item.icon;
          // Only show as active if NOT on case detail page AND route matches
          const isActive = !isOnCaseDetailPage && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'filing-tab flex items-center gap-3 px-4 py-3 rounded-l-lg transition-all border-l-2 border-t-2 border-b-2',
                isActive
                  ? 'filing-tab--active'
                  : 'filing-tab',
                isTablet && 'justify-center'
              )}
              style={isActive ? {
                backgroundColor: '#ffffff',
                color: '#111827',
                borderColor: '#d1d5db',
              } : {
                backgroundColor: '#e5e7eb',
                color: '#374151',
                borderColor: '#d1d5db',
              }}
              title={isTablet ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isTablet && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-4 border-t" />
            {!isTablet && (
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Administration
              </div>
            )}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              // Only show as active if NOT on case detail page AND route matches
              const isActive = !isOnCaseDetailPage && (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'filing-tab flex items-center gap-3 px-4 py-3 rounded-l-lg transition-all border-l-2 border-t-2 border-b-2',
                    isActive
                      ? 'filing-tab--active'
                      : 'filing-tab',
                    isTablet && 'justify-center'
                  )}
                  style={isActive ? {
                    backgroundColor: '#ffffff',
                    color: '#111827',
                    borderColor: '#d1d5db',
                  } : {
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    borderColor: '#d1d5db',
                  }}
                  title={isTablet ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isTablet && <span className="font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </>
        )}

        {/* Logout Section */}
        <div className="mt-auto border-t pt-4">
          <button
            onClick={handleLogout}
            className={cn(
              'filing-tab w-full flex items-center gap-3 px-4 py-3 rounded-l-lg transition-all border-l-2 border-t-2 border-b-2',
              'filing-tab',
              isTablet && 'justify-center'
            )}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              borderColor: '#d1d5db',
            }}
            title={isTablet ? 'Logga ut' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isTablet && <span className="font-medium">Logga ut</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}
