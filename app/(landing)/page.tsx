import { Metadata } from "next";
import { HeroSection } from "@/components/layout/landing/sections/hero";
import Testimonials from "@/app/(landing)/components/testimonials";
import Features from "@/app/(landing)/components/features";
import CTA from "@/app/(landing)/components/cta";

export const metadata: Metadata = {
  title: `Shadcn UI Admin Dashboard Template`,
  description:
    "Multipurpose and powerful admin dashboard template. Compatible with shadcn/ui. Developed with Next.js, React and Tailwind CSS. Typescript supported.",
  openGraph: {
    images: [
      {
        url: "/seo.png"
      }
    ]
  }
};

export default function Page() {
  return (
    <>
      <HeroSection />
      <Features />
      <Testimonials />
      <CTA />
    </>
  );
}
