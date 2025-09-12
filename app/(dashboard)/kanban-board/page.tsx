import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

import KanbanBoard from "./components/kanban-board";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Kanban Board",
    description:
      "A Kanban board is a visual tool for organizing tasks and tracking workflow. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/kanban-board"
  });
}

export default function Page() {
  return <KanbanBoard />;
}
