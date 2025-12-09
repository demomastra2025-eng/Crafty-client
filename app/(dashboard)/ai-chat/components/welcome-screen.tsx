"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    title: "Сформируй КП на русском и казахском",
    category: "Продажи"
  },
  {
    title: "Напиши пост в Whatsapp о запуске проекта",
    category: "Контент"
  },
  {
    title: "Подготовь ответы на частые вопросы",
    category: "Поддержка"
  },
  {
    title: "Сделай резюме встречи: сроки, бюджет итд",
    category: "Менеджмент"
  }
];

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-6xl font-bold">
          <span className="bg-gradient-to-r from-pink-500 via-red-500 to-red-600 bg-clip-text text-transparent">
            Салем, команда!
          </span>
        </h1>
        <p className="text-2xl text-gray-500">Чем помочь проекту сегодня?</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => onSuggestionClick(suggestion.title)}
            className="group h-auto border-gray-200 p-6 text-left hover:bg-gray-50">
            <div className="flex w-full items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="break-words text-sm leading-relaxed text-gray-700">{suggestion.title}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
