import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LayoutTemplate,
  Layers,
  Sparkles,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import { getSolution, SOLUTIONS } from "./data";

export default function SolutionDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const solution = slug ? getSolution(slug) : undefined;

  if (!solution) {
    return (
      <div className="min-h-screen bg-bg-3">
        <PublicHeader />
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Layers className="size-5" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-text-primary">
                Solution not found
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                We couldn't find a solution for that link. It may have been
                renamed or removed.
              </p>
              <button
                type="button"
                onClick={() => navigate("/solutions")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                <ArrowLeft className="size-4" />
                Back to solutions
              </button>
            </div>
          </motion.div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const related = SOLUTIONS
    .filter((s) => s.slug !== solution.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
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
                <Layers className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  {solution.eyebrow}
                </p>
                <h1 className="mt-2 bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                  {solution.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
                  {solution.tagline}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
                  >
                    <Sparkles className="size-4" />
                    Start building
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/solutions")}
                    className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-bg-3/60 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    <ArrowLeft className="size-4" />
                    All solutions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* The problem */}
          <section className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
            <h2 className="text-lg font-semibold text-text-primary">
              The problem
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
              {solution.problem}
            </p>
          </section>

          {/* Features grid */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary">
              What you get
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {solution.features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
                >
                  <h3 className="text-sm font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Outcomes */}
          <section className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
            <h2 className="text-lg font-semibold text-text-primary">Outcomes</h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {solution.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                  <span className="text-sm text-text-secondary">{outcome}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Related templates */}
          {solution.templates.length > 0 && (
            <section className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="size-4 text-accent" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Related templates
                </h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {solution.templates.map((template) => (
                  <button
                    key={template}
                    type="button"
                    onClick={() => navigate("/templates")}
                    className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Primary CTA */}
          <section className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
            <div
              className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  Ship {solution.name} faster
                </h2>
                <p className="mt-2 max-w-xl text-sm text-text-secondary">
                  Describe what you need and let Daisan AI scaffold the pages,
                  data, and flows for your commerce stack.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="size-4" />
                Start building
              </button>
            </div>
          </section>

          {/* Related solutions */}
          {related.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary">
                Related solutions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => navigate(`/solutions/${item.slug}`)}
                    className="group rounded-2xl border border-border-primary bg-bg-2/40 p-5 text-left transition-colors hover:border-accent/40"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-accent">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-2 text-sm font-semibold text-text-primary">
                      {item.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                      {item.tagline}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-text-tertiary transition-colors group-hover:text-accent">
                      View solution
                      <ArrowRight className="size-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}
