'use client';

import { Search, Sparkles, Plus, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    const names = user.user_metadata.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <header className="bg-background sticky top-0 z-10">
      <div className="flex items-center justify-end gap-3 px-8 py-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border bg-background pl-9 pr-4 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
          />
        </div>

        {/* AI 3D Generation Button */}
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI 3D Generation
        </Button>

        {/* Create Dropdown Button */}
        <div className="relative">
          <Button
            onClick={() => setIsCreateOpen(!isCreateOpen)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-4 w-4" />
          </Button>

          {isCreateOpen && (
            <>
              {/* Backdrop to close dropdown */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsCreateOpen(false)}
              />

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-lg z-20">
                <div className="p-1">
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    New Project
                  </button>
                  <button
                    onClick={() => {
                      setIsCreateOpen(false);
                      router.push('/dashboard/overlay-builder');
                    }}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    New Overlay
                  </button>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    New Widget
                  </button>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    New Badge
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold hover:shadow-lg transition-shadow border-2 border-white shadow-md"
            title={user?.user_metadata?.full_name || user?.email || 'Profile'}
          >
            {getUserInitials()}
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <div className="font-medium text-sm">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>

              {/* Profile Option */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  router.push('/dashboard/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {/* Settings Option */}
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  router.push('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <div className="border-t border-border my-2"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
