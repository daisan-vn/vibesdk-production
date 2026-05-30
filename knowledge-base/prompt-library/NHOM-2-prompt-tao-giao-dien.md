# NHÓM 2 — Prompt tạo giao diện (page)

Thư viện 17 prompt thực chiến để Claude/Daisan.ai dựng nhanh các trang giao diện (page) hoàn chỉnh cho hệ sinh thái Daisan — từ landing, trang TMĐT, đến dashboard quản trị — chuẩn React + Tailwind, brand CAM Daisan, ngành gạch/VLXD.

> Quy ước chung cho cả nhóm: mọi prompt nên tham chiếu `knowledge-base/{DAISAN_BRAND_CONTEXT, DAISAN_BUSINESS_CONTEXT, UI_UX_STANDARD, CODE_STANDARD, COMPONENT_LIBRARY_GUIDE}.md`. Stack mặc định: React 18 + Vite + Tailwind, có thể mở rộng Next.js (App Router) khi cần SEO. Màu thương hiệu: CAM Daisan (đỏ cam, dùng làm `brand`/primary) + xám trung tính + xanh phụ trợ. Dữ liệu mẫu (mock) đặt trong file riêng, tách khỏi component. Mọi page phải responsive mobile-first, có trạng thái loading/empty/error, đạt a11y cơ bản (alt, aria-label, focus ring, contrast AA).

---

### 8. Landing page Daisan.ai (nền tảng AI dựng web cho ngành VLXD)
- **Khi nào dùng:** Khi cần dựng trang giới thiệu sản phẩm Daisan.ai để thu hút đội kinh doanh/đại lý VLXD đăng ký dùng thử nền tảng AI dựng web.
- **Prompt đầy đủ để copy:**
```
Vai trò: Bạn là Senior Frontend Engineer + Conversion Copywriter của Daisan. Hãy dựng một LANDING PAGE marketing hoàn chỉnh cho sản phẩm "Daisan.ai" — nền tảng AI giúp doanh nghiệp ngành vật liệu xây dựng (gạch ốp lát, thiết bị vệ sinh, VLXD) tự sinh website/landing/dashboard bằng mô tả tiếng Việt.

Bối cảnh Daisan: hệ sinh thái gồm Daisan.vn (search/catalog), DaisanStore (TMĐT B2C/B2B), DaisanTiles, DaisanDepot (bán sỉ), Daisan Ads. Khách mục tiêu của landing này là chủ cửa hàng gạch, đại lý VLXD, nhà phân phối, marketing agency ngành xây dựng. Brand: màu CAM Daisan (đỏ cam) làm primary, nền xám/trắng sạch, tham chiếu knowledge-base/DAISAN_BRAND_CONTEXT.md và UI_UX_STANDARD.md.

Ràng buộc kỹ thuật: React + Tailwind, component hóa rõ ràng (Navbar, Hero, LogoCloud, Features, HowItWorks, ShowcaseGallery, Pricing, Testimonials, FAQ, CTASection, Footer). Mỗi section là 1 component riêng trong thư mục components/landing/. Dùng mock data tách file. Responsive mobile-first, dark/light không bắt buộc nhưng phải có hover/focus states, animation nhẹ (fade/slide khi scroll, dùng CSS hoặc framer-motion nếu có).

Nội dung bắt buộc:
- Hero: tiêu đề mạnh về "dựng web bán gạch/VLXD bằng AI trong vài phút", subheadline, 2 CTA (Dùng thử miễn phí / Xem demo), ảnh/mockup minh hoạ dashboard sản phẩm gạch.
- Features (6 ô): sinh trang sản phẩm gạch tự động, đồng bộ catalog từ Daisan.vn, tối ưu SEO ngành VLXD, tạo dashboard quản trị, kết nối Daisan Ads, xuất code React/Tailwind.
- HowItWorks 3 bước: Mô tả → AI sinh giao diện → Xuất bản/Deploy.
- ShowcaseGallery: lưới các template mẫu (trang gạch, trang đại lý, landing khuyến mãi).
- Pricing 3 gói (Khởi đầu / Cửa hàng / Đại lý & Chuỗi) với feature comparison.
- Social proof: testimonial chủ cửa hàng gạch (giả lập, ghi rõ là demo data), số liệu (số trang đã tạo, số SKU đồng bộ).
- FAQ 6 câu liên quan ngành VLXD và AI.

Yêu cầu chất lượng: copy bằng tiếng Việt thuyết phục, không sáo rỗng; KHÔNG sao chép khẩu hiệu/thiết kế của thương hiệu bên thứ ba; CTA rõ ràng; a11y AA; có README ngắn mô tả cấu trúc file.

Tiêu chí hoàn thành: chạy được ngay bằng npm run dev, không lỗi console, layout đẹp ở 360px/768px/1280px, mọi link/CTA có hành vi (scroll hoặc route placeholder).
```
- **Đầu ra mong muốn:** Bộ component landing đầy đủ (Hero→Footer) + mock data + README; trang chạy được, responsive, brand CAM Daisan, copy ngành VLXD.
- **Lưu ý khi dùng:** Thay logo/ảnh mockup thật trước khi publish; chỉnh giá ở mock Pricing; nếu cần SEO mạnh, yêu cầu chuyển sang Next.js App Router. Cạm bẫy: AI dễ chèn testimonial "thật" — nhắc ghi rõ là demo.

---

### 9. Trang chủ DaisanStore (marketplace lớn, không copy thương hiệu khác)
- **Khi nào dùng:** Khi dựng homepage cho sàn TMĐT DaisanStore với mật độ thông tin cao kiểu marketplace nhưng giữ bản sắc Daisan riêng.
- **Prompt đầy đủ để copy:**
```
Vai trò: Senior Frontend Engineer của Daisan, chuyên trang chủ marketplace mật độ cao. Dựng TRANG CHỦ cho DaisanStore — sàn TMĐT B2C/B2B chuyên gạch ốp lát, thiết bị vệ sinh, VLXD.

Bối cảnh: DaisanStore phục vụ cả người mua lẻ và đại lý. Cần một homepage marketplace nhiều khối thông tin (deal, danh mục, flash sale, thương hiệu gạch, gợi ý theo công trình). Brand CAM Daisan (primary đỏ cam), xám trung tính, tham chiếu knowledge-base/DAISAN_BRAND_CONTEXT.md, DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md, COMPONENT_LIBRARY_GUIDE.md.

RÀNG BUỘC QUAN TRỌNG: TUYỆT ĐỐI KHÔNG sao chép layout, màu sắc, icon hay bản sắc của Shopee/Lazada/Tiki hay bất kỳ sàn nào. Hãy thiết kế hệ thống lưới và phân cấp thị giác RIÊNG của Daisan, lấy cảm hứng từ vật liệu xây dựng (texture gạch, đường nét vuông vức, tông cam-xám).

Kỹ thuật: React + Tailwind, component hóa: HeaderSearchBar (ô search lớn cho catalog gạch), MegaMenuDanhMuc, HeroBannerCarousel, FlashSaleStrip (đếm ngược), DanhMucNganh (gạch lát nền, gạch ốp tường, gạch trang trí, thiết bị vệ sinh, sơn-keo-vữa), ProductCardGrid, ThuongHieuGachLogos, GoiYTheoCongTrinh (block tư vấn theo loại công trình: nhà phố, biệt thự, khách sạn), DealDaiLyB2B (block riêng cho khách sỉ), Footer. Mỗi block tách component, mock data tách file.

Yêu cầu: ProductCard hiển thị ảnh gạch, tên, kích thước (vd 60x60, 80x80), giá/m2, nhãn (Mới, Giảm giá, Bán chạy), nút thêm giỏ. Responsive: mobile dùng carousel ngang cho danh mục, desktop dùng grid. Có skeleton loading cho mỗi block, empty state. A11y AA.

Tiêu chí hoàn thành: chạy npm run dev không lỗi; homepage dày đặc nhưng phân cấp rõ; nhận diện là Daisan (cam-xám) chứ không phải sàn khác; đẹp ở 360/768/1280px.
```
- **Đầu ra mong muốn:** Homepage marketplace nhiều block (banner, flash sale, danh mục ngành gạch, product grid, block B2B đại lý) bằng React+Tailwind, mock data, brand Daisan độc lập.
- **Lưu ý khi dùng:** Nhấn mạnh ràng buộc "không copy sàn khác" để tránh AI bê layout quen thuộc. Thay logo thương hiệu gạch bằng đối tác thật. Cạm bẫy: flash sale countdown cần xử lý timezone/unmount cleanup.

---

### 10. Trang danh mục sản phẩm (category + bộ lọc gạch)
- **Khi nào dùng:** Khi cần trang listing theo danh mục với bộ lọc đặc thù ngành gạch (kích thước, bề mặt, màu, công năng).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên trang category TMĐT. Dựng TRANG DANH MỤC SẢN PHẨM cho DaisanStore, ví dụ danh mục "Gạch lát nền".

Bối cảnh ngành gạch: bộ lọc phải đúng thuộc tính VLXD — Kích thước (30x30, 60x60, 80x80, 60x120...), Bề mặt (bóng/mờ/nhám/sần), Chất liệu (Porcelain, Ceramic, Granite), Màu sắc, Công năng (chống trượt, ngoài trời, ốp tường), Thương hiệu, Khoảng giá/m2, Xuất xứ. Brand CAM Daisan; tham chiếu knowledge-base/UI_UX_STANDARD.md, DAISAN_BUSINESS_CONTEXT.md, COMPONENT_LIBRARY_GUIDE.md.

Kỹ thuật: React + Tailwind. Layout 2 cột desktop (FilterSidebar trái + ProductGrid phải), mobile dùng FilterDrawer (nút "Bộ lọc" mở drawer). Component: Breadcrumb, CategoryHeader (tên + mô tả ngắn + số sản phẩm), FilterSidebar (accordion từng nhóm filter, checkbox/range slider giá), ActiveFilterChips (xóa nhanh), SortDropdown (Phổ biến / Giá tăng / Giá giảm / Mới), ProductGrid (ProductCard tái dùng từ COMPONENT_LIBRARY_GUIDE), Pagination hoặc infinite scroll, EmptyState khi không có kết quả.

Yêu cầu: filter cập nhật URL query params (?surface=matte&size=60x60) để chia sẻ/được index. Quản lý state filter bằng hook useFilters. ProductCard hiển thị giá/m2 và quy đổi giá/thùng. Loading skeleton, error state. A11y AA, filter có aria-label.

Tiêu chí hoàn thành: lọc/sort hoạt động trên mock data, URL đồng bộ filter, responsive desktop/mobile, không lỗi console.
```
- **Đầu ra mong muốn:** Trang category với sidebar filter ngành gạch, sort, grid sản phẩm, đồng bộ URL query, mobile drawer, mock data.
- **Lưu ý khi dùng:** Map đúng thuộc tính filter với Elasticsearch/catalog thật khi tích hợp. Cạm bẫy: range slider giá cần debounce; nhớ giữ scroll khi đổi filter.

---

### 11. Trang chi tiết sản phẩm (gạch)
- **Khi nào dùng:** Khi dựng trang chi tiết một sản phẩm gạch với gallery, thông số kỹ thuật và công cụ tính m2/thùng.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên trang Product Detail (PDP) ngành gạch. Dựng TRANG CHI TIẾT SẢN PHẨM cho DaisanStore với sản phẩm mẫu là một viên gạch lát nền porcelain 60x60.

Đặc thù ngành gạch BẮT BUỘC: tính giá theo m2 và quy đổi sang thùng (vd 1 thùng = 4 viên = 1.44 m2), nên có "Máy tính diện tích" cho phép nhập m2 cần lát → tự ra số thùng + số viên + tổng tiền (cộng % hao hụt 5-10%). Hiển thị thông số: kích thước, độ dày, bề mặt, chống trượt R-rating, hệ số hút nước, xuất xứ, bảo hành. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: Breadcrumb, ProductGallery (ảnh chính + thumbnail + zoom hover, có ảnh "phối cảnh trải sàn"), ProductSummary (tên, mã SP, giá/m2, giá/thùng, tình trạng kho, nhãn), AreaCalculator (máy tính m2→thùng), QuantityStepper (theo thùng), AddToCartBar, SpecTable (bảng thông số kỹ thuật), DescriptionTabs (Mô tả / Thông số / Hướng dẫn thi công / Đánh giá), ShippingInfo (phí ship gạch theo khối lượng/khoảng cách - placeholder), RelatedProducts (gạch cùng tông/cùng bộ), RecentlyViewed.

Yêu cầu: AreaCalculator tính realtime, hiển thị cảnh báo "nên mua dư X% hao hụt". Sticky AddToCartBar trên mobile. Schema.org Product (JSON-LD) cho SEO. Loading/error states. A11y AA.

Tiêu chí hoàn thành: máy tính m2 chạy đúng, gallery zoom mượt, sticky bar mobile, không lỗi console, responsive.
```
- **Đầu ra mong muốn:** PDP gạch đầy đủ: gallery, máy tính m2→thùng, bảng thông số, tabs, related, JSON-LD, mock data.
- **Lưu ý khi dùng:** Chỉnh công thức quy đổi (viên/thùng/m2) theo dữ liệu SKU thật. Cạm bẫy: làm tròn số thùng phải làm tròn LÊN; nhớ cộng hao hụt.

---

### 12. Trang shop/nhà cung cấp (storefront đại lý)
- **Khi nào dùng:** Khi cần trang gian hàng riêng cho một nhà cung cấp/đại lý gạch trên DaisanStore (storefront).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên storefront marketplace. Dựng TRANG SHOP/NHÀ CUNG CẤP cho DaisanStore — gian hàng của một đại lý gạch (vd "Gạch Hoàng Gia").

Bối cảnh: DaisanStore là marketplace, mỗi nhà cung cấp có storefront riêng với banner, thông tin uy tín, danh mục riêng và sản phẩm. Khách B2B quan tâm năng lực cung ứng, chính sách sỉ. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: ShopHeader (banner cover + logo + tên shop + badge xác thực + nút Theo dõi/Chat), ShopStats (đánh giá sao, số sản phẩm, năm hoạt động, tỉ lệ phản hồi, kho/khu vực giao), ShopNav (Trang chủ shop / Tất cả sản phẩm / Bộ sưu tập / Khuyến mãi / Giới thiệu), ShopSearchInShop (tìm trong gian hàng), CategoryChips (danh mục của riêng shop), ProductGrid (tái dùng ProductCard), CollectionBanners (bộ sưu tập gạch theo phong cách: tân cổ điển, hiện đại, vân đá), B2BPolicyBlock (chính sách giá sỉ, MOQ, công nợ - placeholder), ShopFooterInfo (địa chỉ, giấy phép, liên hệ).

Yêu cầu: nút Theo dõi có trạng thái toggle; tìm-trong-shop lọc mock data; tab Giới thiệu render mô tả + chứng nhận. Responsive, loading skeleton cho grid, empty state. A11y AA.

Tiêu chí hoàn thành: điều hướng tab trong shop hoạt động, search-in-shop lọc đúng, badge/stats hiển thị, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Storefront nhà cung cấp gạch: header banner, stats uy tín, nav nội bộ, search-in-shop, grid sản phẩm, block chính sách B2B, mock data.
- **Lưu ý khi dùng:** Phân biệt rõ data shop vs data sản phẩm. Cạm bẫy: badge "đã xác thực" chỉ hiển thị khi có cờ verified thật; tránh gán mặc định.

---

### 13. Trang giỏ hàng (cart, theo m2/thùng)
- **Khi nào dùng:** Khi dựng trang giỏ hàng có đặc thù gạch (đơn vị thùng/m2, gộp theo nhà cung cấp, mã giảm giá).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên flow mua hàng. Dựng TRANG GIỎ HÀNG cho DaisanStore.

Đặc thù ngành gạch: mỗi dòng sản phẩm hiển thị đơn vị thùng + quy đổi m2, đơn giá/m2, thành tiền; cảnh báo khối lượng vận chuyển (kg) vì gạch nặng. Giỏ gộp theo nhà cung cấp (vì marketplace nhiều shop). Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: CartHeaderSteps (Giỏ hàng → Thanh toán → Hoàn tất), CartGroupBySupplier (mỗi nhóm có checkbox chọn cả shop), CartItemRow (ảnh, tên, kích thước, QuantityStepper theo thùng, đơn giá/m2, xóa, lưu để mua sau), VoucherInput (mã giảm giá, validate mock), ShippingEstimate (ước tính phí ship theo tổng kg - placeholder), OrderSummarySticky (tạm tính, giảm giá, phí ship, tổng cộng, nút Tiến hành thanh toán), EmptyCartState, CrossSell (gạch/keo/ke gạch đi kèm).

Yêu cầu: cập nhật số lượng realtime tính lại tổng; chọn/bỏ chọn item ảnh hưởng tổng tiền; xóa có confirm; lưu giỏ vào localStorage (hook useCart). Summary sticky desktop, bottom bar mobile. Loading khi áp voucher. A11y AA.

Tiêu chí hoàn thành: thêm/sửa/xóa/chọn cập nhật tổng đúng, voucher mock hoạt động, persist localStorage, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Trang cart gộp theo nhà cung cấp, đơn vị thùng/m2, voucher, summary sticky, persist localStorage, cross-sell phụ kiện thi công.
- **Lưu ý khi dùng:** Đồng bộ logic quy đổi với PDP (prompt 11). Cạm bẫy: tính lại tổng phải dựa trên item được tick chọn, không phải toàn bộ giỏ.

---

### 14. Trang checkout (đặt hàng B2C/B2B)
- **Khi nào dùng:** Khi dựng luồng thanh toán/đặt hàng cuối, hỗ trợ cả khách lẻ và đại lý (xuất hóa đơn, công nợ).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên checkout TMĐT. Dựng TRANG CHECKOUT cho DaisanStore, hỗ trợ cả mua lẻ (B2C) và đại lý (B2B).

Bối cảnh: gạch giao theo khối lượng lớn, cần địa chỉ giao chi tiết, thời gian giao, ghi chú công trình; khách B2B cần xuất hóa đơn GTGT và tùy chọn thanh toán công nợ. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md, CODE_STANDARD.md.

Kỹ thuật: React + Tailwind + react-hook-form (validation). Component: CheckoutSteps, ShippingAddressForm (chọn địa chỉ đã lưu hoặc nhập mới, tỉnh/huyện/xã), DeliveryOptions (giao tiêu chuẩn / giao nhanh / nhận tại kho), InvoiceToggle (xuất hóa đơn GTGT → hiện form mã số thuế, tên công ty), PaymentMethods (COD, chuyển khoản, ví, công nợ-chỉ B2B), OrderNote (ghi chú công trình), OrderReviewList (tóm tắt item theo nhà cung cấp), OrderSummary (tổng, phí ship, VAT, giảm giá), PlaceOrderButton, OrderSuccessState (mã đơn, hướng dẫn tiếp theo).

Yêu cầu: validate đầy đủ (sđt VN, MST nếu xuất hóa đơn), hiển thị lỗi inline; phương thức "công nợ" chỉ bật khi tài khoản là đại lý (mock flag isDealer); summary cập nhật theo lựa chọn giao hàng. Loading khi đặt đơn, success/error rõ ràng. A11y AA, form có label/aria.

Tiêu chí hoàn thành: validate hoạt động, toggle hóa đơn/B2B đúng, submit ra mã đơn (mock), responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Trang checkout multi-step có form địa chỉ, giao hàng, hóa đơn GTGT, payment (gồm công nợ B2B), validation, success state, mock submit.
- **Lưu ý khi dùng:** Cắm API địa giới hành chính thật và cổng thanh toán khi tích hợp. Cạm bẫy: phương thức công nợ phải gate theo quyền đại lý; đừng để lộ với B2C.

---

### 15. Trang đăng nhập / đăng ký (auth, B2C + đại lý)
- **Khi nào dùng:** Khi cần màn auth cho DaisanStore/hệ sinh thái, phân luồng khách lẻ và đăng ký đại lý B2B.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên Auth UI. Dựng TRANG ĐĂNG NHẬP/ĐĂNG KÝ cho hệ sinh thái Daisan (dùng chung cho DaisanStore).

Bối cảnh: 2 loại tài khoản — Khách mua lẻ (đăng ký nhanh bằng SĐT/email) và Đại lý/Doanh nghiệp (đăng ký có thông tin công ty, MST, để xét duyệt giá sỉ). Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BRAND_CONTEXT.md, UI_UX_STANDARD.md, CODE_STANDARD.md.

Kỹ thuật: React + Tailwind + react-hook-form. Layout split-screen desktop (trái: hình ảnh/brand kể chuyện ngành gạch + value props; phải: form), mobile full-width. Component: AuthLayout, TabSwitch (Đăng nhập / Đăng ký), LoginForm (email/sđt + mật khẩu, nhớ đăng nhập, quên mật khẩu), RegisterTypeToggle (Cá nhân / Đại lý), RegisterPersonalForm, RegisterDealerForm (tên công ty, MST, khu vực kinh doanh, sản lượng dự kiến), SocialAuthButtons (Google/Zalo - placeholder), OTPVerifyStep (nhập OTP 6 số), PasswordStrengthMeter.

Yêu cầu: validate email/sđt VN/mật khẩu mạnh, lỗi inline; chuyển tab giữ state hợp lý; form đại lý hiện thông báo "tài khoản sẽ được xét duyệt"; OTP có resend countdown. Loading khi submit, error state (sai mật khẩu...). A11y AA, đầy đủ label, focus order, không bẫy người dùng.

Tiêu chí hoàn thành: 2 luồng đăng ký hoạt động, validation đúng, OTP countdown, split-screen responsive về stacked trên mobile, không lỗi console.
```
- **Đầu ra mong muốn:** Trang auth split-screen với login, đăng ký cá nhân + đại lý, OTP, password strength, validation, brand Daisan.
- **Lưu ý khi dùng:** Nối social/OTP với backend thật (Laravel/SMS gateway) khi tích hợp. Cạm bẫy: đừng tự ý lưu mật khẩu vào localStorage; OTP resend cần cleanup timer.

---

### 16. Trang search kết quả sản phẩm (Elasticsearch-ready)
- **Khi nào dùng:** Khi dựng trang kết quả tìm kiếm catalog gạch/VLXD, tối ưu cho Elasticsearch (facet, gợi ý, relevance).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên Search UX, phối hợp với SEARCH_ENGINEER. Dựng TRANG KẾT QUẢ TÌM KIẾM cho Daisan.vn/DaisanStore, sẵn sàng nối Elasticsearch.

Bối cảnh: người dùng tìm "gạch 60x60 vân đá", "thiết bị vệ sinh Inax"... Cần facet (kích thước, thương hiệu, bề mặt, giá, công năng), gợi ý sửa lỗi chính tả, từ khóa liên quan, và hiển thị độ liên quan. Brand CAM Daisan; tham chiếu knowledge-base/system-prompts/SEARCH_ENGINEER_AGENT_PROMPT.md, DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: SearchBarWithSuggest (autocomplete dropdown: sản phẩm/danh mục/thương hiệu), SearchSummary (hiển thị "Kết quả cho 'X' (N sản phẩm)" + thời gian), DidYouMean (gợi ý sửa từ khóa), FacetSidebar (facet counts dạng "(123)"), ActiveFilterChips, SortDropdown (Liên quan nhất / Bán chạy / Giá), ResultGrid (ProductCard có highlight từ khóa khớp), RelatedSearches (chips từ khóa liên quan), NoResultsState (gợi ý từ khóa, sản phẩm phổ biến).

Yêu cầu: thiết kế contract dữ liệu giả lập GIỐNG response Elasticsearch (hits, aggregations cho facet, suggest). Hook useSearch(query, filters) trả mock theo cấu trúc đó để dễ thay bằng API thật. Highlight đoạn khớp trong tên SP. Facet cập nhật URL. Loading skeleton, no-result thân thiện. A11y AA, search input có role/aria.

Tiêu chí hoàn thành: search + facet + sort hoạt động trên mock ES-shaped data, autocomplete + did-you-mean hiển thị, URL đồng bộ, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Trang search với autocomplete, facet (aggregations), did-you-mean, highlight, no-result, mock data đúng shape Elasticsearch, hook useSearch dễ thay API.
- **Lưu ý khi dùng:** Giữ contract mock khớp index ES thật để dev backend cắm nhanh. Cạm bẫy: debounce autocomplete; tránh gọi search mỗi keystroke.

---

### 17. Trang dashboard tổng quan (overview, KPI VLXD)
- **Khi nào dùng:** Khi cần màn tổng quan cho quản trị viên/chủ cửa hàng xem KPI bán gạch, đơn hàng, tồn kho, doanh thu.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên Dashboard/BI. Dựng TRANG DASHBOARD TỔNG QUAN cho hệ quản trị Daisan (DaisanStore/DaisanDepot).

Bối cảnh: người dùng là chủ cửa hàng/đại lý gạch xem nhanh sức khỏe kinh doanh: doanh thu, đơn hàng, sản phẩm bán chạy, tồn kho gạch sắp hết, hiệu suất theo nhà cung cấp/khu vực. Brand CAM Daisan; tham chiếu knowledge-base/UI_UX_STANDARD.md, DAISAN_BUSINESS_CONTEXT.md, COMPONENT_LIBRARY_GUIDE.md.

Kỹ thuật: React + Tailwind + thư viện chart (recharts hoặc chart.js). Component: DashboardHeader (lời chào + DateRangePicker + nút xuất báo cáo), KpiCardRow (Doanh thu, Đơn hàng, Giá trị đơn TB, Tỉ lệ chuyển đổi — mỗi card có số, % thay đổi so kỳ trước, sparkline), RevenueChart (line/area theo thời gian), OrdersByStatusChart (donut: chờ xác nhận/đang giao/hoàn tất/hủy), TopProductsTable (gạch bán chạy: tên, kích thước, số lượng/m2, doanh thu), LowStockAlert (gạch sắp hết, badge cảnh báo), SalesByRegionMap hoặc bar (theo khu vực/đại lý), RecentOrdersList.

Yêu cầu: DateRangePicker đổi range cập nhật toàn bộ widget (mock recompute); KPI card hiển thị xu hướng tăng/giảm màu (xanh tăng, đỏ giảm — KHÔNG nhầm với CAM brand); chart responsive; loading skeleton từng widget; empty state khi không có data. Grid bố cục 12 cột. A11y AA, chart có mô tả text thay thế.

Tiêu chí hoàn thành: đổi date range cập nhật widget, chart render đúng mock data, responsive (xếp dọc mobile), không lỗi console.
```
- **Đầu ra mong muốn:** Dashboard KPI cards + charts (doanh thu, đơn theo trạng thái, top gạch bán chạy, tồn kho thấp, theo khu vực) responsive, mock data, brand Daisan.
- **Lưu ý khi dùng:** Tách màu trạng thái (xanh/đỏ) khỏi màu brand cam để tránh hiểu nhầm. Cạm bẫy: chart cần ResponsiveContainer; đừng hardcode width.

---

### 18. Admin layout (sidebar + topbar + content)
- **Khi nào dùng:** Khi cần khung quản trị tái dùng cho toàn bộ trang admin (sidebar đa cấp, topbar, breadcrumb, content slot).
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên design system admin. Dựng ADMIN LAYOUT khung tái dùng cho toàn bộ trang quản trị Daisan (dùng chung cho quản lý sản phẩm/đơn/khách/nhà cung cấp/báo cáo).

Bối cảnh: hệ quản trị nhiều module (Sản phẩm, Đơn hàng, Khách hàng, Nhà cung cấp, Marketing/Ads, Báo cáo, AI). Cần layout chuẩn, nhất quán, làm nền cho mọi page admin khác. Brand CAM Daisan (sidebar active = cam), nền xám nhạt; tham chiếu knowledge-base/UI_UX_STANDARD.md, COMPONENT_LIBRARY_GUIDE.md, CODE_STANDARD.md.

Kỹ thuật: React + Tailwind + react-router (Outlet cho content). Component: AdminLayout (grid: sidebar + main), Sidebar (logo Daisan, menu đa cấp có icon + nhóm, trạng thái active theo route, thu gọn/mở rộng collapse), Topbar (search global, chuông thông báo có badge, switcher hệ thống Daisan.vn/Store/Depot, avatar dropdown: hồ sơ/cài đặt/đăng xuất, nút toggle sidebar mobile), Breadcrumbs (tự sinh từ route), PageHeader (tiêu đề + mô tả + slot actions), ContentArea (Outlet), MobileSidebarDrawer.

Yêu cầu: sidebar collapse lưu trạng thái (localStorage); responsive: desktop sidebar cố định, mobile chuyển drawer overlay; active menu highlight theo route hiện tại; keyboard nav cho menu; topbar sticky. Cung cấp 2-3 route demo dùng layout (vd /admin/products, /admin/orders) để chứng minh content slot hoạt động. A11y AA, landmark roles (nav/main/header).

Tiêu chí hoàn thành: điều hướng route đổi content giữ nguyên layout, sidebar collapse persist, mobile drawer hoạt động, không lỗi console, responsive.
```
- **Đầu ra mong muốn:** Khung AdminLayout (Sidebar đa cấp + Topbar + Breadcrumb + Outlet) tái dùng, collapse persist, mobile drawer, route demo, brand Daisan.
- **Lưu ý khi dùng:** Dùng layout này làm nền cho prompt 19-24. Cạm bẫy: active state phải match route con; topbar switcher cần nhất quán với hệ sinh thái thật.

---

### 19. Trang quản lý sản phẩm (admin products)
- **Khi nào dùng:** Khi dựng màn CRUD quản lý sản phẩm gạch trong admin: bảng, lọc, bulk action, form thêm/sửa.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên admin CRUD. Dựng TRANG QUẢN LÝ SẢN PHẨM (đặt trong ADMIN LAYOUT đã có ở prompt 18) cho hệ quản trị Daisan.

Bối cảnh ngành gạch: sản phẩm có thuộc tính đặc thù (kích thước, bề mặt, chất liệu, giá/m2, viên/thùng, tồn kho theo thùng, nhà cung cấp, trạng thái hiển thị). Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md, CODE_STANDARD.md, COMPONENT_LIBRARY_GUIDE.md.

Kỹ thuật: React + Tailwind. Component: ProductsPageHeader (tiêu đề + nút "Thêm sản phẩm"), ProductsToolbar (search, filter theo danh mục/thương hiệu/trạng thái/tồn kho, nút import/export), ProductsTable (cột: ảnh, tên+mã, danh mục, kích thước, giá/m2, tồn (thùng), trạng thái badge, hành động sửa/xóa/ẩn), bulk-select + BulkActionBar (ẩn/hiện, đổi danh mục, xóa), Pagination, ProductFormDrawer hoặc trang riêng (các nhóm field: Thông tin cơ bản, Ảnh - upload nhiều, Thuộc tính kỹ thuật gạch, Giá & quy đổi thùng/m2, Tồn kho, SEO). Empty state, RowActionsMenu.

Yêu cầu: bảng có sort theo cột, sticky header, phân trang client mock; filter kết hợp; form validate (giá>0, viên/thùng nguyên dương), preview ảnh khi upload; xóa có confirm modal; toast khi lưu/xóa. Loading/error/empty states. Responsive: bảng scroll ngang trên mobile hoặc chuyển card. A11y AA.

Tiêu chí hoàn thành: CRUD chạy trên mock (thêm/sửa/xóa cập nhật bảng), filter+sort+bulk hoạt động, form validate, toast, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Màn quản lý sản phẩm: toolbar lọc, bảng có sort/bulk/pagination, form thêm/sửa thuộc tính gạch + quy đổi thùng/m2, CRUD mock, toast.
- **Lưu ý khi dùng:** Tái dùng AdminLayout (prompt 18) và ProductCard/Table từ COMPONENT_LIBRARY_GUIDE. Cạm bẫy: validate viên/thùng phải số nguyên; import/export chỉ là placeholder ban đầu.

---

### 20. Trang quản lý đơn hàng (admin orders)
- **Khi nào dùng:** Khi dựng màn xử lý đơn hàng: danh sách, lọc theo trạng thái, chi tiết đơn, cập nhật trạng thái giao.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên admin vận hành đơn hàng. Dựng TRANG QUẢN LÝ ĐƠN HÀNG (trong ADMIN LAYOUT ở prompt 18) cho DaisanStore/DaisanDepot.

Bối cảnh: đơn gạch khối lượng lớn, có cả B2C lẻ và B2B sỉ (công nợ), trạng thái: Chờ xác nhận → Đã xác nhận → Đang đóng gói → Đang giao → Hoàn tất / Hủy / Trả hàng. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: OrdersHeader, StatusTabs (tab theo trạng thái có đếm số), OrdersToolbar (search mã đơn/SĐT/tên, filter theo ngày, kênh B2C/B2B, phương thức thanh toán), OrdersTable (mã đơn, khách, ngày, số mặt hàng, tổng tiền, thanh toán, trạng thái badge màu, hành động), OrderDetailDrawer/Page (thông tin khách + địa chỉ giao, danh sách item theo thùng/m2, timeline trạng thái, thông tin thanh toán/công nợ, nút cập nhật trạng thái, in phiếu giao), StatusUpdateModal, ExportButton.

Yêu cầu: chuyển trạng thái có ràng buộc luồng (không nhảy lùi tùy tiện), cập nhật phản ánh ngay trên bảng + tab count; badge màu theo trạng thái (tách khỏi màu brand cam); filter ngày + kênh kết hợp; timeline hiển thị mốc thời gian. Loading/empty/error. Responsive (mobile: card đơn). A11y AA.

Tiêu chí hoàn thành: lọc theo tab/trạng thái đúng, mở chi tiết đơn, cập nhật trạng thái cập nhật bảng+count, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Màn orders: tabs trạng thái có count, toolbar lọc B2C/B2B, bảng đơn, drawer chi tiết với timeline + cập nhật trạng thái, mock data.
- **Lưu ý khi dùng:** Định nghĩa state machine trạng thái rõ để chặn chuyển sai. Cạm bẫy: in phiếu/ export ban đầu là placeholder; nhớ tab count cập nhật khi đổi trạng thái.

---

### 21. Trang quản lý khách hàng (admin customers/CRM)
- **Khi nào dùng:** Khi dựng màn CRM nhẹ: danh sách khách, phân nhóm (lẻ/đại lý/VIP), hồ sơ khách, lịch sử mua.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên CRM admin. Dựng TRANG QUẢN LÝ KHÁCH HÀNG (trong ADMIN LAYOUT ở prompt 18) cho hệ quản trị Daisan.

Bối cảnh: khách gồm cá nhân mua lẻ và đại lý/nhà thầu mua sỉ; cần phân nhóm, hạng (Thường/Bạc/Vàng/VIP), theo dõi giá trị mua, công nợ với đại lý. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: CustomersHeader (+ nút Thêm khách), SegmentTabs (Tất cả / Cá nhân / Đại lý / VIP / Có công nợ), CustomersToolbar (search tên/SĐT/email, filter khu vực, hạng, khoảng giá trị mua), CustomersTable (tên+avatar, loại, khu vực, số đơn, tổng chi tiêu, công nợ, lần mua cuối, hành động), CustomerDetailDrawer/Page (thông tin liên hệ, hạng + tiến độ lên hạng, tab: Tổng quan / Lịch sử đơn / Địa chỉ / Công nợ / Ghi chú CSKH), AddNoteForm, TagChips (gắn nhãn: nhà thầu, KTS, công trình lớn).

Yêu cầu: phân nhóm/filter/search trên mock; hồ sơ khách hiển thị tổng chi tiêu, số đơn, lịch sử mua gạch; thêm ghi chú CSKH lưu vào mock; badge công nợ cảnh báo khi vượt hạn mức. Loading/empty/error. Responsive (mobile card). A11y AA.

Tiêu chí hoàn thành: segment+filter+search hoạt động, mở hồ sơ khách xem tabs, thêm ghi chú cập nhật, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Màn CRM khách hàng: segment tabs, toolbar lọc, bảng khách, hồ sơ chi tiết (lịch sử mua, công nợ, ghi chú, tag), mock data.
- **Lưu ý khi dùng:** Gắn dữ liệu công nợ thận trọng, chỉ áp cho đại lý. Cạm bẫy: tránh lộ thông tin nhạy cảm trên bảng tổng; che bớt khi cần.

---

### 22. Trang quản lý nhà cung cấp (admin suppliers)
- **Khi nào dùng:** Khi dựng màn quản trị nhà cung cấp/đại lý gạch: danh sách, hồ sơ năng lực, sản phẩm cung ứng, hợp đồng/chiết khấu.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên admin nhà cung cấp (marketplace ops). Dựng TRANG QUẢN LÝ NHÀ CUNG CẤP (trong ADMIN LAYOUT ở prompt 18) cho DaisanStore/DaisanDepot.

Bối cảnh: DaisanStore là marketplace nhiều nhà cung cấp gạch/VLXD; cần quản lý hồ sơ pháp lý, năng lực cung ứng, số sản phẩm, hiệu suất bán, chính sách chiết khấu/hợp đồng, trạng thái duyệt. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: SuppliersHeader (+ nút Thêm/Mời nhà cung cấp), StatusTabs (Đang hợp tác / Chờ duyệt / Tạm ngưng), SuppliersToolbar (search tên/MST, filter ngành hàng, khu vực, hạng đối tác), SuppliersTable (logo+tên, MST, ngành hàng, số SP, doanh thu đóng góp, đánh giá, trạng thái, hành động), SupplierDetailDrawer/Page (tab: Hồ sơ pháp lý + giấy phép, Năng lực cung ứng/kho, Sản phẩm cung cấp, Hiệu suất bán - mini chart, Chính sách chiết khấu/hợp đồng, Lịch sử thanh toán), ApprovalActions (duyệt/từ chối với lý do), ContractInfoBlock.

Yêu cầu: tab trạng thái + filter + search trên mock; duyệt/từ chối cập nhật trạng thái + tab count; hồ sơ hiển thị chứng nhận (placeholder file), mini chart hiệu suất; chiết khấu hiển thị theo bậc sản lượng. Loading/empty/error. Responsive. A11y AA.

Tiêu chí hoàn thành: lọc/duyệt nhà cung cấp hoạt động, mở hồ sơ xem tabs + chart, cập nhật trạng thái phản ánh bảng, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Màn quản lý nhà cung cấp: tabs trạng thái, toolbar lọc, bảng NCC, hồ sơ chi tiết (pháp lý, năng lực, sản phẩm, hiệu suất, chiết khấu), action duyệt, mock data.
- **Lưu ý khi dùng:** Phân biệt rõ "nhà cung cấp" (bán trên sàn) vs "khách đại lý" (mua sỉ) — đừng nhầm 2 màn. Cạm bẫy: hành động duyệt nên có lý do bắt buộc khi từ chối.

---

### 23. Trang báo cáo doanh thu (revenue report/BI)
- **Khi nào dùng:** Khi dựng màn báo cáo doanh thu sâu: lọc nhiều chiều, biểu đồ xu hướng, bảng chi tiết, xuất file.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên báo cáo BI. Dựng TRANG BÁO CÁO DOANH THU (trong ADMIN LAYOUT ở prompt 18) cho hệ quản trị Daisan.

Bối cảnh: chủ doanh nghiệp/đại lý gạch cần phân tích doanh thu nhiều chiều: theo thời gian, theo danh mục gạch, theo nhà cung cấp, theo khu vực, theo kênh (B2C/B2B), theo nhân viên sale. Brand CAM Daisan; tham chiếu knowledge-base/UI_UX_STANDARD.md, DAISAN_BUSINESS_CONTEXT.md.

Kỹ thuật: React + Tailwind + recharts. Component: ReportHeader (DateRangePicker + so sánh kỳ trước + nút Xuất Excel/PDF), FilterBar (chiều phân tích: danh mục/khu vực/kênh/NCC), KpiSummaryRow (Tổng doanh thu, Lợi nhuận gộp ước tính, Số đơn, GTĐ TB, % so kỳ trước), RevenueTrendChart (line: kỳ này vs kỳ trước), RevenueByCategoryChart (bar/treemap: gạch lát/ốp/trang trí/TBVS), RevenueByRegionChart, ChannelSplitChart (donut B2C/B2B), TopProductsTable, RevenueDetailTable (bảng chi tiết theo chiều đang chọn, có sort + tổng cộng), ExportButtons.

Yêu cầu: đổi date range + chiều phân tích recompute toàn bộ widget (mock); so sánh kỳ trước hiển thị delta màu (xanh/đỏ, tách màu brand cam); bảng chi tiết có dòng tổng, sort, sticky header; nút xuất là placeholder (toast "đang xuất"). Loading skeleton từng widget, empty state. Responsive (mobile xếp dọc). A11y AA, chart có bảng số thay thế.

Tiêu chí hoàn thành: đổi filter/date cập nhật chart+bảng, so sánh kỳ trước hiển thị delta, bảng có tổng cộng, responsive, không lỗi console.
```
- **Đầu ra mong muốn:** Màn báo cáo doanh thu đa chiều: KPI, chart xu hướng/theo danh mục/khu vực/kênh, bảng chi tiết có tổng, so sánh kỳ trước, export placeholder, mock data.
- **Lưu ý khi dùng:** Nối với API tổng hợp (Laravel/Odoo) khi tích hợp; lợi nhuận gộp cần dữ liệu giá vốn thật. Cạm bẫy: tránh nhầm màu delta với brand cam; recompute phải nhất quán giữa các widget.

---

### 24. Trang AI tối ưu sản phẩm (AI product optimizer)
- **Khi nào dùng:** Khi dựng màn dùng Daisan AI để tối ưu nội dung sản phẩm gạch (tiêu đề, mô tả, SEO, ảnh, giá gợi ý) và áp đề xuất.
- **Prompt đầy đủ để copy:**
```
Vai trò: Frontend Engineer Daisan chuyên giao diện AI-assist (human-in-the-loop). Dựng TRANG AI TỐI ƯU SẢN PHẨM (trong ADMIN LAYOUT ở prompt 18) — nơi Daisan AI gợi ý cải thiện listing sản phẩm gạch và người dùng duyệt/áp đề xuất.

Bối cảnh: nhiều SKU gạch có tiêu đề nghèo, thiếu thuộc tính, mô tả sơ sài, ảnh xấu, SEO yếu → ảnh hưởng search (Daisan.vn/Elasticsearch) và quảng cáo (Daisan Ads). Daisan AI quét và đề xuất: tiêu đề tối ưu (kèm kích thước/chất liệu), mô tả bán hàng, từ khóa SEO, thiếu thuộc tính cần bổ sung, giá gợi ý theo thị trường, gợi ý ảnh. Brand CAM Daisan; tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md, system-prompts/SEARCH_ENGINEER_AGENT_PROMPT.md, UI_UX_STANDARD.md.

Kỹ thuật: React + Tailwind. Component: OptimizerHeader (chọn phạm vi: 1 SP / theo danh mục / toàn bộ, nút "Quét & gợi ý"), HealthScoreOverview (điểm sức khỏe listing trung bình + phân bố), SuggestionsQueue (danh sách SP cần tối ưu, mỗi dòng có điểm hiện tại + số đề xuất), OptimizeDetailPanel (split: bên trái nội dung HIỆN TẠI, bên phải ĐỀ XUẤT của AI với diff highlight cho tiêu đề/mô tả/SEO/thuộc tính/giá), ApplyControls (nút Áp dụng từng phần / Áp tất cả / Bỏ qua, có chỉnh sửa trước khi áp), BeforeAfterPreview (preview thẻ sản phẩm trước/sau), BulkApplyBar, AILoadingState (đang phân tích...), ConfidenceBadge (độ tin cậy mỗi gợi ý).

Yêu cầu: luôn human-in-the-loop — AI chỉ đề xuất, người dùng duyệt; cho sửa nội dung gợi ý trước khi áp; diff highlight thêm/bớt; áp đề xuất cập nhật điểm sức khỏe + queue; mock luồng "quét" có loading + kết quả giả lập có cấu trúc rõ (để cắm API LLM thật sau). Toast khi áp. Loading/empty/error. Responsive (mobile: stack hiện tại/đề xuất). A11y AA.

Tiêu chí hoàn thành: quét ra danh sách gợi ý (mock), mở chi tiết xem diff, sửa + áp đề xuất cập nhật điểm/queue, bulk apply, responsive, không lỗi console.
```
- **Đầu ра mong muốn:** Màn AI optimizer: health score, hàng đợi SP cần tối ưu, panel diff hiện tại/đề xuất (tiêu đề/mô tả/SEO/thuộc tính/giá), before-after preview, apply có chỉnh sửa + bulk, confidence badge, mock luồng quét.
- **Lưu ý khi dùng:** Giữ contract mock của "đề xuất AI" rõ ràng để nối LLM/endpoint thật; luôn để người duyệt (human-in-the-loop), không auto-apply. Cạm bẫy: gợi ý giá phải có cảnh báo "tham khảo"; đừng để AI tự sửa SKU khi chưa xác nhận.
