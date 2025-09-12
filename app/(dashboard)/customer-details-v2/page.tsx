import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

import CustomerDetail2 from "./components/customer-detail";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Customer Details v2",
    description:
      "A customer detail page is a page displaying individual customer information, history, and interactions. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/customer-details-v2"
  });
}

export default function Page() {
  return <CustomerDetail2 />;
}
