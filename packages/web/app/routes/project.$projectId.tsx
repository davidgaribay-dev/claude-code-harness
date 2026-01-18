import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import type { Route } from './+types/project.$projectId';
import { useProjects } from '~/hooks/useProjects';
import { AppSidebar } from '~/components/AppSidebar';
import { Button } from '~/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Project - Rewind` },
    { name: 'description', content: 'View all conversations and statistics for this Claude Code project' },
  ];
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rewind:sidebarCollapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('rewind:sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const project = projects.find((p) => p.id === projectId);

  if (loading) {
    return (
      <div className="h-screen flex">
        <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex">
        <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Empty state - conversations are accessed via sidebar */}
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Select a conversation from the sidebar</p>
            <p className="text-sm mt-1">Conversations for {project.displayName} are listed on the left</p>
          </div>
        </div>
      </div>
    </div>
  );
}
