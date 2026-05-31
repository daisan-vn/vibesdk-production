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
import { useI18n } from "@/contexts/i18n-context";

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

type T = (en: string, vi: string) => string;

const buildFeatures = (t: T): Feature[] => [
  {
    icon: Users,
    title: t("Team workspaces", "Không gian làm việc nhóm"),
    description: t(
      "Organize builders by brand, region, or business unit. Shared assets, isolated projects, one source of truth across DaisanStore.",
      "Tổ chức người xây dựng theo thương hiệu, khu vực hoặc đơn vị kinh doanh. Tài nguyên dùng chung, dự án tách biệt, một nguồn dữ liệu thống nhất trên toàn DaisanStore.",
    ),
  },
  {
    icon: KeyRound,
    title: t("Roles & permissions", "Vai trò & phân quyền"),
    description: t(
      "Granular access for editors, reviewers, and admins. Scope what each team can build, edit, and publish.",
      "Phân quyền chi tiết cho người chỉnh sửa, người duyệt và quản trị viên. Giới hạn những gì mỗi nhóm có thể xây dựng, chỉnh sửa và xuất bản.",
    ),
  },
  {
    icon: ShieldCheck,
    title: t("Governance", "Quản trị"),
    description: t(
      "Brand guardrails, approval flows, and policy templates keep AI-generated commerce experiences on-spec.",
      "Khung kiểm soát thương hiệu, luồng phê duyệt và mẫu chính sách giữ cho trải nghiệm thương mại do AI tạo ra đúng yêu cầu.",
    ),
  },
  {
    icon: Lock,
    title: t("SSO / SCIM", "SSO / SCIM"),
    description: t(
      "Connect your identity provider for single sign-on and automated user provisioning and de-provisioning.",
      "Kết nối nhà cung cấp danh tính của bạn để đăng nhập một lần và tự động cấp phát, thu hồi quyền người dùng.",
    ),
  },
  {
    icon: ScrollText,
    title: t("Audit logs", "Nhật ký kiểm toán"),
    description: t(
      "Tamper-evident history of every build, edit, deploy, and permission change for compliance and review.",
      "Lịch sử chống giả mạo cho mọi bản dựng, chỉnh sửa, lần triển khai và thay đổi quyền phục vụ tuân thủ và rà soát.",
    ),
  },
  {
    icon: Plug,
    title: t("Custom connectors", "Kết nối tùy chỉnh"),
    description: t(
      "Wire AI builds directly into your PIM, ERP, and POS so catalog, pricing, and inventory stay in sync.",
      "Kết nối các bản dựng AI trực tiếp vào PIM, ERP và POS của bạn để danh mục, giá và tồn kho luôn đồng bộ.",
    ),
  },
  {
    icon: UploadCloud,
    title: t("Publishing controls", "Kiểm soát xuất bản"),
    description: t(
      "Staged environments, scheduled releases, and rollback so storefront and showroom changes ship safely.",
      "Môi trường thử nghiệm theo giai đoạn, phát hành theo lịch và khôi phục để thay đổi gian hàng và showroom được triển khai an toàn.",
    ),
  },
  {
    icon: ShieldCheck,
    title: t("Security center", "Trung tâm bảo mật"),
    description: t(
      "Centralized posture, secret management, and data-residency settings tuned for B2B and B2C commerce.",
      "Trạng thái bảo mật tập trung, quản lý khóa bí mật và thiết lập lưu trú dữ liệu được tinh chỉnh cho thương mại B2B và B2C.",
    ),
  },
];

const buildSteps = (t: T): Step[] => [
  {
    step: "01",
    title: t("Scope & connect", "Xác định phạm vi & kết nối"),
    description: t(
      "We map your commerce stack — PIM, ERP, POS — and provision workspaces, SSO, and roles for your org.",
      "Chúng tôi khảo sát hệ thống thương mại của bạn — PIM, ERP, POS — và cấp phát không gian làm việc, SSO và vai trò cho tổ chức của bạn.",
    ),
  },
  {
    step: "02",
    title: t("Pilot with guardrails", "Thí điểm với khung kiểm soát"),
    description: t(
      "A lead team builds with governance and approval flows enabled, validating output against brand and policy.",
      "Một nhóm tiên phong xây dựng với quản trị và luồng phê duyệt được bật, kiểm chứng kết quả theo thương hiệu và chính sách.",
    ),
  },
  {
    step: "03",
    title: t("Roll out org-wide", "Triển khai toàn tổ chức"),
    description: t(
      "Expand access by business unit with audit logging and publishing controls in place from day one.",
      "Mở rộng quyền truy cập theo đơn vị kinh doanh với nhật ký kiểm toán và kiểm soát xuất bản sẵn sàng ngay từ đầu.",
    ),
  },
];

export default function EnterprisePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const FEATURES = buildFeatures(t);
  const STEPS = buildSteps(t);

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
                  {t("Daisan AI for Enterprise", "Daisan AI cho Doanh nghiệp")}
                </h1>
                <p className="max-w-2xl text-sm text-text-secondary">
                  {t(
                    "Governed AI building across your entire commerce organization. Give every team the speed of chat-first creation with the controls, security, and integrations your enterprise requires.",
                    "Xây dựng bằng AI có quản trị trên toàn bộ tổ chức thương mại của bạn. Mang đến cho mọi đội nhóm tốc độ tạo dựng ưu tiên chat cùng các kiểm soát, bảo mật và tích hợp mà doanh nghiệp của bạn cần.",
                  )}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    {t("SSO / SCIM", "SSO / SCIM")}
                  </span>
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    {t("Audit logging", "Ghi nhật ký kiểm toán")}
                  </span>
                  <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
                    {t("PIM / ERP / POS connectors", "Kết nối PIM / ERP / POS")}
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
                {t("How rollout works", "Cách triển khai diễn ra")}
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
                  {t(
                    "Bring governed AI building to your commerce org",
                    "Mang việc xây dựng bằng AI có quản trị đến tổ chức thương mại của bạn",
                  )}
                </h2>
                <p className="text-sm text-text-secondary">
                  {t(
                    "Talk to our team about workspaces, security review, and a tailored rollout across your PIM, B2B, B2C, and storefront surfaces.",
                    "Trao đổi với đội ngũ của chúng tôi về không gian làm việc, rà soát bảo mật và một lộ trình triển khai tùy chỉnh trên các bề mặt PIM, B2B, B2C và gian hàng của bạn.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
              >
                {t("Contact sales", "Liên hệ kinh doanh")}
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
