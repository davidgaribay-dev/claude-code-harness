import { FileCode, FileText, Terminal, AlertCircle, Info, Settings, Bug, Webhook } from 'lucide-react';
import type { SpecialTagType } from '~/lib/parser';

interface SpecialTagBlockProps {
  tagType: SpecialTagType;
  content: string;
}

/**
 * Renders special Claude Code tags in a nice, readable format
 */
export function SpecialTagBlock({ tagType, content }: SpecialTagBlockProps) {
  switch (tagType) {
    case 'ide_opened_file':
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 my-1">
          <FileCode className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            Opened: <span className="font-mono text-foreground/80">{extractFilePath(content)}</span>
          </span>
        </div>
      );

    case 'ide_selection':
      return (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 my-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
            <span>Selected code</span>
          </div>
          <pre className="font-mono text-[10px] bg-background/50 rounded p-2 overflow-x-auto max-h-24 overflow-y-auto">
            {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
          </pre>
        </div>
      );

    case 'command-name':
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-500/10 rounded px-2 py-1.5 my-1">
          <Terminal className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          <span>Command: <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{content}</span></span>
        </div>
      );

    case 'local-command-stdout':
      return (
        <div className="text-xs text-muted-foreground bg-green-500/10 rounded px-2 py-1.5 my-1">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
            <span className="text-green-600 dark:text-green-400">Output</span>
          </div>
          {content && (
            <pre className="font-mono text-[10px] bg-background/50 rounded p-2 overflow-x-auto max-h-24 overflow-y-auto whitespace-pre-wrap">
              {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
            </pre>
          )}
        </div>
      );

    case 'local-command-stderr':
      return (
        <div className="text-xs text-muted-foreground bg-red-500/10 rounded px-2 py-1.5 my-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
            <span className="text-red-600 dark:text-red-400">Error Output</span>
          </div>
          {content && (
            <pre className="font-mono text-[10px] bg-background/50 rounded p-2 overflow-x-auto max-h-24 overflow-y-auto whitespace-pre-wrap">
              {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
            </pre>
          )}
        </div>
      );

    case 'system-reminder':
      return (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-yellow-500/10 rounded px-2 py-1.5 my-1">
          <Info className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500 mt-0.5" />
          <span className="text-yellow-700 dark:text-yellow-400 italic">
            System: {content.substring(0, 150)}{content.length > 150 ? '...' : ''}
          </span>
        </div>
      );

    case 'command-message':
    case 'command-args':
      // These are usually shown alongside command-name, render minimally
      return (
        <div className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-2 py-1 my-0.5">
          {content}
        </div>
      );

    case 'local-command-caveat':
      return (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-orange-500/10 rounded px-2 py-1.5 my-1">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-orange-500 mt-0.5" />
          <span className="text-orange-700 dark:text-orange-400">
            {content.substring(0, 200)}{content.length > 200 ? '...' : ''}
          </span>
        </div>
      );

    case 'env':
      return (
        <div className="text-xs text-muted-foreground bg-slate-500/10 rounded px-2 py-1.5 my-1">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-3.5 w-3.5 flex-shrink-0 text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400">Environment</span>
          </div>
          <pre className="font-mono text-[10px] bg-background/50 rounded p-2 overflow-x-auto max-h-24 overflow-y-auto whitespace-pre-wrap">
            {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
          </pre>
        </div>
      );

    case 'ide_diagnostics':
      return (
        <div className="text-xs text-muted-foreground bg-purple-500/10 rounded px-2 py-1.5 my-1">
          <div className="flex items-center gap-2 mb-1">
            <Bug className="h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
            <span className="text-purple-600 dark:text-purple-400">IDE Diagnostics</span>
          </div>
          <pre className="font-mono text-[10px] bg-background/50 rounded p-2 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
            {content.substring(0, 800)}{content.length > 800 ? '...' : ''}
          </pre>
        </div>
      );

    case 'user-prompt-submit-hook':
      return (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-cyan-500/10 rounded px-2 py-1.5 my-1">
          <Webhook className="h-3.5 w-3.5 flex-shrink-0 text-cyan-500 mt-0.5" />
          <span className="text-cyan-700 dark:text-cyan-400">
            Hook: {content.substring(0, 150)}{content.length > 150 ? '...' : ''}
          </span>
        </div>
      );

    default:
      // Fallback for any unknown tags - show as generic info block
      return (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 my-1">
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span className="break-all">
            {content.substring(0, 150)}{content.length > 150 ? '...' : ''}
          </span>
        </div>
      );
  }
}

/**
 * Extract file path from ide_opened_file content
 * Content format: "The user opened the file /path/to/file in the IDE..."
 */
function extractFilePath(content: string): string {
  // Try to extract path from the standard format
  const match = content.match(/opened the file ([^\s]+) in the IDE/);
  if (match) {
    return match[1];
  }
  // Fallback: return the whole content truncated
  return content.length > 60 ? content.substring(0, 60) + '...' : content;
}
