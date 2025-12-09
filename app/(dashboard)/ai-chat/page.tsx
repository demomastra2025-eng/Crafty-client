import AIChatApp from "./components/ai-chat-app";
import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Crafty AI чат Казахстан",
    description: "AI-чат на русском для команды из Казахстана: идеи, контент и ответы за секунды.",
    canonical: "/ai-chat"
  });
}

export default function Page() {
  return <AIChatApp />;
}
