import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  ShieldCheck,
  KeyRound,
  ScrollText,
  Plug,
  UploadCloud,
  Lock,
  Workflow,
  ArrowRight,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

type Feature = {
  icon: typeof Building2;
  title: string;
  description: string;
};

type Step = {
  step: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Team workspaces",
    description:
      "Organize builders by brand, region, or business unit. Shared assets, isolated projects, one source of truth across DaisanStore.",
  },
  {
    icon: KeyRound,
    title: "Roles & permissions",
    description:
      "Granular access for editors, reviewers, and admins. Scope what each team can build, edit, and publish.",
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    description:
      "Brand guardrails, approval flows, and policy templates keep AI-generated commerce experiences on-spec.",
  },
  {
    icon: Lock,
    title: "SSO / SCIM",
    description:
      "Connect your identity provider for single sign-on and automated user provisioning and de-provisioning.",
  },
  {
    icon: ScrollText,
    title: "Audit logs",
    description:
      "Tamper-evident history of every build, edit, deploy, and permission change for compliance and review.",
  },
  {
    icon: Plug,
    title: "Custom connectors",
    description:
      "Wire AI builds directly into your PIM, ERP, and POS so catalog, pricing, and inventory stay in sync.",
  },
  {
    icon: UploadCloud,
    title: "Publishing controls",
    description:
      "Staged environments, scheduled releases, and rollback so storefront and showroom changes ship safely.",
  },
  {
    icon: ShieldCheck,
    title: "Security center",
    description:
      "Centralized posture, secret management, and data-residency settings tuned for B2B and B2C commerce.",
  },
];

const STEPS: Step[] = [
  {
    step: "01",
    title: "Scope & connect",
    description:
      "We map your commerce stack — PIM, ERP, POS — and provision workspaces, SSO, and roles for your org.",
  },
  {
    step: "02",
    title: "Pilot with guardrails",
    description:
      "A lead team builds with governance and approval flows enabled, validating output against brand and policy.",
  },
  {
    step: "03",
    title: "Roll out org-wide",
    description:
      "Expand access by business unit with audit logging and publishing controls in place from day one.",
  },
];

export default function EnterprisePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header card */}
          <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
            <div
              className="absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Building2 className="size-6" />
              </div>
              <div className="space-y-3">
                <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                  Daisan AI for Enterprise
                </h1>
                <p className="max-w-2xl text-sm text-text-secondary">
                  Governed AI building across your entire commerce organization.
                  Give every team the speed of chat-first creation with the
                  controls, security, and integrations your enterprise requires.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    SSO / SCIM
                  </span>
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    Audit logging
                  </span>
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    PIM / ERP / POS connectors
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-base font-medium text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* How rollout works */}
          <div className="mt-10">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Workflow className="size-5" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                How rollout works
              </h2>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {STEPS.map((step) => (
                <div
                  key={step.step}
                  className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
                >
                  <span className="text-sm font-semibold text-accent">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-base font-medium text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact sales CTA */}
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-10">
            <div
              className="absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                  Bring governed AI building to your commerce org
                </h2>
                <p className="text-sm text-text-secondary">
                  Talk to our team about workspaces, security review, and a
                  tailored rollout across your PIM, B2B, B2C, and storefront
                  surfaces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                Contact sales
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}
