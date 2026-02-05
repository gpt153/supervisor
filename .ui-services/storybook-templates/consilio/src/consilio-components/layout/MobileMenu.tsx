import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Folder,
  Calendar,
  FileText,
  CheckSquare,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Ärenden', path: '/cases', icon: Folder },
  { name: 'AI Approvals', path: '/approvals', icon: Sparkles },
  { name: 'Kalender', path: '/calendar', icon: Calendar },
  { name: 'Dokument', path: '/documents', icon: FileText },
  { name: 'Uppgifter', path: '/tasks', icon: CheckSquare },
  { name: 'Inställningar', path: '/settings', icon: Settings },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps): JSX.Element {
  const location = useLocation();

  if (!isOpen) return <></>;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in menu */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-background border-r z-50 transform transition-transform duration-200 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Meny</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Stäng meny"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
