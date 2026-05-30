# CODE_STANDARD.md — Chuẩn code Daisan.ai

Tài liệu này định nghĩa **bộ chuẩn code bắt buộc** cho mọi dự án sinh ra bởi Daisan.ai (nền tảng AI hỗ trợ code) và cho đội IT Daisan khi viết tay. Mục tiêu: code sinh ra **đồng nhất, dễ đọc, dễ bảo trì, dễ thay mock bằng API thật (PIM/Laravel)**, an toàn và sẵn sàng đưa vào hệ sinh thái Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, Daisan Ads, B2B, News). Stack chuẩn: **React + TypeScript + Tailwind** (frontend), **Laravel + REST API** (backend), **Elasticsearch** (search), tích hợp **Odoo / Drupal / Apify** khi phù hợp. Màu thương hiệu: **CAM Daisan** (chủ đạo), xám trung tính / xanh (phụ).

Tài liệu là "luật" — khi AI sinh code hoặc dev review code, mọi mục dưới đây đều là tiêu chí PASS/FAIL.

---

## 1. Chuẩn React

### 1.1 Nguyên tắc cốt lõi

- **Chỉ dùng function component + hooks.** Cấm class component (trừ Error Boundary bắt buộc — xem mục 8).
- **Một component = một trách nhiệm.** Component không nên vượt **~200 dòng**. Nếu vượt → tách nhỏ (con component, custom hook, helper).
- **Tách logic ra khỏi UI:** state phức tạp, gọi API, tính toán → đưa vào **custom hook** (`useXxx`). Component chỉ lo render.
- **Không side-effect trong thân render.** Mọi tác động ngoài (fetch, subscribe, timer) đặt trong `useEffect`/event handler.
- **`key` ổn định khi render list:** dùng `id` thật từ dữ liệu, **không dùng index** trừ khi list tĩnh, không sắp xếp/lọc.
- **Hiểu rõ dependency array của `useEffect`/`useCallback`/`useMemo`.** Không bỏ trống tùy tiện, không nhồi cho qua lint.

### 1.2 `memo` / `useMemo` / `useCallback` — dùng đúng chỗ

- Chỉ tối ưu khi **có vấn đề thực tế** (list lớn, render lại tốn kém, component nặng). Không bọc `memo` mọi nơi.
- `useMemo` cho **tính toán tốn kém**; `useCallback` cho **callback truyền xuống component đã `memo`**.
- Không "tối ưu hóa sớm" làm code khó đọc.

### 1.3 Ví dụ: tách logic bằng custom hook

```tsx
// hooks/useProducts.ts
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Product } from "@/types/product";

type State = {
  data: Product[];
  loading: boolean;
  error: string | null;
};

export function useProducts(categoryId?: string) {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await apiClient.get<Product[]>("/products", {
        params: { category_id: categoryId },
      });
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: [],
        loading: false,
        error: e instanceof Error ? e.message : "Lỗi không xác định",
      });
    }
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { ...state, refetch: fetchProducts };
}
```

```tsx
// components/product/ProductList.tsx  (component chỉ lo render)
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/feedback";

export function ProductList({ categoryId }: { categoryId?: string }) {
  const { data, loading, error, refetch } = useProducts(categoryId);

  if (loading) return <ListSkeleton count={8} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (data.length === 0) return <EmptyState title="Chưa có sản phẩm" />;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {data.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

- [ ] Không có class component (trừ ErrorBoundary)
- [ ] Không có component > ~200 dòng chưa tách
- [ ] Logic fetch/state phức tạp đã nằm trong custom hook
- [ ] `key` dùng id ổn định, không dùng index sai chỗ
- [ ] `memo`/`useMemo`/`useCallback` chỉ dùng khi có lý do

---

## 2. Chuẩn Tailwind

### 2.1 Nguyên tắc

- **Utility-first:** style bằng class Tailwind, **không viết CSS rời rạc** trừ khi thực sự cần (animation phức tạp, third-party override).
- **Cấm `style={{...}}` inline tùy tiện.** Chỉ chấp nhận inline style cho **giá trị động runtime** (ví dụ `width` theo % progress, `transform` theo toạ độ chuột).
- **Dùng token màu thương hiệu**, không hardcode mã hex rải rác. Định nghĩa màu Daisan trong `tailwind.config`.
- **Gộp class có điều kiện bằng `cn()` helper** (clsx + tailwind-merge) — tránh chuỗi ternary lồng nhau và class trùng/đè nhau.
- **Tránh class trùng / mâu thuẫn** (`p-2 p-4`, `text-sm text-lg`). `tailwind-merge` xử lý nhưng đừng cố tình viết bừa.
- Thứ tự class khuyến nghị: layout → spacing → kích thước → typography → màu → border → hiệu ứng → responsive/state.

### 2.2 Token màu Daisan

```ts
// tailwind.config.ts (trích)
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        daisan: {
          DEFAULT: "#E8521E", // CAM Daisan chủ đạo
          50: "#FDF2EC",
          100: "#FBD9C7",
          500: "#E8521E",
          600: "#C8410F",
          700: "#A2330B",
        },
        neutral: {
          /* xám trung tính làm màu phụ */
        },
        accent: {
          blue: "#1E6FE8", // xanh phụ
        },
      },
    },
  },
} satisfies Config;
```

```css
/* index.css — khai báo biến để dùng cả ngoài Tailwind nếu cần */
@layer base {
  :root {
    --color-daisan: 232 82 30; /* RGB cho bg-daisan/50 ... */
  }
}
```

### 2.3 `cn()` helper

```ts
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// Ví dụ dùng cn() cho variant nút (đúng chuẩn)
import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-daisan/40 disabled:opacity-50",
        variant === "primary" && "bg-daisan text-white hover:bg-daisan-600",
        variant === "outline" && "border border-daisan text-daisan hover:bg-daisan-50",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] Không có inline `style` tĩnh (chỉ giá trị động)
- [ ] Màu dùng token `daisan/...`, không hardcode hex rải rác
- [ ] Class điều kiện dùng `cn()`
- [ ] Không có class Tailwind trùng/mâu thuẫn

---

## 3. Chuẩn component

### 3.1 Props rõ ràng + TypeScript types

- **Mọi component phải có type props tường minh** (`type` hoặc `interface`). Cấm `any`, cấm props không khai báo.
- Props **bắt buộc** không để optional bừa; props **tùy chọn** có default rõ ràng.
- Ưu tiên **type alias** cho props; `interface` khi cần `extends`/merge.
- Boolean prop đặt tên khẳng định: `isLoading`, `disabled`, `hasError` (không `notReady`).

### 3.2 Tách presentational / container

- **Presentational** (dumb): chỉ nhận props, render UI, không gọi API, không state nghiệp vụ. Dễ tái dùng, dễ test.
- **Container** (smart): gọi hook/API, giữ state, truyền dữ liệu xuống presentational.
- Quy ước: container đặt ở `pages/` hoặc `features/.../containers`, presentational ở `components/`.

### 3.3 Default export vs named export

- **Dùng named export cho component và util** (dễ refactor, autocomplete, tránh đặt tên lệch khi import).
- **`default export` chỉ dùng cho page/route entry** (ví dụ file route của router, lazy import).
- Một file = một component chính. Các sub-component nhỏ private có thể nằm cùng file nếu không tái dùng.

```tsx
// components/product/ProductCard.tsx  (presentational, named export)
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  onSelect?: (id: string) => void;
  className?: string;
};

export function ProductCard({ product, onSelect, className }: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(product.id)}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition hover:shadow-md",
        className
      )}
    >
      <img
        src={product.thumbnail}
        alt={product.name}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-800">
          {product.name}
        </h3>
        <p className="mt-1 font-semibold text-daisan">
          {product.price.toLocaleString("vi-VN")} đ
        </p>
      </div>
    </button>
  );
}
```

- [ ] Props có type tường minh, không `any`
- [ ] Tách rõ presentational vs container
- [ ] Named export cho component/util; default chỉ cho page/route
- [ ] Boolean prop đặt tên khẳng định

---

## 4. Chuẩn cấu trúc thư mục (folder structure)

### 4.1 Frontend — React + Vite + TS

```
src/
├── assets/                 # ảnh, font tĩnh
├── components/             # presentational dùng chung
│   ├── ui/                 # nút, input, badge, modal... (design system)
│   ├── feedback/           # EmptyState, ErrorState, Skeleton
│   └── layout/             # Header, Sidebar, Footer
├── features/               # nhóm theo nghiệp vụ (gợi ý cho dự án lớn)
│   └── product/
│       ├── components/     # presentational riêng của feature
│       ├── containers/     # smart component
│       ├── hooks/
│       └── types.ts
├── hooks/                  # custom hook dùng chung
├── lib/                    # api-client, cn, format, constants
├── mocks/                  # mock data giống PIM API (mục 6)
├── pages/                  # page/route entry (default export)
├── routes/                 # khai báo router
├── types/                  # type/interface dùng chung
├── App.tsx
└── main.tsx
```

### 4.2 Backend — Laravel

```
app/
├── Http/
│   ├── Controllers/Api/    # controller mỏng, không chứa logic nghiệp vụ
│   ├── Requests/           # FormRequest — validate input
│   └── Resources/          # API Resource — chuẩn hóa output JSON
├── Services/               # logic nghiệp vụ (gọi từ controller)
├── Repositories/           # truy vấn DB / Elasticsearch
├── Models/
└── Enums/
routes/
└── api.php                 # versioned: /api/v1/...
config/
database/migrations/
tests/Feature/ , tests/Unit/
```

- Controller **mỏng**: nhận request → gọi Service → trả Resource. Không nhét query/logic vào controller.
- Validate input ở **FormRequest**, không validate tay rải rác.
- Output JSON đi qua **API Resource** để cấu trúc nhất quán với FE (và khớp mock).

- [ ] FE chia rõ components / hooks / lib / mocks / types
- [ ] BE controller mỏng, logic ở Service, validate ở FormRequest, output qua Resource
- [ ] Không import vòng (circular) giữa các tầng

---

## 5. Chuẩn đặt tên file

| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Component React | **PascalCase** | `ProductCard.tsx`, `OrderSummary.tsx` |
| Custom hook | camelCase, prefix `use` | `useProducts.ts`, `useCart.ts` |
| Util / helper | **camelCase** | `formatCurrency.ts`, `apiClient.ts` |
| Type / interface file | camelCase hoặc theo domain | `product.ts`, `order.ts` |
| Route / URL path | **kebab-case** | `/danh-muc-san-pham`, `/gio-hang` |
| File route (page) | PascalCase + có thể default export | `ProductDetailPage.tsx` |
| Constant | UPPER_SNAKE_CASE (biến), camelCase (file) | `API_BASE_URL`, `constants.ts` |
| Mock data | camelCase, hậu tố `.mock` | `products.mock.ts` |
| Laravel Controller | PascalCase + `Controller` | `ProductController.php` |
| Laravel migration | snake_case theo Laravel | `2026_05_30_create_products_table.php` |

- Tên file **khớp tên export chính** (`ProductCard.tsx` export `ProductCard`).
- Không viết tắt khó hiểu (`prdLst` ❌ → `productList` ✅). Ưu tiên tên tiếng Anh cho code, tiếng Việt cho nội dung/route hiển thị.

- [ ] Component PascalCase, hook `useXxx`, util camelCase
- [ ] Route dùng kebab-case
- [ ] Tên file khớp tên export chính

---

## 6. Chuẩn mock data

Mock data phải **mô phỏng đúng cấu trúc PIM API / Laravel Resource** để khi có API thật chỉ cần thay nguồn, **không phải sửa component**.

### 6.1 Nguyên tắc

- Mock đặt trong `src/mocks/` (hoặc `src/data/`), **có type** đầy đủ.
- Cấu trúc field **trùng tên & kiểu** với response API thật (snake_case nếu API trả snake_case, hoặc chuẩn hóa qua mapper — chọn 1 và nhất quán toàn dự án).
- Mock đi kèm **một hàm giả lập** trả Promise + delay để giống gọi mạng thật (loading/error test được).
- Không nhúng mock trực tiếp trong JSX. Luôn qua hook/service như API thật.

### 6.2 Ví dụ

```ts
// types/product.ts
export type Product = {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  currency: "VND";
  thumbnail: string;
  category_id: string;
  in_stock: boolean;
};
```

```ts
// mocks/products.mock.ts
import type { Product } from "@/types/product";

export const productsMock: Product[] = [
  {
    id: "p-001",
    sku: "GACH-60x60-MEN-BONG",
    name: "Gạch lát nền 60x60 men bóng",
    slug: "gach-lat-nen-60x60-men-bong",
    price: 185000,
    currency: "VND",
    thumbnail: "https://cdn.daisan.vn/mock/gach-60x60.jpg",
    category_id: "cat-gach-lat-nen",
    in_stock: true,
  },
  // ... thêm bản ghi
];

// Giả lập API: cùng chữ ký với apiClient.get để thay thế dễ dàng
export function fetchProductsMock(delay = 400): Promise<Product[]> {
  return new Promise((resolve) => setTimeout(() => resolve(productsMock), delay));
}
```

> Khi nối API thật: chỉ đổi `fetchProductsMock` → `apiClient.get<Product[]>("/products")` trong hook. UI không đổi.

- [ ] Mock nằm trong `/mocks` (hoặc `/data`), có type
- [ ] Field name/kiểu khớp API thật (PIM/Laravel Resource)
- [ ] Có hàm giả lập trả Promise + delay
- [ ] Component dùng mock qua hook/service, không nhúng trực tiếp

---

## 7. Chuẩn tích hợp API

### 7.1 Nguyên tắc

- **Một lớp `api-client` duy nhất.** Cấm `fetch`/`axios` rải rác trong component.
- **Base URL lấy từ env** (`import.meta.env.VITE_API_BASE_URL`). **Cấm hardcode URL** trong code.
- Mọi call **xử lý loading + error tập trung**, ném `Error` có message rõ ràng.
- Gắn header chung (Authorization, Accept), interceptor cho 401 → logout/redirect.
- Timeout hợp lý; retry chỉ cho request idempotent.

### 7.2 Ví dụ `api-client`

```ts
// lib/api-client.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Thiếu biến môi trường VITE_API_BASE_URL");
}

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function request<T>(path: string, init: RequestInit, options?: RequestOptions): Promise<T> {
  const token = localStorage.getItem("daisan_token");
  const res = await fetch(buildUrl(path, options?.params), {
    ...init,
    signal: options?.signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401) {
    // interceptor xử lý hết hạn phiên
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  if (!res.ok) {
    let message = `Lỗi ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      /* giữ message mặc định */
    }
    throw new Error(message);
  }

  // API Laravel thường bọc { data: ... }
  const json = await res.json();
  return (json?.data ?? json) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "GET" }, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, options),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE" }, options),
};
```

```bash
# .env (KHÔNG commit) — .env.example commit để làm mẫu
VITE_API_BASE_URL=https://api.daisan.vn/api/v1
```

- [ ] Mọi request đi qua `api-client`
- [ ] Base URL lấy từ env, không hardcode
- [ ] Xử lý 401/lỗi tập trung, message rõ ràng
- [ ] Có `.env.example`, `.env` đã được gitignore

---

## 8. Chuẩn xử lý lỗi (error handling)

### 8.1 Ba trạng thái bắt buộc cho mọi màn hình dữ liệu

Mọi view fetch dữ liệu **bắt buộc** xử lý đủ: **loading → error → empty → success**. Thiếu bất kỳ trạng thái nào = FAIL review.

```tsx
// components/feedback/index.tsx
export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-daisan hover:underline">
          Thử lại
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-10 text-center text-neutral-500">
      <p className="text-sm">{title}</p>
    </div>
  );
}
```

### 8.2 Error Boundary (cấp app/route)

```tsx
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // TODO: gửi về service log (Sentry/log nội bộ Daisan)
    console.error("[ErrorBoundary]", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div className="p-6 text-center">Đã có lỗi xảy ra.</div>;
    }
    return this.props.children;
  }
}
```

### 8.3 Quy tắc try/catch

- `try/catch` bao quanh **mọi await gọi mạng**, biến lỗi thành state có message tiếng Việt thân thiện.
- **Không nuốt lỗi im lặng** (`catch {}` rỗng). Tối thiểu log + đổi UI.
- Không hiển thị stack trace / message kỹ thuật thô cho người dùng cuối.

- [ ] Mọi view dữ liệu xử lý đủ loading/error/empty/success
- [ ] Có ErrorBoundary cấp route/app
- [ ] Không có `catch` rỗng nuốt lỗi
- [ ] Message lỗi thân thiện, không lộ chi tiết kỹ thuật

---

## 9. Chuẩn bảo mật cơ bản

- **Không lộ secret/API key trong code FE.** Key bí mật chỉ ở backend. FE chỉ dùng key public hợp lệ (ví dụ map key có domain restriction).
- **Không commit secret:** `.env`, token, credential phải nằm trong `.gitignore`. Commit `.env.example` không giá trị thật.
- **Validate input cả 2 phía:** FE validate UX; **backend (Laravel FormRequest) validate là nguồn sự thật**. Không tin dữ liệu client.
- **Escape / chống XSS:** React tự escape; **cấm `dangerouslySetInnerHTML`** trừ khi nội dung đã được sanitize (ví dụ DOMPurify cho HTML từ Drupal/News).
- **Chống SQL injection:** dùng Eloquent/Query Builder có bind tham số; cấm nối chuỗi SQL.
- **Phân quyền / RLS:** kiểm tra quyền ở backend (Policy/Gate), không dựa vào ẩn nút ở FE. Mỗi truy vấn dữ liệu phải lọc theo quyền/đơn vị (tenant, shop).
- **CSRF / Auth:** dùng token chuẩn (Sanctum/JWT), HTTPS bắt buộc, không để token trong URL.
- **Không log dữ liệu nhạy cảm** (mật khẩu, token, thông tin cá nhân) ra console/log.

```ts
// SAI — hardcode secret, lộ key
const STRIPE_SECRET = "sk_live_abc123"; // ❌ TUYỆT ĐỐI KHÔNG

// ĐÚNG — key bí mật ở backend; FE gọi qua endpoint của mình
await apiClient.post("/payments/checkout", { orderId });
```

- [ ] Không có secret/API key bí mật trong code FE
- [ ] `.env` được gitignore, có `.env.example`
- [ ] Input validate ở backend (FormRequest) là nguồn sự thật
- [ ] Không dùng `dangerouslySetInnerHTML` chưa sanitize
- [ ] Truy vấn dùng ORM bind tham số, không nối chuỗi SQL
- [ ] Phân quyền kiểm tra ở backend (Policy/Gate), lọc theo tenant
- [ ] Không log dữ liệu nhạy cảm

---

## 10. Checklist review code trước bàn giao (≥15 mục)

Mọi PR / output AI phải vượt qua checklist này trước khi merge/giao:

- [ ] **1.** Build pass, không lỗi TypeScript (`tsc --noEmit`), không lỗi lint.
- [ ] **2.** Không còn `console.log` rác / code chết / import thừa.
- [ ] **3.** Không dùng `any`; mọi props/hàm public có type tường minh.
- [ ] **4.** Không có component > ~200 dòng chưa tách; logic phức tạp đã ở custom hook.
- [ ] **5.** `key` khi render list dùng id ổn định, không dùng index sai.
- [ ] **6.** Style bằng Tailwind utility; không inline style tĩnh; dùng token màu `daisan`.
- [ ] **7.** Class điều kiện dùng `cn()`, không có class trùng/mâu thuẫn.
- [ ] **8.** Tên file/biến đúng chuẩn (PascalCase component, camelCase util, kebab route).
- [ ] **9.** Mock data có type, cấu trúc khớp API thật, dùng qua hook/service.
- [ ] **10.** Mọi gọi API đi qua `api-client`; base URL lấy từ env, không hardcode.
- [ ] **11.** Mọi view dữ liệu xử lý đủ loading / error / empty / success.
- [ ] **12.** Có ErrorBoundary cấp route; không có `catch` rỗng; message lỗi thân thiện tiếng Việt.
- [ ] **13.** Không commit secret; `.env` đã gitignore; có `.env.example`.
- [ ] **14.** Input được validate; backend validate là nguồn sự thật; không nối chuỗi SQL.
- [ ] **15.** Phân quyền kiểm tra ở backend; không dựa vào ẩn UI; lọc theo tenant.
- [ ] **16.** Không `dangerouslySetInnerHTML` chưa sanitize; React escape giữ nguyên.
- [ ] **17.** Accessibility cơ bản: `alt` cho ảnh, `aria-label` cho nút icon, focus ring.
- [ ] **18.** Responsive đạt mobile-first; kiểm tra ở breakpoint chính (sm/md/lg).
- [ ] **19.** Tên export khớp tên file; named export cho component/util, default cho page.
- [ ] **20.** Đã test thủ công luồng chính + ít nhất 1 trường hợp lỗi.

---

## AI PHẢI LÀM

- **Luôn** sinh function component + hooks, có type props tường minh, tách logic nặng ra custom hook.
- **Luôn** dùng token màu `daisan` và `cn()` helper; style bằng Tailwind utility.
- **Luôn** đặt mọi gọi mạng qua `api-client`, lấy URL từ env, xử lý đủ loading/error/empty/success.
- **Luôn** tạo mock data có type, cấu trúc **khớp PIM/Laravel Resource**, đặt trong `/mocks`, dùng qua hook để dễ thay API thật.
- **Luôn** đặt tên file/biến đúng chuẩn (mục 5) và đặt file đúng thư mục (mục 4).
- **Luôn** bọc ErrorBoundary, không nuốt lỗi, hiển thị message tiếng Việt thân thiện.
- **Luôn** tự rà checklist mục 10 trước khi trả output, và liệt kê những mục đã đạt.
- **Luôn** thêm `alt`, `aria-label`, focus ring; responsive mobile-first.

## AI KHÔNG ĐƯỢC LÀM

- **Không** viết class component (trừ ErrorBoundary), không tạo component khổng lồ không tách.
- **Không** hardcode URL API, mã hex màu rải rác, hay secret/API key bí mật trong code FE.
- **Không** dùng `any`, không bỏ qua type, không để props không khai báo.
- **Không** dùng `fetch`/`axios` trực tiếp trong component (phải qua `api-client`).
- **Không** nhúng mock trực tiếp trong JSX; không tạo mock lệch cấu trúc API thật.
- **Không** để `catch` rỗng, không hiển thị stack trace thô cho người dùng.
- **Không** dùng `dangerouslySetInnerHTML` với nội dung chưa sanitize.
- **Không** nối chuỗi SQL, không tin dữ liệu client làm nguồn sự thật, không dựa vào ẩn UI để phân quyền.
- **Không** commit `.env`/token/credential; không log dữ liệu nhạy cảm.
- **Không** dùng inline style tĩnh hay để class Tailwind trùng/mâu thuẫn.
