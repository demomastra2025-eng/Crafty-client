import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Ready to Build Your Next Project?</h2>
        <p className="mb-8 text-xl opacity-90">
          Join thousands of developers who trust Shadcn Dashboard for their dashboard needs.
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button size="lg" variant="secondary" asChild>
            <Link href="https://github.com/shadcn-examples/shadcn-ui-dashboard" target="_blank">
              Github
            </Link>
          </Button>
          <Button size="lg" variant="link" className="text-white" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
