import { Copy, Check, Clock, Cpu, Coins } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ConversationMessage, ContentBlock, ToolUseBlock as ToolUseBlockType, ToolResultBlock as ToolResultBlockType, TextBlock, ThinkingBlock as ThinkingBlockType, AssistantMessage } from '~/lib/types';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { formatNumber, safeFormatDate } from '~/lib/stats';
import { ToolUseBlock } from './ToolUseBlock';
import { ToolResultBlock } from './ToolResultBlock';
import { ThinkingBlock } from './ThinkingBlock';
import { MonacoCodeBlock } from './MonacoCodeBlock';
import { SpecialTagBlock } from './SpecialTagBlock';
import { parseSpecialTags } from '~/lib/parser';
import { log } from '~/lib/logger';

/**
 * Type guard to check if a message is an AssistantMessage
 */
function isAssistantMessage(message: ConversationMessage['message']): message is AssistantMessage {
  return 'model' in message && 'usage' in message;
}

// Code block component with Monaco Editor and copy button
function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'plaintext';

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((error) => {
      log.error('Failed to copy code to clipboard:', error);
    });
  };

  // Calculate appropriate height based on content
  const lineCount = children.trim().split('\n').length;
  const maxHeight = Math.min(
    Math.max(lineCount * 19 + 20, 50), // At least 50px, ~19px per line + padding
    600 // Cap at 600px
  );

  return (
    <figure className="relative group/code not-prose my-3">
      <div className="flex items-center justify-between bg-zinc-800 px-3 py-1.5 border-b border-zinc-700 rounded-t-lg">
        <span className="text-xs text-zinc-400 font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 opacity-0 group-hover/code:opacity-100 transition-opacity text-zinc-400 hover:text-white hover:bg-zinc-700"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <MonacoCodeBlock
        code={children}
        language={language}
        className="!mt-0 !rounded-t-none"
        maxHeight={maxHeight}
      />
    </figure>
  );
}

interface ChatMessageProps {
  message: ConversationMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.type === 'user';

  // Parse content blocks
  let textContent = '';
  let contentBlocks: ContentBlock[] = [];

  if (typeof message.message.content === 'string') {
    textContent = message.message.content;
  } else if (Array.isArray(message.message.content)) {
    contentBlocks = message.message.content as ContentBlock[];
    // Combine all text blocks (user messages can have multiple)
    const textBlocks = contentBlocks.filter(c => c.type === 'text') as TextBlock[];
    textContent = textBlocks.map(b => b.text).join('\n\n');
  }

  // Separate content blocks by type for better organization
  const thinkingBlocks = contentBlocks.filter(b => b.type === 'thinking') as ThinkingBlockType[];
  const toolUseBlocks = contentBlocks.filter(b => b.type === 'tool_use') as ToolUseBlockType[];
  const toolResultBlocks = contentBlocks.filter(b => b.type === 'tool_result') as ToolResultBlockType[];

  // Group tool uses with their results
  const toolPairs = toolUseBlocks.map(toolUse => {
    const result = toolResultBlocks.find(r => r.tool_use_id === toolUse.id);
    return { toolUse, result };
  });

  // Find orphaned tool results (results without a corresponding tool use)
  const orphanedResults = toolResultBlocks.filter(
    result => !toolUseBlocks.some(use => use.id === result.tool_use_id)
  );

  // Get usage and model data if this is an assistant message
  const usage = isAssistantMessage(message.message) ? message.message.usage : null;
  const model = isAssistantMessage(message.message) ? message.message.model : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((error) => {
      log.error('Failed to copy message to clipboard:', error);
    });
  };

  // Parse special tags from content
  const parsedContent = parseSpecialTags(textContent);
  const hasSpecialTags = parsedContent.some(p => p.type === 'special_tag');
  const textParts = parsedContent.filter(p => p.type === 'text');
  const specialTagParts = parsedContent.filter(p => p.type === 'special_tag');
  const mainTextContent = textParts.map(p => p.content).join('\n\n');

  // Check if this is a system-only message (only special tags, no user text)
  const isSystemOnly = hasSpecialTags && !mainTextContent.trim();

  // Check if this is a tool-result-only message (user message with only tool results, no text)
  const isToolResultOnly = isUser && toolResultBlocks.length > 0 && !mainTextContent.trim() && !hasSpecialTags;

  if (isUser) {
    // Tool-result-only messages: render nothing (results are shown with their tool use in assistant messages)
    if (isToolResultOnly) {
      return null;
    }

    // System-only messages: left-aligned, no bubble, minimal styling
    if (isSystemOnly) {
      return (
        <div className="py-1 px-4">
          <div className="flex flex-wrap gap-1">
            {specialTagParts.map((part, idx) => (
              <SpecialTagBlock key={idx} tagType={part.tagType!} content={part.content} />
            ))}
          </div>
        </div>
      );
    }

    // User message: right-aligned clean design
    return (
      <div className="group py-2 px-4">
        <div className="flex justify-end">
          <div className="max-w-[85%]">
            {/* Special tags shown as compact info blocks */}
            {hasSpecialTags && (
              <div className="mb-1.5 flex flex-wrap gap-1 justify-end">
                {specialTagParts.map((part, idx) => (
                  <SpecialTagBlock key={idx} tagType={part.tagType!} content={part.content} />
                ))}
              </div>
            )}

            {/* Main text content */}
            {mainTextContent && (
              <div className="bg-muted rounded-2xl rounded-br-sm px-4 py-2.5">
                <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: ({ children }) => <>{children}</>,
                      code: (props) => {
                        const { className, children } = props as { className?: string; children?: React.ReactNode };
                        const codeString = String(children).replace(/\n$/, '');
                        const isInline = !className && !codeString.includes('\n');
                        if (isInline) {
                          return (
                            <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          );
                        }
                        return <CodeBlock className={className}>{codeString}</CodeBlock>;
                      },
                      a: (props) => (
                        <a className="text-foreground underline hover:no-underline" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
                    }}
                  >
                    {mainTextContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Footer - only visible on hover, only if there's text content */}
            {mainTextContent && (
              <div className="flex items-center justify-end gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[11px] text-muted-foreground">
                  {safeFormatDate(message.timestamp, 'h:mm a')}
                </span>
                <button
                  className="p-1 rounded hover:bg-background/50 text-muted-foreground"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message: minimal clean design
  return (
    <div className="group py-2 px-4">
      {/* Thinking blocks (if any) */}
      {thinkingBlocks.length > 0 && (
        <div className="space-y-2 mb-2">
          {thinkingBlocks.map((block, idx) => (
            <ThinkingBlock key={idx} block={block} />
          ))}
        </div>
      )}

      {/* Special tags shown as compact info blocks */}
      {hasSpecialTags && (
        <div className="mb-2 flex flex-wrap gap-1">
          {specialTagParts.map((part, idx) => (
            <SpecialTagBlock key={idx} tagType={part.tagType!} content={part.content} />
          ))}
        </div>
      )}

      {/* Main text content */}
      {mainTextContent && (
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-pre:my-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ children }) => <>{children}</>,
              code: (props) => {
                const { className, children } = props;
                const codeString = String(children).replace(/\n$/, '');
                const isInline = !className && !codeString.includes('\n');
                if (isInline) {
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                return <CodeBlock className={className}>{codeString}</CodeBlock>;
              },
              a: (props) => (
                <a className="text-foreground underline hover:no-underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              table: (props) => (
                <div className="overflow-x-auto my-3 rounded border">
                  <table className="min-w-full" {...props} />
                </div>
              ),
              ul: (props) => <ul className="my-2 ml-4 list-disc" {...props} />,
              ol: (props) => <ol className="my-2 ml-4 list-decimal" {...props} />,
              li: (props) => <li className="my-0.5" {...props} />,
            }}
          >
            {mainTextContent}
          </ReactMarkdown>
        </div>
      )}

      {/* Tool calls and results */}
      {toolPairs.length > 0 && (
        <div className="mt-2 space-y-1">
          {toolPairs.map((pair, idx) => (
            <div key={idx}>
              <ToolUseBlock
                block={pair.toolUse}
                timestamp={idx === 0 ? message.timestamp : undefined}
                model={idx === 0 ? model : undefined}
                usage={idx === 0 ? usage : undefined}
              />
              {pair.result && (
                <ToolResultBlock block={pair.result} toolName={pair.toolUse.name} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Orphaned results */}
      {orphanedResults.length > 0 && (
        <div className="mt-2 space-y-1">
          {orphanedResults.map((result, idx) => (
            <ToolResultBlock key={idx} block={result} />
          ))}
        </div>
      )}

      {/* Footer - only show if there's text content (tools have their own copy buttons) */}
      {mainTextContent && (
        <div className="flex items-center justify-end gap-1.5 mt-2">
          {/* Timestamp */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Clock className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span>{safeFormatDate(message.timestamp, 'MMM d, yyyy h:mm a')}</span>
            </TooltipContent>
          </Tooltip>

          {/* Model */}
          {model && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Cpu className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>{model}</span>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Token usage */}
          {usage && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
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

          {/* Copy button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 rounded hover:bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span>{copied ? 'Copied!' : 'Copy message'}</span>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
