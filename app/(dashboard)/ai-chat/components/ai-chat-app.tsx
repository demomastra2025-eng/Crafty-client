"use client";

import { useState } from "react";
import { Sidebar } from "@/app/(dashboard)/ai-chat/components/sidebar";
import { useChat } from "@ai-sdk/react";
import { WelcomeScreen } from "@/app/(dashboard)/ai-chat/components/welcome-screen";
import { ChatInterface } from "@/app/(dashboard)/ai-chat/components/chat-interface";

export default function AIChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats] = useState([
    {
      id: "1",
      title: "Как оформить ИП в Казахстане?",
      preview: "Пошагово: ЭЦП, eGov, налоги...",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 минут назад
      isFavorite: true
    },
    {
      id: "2",
      title: "Подготовь КП для Astana Hub",
      preview: "Укажи тарифы, сроки, команду...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 час назад
      isFavorite: true
    },
    {
      id: "3",
      title: "Скрипт звонка для Алматы",
      preview: "Приветствие, потребность, оффер...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 часа назад
    },
    {
      id: "4",
      title: "Презентация ЖК в Астане",
      preview: "Сделать слайды на русском/казахском",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 часа назад
      isArchived: true
    },
    {
      id: "5",
      title: "Пост в Telegram про ЖК",
      preview: "Два абзаца, добавить смайлы...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
    },
    {
      id: "6",
      title: "Сравни налоги ИП/ТОO",
      preview: "Порог 24 млн, ОСМС, соцналог...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
      id: "7",
      title: "Адаптируй письмо для банка",
      preview: "Запрос по проектному финансированию...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
    },
    {
      id: "8",
      title: "FAQ по клиентам из Узбекистана",
      preview: "Доставка, валютный контроль...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7) // 7 часов назад
    },
    {
      id: "9",
      title: "Сообщение для инвестора",
      preview: "Коротко о цифрах и команде...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
    },
    {
      id: "10",
      title: "Контент-план по новостройкам",
      preview: "Сетку постов на месяц...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 9), // 9 часов назад
      isFavorite: true
    },
    {
      id: "11",
      title: "Шаблон договора аренды",
      preview: "Нужно учесть депозит и ремонт...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10) // 10 hours ago
    }
  ]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages:
      selectedChatId === "2"
        ? [
            {
              id: "1",
              role: "user",
              content: "Подготовь письмо клиенту на русском и казахском"
            },
            {
              id: "2",
              role: "assistant",
              content:
                "Конечно! Напиши, что это за клиент и что нужно подчеркнуть: сроки, цену, локацию или команду?"
            }
          ]
        : []
  });

  const handleNewChat = () => {
    setSelectedChatId(null);
    // Reset chat messages would happen here in a real app
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSuggestionClick = () => {
    // In a real app, this would start a new chat with the suggestion
    setSelectedChatId("new");
  };

  return (
    <div className="flex h-[calc(113vh-10rem)] min-h-0 w-full overflow-hidden rounded-xl bg-white">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        {!selectedChatId ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ChatInterface
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
