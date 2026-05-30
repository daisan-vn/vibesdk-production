import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Map,
  Newspaper,
  History,
  LifeBuoy,
  FileCode,
  ArrowRight,
} from "lucide-react";

import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

type Resource = {
  title: string;
  description: string;
  icon: typeof BookOpen;
};

const resources: Resource[] = [
  {
    title: "Learn",
    description: "Step-by-step lessons to go from prompt to a live commerce app.",
    icon: GraduationCap,
  },
  {
    title: "Guides",
    description: "Playbooks for PIM, B2B/B2C storefronts, RFQ, and deployment.",
    icon: Map,
  },
  {
    title: "Blog",
    description: "Product updates, build patterns, and stories from the Daisan ecosystem.",
    icon: Newspaper,
  },
  {
    title: "Changelog",
    description: "Every new feature, model, and improvement shipped to Daisan AI.",
    icon: History,
  },
  {
    title: "Support",
    description: "Get help, report issues, and reach the team behind your builds.",
    icon: LifeBuoy,
  },
  {
    title: "Docs",
    description: "Reference for components, data models, and the build runtime.",
    icon: FileCode,
  },
];

export default function ResourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto max-w-6xl px-4 py-10"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
          <div
            className="absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
            }}
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <BookOpen className="size-6" />
            </div>
            <div className="space-y-2">
              <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Resources
              </h1>
              <p className="text-text-secondary">
                Learn, build, and ship with Daisan AI.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
            New content rolling out
          </span>
          <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
            Tailored to commerce builders
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <div
                key={resource.title}
                className="group rounded-2xl border border-border-primary bg-bg-2/40 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                    Coming soon
                  </span>
                </div>
                <h2 className="mt-4 text-lg font-semibold text-text-primary">
                  {resource.title}
                </h2>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {resource.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 p-6">
          <div
            className="absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
            }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold text-text-primary">
                Start building while we write the docs
              </h2>
              <p className="text-sm text-text-secondary">
                The fastest way to learn Daisan AI is to describe an app and watch it
                come to life.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Open the builder
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
