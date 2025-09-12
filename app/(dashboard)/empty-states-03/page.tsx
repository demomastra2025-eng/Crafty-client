import Image from "next/image";
import { generateMeta } from "@/lib/generate-meta";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Empty States 03",
    description:
      "Empty states are UI screens shown when no data or content is available. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/empty-states-03"
  });
}

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <figure>
          <Image src="/404.svg" alt="..." width={300} height={200} />
        </figure>
        <h2 className="text-xl font-semibold text-gray-900">Access to this page is blocked!</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Please try another way or make sure you have the necessary permissions.
        </p>
      </div>
    </div>
  );
}
