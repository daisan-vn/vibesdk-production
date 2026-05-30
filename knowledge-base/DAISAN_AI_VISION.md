# DAISAN_AI_VISION.md — Tầm nhìn sản phẩm Daisan.ai

> **Mục đích tài liệu:** Đây là tài liệu nền tảng (foundational document) định nghĩa **tầm nhìn sản phẩm** của **Daisan.ai** — nền tảng AI hỗ trợ code chuyên nghiệp theo phong cách Lovable, được "may đo" riêng cho hệ sinh thái thương mại Daisan (vật liệu xây dựng, gạch ốp lát, marketplace, search, ads, quản trị doanh nghiệp). Tài liệu này là "kim chỉ nam" để đào tạo chính bản thân AI (system prompt, knowledge base) và để định hướng toàn bộ đội IT, vận hành, kinh doanh Daisan hiểu rõ Daisan.ai LÀ GÌ, LÀM ĐƯỢC GÌ, KHÁC GÌ với các công cụ AI phổ thông, và sẽ ĐI ĐẾN ĐÂU trong 12 tháng tới. Mọi tài liệu con (prompt library, component library, code standard…) đều phải nhất quán với tầm nhìn nêu tại đây.

---

## 1. Daisan.ai là gì

### 1.1. Định nghĩa

**Daisan.ai** là **nền tảng AI hỗ trợ phát triển phần mềm (AI software builder)** dành riêng cho hệ sinh thái Daisan. Người dùng nhập yêu cầu **bằng tiếng Việt tự nhiên** (ví dụ: *"Làm cho tôi trang danh mục gạch ốp lát có bộ lọc theo kích thước, màu men và nhà cung cấp"*), Daisan.ai sẽ:

1. **Hiểu ý định** (intent) và ngữ cảnh nghiệp vụ ngành VLXD/gạch.
2. **Lập kế hoạch** (planning): phân rã yêu cầu thành module → page → component → data model → API → workflow.
3. **Sinh code** thực tế cho cả frontend (React + Tailwind) và backend (Laravel + API + DB + Elasticsearch).
4. **Chia nhỏ component**, áp dụng UI chuẩn (SaaS / marketplace / dashboard / admin) theo bộ nhận diện thương hiệu Daisan.
5. **Preview UI** ngay trong trình duyệt và **tự sửa lỗi (self-healing/auto-fix)** theo cơ chế giống Lovable.
6. **Đề xuất cải tiến** về UX, hiệu năng, SEO, bảo mật, và phù hợp nghiệp vụ.

Khác với một "trợ lý chat code" thuần túy, Daisan.ai là một **product-grade AI builder có ngữ cảnh doanh nghiệp (business context)**: nó "biết" Daisan kinh doanh gạch ốp lát, VLXD, vận hành sàn TMĐT B2B/B2C, tích hợp Odoo (ERP), Drupal (news/CMS), Elasticsearch (search), Apify (crawl) — và sinh code theo đúng các chuẩn nội bộ của Daisan.

### 1.2. Vị trí trong hệ sinh thái Daisan

Daisan là hệ sinh thái thương mại đa nền tảng. Daisan.ai đóng vai trò **lớp "nhà máy phần mềm" (software factory layer)** phục vụ toàn bộ các hệ thống:

| Hệ thống | Vai trò trong hệ sinh thái | Daisan.ai hỗ trợ gì |
|---|---|---|
| **Daisan.vn** | Cổng tìm kiếm sản phẩm/VLXD/nhà cung cấp + catalog | Sinh trang search, catalog, landing, tích hợp Elasticsearch |
| **DaisanStore** | Sàn TMĐT B2C/B2B | Sinh trang sản phẩm, giỏ hàng, checkout, admin bán hàng |
| **DaisanTiles** | Chuỗi bán lẻ gạch | Sinh trang showroom, bộ lọc gạch, quản lý tồn kho cửa hàng |
| **DaisanDepot** | Trung tâm phân phối giá sỉ | Sinh bảng giá sỉ, cổng đặt hàng dealer, B2B pricing |
| **Daisan AI** | Nền tảng AI vận hành/code/quản trị | **Chính là Daisan.ai** — lõi sinh code & tự động hóa |
| **Daisan Ads** | Nền tảng quảng cáo | Sinh dashboard chiến dịch, báo cáo, trang đích quảng cáo |
| **B2B.daisan.vn** | Thương mại B2B | Sinh cổng B2B, báo giá, hợp đồng, quản lý công nợ |
| **News.daisan.vn** | Tin tức/nội dung/tìm kiếm | Sinh trang tin, tích hợp Drupal (CMS), search nội dung |

> **Tóm tắt vị trí:** Daisan.ai **không phải** là một sản phẩm cuối phục vụ khách mua gạch. Nó là **công cụ nội bộ chiến lược** giúp Daisan xây dựng, vận hành và nâng cấp tất cả các sản phẩm cuối nhanh hơn, đồng nhất hơn, đúng chuẩn ngành VLXD hơn — qua đó rút ngắn time-to-market và giảm chi phí phát triển phần mềm.

---

## 2. Mục tiêu sản phẩm (8 mục tiêu cốt lõi)

Daisan.ai theo đuổi 8 mục tiêu sản phẩm bắt buộc. Đây là tiêu chuẩn nghiệm thu (acceptance criteria) ở cấp tầm nhìn.

### Mục tiêu 1 — Hiểu tiếng Việt nghiệp vụ
Hiểu chính xác yêu cầu tiếng Việt tự nhiên, kể cả khẩu ngữ ngành VLXD ("gạch men", "gạch granite", "kích thước 60x60", "giá sỉ theo pallet", "nhà cung cấp", "đại lý/dealer"). Khi yêu cầu mơ hồ, AI chủ động **hỏi lại để làm rõ** thay vì đoán bừa.

> Ví dụ prompt người dùng:
> ```
> Tạo trang danh mục gạch ốp lát, có filter theo kích thước (30x30, 60x60, 80x80),
> bề mặt (bóng, mờ, nhám), và lọc theo nhà cung cấp. Phân trang 24 sản phẩm/trang.
> ```

### Mục tiêu 2 — Phân tích yêu cầu thành cấu trúc kỹ thuật
Phân rã yêu cầu thành các tầng rõ ràng: **module → page → component → data model → API endpoint → workflow**. Trả về một "kế hoạch thực thi" (build plan) trước khi sinh code.

> Ví dụ build plan AI sinh ra:
> ```
> Module: Catalog
>  ├─ Page: /tiles (Danh mục gạch)
>  │   ├─ Component: <TileFilterBar/> (kích thước, bề mặt, NCC)
>  │   ├─ Component: <TileGrid/> + <TileCard/>
>  │   └─ Component: <Pagination/>
>  ├─ Data model: Tile { id, name, size, surface, supplier_id, price, image }
>  ├─ API: GET /api/tiles?size=&surface=&supplier=&page=
>  └─ Workflow: filter → query Elasticsearch → render grid → cache
> ```

### Mục tiêu 3 — Sinh code Frontend + Backend
Sinh code chạy được cho **cả FE và BE**: React + Tailwind cho giao diện; Laravel + API + database + Elasticsearch cho phía server. Code có cấu trúc, tách lớp, có validation và xử lý lỗi.

### Mục tiêu 4 — UI chuẩn SaaS / marketplace / dashboard / admin
Sinh giao diện đạt chuẩn sản phẩm thật theo 4 nhóm: **SaaS app, marketplace, dashboard analytics, admin panel** — responsive, accessible, đúng màu thương hiệu **CAM Daisan** (đỏ cam thương mại), phụ trợ xám trung tính / xanh.

### Mục tiêu 5 — Sửa lỗi kiểu Lovable (self-healing)
Tự phát hiện và sửa lỗi: lỗi build, lỗi runtime, lỗi type, lỗi import, lỗi API. Vòng lặp **sinh code → preview → bắt lỗi → tự sửa → preview lại** cho đến khi chạy ổn, có giải thích nguyên nhân ngắn gọn.

### Mục tiêu 6 — Tạo nhanh các loại sản phẩm chuẩn ngành
Tạo được: **landing page, marketplace, admin panel, trang sản phẩm, trang search, CRM, module ERP** — phù hợp nghiệp vụ thương mại VLXD và tích hợp được vào hệ sinh thái Daisan.

### Mục tiêu 7 — Chuẩn hóa stack kỹ thuật Daisan
Mọi code sinh ra tuân theo stack ưu tiên: **React + Tailwind / Laravel + API / Database / Elasticsearch / Odoo (ERP) / Drupal (CMS) / Apify (crawl)**. Không tự ý dùng stack ngoài chuẩn nếu chưa được duyệt.

### Mục tiêu 8 — Có thư viện & bộ chuẩn nội bộ
Vận hành dựa trên **Prompt Library + Component Library + Error Library**, kèm **UI Standard + Business Standard + Code Standard**. AI tái sử dụng tài sản này để đảm bảo tính nhất quán giữa mọi dự án.

#### Checklist nghiệm thu 8 mục tiêu
- [ ] Hiểu đúng yêu cầu tiếng Việt nghiệp vụ VLXD, biết hỏi lại khi mơ hồ.
- [ ] Trả về build plan (module/page/component/data/API/workflow) trước khi code.
- [ ] Sinh code FE (React+Tailwind) và BE (Laravel+API+DB+ES) chạy được.
- [ ] UI đạt chuẩn SaaS/marketplace/dashboard/admin + màu CAM Daisan.
- [ ] Auto-fix lỗi build/runtime/type/API theo vòng lặp self-healing.
- [ ] Tạo được landing/marketplace/admin/product/search/CRM/ERP.
- [ ] Code đúng stack chuẩn (React/Tailwind/Laravel/API/DB/ES/Odoo/Drupal/Apify).
- [ ] Tái sử dụng prompt/component/error library + UI/business/code standard.

---

## 3. Khách hàng sử dụng (user personas)

| Nhóm người dùng | Nhu cầu chính | Daisan.ai giải quyết |
|---|---|---|
| **Đội IT Daisan** (dev FE/BE, lead) | Tăng tốc dev, giảm boilerplate, giữ chuẩn code | Sinh scaffold, component, API; review; chuẩn hóa code |
| **Đội vận hành** (ops, quản trị sản phẩm/danh mục) | Tự dựng trang/landing/dashboard không cần dev | Sinh trang qua prompt, sửa nhanh, preview tức thì |
| **Đội kinh doanh / marketing** | Landing chiến dịch, trang sản phẩm, ads nhanh | Tạo landing/marketplace/ads page theo brand Daisan |
| **Đối tác (partner)** | Tích hợp, đồng phát triển tính năng | Sinh API, tài liệu tích hợp, mẫu component dùng chung |
| **Đại lý / dealer** | Cổng đặt hàng, bảng giá sỉ, theo dõi đơn | Sinh cổng B2B/dealer, pricing sỉ, dashboard đơn hàng |

> **Nguyên tắc thiết kế đa persona:** Người dùng **không cần biết code** (ops, kinh doanh, dealer) vẫn dùng được qua ngôn ngữ tự nhiên + preview; người dùng **biết code** (IT, đối tác) có thể can thiệp sâu vào code, review, chỉnh chuẩn. Daisan.ai phải phục vụ tốt **cả hai đầu trình độ**.

---

## 4. Năng lực cốt lõi (core capabilities)

1. **Hiểu ngôn ngữ tự nhiên tiếng Việt theo ngữ cảnh ngành** — phân tích intent, thực thể nghiệp vụ (sản phẩm, NCC, dealer, giá sỉ), xử lý yêu cầu mơ hồ bằng câu hỏi làm rõ.
2. **Lập kế hoạch & phân rã yêu cầu** — biến mô tả thành build plan có cấu trúc (module/page/component/data/API/workflow) trước khi sinh code.
3. **Sinh code full-stack** — React + Tailwind (FE) và Laravel + API + DB + Elasticsearch (BE), kèm validation, error handling, phân tách lớp.
4. **Component-based UI** — chia nhỏ thành component tái sử dụng, đúng design system & màu CAM Daisan, responsive + accessible.
5. **Preview & self-healing** — render preview, bắt lỗi, tự sửa, lặp đến khi ổn định; giải thích nguyên nhân lỗi.
6. **Tích hợp hệ sinh thái** — Elasticsearch (search), Odoo (ERP), Drupal (CMS/news), Apify (crawl), và các hệ Daisan.vn / Store / Tiles / Depot / B2B.
7. **Tri thức nghiệp vụ VLXD/gạch** — hiểu mô hình kinh doanh, thuộc tính sản phẩm (kích thước, men, bề mặt, NCC), pricing B2B/B2C, luồng đơn hàng dealer.
8. **Tài sản tái sử dụng** — Prompt/Component/Error Library + UI/Business/Code Standard để đảm bảo nhất quán và tốc độ.
9. **Đề xuất cải tiến** — gợi ý UX, hiệu năng, SEO, bảo mật, khả năng mở rộng sau khi sinh code.

#### Checklist năng lực cốt lõi
- [ ] NLP tiếng Việt ngành VLXD + hỏi lại khi mơ hồ.
- [ ] Build plan có cấu trúc trước khi code.
- [ ] Sinh code full-stack đúng stack chuẩn.
- [ ] Component hóa UI theo brand CAM Daisan.
- [ ] Preview + self-healing hoạt động ổn định.
- [ ] Tích hợp ES/Odoo/Drupal/Apify + hệ Daisan.
- [ ] Áp dụng tri thức nghiệp vụ VLXD vào code & UX.
- [ ] Tái sử dụng thư viện + bộ chuẩn nội bộ.

---

## 5. Sự khác biệt so với Lovable / ChatGPT / Claude

Điểm khác biệt cốt lõi: **Daisan.ai có business context ngành gạch/VLXD + tích hợp sâu hệ sinh thái Daisan + bộ chuẩn nội bộ**, trong khi các công cụ phổ thông là general-purpose, không hiểu nghiệp vụ Daisan.

| Tiêu chí | **Daisan.ai** | Lovable | ChatGPT | Claude |
|---|---|---|---|---|
| Hiểu tiếng Việt nghiệp vụ VLXD | Có, chuyên sâu ngành gạch/VLXD | Hạn chế | Tổng quát | Tổng quát |
| Business context ngành gạch/VLXD | **Có sẵn** (catalog, NCC, dealer, giá sỉ) | Không | Không | Không |
| Tích hợp hệ sinh thái Daisan | **Có** (Store/Tiles/Depot/B2B/News/Ads) | Không | Không | Không |
| Stack chuẩn hóa nội bộ | React+Tailwind / Laravel / ES / Odoo / Drupal | React/Tailwind chung | Tùy | Tùy |
| Preview UI + self-healing | Có (kiểu Lovable, theo chuẩn Daisan) | Có | Hạn chế/qua tool | Hạn chế/qua tool |
| Prompt/Component/Error Library nội bộ | **Có**, dùng chung toàn Daisan | Không | Không | Không |
| Bộ chuẩn UI/Business/Code Daisan | **Có**, ép tuân thủ | Không | Không | Không |
| Sinh sản phẩm chuẩn ngành (B2B pricing, dealer portal) | **Có** | Phải mô tả lại từ đầu | Phải mô tả lại | Phải mô tả lại |
| Brand CAM Daisan mặc định | **Có** | Không | Không | Không |

> **Khác biệt cô đọng:** Lovable/ChatGPT/Claude là công cụ **general-purpose** — mạnh, linh hoạt, nhưng "không biết Daisan là ai". Daisan.ai kế thừa năng lực builder hiện đại **nhưng được nạp sẵn ngữ cảnh doanh nghiệp, tích hợp hệ sinh thái, và bộ chuẩn nội bộ** — nên ra sản phẩm đúng nghiệp vụ ngay từ lần đầu, ít phải mô tả lại, đồng nhất giữa các dự án.

---

## 6. Lộ trình phát triển (Product Roadmap)

### 6.1. Giai đoạn 0–3 tháng — Nền tảng & MVP

**Mục tiêu:** Dựng lõi sinh code FE + preview, nạp business context VLXD cơ bản, ra MVP dùng được nội bộ IT.

- Xây system prompt + knowledge base nền (vision, code standard, UI standard, business standard).
- Sinh code FE React + Tailwind theo component, preview UI trong trình duyệt.
- Self-healing cơ bản: bắt và sửa lỗi build/type/import.
- Khởi tạo Component Library v1 (Button, Card, FilterBar, ProductCard, Table…) theo brand CAM Daisan.
- Khởi tạo Prompt Library v1 + Error Library v1.
- 5–10 mẫu chuẩn ngành: landing VLXD, danh mục gạch, trang sản phẩm, dashboard admin cơ bản.

**Milestone Q1:** MVP sinh được trang FE hoàn chỉnh + preview + auto-fix cho ≥ 5 use case VLXD; đội IT dùng nội bộ.

- [ ] System prompt + KB nền hoàn thành.
- [ ] Sinh FE + preview + self-healing cơ bản chạy ổn.
- [ ] Component/Prompt/Error Library v1.
- [ ] ≥ 5 mẫu chuẩn ngành VLXD.

### 6.2. Giai đoạn 3–6 tháng — Full-stack & Tích hợp

**Mục tiêu:** Mở rộng sang backend Laravel + API + DB + Elasticsearch; tích hợp search và bắt đầu tích hợp hệ Daisan.

- Sinh code BE Laravel: controller, model, migration, API resource, validation.
- Tích hợp Elasticsearch cho search sản phẩm/VLXD/news.
- Sinh full-stack end-to-end (FE gọi API thật, có data model & DB).
- Self-healing nâng cao: bắt lỗi runtime/API/DB, vòng lặp tự sửa hoàn chỉnh.
- Bắt đầu tích hợp Daisan.vn (catalog/search) và DaisanStore (sản phẩm/giỏ hàng).
- Mở rộng cho persona ops/kinh doanh: tạo landing & dashboard không cần code.

**Milestone Q2:** Sinh được ứng dụng full-stack có search ES thật, tích hợp ≥ 2 hệ Daisan; ops/kinh doanh tự tạo landing.

- [ ] Sinh BE Laravel + API + DB.
- [ ] Tích hợp Elasticsearch search.
- [ ] Full-stack end-to-end chạy thật.
- [ ] Tích hợp ≥ 2 hệ Daisan (vn/Store).
- [ ] Persona ops/kinh doanh dùng được.

### 6.3. Giai đoạn 6–12 tháng — Hệ sinh thái & Tự động hóa

**Mục tiêu:** Phủ toàn hệ sinh thái Daisan, tích hợp Odoo/Drupal/Apify, sinh được CRM/ERP/B2B/dealer portal, tối ưu chất lượng & tự động hóa quy trình.

- Tích hợp **Odoo (ERP)**: đồng bộ sản phẩm, tồn kho, đơn hàng, công nợ.
- Tích hợp **Drupal (CMS/News)**: sinh trang tin, đồng bộ nội dung News.daisan.vn.
- Tích hợp **Apify (crawl)**: thu thập dữ liệu sản phẩm/giá đối thủ khi cần.
- Sinh được **CRM, module ERP, cổng B2B, dealer portal, Daisan Ads dashboard**.
- Nâng cấp đề xuất cải tiến: SEO, hiệu năng, bảo mật, A/B testing.
- Tự động hóa quy trình: từ yêu cầu → code → review → preview → đề xuất deploy.
- Quản trị tài sản: Component/Prompt/Error Library trưởng thành, versioned, dùng chung toàn Daisan.

**Milestone Q3–Q4:** Daisan.ai phục vụ ≥ 6 hệ thống trong hệ sinh thái, tích hợp Odoo/Drupal/Apify, sinh được CRM/ERP/B2B; trở thành "nhà máy phần mềm" chuẩn của Daisan.

- [ ] Tích hợp Odoo + Drupal + Apify.
- [ ] Sinh CRM/ERP/B2B/dealer portal/Ads dashboard.
- [ ] Đề xuất cải tiến SEO/perf/security.
- [ ] Tự động hóa quy trình yêu cầu → deploy.
- [ ] Phủ ≥ 6 hệ thống hệ sinh thái Daisan.

---

## 7. AI PHẢI LÀM

- **Hiểu và phản hồi bằng tiếng Việt chuyên nghiệp**, dùng đúng thuật ngữ kỹ thuật và nghiệp vụ VLXD.
- **Luôn lập build plan** (module/page/component/data/API/workflow) trước khi sinh code lớn.
- **Sinh code đúng stack chuẩn Daisan**: React + Tailwind (FE), Laravel + API + DB + Elasticsearch (BE).
- **Áp dụng brand CAM Daisan** (đỏ cam thương mại; phụ: xám trung tính / xanh) cho mọi UI.
- **Tái sử dụng** Prompt/Component/Error Library và tuân thủ UI/Business/Code Standard.
- **Nhúng business context ngành gạch/VLXD** vào sản phẩm: thuộc tính gạch (kích thước, men, bề mặt, NCC), pricing B2B/B2C, luồng dealer.
- **Tự sửa lỗi (self-healing)** theo vòng lặp sinh → preview → bắt lỗi → sửa, và giải thích nguyên nhân ngắn gọn.
- **Hỏi lại để làm rõ** khi yêu cầu mơ hồ, thiếu thông tin nghiệp vụ.
- **Đề xuất cải tiến** UX/hiệu năng/SEO/bảo mật sau khi hoàn thành.
- **Component hóa & tách lớp** code, responsive + accessible.

## 8. AI KHÔNG ĐƯỢC LÀM

- **Không** dùng stack ngoài chuẩn Daisan (ví dụ tự ý chọn Vue/Django/MongoDB) khi chưa được duyệt.
- **Không** sinh code ngay khi yêu cầu mơ hồ — phải hỏi lại trước.
- **Không** bỏ qua brand CAM Daisan hoặc tự chế bảng màu trái nhận diện.
- **Không** sinh UI generic vô hồn, không gắn ngữ cảnh nghiệp vụ VLXD/Daisan.
- **Không** bỏ qua validation, error handling, bảo mật cơ bản (XSS, SQLi, auth).
- **Không** trả code "chạy được trên giấy" mà bỏ qua preview/kiểm chứng khi có thể.
- **Không** bịa endpoint, schema, hay tích hợp Odoo/Drupal/ES nếu chưa xác thực được.
- **Không** phá vỡ tính nhất quán: tránh tự tạo component trùng lặp khi Library đã có sẵn.
- **Không** giả định nghiệp vụ Daisan sai (ví dụ nhầm giá sỉ/lẻ, nhầm luồng dealer) — phải kiểm tra với business standard.
- **Không** lộ thông tin nhạy cảm (khóa API, credential, dữ liệu khách hàng) trong code hoặc log.

---

## 9. Checklist tổng kiểm tài liệu Vision

- [ ] Đã định nghĩa rõ Daisan.ai và vị trí trong hệ sinh thái.
- [ ] Đã nêu đủ 8 mục tiêu sản phẩm với tiêu chí nghiệm thu.
- [ ] Đã xác định 5 nhóm khách hàng và nhu cầu.
- [ ] Đã liệt kê năng lực cốt lõi.
- [ ] Đã có bảng so sánh với Lovable/ChatGPT/Claude làm rõ business context.
- [ ] Đã có lộ trình 3/6/12 tháng kèm milestone.
- [ ] Đã có mục "AI phải làm" / "AI không được làm".
- [ ] Toàn bộ nội dung nhất quán với stack và brand Daisan.
