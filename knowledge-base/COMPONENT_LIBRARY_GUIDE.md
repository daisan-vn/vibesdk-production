# COMPONENT_LIBRARY_GUIDE.md — Thư viện Component chuẩn Daisan.ai

> **Mục đích:** Tài liệu này là nguồn chân lý duy nhất (single source of truth) về thư viện component dùng chung cho toàn bộ hệ sinh thái Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, Daisan Ads, B2B.daisan.vn, News.daisan.vn). Khi Daisan.ai sinh code, **bắt buộc** tái sử dụng các component trong tài liệu này thay vì viết lại từ đầu, để bảo đảm tính đồng nhất (design token, màu CAM Daisan), khả năng truy cập (accessibility) cơ bản và responsive. Tài liệu mô tả chi tiết 20 component lõi: mục đích, props chính, biến thể/states, ví dụ React + Tailwind, và lưu ý áp dụng cho ngành gạch ốp lát / vật liệu xây dựng.

---

## 0. Nguyên tắc nền tảng

### 0.1. Design Token (token màu & spacing)

Mọi component **không được hardcode** mã màu hex rời rạc. Phải dùng token Tailwind định nghĩa trong `tailwind.config.js`:

```js
// tailwind.config.js — token thương hiệu Daisan
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF3ED', 100: '#FFE2D1', 200: '#FFC2A3',
          500: '#F4511E', // CAM Daisan chủ đạo (đỏ cam thương mại)
          600: '#E0451A', 700: '#B8380F', 900: '#7A2509',
        },
        neutral: { // xám trung tính (phụ)
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0',
          400: '#94A3B8', 500: '#64748B', 700: '#334155', 900: '#0F172A',
        },
        accent: { 500: '#2563EB' }, // xanh (phụ) cho link/info
        success: '#16A34A', warning: '#F59E0B', danger: '#DC2626',
      },
      borderRadius: { card: '0.75rem', btn: '0.5rem' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
};
```

| Token | Giá trị | Dùng cho |
|---|---|---|
| `primary-500` | `#F4511E` | Nút chính, link hành động, highlight giá, badge khuyến mãi |
| `primary-600` | `#E0451A` | Hover của nút chính |
| `neutral-700` | `#334155` | Text chính |
| `neutral-500` | `#64748B` | Text phụ, placeholder |
| `neutral-200` | `#E2E8F0` | Đường viền, divider |
| `success` / `warning` / `danger` | xanh / vàng / đỏ | Trạng thái tồn kho, badge cảnh báo |

### 0.2. Quy ước đặt tên

- **Component:** `PascalCase` — `ProductCard.tsx`, `FilterSidebar.tsx`.
- **Props interface:** `<Tên>Props` — `ProductCardProps`.
- **File 1 component/1 file**, tên file = tên component.
- **Biến thể (variant):** dùng prop `variant` với union type, không tạo nhiều component trùng lặp.
- **Boolean prop:** dạng khẳng định — `isLoading`, `disabled`, `selected` (không dùng `notDisabled`).
- **Sự kiện:** tiền tố `on` — `onClick`, `onSelect`, `onPageChange`.
- **CSS class merge:** dùng helper `cn()` (clsx + tailwind-merge) để gộp class an toàn.

```ts
// src/lib/cn.ts
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

### 0.3. Cấu trúc thư mục components

```
src/
├── components/
│   ├── ui/                 # Primitive tái sử dụng toàn hệ thống
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchBar.tsx
│   │   └── index.ts        # barrel export
│   ├── layout/             # Khung trang
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── commerce/           # Đặc thù nghiệp vụ thương mại / gạch
│   │   ├── ProductCard.tsx
│   │   ├── ShopCard.tsx
│   │   ├── CategoryGrid.tsx
│   │   └── FilterSidebar.tsx
│   ├── dashboard/          # Quản trị / báo cáo
│   │   ├── DashboardCard.tsx
│   │   ├── StatCard.tsx
│   │   └── ChartCard.tsx
│   ├── data/               # Hiển thị dữ liệu
│   │   ├── DataTable.tsx
│   │   ├── Form.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   └── ErrorState.tsx
├── lib/
│   └── cn.ts
└── hooks/
```

---

## Mục lục component

| # | Component | Nhóm | Mục đích ngắn |
|---|---|---|---|
| 1 | [Header](#1-header) | layout | Thanh điều hướng đầu trang |
| 2 | [Footer](#2-footer) | layout | Chân trang, liên kết, liên hệ |
| 3 | [Sidebar](#3-sidebar) | layout | Menu dọc quản trị / danh mục |
| 4 | [ProductCard](#4-productcard) | commerce | Thẻ sản phẩm gạch / vật liệu |
| 5 | [ShopCard](#5-shopcard) | commerce | Thẻ nhà cung cấp / showroom |
| 6 | [DashboardCard](#6-dashboardcard) | dashboard | Khối nội dung dashboard |
| 7 | [StatCard](#7-statcard) | dashboard | Chỉ số KPI |
| 8 | [SearchBar](#8-searchbar) | ui | Ô tìm kiếm có gợi ý |
| 9 | [CategoryGrid](#9-categorygrid) | commerce | Lưới danh mục ngành |
| 10 | [DataTable](#10-datatable) | data | Bảng dữ liệu có sort/select |
| 11 | [Form](#11-form) | data | Bố cục form + field |
| 12 | [Modal](#12-modal) | ui | Hộp thoại overlay |
| 13 | [Button](#13-button) | ui | Nút hành động |
| 14 | [Badge](#14-badge) | ui | Nhãn trạng thái |
| 15 | [Tabs](#15-tabs) | ui | Chuyển tab nội dung |
| 16 | [Pagination](#16-pagination) | ui | Phân trang |
| 17 | [FilterSidebar](#17-filtersidebar) | commerce | Bộ lọc sản phẩm |
| 18 | [ChartCard](#18-chartcard) | dashboard | Thẻ chứa biểu đồ |
| 19 | [EmptyState](#19-emptystate) | data | Trạng thái rỗng |
| 20 | [LoadingState](#20-loadingstate) | data | Trạng thái đang tải |
| 21 | [ErrorState](#21-errorstate) | data | Trạng thái lỗi |

---

## 1. Header

**Mục đích:** Thanh điều hướng cố định đầu trang, chứa logo Daisan, ô tìm kiếm, menu danh mục, giỏ hàng và tài khoản. Dùng chung cho mặt tiền TMĐT (DaisanStore, DaisanTiles) và cổng tìm kiếm (Daisan.vn).

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `logoSrc` | `string` | — | Đường dẫn logo thương hiệu |
| `nav` | `NavItem[]` | `[]` | Danh sách mục menu chính |
| `onSearch` | `(q: string) => void` | — | Callback khi submit tìm kiếm |
| `cartCount` | `number` | `0` | Số sản phẩm trong giỏ |
| `user` | `User \| null` | `null` | Thông tin người dùng đăng nhập |
| `variant` | `'store' \| 'b2b' \| 'admin'` | `'store'` | Ngữ cảnh giao diện |
| `sticky` | `boolean` | `true` | Ghim đầu trang khi cuộn |

### Biến thể / States

- **variant:** `store` (mặt tiền B2C), `b2b` (thêm nút báo giá, ẩn giá lẻ), `admin` (thu gọn, không có giỏ hàng).
- **States:** mặc định, đã đăng nhập (hiện avatar), đang cuộn (shadow), mobile (menu hamburger mở/đóng).

### Ví dụ code

```tsx
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { SearchBar } from '@/components/ui/SearchBar';

interface NavItem { label: string; href: string }
interface HeaderProps {
  logoSrc: string;
  nav?: NavItem[];
  cartCount?: number;
  onSearch?: (q: string) => void;
  sticky?: boolean;
}

export function Header({ logoSrc, nav = [], cartCount = 0, onSearch, sticky = true }: HeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className={cn('w-full bg-white border-b border-neutral-200 z-40', sticky && 'sticky top-0')}>
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
        <a href="/" className="shrink-0"><img src={logoSrc} alt="Daisan" className="h-8" /></a>
        <div className="hidden md:block flex-1 max-w-xl">
          <SearchBar placeholder="Tìm gạch, vật liệu, nhà cung cấp..." onSearch={onSearch} />
        </div>
        <nav aria-label="Menu chính" className="hidden lg:flex items-center gap-5 ml-auto">
          {nav.map((it) => (
            <a key={it.href} href={it.href} className="text-sm text-neutral-700 hover:text-primary-500">{it.label}</a>
          ))}
        </nav>
        <a href="/cart" className="relative ml-2" aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}>
          <span className="i-cart text-2xl text-neutral-700" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 grid place-items-center">{cartCount}</span>
          )}
        </a>
        <button className="lg:hidden" aria-label="Mở menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      </div>
    </header>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Header B2B nên có nút **"Yêu cầu báo giá sỉ"** nổi bật (DaisanDepot) thay cho "Thêm giỏ hàng".
- Ô tìm kiếm phải hỗ trợ tìm theo **mã sản phẩm (SKU), kích thước (60x60, 80x80), bề mặt (bóng/mờ/granito)** — kết nối Elasticsearch của Daisan.vn.
- Menu danh mục cấp 1 nên phản ánh nhóm ngành: Gạch ốp lát, Gạch ngoại thất, Thiết bị vệ sinh, Vật liệu thô.

---

## 2. Footer

**Mục đích:** Chân trang chứa cột liên kết, thông tin doanh nghiệp, kênh liên hệ, đăng ký nhận tin, chứng nhận. Bổ trợ SEO bằng internal link tới danh mục lớn.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `columns` | `FooterColumn[]` | `[]` | Các cột liên kết |
| `company` | `CompanyInfo` | — | Tên, MST, địa chỉ, hotline |
| `socials` | `SocialLink[]` | `[]` | Liên kết mạng xã hội |
| `showNewsletter` | `boolean` | `true` | Hiện ô đăng ký email |

### Biến thể / States

- **variant:** `full` (nhiều cột, mặt tiền), `compact` (1 dòng cho trang quản trị / landing).
- **States:** đăng ký newsletter (idle / submitting / success).

### Ví dụ code

```tsx
interface FooterColumn { title: string; links: { label: string; href: string }[] }
interface FooterProps { columns: FooterColumn[]; hotline?: string; showNewsletter?: boolean }

export function Footer({ columns, hotline = '1900 xxxx', showNewsletter = true }: FooterProps) {
  return (
    <footer className="bg-neutral-900 text-neutral-200 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 md:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-white mb-3">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}><a href={l.href} className="text-sm hover:text-primary-500">{l.label}</a></li>
              ))}
            </ul>
          </div>
        ))}
        {showNewsletter && (
          <form className="md:col-span-1" onSubmit={(e) => e.preventDefault()}>
            <h3 className="text-sm font-semibold text-white mb-3">Nhận báo giá & khuyến mãi</h3>
            <div className="flex gap-2">
              <input type="email" required aria-label="Email" placeholder="Email của bạn"
                className="flex-1 rounded-btn px-3 py-2 text-sm text-neutral-900" />
              <button className="bg-primary-500 hover:bg-primary-600 text-white rounded-btn px-4 text-sm">Đăng ký</button>
            </div>
          </form>
        )}
      </div>
      <div className="border-t border-neutral-700 py-4 text-center text-xs">
        Hotline: <span className="text-primary-500 font-medium">{hotline}</span> · © Daisan
      </div>
    </footer>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Bắt buộc hiển thị **hotline tư vấn kỹ thuật** và **chính sách vận chuyển vật liệu nặng** (gạch theo pallet/m²).
- Cột liên kết nên dẫn tới trang **hệ thống showroom DaisanTiles** và **kho DaisanDepot** theo khu vực để hỗ trợ SEO địa phương.

---

## 3. Sidebar

**Mục đích:** Menu điều hướng dọc cho khu vực quản trị (Daisan AI admin, Daisan Ads) hoặc menu danh mục thu gọn ở mặt tiền. Hỗ trợ collapse, nhóm mục, badge số liệu.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `items` | `SidebarItem[]` | `[]` | Cấu trúc menu (có thể lồng) |
| `activeKey` | `string` | — | Mục đang chọn |
| `collapsed` | `boolean` | `false` | Thu gọn còn icon |
| `onNavigate` | `(key: string) => void` | — | Callback khi chọn mục |

### Biến thể / States

- **States:** active (nền `primary-50`, chữ `primary-600`), hover, collapsed (chỉ icon + tooltip), nhóm mở/đóng.
- **Responsive:** mobile chuyển thành drawer overlay.

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface SidebarItem { key: string; label: string; icon?: React.ReactNode; badge?: number }
interface SidebarProps { items: SidebarItem[]; activeKey?: string; collapsed?: boolean; onNavigate?: (k: string) => void }

export function Sidebar({ items, activeKey, collapsed = false, onNavigate }: SidebarProps) {
  return (
    <nav aria-label="Điều hướng quản trị"
      className={cn('h-full bg-white border-r border-neutral-200 py-4', collapsed ? 'w-16' : 'w-60')}>
      <ul className="space-y-1 px-2">
        {items.map((it) => {
          const active = it.key === activeKey;
          return (
            <li key={it.key}>
              <button onClick={() => onNavigate?.(it.key)}
                aria-current={active ? 'page' : undefined}
                className={cn('w-full flex items-center gap-3 rounded-btn px-3 py-2 text-sm',
                  active ? 'bg-primary-50 text-primary-600 font-medium' : 'text-neutral-700 hover:bg-neutral-100')}>
                <span className="shrink-0">{it.icon}</span>
                {!collapsed && <span className="flex-1 text-left">{it.label}</span>}
                {!collapsed && it.badge ? (
                  <span className="bg-primary-500 text-white text-xs rounded-full px-2">{it.badge}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Sidebar quản trị nên nhóm theo nghiệp vụ: **Sản phẩm/Catalog, Đơn hàng, Kho (đồng bộ Odoo), Báo cáo, Quảng cáo (Ads), Nội dung (Drupal/News)**.
- Badge số liệu (đơn chờ xử lý, hàng sắp hết) phải lấy realtime để đội vận hành kho gạch theo dõi.

---

## 4. ProductCard

**Mục đích:** Thẻ hiển thị một sản phẩm gạch/vật liệu trong lưới kết quả: ảnh, tên, mã, giá (lẻ/sỉ), thuộc tính nhanh (kích thước, bề mặt), trạng thái tồn kho và nút hành động.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `product` | `Product` | — | Dữ liệu sản phẩm |
| `priceMode` | `'retail' \| 'wholesale'` | `'retail'` | Hiển thị giá lẻ hay sỉ |
| `onAddToCart` | `(id: string) => void` | — | Thêm vào giỏ |
| `onQuickView` | `(id: string) => void` | — | Xem nhanh |
| `badge` | `string` | — | Nhãn ("Mới", "-15%") |

### Biến thể / States

- **variant:** `grid` (dọc, lưới), `list` (ngang, có mô tả dài).
- **States:** mặc định, hover (nâng shadow, hiện nút), hết hàng (làm mờ + badge "Hết hàng"), đang thêm giỏ (spinner trên nút).

### Ví dụ code

```tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface Product {
  id: string; name: string; sku: string; image: string;
  price: number; wholesalePrice?: number; unit: string; // 'm²' | 'viên' | 'thùng'
  size?: string; surface?: string; inStock: boolean;
}
interface ProductCardProps {
  product: Product; priceMode?: 'retail' | 'wholesale';
  onAddToCart?: (id: string) => void; badge?: string;
}

export function ProductCard({ product, priceMode = 'retail', onAddToCart, badge }: ProductCardProps) {
  const price = priceMode === 'wholesale' ? product.wholesalePrice ?? product.price : product.price;
  return (
    <article className={cn('group rounded-card border border-neutral-200 bg-white overflow-hidden transition hover:shadow-md',
      !product.inStock && 'opacity-60')}>
      <div className="relative aspect-square bg-neutral-50">
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {badge && <Badge variant="promo" className="absolute top-2 left-2">{badge}</Badge>}
        {!product.inStock && <Badge variant="danger" className="absolute top-2 right-2">Hết hàng</Badge>}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs text-neutral-500">Mã: {product.sku}</p>
        <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">{product.name}</h3>
        <div className="flex flex-wrap gap-1 text-xs text-neutral-500">
          {product.size && <span className="rounded bg-neutral-100 px-1.5">{product.size}</span>}
          {product.surface && <span className="rounded bg-neutral-100 px-1.5">{product.surface}</span>}
        </div>
        <p className="text-primary-600 font-semibold">
          {price.toLocaleString('vi-VN')}đ<span className="text-xs text-neutral-500 font-normal">/{product.unit}</span>
        </p>
        <Button size="sm" disabled={!product.inStock} onClick={() => onAddToCart?.(product.id)} className="w-full mt-1">
          {priceMode === 'wholesale' ? 'Thêm báo giá' : 'Thêm vào giỏ'}
        </Button>
      </div>
    </article>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Đơn vị tính **bắt buộc** hiển thị (m², viên, thùng, pallet) vì gạch bán theo m² nhưng đóng gói theo thùng — tránh nhầm lẫn khi đặt hàng.
- Với B2B nên hiện **giá sỉ theo bậc số lượng** và nút "Yêu cầu báo giá" thay vì giá cố định.
- Thuộc tính nhanh (kích thước, bề mặt, độ hút nước) lấy từ catalog Daisan.vn để người dùng so sánh nhanh trong lưới.

---

## 5. ShopCard

**Mục đích:** Thẻ giới thiệu nhà cung cấp / showroom / cửa hàng trong marketplace: logo, tên, đánh giá, khu vực, số sản phẩm, nút theo dõi.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `shop` | `Shop` | — | Dữ liệu cửa hàng |
| `onFollow` | `(id: string) => void` | — | Theo dõi shop |
| `verified` | `boolean` | `false` | Đã xác minh |

### Biến thể / States

- **States:** mặc định, đã theo dõi (nút đổi "Đang theo dõi"), verified (huy hiệu xác minh).

### Ví dụ code

```tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Shop { id: string; name: string; logo: string; rating: number; productCount: number; region: string; verified?: boolean }
export function ShopCard({ shop, onFollow }: { shop: Shop; onFollow?: (id: string) => void }) {
  return (
    <article className="rounded-card border border-neutral-200 bg-white p-4 flex items-center gap-4">
      <img src={shop.logo} alt={shop.name} className="h-14 w-14 rounded-full object-cover border border-neutral-200" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-neutral-900 truncate">{shop.name}</h3>
          {shop.verified && <Badge variant="success">Đã xác minh</Badge>}
        </div>
        <p className="text-xs text-neutral-500">★ {shop.rating.toFixed(1)} · {shop.productCount} sản phẩm · {shop.region}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => onFollow?.(shop.id)}>Theo dõi</Button>
    </article>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Hiển thị **khu vực kho/showroom** rõ ràng vì chi phí vận chuyển vật liệu nặng phụ thuộc khoảng cách.
- Huy hiệu "Đã xác minh" áp dụng cho nhà cung cấp/đại lý chính hãng đã được DaisanDepot kiểm duyệt.

---

## 6. DashboardCard

**Mục đích:** Khối container chung trong dashboard, đóng gói tiêu đề, hành động góc phải và nội dung. Là nền cho StatCard/ChartCard và mọi widget quản trị.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `title` | `string` | — | Tiêu đề khối |
| `action` | `React.ReactNode` | — | Nút/menu góc phải |
| `padding` | `'none' \| 'md'` | `'md'` | Đệm nội dung |
| `children` | `React.ReactNode` | — | Nội dung |

### Biến thể / States

- **States:** loading (skeleton), có/không action, padding tuỳ biến (none cho bảng full-width).

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface DashboardCardProps { title?: string; action?: React.ReactNode; padding?: 'none' | 'md'; children: React.ReactNode }
export function DashboardCard({ title, action, padding = 'md', children }: DashboardCardProps) {
  return (
    <section className="rounded-card border border-neutral-200 bg-white">
      {(title || action) && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          {title && <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>}
          {action}
        </header>
      )}
      <div className={cn(padding === 'md' && 'p-4')}>{children}</div>
    </section>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Dùng DashboardCard làm vỏ thống nhất cho các widget: **tồn kho theo kho**, **đơn hàng theo showroom**, **hiệu suất chiến dịch Ads** — bảo đảm mọi widget cùng bo góc, viền, khoảng cách.

---

## 7. StatCard

**Mục đích:** Hiển thị một chỉ số KPI: nhãn, giá trị lớn, biến động (%) so với kỳ trước, icon. Dùng ở hàng đầu mọi dashboard.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `label` | `string` | — | Tên chỉ số |
| `value` | `string \| number` | — | Giá trị |
| `delta` | `number` | — | % biến động (âm/dương) |
| `icon` | `React.ReactNode` | — | Icon minh hoạ |
| `tone` | `'default' \| 'success' \| 'danger'` | `'default'` | Sắc thái |

### Biến thể / States

- **States:** tăng (mũi tên lên, xanh), giảm (mũi tên xuống, đỏ), loading (skeleton).

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface StatCardProps { label: string; value: string | number; delta?: number; icon?: React.ReactNode }
export function StatCard({ label, value, delta, icon }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-card border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        {icon && <span className="text-primary-500">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
      {delta !== undefined && (
        <p className={cn('mt-1 text-xs font-medium', up ? 'text-success' : 'text-danger')}>
          {up ? '▲' : '▼'} {Math.abs(delta)}% so với kỳ trước
        </p>
      )}
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- KPI phù hợp ngành: **Doanh thu theo m² bán ra, Tỷ lệ huỷ đơn vận chuyển, Tồn kho sắp hết (theo mã gạch), GMV theo showroom**.
- Giá trị tiền tệ luôn format `toLocaleString('vi-VN')` kèm "đ".

---

## 8. SearchBar

**Mục đích:** Ô tìm kiếm có debounce, gợi ý (autocomplete) và nút submit. Trung tâm trải nghiệm của Daisan.vn (kết nối Elasticsearch).

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `placeholder` | `string` | `'Tìm kiếm...'` | Gợi ý nhập |
| `onSearch` | `(q: string) => void` | — | Submit |
| `onChange` | `(q: string) => void` | — | Thay đổi (debounced) |
| `suggestions` | `string[]` | `[]` | Danh sách gợi ý |
| `loading` | `boolean` | `false` | Đang lấy gợi ý |

### Biến thể / States

- **States:** rỗng, đang nhập, có dropdown gợi ý, loading, không kết quả.

### Ví dụ code

```tsx
import { useState } from 'react';
interface SearchBarProps {
  placeholder?: string; suggestions?: string[];
  onSearch?: (q: string) => void; onChange?: (q: string) => void;
}
export function SearchBar({ placeholder = 'Tìm kiếm...', suggestions = [], onSearch, onChange }: SearchBarProps) {
  const [q, setQ] = useState('');
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); onSearch?.(q); }} className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); onChange?.(e.target.value); }}
        placeholder={placeholder}
        aria-label="Ô tìm kiếm"
        className="w-full rounded-btn border border-neutral-200 pl-4 pr-10 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button type="submit" aria-label="Tìm" className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">🔍</button>
      {q && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full rounded-btn border border-neutral-200 bg-white shadow-lg max-h-72 overflow-auto">
          {suggestions.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => { setQ(s); onSearch?.(s); }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-neutral-100">{s}</button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Gợi ý phải bao gồm: **mã SKU, tên thương mại, kích thước, hệ gạch (porcelain/ceramic), nhà cung cấp** — index Elasticsearch theo các field này.
- Hỗ trợ tìm không dấu và lỗi chính tả phổ biến (vd "granite" / "granito"); debounce 250–300ms để giảm tải truy vấn.

---

## 9. CategoryGrid

**Mục đích:** Lưới các danh mục ngành hàng dạng icon/ảnh + tên, giúp người dùng điều hướng nhanh tới nhóm sản phẩm.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `categories` | `Category[]` | `[]` | Danh sách danh mục |
| `columns` | `number` | `6` | Số cột desktop |
| `onSelect` | `(slug: string) => void` | — | Chọn danh mục |

### Biến thể / States

- **States:** mặc định, hover (nâng nền `primary-50`), loading (skeleton ô vuông).

### Ví dụ code

```tsx
interface Category { slug: string; name: string; image: string; count?: number }
export function CategoryGrid({ categories, columns = 6, onSelect }: { categories: Category[]; columns?: number; onSelect?: (s: string) => void }) {
  return (
    <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3" style={{ ['--cols' as any]: columns }}>
      {categories.map((c) => (
        <li key={c.slug}>
          <button onClick={() => onSelect?.(c.slug)}
            className="w-full rounded-card border border-neutral-200 bg-white p-4 text-center hover:bg-primary-50 hover:border-primary-200 transition">
            <img src={c.image} alt="" className="mx-auto h-14 w-14 object-contain" />
            <p className="mt-2 text-sm font-medium text-neutral-800">{c.name}</p>
            {c.count !== undefined && <p className="text-xs text-neutral-500">{c.count} SP</p>}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Danh mục cấp 1 nên đồng bộ với cây catalog Odoo: **Gạch lát nền, Gạch ốp tường, Gạch ngoại thất, Gạch trang trí, Keo/Ron, Thiết bị vệ sinh**.
- Hình minh hoạ nên dùng ảnh bề mặt gạch thực tế để người dùng nhận diện vân/màu nhanh.

---

## 10. DataTable

**Mục đích:** Bảng dữ liệu quản trị có cột tuỳ biến, sort, chọn dòng, trạng thái rỗng/loading. Dùng cho danh sách sản phẩm, đơn hàng, tồn kho.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `columns` | `Column<T>[]` | — | Định nghĩa cột |
| `data` | `T[]` | `[]` | Dữ liệu dòng |
| `loading` | `boolean` | `false` | Đang tải |
| `selectable` | `boolean` | `false` | Cho chọn dòng |
| `onSort` | `(key, dir) => void` | — | Sắp xếp |
| `rowKey` | `(row: T) => string` | — | Khoá dòng |

### Biến thể / States

- **States:** loading (LoadingState lồng), rỗng (EmptyState), có dữ liệu, đã chọn (highlight dòng), sort tăng/giảm.

### Ví dụ code

```tsx
import { LoadingState } from '@/components/data/LoadingState';
import { EmptyState } from '@/components/data/EmptyState';

interface Column<T> { key: string; header: string; render?: (row: T) => React.ReactNode; sortable?: boolean }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; rowKey: (r: T) => string }

export function DataTable<T>({ columns, data, loading, rowKey }: DataTableProps<T>) {
  if (loading) return <LoadingState variant="table" />;
  if (!data.length) return <EmptyState title="Chưa có dữ liệu" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-3 py-2 font-medium whitespace-nowrap">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={rowKey(row)} className="border-b border-neutral-100 hover:bg-neutral-50">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2">{c.render ? c.render(row) : (row as any)[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Bảng tồn kho phải hỗ trợ **cột số lượng theo đơn vị kép** (m² và thùng) và cảnh báo màu khi dưới ngưỡng đặt hàng.
- Bảng đơn hàng cần cột **kho xuất / showroom** và trạng thái vận chuyển vật liệu nặng; bật `overflow-x-auto` để không vỡ layout trên mobile.

---

## 11. Form

**Mục đích:** Bố cục form chuẩn: label, field, mô tả, lỗi validation, nút submit. Đồng nhất khoảng cách và accessibility (liên kết label–input, thông báo lỗi).

### Props chính (FormField)

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `label` | `string` | — | Nhãn field |
| `name` | `string` | — | Tên trường |
| `required` | `boolean` | `false` | Bắt buộc |
| `error` | `string` | — | Thông báo lỗi |
| `hint` | `string` | — | Mô tả phụ |
| `children` | `React.ReactNode` | — | Input/select |

### Biến thể / States

- **States:** mặc định, focus (ring `primary-500`), error (viền `danger` + message), disabled.

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface FieldProps { label: string; name: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }
export function FormField({ label, name, required, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p id={`${name}-error`} className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export const inputClass = (hasError?: boolean) => cn(
  'w-full rounded-btn border px-3 py-2 text-sm focus:outline-none focus:ring-2',
  hasError ? 'border-danger focus:ring-danger' : 'border-neutral-200 focus:ring-primary-500'
);

// Sử dụng:
// <FormField label="Mã sản phẩm" name="sku" required error={errors.sku}>
//   <input id="sku" name="sku" aria-invalid={!!errors.sku} aria-describedby="sku-error" className={inputClass(!!errors.sku)} />
// </FormField>
```

### Lưu ý cho Daisan (ngành gạch)

- Form tạo sản phẩm gạch cần field đặc thù: **kích thước, độ dày, bề mặt, độ hút nước, hệ màu, đơn vị/thùng (m²/thùng)** — đồng bộ schema với Odoo.
- Form báo giá B2B: validate số lượng tối thiểu theo bậc sỉ; hiển thị lỗi rõ ràng kèm `aria-describedby`.

---

## 12. Modal

**Mục đích:** Hộp thoại overlay cho xác nhận, form nhanh, xem chi tiết. Có quản lý focus, đóng bằng Esc và click backdrop.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `open` | `boolean` | — | Hiển thị |
| `onClose` | `() => void` | — | Đóng |
| `title` | `string` | — | Tiêu đề |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước |
| `footer` | `React.ReactNode` | — | Khu vực nút |

### Biến thể / States

- **States:** mở/đóng (fade + scale), kích thước, có/không footer.
- **A11y:** `role="dialog"`, `aria-modal`, đóng bằng Esc, trap focus, trả focus về trigger.

### Ví dụ code

```tsx
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
interface ModalProps { open: boolean; onClose: () => void; title?: string; size?: 'sm' | 'md' | 'lg'; footer?: React.ReactNode; children: React.ReactNode }
const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

export function Modal({ open, onClose, title, size = 'md', footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={cn('relative w-full rounded-card bg-white shadow-xl', sizes[size])}>
        <header className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          <button onClick={onClose} aria-label="Đóng" className="text-neutral-500 hover:text-neutral-900">✕</button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-5 py-3 border-t border-neutral-200">{footer}</footer>}
      </div>
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Modal "Xem nhanh sản phẩm" nên hiển thị thư viện ảnh bề mặt + bảng thông số kỹ thuật; modal xác nhận xoá đơn/sản phẩm phải dùng nút `danger`.

---

## 13. Button

**Mục đích:** Nút hành động cơ bản, nền tảng cho mọi tương tác. Chuẩn hoá variant, size, trạng thái loading/disabled.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `variant` | `'primary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Kiểu nút |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước |
| `isLoading` | `boolean` | `false` | Hiện spinner |
| `disabled` | `boolean` | `false` | Vô hiệu |
| `leftIcon` | `React.ReactNode` | — | Icon trái |

### Biến thể / States

- **variant:** primary (nền CAM), outline (viền), ghost (trong suốt), danger (đỏ).
- **States:** default, hover, focus-visible (ring), disabled (mờ + `cursor-not-allowed`), loading (spinner, chặn click).

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg'; isLoading?: boolean; leftIcon?: React.ReactNode;
}
const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600',
  outline: 'border border-neutral-300 text-neutral-800 hover:bg-neutral-50',
  ghost: 'text-neutral-700 hover:bg-neutral-100',
  danger: 'bg-danger text-white hover:bg-red-700',
};
const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

export function Button({ variant = 'primary', size = 'md', isLoading, leftIcon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button {...rest} disabled={disabled || isLoading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-btn font-medium transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className)}>
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : leftIcon}
      {children}
    </button>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- "Thêm vào giỏ", "Yêu cầu báo giá" dùng `primary` (CAM). Hành động phụ ("So sánh", "Lưu") dùng `outline`/`ghost`. Hành động xoá dùng `danger`.
- Không đặt 2 nút `primary` cạnh nhau trong một khối — chỉ 1 hành động chính.

---

## 14. Badge

**Mục đích:** Nhãn nhỏ thể hiện trạng thái/thuộc tính: khuyến mãi, tồn kho, xác minh, tag thuộc tính gạch.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `variant` | `'default' \| 'promo' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Sắc thái |
| `children` | `React.ReactNode` | — | Nội dung |

### Biến thể / States

- **variant:** default (xám), promo (CAM), success (xanh lá), warning (vàng), danger (đỏ).

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface BadgeProps { variant?: 'default' | 'promo' | 'success' | 'warning' | 'danger'; className?: string; children: React.ReactNode }
const tones = {
  default: 'bg-neutral-100 text-neutral-700',
  promo: 'bg-primary-500 text-white',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};
export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tones[variant], className)}>{children}</span>;
}
```

### Lưu ý cho Daisan (ngành gạch)

- Quy ước màu trạng thái tồn: **success = Còn hàng, warning = Sắp hết, danger = Hết hàng**. Áp dụng nhất quán trên ProductCard và DataTable.
- Badge "Hàng nhập khẩu", "Chính hãng", "Mới về" giúp phân loại nhanh trong lưới gạch.

---

## 15. Tabs

**Mục đích:** Chuyển đổi giữa các nhóm nội dung trong cùng vùng: tab thông số / mô tả / đánh giá ở trang sản phẩm, hay tab báo cáo theo kênh.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `tabs` | `{ key: string; label: string }[]` | — | Danh sách tab |
| `active` | `string` | — | Tab đang chọn |
| `onChange` | `(key: string) => void` | — | Đổi tab |

### Biến thể / States

- **States:** active (gạch chân CAM), hover, focus (bàn phím ←/→), disabled.
- **A11y:** `role="tablist"/"tab"/"tabpanel"`, `aria-selected`.

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface TabsProps { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div role="tablist" aria-label="Tabs" className="flex gap-1 border-b border-neutral-200">
      {tabs.map((t) => {
        const selected = t.key === active;
        return (
          <button key={t.key} role="tab" aria-selected={selected}
            onClick={() => onChange(t.key)}
            className={cn('px-4 py-2 text-sm font-medium -mb-px border-b-2 transition',
              selected ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-800')}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Trang sản phẩm gạch nên có tab: **Thông số kỹ thuật, Hướng dẫn thi công, Tính vật tư (m² → số thùng), Đánh giá**. Tab "Tính vật tư" là điểm khác biệt giá trị cho người mua.

---

## 16. Pagination

**Mục đích:** Phân trang cho lưới sản phẩm/bảng dữ liệu lớn. Hỗ trợ nhảy trang, prev/next, hiển thị rút gọn (…).

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `page` | `number` | — | Trang hiện tại |
| `totalPages` | `number` | — | Tổng số trang |
| `onPageChange` | `(p: number) => void` | — | Đổi trang |

### Biến thể / States

- **States:** trang đầu (disable prev), trang cuối (disable next), trang active (nền CAM).

### Ví dụ code

```tsx
import { cn } from '@/lib/cn';
interface PaginationProps { page: number; totalPages: number; onPageChange: (p: number) => void }
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const go = (p: number) => p >= 1 && p <= totalPages && onPageChange(p);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="Phân trang" className="flex items-center gap-1">
      <button onClick={() => go(page - 1)} disabled={page === 1} aria-label="Trang trước"
        className="h-9 px-3 rounded-btn border border-neutral-200 text-sm disabled:opacity-40">‹</button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-neutral-400">…</span>}
          <button onClick={() => go(p)} aria-current={p === page ? 'page' : undefined}
            className={cn('h-9 min-w-9 px-2 rounded-btn text-sm',
              p === page ? 'bg-primary-500 text-white' : 'border border-neutral-200 hover:bg-neutral-50')}>{p}</button>
        </span>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Trang sau"
        className="h-9 px-3 rounded-btn border border-neutral-200 text-sm disabled:opacity-40">›</button>
    </nav>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Với danh mục gạch lớn (hàng nghìn SKU), ưu tiên phân trang server-side + đồng bộ tham số `?page=` lên URL để chia sẻ/SEO.

---

## 17. FilterSidebar

**Mục đích:** Bộ lọc sản phẩm theo thuộc tính: khoảng giá, kích thước, bề mặt, thương hiệu, khu vực kho. Cốt lõi của trải nghiệm duyệt gạch.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `groups` | `FilterGroup[]` | `[]` | Nhóm bộ lọc |
| `value` | `Record<string, string[]>` | `{}` | Giá trị đã chọn |
| `onChange` | `(v) => void` | — | Cập nhật lọc |
| `onClear` | `() => void` | — | Xoá toàn bộ |

### Biến thể / States

- **States:** nhóm mở/đóng (accordion), có lọc đang áp dụng (hiện nút "Xoá lọc"), mobile (drawer).

### Ví dụ code

```tsx
interface FilterGroup { key: string; title: string; options: { value: string; label: string; count?: number }[] }
interface Props { groups: FilterGroup[]; value: Record<string, string[]>; onChange: (v: Record<string, string[]>) => void; onClear?: () => void }

export function FilterSidebar({ groups, value, onChange, onClear }: Props) {
  const toggle = (g: string, v: string) => {
    const cur = value[g] ?? [];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange({ ...value, [g]: next });
  };
  return (
    <aside aria-label="Bộ lọc" className="w-64 shrink-0 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Bộ lọc</h2>
        <button onClick={onClear} className="text-xs text-primary-600 hover:underline">Xoá lọc</button>
      </div>
      {groups.map((g) => (
        <fieldset key={g.key} className="border-t border-neutral-200 pt-3">
          <legend className="text-sm font-medium text-neutral-700 mb-2">{g.title}</legend>
          <div className="space-y-1.5">
            {g.options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="checkbox" checked={(value[g.key] ?? []).includes(o.value)}
                  onChange={() => toggle(g.key, o.value)} className="accent-primary-500" />
                <span className="flex-1">{o.label}</span>
                {o.count !== undefined && <span className="text-xs text-neutral-400">{o.count}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </aside>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Nhóm lọc đặc thù: **Kích thước (30x30, 60x60, 80x80, 60x120), Bề mặt (bóng/mờ/nhám/granito), Khu vực sử dụng (nền/tường/ngoại thất), Khoảng giá/m², Thương hiệu, Kho/Khu vực giao**.
- Đồng bộ giá trị lọc lên URL query để kết quả Elasticsearch chia sẻ được và hỗ trợ SEO facet.

---

## 18. ChartCard

**Mục đích:** Vỏ chứa biểu đồ (doanh thu, tồn kho, hiệu suất Ads) kèm tiêu đề, bộ chọn khoảng thời gian và trạng thái rỗng/loading.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `title` | `string` | — | Tiêu đề biểu đồ |
| `range` | `string` | — | Khoảng thời gian chọn |
| `onRangeChange` | `(r: string) => void` | — | Đổi khoảng |
| `loading` | `boolean` | `false` | Đang tải |
| `children` | `React.ReactNode` | — | Biểu đồ thực tế |

### Biến thể / States

- **States:** loading (skeleton), rỗng (EmptyState), có dữ liệu.

### Ví dụ code

```tsx
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { LoadingState } from '@/components/data/LoadingState';
import { EmptyState } from '@/components/data/EmptyState';

interface ChartCardProps { title: string; range?: string; onRangeChange?: (r: string) => void; loading?: boolean; empty?: boolean; children: React.ReactNode }
export function ChartCard({ title, range = '30d', onRangeChange, loading, empty, children }: ChartCardProps) {
  return (
    <DashboardCard title={title} action={
      <select value={range} onChange={(e) => onRangeChange?.(e.target.value)}
        aria-label="Khoảng thời gian" className="rounded-btn border border-neutral-200 text-sm px-2 py-1">
        <option value="7d">7 ngày</option><option value="30d">30 ngày</option><option value="90d">90 ngày</option>
      </select>
    }>
      <div className="h-64">
        {loading ? <LoadingState variant="chart" /> : empty ? <EmptyState title="Chưa có dữ liệu trong kỳ" /> : children}
      </div>
    </DashboardCard>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Biểu đồ nên hỗ trợ phân tách theo **kho/showroom** và **nhóm gạch**; trục giá trị format VND. Tránh nhồi quá nhiều series — tối đa 3–4 đường để dễ đọc.

---

## 19. EmptyState

**Mục đích:** Hiển thị khi không có dữ liệu (giỏ hàng trống, không kết quả tìm kiếm, bảng rỗng) kèm gợi ý hành động.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `title` | `string` | — | Tiêu đề |
| `description` | `string` | — | Mô tả |
| `icon` | `React.ReactNode` | — | Minh hoạ |
| `action` | `React.ReactNode` | — | Nút gợi ý |

### Biến thể / States

- **variant ngữ cảnh:** không kết quả tìm kiếm, giỏ trống, bảng rỗng — khác title/action.

### Ví dụ code

```tsx
interface EmptyStateProps { title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode }
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl text-neutral-300 mb-3">{icon ?? '📦'}</div>
      <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-neutral-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Khi tìm kiếm gạch không ra kết quả, gợi ý nới lỏng bộ lọc (bỏ kích thước, mở rộng khoảng giá) và đề xuất sản phẩm tương tự từ Elasticsearch "more like this".

---

## 20. LoadingState

**Mục đích:** Hiển thị trạng thái đang tải bằng skeleton/spinner, tránh nhảy layout và cho người dùng cảm nhận tốc độ.

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `variant` | `'spinner' \| 'card' \| 'table' \| 'chart'` | `'spinner'` | Kiểu skeleton |
| `rows` | `number` | `3` | Số dòng skeleton |

### Biến thể / States

- **variant:** spinner (vùng nhỏ), card (skeleton ProductCard), table (skeleton hàng), chart (khối mờ).

### Ví dụ code

```tsx
interface LoadingStateProps { variant?: 'spinner' | 'card' | 'table' | 'chart'; rows?: number }
export function LoadingState({ variant = 'spinner', rows = 3 }: LoadingStateProps) {
  if (variant === 'spinner')
    return <div role="status" aria-live="polite" className="grid place-items-center py-10">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500" />
      <span className="sr-only">Đang tải…</span>
    </div>;
  if (variant === 'table')
    return <div className="space-y-2" aria-busy="true">{Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="h-9 rounded bg-neutral-100 animate-pulse" />)}</div>;
  if (variant === 'chart') return <div className="h-full rounded bg-neutral-100 animate-pulse" aria-busy="true" />;
  return <div className="rounded-card border border-neutral-200 p-3 animate-pulse">
    <div className="aspect-square rounded bg-neutral-100" /><div className="mt-3 h-4 w-3/4 rounded bg-neutral-100" />
  </div>;
}
```

### Lưu ý cho Daisan (ngành gạch)

- Lưới sản phẩm gạch nên dùng skeleton dạng `card` đúng tỷ lệ ô (aspect-square) để khi ảnh bề mặt tải xong không bị giật layout (CLS), tốt cho SEO Core Web Vitals.

---

## 21. ErrorState

**Mục đích:** Hiển thị khi tải dữ liệu/thao tác thất bại, kèm nút thử lại và thông điệp thân thiện (không lộ chi tiết kỹ thuật cho người dùng cuối).

### Props chính

| Prop | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| `title` | `string` | `'Đã xảy ra lỗi'` | Tiêu đề |
| `description` | `string` | — | Mô tả thân thiện |
| `onRetry` | `() => void` | — | Thử lại |

### Biến thể / States

- **States:** lỗi mạng, lỗi máy chủ, không có quyền — khác mô tả/hành động.

### Ví dụ code

```tsx
import { Button } from '@/components/ui/Button';
interface ErrorStateProps { title?: string; description?: string; onRetry?: () => void }
export function ErrorState({ title = 'Đã xảy ra lỗi', description = 'Vui lòng thử lại sau ít phút.', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl text-danger mb-3">⚠️</div>
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500 max-w-sm">{description}</p>
      {onRetry && <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>Thử lại</Button>}
    </div>
  );
}
```

### Lưu ý cho Daisan (ngành gạch)

- Không hiển thị stack trace/raw error cho khách. Ghi log chi tiết về backend (Laravel) để đội IT điều tra; với lỗi search (Elasticsearch down) nên fallback hiển thị danh mục nổi bật thay vì trang trắng.

---

## Checklist khi tạo component mới

- [ ] Đặt đúng thư mục (`ui` / `layout` / `commerce` / `dashboard` / `data`) theo phân loại.
- [ ] Tên file = tên component `PascalCase`; export qua barrel `index.ts`.
- [ ] Khai báo `interface <Tên>Props` rõ ràng, có kiểu cho mọi prop, không dùng `any` lan tràn.
- [ ] Chỉ dùng **design token** (`primary-*`, `neutral-*`, `rounded-card/btn`), không hardcode hex.
- [ ] Hỗ trợ đủ states cần thiết: default / hover / focus-visible / disabled / loading / error / empty.
- [ ] Accessibility cơ bản: `label`–`input` liên kết, `aria-*` phù hợp, `role` đúng, thao tác bàn phím được, contrast đạt.
- [ ] Responsive: kiểm tra ở breakpoint `sm/md/lg`, không vỡ layout, bảng có `overflow-x-auto`.
- [ ] Dùng `cn()` để merge class; cho phép truyền `className` override.
- [ ] Tái sử dụng primitive sẵn có (`Button`, `Badge`, `Modal`) thay vì viết lại.
- [ ] Có ví dụ sử dụng (Storybook hoặc comment) và props mặc định hợp lý.
- [ ] Ảnh dùng `loading="lazy"` + `alt` mô tả; tránh layout shift (đặt aspect-ratio).
- [ ] Format tiền VND bằng `toLocaleString('vi-VN')`; đơn vị tính ngành gạch hiển thị rõ.

---

## AI PHẢI LÀM

- **Tái sử dụng** component có sẵn trong tài liệu này trước khi nghĩ tới việc tạo mới; nếu thiếu mới đề xuất thêm.
- Luôn **dùng design token** màu CAM Daisan (`primary-*`) và xám/xanh phụ — bảo đảm đồng nhất thương hiệu trên mọi hệ thống Daisan.
- Sinh đầy đủ **TypeScript interface** cho props và component theo đúng quy ước đặt tên (`PascalCase`, `<Tên>Props`, `on*`, boolean khẳng định).
- Bảo đảm **accessibility cơ bản**: liên kết label/input, `aria-*`, `role`, focus-visible, thao tác bàn phím, `alt` cho ảnh.
- Bảo đảm **responsive** mặc định mobile-first; bảng dài bọc `overflow-x-auto`; lưới dùng grid co giãn.
- Xử lý đủ **các trạng thái** loading / empty / error bằng `LoadingState` / `EmptyState` / `ErrorState`, không để màn hình trắng.
- Áp dụng **đặc thù ngành gạch**: hiển thị đơn vị tính (m²/thùng/viên), thuộc tính kích thước/bề mặt, giá lẻ vs sỉ, kho/khu vực giao, đồng bộ catalog Odoo/Elasticsearch.
- Đặt component đúng **thư mục** và export qua barrel; format tiền tệ VND.

## AI KHÔNG ĐƯỢC LÀM

- **Không hardcode** mã màu hex, kích thước rời rạc, hay magic number trong className thay vì dùng token.
- **Không tạo trùng lặp** component đã có (vd viết lại nút thay vì dùng `Button`) hoặc nhân bản nhiều biến thể thành nhiều file thay vì dùng prop `variant`.
- **Không bỏ qua** trạng thái loading/empty/error, không để layout shift khi ảnh tải.
- **Không vi phạm** quy ước đặt tên (snake_case cho component, prop boolean phủ định, tên file lệch tên component).
- **Không dùng `any`** tràn lan hay bỏ kiểu cho props.
- **Không bỏ accessibility**: thiếu `alt`, không liên kết label/input, không hỗ trợ bàn phím, contrast kém.
- **Không lộ chi tiết kỹ thuật** (stack trace, mã lỗi backend) ra giao diện người dùng cuối trong `ErrorState`.
- **Không gắn cứng** giá lẻ cho luồng B2B hay bỏ đơn vị tính ngành gạch — dễ gây nhầm lẫn đặt hàng theo m²/thùng.
