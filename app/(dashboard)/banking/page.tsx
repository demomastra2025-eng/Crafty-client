import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

import BankingDashboard from "./components/banking-dashboard";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Banking Admin Template",
    description:
      "Banking admin dashboard is a pre-designed ui template to manage accounts, transactions and financial data. Built with shadcn/ui, Tailwind CSS, Next.js and React.",
    canonical: "/banking"
  });
}

export default function Page() {
  return <BankingDashboard />;
}
