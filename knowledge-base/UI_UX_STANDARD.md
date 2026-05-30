# UI_UX_STANDARD.md — Chuẩn Giao Diện Daisan.ai

> Tài liệu nền tảng quy định **chuẩn UI/UX** mà Daisan.ai phải tuân thủ khi sinh code giao diện cho toàn hệ sinh thái Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B.daisan.vn, News.daisan.vn, Daisan Ads, Admin). Mục đích: đảm bảo mọi màn hình do AI sinh ra đều **nhất quán thương hiệu, dày thông tin, dễ scan, mobile-first và sẵn sàng production** với React + Tailwind CSS. Tài liệu này là "luật" — khi người dùng nhập yêu cầu tiếng Việt, AI phải áp dụng các chuẩn dưới đây làm mặc định, chỉ lệch khi người dùng yêu cầu rõ ràng.

---

## 1. Triết lý thiết kế Daisan

Daisan là hệ sinh thái **thương mại vật liệu xây dựng** (gạch ốp lát, vật liệu, marketplace B2B/B2C, phân phối sỉ). Người dùng là **chủ thầu, kiến trúc sư, đại lý, người mua lẻ, nhân viên kinh doanh** — họ cần ra quyết định mua nhanh, so sánh nhiều sản phẩm, tra cứu thông số kỹ thuật (kích thước, bề mặt, xuất xứ, giá sỉ). Vì vậy giao diện phải theo bốn nguyên tắc cốt lõi:

### 1.1. Commerce hiện đại (Modern commerce)
Giao diện sạch, sáng, chuyên nghiệp như các sàn TMĐT lớn (Shopee, Lazada, Tiki, kết hợp độ tinh tế của các site vật liệu cao cấp). Nền sáng (`#FFFFFF` / `#F8F9FA`), điểm nhấn bằng **cam Daisan**, khoảng trắng có chủ đích, ảnh sản phẩm là nhân vật chính. Tránh hiệu ứng lòe loẹt, gradient màu mè không cần thiết.

### 1.2. Dày thông tin (Information-dense)
Khác với landing page SaaS "ít chữ nhiều khoảng trắng", commerce vật liệu cần **mật độ thông tin cao**: một product card phải hiển thị được ảnh, badge, tên, SKU, kích thước, giá, CTA mà vẫn gọn gàng. Trang danh mục cần grid nhiều sản phẩm/màn hình. Mật độ cao **nhưng có phân cấp thị giác rõ ràng** — không được rối.

### 1.3. Dễ scan (Scannable)
Người mua lướt rất nhanh. Mọi màn hình phải có **phân cấp thị giác** rõ: tiêu đề đậm, giá nổi bật (màu cam), badge phân loại, alignment nhất quán theo lưới. Dùng màu sắc và độ đậm font để dẫn mắt, không bắt người dùng đọc từng dòng. Thông tin quan trọng nhất (giá, CTA, trạng thái tồn kho) luôn ở vị trí dễ thấy.

### 1.4. Mobile-first
Phần lớn người mua vật liệu truy cập bằng điện thoại ngay tại công trình/cửa hàng. **Thiết kế từ màn hình nhỏ trước**, rồi mở rộng lên desktop. Bắt buộc: sticky search trên đầu, bottom navigation, grid 2 cột trên mobile, bottom sheet cho filter, touch target ≥ 44px. Mọi component AI sinh ra phải test ở breakpoint `375px` trước.

> **Nguyên tắc vàng:** Mỗi pixel phải phục vụ quyết định mua. Nếu một thành phần không giúp người dùng tìm — so sánh — hiểu — mua nhanh hơn, thì loại bỏ nó.

---

## 2. Hệ thống thiết kế (Design System)

### 2.1. Bảng màu (Color palette)

Màu thương hiệu chủ đạo là **CAM Daisan** (đỏ cam thương mại), phụ trợ là xám trung tính và xanh. Toàn bộ nền theo hướng **sáng**.

| Vai trò | Token | Hex | Dùng cho |
|---|---|---|---|
| Primary 600 (CAM Daisan) | `primary-600` | `#EA5413` | Nút chính, giá, link nhấn, active state |
| Primary 700 (hover) | `primary-700` | `#C2410C` | Hover nút chính, nhấn mạnh |
| Primary 500 | `primary-500` | `#F97316` | Highlight nhẹ, icon nhấn |
| Primary 100 (nền nhạt) | `primary-100` | `#FFEDD5` | Nền badge, nền section nhấn nhẹ |
| Primary 50 | `primary-50` | `#FFF7ED` | Nền hover hàng table, nền tag |
| Secondary (xám đậm) | `neutral-800` | `#1F2937` | Tiêu đề, chữ chính |
| Neutral 600 | `neutral-600` | `#4B5563` | Chữ phụ, mô tả |
| Neutral 400 | `neutral-400` | `#9CA3AF` | Placeholder, chữ mờ, SKU |
| Neutral 200 (viền) | `neutral-200` | `#E5E7EB` | Border card, divider |
| Neutral 100 (nền) | `neutral-100` | `#F3F4F6` | Nền phụ, skeleton |
| Surface / nền trang | `bg` | `#F8F9FA` | Nền tổng thể trang |
| Trắng | `white` | `#FFFFFF` | Nền card, header, modal |
| Accent (xanh) | `blue-600` | `#2563EB` | Link thông tin, tab phụ, trust badge |
| Success | `success` | `#16A34A` | Còn hàng, đặt thành công, giá giảm |
| Warning | `warning` | `#D97706` | Sắp hết hàng, cảnh báo nhẹ |
| Error | `error` | `#DC2626` | Hết hàng, lỗi form, xóa |
| Info | `info` | `#0891B2` | Thông báo trung tính |

**Cấu hình `tailwind.config.js`** (AI phải dùng cấu hình này làm chuẩn):

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA',
          300: '#FDBA74', 400: '#FB923C', 500: '#F97316',
          600: '#EA5413', // CAM Daisan
          700: '#C2410C', 800: '#9A3412', 900: '#7C2D12',
        },
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#0891B2',
        surface: '#F8F9FA',
      },
      borderRadius: { card: '12px', btn: '8px', pill: '9999px' },
      boxShadow: {
        card: '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        'card-hover': '0 8px 24px rgba(16,24,40,0.12)',
        dropdown: '0 4px 16px rgba(16,24,40,0.12)',
      },
    },
  },
}
```

**Quy tắc dùng màu:**
- Cam Daisan (`primary-600`) **chỉ** dùng cho hành động/giá/điểm nhấn — không bao giờ tô nền cả khối lớn. Tỉ lệ tham chiếu 60-30-10: 60% nền sáng/trắng, 30% xám trung tính, 10% cam.
- Giá luôn dùng `primary-600` + đậm. Giá gạch bỏ (giá gốc) dùng `neutral-400` + `line-through`.
- Semantic màu (success/warning/error) chỉ cho trạng thái, không trang trí.
- Đảm bảo tương phản tối thiểu WCAG AA: chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1.

### 2.2. Typography

**Font:** `Inter` cho UI (đầy đủ ký tự tiếng Việt), fallback `system-ui`. Cho heading marketing có thể dùng `Be Vietnam Pro`. Số/giá dùng `tabular-nums` để thẳng cột.

```css
font-family: 'Inter', 'Be Vietnam Pro', system-ui, -apple-system, sans-serif;
```

**Thang typography (type scale):**

| Token | Size / line-height | Weight | Dùng cho |
|---|---|---|---|
| Display | `36px / 44px` (`text-4xl`) | 700 | Hero landing |
| H1 | `30px / 38px` (`text-3xl`) | 700 | Tiêu đề trang |
| H2 | `24px / 32px` (`text-2xl`) | 700 | Tiêu đề section |
| H3 | `20px / 28px` (`text-xl`) | 600 | Tiêu đề khối, tên SP (chi tiết) |
| Body-lg | `16px / 24px` (`text-base`) | 400/500 | Nội dung chính |
| Body | `14px / 20px` (`text-sm`) | 400 | Mô tả, text bảng, tên SP trong card |
| Caption | `12px / 16px` (`text-xs`) | 400/500 | SKU, label, meta, badge |
| Price | `18-20px` | 700 | Giá sản phẩm |

**Quy tắc:** tối đa 2 font family, tối đa 4 cấp độ đậm (400/500/600/700). Tên sản phẩm trong card giới hạn 2 dòng (`line-clamp-2`). Không dùng chữ ALL CAPS cho đoạn dài, chỉ cho label/badge ngắn.

### 2.3. Spacing (thang 4/8px)

Toàn bộ khoảng cách theo bội số của **4px** (ưu tiên các nấc 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64). Map sang Tailwind: `p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px, `p-6`=24px, `p-8`=32px, `p-12`=48px.

| Ngữ cảnh | Khoảng cách | Tailwind |
|---|---|---|
| Padding trong card | 16px | `p-4` |
| Gap giữa các card (grid) | 16px (mobile) / 24px (desktop) | `gap-4 lg:gap-6` |
| Khoảng cách giữa các section | 48-64px | `py-12 lg:py-16` |
| Padding ngang container | 16px (mobile) / 24-32px (desktop) | `px-4 lg:px-8` |
| Khoảng cách label–input | 8px | `mb-2` |
| Container max-width | 1280px | `max-w-7xl mx-auto` |

### 2.4. Bo góc (Border radius)

| Thành phần | Radius | Tailwind |
|---|---|---|
| Card, modal, panel | 12px | `rounded-xl` |
| Button, input, select | 8px | `rounded-lg` |
| Badge / pill / tag | full | `rounded-full` |
| Ảnh thumbnail trong card | 8px | `rounded-lg` |
| Avatar | full | `rounded-full` |

Nhất quán: **không** trộn nhiều radius khác nhau trong cùng một component.

### 2.5. Shadow (Đổ bóng)

Bóng phải **tinh tế**, chỉ để tách lớp, không "đổ đậm" gây nặng nề.

| Loại | Dùng cho | Tailwind / token |
|---|---|---|
| Card mặc định | Product card, stat card | `shadow-card` |
| Card hover | Card khi hover (nâng nhẹ) | `shadow-card-hover` |
| Dropdown / popover / bottom sheet | Menu, filter, sheet | `shadow-dropdown` |
| Sticky header | Header khi cuộn | `shadow-sm` |
| Phẳng | Trong khối đã có nền | `shadow-none` + `border` |

Ưu tiên kết hợp **border 1px `neutral-200` + shadow nhẹ** thay vì shadow đậm.

### 2.6. Icon (Lucide)

Dùng bộ **Lucide React** (`lucide-react`) cho toàn bộ icon — line icon, đồng nhất stroke. Quy tắc:
- Kích thước chuẩn: `16px` (inline text), `20px` (nút/menu), `24px` (nav/feature).
- Stroke width `1.5`–`2`. Màu kế thừa `currentColor` (dùng `text-*`).
- Icon đi kèm chữ phải căn giữa theo trục dọc (`inline-flex items-center gap-2`).
- Icon thường dùng trong commerce: `Search`, `ShoppingCart`, `Heart`, `Filter`, `SlidersHorizontal`, `ChevronRight`, `Star`, `MapPin`, `Phone`, `Truck`, `Package`, `Tag`, `Store`, `LayoutGrid`, `User`.

```jsx
import { Search, ShoppingCart, Filter } from 'lucide-react';
<Search className="w-5 h-5 text-neutral-600" strokeWidth={1.75} />
```

> Không dùng emoji thay icon. Không trộn nhiều bộ icon (FontAwesome + Lucide). Một dự án — một bộ icon.

---

## 3. Chuẩn Landing Page

Landing page (trang thương hiệu / chiến dịch / giới thiệu hệ thống Daisan) theo bố cục dọc, mỗi section một mục tiêu, CTA rõ ràng. Thứ tự khối khuyến nghị:

1. **Header/Nav** — logo Daisan trái, menu giữa, CTA (Đăng nhập / Báo giá) phải; sticky, nền trắng, `shadow-sm` khi cuộn.
2. **Hero** — tiêu đề lợi ích rõ ràng (`text-4xl font-bold`), mô tả 1–2 dòng, 1 CTA chính cam + 1 CTA phụ outline, ảnh/visual sản phẩm vật liệu bên phải. Mobile xếp dọc.
3. **Trust bar** — logo đối tác / số liệu (số sản phẩm, số nhà cung cấp, số tỉnh phủ).
4. **Danh mục nổi bật** — grid icon/ảnh danh mục vật liệu (gạch ốp lát, thiết bị vệ sinh, sơn...).
5. **Sản phẩm/Ưu đãi nổi bật** — feed product card.
6. **Value props** — 3–4 khối (icon Lucide + tiêu đề + mô tả): giá sỉ, giao tận công trình, tư vấn kỹ thuật.
7. **Social proof** — review/đối tác.
8. **CTA cuối** — dải cam nhạt, 1 CTA mạnh.
9. **Footer** — nhiều cột: danh mục, hỗ trợ, liên hệ, hệ sinh thái Daisan, mạng xã hội.

**Quy tắc landing:** mỗi section đầy đủ trên 1 chiều rộng container `max-w-7xl`, padding dọc `py-12 lg:py-16`, tiêu đề section `text-2xl lg:text-3xl font-bold` căn giữa hoặc trái nhất quán. Hero phải đọc được trong < 5 giây "Daisan bán gì, lợi ích gì, bấm gì".

---

## 4. Chuẩn Marketplace (sàn TMĐT)

Áp dụng cho DaisanStore, DaisanTiles, DaisanDepot, B2B.daisan.vn. Đặc trưng **search-first** và **dày thông tin**.

### 4.1. Header search-first
- Hàng trên: logo trái — **thanh search lớn chiếm trung tâm** (chiếm phần lớn chiều rộng, có nút search cam) — phải: vị trí giao hàng, tài khoản, giỏ hàng (icon + badge số lượng).
- Thanh search có placeholder gợi ý: `"Tìm gạch, thiết bị, vật liệu..."`, hỗ trợ autosuggest dropdown.
- Hàng dưới header: menu danh mục (mega menu) + link nhanh (Khuyến mãi, Giá sỉ, B2B).
- Header **sticky** trên mobile (xem mục 8).

### 4.2. Category grid
Lưới danh mục dạng ô (icon/ảnh + tên), desktop 6–8 cột, tablet 4, mobile 3–4. Mỗi ô bo `rounded-xl`, hover `shadow-card-hover`, nền trắng.

### 4.3. Promo modules
Khối khuyến mãi: banner carousel chính + ô phụ (flash sale, mã giảm, combo). Flash sale có đồng hồ đếm ngược, badge cam. Mỗi module có tiêu đề + link "Xem tất cả".

### 4.4. Product feed
Feed sản phẩm vô hạn / phân trang. Grid: mobile 2 cột, tablet 3, desktop 4–5. Dùng **product card chuẩn** (mục 6). Có skeleton loading khi tải. Header feed có tab/sort nhanh (Phổ biến, Mới, Giá tăng/giảm).

```jsx
// Khung marketplace grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
  {products.map((p) => <ProductCard key={p.id} {...p} />)}
</div>
```

---

## 5. Chuẩn Admin Dashboard

Áp dụng cho trang quản trị (quản lý sản phẩm, đơn hàng, nhà cung cấp, Daisan Ads, báo cáo). Bố cục **sidebar + topbar + content**.

### 5.1. Sidebar (trái)
- Rộng `w-64` (desktop), thu gọn `w-16` (icon-only) trên màn nhỏ.
- Logo trên cùng, nhóm menu có heading nhỏ, item: icon Lucide + label.
- Item active: nền `primary-50`, chữ + icon `primary-600`, bo `rounded-lg`, có thanh nhấn trái.
- Nền trắng hoặc `neutral-800` (dark sidebar) — chọn một chuẩn cho toàn admin.

### 5.2. Topbar
- Breadcrumb / tiêu đề trang trái; phải: search, chuông thông báo, avatar + dropdown tài khoản.
- Cao `h-16`, nền trắng, `border-b border-neutral-200`, sticky.

### 5.3. Stat cards
Hàng KPI 4 thẻ: label nhỏ (`text-sm text-neutral-600`), số lớn (`text-2xl font-bold`), delta % (xanh success/đỏ error + mũi tên), icon trong ô tròn nền `primary-50`.

```jsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="bg-white rounded-xl border border-neutral-200 shadow-card p-5">
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-600">Doanh thu hôm nay</span>
      <span className="p-2 rounded-lg bg-primary-50 text-primary-600">
        <TrendingUp className="w-5 h-5" />
      </span>
    </div>
    <div className="mt-2 text-2xl font-bold tabular-nums text-neutral-800">₫128.500.000</div>
    <div className="mt-1 text-sm text-success font-medium">▲ 12,4% so với hôm qua</div>
  </div>
</div>
```

### 5.4. Data table
- Header bảng nền `neutral-50`, chữ `text-xs font-semibold uppercase text-neutral-500`.
- Hàng: `border-b border-neutral-100`, hover `bg-primary-50/50`, padding `px-4 py-3`, `text-sm`.
- Cột số/giá căn phải + `tabular-nums`. Trạng thái dùng badge semantic.
- Có: ô chọn (checkbox), sticky header, sort theo cột, phân trang dưới, action ẩn hiện theo hàng (icon Edit/Trash).
- Trạng thái rỗng (empty state) và skeleton loading bắt buộc có.

---

## 6. Chuẩn Product Card

Product card là **đơn vị quan trọng nhất** của toàn hệ sinh thái. Phải hiển thị đầy đủ nhưng gọn, dễ scan, touch-friendly. Thành phần bắt buộc (theo thứ tự thị giác):

1. **Ảnh sản phẩm** tỉ lệ vuông (`aspect-square`), `object-cover`, bo `rounded-lg`, có lazy-load + skeleton.
2. **Badge** góc trên trái (Giảm %, Mới, Bán chạy, B2B) — pill cam hoặc semantic. Icon yêu thích góc trên phải.
3. **Tên sản phẩm** 2 dòng (`line-clamp-2`), `text-sm font-medium text-neutral-800`.
4. **SKU / mã** `text-xs text-neutral-400` (dày thông tin cho dân chuyên).
5. **Kích thước / thuộc tính kỹ thuật** (vd `60x60cm · Bóng kiếng`) `text-xs text-neutral-500`.
6. **Giá**: giá hiện tại `primary-600 font-bold`; nếu có giá gốc → gạch bỏ `neutral-400 line-through text-xs`. Khi không niêm yết → hiển thị **"Liên hệ"** thay giá. Hỗ trợ nhãn **"Từ ..."** cho sản phẩm nhiều biến thể.
7. **CTA**: nút "Thêm giỏ" / "Báo giá" (B2B) — nút cam, hoặc icon giỏ. Touch target ≥ 40px.
8. (Tùy chọn) rating sao + số đánh giá, nhãn "Giao nhanh"/"Còn hàng".

### Ví dụ code Product Card (React + Tailwind) — chuẩn dùng ngay:

```jsx
import { ShoppingCart, Heart, Star } from 'lucide-react';

function ProductCard({
  image, name, sku, size, surface, price, originalPrice,
  discount, badge, rating, reviews, isContactPrice, fromLabel,
}) {
  const fmt = (n) => n.toLocaleString('vi-VN') + '₫';

  return (
    <div className="group bg-white rounded-xl border border-neutral-200 shadow-card
                    hover:shadow-card-hover transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Ảnh + badge */}
      <div className="relative aspect-square bg-neutral-100">
        <img src={image} alt={name} loading="lazy"
             className="w-full h-full object-cover" />
        {badge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full
                           bg-primary-600 text-white text-xs font-semibold">
            {badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full
                           bg-error text-white text-xs font-bold">
            -{discount}%
          </span>
        )}
        <button aria-label="Yêu thích"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90
                           text-neutral-500 hover:text-primary-600 shadow-sm">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Nội dung */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">
          {name}
        </h3>
        <p className="text-xs text-neutral-400">SKU: {sku}</p>
        {(size || surface) && (
          <p className="text-xs text-neutral-500">
            {[size, surface].filter(Boolean).join(' · ')}
          </p>
        )}

        {rating != null && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-neutral-700">{rating}</span>
            <span>({reviews})</span>
          </div>
        )}

        {/* Giá */}
        <div className="mt-auto pt-2">
          {isContactPrice ? (
            <span className="text-base font-bold text-primary-600">Liên hệ</span>
          ) : (
            <div className="flex items-baseline gap-2">
              {fromLabel && <span className="text-xs text-neutral-500">Từ</span>}
              <span className="text-lg font-bold text-primary-600 tabular-nums">{fmt(price)}</span>
              {originalPrice && (
                <span className="text-xs text-neutral-400 line-through tabular-nums">
                  {fmt(originalPrice)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <button className="mt-2 inline-flex items-center justify-center gap-1.5
                           w-full h-10 rounded-lg bg-primary-600 text-white text-sm font-semibold
                           hover:bg-primary-700 active:scale-[0.98] transition">
          <ShoppingCart className="w-4 h-4" />
          {isContactPrice ? 'Báo giá' : 'Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
```

---

## 7. Chuẩn Search Page (Trang kết quả tìm kiếm / Danh mục)

Layout: **facet filter (trái) + thanh sort (trên) + result grid (giữa/phải)**. Nguồn dữ liệu thường là Elasticsearch.

### 7.1. Facet filter (sidebar trái — desktop)
- Rộng `w-64`, sticky. Các nhóm facet: Danh mục, Khoảng giá (slider + ô nhập từ–đến), Thương hiệu, Kích thước, Bề mặt, Xuất xứ, Đánh giá, Còn hàng.
- Mỗi facet: tiêu đề `text-sm font-semibold` + danh sách checkbox có **số lượng kết quả** (`Gạch 60x60 (124)`).
- Có nút "Xóa bộ lọc" và hiển thị **chip các filter đang chọn** phía trên kết quả (bấm X để bỏ).

### 7.2. Thanh sort + thông tin
- Trên cùng kết quả: số kết quả (`Tìm thấy 1.248 sản phẩm`), dropdown sort (Liên quan, Bán chạy, Giá ↑, Giá ↓, Mới), toggle xem lưới/danh sách.

### 7.3. Result grid
- Grid product card (mục 6): desktop 3–4 cột (vì có sidebar), mobile 2 cột.
- Có phân trang hoặc infinite scroll, skeleton khi tải, **empty state** rõ ràng ("Không tìm thấy sản phẩm phù hợp — gợi ý bỏ bớt bộ lọc").
- Highlight từ khóa khớp trong tên sản phẩm.

### 7.4. Mobile
Facet ẩn vào **bottom sheet** mở bằng nút "Bộ lọc" (icon `SlidersHorizontal`) + nút "Sắp xếp" — xem mục 8.

---

## 8. Chuẩn Mobile Responsive

Mobile-first là bắt buộc. Breakpoint Tailwind: mặc định = mobile (<640), `sm` 640, `md` 768, `lg` 1024, `xl` 1280.

### 8.1. Sticky search
Header gọn trên mobile: logo nhỏ/biểu tượng + **thanh search chiếm gần hết chiều rộng** + icon giỏ. `sticky top-0 z-40 bg-white shadow-sm`. Thanh search dính khi cuộn để luôn tìm được.

### 8.2. Bottom navigation
Thanh điều hướng dưới cùng cố định, 4–5 mục (Trang chủ, Danh mục, Giỏ, Đơn hàng, Tài khoản). Item active màu `primary-600`. `fixed bottom-0 z-40`, an toàn `pb-[env(safe-area-inset-bottom)]`.

```jsx
<nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-200
                grid grid-cols-5 h-16 pb-[env(safe-area-inset-bottom)] lg:hidden">
  {items.map((it) => (
    <button key={it.label}
      className={`flex flex-col items-center justify-center gap-0.5 text-xs
        ${it.active ? 'text-primary-600' : 'text-neutral-500'}`}>
      <it.icon className="w-5 h-5" />
      {it.label}
    </button>
  ))}
</nav>
```

### 8.3. Grid 2 cột
Mặc định product grid **2 cột** trên mobile (`grid-cols-2`), card thu gọn vẫn đủ ảnh/tên/giá/CTA. Chừa padding dưới `pb-20` để không bị bottom nav che.

### 8.4. Bottom sheet filter
Filter/sort mở dạng **bottom sheet** trượt từ dưới lên (không phải full page). Có overlay mờ, nút đóng, nút "Áp dụng" cố định đáy sheet, `rounded-t-2xl`, `shadow-dropdown`. Cho phép vuốt xuống để đóng.

### 8.5. Quy tắc chung mobile
- Touch target ≥ 44×44px. Khoảng cách giữa nút ≥ 8px.
- Không dùng hover làm cách duy nhất hiển thị thông tin/hành động.
- Chữ tối thiểu 14px nội dung, 12px caption. Không zoom ngang (no horizontal scroll).
- Ảnh responsive, không layout shift (đặt `aspect-ratio` cố định).

---

## 9. Quy định Component (Button / Card / Badge / Form)

### 9.1. Button

| Biến thể | Khi dùng | Class Tailwind |
|---|---|---|
| Primary | Hành động chính (Mua, Thêm giỏ, Lưu) | `inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 transition` |
| Secondary | Hành động phụ | `... h-11 px-5 rounded-lg bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 ...` |
| Outline (cam) | CTA phụ nhấn thương hiệu | `... border border-primary-600 text-primary-600 hover:bg-primary-50 ...` |
| Ghost | Trong toolbar/table | `... text-neutral-600 hover:bg-neutral-100 ...` |
| Danger | Xóa | `... bg-error text-white hover:bg-red-700 ...` |

Kích thước: `sm` `h-9 px-3 text-sm`, `md` `h-11 px-5`, `lg` `h-12 px-6 text-base`. Có trạng thái loading (spinner + disabled). Nút icon-only `w-10 h-10 rounded-lg`.

```jsx
function Button({ variant = 'primary', loading, children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg ' +
               'text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ' +
               'disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500/40';
  const variants = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50',
    outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost:     'text-neutral-600 hover:bg-neutral-100',
    danger:    'bg-error text-white hover:bg-red-700',
  };
  return (
    <button className={`${base} ${variants[variant]}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
}
```

### 9.2. Card
- Cấu trúc: `bg-white rounded-xl border border-neutral-200 shadow-card`.
- Padding nội dung `p-4` (hoặc `p-5` cho dashboard). Hover nâng nhẹ: `hover:shadow-card-hover transition-shadow`.
- Phân vùng bằng `divide-y divide-neutral-100` khi nhiều hàng.
- Không lồng card sâu quá 2 cấp.

### 9.3. Badge
- Pill `rounded-full px-2 py-0.5 text-xs font-semibold inline-flex items-center gap-1`.
- Màu theo ngữ nghĩa: Mới/Khuyến mãi → `bg-primary-100 text-primary-700`; Còn hàng → `bg-green-100 text-success`; Sắp hết → `bg-amber-100 text-warning`; Hết hàng → `bg-red-100 text-error`; B2B/Giá sỉ → `bg-blue-100 text-blue-700`; Trung tính → `bg-neutral-100 text-neutral-600`.
- Badge giảm giá đặc trên ảnh dùng nền đặc (`bg-error text-white`).

### 9.4. Form
- Label `block text-sm font-medium text-neutral-700 mb-1.5`. Bắt buộc đánh dấu `*` đỏ cho trường required.
- Input: `w-full h-11 px-3 rounded-lg border border-neutral-300 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 focus:outline-none`.
- Trạng thái lỗi: `border-error focus:ring-error/30` + dòng lỗi `text-xs text-error mt-1` (kèm icon). Trạng thái disabled: `bg-neutral-100 text-neutral-400`.
- Helper text `text-xs text-neutral-500 mt-1`. Nhóm trường theo cột, gap `gap-4`.
- Select/checkbox/radio dùng cùng radius và màu focus cam. Validate inline, không chỉ báo lỗi khi submit.

```jsx
<div>
  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
    Tên sản phẩm <span className="text-error">*</span>
  </label>
  <input type="text" placeholder="VD: Gạch granite 60x60 bóng kiếng"
    className="w-full h-11 px-3 rounded-lg border border-neutral-300 text-sm
               placeholder:text-neutral-400 focus:border-primary-500
               focus:ring-2 focus:ring-primary-500/30 focus:outline-none" />
  <p className="text-xs text-neutral-500 mt-1">Nhập tên đầy đủ kèm kích thước.</p>
</div>
```

---

## 10. Checklist đánh giá UI trước khi hoàn thành

AI **phải** tự rà soát toàn bộ checklist này trước khi báo "hoàn thành" một màn hình:

- [ ] Dùng đúng **cam Daisan `#EA5413`** cho điểm nhấn/giá/CTA; không lạm dụng tô nền cam khối lớn.
- [ ] Nền sáng (`#FFFFFF`/`#F8F9FA`), tuân thủ tỉ lệ màu 60-30-10.
- [ ] Typography đúng thang (H1/H2/H3/body/caption), tối đa 2 font, dùng `Inter`, hỗ trợ tiếng Việt.
- [ ] Spacing theo thang 4/8px; padding/gap nhất quán; container `max-w-7xl`.
- [ ] Bo góc nhất quán (`rounded-xl` card, `rounded-lg` button/input, `rounded-full` badge).
- [ ] Shadow tinh tế (`shadow-card`), kết hợp border `neutral-200`; không bóng đậm thô.
- [ ] Icon dùng **Lucide**, kích thước/stroke đồng nhất, không emoji, không trộn bộ icon.
- [ ] **Mobile-first**: kiểm tra ở `375px` — không tràn ngang, không layout shift.
- [ ] Có **sticky search**, **bottom nav**, **grid 2 cột mobile**, **bottom sheet filter** (với marketplace/search).
- [ ] Product card đủ trường: ảnh, badge, tên (line-clamp-2), SKU, kích thước, giá/"Liên hệ"/"Từ", CTA.
- [ ] Giá dùng `primary-600` + đậm + `tabular-nums`; giá gốc gạch bỏ đúng.
- [ ] Button có đủ trạng thái: hover, active, disabled, loading; touch target ≥ 44px.
- [ ] Form có label, required `*`, focus ring cam, lỗi inline, helper text, disabled.
- [ ] Có **loading skeleton**, **empty state**, và xử lý lỗi cho dữ liệu động.
- [ ] Phân cấp thị giác rõ — màn hình **scan được trong 5 giây** (giá, CTA, trạng thái nổi bật).
- [ ] Tương phản đạt **WCAG AA** (≥4.5:1 chữ thường); ảnh có `alt`; nút icon có `aria-label`.
- [ ] Có `focus:ring` cho điều hướng bàn phím; thứ tự tab hợp lý.
- [ ] Không hardcode chuỗi giao diện rải rác; định dạng tiền tệ `vi-VN` (`128.500.000₫`).
- [ ] Đồng bộ thương hiệu Daisan trên mọi hệ (Store/Tiles/Depot/B2B/Admin).

---

## AI PHẢI LÀM

- [ ] Luôn dùng **cam Daisan `#EA5413`** (`primary-600`) làm màu hành động/giá/điểm nhấn và cấu hình token màu trong `tailwind.config.js` như mục 2.1.
- [ ] **Thiết kế mobile-first**, viết class mặc định cho mobile rồi thêm `md:`/`lg:`; bắt buộc sticky search + bottom nav + grid 2 cột + bottom sheet filter cho commerce.
- [ ] Dùng **product card chuẩn** (mục 6) với đầy đủ ảnh, badge, tên `line-clamp-2`, SKU, kích thước, giá/"Liên hệ"/"Từ", CTA — cho mọi danh sách sản phẩm.
- [ ] Tuân thủ **spacing 4/8px**, bo góc, shadow, typography, icon Lucide theo design system; giữ nhất quán toàn dự án.
- [ ] Đảm bảo **dày thông tin nhưng dễ scan**: phân cấp thị giác rõ, giá nổi bật, badge phân loại, alignment theo lưới.
- [ ] Thêm đầy đủ **loading skeleton, empty state, error state** và định dạng tiền tệ `vi-VN`.
- [ ] Đảm bảo **accessibility**: `alt` ảnh, `aria-label` nút icon, focus ring, tương phản WCAG AA, touch target ≥ 44px.
- [ ] Tự chạy **Checklist mục 10** trước khi báo hoàn thành; sửa hết mục chưa đạt.

## AI KHÔNG ĐƯỢC LÀM

- [ ] Không dùng màu thương hiệu **sai lệch** (cam khác hex, tím/xanh lá làm primary) hay tô nền cam cả khối lớn gây chói.
- [ ] Không thiết kế **desktop-only** rồi nhồi xuống mobile; không để tràn ngang / layout shift trên `375px`.
- [ ] Không tạo product card **thiếu trường** bắt buộc (thiếu SKU, kích thước, hoặc bỏ "Liên hệ" khi không có giá).
- [ ] Không dùng **emoji thay icon**, không trộn nhiều bộ icon, không dùng icon kích thước/stroke lộn xộn.
- [ ] Không lạm dụng **shadow đậm, gradient lòe loẹt, animation thừa** làm chậm và rối giao diện.
- [ ] Không dùng **font quá 2 family**, quá 4 cấp weight, hay font không hỗ trợ tiếng Việt.
- [ ] Không bỏ qua **trạng thái** (hover/active/disabled/loading/empty/error) và validate form inline.
- [ ] Không **hardcode** giá trị spacing/màu tùy tiện ngoài thang design system; không quên `aria-label`/`alt`/focus ring.
- [ ] Không tự ý phá vỡ **nhất quán thương hiệu** giữa các hệ thống Daisan (Store/Tiles/Depot/B2B/Admin/News).
