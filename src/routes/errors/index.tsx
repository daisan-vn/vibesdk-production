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
import { useI18n } from "@/contexts/i18n-context";

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
  const { t } = useI18n();

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
              {t("Possible causes", "Nguyên nhân có thể")}
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
  const { t } = useI18n();
  return (
    <ErrorShell
      icon={AlertTriangle}
      title={t("Deployment failed", "Triển khai thất bại")}
      subtitle={t(
        "We couldn't finish deploying your Daisan app. The latest build did not complete successfully, so no new version was published.",
        "Chúng tôi không thể hoàn tất triển khai ứng dụng Daisan của bạn. Bản build mới nhất không hoàn thành thành công nên không có phiên bản mới nào được phát hành.",
      )}
      causes={[
        t(
          "A build error in your app code stopped the deployment.",
          "Một lỗi build trong mã ứng dụng của bạn đã làm dừng quá trình triển khai.",
        ),
        t(
          "A required environment variable or secret is missing.",
          "Thiếu một biến môi trường hoặc khóa bí mật bắt buộc.",
        ),
        t(
          "The build exceeded its time limit and timed out.",
          "Bản build vượt quá giới hạn thời gian và đã hết thời gian chờ.",
        ),
      ]}
      actions={[
        {
          label: t("Open deployments", "Mở triển khai"),
          to: "/deployments",
          icon: LayoutDashboard,
          primary: true,
        },
        { label: t("View build logs", "Xem nhật ký build"), to: "/deployments", icon: ScrollText },
        { label: t("Go to dashboard", "Về bảng điều khiển"), to: "/", icon: LayoutDashboard },
      ]}
    />
  );
}

export function DomainNotMappedPage() {
  const { t } = useI18n();
  return (
    <ErrorShell
      icon={Globe}
      title={t("Domain not mapped", "Tên miền chưa được ánh xạ")}
      subtitle={t(
        "This hostname isn't connected to a Daisan app yet. We received the request but found no route mapped to your deployment.",
        "Tên máy chủ này chưa được kết nối với ứng dụng Daisan nào. Chúng tôi đã nhận yêu cầu nhưng không tìm thấy tuyến nào được ánh xạ tới bản triển khai của bạn.",
      )}
      causes={[
        t(
          "Wildcard DNS for your subdomains is not configured.",
          "DNS wildcard cho các tên miền phụ của bạn chưa được cấu hình.",
        ),
        t(
          "A custom domain was added but not yet verified or mapped.",
          "Một tên miền tùy chỉnh đã được thêm nhưng chưa được xác minh hoặc ánh xạ.",
        ),
        t(
          "The domain isn't registered in the Daisan deployment registry.",
          "Tên miền chưa được đăng ký trong sổ đăng ký triển khai của Daisan.",
        ),
      ]}
      actions={[
        {
          label: t("Check domain mapping", "Kiểm tra ánh xạ tên miền"),
          to: "/deployments",
          icon: Network,
          primary: true,
        },
        { label: t("Open deployments", "Mở triển khai"), to: "/deployments", icon: LayoutDashboard },
        { label: t("Go to dashboard", "Về bảng điều khiển"), to: "/", icon: LayoutDashboard },
      ]}
    />
  );
}

export function AppNotFoundPage() {
  const { t } = useI18n();
  const hostname =
    typeof window !== "undefined" && window.location?.hostname
      ? window.location.hostname
      : "app.daisan.ai";
  const slug = hostname.split(".")[0] || "app";

  return (
    <ErrorShell
      icon={SearchX}
      title={t("App not found", "Không tìm thấy ứng dụng")}
      subtitle={t(
        "We looked up this address but couldn't find a matching Daisan app to serve. It may have moved, been removed, or never finished deploying.",
        "Chúng tôi đã tra cứu địa chỉ này nhưng không tìm thấy ứng dụng Daisan tương ứng để phục vụ. Có thể nó đã được chuyển đi, bị xóa, hoặc chưa hoàn tất triển khai.",
      )}
      causes={[
        t(
          "The app record no longer exists or was deleted.",
          "Bản ghi ứng dụng không còn tồn tại hoặc đã bị xóa.",
        ),
        t(
          "The most recent deployment failed and nothing was published.",
          "Bản triển khai gần nhất thất bại và không có gì được phát hành.",
        ),
        t(
          "The domain isn't mapped to this app.",
          "Tên miền chưa được ánh xạ tới ứng dụng này.",
        ),
        t(
          "The build is still running — try again in a moment.",
          "Bản build vẫn đang chạy — vui lòng thử lại sau giây lát.",
        ),
        t(
          "The URL is incorrect or points to the wrong app slug.",
          "URL không chính xác hoặc trỏ tới sai slug ứng dụng.",
        ),
      ]}
      actions={[
        {
          label: t("Open deployments", "Mở triển khai"),
          to: "/deployments",
          icon: LayoutDashboard,
          primary: true,
        },
        { label: t("Go to dashboard", "Về bảng điều khiển"), to: "/", icon: LayoutDashboard },
      ]}
    >
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
          {t("hostname:", "tên máy chủ:")}{" "}
          <span className="font-medium text-text-secondary">{hostname}</span>
        </span>
        <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
          {t("app slug:", "slug ứng dụng:")}{" "}
          <span className="font-medium text-text-secondary">{slug}</span>
        </span>
      </div>
    </ErrorShell>
  );
}

export default AppNotFoundPage;
