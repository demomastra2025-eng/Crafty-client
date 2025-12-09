import { generateMeta } from "@/lib/generate-meta";
import { Metadata } from "next";

import CustomerList from "./components/customer-list";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Клиенты",
    description: "Список клиентов по Казахстану: контакты, заказы и активность в CRM.",
    canonical: "/customers"
  });
}

export default function Page() {
  return <CustomerList />;
}
