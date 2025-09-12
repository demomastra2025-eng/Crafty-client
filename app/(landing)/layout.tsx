import { Navbar } from "@/components/layout/landing/navbar";
import { FooterSection } from "@/components/layout/landing/sections/footer";

export default function LandingLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <FooterSection />
    </>
  );
}
