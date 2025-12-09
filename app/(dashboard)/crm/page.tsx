import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

import CalendarDateRangePicker from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";

import MainContent from "@/components/layout/dashboard/main-content";
import { LeadsCard } from "./components/leads";
import { LeadBySourceCard } from "./components/leads-by-source";
import { LeadsByCountryCard } from "./components/leads-by-country";
import PerformanceAnalytics from "./components/performance-analytics";
import StatCards from "./components/stat-cards";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Crafty CRM Казахстан",
    description: "CRM-панель для команды из Казахстана: лиды, продажи и клиенты в одном окне.",
    canonical: "/crm"
  });
}

export default function Page() {
  return (
    <MainContent>
      <div className="mb-4 flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <h1 className="text-2xl font-bold tracking-tight">Салем, Айгерим!</h1>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>Скачать отчёт</Button>
        </div>
      </div>
      <div className="space-y-4">
        <StatCards />
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PerformanceAnalytics />
          </div>
          <LeadBySourceCard />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <LeadsByCountryCard />
          </div>
          <LeadsCard />
        </div>
      </div>
    </MainContent>
  );
}
