import { motion } from "framer-motion";
import {
  Layers,
  ArrowRight,
  Sparkles,
  Package,
  Building2,
  ShoppingCart,
  Store,
  MonitorSmartphone,
  Workflow,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router";

import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

import { SOLUTIONS } from "./data";

type SolutionFeature = {
  title: string;
};

type Solution = {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  features: SolutionFeature[];
};

const SOLUTION_ICONS = [
  Package,
  Building2,
  ShoppingCart,
  Store,
  MonitorSmartphone,
  Workflow,
] as const;

export default function SolutionsPage() {
  const navigate = useNavigate();
  const solutions = SOLUTIONS as Solution[];

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto max-w-6xl px-4 py-10"
      >
        {/* Header card */}
        <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
            }}
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Layers className="size-6" />
            </div>
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                <Sparkles className="size-3.5 text-accent" />
                Daisan commerce stack
              </span>
              <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Solutions
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
                Build every part of the Daisan commerce stack with AI — from PIM
                and B2B/B2C catalogs to the DaisanStore storefront, showroom,
                and lead-to-RFQ flows. Describe what you need and ship production
                pages in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Solutions grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution, index) => {
            const Icon = SOLUTION_ICONS[index % SOLUTION_ICONS.length];
            return (
              <button
                key={solution.slug}
                type="button"
                onClick={() => navigate(`/solutions/${solution.slug}`)}
                className="group relative flex flex-col rounded-2xl border border-border-primary bg-bg-2/40 p-5 text-left transition-transform hover:scale-[1.02] hover:border-accent/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>

                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">
                  {solution.eyebrow}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-text-primary">
                  {solution.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {solution.tagline}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {solution.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature.title}
                      className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary"
                    >
                      {feature.title}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Final CTA band */}
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-10">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
            }}
          />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Rocket className="size-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                Ship your commerce stack with Daisan AI
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-text-secondary">
                Start from a prompt and let Daisan AI assemble the catalogs,
                storefront, and deployment for your building-materials business.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Start building
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
