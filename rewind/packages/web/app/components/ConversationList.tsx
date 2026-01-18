import { useState } from 'react';
import type { Conversation } from '~/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatNumber, formatModelName, safeFormatDate, safeParseDate } from '~/lib/stats';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

type SortBy = 'date' | 'messages' | 'tokens';

export function ConversationList({ conversations, onSelectConversation }: ConversationListProps) {
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const sortedConversations = [...conversations].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        const dateA = safeParseDate(a.timestamp);
        const dateB = safeParseDate(b.timestamp);
        return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
      case 'messages':
        return b.messageCount - a.messageCount;
      case 'tokens':
        return (b.totalTokens || 0) - (a.totalTokens || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Conversations</h2>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="messages">Message Count</SelectItem>
            <SelectItem value="tokens">Token Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Tokens</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConversations.map(conversation => (
              <TableRow
                key={conversation.uuid}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelectConversation(conversation)}
              >
                <TableCell className="whitespace-nowrap">
                  {safeFormatDate(conversation.timestamp, 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {conversation.preview}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{conversation.messageCount}</Badge>
                </TableCell>
                <TableCell>
                  {conversation.model ? (
                    <Badge>{formatModelName(conversation.model)}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {conversation.totalTokens ? (
                    <span className="text-sm font-mono">
                      {formatNumber(conversation.totalTokens)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectConversation(conversation);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
