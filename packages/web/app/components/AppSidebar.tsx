import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useProjects } from '~/hooks/useProjects';
import { getRecentConversations, toggleConversationStar, renameConversation } from '~/lib/api-client';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
  Check,
  MoreHorizontal,
  Star,
  Pencil,
} from 'lucide-react';

interface AppSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// Storage keys for section visibility
const STORAGE_KEY_STARRED_VISIBLE = 'rewind:starredVisible';
const STORAGE_KEY_RECENTS_VISIBLE = 'rewind:recentsVisible';

export function AppSidebar({ collapsed = false, onCollapsedChange }: AppSidebarProps) {
  const { projectId, conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projects } = useProjects();

  // Section visibility state
  const [starredVisible, setStarredVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_STARRED_VISIBLE) !== 'false';
    }
    return true;
  });
  const [recentsVisible, setRecentsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_RECENTS_VISIBLE) !== 'false';
    }
    return true;
  });

  // Persist section visibility
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STARRED_VISIBLE, String(starredVisible));
  }, [starredVisible]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECENTS_VISIBLE, String(recentsVisible));
  }, [recentsVisible]);

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Fetch all conversations
  const { data: allConversations = [] } = useQuery({
    queryKey: ['allConversations'],
    queryFn: () => getRecentConversations(500),
    staleTime: 30 * 1000,
  });

  // Split conversations into starred and recent
  const starredConversations = allConversations.filter(conv => conv.starred);
  const recentConversations = allConversations.filter(conv => !conv.starred);

  const handleToggleStar = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleConversationStar(sessionId);
    queryClient.invalidateQueries({ queryKey: ['allConversations'] });
  };

  const handleOpenRename = (sessionId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameSessionId(sessionId);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  };

  const handleRename = async () => {
    if (!renameSessionId) return;
    const trimmed = renameValue.trim();
    await renameConversation(renameSessionId, trimmed || null);
    queryClient.invalidateQueries({ queryKey: ['allConversations'] });
    setRenameDialogOpen(false);
    setRenameSessionId(null);
    setRenameValue('');
  };

  const currentProject = projects.find(p => p.id === projectId);

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="h-full flex flex-col bg-muted/50 border-r w-14">
          {/* Toggle button */}
          <div className="p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onCollapsedChange?.(false)}
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full flex flex-col bg-muted/50 border-r w-64">
        {/* Header with Project Switcher and Toggle */}
        <div className="p-2 flex items-center gap-1">
          {/* Project Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 justify-between h-12 px-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {currentProject?.displayName || 'Select Project'}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              <ScrollArea className="max-h-[300px]">
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span className="truncate">{project.displayName}</span>
                    {projectId === project.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onCollapsedChange?.(true)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="px-2 py-2 space-y-4 overflow-hidden">
            {/* Starred Section */}
            {starredConversations.length > 0 && (
              <div>
                <SectionHeader
                  title="Starred"
                  visible={starredVisible}
                  onToggleVisible={() => setStarredVisible(!starredVisible)}
                />
                {starredVisible && (
                  <div className="space-y-0.5 mt-1">
                    {starredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.sessionId}
                        sessionId={conv.sessionId}
                        preview={conv.customName || conv.preview}
                        starred={conv.starred}
                        active={conversationId === conv.sessionId}
                        onClick={() => navigate(`/project/${conv.projectId}/conversation/${conv.sessionId}`)}
                        onToggleStar={handleToggleStar}
                        onRename={(e) => handleOpenRename(conv.sessionId, conv.customName || conv.preview, e)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recents Section */}
            <div>
              <SectionHeader
                title="Recents"
                visible={recentsVisible}
                onToggleVisible={() => setRecentsVisible(!recentsVisible)}
              />
              {recentsVisible && (
                <div className="space-y-0.5 mt-1">
                  {recentConversations.map((conv) => (
                    <ConversationItem
                      key={conv.sessionId}
                      sessionId={conv.sessionId}
                      preview={conv.customName || conv.preview}
                      starred={conv.starred}
                      active={conversationId === conv.sessionId}
                      onClick={() => navigate(`/project/${conv.projectId}/conversation/${conv.sessionId}`)}
                      onToggleStar={handleToggleStar}
                      onRename={(e) => handleOpenRename(conv.sessionId, conv.customName || conv.preview, e)}
                    />
                  ))}
                  {recentConversations.length === 0 && starredConversations.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No conversations yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter a custom name..."
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-2">
              Leave empty to use the original preview text.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

interface SectionHeaderProps {
  title: string;
  visible: boolean;
  onToggleVisible: () => void;
}

function SectionHeader({ title, visible, onToggleVisible }: SectionHeaderProps) {
  return (
    <div
      className="group/section flex items-center justify-between px-3 py-1 cursor-pointer hover:bg-muted/50 rounded-md"
      onClick={onToggleVisible}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onToggleVisible()}
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </span>
      <span className="text-[10px] text-muted-foreground opacity-0 group-hover/section:opacity-100 transition-opacity">
        {visible ? 'Hide' : 'Show'}
      </span>
    </div>
  );
}

interface ConversationItemProps {
  sessionId: string;
  preview: string;
  starred?: boolean;
  active?: boolean;
  onClick: () => void;
  onToggleStar: (sessionId: string, e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
}

function ConversationItem({ sessionId, preview, starred, active, onClick, onToggleStar, onRename }: ConversationItemProps) {
  const displayText = preview || 'Untitled conversation';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'group/item relative px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
        'hover:bg-muted/80',
        'text-foreground/90',
        active && 'bg-muted font-medium'
      )}
      style={{ maxWidth: '240px' }}
    >
      <span className="block overflow-hidden text-ellipsis whitespace-nowrap pr-6">
        {displayText}
      </span>

      {/* Hover menu */}
      <div className={cn(
        'absolute right-1 top-1/2 -translate-y-1/2',
        'opacity-0 group-hover/item:opacity-100 transition-opacity'
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={(e) => onToggleStar(sessionId, e)}>
              <Star className={cn('mr-2 h-4 w-4', starred && 'fill-yellow-500 text-yellow-500')} />
              {starred ? 'Remove from starred' : 'Add to starred'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
