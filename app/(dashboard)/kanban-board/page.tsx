import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

import KanbanBoard from "./components/kanban-board";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Канбан-доска",
    description: "Канбан-доска для команды из Казахстана: лиды, маркетинг и техработы в одном потоке.",
    canonical: "/kanban-board"
  });
}

export default function Page() {
  return <KanbanBoard />;
}
