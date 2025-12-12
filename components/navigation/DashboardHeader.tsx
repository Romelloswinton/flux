'use client';

import { Search, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function DashboardHeader() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
                    onClick={() => setIsCreateOpen(false)}
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
      </div>
    </header>
  );
}
