import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  Store,
  Package,
  Building2,
  ClipboardList,
  Wrench,
  LayoutTemplate,
  ShoppingBag,
  Boxes,
  Github,
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

type Goal = {
  id: string;
  label: string;
  icon: typeof Store;
};

type ProjectType = {
  id: string;
  title: string;
  description: string;
  icon: typeof Store;
};

const GOALS: Goal[] = [
  { id: "storefront", label: "Build a storefront", icon: Store },
  { id: "pim", label: "Manage products (PIM)", icon: Package },
  { id: "b2b", label: "B2B portal", icon: Building2 },
  { id: "rfq", label: "Lead & RFQ", icon: ClipboardList },
  { id: "internal", label: "Internal tool", icon: Wrench },
];

const PROJECT_TYPES: ProjectType[] = [
  {
    id: "storefront",
    title: "DaisanStore storefront",
    description:
      "A premium B2C shop for tiles and building materials with cart and checkout.",
    icon: ShoppingBag,
  },
  {
    id: "catalog",
    title: "Product catalog",
    description:
      "A PIM-backed catalog with rich specs, variants and showroom-ready galleries.",
    icon: Boxes,
  },
  {
    id: "portal",
    title: "B2B / RFQ portal",
    description:
      "A wholesale portal with quote requests, lead capture and account pricing.",
    icon: LayoutTemplate,
  },
];

const STEP_LABELS = [
  "Create workspace",
  "Choose your goal",
  "First project type",
  "Start with a prompt",
];

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [goal, setGoal] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const canContinue =
    (step === 1 && workspaceName.trim().length > 0) ||
    (step === 2 && goal !== null) ||
    (step === 3 && projectType !== null) ||
    step === 4;

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleStartBuilding = () => {
    const query = prompt.trim();
    navigate(
      `/chat/new?query=${encodeURIComponent(query)}&projectType=app`,
    );
  };

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header block */}
          <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
            <div
              className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                    Welcome to Daisan AI
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-text-secondary">
                    Let's set up your workspace and ship your first
                    commerce experience. This takes about a minute.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/")}
                className="self-start rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                Skip for now
              </button>
            </div>

            {/* Progress indicator */}
            <div className="relative mt-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  Step {step} of {TOTAL_STEPS}
                </p>
                <p className="text-xs text-text-secondary">
                  {STEP_LABELS[step - 1]}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {STEP_LABELS.map((label, i) => {
                  const index = i + 1;
                  const active = index === step;
                  const done = index < step;
                  return (
                    <div key={label} className="flex flex-col gap-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          done || active
                            ? "bg-accent"
                            : "bg-border-primary"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step content */}
          <div className="mt-6">
            {step === 1 && (
              <StepShell
                title="Create your workspace"
                subtitle="Workspaces keep your projects, products and team in one place."
              >
                <label className="block text-sm font-medium text-text-primary">
                  Workspace name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Daisan Tiles Co."
                  autoFocus
                  className="mt-2 w-full rounded-xl border border-border-primary bg-bg-3/60 px-4 py-3 text-sm text-text-primary outline-none ring-accent/20 transition-shadow placeholder:text-text-tertiary focus:ring-2"
                />
                <p className="mt-2 text-xs text-text-tertiary">
                  You can rename this later in settings.
                </p>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                title="What do you want to build first?"
                subtitle="Pick a goal so we can tailor templates and AI suggestions."
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {GOALS.map((g) => {
                    const Icon = g.icon;
                    const selected = goal === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setGoal(g.id)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? "border-accent bg-accent/10 text-text-primary ring-1 ring-accent/20"
                            : "border-border-primary bg-bg-3/60 text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-accent/10 text-accent"
                              : "bg-bg-2/40 text-text-tertiary"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="font-medium">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                title="Choose your first project type"
                subtitle="A starting point for your build. You can change everything with prompts."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECT_TYPES.map((p) => {
                    const Icon = p.icon;
                    const selected = projectType === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setProjectType(p.id)}
                        className={`flex h-full flex-col items-start rounded-2xl border p-5 text-left transition-colors ${
                          selected
                            ? "border-accent bg-accent/10 ring-1 ring-accent/20"
                            : "border-border-primary bg-bg-2/40 hover:border-text-tertiary"
                        }`}
                      >
                        <span
                          className={`flex size-10 items-center justify-center rounded-xl ${
                            selected
                              ? "bg-accent/10 text-accent ring-1 ring-accent/20"
                              : "bg-bg-3/60 text-text-tertiary"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
                          {p.title}
                          {selected && (
                            <Check className="size-4 text-accent" />
                          )}
                        </span>
                        <span className="mt-1.5 text-xs text-text-secondary">
                          {p.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border-primary bg-bg-3/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-bg-2/40 text-text-tertiary">
                      <Github className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Connect GitHub
                        <span className="ml-2 rounded-full border border-border-primary bg-bg-3/60 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-text-tertiary">
                          Optional
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary">
                        Sync your project to a repo and deploy from Git. You can
                        skip this and connect later.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-xl border border-border-primary bg-bg-2/40 px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Connect GitHub
                  </button>
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                title="Start with a prompt"
                subtitle="Describe what you want to build. The AI will scaffold your first project."
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder="e.g. Build a DaisanStore storefront for porcelain tiles with a hero, filterable product grid, product detail pages and an RFQ form."
                  className="w-full resize-none rounded-xl border border-border-primary bg-bg-3/60 px-4 py-3 text-sm text-text-primary outline-none ring-accent/20 transition-shadow placeholder:text-text-tertiary focus:ring-2"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-tertiary">Try:</span>
                  {[
                    "A B2B quote portal for contractors",
                    "A showroom landing page for a new tile collection",
                    "A PIM admin to manage product specs",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setPrompt(suggestion)}
                      className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-text-tertiary">
                    Prefer to wire up your repo first?{" "}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      <Github className="size-3.5" />
                      Connect GitHub (optional)
                    </button>
                  </p>
                  <button
                    onClick={handleStartBuilding}
                    disabled={prompt.trim().length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Rocket className="size-4" />
                    Start building
                  </button>
                </div>
              </StepShell>
            )}
          </div>

          {/* Footer nav */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-bg-2/40 px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-xs text-text-tertiary transition-colors hover:text-text-secondary"
              >
                Skip
              </button>
              {step < TOTAL_STEPS && (
                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  Next
                  <ArrowRight className="size-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-primary bg-bg-2/40 p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}