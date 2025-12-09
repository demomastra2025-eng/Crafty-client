import ChatApp from "./component/chat-app";
import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Crafty чат Казахстан",
    description: "Командный чат для казахстанского проекта: сделки, клиенты и поддержка.",
    canonical: "/chats"
  });
}

export default function Page() {
  return <ChatApp />;
}
