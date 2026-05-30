# PROMPT_STANDARD.md — Chuẩn viết Prompt cho Daisan.ai

> Tài liệu này định nghĩa **chuẩn viết prompt** (prompt engineering standard) cho nền tảng **Daisan.ai** — công cụ AI hỗ trợ code chuyên nghiệp của hệ sinh thái Daisan. Mục tiêu: giúp đội IT, PM, designer và mọi người dùng nội bộ viết được prompt **rõ ràng, đầy đủ ngữ cảnh, sinh ra kết quả đúng ngay từ lần đầu** — giảm số vòng lặp sửa đổi, đảm bảo code sinh ra đúng stack (React + Tailwind, Laravel API), đúng nhận diện thương hiệu (cam Daisan), đúng nghiệp vụ ngành gạch ốp lát / vật liệu xây dựng (VLXD). Tài liệu cung cấp công thức chuẩn, 10 mẫu prompt hoàn chỉnh gắn ngành Daisan, mẹo, lỗi thường gặp, checklist và quy tắc "AI phải làm / không được làm".

---

## 1. Triết lý viết prompt cho Daisan.ai

Một prompt tốt cho Daisan.ai không phải là "câu lệnh ngắn gọn", mà là một **bản đặc tả (spec) súc tích nhưng đầy đủ**. AI sinh code chỉ tốt ngang với lượng ngữ cảnh nó nhận được. Người dùng Daisan thường thuộc ngành thương mại VLXD, nên prompt phải "dịch" được nghiệp vụ (gạch, kích thước, bề mặt men, đơn vị m²/viên/thùng, giá sỉ/lẻ) thành yêu cầu kỹ thuật.

Ba nguyên tắc cốt lõi:

1. **Cụ thể thắng mơ hồ.** "Tạo trang bán gạch đẹp" là vô nghĩa với máy. "Tạo landing page giới thiệu dòng gạch granite 60x60 cho DaisanTiles, hero + 4 USP + grid 8 sản phẩm + form tư vấn, màu cam #EA5B0C" mới sinh đúng.
2. **Bối cảnh Daisan luôn hiện diện.** Mỗi prompt phải nói rõ thuộc hệ thống nào (Daisan.vn / DaisanStore / DaisanTiles / DaisanDepot / B2B / News / Ads), đối tượng người dùng (B2C hay B2B, đại lý hay người tiêu dùng cuối), và stack.
3. **Định nghĩa "xong" trước khi bắt đầu.** Luôn kèm **tiêu chí hoàn thành** để AI tự kiểm tra và để người dùng nghiệm thu khách quan.

---

## 2. Công thức viết prompt chuẩn (7 thành phần)

Mọi prompt nghiêm túc gửi Daisan.ai nên có đủ 7 khối sau (theo thứ tự). Với yêu cầu nhỏ có thể gộp, nhưng **không bao giờ bỏ khối Mục tiêu và Output**.

| # | Khối | Trả lời câu hỏi | Ví dụ ngắn |
|---|------|-----------------|------------|
| 1 | **Vai trò** | AI đóng vai gì? | "Bạn là senior frontend engineer chuyên React + Tailwind." |
| 2 | **Bối cảnh Daisan** | Thuộc hệ thống nào, người dùng là ai, nghiệp vụ gì? | "Dự án DaisanTiles, bán lẻ gạch ốp lát, khách là chủ nhà & nhà thầu." |
| 3 | **Mục tiêu** | Cần đạt được gì (1 câu)? | "Tạo landing page giới thiệu bộ sưu tập gạch granite mới." |
| 4 | **Yêu cầu cụ thể** | Các phần/chức năng/dữ liệu chi tiết? | "Hero, 4 USP, grid 8 sản phẩm, form tư vấn, footer." |
| 5 | **Ràng buộc** | Stack, thư viện, màu, accessibility, hiệu năng, không được dùng gì? | "React + TS + Tailwind, không dùng UI lib ngoài, màu cam #EA5B0C." |
| 6 | **Output mong muốn** | Định dạng kết quả: file nào, component nào, có data mẫu không? | "Một component `LandingGranite.tsx` + data mẫu, code chạy được." |
| 7 | **Tiêu chí hoàn thành** | Khi nào coi là xong / nghiệm thu? | "Responsive 3 breakpoint, có alt ảnh, không lỗi TypeScript." |

### Khung mẫu rỗng (copy để điền)

```text
[VAI TRÒ]
Bạn là <vai trò: senior frontend/backend engineer, ...> chuyên <công nghệ>.

[BỐI CẢNH DAISAN]
Hệ thống: <Daisan.vn | DaisanStore | DaisanTiles | DaisanDepot | B2B | News | Ads>.
Nghiệp vụ: <ngành gạch/VLXD, B2C/B2B, đối tượng người dùng, đặc thù>.
Stack hiện tại: React + TypeScript + Tailwind (FE); Laravel + REST API (BE); Elasticsearch (search) khi cần.

[MỤC TIÊU]
<Một câu mô tả kết quả cần đạt.>

[YÊU CẦU CỤ THỂ]
- <Phần 1 / chức năng 1>
- <Phần 2 / dữ liệu cần hiển thị>
- <...>

[RÀNG BUỘC]
- Màu thương hiệu: cam Daisan #EA5B0C (chính), xám #6B7280 / xanh #1E3A8A (phụ).
- Không dùng <thư viện cấm>; ưu tiên <thư viện chuẩn>.
- Accessibility, SEO, hiệu năng: <yêu cầu cụ thể>.

[OUTPUT MONG MUỐN]
<File/component nào, có data mẫu, code chạy được, kèm hướng dẫn nếu cần.>

[TIÊU CHÍ HOÀN THÀNH]
- [ ] <Tiêu chí 1>
- [ ] <Tiêu chí 2>
```

> Quy ước biến: trong toàn bộ tài liệu, các giá trị cần thay đặt trong dấu ngoặc nhọn `{TÊN_BIẾN}`. Trước khi gửi, thay hết `{...}` bằng giá trị thật.

---

## 3. Bộ giá trị chuẩn Daisan (dùng chung mọi prompt)

Để tránh lặp lại, khai báo một lần "hằng số thương hiệu" và tham chiếu trong prompt:

```text
[HẰNG SỐ DAISAN]
- Màu chính (CAM): #EA5B0C  | hover: #C94E0A | nền nhạt: #FFF3EC
- Màu phụ: xám #6B7280, xám nền #F5F5F5, xanh navy #1E3A8A
- Font: Inter / system-ui; tiêu đề đậm, thân chữ 14–16px
- Đơn vị ngành gạch: m², viên, thùng (hộp); quy đổi m²/thùng theo từng mã
- Thuộc tính sản phẩm gạch: kích thước (60x60, 80x80, 30x60...), bề mặt (bóng kính/mờ/nhám/sần),
  chất liệu (granite/ceramic/porcelain), màu/vân (vân đá, vân gỗ, xi măng), khu vực dùng (lát nền/ốp tường/sân vườn)
- Vai trò người dùng: khách lẻ (B2C), nhà thầu/đại lý (B2B), admin nội bộ
- Ngôn ngữ giao diện: tiếng Việt; tiền tệ: VND, định dạng 1.250.000 ₫
```

---

## 4. Mười mẫu prompt chuẩn (gắn ngành gạch/VLXD Daisan)

Mỗi mẫu gồm: **prompt mẫu hoàn chỉnh** (code block) → **biến cần thay** → **lưu ý**.

### 4.1. Mẫu 1 — Tạo Landing Page

```text
[VAI TRÒ]
Bạn là senior frontend engineer chuyên React + TypeScript + Tailwind, có gu thiết kế marketing landing page chuyển đổi cao.

[BỐI CẢNH DAISAN]
Hệ thống: DaisanTiles (chuỗi bán lẻ gạch ốp lát). Khách hàng: chủ nhà và nhà thầu đang tìm gạch cho công trình.
Đang chạy chiến dịch ra mắt bộ sưu tập "{TÊN_BỘ_SƯU_TẬP}" — dòng gạch {LOẠI_GẠCH} kích thước {KÍCH_THƯỚC}.

[MỤC TIÊU]
Tạo một landing page giới thiệu bộ sưu tập và thu lead tư vấn.

[YÊU CẦU CỤ THỂ]
- Hero: tiêu đề lớn, phụ đề, 1 ảnh phối cảnh không gian lát gạch, 2 nút CTA ("Nhận báo giá", "Xem bộ sưu tập").
- Dải 4 USP (icon + tiêu đề + mô tả ngắn): chống trơn, chống thấm, bảo hành {SỐ_NĂM} năm, giao hàng tận công trình.
- Grid 8 sản phẩm nổi bật: ảnh, tên mã, kích thước, bề mặt, giá tham khảo/m².
- Khối "Không gian thực tế": 3 ảnh dự án đã thi công (lát nền, ốp tường, sân vườn).
- Form tư vấn: họ tên, SĐT, khu vực, diện tích cần lát (m²) → nút "Gửi yêu cầu".
- Footer: thông tin DaisanTiles, hotline, liên kết DaisanStore.

[RÀNG BUỘC]
- React + TS + Tailwind; không dùng UI lib ngoài; icon dùng lucide-react.
- Màu chính cam #EA5B0C, nền nhạt #FFF3EC; CTA nổi bật bằng cam.
- Responsive mobile-first; ảnh có alt; nút có aria-label; chữ tương phản đạt AA.
- Dùng ảnh placeholder (picsum/unsplash placeholder) kèm chú thích cần thay.

[OUTPUT MONG MUỐN]
Một component `LandingTiles.tsx` tự chứa + mảng data mẫu 8 sản phẩm. Code chạy được ngay, không lỗi TypeScript.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Hiển thị đúng 5 khối + footer, không vỡ layout ở 360px / 768px / 1280px.
- [ ] CTA và form dùng đúng màu cam Daisan; form có validate cơ bản (SĐT số, bắt buộc nhập tên).
- [ ] Toàn bộ text tiếng Việt; giá định dạng VND.
```

**Biến cần thay:** `{TÊN_BỘ_SƯU_TẬP}`, `{LOẠI_GẠCH}` (granite/porcelain...), `{KÍCH_THƯỚC}` (60x60...), `{SỐ_NĂM}` bảo hành.
**Lưu ý:** Landing là trang marketing — ưu tiên tốc độ tải và CTA. Yêu cầu AI tách phần data ra để dễ thay bằng API thật sau. Nếu cần đa chiến dịch, yêu cầu prop hóa tiêu đề/USP.

---

### 4.2. Mẫu 2 — Tạo Marketplace (sàn TMĐT)

```text
[VAI TRÒ]
Bạn là senior fullstack engineer (React + TS + Tailwind FE, Laravel API BE) thiết kế giao diện sàn TMĐT.

[BỐI CẢNH DAISAN]
Hệ thống: DaisanStore (sàn B2C/B2B vật liệu xây dựng). Người dùng: khách lẻ và đại lý mua gạch, thiết bị vệ sinh, sơn, xi măng.
Cần trang chủ marketplace tổng hợp nhiều nhà cung cấp và nhiều ngành hàng.

[MỤC TIÊU]
Tạo trang chủ marketplace với điều hướng ngành hàng, sản phẩm nổi bật, nhà cung cấp tiêu biểu và thanh tìm kiếm.

[YÊU CẦU CỤ THỂ]
- Header: logo, ô tìm kiếm (placeholder "Tìm gạch, thiết bị vệ sinh, sơn..."), giỏ hàng, đăng nhập, chọn vai trò (Mua lẻ / Mua sỉ B2B).
- Thanh danh mục ngang: Gạch ốp lát, Thiết bị vệ sinh, Sơn & chống thấm, Xi măng & vữa, Ngói & tấm lợp, Khác.
- Banner carousel khuyến mãi (3 slide).
- Section "Sản phẩm bán chạy": grid card sản phẩm (ảnh, tên, giá lẻ, giá sỉ nếu B2B, nhà cung cấp, nút "Thêm vào giỏ").
- Section "Nhà cung cấp tiêu biểu": logo + tên + số sản phẩm.
- Section "Theo ngành hàng": tabs lọc nhanh theo danh mục.
- Footer đầy đủ (chính sách, vận chuyển, liên hệ).

[RÀNG BUỘC]
- React + TS + Tailwind; state quản lý bằng hook đơn giản (useState/useReducer); chưa cần Redux.
- Card sản phẩm tái sử dụng được (component `ProductCard`).
- Phân biệt giá theo vai trò: B2C thấy giá lẻ; B2B thấy thêm giá sỉ và "Yêu cầu báo giá số lượng".
- Màu cam Daisan cho nút chính và badge khuyến mãi; lưới responsive 2/3/4 cột theo breakpoint.
- Dữ liệu lấy từ hàm `fetchProducts()` mô phỏng (mock) trả Promise — sẵn sàng nối API Laravel `/api/products`.

[OUTPUT MONG MUỐN]
Bộ component: `MarketplaceHome.tsx`, `ProductCard.tsx`, `CategoryBar.tsx`, kèm mock data và mock API. Có trạng thái loading/empty.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Chuyển vai trò B2C/B2B đổi đúng hiển thị giá.
- [ ] Grid responsive, không vỡ ở 360/768/1280px; có skeleton khi loading.
- [ ] ProductCard tái sử dụng, nhận props rõ ràng, có type đầy đủ.
```

**Biến cần thay:** danh sách ngành hàng (nếu khác), số slide banner, endpoint API thật.
**Lưu ý:** Marketplace lớn — yêu cầu AI **chia component ngay từ đầu** và mô phỏng API để dễ ghép Laravel. Nhấn mạnh logic giá B2C/B2B vì đây là đặc thù Daisan dễ bị bỏ sót.

---

### 4.3. Mẫu 3 — Tạo Dashboard (quản trị/kinh doanh)

```text
[VAI TRÒ]
Bạn là senior frontend engineer chuyên dashboard quản trị dữ liệu với React + TS + Tailwind + Recharts.

[BỐI CẢNH DAISAN]
Hệ thống: Daisan AI / quản trị nội bộ DaisanStore. Người dùng: quản lý kinh doanh theo dõi doanh số gạch & VLXD.

[MỤC TIÊU]
Tạo dashboard tổng quan kinh doanh: KPI, biểu đồ doanh thu, top sản phẩm, tồn kho cảnh báo.

[YÊU CẦU CỤ THỂ]
- Hàng KPI (4 thẻ): Doanh thu tháng (VND), Đơn hàng, Khách mới, Tỉ lệ chuyển đổi — mỗi thẻ có % so với kỳ trước (tăng/giảm màu).
- Biểu đồ đường doanh thu 12 tháng (Recharts LineChart).
- Biểu đồ cột "Doanh thu theo ngành hàng" (Gạch, Thiết bị vệ sinh, Sơn...).
- Bảng "Top 10 sản phẩm bán chạy": mã, tên, kích thước, số m² bán, doanh thu.
- Khối "Cảnh báo tồn kho thấp": danh sách mã gạch sắp hết (badge đỏ).
- Bộ lọc thời gian: 7 ngày / 30 ngày / quý / tùy chọn.

[RÀNG BUỘC]
- React + TS + Tailwind; biểu đồ dùng recharts; bảng có sort cơ bản.
- Layout: sidebar trái + nội dung chính; sidebar collapse được trên mobile.
- Màu cam Daisan cho điểm nhấn KPI và đường biểu đồ chính; xanh/đỏ cho tăng/giảm.
- Số liệu lấy từ mock `dashboardData` — tách riêng để dễ thay bằng API `/api/analytics`.
- Định dạng số VND và phần trăm theo locale vi-VN.

[OUTPUT MONG MUỐN]
`Dashboard.tsx` + các component con (`KpiCard`, `RevenueChart`, `TopProductsTable`, `LowStockAlert`) + mock data. Có loading state.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] 4 KPI hiển thị đúng định dạng VND và % màu tăng/giảm.
- [ ] Biểu đồ render không lỗi, responsive theo container.
- [ ] Bảng top sản phẩm sort được; bộ lọc thời gian đổi dữ liệu (mock).
```

**Biến cần thay:** danh mục ngành hàng, danh sách KPI cần theo dõi, dải thời gian mặc định.
**Lưu ý:** Dashboard nặng dữ liệu — yêu cầu định dạng số chuẩn vi-VN ngay (lỗi hay gặp là hiển thị `1250000` thô). Yêu cầu tách data để cắm API analytics thật.

---

### 4.4. Mẫu 4 — Tạo Product Listing (trang danh sách sản phẩm + lọc)

```text
[VAI TRÒ]
Bạn là senior frontend engineer chuyên trang danh mục TMĐT với lọc/sắp xếp/phân trang.

[BỐI CẢNH DAISAN]
Hệ thống: DaisanStore / DaisanTiles. Trang danh sách gạch ốp lát, người dùng cần lọc nhanh theo thuộc tính kỹ thuật.

[MỤC TIÊU]
Tạo trang listing gạch với bộ lọc thuộc tính, sắp xếp, phân trang và grid sản phẩm.

[YÊU CẦU CỤ THỂ]
- Sidebar bộ lọc:
  - Kích thước: 30x60, 60x60, 80x80, 60x120, 80x160 (checkbox nhiều lựa chọn).
  - Bề mặt: bóng kính, mờ, nhám, sần.
  - Chất liệu: granite, ceramic, porcelain.
  - Vân/màu: vân đá, vân gỗ, xi măng, trơn.
  - Khu vực dùng: lát nền, ốp tường, sân vườn.
  - Khoảng giá (slider, đơn vị VND/m²).
- Thanh trên: tổng số kết quả, ô sắp xếp (Giá tăng/giảm, Mới nhất, Bán chạy), chuyển grid/list.
- Grid card: ảnh, mã, tên, kích thước, bề mặt, giá/m², badge "Mới"/"Giảm giá".
- Phân trang (hoặc infinite scroll) + trạng thái rỗng "Không tìm thấy sản phẩm phù hợp".

[RÀNG BUỘC]
- React + TS + Tailwind; lọc đồng bộ vào query string (URL) để chia sẻ được link đã lọc.
- Lọc/sắp xếp gọi `fetchProducts(filters)` mock trả Promise; sẵn sàng nối Elasticsearch qua API Laravel.
- Sidebar thu gọn thành drawer trên mobile.
- Màu cam Daisan cho nút áp dụng lọc và badge; bộ lọc đang chọn hiển thị dạng chip xóa nhanh.

[OUTPUT MONG MUỐN]
`ProductListing.tsx` + `FilterSidebar.tsx` + `ProductCard.tsx` + mock API có hỗ trợ lọc. Có loading/empty/error state.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Lọc nhiều thuộc tính cùng lúc hoạt động đúng; chip lọc xóa được.
- [ ] Sắp xếp và phân trang hoạt động; URL phản ánh trạng thái lọc.
- [ ] Mobile: sidebar thành drawer; grid responsive 2/3/4 cột.
```

**Biến cần thay:** tập giá trị bộ lọc (theo catalog thật), cơ chế phân trang (page vs infinite), endpoint Elasticsearch.
**Lưu ý:** Đây là nơi tích hợp **Elasticsearch** của Daisan — yêu cầu AI thiết kế cấu trúc `filters` rõ ràng để map sang query ES. Nhấn đồng bộ URL để SEO và chia sẻ link.

---

### 4.5. Mẫu 5 — Tạo Product Detail (trang chi tiết sản phẩm)

```text
[VAI TRÒ]
Bạn là senior frontend engineer chuyên trang chi tiết sản phẩm TMĐT chuyển đổi cao.

[BỐI CẢNH DAISAN]
Hệ thống: DaisanStore / DaisanTiles. Trang chi tiết một mã gạch; khách cần đủ thông tin kỹ thuật để quyết định và tính số lượng.

[MỤC TIÊU]
Tạo trang chi tiết sản phẩm gạch đầy đủ: gallery, thông số, tính m², giá, mua hàng, gợi ý liên quan.

[YÊU CẦU CỤ THỂ]
- Gallery ảnh (ảnh lớn + thumbnail, có ảnh phối cảnh không gian).
- Khối thông tin: tên mã, kích thước, bề mặt, chất liệu, vân, xuất xứ, đơn vị (m²/thùng), số m²/thùng.
- Giá: giá lẻ/m², giá sỉ/m² (ẩn/hiện theo vai trò B2B), giá/thùng tự tính.
- Công cụ "Tính số lượng": nhập diện tích cần lát (m²) + % hao hụt (mặc định 5–10%) → ra số m² và số thùng cần mua, tổng tiền.
- Nút "Thêm vào giỏ" và "Yêu cầu báo giá" (cho đại lý B2B).
- Tabs: Mô tả, Thông số kỹ thuật (bảng), Hướng dẫn thi công, Chính sách đổi trả.
- Section "Sản phẩm liên quan" (cùng bộ sưu tập / cùng kích thước).

[RÀNG BUỘC]
- React + TS + Tailwind; component tái sử dụng cho gallery và bảng thông số.
- Logic tính thùng phải đúng: số_thùng = ceil(diện_tích * (1 + hao_hụt) / m²_mỗi_thùng).
- Dữ liệu từ `fetchProduct(id)` mock; vai trò B2C/B2B đổi hiển thị giá.
- Màu cam Daisan cho CTA; tabs có trạng thái active rõ ràng; ảnh có alt.

[OUTPUT MONG MUỐN]
`ProductDetail.tsx` + `ImageGallery.tsx` + `QuantityCalculator.tsx` + `SpecTable.tsx` + mock data 1 sản phẩm và vài sản phẩm liên quan.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Công cụ tính m²→thùng→tiền cho kết quả đúng theo công thức, làm tròn lên.
- [ ] Vai trò B2B hiển thị giá sỉ và nút báo giá; B2C ẩn giá sỉ.
- [ ] Gallery đổi ảnh, tabs chuyển nội dung; responsive đầy đủ.
```

**Biến cần thay:** % hao hụt mặc định, danh sách tab, quy đổi m²/thùng theo mã.
**Lưu ý:** Đặc thù ngành gạch là **quy đổi m²/thùng và hao hụt cắt gạch** — đây là phần dễ sai nhất, phải nêu rõ công thức và yêu cầu làm tròn lên. Đừng để AI tự đoán đơn vị.

---

### 4.6. Mẫu 6 — Tạo Admin CRUD (quản trị sản phẩm)

```text
[VAI TRÒ]
Bạn là senior fullstack engineer (React + TS + Tailwind FE; Laravel REST API BE) xây trang quản trị CRUD.

[BỐI CẢNH DAISAN]
Hệ thống: quản trị nội bộ DaisanStore. Người dùng: nhân viên vận hành quản lý danh mục sản phẩm gạch/VLXD.

[MỤC TIÊU]
Tạo trang Admin quản lý sản phẩm: liệt kê, tìm kiếm, thêm, sửa, xóa (CRUD) qua API.

[YÊU CẦU CỤ THỂ]
- Bảng danh sách: ảnh, mã, tên, kích thước, chất liệu, giá lẻ/m², tồn kho, trạng thái (hiện/ẩn), hành động (Sửa/Xóa).
- Thanh công cụ: ô tìm kiếm (tên/mã), lọc theo danh mục & trạng thái, nút "Thêm sản phẩm", phân trang server-side.
- Form thêm/sửa (modal hoặc trang riêng): các trường tên, mã (SKU), danh mục, kích thước, bề mặt, chất liệu, vân, đơn vị, m²/thùng, giá lẻ, giá sỉ, tồn kho, mô tả, upload ảnh, trạng thái.
- Validate: mã SKU duy nhất, giá > 0, tồn kho >= 0, trường bắt buộc.
- Xác nhận trước khi xóa; thông báo toast thành công/thất bại.

[RÀNG BUỘC]
- React + TS + Tailwind; gọi API Laravel: GET /api/admin/products, POST, PUT/{id}, DELETE/{id}.
- Quản lý form bằng react-hook-form + zod (validate); xử lý lỗi 4xx/5xx hiển thị thân thiện.
- Tách lớp gọi API (`productApi.ts`) khỏi UI; có mock fallback khi chưa có BE.
- Màu cam Daisan cho nút chính; nút Xóa màu đỏ; bảng có loading/empty.
- Hiển thị thông báo lỗi validate tiếng Việt rõ ràng.

[OUTPUT MONG MUỐN]
`AdminProducts.tsx` + `ProductForm.tsx` + `productApi.ts` (kèm type & schema zod) + mock data. Luồng CRUD chạy được với mock.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Thêm/sửa/xóa hoạt động (mock), cập nhật bảng ngay; toast phản hồi.
- [ ] Validate chặn dữ liệu sai (SKU trùng, giá âm) với thông báo tiếng Việt.
- [ ] Lớp API tách riêng, type đầy đủ, dễ chuyển từ mock sang Laravel thật.
```

**Biến cần thay:** danh sách trường form (theo schema DB thật), base URL API, cơ chế upload ảnh (S3/Laravel storage).
**Lưu ý:** Yêu cầu **tách lớp API** ngay từ đầu để khớp Laravel. Nhấn validate phía client nhưng nhắc AI rằng validate thật vẫn nằm ở backend. Định nghĩa rõ mã lỗi để hiển thị thân thiện.

---

### 4.7. Mẫu 7 — Sửa lỗi (Bug Fix)

```text
[VAI TRÒ]
Bạn là senior engineer chuyên debug React + TS / Laravel, tiếp cận theo phương pháp tìm nguyên nhân gốc.

[BỐI CẢNH DAISAN]
Hệ thống: {HỆ_THỐNG}. Màn hình/chức năng: {MÀN_HÌNH} (ví dụ: bộ lọc gạch trên Product Listing).

[MỤC TIÊU]
Tìm nguyên nhân gốc và sửa lỗi sau, không phá vỡ chức năng khác.

[MÔ TẢ LỖI]
- Hành vi hiện tại (sai): {HÀNH_VI_SAI}.
- Hành vi mong đợi (đúng): {HÀNH_VI_ĐÚNG}.
- Các bước tái hiện: {BƯỚC_1} → {BƯỚC_2} → {BƯỚC_3}.
- Thông báo lỗi / log (nếu có): {LOG_LỖI}.
- Môi trường: {TRÌNH_DUYỆT / THIẾT_BỊ / KÍCH_THƯỚC_MÀN_HÌNH}.

[MÃ NGUỒN LIÊN QUAN]
{DÁN_ĐOẠN_CODE_HOẶC_FILE}

[RÀNG BUỘC]
- Chỉ sửa phần liên quan đến lỗi; không refactor lan man, không đổi API public.
- Giữ nguyên style code và stack hiện tại.
- Nếu có nhiều nguyên nhân khả dĩ, liệt kê và chỉ ra nguyên nhân khả năng cao nhất trước.

[OUTPUT MONG MUỐN]
1) Giải thích ngắn nguyên nhân gốc.
2) Bản vá (diff hoặc đoạn code sửa) tối thiểu.
3) Cách kiểm thử lại để xác nhận đã hết lỗi.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Lỗi không còn tái hiện theo các bước đã nêu.
- [ ] Không phát sinh lỗi mới (console sạch, TypeScript pass).
- [ ] Có gợi ý test/regression để tránh lặp lại.
```

**Biến cần thay:** `{HỆ_THỐNG}`, `{MÀN_HÌNH}`, `{HÀNH_VI_SAI/ĐÚNG}`, các bước tái hiện, `{LOG_LỖI}`, đoạn code.
**Lưu ý:** Chất lượng fix tỉ lệ thuận với chất lượng mô tả lỗi. **Luôn dán log và bước tái hiện.** Yêu cầu nguyên nhân gốc trước khi vá để tránh "vá triệu chứng". Cấm refactor ngoài phạm vi lỗi.

---

### 4.8. Mẫu 8 — Refactor Code

```text
[VAI TRÒ]
Bạn là senior engineer chuyên tái cấu trúc code, ưu tiên đọc hiểu và tái sử dụng, giữ nguyên hành vi.

[BỐI CẢNH DAISAN]
Hệ thống: {HỆ_THỐNG}. Module: {MODULE} (ví dụ: component giỏ hàng DaisanStore đang dài 600 dòng, khó bảo trì).

[MỤC TIÊU]
Refactor đoạn code sau để dễ đọc, dễ test, tái sử dụng — KHÔNG thay đổi hành vi quan sát được.

[MÃ NGUỒN HIỆN TẠI]
{DÁN_CODE}

[ĐỊNH HƯỚNG REFACTOR]
- Tách component lớn thành component nhỏ có trách nhiệm đơn lẻ.
- Rút logic lặp vào hàm/hook dùng chung (ví dụ tính giá, format VND).
- Đặt tên rõ nghĩa; thêm type TypeScript đầy đủ; loại bỏ code chết.
- Tách logic tính toán khỏi JSX (custom hook / util).

[RÀNG BUỘC]
- Giữ nguyên props public và kết quả render; không đổi API.
- Stack giữ nguyên (React + TS + Tailwind); không thêm thư viện mới nếu không cần.
- Mỗi bước refactor giải thích lý do ngắn gọn.

[OUTPUT MONG MUỐN]
Code sau refactor (chia theo file/component), kèm danh sách thay đổi chính và lý do. Nếu hành vi có thể bị ảnh hưởng, cảnh báo rõ.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Hành vi/giao diện không đổi so với trước.
- [ ] Giảm trùng lặp, mỗi component < ~150 dòng, type đầy đủ.
- [ ] Dễ test hơn (logic tách khỏi UI), không lỗi TypeScript.
```

**Biến cần thay:** `{HỆ_THỐNG}`, `{MODULE}`, đoạn code, ngưỡng dòng mục tiêu.
**Lưu ý:** Refactor là **đổi cấu trúc, giữ hành vi** — luôn nhấn "không đổi output". Nếu file lớn, yêu cầu AI làm theo từng bước có giải thích để dễ review thay vì thay toàn bộ một lúc.

---

### 4.9. Mẫu 9 — Kiểm tra Responsive

```text
[VAI TRÒ]
Bạn là frontend engineer kiêm QA chuyên responsive & cross-device cho TMĐT.

[BỐI CẢNH DAISAN]
Hệ thống: {HỆ_THỐNG}. Trang: {TÊN_TRANG} (ví dụ: Product Detail gạch trên DaisanStore). Phần lớn khách truy cập bằng mobile.

[MỤC TIÊU]
Rà soát và sửa các vấn đề responsive của trang để hiển thị tốt trên mobile, tablet, desktop.

[MÃ NGUỒN / COMPONENT]
{DÁN_CODE}

[YÊU CẦU KIỂM TRA]
- Breakpoint: 360px (mobile nhỏ), 414px, 768px (tablet), 1024px, 1280px+ (desktop).
- Kiểm tra: tràn ngang (overflow-x), chữ quá nhỏ/quá to, ảnh vỡ tỉ lệ, nút bị che, khoảng cách chạm (>=44px), gallery & bảng thông số trên mobile.
- Header/menu chuyển hamburger trên mobile; sidebar lọc chuyển drawer.
- Bảng thông số kỹ thuật phải cuộn hoặc xếp dọc trên mobile (không tràn).

[RÀNG BUỘC]
- Dùng utility responsive của Tailwind (sm/md/lg/xl); mobile-first.
- Không phá layout desktop hiện có; chỉ điều chỉnh để mọi breakpoint ổn.
- Giữ màu và nhận diện Daisan.

[OUTPUT MONG MUỐN]
1) Danh sách vấn đề responsive phát hiện (theo breakpoint).
2) Code đã sửa (class Tailwind cụ thể).
3) Bảng đối chiếu trước/sau cho từng breakpoint chính.

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Không còn overflow ngang ở mọi breakpoint từ 360px.
- [ ] Vùng chạm >= 44px; chữ thân >= 14px; ảnh giữ tỉ lệ.
- [ ] Menu/sidebar/bảng thích ứng đúng trên mobile.
```

**Biến cần thay:** `{HỆ_THỐNG}`, `{TÊN_TRANG}`, đoạn code, danh sách breakpoint ưu tiên.
**Lưu ý:** Daisan ưu tiên mobile (khách xem gạch tại công trình). Nhấn các điểm gãy đặc thù: **bảng thông số kỹ thuật và gallery** thường vỡ trên mobile. Yêu cầu liệt kê vấn đề theo breakpoint để review khách quan.

---

### 4.10. Mẫu 10 — Tối ưu UI

```text
[VAI TRÒ]
Bạn là senior product designer kiêm frontend engineer, tinh chỉnh UI/UX cho TMĐT chuyển đổi cao.

[BỐI CẢNH DAISAN]
Hệ thống: {HỆ_THỐNG}. Màn hình: {MÀN_HÌNH}. Nhận diện: cam Daisan #EA5B0C, phong cách sạch, chuyên nghiệp, đáng tin với khách VLXD.

[MỤC TIÊU]
Tối ưu UI hiện tại để rõ ràng, đẹp, dễ dùng và tăng chuyển đổi — không đổi chức năng.

[MÃ NGUỒN / MÔ TẢ UI HIỆN TẠI]
{DÁN_CODE_HOẶC_ẢNH_MÔ_TẢ}

[HƯỚNG TỐI ƯU]
- Hệ thống phân cấp thị giác: tiêu đề, khoảng trắng, cỡ chữ, độ tương phản.
- Nhất quán spacing (thang 4/8px), bo góc, đổ bóng, trạng thái hover/active/focus.
- CTA nổi bật bằng cam Daisan; giảm rối; nhóm thông tin hợp lý.
- Trạng thái: loading (skeleton), empty (gợi ý hành động), error (thông báo + thử lại).
- Micro-interaction nhẹ (transition) nhưng không lạm dụng.

[RÀNG BUỘC]
- Giữ nguyên chức năng và bố cục lớn; chỉ tinh chỉnh trình bày.
- Dùng Tailwind; tôn trọng bảng màu & font Daisan; đảm bảo tương phản AA.
- Không thêm thư viện UI nặng.

[OUTPUT MONG MUỐN]
1) Nhận xét UI hiện tại (điểm yếu cụ thể).
2) Code UI sau tối ưu.
3) Giải thích từng thay đổi và lợi ích (dễ đọc/chuyển đổi/nhất quán).

[TIÊU CHÍ HOÀN THÀNH]
- [ ] Phân cấp thị giác rõ; CTA nổi bật đúng màu Daisan.
- [ ] Spacing/màu/trạng thái nhất quán; có loading/empty/error.
- [ ] Tương phản đạt AA; chức năng không đổi.
```

**Biến cần thay:** `{HỆ_THỐNG}`, `{MÀN_HÌNH}`, code/ảnh hiện trạng.
**Lưu ý:** Tối ưu UI khác làm lại UI — nhấn "giữ chức năng". Cung cấp ảnh chụp màn hình nếu có để AI thấy hiện trạng. Yêu cầu giải thích lý do mỗi thay đổi để học hỏi và review.

---

## 5. Mẹo viết prompt hiệu quả

| Mẹo | Giải thích & ví dụ |
|-----|--------------------|
| **Một prompt, một mục tiêu** | Đừng nhồi "tạo landing + dashboard + admin" trong một prompt. Chia nhỏ, làm tuần tự, dễ kiểm soát. |
| **Cho ví dụ cụ thể** | Thay vì "card sản phẩm đẹp", đưa mẫu: "card gồm ảnh 4:3, mã in đậm, kích thước xám nhỏ, giá cam". |
| **Định nghĩa data shape** | Khai báo trước cấu trúc dữ liệu: `{ id, sku, name, size, surface, priceRetail, priceWholesale, unit, m2PerBox }`. AI sinh code khớp ngay. |
| **Khóa stack & ràng buộc** | Luôn ghi "React + TS + Tailwind, không UI lib ngoài" để tránh AI dùng MUI/Bootstrap ngoài ý muốn. |
| **Yêu cầu trạng thái đầy đủ** | Nhắc loading / empty / error — phần hay bị quên nhưng rất quan trọng cho UX thật. |
| **Dùng tiêu chí hoàn thành dạng checklist** | Cho AI tự kiểm và cho bạn nghiệm thu khách quan. |
| **Tham chiếu hằng số Daisan** | Nhắc màu #EA5B0C, đơn vị m²/thùng, vai trò B2C/B2B — tránh AI tự bịa. |
| **Yêu cầu mock API tách lớp** | "Tách `productApi.ts`, mock trả Promise, sẵn sàng nối Laravel" — code dễ ghép backend. |
| **Lặp có định hướng** | Khi chưa ưng, chỉ rõ "phần X chưa đúng vì Y, sửa thành Z" thay vì "làm lại đi". |
| **Yêu cầu giải thích khi cần học** | Thêm "giải thích ngắn lý do" cho refactor/tối ưu để đội nâng trình. |

### Ví dụ "kém" → "tốt"

```text
KÉM:
"Làm cho tôi trang bán gạch."

TỐT:
"Bạn là FE engineer React+TS+Tailwind. Dự án DaisanTiles (B2C). Tạo Product Listing gạch
với sidebar lọc (kích thước, bề mặt, chất liệu, giá/m²), sắp xếp, phân trang, grid card
(ảnh, mã, kích thước, giá/m²). Màu cam #EA5B0C. Lọc gọi fetchProducts(filters) mock.
Output: ProductListing.tsx + FilterSidebar.tsx + ProductCard.tsx, có loading/empty.
Xong khi: lọc nhiều thuộc tính chạy đúng, responsive 360/768/1280px, URL đồng bộ filter."
```

---

## 6. Lỗi prompt thường gặp (và cách tránh)

| Lỗi | Hậu quả | Cách tránh |
|-----|---------|-----------|
| Mơ hồ ("đẹp", "chuyên nghiệp" không định nghĩa) | AI đoán sai gu, phải làm lại nhiều lần | Mô tả cụ thể: bố cục, màu, ví dụ tham chiếu |
| Thiếu bối cảnh Daisan | Code sai nghiệp vụ (không có giá sỉ B2B, sai đơn vị) | Luôn nêu hệ thống, vai trò người dùng, đặc thù ngành |
| Không khóa stack | AI dùng thư viện ngoài ý muốn (MUI, Bootstrap) | Ghi rõ "React+TS+Tailwind, không UI lib ngoài" |
| Nhồi nhiều mục tiêu | Kết quả nửa vời ở mọi phần | Một prompt một mục tiêu, làm tuần tự |
| Quên đơn vị/định dạng | Giá hiển thị `1250000`, sai m²/thùng | Khai báo định dạng VND, công thức m²→thùng |
| Quên trạng thái UI | Thiếu loading/empty/error, UX kém | Yêu cầu rõ 3 trạng thái |
| Không nêu tiêu chí "xong" | Không biết khi nào nghiệm thu | Luôn kèm checklist tiêu chí hoàn thành |
| Sửa lỗi mà không cho log/bước tái hiện | AI đoán mò, vá sai chỗ | Dán log, bước tái hiện, hành vi đúng/sai |
| Refactor mà không cấm đổi hành vi | Vô tình đổi chức năng | Ghi rõ "giữ nguyên hành vi/props public" |
| Cho code quá ít ngữ cảnh | AI thiếu thông tin để sửa đúng | Dán đủ file/đoạn liên quan, nêu phụ thuộc |

---

## 7. Checklist trước khi gửi prompt

- [ ] Đã nêu **vai trò** AI cần đóng?
- [ ] Đã nêu **hệ thống Daisan** (Daisan.vn/Store/Tiles/Depot/B2B/News/Ads) và **vai trò người dùng** (B2C/B2B/admin)?
- [ ] Đã nêu **đặc thù nghiệp vụ** liên quan (đơn vị m²/thùng, giá lẻ/sỉ, thuộc tính gạch) nếu cần?
- [ ] **Mục tiêu** rõ trong 1 câu, đúng 1 mục tiêu?
- [ ] **Yêu cầu cụ thể** liệt kê đủ phần/chức năng/dữ liệu?
- [ ] **Ràng buộc** đã khóa stack (React+TS+Tailwind / Laravel), màu cam #EA5B0C, thư viện cấm/ưu tiên?
- [ ] Đã yêu cầu **trạng thái** loading/empty/error nếu là UI có dữ liệu?
- [ ] **Output** rõ: file/component nào, có data mẫu, mock API tách lớp?
- [ ] **Tiêu chí hoàn thành** dạng checklist, có nhắc responsive & tiếng Việt & định dạng VND?
- [ ] Với bug fix: đã có **log + bước tái hiện + hành vi đúng/sai + code liên quan**?
- [ ] Với refactor/tối ưu: đã ghi **"giữ nguyên hành vi/chức năng"**?
- [ ] Đã thay hết biến `{...}` bằng giá trị thật?

---

## 8. AI PHẢI LÀM

- **Luôn hỏi/áp dụng bối cảnh Daisan**: xác định hệ thống, vai trò người dùng (B2C/B2B/admin) và đặc thù ngành VLXD trước khi sinh code.
- **Khóa đúng stack**: React + TypeScript + Tailwind cho FE; Laravel + REST API cho BE; Elasticsearch cho search; chỉ dùng thư viện đã được cho phép.
- **Tôn trọng nhận diện thương hiệu**: màu cam Daisan #EA5B0C cho CTA/điểm nhấn, đảm bảo tương phản AA, giao diện tiếng Việt, tiền tệ VND định dạng `1.250.000 ₫`.
- **Xử lý đúng nghiệp vụ gạch**: đơn vị m²/viên/thùng, quy đổi m²↔thùng, hao hụt cắt gạch, phân biệt giá lẻ B2C và giá sỉ B2B.
- **Tách lớp dữ liệu/API**: dùng mock trả Promise, tách `*Api.ts`, sẵn sàng nối backend Laravel/Elasticsearch thật.
- **Cung cấp trạng thái UI đầy đủ**: loading (skeleton), empty (gợi ý hành động), error (thông báo + thử lại).
- **Đảm bảo responsive mobile-first** và accessibility cơ bản (alt ảnh, aria-label, vùng chạm >=44px).
- **Sinh code chạy được ngay**, không lỗi TypeScript, kèm data mẫu, chia component hợp lý có type đầy đủ.
- **Tự đối chiếu tiêu chí hoàn thành** trong prompt trước khi coi là xong; nêu rõ phần còn giả định để người dùng kiểm.
- **Với bug fix**: tìm nguyên nhân gốc, vá tối thiểu, gợi ý cách kiểm thử lại.

## 9. AI KHÔNG ĐƯỢC LÀM

- **Không tự đổi stack** sang Vue/Angular/Next nếu không được yêu cầu; không thêm UI lib nặng (MUI, Bootstrap, Ant) khi đã yêu cầu Tailwind thuần.
- **Không bịa nghiệp vụ**: không tự đặt đơn vị, công thức quy đổi m²/thùng, hay mức giá nếu không được cung cấp — phải hỏi hoặc đánh dấu giả định rõ ràng.
- **Không bỏ qua phân biệt B2C/B2B** khi ngữ cảnh có giá sỉ/lẻ.
- **Không dùng màu/nhận diện sai** (ví dụ CTA xanh dương khi chuẩn là cam Daisan), không để chữ tương phản kém.
- **Không hiển thị số thô** (`1250000`) hay tiếng Anh trên UI người dùng cuối khi yêu cầu là tiếng Việt + VND.
- **Không refactor/đổi hành vi ngoài phạm vi** khi nhiệm vụ là sửa lỗi hoặc tối ưu UI giữ chức năng.
- **Không trả code thiếu trạng thái** loading/empty/error cho màn hình có dữ liệu động.
- **Không gộp nhiều mục tiêu lớn** vào một lần sinh khiến kết quả nửa vời; hãy chia nhỏ.
- **Không hard-code dữ liệu trộn lẫn vào UI** khiến khó nối API; phải tách data/mock.
- **Không bỏ qua mobile**: không trả layout chỉ chạy desktop, không để bảng thông số/gallery tràn trên mobile.

---

## 10. Quy trình áp dụng nhanh (tóm tắt 1 phút)

1. Chọn mẫu phù hợp ở Mục 4 (landing/marketplace/dashboard/listing/detail/admin/bugfix/refactor/responsive/UI).
2. Điền 7 khối công thức (Mục 2), thay hết biến `{...}`, tham chiếu hằng số Daisan (Mục 3).
3. Soát theo Checklist (Mục 7).
4. Gửi prompt → nhận kết quả → đối chiếu **Tiêu chí hoàn thành**.
5. Nếu chưa đạt: phản hồi có định hướng ("phần X sai vì Y, sửa thành Z"), lặp lại.

> Ghi nhớ: prompt là hợp đồng giữa người và AI. Hợp đồng càng rõ — bối cảnh Daisan, ràng buộc kỹ thuật, tiêu chí nghiệm thu — kết quả càng đúng ngay từ lần đầu, tiết kiệm thời gian cho đội IT Daisan.
