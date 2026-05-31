import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Map,
  FileCode,
  Bot,
  LifeBuoy,
  ArrowRight,
  Search,
  Clock,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import {
  DOC_CATEGORIES,
  DOCS,
  getDocsByCategory,
  type DocCategory,
} from "@/lib/knowledge-base";

const ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  Map,
  FileCode,
  BookOpen,
  Bot,
  LifeBuoy,
};

export default function ResourcesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return DOCS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="container mx-auto max-w-6xl px-4 py-10"
      >
        {/* Hero */}
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
                Tài liệu &amp; Hướng dẫn
              </h1>
              <p className="text-text-secondary">
                Kho tri thức nền tảng của Daisan AI —{" "}
                <span className="text-text-primary">{DOCS.length} tài liệu</span>{" "}
                để học, xây và vận hành.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tài liệu, prompt, agent…"
              className="w-full rounded-xl border border-border-primary bg-bg-3/60 py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent/50"
            />
          </div>
        </div>

        {/* Search results */}
        {filtered ? (
          <div className="mt-8">
            <p className="mb-4 text-sm text-text-tertiary">
              {filtered.length} kết quả cho “{query}”
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((doc) => (
                <DocRow
                  key={doc.slug}
                  title={doc.title}
                  description={doc.description}
                  minutes={doc.readingMinutes}
                  onClick={() => navigate(`/resources/${doc.slug}`)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Không tìm thấy tài liệu phù hợp.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {DOC_CATEGORIES.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                onOpenDoc={(slug) => navigate(`/resources/${slug}`)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 p-6">
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
                Cách học nhanh nhất là bắt tay xây
              </h2>
              <p className="text-sm text-text-secondary">
                Mô tả ứng dụng bạn muốn và xem Daisan AI dựng nó ngay.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              Mở trình tạo app
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}

function CategorySection({
  category,
  onOpenDoc,
}: {
  category: DocCategory;
  onOpenDoc: (slug: string) => void;
}) {
  const docs = getDocsByCategory(category.id);
  if (docs.length === 0) return null;
  const Icon = ICONS[category.icon] ?? FileText;

  return (
    <section>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            {category.title}
            <span className="ml-2 text-sm font-normal text-text-tertiary">
              {docs.length}
            </span>
          </h2>
          <p className="text-sm text-text-secondary">{category.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <DocRow
            key={doc.slug}
            title={doc.title}
            description={doc.description}
            minutes={doc.readingMinutes}
            onClick={() => onOpenDoc(doc.slug)}
          />
        ))}
      </div>
    </section>
  );
}

function DocRow({
  title,
  description,
  minutes,
  onClick,
}: {
  title: string;
  description: string;
  minutes: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-border-primary bg-bg-2/40 p-4 text-left transition-colors hover:border-accent/40 hover:bg-bg-2/70"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent">
          {title}
        </h3>
        <ArrowRight className="size-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-text-secondary">
        {description}
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-text-tertiary">
        <Clock className="size-3" />
        {minutes} phút đọc
      </div>
    </button>
  );
}
