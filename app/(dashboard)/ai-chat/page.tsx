import AIChatApp from "./components/ai-chat-app";
import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "AI Chat App",
    description:
      "AI chat app is ui template that allows users to interact with AI. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/ai-chat"
  });
}

export default function Page() {
  return <AIChatApp />;
}
