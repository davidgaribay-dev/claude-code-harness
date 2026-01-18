import { useState } from 'react';
import { ChevronDown, Terminal, FileText, Search, Globe, Code, Wrench, Copy, Check, Pen, FileSearch, Play, Clock, Cpu, Coins } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MonacoCodeBlock } from './MonacoCodeBlock';
import { MonacoDiffBlock } from './MonacoDiffBlock';
import { formatNumber, safeFormatDate } from '~/lib/stats';
import type { ToolUseBlock as ToolUseBlockType, Usage } from '~/lib/types';

interface ToolUseBlockProps {
  block: ToolUseBlockType;
  timestamp?: string;
  model?: string | null;
  usage?: Usage | null;
}

// Map tool names to icons and metadata - using consistent neutral colors
const toolConfig: Record<string, { icon: typeof Terminal; label: string; category: string }> = {
  Bash: {
    icon: Terminal,
    label: 'Terminal',
    category: 'Execution'
  },
  Read: {
    icon: FileText,
    label: 'Read File',
    category: 'File System'
  },
  Grep: {
    icon: Search,
    label: 'Search Content',
    category: 'Search'
  },
  Glob: {
    icon: FileSearch,
    label: 'Find Files',
    category: 'Search'
  },
  Write: {
    icon: Pen,
    label: 'Write File',
    category: 'File System'
  },
  Edit: {
    icon: Code,
    label: 'Edit File',
    category: 'File System'
  },
  WebFetch: {
    icon: Globe,
    label: 'Fetch Web Content',
    category: 'Web'
  },
  WebSearch: {
    icon: Search,
    label: 'Search Web',
    category: 'Web'
  },
  Task: {
    icon: Play,
    label: 'Execute Task',
    category: 'Agent'
  },
};

export function ToolUseBlock({ block, timestamp, model, usage }: ToolUseBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = toolConfig[block.name] || {
    icon: Wrench,
    label: block.name,
    category: 'Tool'
  };
  const Icon = config.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(block.input, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract description if available
  const description = block.input.description as string | undefined;
  const otherInputs = { ...block.input };
  if (description) {
    delete otherInputs.description;
  }

  // Get primary parameter for quick view
  const primaryParam = Object.entries(otherInputs)[0];

  return (
    <div className="border rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted border flex-shrink-0 text-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-sm">{config.label}</span>
                <Badge variant="outline" className="text-xs font-mono h-5">
                  {block.name}
                </Badge>
                <Badge variant="secondary" className="text-xs h-5">
                  {config.category}
                </Badge>
              </div>
              {description && (
                <p className="text-xs text-foreground/80 mb-2 leading-relaxed">{description}</p>
              )}
              {!isOpen && primaryParam && (
                <div className="text-xs text-muted-foreground font-mono truncate">
                  <span className="font-semibold">{primaryParam[0]}:</span>{' '}
                  {typeof primaryParam[1] === 'string'
                    ? primaryParam[1].length > 60
                      ? primaryParam[1].slice(0, 60) + '...'
                      : primaryParam[1]
                    : JSON.stringify(primaryParam[1]).slice(0, 60)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* Metadata icons - only show if provided */}
            {timestamp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Clock className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>{safeFormatDate(timestamp, 'MMM d, yyyy h:mm a')}</span>
                </TooltipContent>
              </Tooltip>
            )}
            {model && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Cpu className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>{model}</span>
                </TooltipContent>
              </Tooltip>
            )}
            {usage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Coins className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs space-y-0.5">
                    <div>In: {formatNumber(usage.input_tokens)}</div>
                    <div>Out: {formatNumber(usage.output_tokens)}</div>
                    {usage.cache_read_input_tokens != null && usage.cache_read_input_tokens > 0 && (
                      <div>Cached: {formatNumber(usage.cache_read_input_tokens)}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              title="Copy parameters"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <ChevronDown className={`h-4 w-4 transition-transform text-muted-foreground ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-3 pt-1">
            <div className="space-y-2.5 pl-11">
              {/* Special case: Edit tool with old_string and new_string - show diff view */}
              {block.name === 'Edit' && 'old_string' in otherInputs && 'new_string' in otherInputs ? (
                <>
                  {/* Show file_path if present */}
                  {'file_path' in otherInputs && (
                    <div className="space-y-1 mb-3">
                      <div className="text-xs font-semibold text-foreground/70">file_path</div>
                      <div className="text-xs font-mono bg-muted/50 p-2 rounded border">
                        {String(otherInputs.file_path)}
                      </div>
                    </div>
                  )}

                  {/* Detect language from file_path */}
                  {(() => {
                    const filePath = String(otherInputs.file_path || '');
                    let language = 'plaintext';

                    if (filePath.endsWith('.tsx')) language = 'tsx';
                    else if (filePath.endsWith('.ts')) language = 'typescript';
                    else if (filePath.endsWith('.jsx')) language = 'jsx';
                    else if (filePath.endsWith('.js')) language = 'javascript';
                    else if (filePath.endsWith('.json')) language = 'json';
                    else if (filePath.endsWith('.css')) language = 'css';
                    else if (filePath.endsWith('.md')) language = 'markdown';
                    else if (filePath.endsWith('.py')) language = 'python';
                    else if (filePath.endsWith('.rs')) language = 'rust';
                    else if (filePath.endsWith('.go')) language = 'go';

                    return (
                      <MonacoDiffBlock
                        original={String(otherInputs.old_string)}
                        modified={String(otherInputs.new_string)}
                        language={language}
                        maxHeight={500}
                      />
                    );
                  })()}

                  {/* Show any other parameters besides file_path, old_string, new_string */}
                  {Object.entries(otherInputs)
                    .filter(([key]) => !['file_path', 'old_string', 'new_string'].includes(key))
                    .map(([key, value]) => {
                      const isString = typeof value === 'string';
                      const content = isString ? value : JSON.stringify(value, null, 2);
                      const language = isString ? 'plaintext' : 'json';
                      const lineCount = content.trim().split('\n').length;

                      // Use simple code block for short content (3 lines or less)
                      if (lineCount <= 3) {
                        return (
                          <div key={key} className="space-y-1">
                            <div className="text-xs font-semibold text-foreground/70">{key}</div>
                            <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto">
                              <code>{content}</code>
                            </pre>
                          </div>
                        );
                      }

                      // Use Monaco for longer content
                      const estimatedHeight = Math.min(
                        Math.max(lineCount * 19 + 20, 50),
                        300
                      );

                      return (
                        <div key={key} className="space-y-1">
                          <div className="text-xs font-semibold text-foreground/70">{key}</div>
                          <MonacoCodeBlock
                            code={content}
                            language={language}
                            maxHeight={estimatedHeight}
                          />
                        </div>
                      );
                    })}
                </>
              ) : (
                /* Default view: show all parameters */
                Object.entries(otherInputs).map(([key, value]) => {
                  const isString = typeof value === 'string';
                  const content = isString ? value : JSON.stringify(value, null, 2);
                  const lineCount = content.trim().split('\n').length;

                  // Detect language from file_path for Write tool or content parameter
                  let language = isString ? 'plaintext' : 'json';

                  if (block.name === 'Write' && key === 'content' && 'file_path' in otherInputs) {
                    const filePath = String(otherInputs.file_path || '');
                    if (filePath.endsWith('.tsx')) language = 'tsx';
                    else if (filePath.endsWith('.ts')) language = 'typescript';
                    else if (filePath.endsWith('.jsx')) language = 'jsx';
                    else if (filePath.endsWith('.js')) language = 'javascript';
                    else if (filePath.endsWith('.json')) language = 'json';
                    else if (filePath.endsWith('.css')) language = 'css';
                    else if (filePath.endsWith('.md')) language = 'markdown';
                    else if (filePath.endsWith('.py')) language = 'python';
                    else if (filePath.endsWith('.rs')) language = 'rust';
                    else if (filePath.endsWith('.go')) language = 'go';
                    else if (filePath.endsWith('.html')) language = 'html';
                    else if (filePath.endsWith('.xml')) language = 'xml';
                    else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) language = 'yaml';
                    else if (filePath.endsWith('.sh')) language = 'shell';
                    else if (filePath.endsWith('.sql')) language = 'sql';
                  }

                  // Use simple code block for short content (3 lines or less)
                  if (lineCount <= 3) {
                    return (
                      <div key={key} className="space-y-1">
                        <div className="text-xs font-semibold text-foreground/70">{key}</div>
                        <pre className="text-xs font-mono bg-muted/50 p-2 rounded border overflow-x-auto">
                          <code>{content}</code>
                        </pre>
                      </div>
                    );
                  }

                  // Use Monaco for longer content
                  const estimatedHeight = Math.min(
                    Math.max(lineCount * 19 + 20, 50),
                    300
                  );

                  return (
                    <div key={key} className="space-y-1">
                      <div className="text-xs font-semibold text-foreground/70">{key}</div>
                      <MonacoCodeBlock
                        code={content}
                        language={language}
                        maxHeight={estimatedHeight}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
