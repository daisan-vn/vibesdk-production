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
import { useI18n } from "@/contexts/i18n-context";

type SecuritySection = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
  points: string[];
};

function buildSections(t: (en: string, vi: string) => string): SecuritySection[] {
  return [
    {
      icon: ShieldCheck,
      title: t("Security overview", "Tổng quan bảo mật"),
      description: t(
        "Daisan AI is built to protect your projects, data, and deployments across the full commerce lifecycle — from PIM and B2B catalogs to DaisanStore storefronts.",
        "Daisan AI được xây dựng để bảo vệ dự án, dữ liệu và bản triển khai của bạn xuyên suốt toàn bộ vòng đời thương mại — từ PIM và danh mục B2B đến các gian hàng DaisanStore.",
      ),
      points: [
        t(
          "Encryption in transit for all builder, preview, and deployment traffic",
          "Mã hóa khi truyền cho mọi lưu lượng của trình tạo, bản xem trước và triển khai",
        ),
        t(
          "Isolated build and preview environments per workspace",
          "Môi trường dựng và xem trước được tách biệt cho từng không gian làm việc",
        ),
        t(
          "Audit-friendly activity history for project and deployment changes",
          "Lịch sử hoạt động thuận tiện cho việc kiểm toán đối với các thay đổi của dự án và triển khai",
        ),
      ],
    },
    {
      icon: ShieldCheck,
      title: t("Compliance posture", "Trạng thái tuân thủ"),
      description: t(
        "Our platform is designed to support common commerce and data-handling expectations for Vietnamese and cross-border retail teams.",
        "Nền tảng của chúng tôi được thiết kế để đáp ứng các kỳ vọng phổ biến về thương mại và xử lý dữ liệu cho các đội ngũ bán lẻ tại Việt Nam và xuyên biên giới.",
      ),
      points: [
        t(
          "Designed for data minimization and least-privilege access patterns",
          "Được thiết kế theo nguyên tắc tối thiểu hóa dữ liệu và quyền truy cập tối thiểu",
        ),
        t(
          "Supports region-aware deployment targets for your storefront and APIs",
          "Hỗ trợ các đích triển khai theo khu vực cho gian hàng và API của bạn",
        ),
        t(
          "Configurable data retention for projects, logs, and previews",
          "Thời gian lưu trữ dữ liệu có thể cấu hình cho dự án, nhật ký và bản xem trước",
        ),
      ],
    },
    {
      icon: Lock,
      title: t("Access control", "Kiểm soát truy cập"),
      description: t(
        "Granular roles keep PIM editors, B2B sales, and storefront engineers scoped to exactly what they need.",
        "Các vai trò chi tiết giúp giới hạn biên tập viên PIM, nhân viên bán hàng B2B và kỹ sư gian hàng đúng với những gì họ cần.",
      ),
      points: [
        t(
          "Workspace, project, and environment-level role assignments",
          "Phân quyền vai trò ở cấp không gian làm việc, dự án và môi trường",
        ),
        t(
          "Owner, editor, and viewer roles for collaborators and partners",
          "Vai trò chủ sở hữu, biên tập viên và người xem cho cộng tác viên và đối tác",
        ),
        t(
          "Session controls with revocable access for departing members",
          "Kiểm soát phiên với khả năng thu hồi quyền truy cập cho thành viên rời đi",
        ),
      ],
    },
    {
      icon: Key,
      title: t("API key protection", "Bảo vệ khóa API"),
      description: t(
        "Keys for catalogs, lead/RFQ webhooks, and deployment pipelines are handled with care by default.",
        "Khóa cho danh mục, webhook khách hàng tiềm năng/RFQ và quy trình triển khai được xử lý cẩn thận theo mặc định.",
      ),
      points: [
        t(
          "Keys are shown once at creation and never displayed again",
          "Khóa chỉ hiển thị một lần khi tạo và không bao giờ hiển thị lại",
        ),
        t(
          "Scoped keys limited to specific projects and capabilities",
          "Khóa được giới hạn phạm vi cho các dự án và năng lực cụ thể",
        ),
        t(
          "Instantly revocable, with rotation supported at any time",
          "Có thể thu hồi ngay lập tức, hỗ trợ xoay vòng khóa bất cứ lúc nào",
        ),
      ],
    },
    {
      icon: Database,
      title: t("Project security", "Bảo mật dự án"),
      description: t(
        "Every generated project is checked before it reaches your customers in B2C, B2B, or showroom contexts.",
        "Mọi dự án được tạo ra đều được kiểm tra trước khi đến với khách hàng của bạn trong bối cảnh B2C, B2B hoặc showroom.",
      ),
      points: [
        t(
          "Automated vulnerability checks across generated code",
          "Tự động kiểm tra lỗ hổng trên toàn bộ mã được tạo ra",
        ),
        t(
          "RLS and database access checks for storefront and PIM data",
          "Kiểm tra RLS và quyền truy cập cơ sở dữ liệu cho dữ liệu gian hàng và PIM",
        ),
        t(
          "Dependency scanning to surface known-vulnerable packages",
          "Quét phụ thuộc để phát hiện các gói có lỗ hổng đã biết",
        ),
      ],
    },
    {
      icon: ShieldCheck,
      title: t("Workspace security center", "Trung tâm bảo mật không gian làm việc"),
      description: t(
        "A single place to review and tighten the security of your entire Daisan workspace.",
        "Một nơi duy nhất để xem xét và siết chặt bảo mật cho toàn bộ không gian làm việc Daisan của bạn.",
      ),
      points: [
        t(
          "Centralized view of members, roles, and active sessions",
          "Xem tập trung các thành viên, vai trò và phiên đang hoạt động",
        ),
        t(
          "Visibility into API keys, scopes, and last-used activity",
          "Khả năng theo dõi các khóa API, phạm vi và hoạt động sử dụng gần nhất",
        ),
        t(
          "Surfaced findings from project and dependency scans",
          "Hiển thị các phát hiện từ quá trình quét dự án và phụ thuộc",
        ),
      ],
    },
    {
      icon: Lock,
      title: t("Data protection", "Bảo vệ dữ liệu"),
      description: t(
        "Customer, product, and lead data are treated as first-class assets across the Daisan commerce ecosystem.",
        "Dữ liệu khách hàng, sản phẩm và khách hàng tiềm năng được xem là tài sản hàng đầu trong toàn bộ hệ sinh thái thương mại Daisan.",
      ),
      points: [
        t(
          "Separation between workspaces, projects, and environments",
          "Tách biệt giữa các không gian làm việc, dự án và môi trường",
        ),
        t(
          "Configurable export and deletion controls for stored data",
          "Kiểm soát xuất và xóa có thể cấu hình cho dữ liệu được lưu trữ",
        ),
        t(
          "Secrets kept out of generated source and client bundles",
          "Thông tin bí mật được giữ ngoài mã nguồn được tạo và gói phía máy khách",
        ),
      ],
    },
  ];
}

function buildChecklist(t: (en: string, vi: string) => string): string[] {
  return [
    t(
      "API keys are scoped, stored securely, and revoked when unused",
      "Khóa API được giới hạn phạm vi, lưu trữ an toàn và thu hồi khi không dùng đến",
    ),
    t(
      "Database access reviewed with RLS and permission checks",
      "Quyền truy cập cơ sở dữ liệu được rà soát bằng RLS và kiểm tra phân quyền",
    ),
    t(
      "Dependency scan completed with no known critical issues",
      "Hoàn tất quét phụ thuộc mà không còn sự cố nghiêm trọng đã biết",
    ),
    t(
      "Roles and collaborators limited to least-privilege access",
      "Vai trò và cộng tác viên được giới hạn ở quyền truy cập tối thiểu",
    ),
    t(
      "Storefront and RFQ endpoints validated before going live",
      "Các điểm cuối gian hàng và RFQ được kiểm tra trước khi vận hành",
    ),
  ];
}

export default function SecurityPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const sections = buildSections(t);
  const checklist = buildChecklist(t);

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
                  {t("Security", "Bảo mật")}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                  {t(
                    "How Daisan AI protects your projects, data, and deployments — from PIM and B2B catalogs to live DaisanStore storefronts.",
                    "Cách Daisan AI bảo vệ dự án, dữ liệu và bản triển khai của bạn — từ PIM và danh mục B2B đến các gian hàng DaisanStore đang vận hành.",
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
            >
              {t("Start building", "Bắt đầu xây dựng")}
              <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              {t("Encryption in transit", "Mã hóa khi truyền")}
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              {t("Scoped API keys", "Khóa API giới hạn phạm vi")}
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              {t("Dependency scanning", "Quét phụ thuộc")}
            </span>
            <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-secondary">
              {t("Least-privilege access", "Truy cập tối thiểu")}
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
                {t("Publish readiness checklist", "Danh sách kiểm tra sẵn sàng xuất bản")}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {t(
                  "Run through these before you deploy a storefront, showroom, or RFQ flow to production.",
                  "Hãy rà soát những mục này trước khi bạn triển khai một gian hàng, showroom hoặc luồng RFQ lên môi trường sản xuất.",
                )}
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
                {t("Manage your security center", "Quản lý trung tâm bảo mật của bạn")}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-text-secondary">
                {t(
                  "Review members, scoped keys, and project scan findings in one place, then ship with confidence.",
                  "Rà soát thành viên, khóa giới hạn phạm vi và các phát hiện từ quá trình quét dự án ở một nơi, rồi tự tin xuất bản.",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
          >
            {t("Open builder", "Mở trình tạo")}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </motion.div>

      <LandingFooter />
    </div>
  );
}
