import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";
import ConnectorsView from "./view";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Коннекты — мессенджеры и соцсети для бизнеса",
    description:
      "Проекты, каналы и коннекты соцсетей: WhatsApp, Instagram, Telegram. Следите за статусами и нагрузкой.",
    canonical: "/connections"
  });
}

export default function Page() {
  return <ConnectorsView />;
}
