import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateMeta } from "@/lib/generate-meta";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Empty States 01",
    description:
      "Empty states are UI screens shown when no data or content is available. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/empty-states"
  });
}

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <FolderPlus className="text-muted-foreground mx-auto h-16 w-16" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">No projects</h2>
        <p className="text-muted-foreground mt-2 text-sm">Get started by creating a new project.</p>
        <div className="mt-6">
          <Button>
            <Plus />
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
}
