# NHÓM 6 — Prompt kiểm tra & nâng cấp chất lượng

Bộ 13 prompt thực chiến (63–75) giúp đội Daisan dùng Claude / Daisan.ai để soát lỗi, review và nâng cấp chất lượng UI/UX, code, hiệu năng, bảo mật, nội dung và tỷ lệ chuyển đổi cho toàn hệ sinh thái VLXD — gạch ốp lát Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B, Ads, News).

> Các prompt dưới đây tham chiếu knowledge base nội bộ khi phù hợp: `knowledge-base/{DAISAN_BRAND_CONTEXT, DAISAN_BUSINESS_CONTEXT, UI_UX_STANDARD, CODE_STANDARD, ERROR_PLAYBOOK, COMPONENT_LIBRARY_GUIDE}.md`. Khi dùng, hãy dán kèm hoặc trỏ tới các file này để Claude/Daisan.ai bám đúng chuẩn Daisan.

---

### 63. Review UI/UX màn hình theo chuẩn Daisan

- **Khi nào dùng:** Sau khi dựng xong một màn hình/feature (trang sản phẩm gạch, giỏ hàng, dashboard quản trị) và muốn audit trải nghiệm trước khi đẩy lên staging.
- **Prompt đầy đủ để copy:**

```
Bạn là Senior Product Designer kiêm UX Reviewer của Daisan — hệ sinh thái thương mại vật liệu xây dựng và gạch ốp lát (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B.daisan.vn). Hãy review UI/UX của màn hình tôi cung cấp (mã React + Tailwind và/hoặc ảnh chụp).

BỐI CẢNH BRAND & CHUẨN:
- Màu thương hiệu: CAM Daisan (đỏ cam) là màu nhấn chính cho CTA/giá/khuyến mãi; xám trung tính + xanh làm nền/secondary. Tham chiếu DAISAN_BRAND_CONTEXT.md và UI_UX_STANDARD.md nếu được cung cấp.
- Người dùng: thợ thi công, chủ thầu, đại lý VLXD, hộ gia đình mua gạch — nhiều người dùng mobile, mạng yếu, quen lướt nhanh và so giá.
- Thông tin gạch quan trọng phải hiển thị rõ: kích thước (vd 60x60, 80x80), bề mặt (bóng/mờ/nhám), xuất xứ, đơn vị bán (m²/viên/thùng), số viên/thùng, m²/thùng, giá theo m² và theo thùng, tồn kho/đặt hàng.

HÃY ĐÁNH GIÁ THEO 8 TRỤC, mỗi trục chấm điểm 1–5 và nêu vấn đề cụ thể kèm dòng code/khu vực:
1. Hệ thống phân cấp thị giác (giá, CTA, tên sản phẩm có nổi bật đúng mức không).
2. Bố cục & khoảng cách (spacing nhất quán theo thang Tailwind, không lệch lưới).
3. Tính nhất quán brand (màu cam dùng đúng chỗ, không lạm dụng; typography đồng nhất).
4. Khả năng quét nhanh thông tin gạch (thông số kỹ thuật, đơn vị bán có dễ đọc).
5. Luồng hành động chính (thêm vào giỏ / báo giá / liên hệ đại lý có rõ ràng, ít bước).
6. Trạng thái (loading, empty, hết hàng, lỗi) có được xử lý không.
7. Trust signals (đánh giá, cam kết đổi trả, hotline, mã sản phẩm, ảnh thật).
8. Mobile-first (ngón tay chạm, sticky CTA, ảnh không vỡ lưới).

YÊU CẦU OUTPUT:
- Bảng tổng hợp điểm 8 trục + điểm trung bình.
- Danh sách vấn đề ưu tiên P0/P1/P2 (P0 = chặn chuyển đổi/đọc sai thông số).
- Với mỗi vấn đề: mô tả + lý do tác động tới người mua VLXD + đề xuất sửa cụ thể (kèm class Tailwind hoặc cấu trúc component gợi ý).
- KHÔNG viết lại toàn bộ; chỉ trả về snippet cho các điểm sửa quan trọng.

TIÊU CHÍ HOÀN THÀNH: mọi P0/P1 đều có cách sửa rõ ràng, gắn đúng brand Daisan và ngành gạch, không đề xuất chung chung.
```

- **Đầu ra mong muốn:** Bảng điểm 8 trục, danh sách vấn đề P0/P1/P2 có lý do và cách sửa cụ thể bằng Tailwind, kèm snippet cho các điểm quan trọng.
- **Lưu ý khi dùng:** Dán kèm `UI_UX_STANDARD.md` và ảnh chụp màn hình để review chính xác hơn. Thay phần "màn hình" bằng đúng loại trang (PDP gạch, listing, dashboard). Cạm bẫy: nếu chỉ đưa code mà không đưa data thật, AI dễ bỏ qua lỗi thông tin gạch (đơn vị bán, m²/thùng).

---

### 64. Review code React + Tailwind theo CODE_STANDARD

- **Khi nào dùng:** Khi cần soát chất lượng một component/module trước khi merge, hoặc khi nhận code do Daisan.ai sinh ra và muốn kiểm tra trước khi đưa vào repo.
- **Prompt đầy đủ để copy:**

```
Bạn là Senior Frontend Reviewer của Daisan. Hãy review code React + Tailwind tôi gửi theo chuẩn nội bộ CODE_STANDARD.md (nếu được cung cấp) và best practice React hiện đại (hooks, function component, TypeScript khi có).

BỐI CẢNH: code phục vụ hệ sinh thái VLXD Daisan (catalog gạch, giỏ hàng, báo giá B2B, dashboard quản trị). Data thường gồm: sản phẩm gạch (sku, name, size, surface, pricePerM2, pricePerBox, boxCoverage, stock), đơn hàng, đại lý.

HÃY KIỂM TRA VÀ BÁO LỖI THEO NHÓM:
1. Đúng đắn (correctness): bug logic, sai điều kiện, sai tính toán giá/diện tích (vd quy đổi m² ↔ thùng), xử lý null/undefined, race condition trong useEffect.
2. React patterns: dependency array thiếu/thừa, key sai trong list, state thừa, prop drilling, component quá lớn, side effect đặt sai chỗ, re-render không cần thiết.
3. Tailwind/UI: class trùng/xung đột, magic number, không dùng token màu brand (cam Daisan), thiếu trạng thái hover/focus/disabled, không responsive.
4. Khả năng tái sử dụng & sạch: đặt tên rõ nghĩa, tách logic ra hook/util, tránh lặp code, tránh inline phức tạp.
5. An toàn dữ liệu: ép kiểu số tiền/diện tích, format tiền tệ VND, tránh dùng dangerouslySetInnerHTML không kiểm soát.
6. Hiệu năng cơ bản: memo/useMemo/useCallback đúng chỗ, tránh tạo hàm/đối tượng mới mỗi render trong list dài (danh mục gạch hàng nghìn item).

YÊU CẦU OUTPUT:
- Liệt kê lỗi theo mức độ: 🔴 Blocker, 🟠 Major, 🟡 Minor, 🔵 Nit.
- Mỗi lỗi: trích đoạn code gốc → giải thích ngắn → bản sửa đề xuất (diff hoặc snippet).
- Cuối cùng: 3–5 đề xuất nâng cấp kiến trúc nếu component cần tách/refactor (chỉ liệt kê, không tự ý viết lại hết).

TIÊU CHÍ HOÀN THÀNH: không bỏ sót Blocker/Major; mọi đề xuất đều có code minh hoạ và bám ngữ cảnh dữ liệu gạch/VLXD của Daisan.
```

- **Đầu ra mong muốn:** Danh sách lỗi phân theo mức độ với code gốc, giải thích và bản sửa; kèm gợi ý refactor kiến trúc.
- **Lưu ý khi dùng:** Gửi kèm file `CODE_STANDARD.md` để AI bám quy ước đặt tên/cấu trúc của Daisan. Cạm bẫy: với file lớn nên chia nhỏ review từng component để AI không bỏ sót Blocker.

---

### 65. Review responsive & mobile-first

- **Khi nào dùng:** Khi màn hình hiển thị tốt trên desktop nhưng cần đảm bảo trải nghiệm mobile (đa số người mua gạch Daisan dùng điện thoại).
- **Prompt đầy đủ để copy:**

```
Bạn là chuyên gia Responsive/Mobile Web của Daisan. Hãy audit khả năng đáp ứng đa thiết bị của màn hình React + Tailwind tôi cung cấp, ưu tiên triết lý mobile-first vì phần lớn khách mua gạch/VLXD của Daisan duyệt web trên điện thoại, mạng có thể yếu.

BREAKPOINT CHUẨN (Tailwind): base (<640 mobile), sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Coi mobile là mặc định.

HÃY KIỂM TRA:
1. Lưới sản phẩm gạch: số cột theo breakpoint (vd 2 cột mobile → 3–4 cột tablet → 4–6 cột desktop), ảnh giữ tỷ lệ vuông, không tràn.
2. Bảng thông số kỹ thuật & bảng giá theo m²/thùng: trên mobile có chuyển sang dạng stacked/cards thay vì bảng tràn ngang không.
3. CTA chính (Thêm vào giỏ / Báo giá / Gọi đại lý): có sticky bottom bar trên mobile không, vùng chạm ≥ 44px.
4. Header/menu/filter: bộ lọc gạch (kích thước, bề mặt, giá, xuất xứ) trên mobile chuyển sang drawer/bottom-sheet hợp lý không.
5. Typography & spacing co giãn: font không quá nhỏ (<14px cho body), khoảng cách chạm đủ rộng.
6. Tránh overflow ngang, ảnh/iframe vỡ, text bị cắt; kiểm tra cả landscape.
7. Hiệu năng mobile: ảnh có lazy-load, kích thước phù hợp; tránh layout shift.

YÊU CẦU OUTPUT:
- Liệt kê vấn đề theo từng breakpoint (mobile/tablet/desktop) kèm khu vực code.
- Mỗi vấn đề: mô tả + class Tailwind sửa cụ thể (vd grid-cols-2 md:grid-cols-4, hidden md:table-cell, sticky bottom-0).
- Gợi ý các pattern mobile cho ngành gạch (filter drawer, sticky CTA, bảng → card).
- Checklist QA nhanh để team tự kiểm trên DevTools.

TIÊU CHÍ HOÀN THÀNH: mọi vấn đề tràn/khó chạm/khó đọc trên mobile đều có class sửa; sản phẩm dùng được mượt ở 360px.
```

- **Đầu ra mong muốn:** Danh sách vấn đề theo breakpoint kèm class Tailwind sửa, pattern mobile cho ngành gạch và checklist QA.
- **Lưu ý khi dùng:** Yêu cầu AI kiểm cụ thể ở 360px và 768px — kích thước phổ biến của khách Daisan. Cạm bẫy: bảng thông số kỹ thuật gạch rất dễ tràn ngang trên mobile, nhắc AI ưu tiên xử lý.

---

### 66. Review accessibility (a11y)

- **Khi nào dùng:** Trước khi bàn giao một feature công khai (PDP, form báo giá, checkout) để đảm bảo tiếp cận được và đạt chuẩn cơ bản WCAG.
- **Prompt đầy đủ để copy:**

```
Bạn là chuyên gia Accessibility (a11y) của Daisan. Hãy audit màn hình React + Tailwind tôi cung cấp theo WCAG 2.1 mức A/AA, áp dụng thực tế cho website thương mại VLXD/gạch (nhiều người dùng lớn tuổi là chủ thầu, dùng mobile).

HÃY KIỂM TRA:
1. Semantics & HTML đúng: dùng button/a/nav/main/section/heading đúng vai trò; heading có thứ bậc hợp lý (h1→h2→h3), không dùng div thay button.
2. Bàn phím: mọi thành phần tương tác (filter gạch, dropdown kích thước, nút thêm giỏ, modal báo giá) đều focus được, có focus ring rõ, thứ tự tab hợp lý, đóng modal bằng Esc.
3. ARIA: dùng aria-label/aria-expanded/aria-controls/role đúng chỗ cho menu, accordion thông số, tabs; không lạm dụng ARIA.
4. Ảnh & icon: alt mô tả đúng (vd "Gạch granite 80x80 bề mặt mờ màu xám"), icon-only button có nhãn ẩn.
5. Tương phản màu: kiểm tra cặp màu (cam Daisan trên nền trắng, chữ xám trên nền sáng) đạt tỷ lệ ≥ 4.5:1 cho text, ≥ 3:1 cho UI lớn.
6. Form báo giá/đăng ký đại lý: label gắn input, thông báo lỗi đọc được, không chỉ dựa vào màu để báo lỗi.
7. Chuyển động & trạng thái: prefers-reduced-motion; trạng thái loading/disabled thông báo cho screen reader.

YÊU CẦU OUTPUT:
- Danh sách vi phạm theo mức nghiêm trọng (Critical/Serious/Moderate/Minor), kèm tiêu chí WCAG tương ứng.
- Mỗi vi phạm: vị trí code + cách sửa cụ thể (markup, aria, class Tailwind cho focus/contrast).
- Cảnh báo các cặp màu brand có nguy cơ trượt contrast và đề xuất sắc độ thay thế.
- Checklist a11y rút gọn để team tái sử dụng.

TIÊU CHÍ HOÀN THÀNH: mọi lỗi Critical/Serious đều có cách sửa; bàn phím và screen reader dùng được toàn luồng mua hàng.
```

- **Đầu ra mong muốn:** Danh sách vi phạm WCAG theo mức độ với cách sửa markup/ARIA/contrast và checklist a11y tái dùng.
- **Lưu ý khi dùng:** Nhắc AI kiểm cặp màu cam Daisan vì cam tươi dễ trượt contrast với chữ trắng. Cạm bẫy: icon-only button (giỏ hàng, tim) thường thiếu nhãn — yêu cầu rà kỹ.

---

### 67. Review performance frontend

- **Khi nào dùng:** Khi trang load chậm, danh mục gạch hàng nghìn sản phẩm bị giật, hoặc trước khi tối ưu Core Web Vitals.
- **Prompt đầy đủ để copy:**

```
Bạn là chuyên gia Web Performance của Daisan. Hãy phân tích hiệu năng frontend của màn hình/ứng dụng React tôi cung cấp (code và/hoặc số liệu Lighthouse/Network), tối ưu cho Core Web Vitals (LCP, CLS, INP) trong bối cảnh catalog gạch nhiều ảnh và người dùng mạng yếu.

HÃY PHÂN TÍCH:
1. Hình ảnh gạch: kích thước ảnh, định dạng (WebP/AVIF), srcset/sizes, lazy-loading, ảnh hero gây LCP chậm, thiếu width/height gây CLS.
2. Bundle & code-splitting: import nặng, thư viện thừa, route-level lazy import, tree-shaking, vendor chunk lớn.
3. Render React: list dài chưa ảo hoá (virtualization cho danh mục gạch hàng nghìn item), re-render thừa, tính toán nặng trong render, thiếu memo hợp lý.
4. Data fetching: over-fetch, thiếu phân trang/infinite scroll, thiếu cache, waterfall request, gọi API trùng.
5. Fonts & CSS: font chặn render, CSS không dùng, layout shift do font swap.
6. Mạng: nén Gzip/Brotli, cache header, CDN cho ảnh, prefetch/preconnect.

YÊU CẦU OUTPUT:
- Bảng vấn đề → tác động ước lượng (cao/trung/thấp) → công sức sửa (S/M/L) → đề xuất cụ thể.
- Code/snippet cho các quick win (vd <img loading="lazy" width height>, React.lazy + Suspense, react-window cho list gạch, useMemo cho filter).
- Thứ tự ưu tiên 1-2-3 để cải thiện LCP/CLS/INP nhanh nhất.
- KHÔNG đề xuất chung; gắn với cấu trúc dữ liệu gạch và lượng item lớn của Daisan.

TIÊU CHÍ HOÀN THÀNH: có ít nhất 3 quick win kèm code và lộ trình ưu tiên rõ ràng.
```

- **Đầu ra mong muốn:** Bảng vấn đề–tác động–công sức, các quick win có code (lazy image, code-splitting, virtualization) và thứ tự ưu tiên theo Web Vitals.
- **Lưu ý khi dùng:** Đính kèm báo cáo Lighthouse hoặc tab Network giúp AI ước lượng đúng. Cạm bẫy: danh mục gạch dài thường là thủ phạm chính — nhắc AI ưu tiên virtualization và lazy ảnh.

---

### 68. Review security frontend & tích hợp API

- **Khi nào dùng:** Trước khi public form thu thập dữ liệu (báo giá, đăng ký đại lý), trang thanh toán, hoặc khi tích hợp API Laravel/Elasticsearch.
- **Prompt đầy đủ để copy:**

```
Bạn là kỹ sư bảo mật ứng dụng (AppSec) của Daisan. Hãy review rủi ro bảo mật phía frontend React và lớp tích hợp API (Laravel/PHP backend, Elasticsearch search) của đoạn code tôi cung cấp. Bối cảnh: TMĐT VLXD/gạch có form báo giá, đăng nhập đại lý B2B, giỏ hàng, thanh toán.

HÃY RÀ SOÁT:
1. XSS: dangerouslySetInnerHTML, render nội dung từ API/CMS (Drupal/News) chưa sanitize, chèn HTML từ mô tả sản phẩm gạch.
2. Lộ bí mật: API key/token/secret hard-code trong frontend, log nhạy cảm ra console, biến môi trường client lộ thông tin.
3. Xác thực & phiên: lưu token sai chỗ (localStorage vs httpOnly cookie), thiếu kiểm tra quyền ở UI cho đại lý B2B vs khách lẻ, thiếu logout/expiry.
4. Gọi API: thiếu validate/escape tham số search Elasticsearch (injection vào query), truyền tham số nhạy cảm qua URL, thiếu rate-limit phía UX, CSRF cho form Laravel.
5. Input form: validate phía client + nhắc kiểm tra phía server, chống spam form báo giá, chống upload file độc (nếu cho tải bản vẽ/ảnh công trình).
6. Phụ thuộc: thư viện lỗi thời/khuyết CVE, link/script bên thứ ba không tin cậy.
7. Cấu hình: CORS quá rộng, thiếu CSP, mở thông tin lỗi chi tiết ra người dùng.

YÊU CẦU OUTPUT:
- Danh sách rủi ro theo mức (Critical/High/Medium/Low) + loại (OWASP nếu áp dụng).
- Mỗi rủi ro: vị trí + kịch bản khai thác ngắn + cách khắc phục cụ thể (code/snippet, cấu hình).
- Nhắc rõ phần nào BẮT BUỘC validate lại ở backend Laravel, không tin frontend.
- Tham chiếu ERROR_PLAYBOOK.md nếu được cung cấp.

TIÊU CHÍ HOÀN THÀNH: mọi rủi ro Critical/High có cách khắc phục; nêu rõ ranh giới tin cậy frontend/backend.
```

- **Đầu ra mong muốn:** Danh sách rủi ro theo mức độ và loại OWASP, kịch bản khai thác, cách khắc phục có code, và ranh giới validate frontend/backend.
- **Lưu ý khi dùng:** Nhắc AI rằng validate frontend không thay thế backend Laravel. Cạm bẫy: mô tả sản phẩm gạch từ CMS thường chứa HTML — điểm XSS hay bị bỏ qua.

---

### 69. Refactor code an toàn, giữ nguyên hành vi

- **Khi nào dùng:** Khi một component/hook đã chạy đúng nhưng rối, khó đọc, lặp code và cần dọn dẹp trước khi mở rộng tính năng.
- **Prompt đầy đủ để copy:**

```
Bạn là Senior Frontend Engineer của Daisan chuyên refactor. Hãy refactor đoạn code React + Tailwind tôi cung cấp để SẠCH HƠN, DỄ ĐỌC và DỄ BẢO TRÌ, nhưng GIỮ NGUYÊN 100% hành vi và giao diện hiện tại. Bối cảnh: code thuộc hệ thống VLXD/gạch Daisan (catalog, giỏ hàng, báo giá, dashboard).

NGUYÊN TẮC:
- Không đổi output UI, không đổi API/props công khai trừ khi tôi đồng ý.
- Tách logic nghiệp vụ (tính giá m²↔thùng, tổng đơn, định dạng VND) ra custom hook/util thuần, có thể test.
- Loại bỏ lặp code, state thừa, effect không cần thiết; đặt tên biến/hàm rõ nghĩa theo CODE_STANDARD.md (nếu có).
- Chia component lớn thành các phần nhỏ hợp lý KHI cần thiết, không tách vụn quá mức.
- Ưu tiên đọc dễ hơn là "thông minh"; thêm comment ở chỗ logic nghiệp vụ gạch dễ hiểu nhầm.

YÊU CẦU OUTPUT:
1. Bản code đã refactor đầy đủ (chia file rõ ràng nếu tách: component, hook, util).
2. Bảng "trước → sau" tóm tắt từng thay đổi và lý do.
3. Danh sách rủi ro hồi quy cần test lại (vd: quy đổi diện tích, định dạng tiền, trạng thái hết hàng).
4. Gợi ý 2–3 test case quan trọng để đảm bảo không vỡ hành vi.

RÀNG BUỘC: React function component + hooks, Tailwind cho style, không thêm thư viện mới trừ khi thật cần (giải thích lý do).

TIÊU CHÍ HOÀN THÀNH: code mới tương đương hành vi, dễ đọc hơn rõ rệt, logic nghiệp vụ tách khỏi UI và có hướng test.
```

- **Đầu ra mong muốn:** Code đã refactor (tách file hợp lý), bảng trước→sau kèm lý do, danh sách rủi ro hồi quy và test case gợi ý.
- **Lưu ý khi dùng:** Nhấn mạnh "giữ nguyên hành vi" để AI không lén thêm tính năng. Cạm bẫy: logic quy đổi m²↔thùng dễ bị đổi ngầm khi tách hook — yêu cầu liệt kê rủi ro hồi quy.

---

### 70. Tách component & xây cây component tái sử dụng

- **Khi nào dùng:** Khi một file React quá lớn (vd toàn bộ trang sản phẩm gạch trong 1 component) và cần chia thành các component nhỏ tái sử dụng được.
- **Prompt đầy đủ để copy:**

```
Bạn là kiến trúc sư frontend của Daisan. Hãy phân rã ("tách component") đoạn code React lớn tôi cung cấp thành một cây component sạch, tái sử dụng được, phù hợp hệ sinh thái VLXD/gạch Daisan và tham chiếu COMPONENT_LIBRARY_GUIDE.md (nếu được cung cấp).

YÊU CẦU PHÂN RÃ:
1. Đề xuất cây component (sơ đồ phân cấp) với tên rõ nghĩa theo domain gạch, vd: ProductGallery, TileSpecTable, PricePerUnitBox, AddToQuoteBar, StockBadge, FilterDrawer, ProductCard, BreadcrumbBar.
2. Xác định component nào nên đưa vào thư viện dùng chung (shared/ui) vì tái sử dụng đa trang (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot), component nào là cục bộ.
3. Định nghĩa props rõ ràng (kiểu dữ liệu, mặc định, bắt buộc/optional) cho mỗi component tách ra; nêu trạng thái nội bộ vs nâng lên cha.
4. Tách phần logic dữ liệu (fetch, tính giá, định dạng) ra hook riêng, tách phần presentational thuần để dễ tái dùng.
5. Đảm bảo nhất quán brand: dùng token màu cam Daisan, spacing/typography theo UI_UX_STANDARD.md.

YÊU CẦU OUTPUT:
- Sơ đồ cây component (dạng cây text).
- Code từng component tách ra (file riêng), kèm interface props.
- Ghi chú component nào shared vs local và lý do.
- Ví dụ cách lắp ráp lại thành màn hình gốc (component cha).
- Danh sách component có thể tái dùng ngay cho các trang khác trong hệ sinh thái.

RÀNG BUỘC: React + hooks + Tailwind, ưu tiên presentational/container tách bạch, không over-engineer.

TIÊU CHÍ HOÀN THÀNH: file gốc được chia thành các component rõ vai trò, có props chuẩn, ít nhất một số component sẵn sàng đưa vào shared/ui.
```

- **Đầu ra mong muốn:** Sơ đồ cây component, code từng component với props chuẩn, phân loại shared/local và ví dụ lắp ráp lại.
- **Lưu ý khi dùng:** Cung cấp `COMPONENT_LIBRARY_GUIDE.md` để AI đặt tên/đường dẫn đúng quy ước. Cạm bẫy: tránh tách quá vụn — yêu cầu AI cân nhắc tái sử dụng thực tế trước khi tách.

---

### 71. Chuẩn hóa cấu trúc thư mục dự án

- **Khi nào dùng:** Khi repo phình to lộn xộn, hoặc khi khởi tạo chuẩn folder cho một sản phẩm mới trong hệ sinh thái (DaisanTiles, DaisanDepot...).
- **Prompt đầy đủ để copy:**

```
Bạn là kiến trúc sư frontend của Daisan. Hãy đề xuất và áp dụng một cấu trúc thư mục (folder structure) chuẩn, nhất quán và dễ mở rộng cho dự án React + Vite/Next.js của Daisan trong ngành VLXD/gạch. Tôi sẽ cung cấp cây thư mục hiện tại (hoặc danh sách file).

YÊU CẦU:
1. Đề xuất cấu trúc theo feature/domain (vd: features/catalog, features/cart, features/quote, features/admin) kết hợp shared (components/ui, hooks, lib, utils, types, api, constants, assets).
2. Quy ước đặt tên file/thư mục nhất quán (PascalCase cho component, camelCase cho hook/util, kebab-case cho route nếu Next.js) — bám CODE_STANDARD.md nếu được cung cấp.
3. Tách rõ: UI tái sử dụng (shared/ui) vs component theo feature; logic gọi API (api/) vs hook nghiệp vụ (hooks/); hằng số domain gạch (đơn vị bán, loại bề mặt, kích thước chuẩn) vào constants.
4. Vị trí cho: types/interfaces (sản phẩm gạch, đơn hàng, đại lý), config môi trường, i18n nếu có, test, styles/tailwind config.
5. Bản đồ di chuyển: file hiện tại nằm ở đâu → nên chuyển tới đâu (bảng mapping), nêu các import cần cập nhật.
6. Khả năng dùng chung giữa các sản phẩm Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot) — gợi ý phần nào nên tách thành package/shared.

YÊU CẦU OUTPUT:
- Cây thư mục đề xuất (dạng text) kèm chú thích vai trò mỗi thư mục.
- Bảng mapping "file hiện tại → vị trí mới".
- Quy ước đặt tên & ví dụ.
- Các bước di chuyển an toàn (theo thứ tự, tránh vỡ import).

TIÊU CHÍ HOÀN THÀNH: cấu trúc rõ ràng theo feature + shared, có bản đồ di chuyển cụ thể, áp dụng được cho cả các sản phẩm khác trong hệ sinh thái.
```

- **Đầu ra mong muốn:** Cây thư mục chuẩn có chú thích, bảng mapping file cũ→mới, quy ước đặt tên và các bước di chuyển an toàn.
- **Lưu ý khi dùng:** Dán cây thư mục hiện tại (`tree` hoặc danh sách file) để có bản mapping thực tế. Cạm bẫy: di chuyển file dễ vỡ import — yêu cầu AI nêu thứ tự an toàn và các import cần sửa.

---

### 72. Tối ưu nội dung tiếng Việt (microcopy, mô tả gạch)

- **Khi nào dùng:** Khi nội dung UI/microcopy hoặc mô tả sản phẩm gạch còn cứng, lủng củng, sai chính tả, hoặc chưa chuẩn SEO/giọng brand Daisan.
- **Prompt đầy đủ để copy:**

```
Bạn là biên tập viên nội dung & UX Writer tiếng Việt của Daisan — thương hiệu VLXD/gạch ốp lát. Hãy tối ưu nội dung tiếng Việt tôi cung cấp (microcopy UI, nút, thông báo, mô tả sản phẩm gạch, tiêu đề danh mục) để rõ ràng, tự nhiên, đúng chính tả và đúng giọng brand.

GIỌNG BRAND DAISAN: chuyên nghiệp, đáng tin, gần gũi với chủ thầu/đại lý/người mua nhà; ngắn gọn, đi thẳng lợi ích; không sáo rỗng, không nói quá. Tham chiếu DAISAN_BRAND_CONTEXT.md nếu được cung cấp.

YÊU CẦU:
1. Sửa chính tả, ngữ pháp, dấu câu, thuật ngữ ngành gạch (gạch granite/ceramic/porcelain, bề mặt bóng kính/mờ/nhám/sần, kích thước 60x60/80x80, ốp/lát, ron, keo dán gạch...).
2. Viết lại microcopy nút & thông báo cho rõ hành động (vd "Thêm vào giỏ", "Nhận báo giá đại lý", "Liên hệ kho gần bạn"), tránh từ mơ hồ.
3. Mô tả sản phẩm gạch: cấu trúc dễ quét (mở đầu lợi ích → thông số → ứng dụng không gian → gợi ý phối) và chèn từ khóa SEO tự nhiên (tên + kích thước + công năng), không nhồi nhét.
4. Thông báo trạng thái (hết hàng, đặt trước, giao lắp, lỗi form) viết rõ ràng, có hướng xử lý tiếp theo.
5. Chuẩn hóa đơn vị & cách viết: m², viên/thùng, đồng/m², viết hoa tên dòng sản phẩm nhất quán.

YÊU CẦU OUTPUT:
- Bảng "bản gốc → bản tối ưu" kèm lý do ngắn cho mỗi mục.
- Nếu là mô tả sản phẩm: cung cấp bản chuẩn SEO + meta title/description gợi ý.
- Danh sách microcopy thống nhất để team tái sử dụng (glossary nút & trạng thái).

RÀNG BUỘC: chỉ tiếng Việt, không sáo ngữ, không copy giọng thương hiệu bên thứ ba; giữ thông tin kỹ thuật chính xác (không bịa thông số gạch).

TIÊU CHÍ HOÀN THÀNH: nội dung tự nhiên, đúng thuật ngữ gạch, đúng giọng Daisan, sẵn sàng đưa lên UI.
```

- **Đầu ra mong muốn:** Bảng gốc→tối ưu có lý do, bản mô tả chuẩn SEO + meta gợi ý, và glossary microcopy thống nhất.
- **Lưu ý khi dùng:** Cảnh báo AI KHÔNG bịa thông số kỹ thuật gạch — chỉ tối ưu câu chữ, giữ nguyên số liệu. Cạm bẫy: AI dễ nhồi từ khóa; nhắc giữ SEO tự nhiên.

---

### 73. Tối ưu CTA & nút hành động

- **Khi nào dùng:** Khi tỷ lệ click vào nút chính (thêm giỏ, báo giá, liên hệ) thấp, hoặc CTA bị chìm/mơ hồ trên trang gạch.
- **Prompt đầy đủ để copy:**

```
Bạn là chuyên gia CRO (Conversion Rate Optimization) kiêm UX Writer của Daisan. Hãy tối ưu các CTA (call-to-action) và nút hành động trên màn hình React + Tailwind tôi cung cấp, cho website VLXD/gạch Daisan, nhằm tăng tỷ lệ click và chuyển đổi.

PHÂN TÍCH & TỐI ƯU THEO:
1. Phân cấp CTA: xác định 1 CTA chính rõ ràng mỗi màn (vd "Thêm vào giỏ" hoặc "Nhận báo giá"), CTA phụ làm nhạt hơn; tránh nhiều nút cùng độ nổi gây phân tán.
2. Nội dung nút: động từ + lợi ích, cụ thể theo ngữ cảnh gạch (vd "Nhận báo giá theo m²", "Đặt mẫu gạch tận nơi", "Gọi kho gần bạn"); tránh "Submit", "Gửi", "OK".
3. Thị giác: dùng màu CAM Daisan cho CTA chính (đủ tương phản), kích thước/đệm đủ lớn, vùng chạm ≥ 44px, trạng thái hover/active/disabled/loading rõ.
4. Vị trí & ngữ cảnh: CTA gần thông tin ra quyết định (giá m²/thùng, tồn kho); sticky CTA bar trên mobile; lặp CTA hợp lý ở trang dài.
5. Giảm ma sát & tăng tin tưởng: phụ đề/microcopy cạnh nút (vd "Miễn phí tư vấn", "Giao lắp tận công trình", "Báo giá trong 15 phút"), giảm số bước.
6. Đo lường: đề xuất sự kiện tracking (data-attribute/event name) cho từng CTA để A/B test.

YÊU CẦU OUTPUT:
- Bảng "CTA hiện tại → đề xuất" (label + style + vị trí + lý do CRO).
- Snippet React + Tailwind cho CTA chính (gồm trạng thái loading/disabled) đúng màu brand.
- 2–3 biến thể label để A/B test + giả thuyết vì sao biến thể đó tốt hơn.
- Gợi ý sự kiện tracking đặt tên rõ ràng.

TIÊU CHÍ HOÀN THÀNH: mỗi màn có 1 CTA chính nổi bật, label cụ thể theo ngành gạch, kèm biến thể test và tracking.
```

- **Đầu ra mong muốn:** Bảng CTA hiện tại→đề xuất, snippet nút chính theo brand với đủ trạng thái, biến thể A/B test và sự kiện tracking.
- **Lưu ý khi dùng:** Nhắc AI chỉ giữ MỘT CTA chính mỗi màn. Cạm bẫy: cam Daisan dùng cho cả CTA và giá có thể gây "loãng" — yêu cầu kiểm tra phân cấp màu.

---

### 74. Tối ưu chuyển đổi marketplace (conversion)

- **Khi nào dùng:** Khi cần nâng tỷ lệ chuyển đổi toàn luồng marketplace Daisan (listing gạch → trang sản phẩm → giỏ/báo giá → checkout) chứ không chỉ một nút.
- **Prompt đầy đủ để copy:**

```
Bạn là chuyên gia CRO cho marketplace TMĐT của Daisan (VLXD/gạch ốp lát, mô hình B2C + B2B). Hãy audit và tối ưu tỷ lệ chuyển đổi cho luồng mua tôi cung cấp (có thể gồm trang danh mục/listing, kết quả search, trang sản phẩm gạch, giỏ hàng, báo giá B2B, checkout). Tham chiếu DAISAN_BUSINESS_CONTEXT.md nếu được cung cấp.

HÃY PHÂN TÍCH THEO TỪNG BƯỚC PHỄU:
1. Listing/Search (Daisan.vn + Elasticsearch): chất lượng card gạch (ảnh, giá m², kích thước, badge tồn kho/khuyến mãi), bộ lọc hữu ích (kích thước, bề mặt, xuất xứ, khoảng giá, công năng ốp/lát), sắp xếp, gợi ý liên quan, tốc độ tìm.
2. Trang sản phẩm (PDP): ảnh thật nhiều góc + ảnh ốp thực tế, thông số đầy đủ, giá theo m²/thùng rõ ràng kèm bộ tính diện tích → số thùng cần mua, tồn kho/đặt hàng, trust (đánh giá, cam kết, hotline), cross-sell (keo, ron, phụ kiện).
3. Giỏ hàng & báo giá: tóm tắt rõ (m², số thùng, thành tiền, phí giao/lắp), dễ chỉnh số lượng, CTA tiếp tục rõ; với B2B có luồng "Yêu cầu báo giá" riêng.
4. Checkout: ít bước, cho khách (guest) đặt, nhập địa chỉ công trình dễ, phương thức thanh toán/COD/chuyển khoản rõ, trấn an (bảo mật, đổi trả).
5. Niềm tin & giảm bỏ giỏ: hiển thị chi phí sớm, chính sách giao lắp/đổi trả, đánh giá thật, hỗ trợ trực tuyến, remarketing nhẹ.

YÊU CẦU OUTPUT:
- Bản đồ phễu với điểm rò rỉ (friction) ở mỗi bước, mức tác động (cao/trung/thấp).
- Danh sách đề xuất ưu tiên (quick win vs cải tiến lớn), mỗi đề xuất gắn bước phễu + lý do hành vi mua VLXD.
- Gợi ý tính năng đặc thù ngành gạch: bộ tính m²→số thùng, lọc theo công năng, đặt mẫu, báo giá B2B theo khối lượng.
- Bộ chỉ số & sự kiện cần đo cho mỗi bước (view, add-to-cart/quote, begin-checkout, purchase) để theo dõi.

RÀNG BUỘC: đề xuất khả thi với React + Tailwind frontend và backend Laravel/Elasticsearch; ưu tiên thay đổi tác động cao, công sức thấp trước.

TIÊU CHÍ HOÀN THÀNH: chỉ rõ điểm rò rỉ từng bước phễu + danh sách hành động ưu tiên có lý do và chỉ số đo, gắn đặc thù marketplace gạch của Daisan.
```

- **Đầu ra mong muốn:** Bản đồ phễu với điểm rò rỉ, danh sách đề xuất ưu tiên theo tác động/công sức, tính năng đặc thù ngành gạch và bộ chỉ số đo từng bước.
- **Lưu ý khi dùng:** Cung cấp số liệu phễu thật (nếu có) để AI ưu tiên đúng. Cạm bẫy: với B2B, luồng "báo giá" khác "mua ngay" — nhắc AI tách rõ hai luồng.

---

### 75. Tạo checklist bàn giao (handover) feature/dự án

- **Khi nào dùng:** Trước khi bàn giao một feature hoặc dự án (mới hoặc nâng cấp) cho QA/khách hàng/đội vận hành, để đảm bảo không sót hạng mục chất lượng.
- **Prompt đầy đủ để copy:**

```
Bạn là Tech Lead của Daisan. Hãy tạo một CHECKLIST BÀN GIAO (handover) đầy đủ, có thể tick từng mục, cho feature/dự án tôi mô tả, thuộc hệ sinh thái VLXD/gạch Daisan (React + Tailwind frontend; backend có thể Laravel/MySQL/Elasticsearch; deploy Docker/GitHub). Tôi sẽ cung cấp phạm vi feature.

CHECKLIST PHẢI GỒM CÁC NHÓM (mỗi mục viết dạng tick-box, cụ thể, đo được):
1. Chức năng: các luồng chính (vd thêm giỏ, tính m²→thùng, báo giá B2B, checkout) chạy đúng; edge case (hết hàng, số lượng 0, mạng lỗi) xử lý.
2. UI/UX & brand: đúng màu cam Daisan, đúng UI_UX_STANDARD.md, không lệch lưới, trạng thái loading/empty/error đầy đủ.
3. Responsive: kiểm 360px/768px/1280px, sticky CTA mobile, bảng thông số không tràn.
4. Accessibility: bàn phím, focus ring, alt ảnh gạch, contrast màu đạt, label form.
5. Hiệu năng: ảnh lazy + tối ưu, không layout shift lớn, list dài ảo hoá, Lighthouse đạt ngưỡng đề ra.
6. Bảo mật: không lộ key, validate form, sanitize nội dung CMS, kiểm quyền B2B/khách lẻ.
7. Code & repo: pass lint/format, không console.log thừa, code review xong, đặt tên theo CODE_STANDARD.md, cấu trúc folder chuẩn.
8. Dữ liệu & API: hợp đồng API rõ, xử lý lỗi/null, định dạng tiền VND & đơn vị m²/thùng đúng.
9. SEO & nội dung: meta title/description, heading hợp lý, microcopy tiếng Việt đã tối ưu, ảnh có alt.
10. Tracking & đo lường: sự kiện CTA/phễu gắn đúng, kiểm tra bắn event.
11. Tài liệu & vận hành: README/ghi chú cấu hình, biến môi trường, hướng dẫn deploy (Docker/GitHub), rollback, liên hệ phụ trách.
12. QA & nghiệm thu: kịch bản test chính đã chạy, danh sách bug còn lại + mức độ, tiêu chí chấp nhận (acceptance) đã thỏa.

YÊU CẦU OUTPUT:
- Checklist dạng Markdown tick-box theo 12 nhóm trên, mỗi mục cụ thể với feature của tôi (không chung chung).
- Cột trạng thái gợi ý (Đạt / Chưa / Không áp dụng) cho mỗi mục.
- Phần "Rủi ro & việc còn nợ (known issues)" để ghi nhận khi bàn giao.
- Phần "Thông tin bàn giao": phụ trách, môi trường, link staging/production, ngày.

TIÊU CHÍ HOÀN THÀNH: checklist dùng được ngay để nghiệm thu, bám đặc thù feature và chuẩn Daisan, không sót nhóm chất lượng nào.
```

- **Đầu ra mong muốn:** Checklist Markdown tick-box 12 nhóm cụ thể theo feature, cột trạng thái, mục known issues và thông tin bàn giao.
- **Lưu ý khi dùng:** Mô tả rõ phạm vi feature để checklist cụ thể, không chung chung. Cạm bẫy: đừng bỏ nhóm Tracking và Tài liệu vận hành — đây là hai mục hay bị quên nhất khi bàn giao.
