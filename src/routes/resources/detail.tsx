import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { ArrowLeft, Clock, BookOpen, ChevronRight } from "lucide-react";

import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import {
  getDoc,
  getDocsByCategory,
  getCategory,
} from "@/lib/knowledge-base";

export default function ResourceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const doc = useMemo(() => (slug ? getDoc(slug) : undefined), [slug]);

  if (!doc) {
    return (
      <div className="min-h-screen bg-bg-3">
        <PublicHeader />
        <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
          <BookOpen className="mx-auto mb-4 size-10 text-text-tertiary" />
          <h1 className="text-2xl font-semibold text-text-primary">
            Không tìm thấy tài liệu
          </h1>
          <p className="mt-2 text-text-secondary">
            Tài liệu này có thể đã được đổi tên hoặc di chuyển.
          </p>
          <button
            onClick={() => navigate("/resources")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            <ArrowLeft className="size-4" />
            Về thư viện tài liệu
          </button>
        </div>
        <LandingFooter />
      </div>
    );
  }

  const category = getCategory(doc.category);
  const siblings = getDocsByCategory(doc.category);

  return (
    <div className="min-h-screen bg-bg-3">
      <PublicHeader />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="container mx-auto max-w-6xl px-4 py-8"
      >
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-text-tertiary">
          <button
            onClick={() => navigate("/resources")}
            className="transition-colors hover:text-accent"
          >
            Tài liệu
          </button>
          {category && (
            <>
              <ChevronRight className="size-3.5" />
              <span>{category.title}</span>
            </>
          )}
          <ChevronRight className="size-3.5" />
          <span className="text-text-secondary">{doc.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_240px]">
          {/* Article */}
          <div className="min-w-0">
            <div className="mb-6 border-b border-border-primary pb-5">
              <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
                {doc.title}
              </h1>
              <p className="mt-2 text-text-secondary">{doc.description}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
                <Clock className="size-3.5" />
                {doc.readingMinutes} phút đọc
                {category && <span>· {category.title}</span>}
              </div>
            </div>

            <article className="prose prose-sm prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-accent prose-code:text-accent prose-pre:bg-bg-2 prose-pre:border prose-pre:border-border-primary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeExternalLinks, { target: "_blank" }]]}
              >
                {doc.content}
              </ReactMarkdown>
            </article>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border-primary pt-6">
              <button
                onClick={() => navigate("/resources")}
                className="inline-flex items-center gap-2 rounded-xl border border-border-primary bg-bg-2/40 px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                <ArrowLeft className="size-4" />
                Tất cả tài liệu
              </button>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white"
              >
                Thử ngay trên trình tạo app
              </button>
            </div>
          </div>

          {/* Sidebar: docs in same category */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            {category && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {category.title}
              </p>
            )}
            <nav className="space-y-1">
              {siblings.map((s) => {
                const active = s.slug === doc.slug;
                return (
                  <button
                    key={s.slug}
                    onClick={() => navigate(`/resources/${s.slug}`)}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-accent/10 font-medium text-accent ring-1 ring-accent/20"
                        : "text-text-secondary hover:bg-bg-2/60 hover:text-text-primary"
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
