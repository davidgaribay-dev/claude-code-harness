import { useState, useEffect } from 'react';
import type { Route } from './+types/home';
import { AppSidebar } from '~/components/AppSidebar';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Rewind - AI Conversation History' },
    { name: 'description', content: 'Browse and analyze your Claude Code conversation history' },
  ];
}

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rewind:sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('rewind:sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Empty state - conversations are accessed via sidebar */}
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Select a conversation from the sidebar</p>
            <p className="text-sm mt-1">Your recent conversations are listed on the left</p>
          </div>
        </div>
      </div>
    </div>
  );
}
