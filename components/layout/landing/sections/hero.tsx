"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "50+", label: "Components" },
  { value: "20+", label: "Page Templates" },
  { value: "1k+", label: "Happy Customers" },
  { value: "99%", label: "Satisfaction Rate" }
];

export const HeroSection = () => {
  return (
    <section className="relative w-full px-4">
      <div className="relative mx-auto grid place-items-center pt-28 md:pt-40 lg:max-w-(--breakpoint-xl)">
        <div className="space-y-10 pb-20 text-center lg:max-w-(--breakpoint-md)">
          <div className="space-y-4">
            <h1 className="text-4xl leading-14 font-bold md:text-5xl lg:leading-18">
              Multipurpose Shadcn UI Admin Dashboard Template
            </h1>
            <p className="text-muted-foreground mx-auto max-w-(--breakpoint-sm) text-xl text-balance">
              {`Multipurpose and powerful admin panel template built with Shadcn components. Contains Typescript files.`}
            </p>
          </div>

          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link href="/ecommerce" target="_blank">
                Live Preview
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" asChild variant="secondary">
              <Link href="https://github.com/shadcn-examples/shadcn-ui-dashboard" target="_blank">
                Github
              </Link>
            </Button>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <figure className="relative aspect-video w-full">
          <img
            className="rouded-lg bg-muted relative mx-auto flex w-full items-center rounded-lg border mask-b-from-50% mask-b-to-90% object-cover p-2 leading-none dark:hidden"
            src="/hero.png"
            alt="shadcn admin dashboard landing page"
          />
        </figure>
      </div>
    </section>
  );
};
