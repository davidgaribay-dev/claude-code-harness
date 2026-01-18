import type { ConversationMessage, Conversation, Project, AssistantMessage, TextBlock } from './types';
import { log } from './logger';

/**
 * Special tags used by Claude Code that should be parsed and rendered nicely
 * These are XML-like tags embedded in text content by the Claude Code CLI/extension
 */
export type SpecialTagType =
  | 'ide_opened_file'        // File opened in IDE
  | 'ide_selection'          // Code selected in IDE
  | 'system-reminder'        // System reminders injected by Claude Code
  | 'local-command-stdout'   // Output from local commands
  | 'local-command-stderr'   // Error output from local commands
  | 'local-command-caveat'   // Caveats about local command output
  | 'command-name'           // Slash command name
  | 'command-message'        // Slash command message
  | 'command-args'           // Slash command arguments
  | 'env'                    // Environment info
  | 'ide_diagnostics'        // IDE diagnostics/errors
  | 'user-prompt-submit-hook'; // Hook feedback

export interface ParsedContentPart {
  type: 'text' | 'special_tag';
  content: string;
  tagType?: SpecialTagType;
}

/**
 * Parse text content to extract special XML-like tags used by Claude Code
 */
export function parseSpecialTags(text: string): ParsedContentPart[] {
  const parts: ParsedContentPart[] = [];

  // Pattern to match special tags: <tag_name>content</tag_name>
  const tagPattern = /<(ide_opened_file|ide_selection|system-reminder|local-command-stdout|local-command-stderr|local-command-caveat|command-name|command-message|command-args|env|ide_diagnostics|user-prompt-submit-hook)>([\s\S]*?)<\/\1>/g;

  let lastIndex = 0;
  let match;

  while ((match = tagPattern.exec(text)) !== null) {
    // Add text before this tag
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index).trim();
      if (textBefore) {
        parts.push({ type: 'text', content: textBefore });
      }
    }

    // Add the special tag
    parts.push({
      type: 'special_tag',
      tagType: match[1] as SpecialTagType,
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last tag
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }
  }

  // If no tags found, return original text
  if (parts.length === 0 && text.trim()) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}

/**
 * Strip special tags from text for preview purposes
 */
export function stripSpecialTags(text: string): string {
  return text
    .replace(/<(ide_opened_file|ide_selection|system-reminder|local-command-stdout|local-command-stderr|local-command-caveat|command-name|command-message|command-args|env|ide_diagnostics|user-prompt-submit-hook)>[\s\S]*?<\/\1>/g, '')
    .trim();
}

/**
 * Type guard to check if a message is an AssistantMessage
 */
function isAssistantMessage(message: ConversationMessage['message']): message is AssistantMessage {
  return 'model' in message && 'usage' in message;
}

/**
 * Parse a JSONL file into conversation messages
 */
export async function parseJSONLFile(file: File): Promise<ConversationMessage[]> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());

  return lines
    .map(line => {
      try {
        return JSON.parse(line) as ConversationMessage;
      } catch (error) {
        log.error('Failed to parse line:', error, { line });
        return null;
      }
    })
    .filter((msg): msg is ConversationMessage => msg !== null);
}

/**
 * Extract a preview from conversation messages (first user message)
 * Strips special tags and combines all text blocks
 */
export function extractPreview(messages: ConversationMessage[]): string {
  const firstUserMessage = messages.find(msg => msg.type === 'user');

  if (!firstUserMessage) return 'No user messages';

  const content = firstUserMessage.message.content;

  if (typeof content === 'string') {
    const cleaned = stripSpecialTags(content);
    return cleaned.substring(0, 100) || 'No text content';
  }

  if (Array.isArray(content)) {
    // Combine all text blocks, strip special tags
    const textBlocks = content.filter(c => c.type === 'text') as TextBlock[];
    const combinedText = textBlocks.map(b => b.text).join(' ');
    const cleaned = stripSpecialTags(combinedText);
    return cleaned.substring(0, 100) || 'No text content';
  }

  return 'Unknown content type';
}

/**
 * Extract model information from messages
 */
export function extractModel(messages: ConversationMessage[]): string | undefined {
  const assistantMessage = messages.find(msg => msg.type === 'assistant');

  if (assistantMessage && isAssistantMessage(assistantMessage.message)) {
    return assistantMessage.message.model;
  }

  return undefined;
}

/**
 * Calculate total tokens from messages
 */
export function calculateTokens(messages: ConversationMessage[]): {
  total: number;
  input: number;
  output: number;
} {
  let input = 0;
  let output = 0;

  messages.forEach(msg => {
    if (isAssistantMessage(msg.message)) {
      const usage = msg.message.usage;
      if (usage) {
        input += usage.input_tokens || 0;
        output += usage.output_tokens || 0;
      }
    }
  });

  return {
    total: input + output,
    input,
    output
  };
}

/**
 * Parse project name from folder name
 */
export function parseProjectName(folderName: string): string {
  // Remove leading dash and split by dashes
  const parts = folderName.replace(/^-/, '').split('-');

  // Take the last part as the project name
  return parts[parts.length - 1] || folderName;
}

/**
 * Load a single project directory
 */
export async function loadProject(
  directoryHandle: FileSystemDirectoryHandle
): Promise<Project> {
  const conversations: Conversation[] = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.jsonl')) {
      try {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const messages = await parseJSONLFile(file);

        if (messages.length === 0) continue;

        const tokens = calculateTokens(messages);

        conversations.push({
          sessionId: messages[0]?.sessionId || '',
          uuid: entry.name.replace('.jsonl', ''),
          timestamp: new Date(messages[0]?.timestamp || 0),
          messageCount: messages.length,
          preview: extractPreview(messages),
          type: messages[0]?.type || 'user',
          messages,
          model: extractModel(messages),
          totalTokens: tokens.total,
          inputTokens: tokens.input,
          outputTokens: tokens.output,
        });
      } catch (error) {
        log.error(`Failed to parse file ${entry.name}:`, error);
      }
    }
  }

  // Sort conversations by timestamp (newest first)
  conversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    id: directoryHandle.name,
    displayName: parseProjectName(directoryHandle.name),
    conversationCount: conversations.length,
    lastModified: conversations.length > 0
      ? conversations[0].timestamp
      : new Date(),
    path: directoryHandle.name,
    conversations,
  };
}

/**
 * Load all projects from the .claude/projects directory
 */
export async function loadAllProjects(
  rootHandle: FileSystemDirectoryHandle
): Promise<Project[]> {
  const projects: Project[] = [];

  for await (const entry of rootHandle.values()) {
    if (entry.kind === 'directory') {
      try {
        const dirHandle = entry as FileSystemDirectoryHandle;
        const project = await loadProject(dirHandle);

        if (project.conversationCount > 0) {
          projects.push(project);
        }
      } catch (error) {
        log.error(`Failed to load project ${entry.name}:`, error);
      }
    }
  }

  // Sort projects by last modified (newest first)
  projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

  return projects;
}
