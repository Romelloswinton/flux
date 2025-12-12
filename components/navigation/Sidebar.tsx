'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, LayoutTemplate, Sparkles, Users, FolderKanban, Plus, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mainNavItems = [
  {
    title: 'Home',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'My files',
    href: '/dashboard/files',
    icon: FileText,
  },
  {
    title: 'Templates',
    href: '/dashboard/templates',
    icon: LayoutTemplate,
  },
  {
    title: 'Generate',
    href: '/dashboard/generate',
    icon: Sparkles,
  },
  {
    title: 'Community',
    href: '/dashboard/community',
    icon: Users,
  },
];

const projectNavItems = [
  {
    title: 'Overview',
    href: '/dashboard/projects',
    icon: FolderKanban,
  },
  {
    title: 'New Project',
    href: '/dashboard/projects/new',
    icon: Plus,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "bg-background h-screen sticky top-0 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo/Brand Area */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-xl font-bold">Arc3D</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 hover:bg-accent rounded-md transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && item.title}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Projects Section */}
        {!isCollapsed && (
          <div className="mt-8">
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Projects
            </h3>
            <ul className="space-y-1">
              {projectNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {isCollapsed && (
          <div className="mt-8">
            <ul className="space-y-1">
              {projectNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      title={item.title}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Upgrade to Pro Section */}
      <div className="p-4">
        {!isCollapsed ? (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock AI-powered tools and premium features
            </p>
            <Button className="w-full" size="sm">
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            size="icon"
            title="Upgrade to Pro"
          >
            <Crown className="h-5 w-5" />
          </Button>
        )}
      </div>
    </aside>
  );
}
