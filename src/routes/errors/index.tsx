import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Globe,
  SearchX,
  LayoutDashboard,
  ScrollText,
  Network,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type ActionButton = {
  label: string;
  to: string;
  icon: LucideIcon;
  primary?: boolean;
};

type ErrorShellProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  causes: string[];
  actions: ActionButton[];
  children?: React.ReactNode;
};

function ErrorShell({
  icon: Icon,
  title,
  subtitle,
  causes,
  actions,
  children,
}: ErrorShellProps) {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-3 px-4 py-16">
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(217,70,239,0.2), rgba(255,61,0,0.12) 50%, transparent 74%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-xl"
      >
        <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Icon className="size-6" />
            </div>

            <h1 className="mt-6 bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 max-w-md text-sm text-text-secondary">
              {subtitle}
            </p>
          </div>

          {children}

          <div className="mt-8 rounded-2xl border border-border-primary bg-bg-3/60 p-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
              Possible causes
            </p>
            <ul className="mt-3 space-y-2">
              {causes.map((cause) => (
                <li
                  key={cause}
                  className="flex items-start gap-2 text-sm text-text-secondary"
                >
                  <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {actions.map((action) => {
              const ActionIcon = action.icon;
              if (action.primary) {
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
                  >
                    <ActionIcon className="size-4" />
                    {action.label}
                  </button>
                );
              }
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-primary bg-bg-3/60 px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  <ActionIcon className="size-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function DeploymentFailedPage() {
  return (
    <ErrorShell
      icon={AlertTriangle}
      title="Deployment failed"
      subtitle="We couldn't finish deploying your Daisan app. The latest build did not complete successfully, so no new version was published."
      causes={[
        "A build error in your app code stopped the deployment.",
        "A required environment variable or secret is missing.",
        "The build exceeded its time limit and timed out.",
      ]}
      actions={[
        {
          label: "Open deployments",
          to: "/deployments",
          icon: LayoutDashboard,
          primary: true,
        },
        { label: "View build logs", to: "/deployments", icon: ScrollText },
        { label: "Go to dashboard", to: "/", icon: LayoutDashboard },
      ]}
    />
  );
}

export function DomainNotMappedPage() {
  return (
    <ErrorShell
      icon={Globe}
      title="Domain not mapped"
      subtitle="This hostname isn't connected to a Daisan app yet. We received the request but found no route mapped to your deployment."
      causes={[
        "Wildcard DNS for your subdomains is not configured.",
        "A custom domain was added but not yet verified or mapped.",
        "The domain isn't registered in the Daisan deployment registry.",
      ]}
      actions={[
        {
          label: "Check domain mapping",
          to: "/deployments",
          icon: Network,
          primary: true,
        },
        { label: "Open deployments", to: "/deployments", icon: LayoutDashboard },
        { label: "Go to dashboard", to: "/", icon: LayoutDashboard },
      ]}
    />
  );
}

export function AppNotFoundPage() {
  const hostname =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "app.daisan.ai";
  const slug = hostname.split(".")[0] || "app";

  return (
    <ErrorShell
      icon={SearchX}
      title="App not found"
      subtitle="We looked up this address but couldn't find a matching Daisan app to serve. It may have moved, been removed, or never finished deploying."
      causes={[
        "The app record no longer exists or was deleted.",
        "The most recent deployment failed and nothing was published.",
        "The domain isn't mapped to this app.",
        "The build is still running — try again in a moment.",
        "The URL is incorrect or points to the wrong app slug.",
      ]}
      actions={[
        {
          label: "Open deployments",
          to: "/deployments",
          icon: LayoutDashboard,
          primary: true,
        },
        { label: "Go to dashboard", to: "/", icon: LayoutDashboard },
      ]}
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
          hostname:{" "}
          <span className="font-medium text-text-secondary">{hostname}</span>
        </span>
        <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
          app slug:{" "}
          <span className="font-medium text-text-secondary">{slug}</span>
        </span>
      </div>
    </ErrorShell>
  );
}

export default AppNotFoundPage;
