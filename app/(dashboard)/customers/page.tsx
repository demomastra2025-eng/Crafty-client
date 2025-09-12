import { generateMeta } from "@/lib/generate-meta";
import { Metadata } from "next";

import CustomerList from "./components/customer-list";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Customers List",
    description:
      "A customers list is a structured view of customer information, contact details, and activity. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/customers"
  });
}

export default function Page() {
  return <CustomerList />;
}
