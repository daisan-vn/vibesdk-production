import { motion } from "framer-motion";
import {
  Users,
  ArrowRight,
  Store,
  LayoutGrid,
  FileText,
  MessageSquare,
  Handshake,
  Sparkles,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router";
import { PublicHeader } from "@/components/layout/public-header";
import { LandingFooter } from "@/routes/home-sections";
import { useI18n } from "@/contexts/i18n-context";

type ShowcaseItem = {
  title: string;
  description: string;
  tag: string;
  icon: typeof Store;
};

type PartnerTier = {
  name: string;
  description: string;
  status: string;
};

function buildShowcase(t: (en: string, vi: string) => string): ShowcaseItem[] {
  return [
    {
      title: t("Tile catalog storefront", "Gian hàng danh mục gạch ốp lát"),
      description: t(
        "A DaisanStore B2C front for a building-materials retailer, generated from PIM data with filters by size, finish and collection.",
        "Một gian hàng B2C DaisanStore cho nhà bán lẻ vật liệu xây dựng, được tạo từ dữ liệu PIM với bộ lọc theo kích thước, bề mặt và bộ sưu tập.",
      ),
      tag: t("Example", "Ví dụ"),
      icon: Store,
    },
    {
      title: t("B2B quote portal", "Cổng báo giá B2B"),
      description: t(
        "A gated B2B experience where contractors browse SKUs, build carts and submit RFQs routed straight into the lead pipeline.",
        "Một trải nghiệm B2B có giới hạn truy cập, nơi nhà thầu duyệt SKU, tạo giỏ hàng và gửi RFQ chuyển thẳng vào quy trình khách hàng tiềm năng.",
      ),
      tag: t("Example", "Ví dụ"),
      icon: FileText,
    },
    {
      title: t("Showroom microsite", "Microsite showroom"),
      description: t(
        "An interactive showroom landing page with room scenes, product spotlights and a booking call-to-action.",
        "Một trang đích showroom tương tác với cảnh phòng, điểm nhấn sản phẩm và lời kêu gọi đặt lịch.",
      ),
      tag: t("Example", "Ví dụ"),
      icon: LayoutGrid,
    },
  ];
}

function buildPartnerTiers(t: (en: string, vi: string) => string): PartnerTier[] {
  return [
    {
      name: t("Agencies", "Agency"),
      description: t(
        "Studios shipping commerce sites for tile and building-materials brands on top of the Daisan ecosystem.",
        "Các studio xây dựng website thương mại cho các thương hiệu gạch ốp lát và vật liệu xây dựng trên hệ sinh thái Daisan.",
      ),
      status: t("Open soon", "Sắp mở"),
    },
    {
      name: t("Integrators", "Đơn vị tích hợp"),
      description: t(
        "Teams connecting PIM, storefront and deployment workflows for mid-market retailers.",
        "Các đội ngũ kết nối PIM, gian hàng và quy trình triển khai cho nhà bán lẻ tầm trung.",
      ),
      status: t("Open soon", "Sắp mở"),
    },
    {
      name: t("Solution experts", "Chuyên gia giải pháp"),
      description: t(
        "Independent builders who template repeatable B2B and B2C patterns for the community.",
        "Các nhà phát triển độc lập tạo mẫu các quy trình B2B và B2C có thể tái sử dụng cho cộng đồng.",
      ),
      status: t("Open soon", "Sắp mở"),
    },
  ];
}

function buildExamples(
  t: (en: string, vi: string) => string,
): { title: string; blurb: string }[] {
  return [
    {
      title: t("Prompt-to-PIM storefront", "Gian hàng từ prompt tới PIM"),
      blurb: t(
        "Describe your catalog and let Daisan AI scaffold the product pages.",
        "Mô tả danh mục của bạn và để Daisan AI dựng sẵn các trang sản phẩm.",
      ),
    },
    {
      title: t("Lead capture landing", "Trang đích thu khách hàng tiềm năng"),
      blurb: t(
        "A focused page that turns showroom visits into qualified RFQs.",
        "Một trang tập trung biến lượt ghé showroom thành các RFQ đủ điều kiện.",
      ),
    },
    {
      title: t("Deployment recipe", "Công thức triển khai"),
      blurb: t(
        "Wire a generated storefront into a one-click deployment flow.",
        "Kết nối một gian hàng được tạo sẵn vào luồng triển khai chỉ với một cú nhấp.",
      ),
    },
  ];
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const showcase = buildShowcase(t);
  const partnerTiers = buildPartnerTiers(t);
  const examples = buildExamples(t);

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
              className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,61,0,0.32), rgba(217,70,239,0.16) 45%, transparent 72%)",
              }}
            />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                  <Users className="size-6" />
                </div>
                <div>
                  <h1 className="bg-gradient-to-r from-text-primary to-text-primary/70 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                    {t("Community", "Cộng đồng")}
                  </h1>
                  <p className="mt-2 max-w-xl text-sm text-text-secondary">
                    {t(
                      "Where builders ship commerce experiences with Daisan AI — from PIM-backed storefronts to B2B quote portals and showroom microsites. Some of this is still coming together, and we are building it in the open.",
                      "Nơi các nhà phát triển tạo ra trải nghiệm thương mại với Daisan AI — từ gian hàng dựa trên PIM đến cổng báo giá B2B và microsite showroom. Một số phần vẫn đang được hoàn thiện, và chúng tôi đang xây dựng công khai.",
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
          </div>

          {/* Showcase */}
          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{t("Showcase", "Trưng bày")}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(
                    "A taste of what teams are building. These are illustrative examples, not live sites.",
                    "Một chút hình dung về những gì các đội ngũ đang xây dựng. Đây là các ví dụ minh họa, không phải trang web đang vận hành.",
                  )}
                </p>
              </div>
              <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                {t("Placeholders", "Nội dung tạm")}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                        <Icon className="size-5" />
                      </div>
                      <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-medium text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Join the community + Partner program */}
          <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-border-primary bg-bg-2/40 p-5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <MessageSquare className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                {t("Join the community", "Tham gia cộng đồng")}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {t(
                  "Swap patterns, share templates and get help shipping commerce experiences. We are setting up the channel now — leave the door open and we will let you in.",
                  "Trao đổi cách làm, chia sẻ mẫu và nhận hỗ trợ để xây dựng trải nghiệm thương mại. Chúng tôi đang thiết lập kênh này — hãy để ngỏ và chúng tôi sẽ mời bạn vào.",
                )}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/20 transition-transform hover:scale-[1.02]"
                >
                  <Sparkles className="size-4" />
                  {t("Join", "Tham gia")}
                </button>
                <span className="rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                  {t("Coming soon", "Sắp ra mắt")}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border-primary bg-bg-2/40 p-5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Handshake className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-text-primary">
                {t("Partner program", "Chương trình đối tác")}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                {t(
                  "For agencies, integrators and solution experts building on the Daisan ecosystem. Early partners help shape the templates and deployment recipes the community relies on.",
                  "Dành cho các agency, đơn vị tích hợp và chuyên gia giải pháp xây dựng trên hệ sinh thái Daisan. Các đối tác sớm giúp định hình những mẫu và công thức triển khai mà cộng đồng dựa vào.",
                )}
              </p>
              <div className="mt-5 space-y-3">
                {partnerTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border-primary bg-bg-3/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {tier.name}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {tier.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-border-primary bg-bg-3/60 px-3 py-1 text-xs text-text-tertiary">
                      {tier.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Examples */}
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Rocket className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">{t("Examples", "Ví dụ")}</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {t(
                    "Starting points you can adapt for your own catalog and workflow.",
                    "Các điểm khởi đầu bạn có thể điều chỉnh cho danh mục và quy trình của riêng mình.",
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {examples.map((example) => (
                <div
                  key={example.title}
                  className="rounded-2xl border border-border-primary bg-bg-2/40 p-5"
                >
                  <h3 className="text-base font-medium text-text-primary">
                    {example.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    {example.blurb}
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent transition-transform hover:scale-[1.02]"
                  >
                    {t("Try it", "Thử ngay")}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      <LandingFooter />
    </div>
  );
}
