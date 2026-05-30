# ERROR_PLAYBOOK.md — Sổ tay xử lý lỗi cho Daisan.ai

> **Mục đích:** Tài liệu này là "sổ tay chiến đấu" (battle playbook) để Daisan.ai xử lý lỗi đúng phương pháp — theo triết lý của các nền tảng AI-coding chuyên nghiệp (kiểu Lovable): **đọc lỗi → xác định nguyên nhân gốc → sửa đúng file → KHÔNG phá code cũ**. Khi người dùng (đội IT Daisan hoặc khách hàng) báo lỗi bằng tiếng Việt, AI phải tuân theo quy trình debug chuẩn, chẩn đoán chính xác, và áp dụng nguyên tắc "sửa tối thiểu" thay vì viết lại hệ thống. Tài liệu áp dụng cho toàn bộ hệ sinh thái Daisan (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B.daisan.vn, News.daisan.vn, Daisan Ads) với stack chuẩn: **React + Tailwind (frontend), Laravel + API (backend), Elasticsearch (search), Odoo (ERP), Drupal (CMS)**.

---

## 1. Triết lý xử lý lỗi của Daisan.ai

Daisan.ai KHÔNG phải công cụ "đập đi xây lại". Khi gặp lỗi, AI hành xử như một **kỹ sư senior bình tĩnh**: đọc kỹ thông báo lỗi, dựng giả thuyết, kiểm chứng, rồi sửa **đúng một chỗ**. Một lỗi import sai không bao giờ được "giải quyết" bằng cách viết lại cả component. Một dòng CSS lệch không được sửa bằng cách thay đổi cấu hình toàn dự án.

Ba quy tắc vàng:

1. **Đọc lỗi trước, đoán sau.** 80% lỗi đã nói rõ nguyên nhân ngay trong stack trace / console. Đừng đoán mò.
2. **Sửa tối thiểu (minimal diff).** Diff càng nhỏ, regression càng ít, review càng nhanh.
3. **Không phá code đang chạy.** Mọi thay đổi phải bảo toàn hành vi của phần code không liên quan đến lỗi.

---

## 2. QUY TRÌNH DEBUG CHUẨN 6 BƯỚC (AI BẮT BUỘC TUÂN THEO)

AI **phải** đi tuần tự 6 bước này cho mọi lỗi. Không được nhảy thẳng vào sửa code khi chưa hiểu nguyên nhân.

### Bước 1 — TÁI HIỆN & THU THẬP (Reproduce & Collect)
- Đọc nguyên văn thông báo lỗi: message, error code, dòng đầu của stack trace.
- Xác định lỗi xảy ra ở đâu: **build-time** (npm/vite/tsc) hay **runtime** (browser console) hay **network** (API/DevTools Network tab) hay **server** (Laravel `storage/logs/laravel.log`).
- Ghi lại bước thao tác làm lỗi xuất hiện (route nào, hành động nào, dữ liệu nào).

### Bước 2 — ĐỊNH VỊ FILE & DÒNG (Locate)
- Lần theo stack trace từ **trên xuống**, tìm dòng đầu tiên thuộc **code của dự án** (bỏ qua các frame trong `node_modules`).
- Mở đúng file:dòng đó. Dùng tìm kiếm (Grep) theo tên symbol/component nếu stack trace bị minify.
- Xác định "bán kính ảnh hưởng": chỉ 1 file? 1 component? hay 1 layer (API client / store / router)?

### Bước 3 — DỰNG GIẢ THUYẾT NGUYÊN NHÂN GỐC (Hypothesize Root Cause)
- Phân biệt **triệu chứng** (màn trắng) với **nguyên nhân gốc** (biến `undefined` bị `.map`).
- Liệt kê 1–3 giả thuyết khả dĩ, xếp theo xác suất dựa trên loại lỗi (xem bảng tra Mục 4 và từng case Mục 5).
- Đặt câu hỏi: "Dữ liệu vào đây có đúng kiểu không? Component này nhận props gì? API trả về gì thật sự?"

### Bước 4 — KIỂM CHỨNG GIẢ THUYẾT (Verify)
- Xác nhận bằng bằng chứng cụ thể: `console.log`/`dd()` tạm, kiểm tra payload trong Network tab, đọc response thật của API.
- Không sửa code khi giả thuyết chưa được xác nhận. Nếu sai, quay lại Bước 3.

### Bước 5 — SỬA TỐI THIỂU (Minimal Fix)
- Áp dụng thay đổi **nhỏ nhất** giải quyết đúng nguyên nhân gốc.
- Giữ nguyên style, kiến trúc, tên biến, format của code xung quanh.
- Xóa mọi `console.log`/`dd()` tạm đã thêm ở Bước 4.

### Bước 6 — XÁC MINH & CHỐNG TÁI PHÁT (Verify & Regression)
- Chạy lại: build pass, preview hiển thị đúng, thao tác gây lỗi không còn lỗi.
- Kiểm tra **regression**: các tính năng liên quan (route khác, component dùng chung) vẫn chạy.
- Cân nhắc thêm guard/test để lỗi không quay lại.

```
[1] Tái hiện ──► [2] Định vị ──► [3] Giả thuyết ──► [4] Kiểm chứng ──► [5] Sửa tối thiểu ──► [6] Xác minh
        ▲                                                   │
        └──────────────  nếu giả thuyết sai  ◄──────────────┘
```

- [ ] Đã đọc nguyên văn lỗi và biết lỗi build/runtime/network/server
- [ ] Đã định vị đúng file:dòng trong code dự án (không phải node_modules)
- [ ] Đã phân biệt triệu chứng vs nguyên nhân gốc
- [ ] Đã kiểm chứng giả thuyết bằng bằng chứng (log/network/response)
- [ ] Diff sửa là nhỏ nhất có thể
- [ ] Đã build + preview + kiểm tra regression

---

## 3. NGUYÊN TẮC "SỬA TỐI THIỂU — KHÔNG PHÁ CODE CŨ"

Đây là nguyên tắc cốt lõi, áp dụng cho **mọi** lần sửa lỗi.

### 3.1. Minimal diff
Một lỗi cần sửa 1 dòng thì sửa đúng 1 dòng. Không "tiện tay" refactor, đổi tên biến, format lại cả file, hay nâng cấp thư viện. Mỗi thay đổi ngoài phạm vi lỗi là một rủi ro regression mới.

### 3.2. Bảo toàn hợp đồng (contract preservation)
Không đổi **chữ ký hàm**, **tên/kiểu props**, **shape của API response**, **tên route**, **export name** — trừ khi đó chính là nguyên nhân lỗi. Nhiều nơi khác đang phụ thuộc vào chúng.

### 3.3. Không xóa code lớn
Không xóa file, không xóa component, không comment-out cả khối lớn để "cho hết lỗi". Nếu một đoạn nghi là thừa, **giữ lại** và chỉ vô hiệu hóa phần gây lỗi.

### 3.4. Không đổi kiến trúc để vá lỗi nhỏ
Không thay React Router bằng thư viện khác, không chuyển từ Context sang Redux, không đổi từ CSR sang SSR chỉ vì 1 lỗi cục bộ. Kiến trúc là quyết định lớn, không phải hành động sửa lỗi.

### 3.5. Sửa nguyên nhân, không che triệu chứng
Bọc `try/catch` rỗng hay thêm `?.` khắp nơi để "tắt lỗi" là **che triệu chứng**. Phải tìm vì sao dữ liệu `undefined` ngay từ đầu.

| Tình huống | ĐÚNG (tối thiểu) | SAI (phá code) |
|---|---|---|
| `products.map` lỗi vì `products` undefined | Đảm bảo khởi tạo `useState([])` hoặc guard `(products ?? [])` | Viết lại cả component danh sách |
| Import sai đường dẫn | Sửa đúng path import | Tạo lại file mới, đổi cấu trúc thư mục |
| 1 class Tailwind sai | Sửa class đó | Đổi `tailwind.config.js` toàn cục |
| API trả 422 | Sửa payload gửi đi cho đúng validation | Tắt validation ở backend |

- [ ] Diff chỉ chạm vào code liên quan đến lỗi
- [ ] Không đổi chữ ký hàm / props / API shape / route name ngoài ý muốn
- [ ] Không xóa file hoặc khối code lớn
- [ ] Không đổi kiến trúc/thư viện để vá lỗi cục bộ
- [ ] Sửa nguyên nhân gốc, không che triệu chứng

---

## 4. BẢNG TRA NHANH: LỖI → FILE THƯỜNG GÂY RA → CÁCH SỬA

| Triệu chứng | File/Layer thường gây ra | Nguyên nhân gốc hay gặp | Hướng sửa tối thiểu |
|---|---|---|---|
| Màn trắng (blank screen) | `main.jsx`/`App.jsx`, component vừa sửa | Lỗi JS runtime chặn render; `.map` trên undefined | Mở Console, sửa dòng lỗi đầu tiên; thêm guard dữ liệu |
| `Failed to resolve import` | File vừa thêm import | Sai path / sai default vs named export | Sửa path; khớp `import X` vs `import { X }` |
| `does not provide an export named` | File export + file import | Trộn default/named export | Sửa cú pháp import cho khớp export |
| Trang trắng khi đổi route | `router.jsx`/`App.jsx`, `*.route.jsx` | Path không khớp, thiếu `<Outlet/>`, thiếu `element` | Khai báo đúng route; thêm Outlet ở layout |
| `useRoutes()/useNavigate() ... Router` | Component dùng hook router | Hook router nằm ngoài `<BrowserRouter>` | Bọc app trong `<BrowserRouter>` |
| Tailwind không ăn class | `tailwind.config.js`, `index.css`, `postcss.config` | Sai `content` glob; thiếu `@tailwind`; class động bị purge | Sửa `content`; thêm directive; tránh class ghép chuỗi |
| Component không hiển thị | Component cha, điều kiện render | `return null`, điều kiện sai, chưa mount, key trùng | Kiểm tra điều kiện render, props, key |
| `CORS policy ... blocked` | Backend Laravel `config/cors.php` | Thiếu origin trong allowed origins | Thêm origin FE vào cấu hình CORS backend |
| API 401/403 | API client / interceptor | Thiếu/sai token, hết hạn | Gắn header Authorization; refresh token |
| API 404 | API client base URL / route | Sai endpoint, sai base URL | Sửa URL endpoint cho khớp backend |
| API 422 | Payload gửi đi | Sai field / thiếu field validation | Sửa payload đúng rule validation |
| API 500 | Backend controller/model | Exception phía server | Đọc `laravel.log`, sửa logic backend |
| `Cannot read properties of undefined` | Component dùng data async | Render trước khi data về | Thêm loading state + optional chaining + default |
| Vòng lặp re-render vô hạn | `useEffect`/`setState` | Thiếu deps đúng; setState trong render | Sửa dependency array; tách setState khỏi render |
| State cũ (stale) | Closure trong handler/effect | Đọc state cũ trong closure | Dùng functional update `setX(prev => ...)` |
| Vỡ layout mobile | Component có class responsive | Width cố định, thiếu breakpoint, overflow | Dùng `w-full`, thêm `md:`/`lg:`, `min-w-0` |
| `Hydration failed` (Next.js) | Component SSR | HTML server ≠ client (Date/random/`window`) | Render giá trị động sau mount / `dynamic ssr:false` |

---

## 5. XỬ LÝ TỪNG LOẠI LỖI CHI TIẾT

Mỗi case theo cấu trúc: **Triệu chứng → Nguyên nhân thường gặp → Cách chẩn đoán → Cách sửa từng bước → Ví dụ trước/sau**.

---

### 5.1. BLANK SCREEN — Màn hình trắng

**Triệu chứng:** Trình duyệt hiển thị trang trắng tinh, không có nội dung. DevTools có thể có lỗi đỏ ở Console hoặc không.

**Nguyên nhân thường gặp:**
- Lỗi JavaScript runtime ném ra trong quá trình render → React unmount toàn bộ cây.
- `.map()` / truy cập thuộc tính trên `undefined`/`null`.
- Lỗi import khiến module không load (xem 5.2).
- `root` element không khớp id trong `index.html`.
- Lỗi trong provider bao ngoài (Router, QueryClient, Context).

**Cách chẩn đoán:**
1. Mở DevTools → tab **Console**, đọc lỗi đỏ **đầu tiên** (lỗi sau thường là hệ quả).
2. Lần theo stack trace tới file:dòng trong code dự án.
3. Nếu Console trống nhưng vẫn trắng → kiểm tra `index.html` có `<div id="root">` và `main.jsx` có `getElementById('root')` khớp không.
4. Tạm bọc app bằng Error Boundary để thấy lỗi thay vì trắng.

**Cách sửa từng bước:**
1. Xác định dòng ném lỗi.
2. Nếu do dữ liệu undefined → thêm giá trị mặc định và guard.
3. Build lại, kiểm tra Console sạch lỗi.

**Ví dụ trước/sau** (danh sách sản phẩm DaisanStore bị trắng vì data async chưa về):

```jsx
// ❌ TRƯỚC: products ban đầu là undefined → .map ném lỗi → màn trắng
function ProductList() {
  const { data: products } = useProducts(); // chưa có data ở lần render đầu
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

```jsx
// ✅ SAU: default [] + guard, sửa tối thiểu, không đổi cấu trúc component
function ProductList() {
  const { data: products = [], isLoading } = useProducts();
  if (isLoading) return <ProductListSkeleton />;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(products ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

### 5.2. IMPORT / EXPORT ERROR

**Triệu chứng:** Build/Vite báo `Failed to resolve import "..."` hoặc Console báo `The requested module '...' does not provide an export named 'X'` / `X is not defined`.

**Nguyên nhân thường gặp:**
- Sai đường dẫn tương đối (`./` vs `../`), sai tên file, sai hoa/thường (Linux/CI phân biệt hoa thường, Windows thì không → lỗi chỉ xuất hiện khi deploy).
- Trộn **default export** và **named export**.
- Quên export symbol khỏi file nguồn.
- Import vòng (circular import) khiến giá trị là `undefined`.

**Cách chẩn đoán:**
1. Đọc message: nó nói rõ tên module và export nào thiếu.
2. Mở file nguồn, xem nó export kiểu gì: `export default X` hay `export const X`.
3. So với cú pháp import ở file đích.
4. Kiểm tra đúng chính xác hoa/thường của tên file.

**Cách sửa từng bước:**
1. Khớp cú pháp import với kiểu export.
2. Sửa path/tên file cho đúng (kể cả hoa/thường).
3. Nếu circular import → tách phần dùng chung ra file thứ ba.

**Ví dụ trước/sau:**

```jsx
// File nguồn: components/Button.jsx
export default function Button(props) { /* ... */ }   // default export
```

```jsx
// ❌ TRƯỚC: import named nhưng file export default
import { Button } from "./components/Button";
// → "does not provide an export named 'Button'"

// ✅ SAU: import default cho khớp
import Button from "./components/Button";
```

```jsx
// Trường hợp ngược lại, file export named:
export const formatPrice = (v) => new Intl.NumberFormat("vi-VN").format(v);

// ❌ import default từ named export
import formatPrice from "./utils/format";
// ✅ SAU
import { formatPrice } from "./utils/format";
```

---

### 5.3. ROUTER ERROR

**Triệu chứng:** Đổi URL ra trang trắng / 404 nội bộ; hoặc lỗi `useNavigate() may be used only in the context of a <Router> component`; hoặc layout không render con.

**Nguyên nhân thường gặp:**
- Hook router (`useNavigate`, `useParams`, `useRoutes`) gọi bên ngoài `<BrowserRouter>`.
- Path khai báo không khớp URL thật (`/san-pham/:id` vs `/products/:id`).
- Layout dùng nested route nhưng thiếu `<Outlet />`.
- Thiếu route catch-all `*` cho trang 404.

**Cách chẩn đoán:**
1. Đọc message — lỗi "context of a Router" chỉ rõ vấn đề bao bọc.
2. Kiểm tra cây provider trong `main.jsx`/`App.jsx`: app có nằm trong `<BrowserRouter>` không.
3. So path khai báo với URL trên thanh địa chỉ.
4. Với nested route: layout cha có `<Outlet />` chưa.

**Cách sửa từng bước:**
1. Bọc toàn app trong `<BrowserRouter>` (chỉ MỘT lần, ở gốc).
2. Sửa path cho khớp.
3. Thêm `<Outlet />` vào layout.

**Ví dụ trước/sau** (cổng B2B.daisan.vn):

```jsx
// ❌ TRƯỚC: useNavigate gọi ngoài Router → crash
// main.jsx
createRoot(document.getElementById("root")).render(<App />);
// App.jsx dùng useNavigate nhưng không có BrowserRouter bao ngoài
```

```jsx
// ✅ SAU: bọc Router ở gốc, không đổi gì khác
import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

```jsx
// Nested route thiếu Outlet:
// ❌ TRƯỚC
function DashboardLayout() {
  return <div className="flex"><Sidebar /></div>; // con không bao giờ hiện
}
// ✅ SAU
import { Outlet } from "react-router-dom";
function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  );
}
```

---

### 5.4. TAILWIND KHÔNG CHẠY

**Triệu chứng:** Class Tailwind viết đúng nhưng không có hiệu lực; trang hiển thị "trần" không style; hoặc một số class chạy, class khác không.

**Nguyên nhân thường gặp:**
- `content` trong `tailwind.config.js` không trỏ tới đúng các file `.jsx/.tsx`.
- Thiếu `@tailwind base; @tailwind components; @tailwind utilities;` trong CSS gốc, hoặc CSS đó chưa được import vào `main.jsx`.
- Thiếu/cấu hình sai `postcss.config.js`.
- **Class động ghép chuỗi** bị JIT purge mất (Tailwind chỉ quét chuỗi tĩnh hoàn chỉnh).

**Cách chẩn đoán:**
1. Inspect element → xem class có trong DOM nhưng không có rule CSS không → vấn đề build Tailwind.
2. Kiểm tra `content` glob có phủ thư mục `src/**/*` không.
3. Kiểm tra `index.css` có 3 directive và đã được import.
4. Nếu chỉ vài class biến mất → nghi class động bị purge.

**Cách sửa từng bước:**
1. Sửa `content` cho đúng (sửa cấu hình toàn cục CHỈ khi đây thật sự là nguyên nhân).
2. Đảm bảo directive + import CSS.
3. Đổi class động sang map class đầy đủ (safelist nếu cần).

**Ví dụ trước/sau:**

```js
// ❌ TRƯỚC: content không phủ src → mọi class bị purge
// tailwind.config.js
export default { content: ["./index.html"], theme: {}, plugins: [] };

// ✅ SAU
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: { colors: { daisan: "#E8551F" } } }, // cam Daisan
  plugins: [],
};
```

```jsx
// ❌ TRƯỚC: class ghép chuỗi → Tailwind không quét được "bg-daisan"
const color = "daisan";
<button className={`bg-${color} text-white px-4 py-2 rounded`}>Mua</button>

// ✅ SAU: map class tĩnh đầy đủ
const colorClass = { daisan: "bg-daisan", gray: "bg-gray-500" };
<button className={`${colorClass[color]} text-white px-4 py-2 rounded`}>Mua</button>
```

---

### 5.5. COMPONENT KHÔNG RENDER

**Triệu chứng:** Component được gọi nhưng không xuất hiện trên màn hình, Console không báo lỗi.

**Nguyên nhân thường gặp:**
- Component `return null`/`return false` do điều kiện render.
- Điều kiện `&&` với giá trị `0`/`""` → render ra `0` hoặc không gì.
- Component cha không thực sự mount nó (nhánh điều kiện sai).
- `key` trùng/thiếu khiến React bỏ qua cập nhật.
- Bị CSS ẩn (`hidden`, `display:none`, `height:0`).

**Cách chẩn đoán:**
1. React DevTools → tìm component trong cây: nó có mount không?
2. Nếu mount nhưng không thấy → kiểm tra CSS (Inspect element).
3. Nếu không mount → kiểm tra điều kiện render ở cha.
4. Kiểm tra giá trị điều kiện `&&` có phải `0`/`""` không.

**Cách sửa từng bước:**
1. Sửa điều kiện render về boolean rõ ràng.
2. Hoặc bỏ class CSS ẩn.

**Ví dụ trước/sau:**

```jsx
// ❌ TRƯỚC: cartCount = 0 → "0 && <Badge/>" render ra số 0, không render Badge
{cart.count && <CartBadge count={cart.count} />}

// ✅ SAU: ép boolean rõ ràng
{cart.count > 0 && <CartBadge count={cart.count} />}
```

---

### 5.6. API LỖI (CORS / 4xx / 5xx / NULL DATA)

**Triệu chứng:** Request thất bại; UI trống/loading mãi; Console báo CORS; Network tab hiện status đỏ; data trả về `null`/rỗng.

**Nguyên nhân thường gặp & chẩn đoán theo status:**

| Status | Ý nghĩa | Nguyên nhân gốc | Sửa ở đâu |
|---|---|---|---|
| CORS blocked | Trình duyệt chặn cross-origin | Backend chưa allow origin FE | Backend Laravel `config/cors.php` |
| 401 | Chưa xác thực | Thiếu/sai/hết hạn token | API client (gắn header), refresh token |
| 403 | Không có quyền | Sai role/permission | Backend policy hoặc gọi đúng tài khoản |
| 404 | Không tìm thấy | Sai endpoint/base URL | API client URL |
| 422 | Validation fail | Payload sai/thiếu field | Sửa payload phía FE |
| 500 | Lỗi server | Exception backend | Đọc `laravel.log`, sửa backend |
| 200 nhưng null | OK nhưng data rỗng | Shape response khác kỳ vọng | Đọc đúng path data trong response |

**Cách chẩn đoán (luôn mở Network tab):**
1. Tìm request lỗi → xem **Status**, **Request payload**, **Response body**.
2. CORS: xem có header `Access-Control-Allow-Origin` trong response không.
3. 4xx/5xx: đọc response body — Laravel thường trả message lỗi rõ ràng.
4. Null data: so sánh shape thật của response với cách FE đọc (`res.data` vs `res.data.data`).

**Cách sửa từng bước (CORS):**

```php
// Backend Laravel — config/cors.php
// ❌ TRƯỚC: chỉ cho localhost
'allowed_origins' => ['http://localhost:5173'],

// ✅ SAU: thêm domain Daisan (sửa đúng config, không tắt CORS bừa)
'allowed_origins' => [
    'http://localhost:5173',
    'https://store.daisan.vn',
    'https://b2b.daisan.vn',
],
```

**Cách sửa (null data — đọc sai shape):**

```jsx
// API Laravel trả: { data: { items: [...], total: 120 } }
// ❌ TRƯỚC: đọc sai cấp → products = undefined
const res = await api.get("/products");
setProducts(res.data); // res.data là { items, total }, không phải mảng

// ✅ SAU: đọc đúng path
const res = await api.get("/products");
setProducts(res.data?.items ?? []);
```

**Cách sửa (4xx — interceptor gắn token & xử lý lỗi tập trung):**

```js
// api/client.js — sửa tối thiểu ở interceptor, không đổi mọi lời gọi API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("daisan_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) redirectToLogin();
    return Promise.reject(err);
  }
);
```

---

### 5.7. STATE LỖI (stale / undefined / loop re-render)

**Triệu chứng:** Giá trị state cũ không cập nhật; `undefined` khi truy cập; component re-render vô hạn / app treo.

**Nguyên nhân thường gặp:**
- **Undefined:** dùng state trước khi data async về; không có giá trị khởi tạo hợp lý.
- **Stale:** đọc state trong closure (handler/effect) → bắt giá trị cũ.
- **Loop re-render:** `setState` trong thân render; `useEffect` thiếu/sai dependency; object/array literal trong deps thay đổi mỗi render.

**Cách chẩn đoán:**
1. Undefined: log giá trị state ở đầu render — thấy `undefined` thì kiểm tra `useState(initial)`.
2. Stale: kiểm tra có cập nhật state dựa trên state cũ trong closure không.
3. Loop: Console báo "Maximum update depth exceeded" → tìm `setState` gọi vô điều kiện trong render hoặc effect.

**Cách sửa từng bước:**

```jsx
// ❌ LOOP: setState gọi thẳng trong render
function Counter() {
  const [n, setN] = useState(0);
  setN(n + 1); // chạy mỗi render → loop vô hạn
  return <span>{n}</span>;
}
// ✅ SAU: đặt trong event/effect có điều kiện
function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN((prev) => prev + 1)}>{n}</button>;
}
```

```jsx
// ❌ STALE: cộng dồn nhanh bị mất cập nhật (đọc n cũ trong closure)
const addToCart = () => setCount(count + 1);
// ✅ SAU: functional update — luôn đọc giá trị mới nhất
const addToCart = () => setCount((prev) => prev + 1);
```

```jsx
// ❌ LOOP do effect thiếu deps đúng (object literal đổi mỗi render)
useEffect(() => { fetchData({ page }); }); // không có deps → chạy mỗi render
// ✅ SAU: khai báo dependency chính xác
useEffect(() => { fetchData({ page }); }, [page]);
```

---

### 5.8. RESPONSIVE VỠ

**Triệu chứng:** Trên mobile bị tràn ngang (horizontal scroll), chữ/ảnh đè nhau, grid không xuống hàng, sidebar đẩy nội dung.

**Nguyên nhân thường gặp:**
- Width cố định (`w-[1200px]`) thay vì co giãn.
- Thiếu breakpoint responsive (`md:`, `lg:`).
- Flex item không co được do thiếu `min-w-0`.
- Ảnh không `max-w-full`.
- Mobile-first bị làm ngược (viết desktop trước rồi đè).

**Cách chẩn đoán:**
1. DevTools → device toolbar, chọn 375px (mobile).
2. Tìm phần tử gây tràn (thường có width cố định hoặc nội dung dài không wrap).
3. Kiểm tra grid/flex có breakpoint chưa.

**Cách sửa từng bước:** áp dụng tư duy **mobile-first**: mặc định là mobile, dùng `md:`/`lg:` cho màn lớn.

**Ví dụ trước/sau** (lưới sản phẩm DaisanTiles):

```jsx
// ❌ TRƯỚC: 4 cột cứng + width cố định → vỡ mobile, tràn ngang
<div className="grid grid-cols-4 gap-4 w-[1200px]">
  {tiles.map((t) => <TileCard key={t.id} tile={t} />)}
</div>

// ✅ SAU: mobile-first, co giãn theo breakpoint
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl mx-auto px-4">
  {tiles.map((t) => <TileCard key={t.id} tile={t} />)}
</div>
```

```jsx
// Flex item tràn vì text dài không co:
// ❌ <div className="flex"><p className="truncate">{longName}</p></div>
// ✅ thêm min-w-0 để truncate hoạt động trong flex
<div className="flex">
  <p className="truncate min-w-0">{longName}</p>
</div>
```

---

### 5.9. HYDRATION ERROR (Next.js)

**Triệu chứng:** Console báo `Hydration failed because the initial UI does not match what was rendered on the server` / `Text content does not match server-rendered HTML`. Nội dung nhấp nháy hoặc sai khác giữa lần đầu và sau hydrate.

**Nguyên nhân thường gặp:**
- Dùng giá trị **không xác định** (`Date.now()`, `Math.random()`, `new Date().toLocaleString()`) trực tiếp trong render → server và client cho kết quả khác nhau.
- Truy cập `window`/`localStorage`/`document` trong render (chỉ có ở client).
- HTML không hợp lệ (`<div>` lồng trong `<p>`).
- Khác biệt locale/timezone giữa server và client.

**Cách chẩn đoán:**
1. Đọc message — Next.js thường chỉ ra phần text bị lệch.
2. Tìm trong component giá trị động phụ thuộc thời gian/random/`window`.
3. Kiểm tra cấu trúc HTML có hợp lệ không.

**Cách sửa từng bước:**
1. Hoãn render giá trị động đến **sau khi mount** (client-only).
2. Hoặc dùng `next/dynamic` với `ssr: false` cho component thuần client.
3. Format ngày/tiền theo locale cố định để server/client khớp.

**Ví dụ trước/sau:**

```jsx
// ❌ TRƯỚC: render thời gian thật → server ≠ client → hydration error
export default function PriceTimestamp({ price }) {
  return (
    <div>
      <span>{price}</span>
      <small>Cập nhật: {new Date().toLocaleTimeString("vi-VN")}</small>
    </div>
  );
}
```

```jsx
// ✅ SAU: chỉ render giá trị động sau khi mount ở client
import { useEffect, useState } from "react";
export default function PriceTimestamp({ price }) {
  const [time, setTime] = useState(null);
  useEffect(() => { setTime(new Date().toLocaleTimeString("vi-VN")); }, []);
  return (
    <div>
      <span>{price}</span>
      {time && <small>Cập nhật: {time}</small>}
    </div>
  );
}
```

```jsx
// Component phụ thuộc window → tắt SSR
import dynamic from "next/dynamic";
const MapWidget = dynamic(() => import("./MapWidget"), { ssr: false });
```

---

## 6. CHECKLIST SAU KHI SỬA LỖI (Build / Preview / Regression)

Áp dụng sau **mọi** lần sửa, trước khi báo "đã xong".

**Build**
- [ ] `npm run build` (hoặc `vite build`) pass, không warning nghiêm trọng
- [ ] Không còn lỗi import/export, không còn biến `undefined` chưa xử lý
- [ ] Đã xóa hết `console.log`/`dd()`/code debug tạm

**Preview**
- [ ] Console trình duyệt sạch lỗi đỏ
- [ ] Thao tác gây lỗi ban đầu nay chạy đúng
- [ ] UI hiển thị đúng trên desktop và mobile (375px)
- [ ] Network tab: API trả status đúng, data đúng shape

**Regression (chống tái phát & không phá chỗ khác)**
- [ ] Các route/màn hình liên quan vẫn chạy bình thường
- [ ] Component dùng chung (Button, Card, Layout...) không bị ảnh hưởng
- [ ] Không đổi ngoài ý muốn: props, API shape, route name, export
- [ ] Diff nhỏ, dễ review, đúng phạm vi lỗi
- [ ] (Nếu có) thêm guard/test để lỗi không quay lại

---

## 7. AI PHẢI LÀM

- **Đọc nguyên văn thông báo lỗi đầu tiên** và bám stack trace tới đúng file:dòng trong code dự án trước khi sửa.
- **Phân biệt triệu chứng và nguyên nhân gốc**; chỉ sửa khi đã kiểm chứng được nguyên nhân bằng bằng chứng (Console/Network/response/log).
- **Đi đủ 6 bước** trong quy trình debug chuẩn cho mọi lỗi.
- **Áp dụng diff tối thiểu**: sửa đúng dòng/đoạn liên quan, giữ nguyên style và kiến trúc xung quanh.
- **Bảo toàn hợp đồng**: giữ nguyên chữ ký hàm, tên/kiểu props, shape API, tên route, export — trừ khi chính chúng gây lỗi.
- **Thêm guard dữ liệu hợp lý** (default value, optional chaining, loading state) cho data async để tránh blank screen.
- **Sửa CORS/4xx/5xx đúng layer**: cấu hình backend cho CORS, payload/header phía FE cho 4xx, logic backend cho 5xx.
- **Tôn trọng mobile-first** khi sửa responsive; dùng breakpoint Tailwind chuẩn.
- **Xóa code debug tạm** và **chạy đủ checklist** (build + preview + regression) trước khi báo hoàn tất.
- **Dùng màu thương hiệu** (cam Daisan `#E8551F`, phụ xám/xanh) khi cần style lại — không tự ý đổi hệ màu.
- **Giải thích ngắn gọn bằng tiếng Việt**: lỗi là gì, nguyên nhân, đã sửa thế nào, vì sao tối thiểu.

## 8. AI KHÔNG ĐƯỢC LÀM

- **KHÔNG** nhảy vào sửa code khi chưa đọc lỗi và chưa xác định nguyên nhân gốc.
- **KHÔNG** viết lại cả component/file lớn khi chỉ cần sửa 1–vài dòng.
- **KHÔNG** xóa file, xóa component, hay comment-out khối code lớn để "cho hết lỗi".
- **KHÔNG** đổi kiến trúc/thư viện (router, state management, SSR↔CSR) để vá một lỗi cục bộ.
- **KHÔNG** đổi chữ ký hàm, tên/kiểu props, shape API response, tên route, export name nếu chúng không phải nguyên nhân lỗi.
- **KHÔNG** che triệu chứng bằng `try/catch` rỗng hay rải `?.` khắp nơi thay vì tìm nguyên nhân.
- **KHÔNG** sửa cấu hình toàn cục (`tailwind.config.js`, `vite.config.js`, `cors.php`, `.env`) khi lỗi chỉ cục bộ và không bắt nguồn từ đó.
- **KHÔNG** tắt validation backend, tắt CORS bằng wildcard `*` cho production, hay hardcode token để "qua lỗi".
- **KHÔNG** nâng cấp/đổi version thư viện như một cách sửa lỗi (trừ khi bug nằm đúng ở version đó và được xác nhận).
- **KHÔNG** để lại `console.log`/`dd()`/code debug trong bản sửa cuối.
- **KHÔNG** báo "đã sửa xong" khi chưa chạy build, chưa preview, chưa kiểm tra regression.
- **KHÔNG** đổi hệ màu/branding hay format/refactor code ngoài phạm vi lỗi.
