"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Star, Archive, Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isFavorite?: boolean;
  isArchived?: boolean;
}

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

export function Sidebar({ chats, selectedChatId, onNewChat, onSelectChat }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatFilter, setChatFilter] = useState<"all" | "favorite" | "archived">("all");

  const favoritesCount = chats.filter((chat) => chat.isFavorite).length;
  const archivedCount = chats.filter((chat) => chat.isArchived).length;

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      chatFilter === "all"
        ? true
        : chatFilter === "favorite"
          ? !!chat.isFavorite
          : !!chat.isArchived;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-full w-80 flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
          variant="outline">
          <Plus className="h-4 w-4" />
          Новый чат
        </Button>
      </div>

      {/* Navigation */}
      <div className="space-y-1 px-4 py-2">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={chatFilter === "all" ? "secondary" : "ghost"}
            className="w-full justify-between text-gray-700 px-3"
            onClick={() => setChatFilter("all")}>
            <MessageCircle className="h-4 w-4" />
            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">{chats.length}</span>
            <span className="sr-only">Все</span>
          </Button>
          <Button
            variant={chatFilter === "favorite" ? "secondary" : "ghost"}
            className="w-full justify-between text-gray-700 px-3"
            onClick={() => setChatFilter("favorite")}>
            <Star className="h-4 w-4" />
            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">{favoritesCount}</span>
            <span className="sr-only">Избранное</span>
          </Button>
          <Button
            variant={chatFilter === "archived" ? "secondary" : "ghost"}
            className="w-full justify-between text-gray-700 px-3"
            onClick={() => setChatFilter("archived")}>
            <Archive className="h-4 w-4" />
            <span className="rounded-full bg-gray-200 px-2 py-1 text-xs">{archivedCount}</span>
            <span className="sr-only">Архив</span>
          </Button>
        </div>
      </div>

      {/* Recent Chats */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 py-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-wide text-gray-500 uppercase">
              Недавние чаты
            </h3>
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <Input
              placeholder="Поиск по чатам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 px-4 pb-4">
          <div className="space-y-1 pb-4">
            {filteredChats.length ? (
              filteredChats.map((chat) => (
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
                      <div className="mt-0.5 line-clamp-2 break-words text-xs text-gray-500">
                        {chat.preview}
                      </div>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                Нет чатов по текущему фильтру
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}
