import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

type SecuritySection = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  points: string[];
};

const sections: SecuritySection[] = [
  {
    icon: ShieldCheck,
    title: "Security overview",
    description:
      "Daisan AI is built to protect your projects, data, and deployments across the full commerce lifecycle — from PIM and B2B catalogs to DaisanStore storefronts.",
    points: [
      "Encryption in transit for all builder, preview, and deployment traffic",
      "Isolated build and preview environments per workspace",
      "Audit-friendly activity history for project and deployment changes",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Compliance posture",
    description:
      "Our platform is designed to support common commerce and data-handling expectations for Vietnamese and cross-border retail teams.",
    points: [
      "Designed for data minimization and least-privilege access patterns",
      "Supports region-aware deployment targets for your storefront and APIs",
      "Configurable data retention for projects, logs, and previews",
    ],
  },
  {
    icon: Lock,
    title: "Access control",
    description:
      "Granular roles keep PIM editors, B2B sales, and storefront engineers scoped to exactly what they need.",
    points: [
      "Workspace, project, and environment-level role assignments",
      "Owner, editor, and viewer roles for collaborators and partners",
      "Session controls with revocable access for departing members",
    ],
  },
  {
    icon: Key,
    title: "API key protection",
    description:
      "Keys for catalogs, lead/RFQ webhooks, and deployment pipelines are handled with care by default.",
    points: [
      "Keys are shown once at creation and never displayed again",
      "Scoped keys limited to specific projects and capabilities",
      "Instantly revocable, with rotation supported at any time",
    ],
  },
  {
    icon: Database,
    title: "Project security",
    description:
      "Every generated project is checked before it reaches your customers in B2C, B2B, or showroom contexts.",
    points: [
      "Automated vulnerability checks across generated code",
      "RLS and database access checks for storefront and PIM data",
      "Dependency scanning to surface known-vulnerable packages",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Workspace security center",
    description:
      "A single place to review and tighten the security of your entire Daisan workspace.",
    points: [
      "Centralized view of members, roles, and active sessions",
      "Visibility into API keys, scopes, and last-used activity",
      "Surfaced findings from project and dependency scans",
    ],
  },
  {
    icon: Lock,
    title: "Data protection",
    description:
      "Customer, product, and lead data are treated as first-class assets across the Daisan commerce ecosystem.",
    points: [
      "Separation between workspaces, projects, and environments",
      "Configurable export and deletion controls for stored data",
      "Secrets kept out of generated source and client bundles",
    ],
  },
];

const checklist: string[] = [
  "API keys are scoped, stored securely, and revoked when unused",
  "Database access reviewed with RLS and permission checks",
  "Dependency scan completed with no known critical issues",
  "Roles and collaborators limited to least-privilege access",
  "Storefront and RFQ endpoints validated before going live",
];

export default function SecurityPage() {
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
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                  Security
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                  How Daisan AI protects your projects, data, and deployments —
                  from PIM and B2B catalogs to live DaisanStore storefronts.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Start building
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              Encryption in transit
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              Scoped API keys
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              Dependency scanning
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              Least-privilege access
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">
                    {section.title}
                  </h2>
                </div>
                <p className="mt-3 text-sm text-text-secondary">
                  {section.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-text-tertiary"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-border-primary bg-bg-2/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Publish readiness checklist
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Run through these before you deploy a storefront, showroom, or
                RFQ flow to production.
              </p>
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-border-primary bg-bg-3/60 px-4 py-3 text-sm text-text-secondary"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border-primary bg-bg-2/40 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Key className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Manage your security center
              </h2>
              <p className="mt-1 max-w-xl text-sm text-text-secondary">
                Review members, scoped keys, and project scan findings in one
                place, then ship with confidence.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
          >
            Open builder
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
