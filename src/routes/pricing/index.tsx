import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, Check, Coins, Building2 } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import { useI18n } from "@/contexts/i18n-context";

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

type T = (en: string, vi: string) => string;

const buildTiers = (t: T): Tier[] => [
  {
    name: "Free",
    price: "$0",
    cadence: t("/ month", "/ tháng"),
    description: t(
      "Explore Daisan AI and ship small projects.",
      "Khám phá Daisan AI và triển khai các dự án nhỏ.",
    ),
    features: [
      t("Monthly starter credit pool", "Quỹ tín dụng khởi đầu hằng tháng"),
      t(
        "AI chat builder for pages & flows",
        "Trình tạo bằng AI chat cho trang & luồng",
      ),
      t("1 published project", "1 dự án đã xuất bản"),
      t("DaisanStore storefront preview", "Xem trước gian hàng DaisanStore"),
      t("Community support", "Hỗ trợ cộng đồng"),
    ],
    cta: t("Start free", "Bắt đầu miễn phí"),
    to: "/",
  },
  {
    name: "Pro",
    price: "$29",
    cadence: t("/ month", "/ tháng"),
    description: t(
      "For individual builders who ship often.",
      "Dành cho người xây dựng cá nhân triển khai thường xuyên.",
    ),
    features: [
      t("Expanded monthly credits", "Mở rộng tín dụng hằng tháng"),
      t(
        "Unlimited drafts, more published projects",
        "Bản nháp không giới hạn, nhiều dự án xuất bản hơn",
      ),
      t("PIM & catalog connectors", "Kết nối PIM & danh mục sản phẩm"),
      t("Custom domain on storefronts", "Tên miền tùy chỉnh cho gian hàng"),
      t(
        "Build history & version restore",
        "Lịch sử bản dựng & khôi phục phiên bản",
      ),
      t("Email support", "Hỗ trợ qua email"),
    ],
    cta: t("Choose Pro", "Chọn Pro"),
    to: "/",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$99",
    cadence: t("/ month", "/ tháng"),
    description: t(
      "For teams running B2B and B2C together.",
      "Dành cho đội nhóm vận hành đồng thời B2B và B2C.",
    ),
    features: [
      t("Team workspace & shared credits", "Không gian nhóm & tín dụng dùng chung"),
      t(
        "B2B + B2C connectors and RFQ/lead flows",
        "Kết nối B2B + B2C và luồng RFQ/khách hàng tiềm năng",
      ),
      t("Multiple production deployments", "Nhiều lần triển khai chính thức"),
      t(
        "Showroom & DaisanStore integrations",
        "Tích hợp showroom & DaisanStore",
      ),
      t("Roles & granular permissions", "Vai trò & phân quyền chi tiết"),
      t("Priority support", "Hỗ trợ ưu tiên"),
    ],
    cta: t("Choose Business", "Chọn Business"),
    to: "/",
  },
  {
    name: "Enterprise",
    price: t("Custom", "Tùy chỉnh"),
    cadence: "",
    description: t(
      "Governance and security for the whole org.",
      "Quản trị và bảo mật cho toàn bộ tổ chức.",
    ),
    features: [
      t("SSO & SCIM provisioning", "Cấp phát SSO & SCIM"),
      t("Security center & audit logs", "Trung tâm bảo mật & nhật ký kiểm toán"),
      t(
        "Custom connectors & private deployments",
        "Kết nối tùy chỉnh & triển khai riêng",
      ),
      t(
        "Dedicated capacity and credit pools",
        "Dung lượng và quỹ tín dụng riêng",
      ),
      t(
        "Governance, SLAs & onboarding",
        "Quản trị, SLA & hỗ trợ triển khai ban đầu",
      ),
      t("Named technical contact", "Đầu mối kỹ thuật chuyên trách"),
    ],
    cta: t("Contact sales", "Liên hệ kinh doanh"),
    to: "/enterprise",
  },
];

const buildCreditUses = (t: T): string[] => [
  t(
    "Prompts — every AI message that plans or edits your build.",
    "Câu lệnh — mỗi tin nhắn AI lập kế hoạch hoặc chỉnh sửa bản dựng của bạn.",
  ),
  t(
    "Plans — generating structured page, flow, and data plans.",
    "Kế hoạch — tạo cấu trúc trang, luồng và kế hoạch dữ liệu.",
  ),
  t(
    "Builds — compiling and previewing storefronts and apps.",
    "Bản dựng — biên dịch và xem trước gian hàng và ứng dụng.",
  ),
  t(
    "Deploys — pushing projects live to production endpoints.",
    "Triển khai — đưa dự án lên chính thức tại các điểm cuối sản xuất.",
  ),
];

const buildFaqs = (t: T): FaqItem[] => [
  {
    question: t("What is a credit?", "Tín dụng là gì?"),
    answer: t(
      "Credits are the shared unit that prompts, plans, builds, and deploys draw from. Each plan includes a monthly pool, and unused work simply costs fewer credits.",
      "Tín dụng là đơn vị chung mà các câu lệnh, kế hoạch, bản dựng và lần triển khai sử dụng. Mỗi gói bao gồm một quỹ hằng tháng, và công việc dùng ít hơn đơn giản là tốn ít tín dụng hơn.",
    ),
  },
  {
    question: t("Can I change plans later?", "Tôi có thể đổi gói sau này không?"),
    answer: t(
      "Yes. Upgrade or downgrade at any time — your credit pool and limits adjust on the next cycle, and your projects stay intact.",
      "Có. Nâng cấp hoặc hạ cấp bất cứ lúc nào — quỹ tín dụng và giới hạn của bạn sẽ điều chỉnh vào chu kỳ kế tiếp, và các dự án của bạn vẫn được giữ nguyên.",
    ),
  },
  {
    question: t("Do credits roll over?", "Tín dụng có được chuyển sang kỳ sau không?"),
    answer: t(
      "Monthly credits reset each cycle. Business and Enterprise plans can add reserved capacity if your team needs predictable headroom.",
      "Tín dụng hằng tháng được đặt lại mỗi chu kỳ. Gói Business và Enterprise có thể bổ sung dung lượng dự phòng nếu đội nhóm của bạn cần khoảng dư ổn định.",
    ),
  },
  {
    question: t("Which connectors are included?", "Những kết nối nào được bao gồm?"),
    answer: t(
      "Pro adds PIM and catalog connectors; Business unlocks B2B, B2C, RFQ, and showroom flows; Enterprise supports custom and private connectors.",
      "Pro bổ sung kết nối PIM và danh mục sản phẩm; Business mở khóa các luồng B2B, B2C, RFQ và showroom; Enterprise hỗ trợ kết nối tùy chỉnh và riêng.",
    ),
  },
  {
    question: t("How does Enterprise pricing work?", "Giá Enterprise hoạt động thế nào?"),
    answer: t(
      "Enterprise is tailored to your seats, deployments, security needs, and connectors. Contact sales for a scoped quote.",
      "Enterprise được tùy chỉnh theo số người dùng, số lần triển khai, nhu cầu bảo mật và kết nối của bạn. Liên hệ kinh doanh để nhận báo giá theo phạm vi.",
    ),
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const tiers = buildTiers(t);
  const creditUses = buildCreditUses(t);
  const faqs = buildFaqs(t);

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
                {t("Pricing", "Bảng giá")}
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                {t("Start free. Scale as you ship.", "Bắt đầu miễn phí. Mở rộng khi bạn triển khai.")}
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
                    {t("Popular", "Phổ biến")}
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
          {t(
            "Figures shown are illustrative examples, not final pricing.",
            "Các con số hiển thị chỉ mang tính minh họa, không phải giá cuối cùng.",
          )}
        </p>

        {/* Credit usage explainer */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Coins className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {t("Credit usage", "Cách dùng tín dụng")}
              </h2>
              <p className="text-sm text-text-secondary">
                {t(
                  "One shared pool powers everything you build.",
                  "Một quỹ chung vận hành mọi thứ bạn xây dựng.",
                )}
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
            {t("Frequently asked questions", "Câu hỏi thường gặp")}
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
                  {t("Need a tailored plan?", "Cần một gói riêng theo nhu cầu?")}
                </h2>
                <p className="text-sm text-text-secondary">
                  {t(
                    "Talk to us about governance, security, and custom connectors.",
                    "Trao đổi với chúng tôi về quản trị, bảo mật và kết nối tùy chỉnh.",
                  )}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              <Sparkles className="size-4" />
              {t("Start building", "Bắt đầu xây dựng")}
            </button>
          </div>
        </div>
      </motion.div>
      <LandingFooter />
    </div>
  );
}
