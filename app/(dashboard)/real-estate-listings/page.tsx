import RealEstateListings from "./components/real-estate-listings";
import { Metadata } from "next";
import { generateMeta } from "@/lib/generate-meta";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: "Объекты по недвижимости",
    description:
      "Витрина объектов недвижимости по Казахстану: ЖК, апартаменты и коммерция с ключевыми данными.",
    canonical: "/real-estate-listings"
  });
}

export default function Page() {
  return <RealEstateListings />;
}
