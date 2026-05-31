import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutTemplate,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import { useI18n } from "@/contexts/i18n-context";
import { TEMPLATES } from "./data";

type Template = {
  cat: string;
  title: string;
  desc: string;
  prompt: string;
};

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function inclusionsFor(t: Template): string[] {
  const base = [
    `Prebuilt ${t.cat.toLowerCase()} layout tuned for Daisan commerce`,
    "Responsive pages wired to PIM product and catalog data",
    "Lead and RFQ capture blocks with B2B-ready forms",
    "Brand-matched theme, components and copy you can edit in chat",
    "One-click deploy to your DaisanStore storefront",
  ];
  return base.slice(0, 5);
}

export default function TemplateDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t: translate } = useI18n();

  const templates = TEMPLATES as Template[];

  const t = useMemo(
    () => templates.find((item) => slugify(item.title) === slug),
    [templates, slug],
  );

  const related = useMemo<Template[]>(() => {
    if (!t) return [];
    return templates
      .filter(
        (item) => item.cat === t.cat && slugify(item.title) !== slugify(t.title),
      )
      .slice(0, 3);
  }, [templates, t]);

  if (!t) {
    return (
      <div className="min-h-screen bg-bg-3">
        <PublicHeader />
        <div className="container mx-auto max-w-5xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="rounded-2xl border border-border-primary bg-bg-2/40 p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <LayoutTemplate className="size-6" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-text-primary">
                {translate("Template not found", "Không tìm thấy mẫu")}
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                {translate(
                  "We couldn't find a template matching that link. It may have been renamed or removed from the gallery.",
                  "Chúng tôi không tìm thấy mẫu khớp với liên kết này. Có thể nó đã được đổi tên hoặc gỡ khỏi thư viện.",
                )}
              </p>
              <button
                onClick={() => navigate("/templates")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                <ArrowLeft className="size-4" />
                {translate("Back to templates", "Quay lại mẫu")}
              </button>
            </div>
          </motion.div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const useTemplate = () => {
    navigate(
      `/chat/new?query=${encodeURIComponent(t.prompt)}&projectType=app`,
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
          className="space-y-8"
        >
          <button
            onClick={() => navigate("/templates")}
            className="inline-flex items-center gap-2 rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="size-3.5" />
            {translate("All templates", "Tất cả mẫu")}
          </button>

          {/* Header card */}
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
                  <LayoutTemplate className="size-6" />
                </div>
                <div>
                  <span className="inline-flex rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    {t.cat}
                  </span>
                  <h1 className="mt-3 bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                    {t.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                    {t.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={useTemplate}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                <Sparkles className="size-4" />
                {translate("Use template", "Dùng mẫu")}
              </button>
            </div>
          </div>

          {/* Preview + included */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div
                className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border-primary"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,61,0,0.22), rgba(217,70,239,0.16) 55%, rgba(20,20,24,0.6))",
                }}
              >
                <div
                  className="pointer-events-none absolute -left-10 -bottom-16 h-60 w-60 opacity-60 blur-2xl"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(217,70,239,0.28), transparent 70%)",
                  }}
                />
                <div className="relative flex flex-col items-center gap-2 text-text-primary/80">
                  <LayoutTemplate className="size-10" />
                  <span className="text-sm font-medium">
                    {translate("Live preview", "Xem trước trực tiếp")}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {translate(
                      "Generated when you open this template in chat",
                      "Được tạo khi bạn mở mẫu này trong cửa sổ trò chuyện",
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
              <h2 className="text-sm font-semibold text-text-primary">
                {translate("What's included", "Bao gồm những gì")}
              </h2>
              <ul className="mt-4 space-y-3">
                {inclusionsFor(t).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
                      <Check className="size-3" />
                    </span>
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={useTemplate}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                {translate("Use template", "Dùng mẫu")}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text-primary">
                  {translate("Related templates", "Mẫu liên quan")}
                </h2>
                <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                  {t.cat}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => navigate(`/templates/${slugify(item.title)}`)}
                    className="group rounded-2xl border border-border-primary bg-bg-2/40 p-5 text-left transition-colors hover:border-accent/40"
                  >
                    <span className="inline-flex rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                      {item.cat}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                      {item.desc}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      {translate("View template", "Xem mẫu")}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}
