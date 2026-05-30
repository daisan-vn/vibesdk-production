# NHÓM 3 — Prompt tạo component

Thư viện 16 prompt thực chiến để Claude/Daisan.ai sinh các component React + Tailwind chuẩn cho hệ sinh thái Daisan (gạch ốp lát, VLXD, marketplace, admin), tái sử dụng được ngay và bám brand CAM Daisan.

---

### 25. Header thương mại điện tử Daisan

- **Khi nào dùng:** Khi cần dựng thanh điều hướng trên cùng cho DaisanStore / DaisanTiles / DaisanDepot với logo, search, danh mục, giỏ hàng, tài khoản.
- **Prompt đầy đủ để copy:**
```
Bạn là Senior Frontend Engineer chuyên React + Tailwind cho sàn TMĐT VLXD Daisan.
Hãy tạo component <Header /> dùng cho DaisanStore (B2C/B2B bán vật liệu xây dựng, gạch ốp lát).

BỐI CẢNH BRAND: màu chủ đạo CAM Daisan (đỏ cam, dùng class brand tương đương #EA4B0E hoặc bg-orange-600), phụ là xám trung tính và xanh. Tham chiếu knowledge-base/DAISAN_BRAND_CONTEXT.md và UI_UX_STANDARD.md nếu có.

YÊU CẦU CẤU TRÚC HEADER (2 tầng):
1. Top bar (ẩn trên mobile): hotline, "Tải app", chọn khu vực/kho (Hà Nội / TP.HCM), link chuyển hệ thống Daisan.vn · DaisanTiles · DaisanDepot · B2B.
2. Main bar: logo Daisan bên trái; ô SearchBar lớn ở giữa (placeholder "Tìm gạch, sản phẩm, mã SKU..."); bên phải có icon Tài khoản, "Báo giá/Yêu cầu báo giá", Giỏ hàng (badge số lượng).
3. Mega-menu "Danh mục" sổ xuống: nhóm Gạch ốp lát, Gạch lát nền, Thiết bị vệ sinh, Vữa/Keo/Phụ kiện, Sơn — mỗi nhóm có sub-category.

RÀNG BUỘC KỸ THUẬT:
- React function component + TypeScript, Tailwind utility classes, không dùng CSS-in-JS.
- Props: { categories, cartCount, user, onSearch, region }. Có type/interface rõ ràng.
- Responsive: mobile hiện hamburger + drawer; desktop hiện full mega-menu.
- Sticky top, đổ bóng nhẹ khi scroll. Accessible: aria-label, focus ring, điều hướng bàn phím cho menu.
- Dùng lucide-react cho icon. Không hardcode dữ liệu — nhận qua props, có mock mẫu ở cuối file.

OUTPUT:
- 1 file Header.tsx hoàn chỉnh, kèm interface, kèm ví dụ mock data và cách import.
- Ghi chú ngắn các biến brand color cần map vào tailwind.config.
TIÊU CHÍ HOÀN THÀNH: chạy được ngay, responsive, có badge giỏ hàng, mega-menu hoạt động, đúng tông CAM Daisan.
```
- **Đầu ra mong muốn:** File `Header.tsx` (TypeScript) đầy đủ với top bar, search, mega-menu danh mục gạch/VLXD, giỏ hàng có badge, drawer mobile, mock data và hướng dẫn map màu brand.
- **Lưu ý khi dùng:** Thay `categories`/`region` theo dữ liệu thật; kiểm tra `cartCount` đồng bộ với store giỏ hàng; nếu dùng Next.js đổi `<a>` thành `<Link>`.

---

### 26. SearchBar tìm kiếm sản phẩm gạch/VLXD

- **Khi nào dùng:** Khi cần ô tìm kiếm thông minh có gợi ý (autocomplete) cho catalog gạch, kết nối Elasticsearch.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer của Daisan, dựng <SearchBar /> cho sàn VLXD/gạch ốp lát.

BỐI CẢNH: tìm kiếm trên catalog Daisan (gạch ốp lát, lát nền, TBVS...), backend dùng Elasticsearch trả về gợi ý gồm: sản phẩm (ảnh + tên + SKU + kích thước), danh mục, từ khóa phổ biến. Brand: CAM Daisan.

YÊU CẦU:
- Component React + TypeScript + Tailwind.
- Ô input bo tròn, icon kính lúp, nút "Tìm" nền CAM Daisan ở phải.
- Dropdown gợi ý realtime khi gõ >= 2 ký tự: 3 nhóm — "Sản phẩm" (ảnh thumb, tên, SKU, kích thước, giá từ), "Danh mục", "Tìm nhiều" (chip từ khóa: gạch 60x60, gạch giả gỗ, gạch bóng kiếng...).
- Debounce 300ms; hiển thị skeleton khi loading; trạng thái rỗng "Không tìm thấy".
- Điều hướng bàn phím: ArrowUp/Down chọn item, Enter mở, Esc đóng.
- Props: { onSearch(query), fetchSuggestions(query): Promise<Suggestion[]>, placeholder }.

RÀNG BUỘC:
- Không gọi API trực tiếp trong component — nhận fetchSuggestions qua props để dễ test.
- Accessible (role=combobox, aria-expanded, aria-activedescendant).
- Highlight phần text trùng query trong gợi ý.

OUTPUT: SearchBar.tsx + interface Suggestion + mock fetchSuggestions + ví dụ dùng.
TIÊU CHÍ: debounce hoạt động, dropdown gợi ý 3 nhóm, keyboard nav, skeleton loading, đúng tông brand.
```
- **Đầu ra mong muốn:** `SearchBar.tsx` với autocomplete 3 nhóm (sản phẩm/danh mục/từ khóa), debounce, skeleton, keyboard nav, highlight match, mock fetch.
- **Lưu ý khi dùng:** Nối `fetchSuggestions` vào endpoint Elasticsearch thật; chú ý phân quyền giá (B2B/B2C có thể khác giá hiển thị); kiểm soát rate-limit khi gõ nhanh.

---

### 27. ProductCard gạch (ảnh/badge/SKU/kích thước/giá từ/CTA báo giá)

- **Khi nào dùng:** Khi render lưới sản phẩm gạch trong danh sách, kết quả search, trang danh mục.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <ProductCard /> cho sản phẩm GẠCH ỐP LÁT trên DaisanStore/DaisanTiles.

ĐẶC THÙ NGÀNH GẠCH (bắt buộc thể hiện):
- Ảnh sản phẩm (tỉ lệ 1:1), lazy-load, có placeholder.
- Badge góc: "Mới", "Giảm %", "Bán chạy", "Hết hàng" (màu khác nhau, CAM Daisan cho khuyến mãi).
- Tên sản phẩm 2 dòng (line-clamp-2).
- Mã SKU + Thương hiệu (Viglacera, Eurotile, Prime... nhận qua props).
- KÍCH THƯỚC nổi bật dạng chip: ví dụ 60x60, 80x80, 30x60 (cm) — vì khách gạch chọn theo kích thước.
- Đơn vị bán: theo m2 / theo viên / theo hộp — hiển thị rõ.
- "Giá từ ..." (vì giá theo lượng/đại lý); nếu có giá gốc thì gạch ngang.
- 2 CTA: "Thêm vào giỏ" (nền CAM Daisan) và "Yêu cầu báo giá" (outline) — vì B2B hay xin báo giá theo công trình.
- Icon yêu thích (wishlist) góc trên.

RÀNG BUỘC: React + TypeScript + Tailwind. Props interface Product { id, name, image, sku, brand, sizes[], unit, priceFrom, originalPrice?, badges[], inStock }. Có hover nâng nhẹ (shadow), responsive trong grid. Accessible (alt ảnh, aria cho nút). Không hardcode — mock 2-3 sản phẩm gạch mẫu.

OUTPUT: ProductCard.tsx + interface + mock data gạch thật (tên VN) + ví dụ render trong grid.
TIÊU CHÍ: hiển thị đủ SKU, kích thước, đơn vị bán, giá từ, 2 CTA, badge; gọn gàng trong lưới responsive.
```
- **Đầu ra mong muốn:** `ProductCard.tsx` chuyên cho gạch: chip kích thước, đơn vị bán (m2/viên/hộp), "giá từ", badge, 2 CTA (giỏ + báo giá), wishlist, mock data gạch tiếng Việt.
- **Lưu ý khi dùng:** Đảm bảo `sizes` và `unit` đúng theo dữ liệu kho; CTA "Yêu cầu báo giá" cần mở modal/flow báo giá (ghép với prompt 36); kiểm tra `priceFrom` theo nhóm khách (đại lý vs lẻ).

---

### 28. ShopCard (gian hàng / nhà cung cấp)

- **Khi nào dùng:** Khi hiển thị danh sách cửa hàng/nhà cung cấp trên marketplace Daisan hoặc trang "Nhà bán".
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <ShopCard /> cho marketplace VLXD (gian hàng đại lý/nhà cung cấp gạch, vật liệu).

YÊU CẦU HIỂN THỊ:
- Logo/ảnh đại diện shop, tên shop, huy hiệu "Đối tác Daisan"/"Chính hãng"/"Yêu thích".
- Loại hình: Đại lý / Nhà phân phối / Xưởng sản xuất.
- Địa điểm (tỉnh/thành) + bán kính giao hàng.
- Đánh giá sao + số lượt đánh giá, số sản phẩm, số đơn đã bán.
- Ngành hàng chính (chip): Gạch ốp lát, TBVS, Sơn, Vữa keo...
- 1-2 sản phẩm nổi bật (thumbnail nhỏ) nếu có.
- CTA: "Xem gian hàng" (nền CAM Daisan) + "Chat/Liên hệ".

RÀNG BUỘC: React + TypeScript + Tailwind. Props interface Shop { id, name, logo, type, location, deliveryRadius, rating, reviewCount, productCount, soldCount, categories[], badges[], featuredProducts? }. Responsive card, hover shadow, đường viền nhẹ, tông xám trung tính + điểm nhấn CAM Daisan. Accessible. Mock 2 shop VLXD mẫu.

OUTPUT: ShopCard.tsx + interface + mock + ví dụ trong grid.
TIÊU CHÍ: thể hiện được uy tín (badge, rating, đơn đã bán), loại hình, ngành hàng và CTA rõ ràng.
```
- **Đầu ra mong muốn:** `ShopCard.tsx` với badge uy tín, loại hình đại lý/NPP/xưởng, rating, ngành hàng, sản phẩm nổi bật, CTA xem gian hàng + liên hệ.
- **Lưu ý khi dùng:** Map `badges` theo chính sách xác thực đối tác Daisan; `deliveryRadius` quan trọng với VLXD nặng (gạch) — đừng bỏ; gắn link gian hàng đúng slug.

---

### 29. CategoryGrid (lưới danh mục gạch/VLXD)

- **Khi nào dùng:** Khi cần khối "Danh mục nổi bật" trên trang chủ hoặc trang danh mục cha.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <CategoryGrid /> hiển thị các danh mục VLXD/gạch cho trang chủ DaisanStore.

YÊU CẦU:
- Lưới ô danh mục: icon/ảnh đại diện + tên danh mục + (tùy chọn) số sản phẩm.
- Nhóm tiêu biểu ngành: Gạch ốp tường, Gạch lát nền, Gạch giả gỗ, Gạch bóng kiếng, Gạch granite, Thiết bị vệ sinh, Sen vòi, Keo/Vữa/Ron, Sơn, Phụ kiện thi công.
- Responsive: mobile 2 cột, tablet 3-4, desktop 5-6 cột.
- Hover: phóng nhẹ ảnh + viền/nền chuyển sang nhạt CAM Daisan.
- Tùy chọn hiển thị dạng "card có ảnh nền" hoặc "icon đơn giản" qua prop variant.

RÀNG BUỘC: React + TypeScript + Tailwind. Props interface Category { id, name, image?, icon?, productCount?, href }. Component nhận categories[] + variant ('image'|'icon'). Accessible (link có aria-label, alt ảnh). Không hardcode danh mục — mock list danh mục gạch VN ở cuối.

OUTPUT: CategoryGrid.tsx + interface + mock danh mục VLXD + ví dụ 2 variant.
TIÊU CHÍ: lưới responsive đúng số cột theo breakpoint, 2 variant, tên danh mục đúng ngành gạch, tông brand.
```
- **Đầu ra mong muốn:** `CategoryGrid.tsx` responsive với 2 variant (image/icon), mock danh mục ngành gạch tiếng Việt, hover nhấn CAM Daisan.
- **Lưu ý khi dùng:** Đồng bộ `href` với routing thật; cân nhắc tối ưu ảnh (next/image hoặc loading=lazy); số cột có thể chỉnh qua prop nếu layout khác.

---

### 30. FlashSale section (khuyến mãi giờ vàng)

- **Khi nào dùng:** Khi cần khối flash sale có đếm ngược cho chiến dịch giảm giá gạch/VLXD.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <FlashSale /> section cho trang chủ DaisanStore.

YÊU CẦU:
- Header section: tiêu đề "FLASH SALE - GIỜ VÀNG GIÁ SỐC" + bộ đếm ngược (giờ:phút:giây) tới khi kết thúc đợt + link "Xem tất cả".
- Nền dải gradient tông CAM Daisan (đỏ cam), chữ tương phản.
- Carousel/scroll ngang các ProductCard rút gọn cho gạch sale: ảnh, tên, giá sale, giá gốc gạch ngang, % giảm (badge), thanh tiến độ "Đã bán X% / Sắp cháy hàng".
- Mỗi item hiển thị đơn vị (m2/hộp) đúng ngành gạch.
- Responsive: mobile scroll ngang mượt, desktop hiện 4-5 item.

RÀNG BUỘC: React + TypeScript + Tailwind. Props: { title?, endTime: Date, products: FlashSaleProduct[], onViewAll }. Countdown tự cập nhật mỗi giây (useEffect + cleanup), khi hết giờ hiển thị "Đã kết thúc". Interface FlashSaleProduct gồm soldPercent. Accessible. Mock vài sản phẩm gạch sale.

OUTPUT: FlashSale.tsx + interface + mock + lưu ý hiệu năng countdown.
TIÊU CHÍ: countdown chạy chính xác và cleanup, thanh tiến độ "đã bán", scroll ngang mobile, tông CAM Daisan.
```
- **Đầu ра mong muốn:** `FlashSale.tsx` với countdown realtime, carousel sản phẩm gạch sale, % giảm, thanh "đã bán", gradient CAM Daisan.
- **Lưu ý khi dùng:** `endTime` nên là UTC để tránh lệch múi giờ; nhớ `clearInterval` tránh leak; thanh "đã bán" map từ tồn kho thật, đừng để 100% mà vẫn cho mua.

---

### 31. Voucher section (mã giảm giá / khuyến mãi)

- **Khi nào dùng:** Khi cần khối hiển thị danh sách voucher để khách lưu/sao chép trên DaisanStore.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <VoucherSection /> hiển thị danh sách mã giảm giá cho sàn VLXD.

YÊU CẦU TỪNG VOUCHER (dạng "ticket" có khía răng cưa hai bên):
- Loại giảm: theo % hoặc theo tiền (VD: Giảm 10% tối đa 500K; Giảm 200K).
- Điều kiện: đơn tối thiểu (VD đơn từ 5.000.000đ — hợp với VLXD giá trị cao), áp dụng cho ngành hàng (Gạch ốp lát / TBVS / Toàn sàn).
- Mã code + nút "Sao chép" (copy to clipboard, đổi thành "Đã chép").
- Hạn dùng (HSD) + thanh tiến độ "Đã dùng X%".
- Trạng thái: Có thể lưu / Đã lưu / Hết lượt.

RÀNG BUỘC: React + TypeScript + Tailwind. Tông CAM Daisan cho viền/nút. Props: { vouchers: Voucher[], onSave(id), onCopy(code) }. Interface Voucher { id, type:'percent'|'amount', value, maxDiscount?, minOrder, scope, code, expiry, usedPercent, saved }. Clipboard dùng navigator.clipboard. Accessible. Mock 3 voucher VLXD.

OUTPUT: VoucherSection.tsx + interface + mock + ví dụ.
TIÊU CHÍ: ticket răng cưa, copy code hoạt động, trạng thái lưu, đơn tối thiểu phù hợp ngành VLXD, tông brand.
```
- **Đầu ra mong muốn:** `VoucherSection.tsx` dạng ticket răng cưa, copy code, trạng thái lưu/đã lưu/hết lượt, điều kiện đơn tối thiểu lớn hợp ngành VLXD.
- **Lưu ý khi dùng:** `navigator.clipboard` cần HTTPS; kiểm tra logic `minOrder` khớp giỏ hàng thật; đồng bộ `usedPercent` từ backend để tránh hiển thị mã đã hết.

---

### 32. Sidebar admin (điều hướng quản trị)

- **Khi nào dùng:** Khi dựng menu trái cho trang quản trị Daisan (quản lý sản phẩm, đơn hàng, kho, marketing).
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <AdminSidebar /> cho dashboard quản trị hệ sinh thái Daisan (quản lý sàn VLXD).

YÊU CẦU:
- Logo Daisan trên cùng + nút thu gọn (collapse) còn icon.
- Nhóm menu có heading: Tổng quan (Dashboard); Sản phẩm (Danh sách, Thêm SP, Danh mục, Thuộc tính gạch); Đơn hàng (Tất cả, Chờ xử lý, Báo giá B2B); Kho & Tồn (Tồn kho, Nhập/Xuất); Khách hàng & Đại lý; Marketing (Flash Sale, Voucher, Ads); Báo cáo; Cấu hình.
- Mỗi item: icon (lucide) + nhãn + (tùy chọn) badge số (VD đơn chờ xử lý).
- Item có submenu sổ/xếp (accordion). Active state nền CAM Daisan nhạt + chữ CAM đậm + thanh chỉ thị trái.
- Responsive: mobile thành drawer overlay; desktop cố định, có collapse.

RÀNG BUỘC: React + TypeScript + Tailwind. Props: { menu: MenuGroup[], activePath, collapsed, onToggleCollapse }. Interface MenuGroup/MenuItem rõ ràng (label, icon, path, badge?, children?). Accessible (role navigation, aria-current, keyboard). Tông xám/đậm với điểm nhấn CAM Daisan. Mock menu admin VLXD.

OUTPUT: AdminSidebar.tsx + interfaces + mock menu + ví dụ.
TIÊU CHÍ: active state đúng, collapse/expand, submenu accordion, badge, drawer mobile, tông brand.
```
- **Đầu ra mong muốn:** `AdminSidebar.tsx` với nhóm menu quản trị VLXD đầy đủ, collapse, accordion submenu, badge, active state CAM Daisan, drawer mobile.
- **Lưu ý khi dùng:** Map `activePath` với router (React Router/Next); badge "đơn chờ" nên lấy realtime; cân nhắc lưu trạng thái collapsed vào localStorage.

---

### 33. StatCard (thẻ chỉ số dashboard)

- **Khi nào dùng:** Khi cần thẻ KPI ở đầu dashboard quản trị (doanh thu, đơn hàng, tồn kho, khách mới).
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <StatCard /> cho dashboard quản trị sàn VLXD Daisan.

YÊU CẦU:
- Hiển thị: nhãn (VD "Doanh thu hôm nay"), giá trị lớn (format tiền VN: 1.250.000.000đ hoặc rút gọn 1,25 tỷ), icon trong khối bo tròn nền nhạt.
- Chỉ số thay đổi so với kỳ trước: mũi tên lên/xuống + % + màu (xanh tăng / đỏ giảm), kèm chú thích "so với hôm qua".
- Tùy chọn mini sparkline (đường xu hướng 7 ngày) — nhận data points qua props.
- Variant màu icon theo loại (doanh thu = CAM Daisan, đơn = xanh, tồn kho = vàng, khách = tím).

RÀNG BUỘC: React + TypeScript + Tailwind. Props interface Stat { label, value, format?:'currency'|'number'|'percent', delta?, deltaLabel?, icon, trend?:number[], variant }. Hàm format tiền/số kiểu VN (toLocaleString('vi-VN')). Sparkline có thể là SVG đơn giản (không bắt buộc lib). Accessible. Mock 4 stat (doanh thu, đơn hàng, tồn kho m2 gạch, khách mới).

OUTPUT: StatCard.tsx + interface + helper format + mock 4 thẻ + ví dụ trong grid.
TIÊU CHÍ: format tiền VN đúng, delta màu đúng chiều, sparkline tùy chọn, variant màu, responsive grid.
```
- **Đầu ra mong muốn:** `StatCard.tsx` với format tiền VN, delta tăng/giảm, sparkline SVG tùy chọn, variant màu theo loại KPI, mock 4 thẻ.
- **Lưu ý khi dùng:** Thống nhất rút gọn số (tỷ/triệu) để không vỡ layout; delta cần xác định chiều "tốt/xấu" (tồn kho tăng chưa chắc tốt); sparkline lớn nên tách lib chart riêng.

---

### 34. DataTable (bảng dữ liệu quản trị)

- **Khi nào dùng:** Khi cần bảng liệt kê sản phẩm/đơn hàng/khách có sắp xếp, chọn dòng, phân trang, hành động.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <DataTable /> tái sử dụng cho admin sàn VLXD Daisan (dùng cho danh sách sản phẩm gạch, đơn hàng...).

YÊU CẦU:
- Cấu hình cột qua props columns: { key, header, render?, sortable?, align?, width? }.
- Header có sort (icon mũi tên 3 trạng thái: none/asc/desc).
- Chọn dòng bằng checkbox (header chọn tất cả) + thanh hành động hàng loạt khi có chọn (Xóa, Đổi trạng thái, Xuất Excel).
- Hỗ trợ render tùy biến cell: ảnh+tên SP, badge trạng thái (Còn hàng/Hết/Ẩn), giá VN, cột thao tác (Sửa/Xóa/Xem).
- Trạng thái loading (skeleton rows), rỗng (empty state có CTA), sticky header.
- Phân trang gắn ngoài (nhận page/total qua props), responsive: mobile cho phép scroll ngang hoặc chuyển card.

RÀNG BUỘC: React + TypeScript + Generics <T>. Props: { columns, data: T[], rowKey, loading?, selectable?, onSort, onSelectionChange, actions? }. Accessible (table semantics, aria-sort). Tông xám trung tính, hover dòng, điểm nhấn CAM Daisan cho selected/active. Mock cột + data sản phẩm gạch.

OUTPUT: DataTable.tsx (generic) + interface ColumnDef<T> + mock danh sách gạch + ví dụ dùng đầy đủ (sort, select, actions).
TIÊU CHÍ: generic type-safe, sort 3 trạng thái, chọn hàng loạt, skeleton/empty, sticky header, render cell tùy biến.
```
- **Đầu ра mong muốn:** `DataTable.tsx` generic type-safe với sort, chọn dòng + bulk action, render cell tùy biến (ảnh, badge, giá), skeleton/empty, sticky header, mock danh sách gạch.
- **Lưu ý khi dùng:** Phân trang/sort nên xử lý server-side cho data lớn (truyền callback); cẩn thận `rowKey` duy nhất; bulk action cần confirm trước khi xóa (ghép modal prompt 36).

---

### 35. Form nhập sản phẩm gạch

- **Khi nào dùng:** Khi cần form thêm/sửa sản phẩm gạch trong admin với đầy đủ thuộc tính ngành.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <ProductForm /> để thêm/sửa SẢN PHẨM GẠCH trong admin DaisanStore.

CÁC NHÓM TRƯỜNG (đặc thù ngành gạch — bắt buộc):
1. Thông tin chung: Tên SP, SKU, Thương hiệu (Viglacera, Eurotile, Prime, Đồng Tâm...), Danh mục, Mô tả (textarea/rich).
2. Thuộc tính gạch: Kích thước (chọn nhiều: 30x30, 60x60, 80x80, 30x60, 15x90...), Bề mặt (Bóng kiếng/Mờ/Nhám/Sần), Chất liệu (Ceramic/Granite/Porcelain), Họa tiết (Vân gỗ/Vân đá/Trơn), Màu sắc, Xuất xứ, Độ hút nước, Chống trượt (R9-R11).
3. Bán hàng & giá: Đơn vị bán (m2/viên/hộp), Số viên/hộp, m2/hộp (để quy đổi), Giá lẻ, Giá đại lý/B2B, Giá khuyến mãi.
4. Kho: Tồn kho, Vị trí kho (Hà Nội/HCM), Trạng thái (Hiện/Ẩn/Hết hàng).
5. Hình ảnh: Upload nhiều ảnh + ảnh đại diện (drag sắp xếp).
6. SEO: Slug, Meta title, Meta description.

RÀNG BUỘC: React + TypeScript + Tailwind. Dùng react-hook-form + zod (hoặc validate thủ công nếu không có), hiển thị lỗi từng trường. Layout chia section card, responsive 2 cột desktop / 1 cột mobile. Nút "Lưu", "Lưu & thêm mới", "Hủy". Tông CAM Daisan cho nút chính. Props: { initialValues?, onSubmit, brands, categories }. Mock dữ liệu chọn.

OUTPUT: ProductForm.tsx + schema validate + interface ProductFormValues + mock brands/categories + ví dụ dùng.
TIÊU CHÍ: đủ thuộc tính gạch (kích thước nhiều giá trị, đơn vị bán + quy đổi m2/hộp, giá lẻ/B2B), validate lỗi rõ, upload ảnh nhiều, SEO, responsive.
```
- **Đầu ра mong muốn:** `ProductForm.tsx` chia section, thuộc tính gạch đầy đủ (kích thước, bề mặt, chất liệu, chống trượt), giá lẻ/B2B, quy đổi m2/hộp, upload ảnh, SEO, validate.
- **Lưu ý khi dùng:** Quy đổi m2/hộp ↔ viên dễ sai — kiểm tra kỹ; tách giá B2B theo phân quyền; upload ảnh cần endpoint thật + giới hạn dung lượng; đồng bộ thuộc tính với bộ lọc (prompt 38).

---

### 36. Modal (hộp thoại tái sử dụng)

- **Khi nào dùng:** Khi cần dialog dùng chung cho xác nhận xóa, xem nhanh, yêu cầu báo giá, form phụ.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <Modal /> tái sử dụng cho toàn hệ thống Daisan (admin + storefront VLXD).

YÊU CẦU:
- Overlay mờ nền, modal canh giữa, animation fade+scale khi mở/đóng.
- Props: { open, onClose, title?, size?:'sm'|'md'|'lg'|'xl', children, footer?, closeOnOverlay?=true, hideCloseButton? }.
- Header: title + nút X. Footer slot tùy biến (mặc định có thể truyền nút).
- Đóng khi: click X, click overlay (nếu cho phép), nhấn Esc.
- Focus trap (giữ focus trong modal), khóa scroll body khi mở, trả focus về phần tử trigger khi đóng.
- Render qua React Portal (document.body).
- Cung cấp thêm 2 preset dùng nhanh: <ConfirmModal /> (xác nhận xóa, nút "Xóa" đỏ + "Hủy") và bố cục cho "Yêu cầu báo giá" (ví dụ form nhỏ: tên, SĐT, số lượng m2, ghi chú công trình).

RÀNG BUỘC: React + TypeScript + Tailwind. Accessible (role=dialog, aria-modal, aria-labelledby). Tông CAM Daisan cho nút primary. Không phụ thuộc lib modal ngoài.

OUTPUT: Modal.tsx + ConfirmModal.tsx + ví dụ ConfirmModal (xóa SP) và modal "Yêu cầu báo giá" gạch.
TIÊU CHÍ: portal, focus trap, Esc/overlay đóng, khóa scroll, animation, các size, preset confirm + báo giá.
```
- **Đầu ra mong muốn:** `Modal.tsx` + `ConfirmModal.tsx` với portal, focus trap, khóa scroll, Esc/overlay, các size, preset xác nhận xóa và "Yêu cầu báo giá" gạch.
- **Lưu ý khi dùng:** Focus trap dễ lỗi — test bằng bàn phím; nhiều modal lồng nhau cần quản lý z-index/stack; preset báo giá nối với CTA ở ProductCard (prompt 27).

---

### 37. Tabs (chuyển tab nội dung)

- **Khi nào dùng:** Khi cần tách nội dung theo tab (trang chi tiết sản phẩm gạch: Mô tả/Thông số/Hướng dẫn thi công/Đánh giá; hoặc admin).
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <Tabs /> tái sử dụng cho storefront + admin Daisan.

YÊU CẦU:
- API thành phần: <Tabs>, <TabList>, <Tab>, <TabPanels>, <TabPanel> (hoặc props items[] {label, content, badge?, disabled?}). Chọn 1 cách, làm sạch sẽ.
- Active tab: gạch chân/nền CAM Daisan + chữ đậm; indicator trượt mượt khi đổi tab.
- Hỗ trợ badge số trên tab (VD "Đánh giá (128)").
- Tab disabled. Lazy render nội dung tab (chỉ mount khi mở) — tùy chọn.
- Responsive: nhiều tab thì cho scroll ngang trên mobile.
- Ví dụ áp dụng: trang chi tiết GẠCH với tab "Mô tả", "Thông số kỹ thuật" (bảng kích thước, chất liệu, bề mặt, chống trượt), "Hướng dẫn thi công/ốp lát", "Đánh giá (128)".

RÀNG BUỘC: React + TypeScript + Tailwind. Accessible (role=tablist/tab/tabpanel, aria-selected, điều hướng Arrow keys). Controlled + uncontrolled (defaultIndex/value+onChange). Tông CAM Daisan.

OUTPUT: Tabs.tsx + ví dụ tab chi tiết sản phẩm gạch (kèm bảng thông số kỹ thuật mẫu).
TIÊU CHÍ: keyboard nav, indicator trượt, badge, disabled, lazy render, ví dụ chi tiết gạch.
```
- **Đầu ра mong muốn:** `Tabs.tsx` accessible (arrow keys, aria), indicator trượt, badge, disabled, lazy render, ví dụ tab chi tiết gạch (thông số kỹ thuật, hướng dẫn thi công).
- **Lưu ý khi dùng:** Chọn controlled hay uncontrolled cho nhất quán; lazy render giúp tab "Đánh giá" nặng không tải sớm; nhớ điều hướng phím cho a11y.

---

### 38. FilterSidebar (bộ lọc sản phẩm gạch)

- **Khi nào dùng:** Khi cần thanh lọc trái cho trang danh mục/kết quả search với các thuộc tính đặc thù gạch.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <FilterSidebar /> cho trang danh sách GẠCH ỐP LÁT trên DaisanStore.

CÁC NHÓM BỘ LỌC (đặc thù ngành gạch — bắt buộc):
- Khoảng giá (slider + nhập min/max, tiền VN).
- Kích thước (checkbox: 30x30, 60x60, 80x80, 30x60, 15x90, 60x120...).
- Loại gạch (Ốp tường, Lát nền, Giả gỗ, Bóng kiếng, Granite, Mosaic).
- Bề mặt (Bóng kiếng, Mờ, Nhám, Sần).
- Chất liệu (Ceramic, Granite, Porcelain).
- Họa tiết/Vân (Vân gỗ, Vân đá, Vân vải, Trơn).
- Thương hiệu (Viglacera, Eurotile, Prime, Đồng Tâm, Catalan...).
- Xuất xứ, Màu sắc (swatch màu), Chống trượt (R9/R10/R11).
- Đánh giá (từ 4 sao trở lên).

YÊU CẦU UX:
- Mỗi nhóm collapse được; hiển thị số kết quả khớp; "Xem thêm" khi list dài.
- Chip "bộ lọc đang chọn" + nút "Xóa tất cả".
- Mobile: nút "Lọc" mở drawer/bottom sheet, có nút "Áp dụng".

RÀNG BUỘC: React + TypeScript + Tailwind. Props: { filters config, selected, onChange, resultCount }. State controlled từ ngoài để dễ đồng bộ URL query. Accessible. Tông xám + nhấn CAM Daisan cho mục đã chọn. Mock cấu hình filter gạch.

OUTPUT: FilterSidebar.tsx + interface cấu hình filter + mock + ví dụ (desktop sidebar + mobile drawer).
TIÊу CHÍ: đủ nhóm lọc đặc thù gạch, collapse, chip đã chọn + xóa tất cả, swatch màu, slider giá, drawer mobile, controlled state.
```
- **Đầu ра mong muốn:** `FilterSidebar.tsx` với các nhóm lọc đặc thù gạch (kích thước, bề mặt, chất liệu, vân, chống trượt, swatch màu), slider giá, chip đã chọn, drawer mobile, controlled state.
- **Lưu ý khi dùng:** Đồng bộ `selected` với URL query để chia sẻ link lọc; `resultCount` nên cập nhật theo từng filter (facet count từ Elasticsearch); thuộc tính phải khớp với form nhập SP (prompt 35).

---

### 39. Pagination (phân trang)

- **Khi nào dùng:** Khi cần phân trang cho danh sách sản phẩm, bảng admin, kết quả search.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <Pagination /> tái sử dụng cho storefront + admin Daisan.

YÊU CẦU:
- Hiển thị: nút Trước/Sau, các số trang, dấu "..." rút gọn khi nhiều trang (VD 1 ... 4 5 [6] 7 8 ... 20).
- Trang hiện tại nền CAM Daisan; disable Trước ở trang đầu, Sau ở trang cuối.
- Tùy chọn: ô "Đi tới trang...", chọn số dòng/trang (12/24/48), text "Hiển thị 1-24 trên 320 sản phẩm".
- Responsive: mobile rút gọn còn Trước/Sau + "Trang X/Y".

RÀNG BUỘC: React + TypeScript + Tailwind. Props: { currentPage, totalPages, totalItems?, pageSize?, onPageChange, onPageSizeChange?, pageSizeOptions? }. Logic sinh dãy số trang gọn (siblings/boundary) viết rõ ràng, tránh lỗi off-by-one. Accessible (nav aria-label, aria-current=page). Tông brand.

OUTPUT: Pagination.tsx + hàm tạo dãy trang + ví dụ (storefront sản phẩm + admin bảng).
TIÊU CHÍ: rút gọn "..." đúng, disable biên, đổi pageSize, mobile gọn, a11y, không off-by-one.
```
- **Đầu ра mong muốn:** `Pagination.tsx` với rút gọn "...", chọn pageSize, "đi tới trang", text tổng kết, biến thể mobile, hàm sinh dãy trang an toàn.
- **Lưu ý khi dùng:** Kiểm thử biên (1 trang, 2 trang, rất nhiều trang); đồng bộ `currentPage` với URL; với data lớn dùng server-side paging.

---

### 40. Footer Daisan

- **Khi nào dùng:** Khi cần chân trang đầy đủ cho các site trong hệ sinh thái Daisan.
- **Prompt đầy đủ để copy:**
```
Bạn là Frontend Engineer Daisan, tạo <Footer /> cho DaisanStore (sàn VLXD/gạch ốp lát).

YÊU CẦU CÁC CỘT:
1. Về Daisan: logo + giới thiệu ngắn (thương mại VLXD, gạch ốp lát, marketplace) + mạng xã hội.
2. Hệ sinh thái: link Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B.daisan.vn, News.daisan.vn, Daisan Ads.
3. Hỗ trợ khách hàng: Hướng dẫn mua/báo giá, Chính sách vận chuyển VLXD, Đổi trả, Bảo hành, Câu hỏi thường gặp.
4. Chính sách: Điều khoản, Bảo mật, Quy chế hoạt động sàn.
5. Liên hệ: địa chỉ kho (Hà Nội/HCM), hotline, email, giờ làm việc; nút "Đăng ký nhận tin"/ưu đãi (input email + nút CAM Daisan).
- Dải dưới cùng: bản quyền © Daisan + năm, hình thức thanh toán, chứng nhận (Bộ Công Thương - nếu có).

RÀNG BUỘC: React + TypeScript + Tailwind. Nền tối (xám đậm) hoặc trắng theo prop variant, điểm nhấn CAM Daisan. Responsive: desktop nhiều cột, mobile accordion gập cột. Accessible (nav, aria, link có nhãn). Form đăng ký email có validate cơ bản. Props: { variant?, onSubscribe }. Nội dung link nhận qua mock có thể chỉnh.

OUTPUT: Footer.tsx + mock cấu trúc link + ví dụ dùng.
TIÊу CHÍ: đủ 5 cột + dải bản quyền, link hệ sinh thái Daisan, form đăng ký email, responsive (accordion mobile), tông brand.
```
- **Đầu ра mong muốn:** `Footer.tsx` đầy đủ cột (về Daisan, hệ sinh thái, hỗ trợ, chính sách, liên hệ + đăng ký email), dải bản quyền, accordion mobile, tông brand.
- **Lưu ý khi dùng:** Cập nhật link hệ sinh thái và thông tin kho thật; form đăng ký nối endpoint thật + chống spam; chứng nhận pháp lý chỉ hiển thị khi có thật.
