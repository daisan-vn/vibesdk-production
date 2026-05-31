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
import { useI18n } from "@/contexts/i18n-context";

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

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  const GOALS: Goal[] = [
    { id: "storefront", label: t("Build a storefront", "Xây dựng gian hàng"), icon: Store },
    { id: "pim", label: t("Manage products (PIM)", "Quản lý sản phẩm (PIM)"), icon: Package },
    { id: "b2b", label: t("B2B portal", "Cổng B2B"), icon: Building2 },
    { id: "rfq", label: t("Lead & RFQ", "Khách hàng tiềm năng & RFQ"), icon: ClipboardList },
    { id: "internal", label: t("Internal tool", "Công cụ nội bộ"), icon: Wrench },
  ];

  const PROJECT_TYPES: ProjectType[] = [
    {
      id: "storefront",
      title: t("DaisanStore storefront", "Gian hàng DaisanStore"),
      description: t(
        "A premium B2C shop for tiles and building materials with cart and checkout.",
        "Cửa hàng B2C cao cấp cho gạch ốp lát và vật liệu xây dựng, có giỏ hàng và thanh toán.",
      ),
      icon: ShoppingBag,
    },
    {
      id: "catalog",
      title: t("Product catalog", "Danh mục sản phẩm"),
      description: t(
        "A PIM-backed catalog with rich specs, variants and showroom-ready galleries.",
        "Danh mục dựa trên PIM với thông số chi tiết, biến thể và thư viện ảnh sẵn sàng cho showroom.",
      ),
      icon: Boxes,
    },
    {
      id: "portal",
      title: t("B2B / RFQ portal", "Cổng B2B / RFQ"),
      description: t(
        "A wholesale portal with quote requests, lead capture and account pricing.",
        "Cổng bán sỉ với yêu cầu báo giá, thu thập khách hàng tiềm năng và giá theo tài khoản.",
      ),
      icon: LayoutTemplate,
    },
  ];

  const STEP_LABELS = [
    t("Create workspace", "Tạo không gian làm việc"),
    t("Choose your goal", "Chọn mục tiêu của bạn"),
    t("First project type", "Loại dự án đầu tiên"),
    t("Start with a prompt", "Bắt đầu bằng một câu lệnh"),
  ];

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
                    {t("Welcome to Daisan AI", "Chào mừng đến với Daisan AI")}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-text-secondary">
                    {t(
                      "Let's set up your workspace and ship your first commerce experience. This takes about a minute.",
                      "Hãy thiết lập không gian làm việc và ra mắt trải nghiệm thương mại đầu tiên của bạn. Việc này chỉ mất khoảng một phút.",
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/")}
                className="self-start rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary transition-colors hover:text-text-primary"
              >
                {t("Skip for now", "Bỏ qua bây giờ")}
              </button>
            </div>

            {/* Progress indicator */}
            <div className="relative mt-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  {t(`Step ${step} of ${TOTAL_STEPS}`, `Bước ${step} / ${TOTAL_STEPS}`)}
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
                title={t("Create your workspace", "Tạo không gian làm việc của bạn")}
                subtitle={t(
                  "Workspaces keep your projects, products and team in one place.",
                  "Không gian làm việc giúp tập hợp dự án, sản phẩm và đội ngũ của bạn tại một nơi.",
                )}
              >
                <label className="block text-sm font-medium text-text-primary">
                  {t("Workspace name", "Tên không gian làm việc")}
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t("e.g. Daisan Tiles Co.", "ví dụ: Công ty Gạch Daisan")}
                  autoFocus
                  className="mt-2 w-full rounded-xl border border-border-primary bg-bg-3/60 px-4 py-3 text-sm text-text-primary outline-none ring-accent/20 transition-shadow placeholder:text-text-tertiary focus:ring-2"
                />
                <p className="mt-2 text-xs text-text-tertiary">
                  {t(
                    "You can rename this later in settings.",
                    "Bạn có thể đổi tên này sau trong phần cài đặt.",
                  )}
                </p>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                title={t(
                  "What do you want to build first?",
                  "Bạn muốn xây dựng điều gì trước?",
                )}
                subtitle={t(
                  "Pick a goal so we can tailor templates and AI suggestions.",
                  "Chọn một mục tiêu để chúng tôi điều chỉnh mẫu và gợi ý AI cho phù hợp.",
                )}
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
                title={t(
                  "Choose your first project type",
                  "Chọn loại dự án đầu tiên của bạn",
                )}
                subtitle={t(
                  "A starting point for your build. You can change everything with prompts.",
                  "Một điểm khởi đầu cho dự án của bạn. Bạn có thể thay đổi mọi thứ bằng câu lệnh.",
                )}
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
                        {t("Connect GitHub", "Kết nối GitHub")}
                        <span className="ml-2 rounded-full border border-border-primary bg-bg-3/60 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-text-tertiary">
                          {t("Optional", "Tùy chọn")}
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t(
                          "Sync your project to a repo and deploy from Git. You can skip this and connect later.",
                          "Đồng bộ dự án của bạn với một repo và triển khai từ Git. Bạn có thể bỏ qua và kết nối sau.",
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-xl border border-border-primary bg-bg-2/40 px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {t("Connect GitHub", "Kết nối GitHub")}
                  </button>
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                title={t("Start with a prompt", "Bắt đầu bằng một câu lệnh")}
                subtitle={t(
                  "Describe what you want to build. The AI will scaffold your first project.",
                  "Mô tả điều bạn muốn xây dựng. AI sẽ dựng khung dự án đầu tiên của bạn.",
                )}
              >
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder={t(
                    "e.g. Build a DaisanStore storefront for porcelain tiles with a hero, filterable product grid, product detail pages and an RFQ form.",
                    "ví dụ: Xây dựng gian hàng DaisanStore cho gạch porcelain với phần hero, lưới sản phẩm có bộ lọc, trang chi tiết sản phẩm và biểu mẫu RFQ.",
                  )}
                  className="w-full resize-none rounded-xl border border-border-primary bg-bg-3/60 px-4 py-3 text-sm text-text-primary outline-none ring-accent/20 transition-shadow placeholder:text-text-tertiary focus:ring-2"
                />

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-tertiary">{t("Try:", "Thử:")}</span>
                  {[
                    t("A B2B quote portal for contractors", "Cổng báo giá B2B cho nhà thầu"),
                    t(
                      "A showroom landing page for a new tile collection",
                      "Trang giới thiệu showroom cho bộ sưu tập gạch mới",
                    ),
                    t(
                      "A PIM admin to manage product specs",
                      "Trang quản trị PIM để quản lý thông số sản phẩm",
                    ),
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
                    {t("Prefer to wire up your repo first?", "Muốn thiết lập repo trước?")}{" "}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      <Github className="size-3.5" />
                      {t("Connect GitHub (optional)", "Kết nối GitHub (tùy chọn)")}
                    </button>
                  </p>
                  <button
                    onClick={handleStartBuilding}
                    disabled={prompt.trim().length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Rocket className="size-4" />
                    {t("Start building", "Bắt đầu xây dựng")}
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
              {t("Back", "Quay lại")}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="text-xs text-text-tertiary transition-colors hover:text-text-secondary"
              >
                {t("Skip", "Bỏ qua")}
              </button>
              {step < TOTAL_STEPS && (
                <button
                  onClick={handleNext}
                  disabled={!canContinue}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {t("Next", "Tiếp tục")}
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