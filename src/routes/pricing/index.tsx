import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, Check, Coins, Building2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  cta: string;
  to: string;
  highlighted?: boolean;
};

type FaqItem = {
  question: string;
  answer: string;
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/ month",
    description: "Explore Daisan AI and ship small projects.",
    features: [
      "Monthly starter credit pool",
      "AI chat builder for pages & flows",
      "1 published project",
      "DaisanStore storefront preview",
      "Community support",
    ],
    cta: "Start free",
    to: "/",
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/ month",
    description: "For individual builders who ship often.",
    features: [
      "Expanded monthly credits",
      "Unlimited drafts, more published projects",
      "PIM & catalog connectors",
      "Custom domain on storefronts",
      "Build history & version restore",
      "Email support",
    ],
    cta: "Choose Pro",
    to: "/",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    cadence: "/ month",
    description: "For teams running B2B and B2C together.",
    features: [
      "Team workspace & shared credits",
      "B2B + B2C connectors and RFQ/lead flows",
      "Multiple production deployments",
      "Showroom & DaisanStore integrations",
      "Roles & granular permissions",
      "Priority support",
    ],
    cta: "Choose Business",
    to: "/",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "Governance and security for the whole org.",
    features: [
      "SSO & SCIM provisioning",
      "Security center & audit logs",
      "Custom connectors & private deployments",
      "Dedicated capacity and credit pools",
      "Governance, SLAs & onboarding",
      "Named technical contact",
    ],
    cta: "Contact sales",
    to: "/enterprise",
  },
];

const creditUses: string[] = [
  "Prompts — every AI message that plans or edits your build.",
  "Plans — generating structured page, flow, and data plans.",
  "Builds — compiling and previewing storefronts and apps.",
  "Deploys — pushing projects live to production endpoints.",
];

const faqs: FaqItem[] = [
  {
    question: "What is a credit?",
    answer:
      "Credits are the shared unit that prompts, plans, builds, and deploys draw from. Each plan includes a monthly pool, and unused work simply costs fewer credits.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade or downgrade at any time — your credit pool and limits adjust on the next cycle, and your projects stay intact.",
  },
  {
    question: "Do credits roll over?",
    answer:
      "Monthly credits reset each cycle. Business and Enterprise plans can add reserved capacity if your team needs predictable headroom.",
  },
  {
    question: "Which connectors are included?",
    answer:
      "Pro adds PIM and catalog connectors; Business unlocks B2B, B2C, RFQ, and showroom flows; Enterprise supports custom and private connectors.",
  },
  {
    question: "How does Enterprise pricing work?",
    answer:
      "Enterprise is tailored to your seats, deployments, security needs, and connectors. Contact sales for a scoped quote.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto max-w-6xl px-4 py-10"
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
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Sparkles className="size-6" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                Pricing
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Start free. Scale as you ship.
              </p>
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-2xl border bg-bg-2/40 p-5 ${
                tier.highlighted
                  ? "border-accent/40 ring-1 ring-accent/20"
                  : "border-border-primary"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  {tier.name}
                </h2>
                {tier.highlighted ? (
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-accent">
                    Popular
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text-primary">
                  {tier.price}
                </span>
                {tier.cadence ? (
                  <span className="text-sm text-text-tertiary">
                    {tier.cadence}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {tier.description}
              </p>
              <ul className="mt-4 flex-1 space-y-2.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => navigate(tier.to)}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02] ${
                  tier.highlighted
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "border border-border-primary bg-bg-3/60 text-text-primary"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-text-tertiary">
          Figures shown are illustrative examples, not final pricing.
        </p>

        {/* Credit usage explainer */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Coins className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Credit usage
              </h2>
              <p className="text-sm text-text-secondary">
                One shared pool powers everything you build.
              </p>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {creditUses.map((use) => (
              <li
                key={use}
                className="flex items-start gap-2 rounded-xl border border-border-primary bg-bg-3/60 px-3 py-2.5 text-sm text-text-secondary"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-text-primary">
            Frequently asked questions
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
              >
                <h3 className="text-sm font-medium text-text-primary">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8">
          <div
            className="absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
            }}
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Building2 className="size-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Need a tailored plan?
                </h2>
                <p className="text-sm text-text-secondary">
                  Talk to us about governance, security, and custom connectors.
                </p>
              </div>
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
        </div>
      </motion.div>
      <LandingFooter />
    </div>
  );
}
