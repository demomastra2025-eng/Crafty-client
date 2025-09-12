"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Star,
  Archive,
  Puzzle,
  Search,
  MessageCircle,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export function Sidebar({ chats, selectedChatId, onNewChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex w-80 flex-col border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          variant="outline">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Navigation */}
      <div className="space-y-1 px-4 py-2">
        <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Favorites
          </div>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">2</span>
        </Button>
        <Button variant="ghost" className="w-full justify-between text-gray-600 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archived
          </div>
          <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">43</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-100">
          <Puzzle className="h-4 w-4" />
          Plugins
        </Button>
      </div>

      {/* Recent Chats */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 py-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-wide text-gray-500 uppercase">
              Recent Chats
            </h3>
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-1 pb-4">
            {filteredChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "h-auto w-full justify-start p-3 text-left hover:bg-gray-100",
                  selectedChatId === chat.id && "bg-gray-100"
                )}>
                <div className="flex w-full items-start gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{chat.title}</div>
                    <div className="mt-0.5 truncate text-xs text-gray-500">{chat.preview}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="space-y-1 border-t border-gray-200 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-100">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-100">
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </Button>
      </div>
    </div>
  );
}
