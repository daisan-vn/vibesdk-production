# NHÓM 5 — Prompt sửa lỗi (giống Lovable)

Bộ 10 prompt thực chiến giúp Claude/Daisan.ai debug giao diện và logic của hệ sinh thái Daisan (React + Tailwind + Vite/Next.js, mở rộng Laravel/API/Elasticsearch) theo nguyên tắc bất biến: **đọc lỗi → tìm đúng nguyên nhân gốc → sửa TỐI THIỂU, KHÔNG phá code cũ** (tham chiếu `ERROR_PLAYBOOK.md`).

---

### 53. Sửa lỗi màn hình trắng (blank screen)

- **Khi nào dùng:** Khi app Daisan (DaisanStore/DaisanTiles/Daisan.vn…) chạy lên chỉ thấy nền trắng, không render gì, hoặc trắng sau khi vừa thêm/sửa một component/route.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend kỳ cựu của Daisan, đang debug app React + Tailwind (Vite/Next.js) thuộc hệ sinh thái Daisan (DaisanStore/DaisanTiles/Daisan.vn — thương mại gạch ốp lát & VLXD). App đang bị MÀN HÌNH TRẮNG (blank screen): không render nội dung nào.

Tuân thủ tuyệt đối ERROR_PLAYBOOK.md theo quy trình: ĐỌC LỖI → TÌM NGUYÊN NHÂN GỐC → SỬA TỐI THIỂU, KHÔNG refactor ngoài phạm vi, KHÔNG phá kiến trúc/code cũ.

Bối cảnh tôi cung cấp (thay phần trong [ ]):
- Lỗi trong Console trình duyệt: [DÁN nguyên văn lỗi đỏ + stack trace, nếu trắng hoàn toàn thì ghi "không có lỗi console"]
- Component/route vừa thay đổi gần nhất: [TÊN file + mô tả]
- Code liên quan: [DÁN nội dung file App/Router/component nghi ngờ]

Hãy thực hiện theo đúng thứ tự:
1. Phân loại nguyên nhân blank screen phổ biến và soi đúng case của Daisan:
   - Lỗi runtime ném ra trước khi render (undefined.map, đọc thuộc tính của null/undefined trên dữ liệu sản phẩm gạch như product.attributes.size).
   - Import sai / default vs named export khiến component = undefined.
   - Lỗi trong Provider gốc (Router, Theme, QueryClient, Context giỏ hàng) làm sập cả cây.
   - JSX trả về undefined/null toàn cục, hoặc return sớm khi data chưa kịp load mà thiếu loading state.
   - Lỗi do điều kiện môi trường (biến env VITE_API_URL undefined) làm fetch ngay lúc mount ném lỗi.
2. Chỉ ra DÒNG/NGUYÊN NHÂN gốc cụ thể, giải thích ngắn gọn vì sao gây trắng màn hình.
3. Đề xuất bản vá TỐI THIỂU: thêm optional chaining / guard / sửa import / bọc ErrorBoundary — chỉ chạm đúng chỗ gây lỗi, KHÔNG đổi cấu trúc thư mục, KHÔNG đổi API contract.
4. Nếu chưa đủ thông tin, hướng dẫn tôi 2-3 bước chẩn đoán nhanh (mở Console, thêm console.error tạm tại điểm nghi ngờ, kiểm tra Network).

Ràng buộc: React function component + hooks, Tailwind utility-first, giữ màu thương hiệu CAM Daisan cho mọi UI báo lỗi; mock data đúng schema PIM (id, sku, name, attributes, price, stock, images).

Output bắt buộc:
- Mục "Nguyên nhân gốc" (1 đoạn ngắn).
- Mục "Bản vá tối thiểu": code dạng diff hoặc nêu rõ trước/sau, chỉ phần thay đổi.
- Mục "Danh sách file thay đổi".
- Mục "Cách xác nhận đã hết lỗi" (bước kiểm tra cụ thể).
Tiêu chí hoàn thành: app render lại bình thường, không phát sinh lỗi mới, các state loading/empty/error vẫn hoạt động.
```
- **Đầu ra mong muốn:** Một bản phân tích ngắn chỉ ra nguyên nhân gốc, bản vá tối thiểu (diff/before-after) chỉ chạm đúng điểm lỗi, danh sách file thay đổi và bước xác nhận hết trắng màn hình.
- **Lưu ý khi dùng:** Luôn dán nguyên văn lỗi Console — nếu trắng hoàn toàn không lỗi, thường là Provider gốc hoặc export sai. Nhớ thay `[VITE_API_URL]` và tên file thật. Đừng để Claude "viết lại từ đầu" — nhắc lại "SỬA TỐI THIỂU" nếu nó refactor.

---

### 54. Sửa lỗi import/export (module not found, undefined component)

- **Khi nào dùng:** Khi gặp "Module not found", "does not provide an export named…", hoặc component import vào lại là `undefined`/render ra lỗi React.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan, debug lỗi IMPORT/EXPORT trong codebase React + Tailwind (Vite/Next.js) của hệ sinh thái Daisan (gạch ốp lát, VLXD, marketplace).

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không đổi cấu trúc thư mục, không refactor lan rộng.

Thông tin tôi cung cấp (thay [ ]):
- Lỗi nguyên văn: [DÁN, ví dụ "Module not found: Can't resolve '@/components/ProductCard'" hoặc "Element type is invalid: expected a string... but got: undefined"]
- File đang import (đường dẫn + dòng import liên quan): [DÁN]
- File được import (đoạn export): [DÁN]

Hãy chẩn đoán theo checklist:
1. Default export vs named export: import `X` từ `default` nhưng file lại `export const X`, hoặc ngược lại.
2. Sai đường dẫn tương đối/alias (`@/`, `~/`) — kiểm tra cấu hình alias trong vite.config/tsconfig/jsconfig của dự án Daisan.
3. Sai hoa/thường tên file (case-sensitive trên server Linux/Docker dù Windows chạy ổn) — rất hay gặp khi deploy Daisan lên Docker.
4. Thiếu phần mở rộng hoặc import nhầm file index.
5. Vòng lặp import (circular import) khiến một bên là undefined lúc khởi tạo.
6. Import type vào nơi cần giá trị (hoặc ngược lại) trong dự án TypeScript.

Yêu cầu:
- Chỉ rõ nguyên nhân gốc và dòng cần sửa.
- Đưa bản vá TỐI THIỂU: chỉnh đúng câu import/export hoặc đúng đường dẫn; KHÔNG đổi tên component public nếu nó đang được nơi khác dùng (tránh vỡ chỗ khác).
- Nếu là circular import, đề xuất tách phần dùng chung ra module riêng theo cách ít xáo trộn nhất.
- Nếu nghi do case-sensitivity, nêu rõ tên file đúng phải là gì.

Ràng buộc: giữ convention đặt tên & cấu trúc thư mục hiện có của Daisan; component UI giữ màu thương hiệu CAM Daisan.

Output:
- "Nguyên nhân gốc".
- "Bản vá": before/after từng dòng import/export.
- "Danh sách file thay đổi".
- "Kiểm tra phụ": nhắc tôi grep xem còn nơi nào import cũ bị ảnh hưởng không.
Tiêu chí hoàn thành: build/dev server không còn báo lỗi module, component render đúng, không vỡ import ở file khác.
```
- **Đầu ra mong muốn:** Xác định đúng loại lỗi import/export, bản vá before/after cho dòng import/export, cảnh báo các nơi khác có thể bị ảnh hưởng, và cách kiểm tra không vỡ chỗ khác.
- **Lưu ý khi dùng:** Lỗi "chạy local ổn, deploy Docker lỗi" gần như chắc chắn do hoa/thường tên file. Luôn dán cả phần export của file đích. Đừng để Claude đổi tên export đang được dùng nơi khác — nhắc nó grep trước.

---

### 55. Sửa lỗi React Router (route trắng, 404, useNavigate/useParams lỗi)

- **Khi nào dùng:** Khi điều hướng trong DaisanStore/DaisanTiles bị 404 sai, route con không hiện, hoặc lỗi "useNavigate() may be used only in the context of a <Router>".
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan, debug lỗi ĐIỀU HƯỚNG (React Router) trong app React + Tailwind của hệ sinh thái Daisan (catalog gạch, trang sản phẩm /san-pham/:slug, trang danh mục, giỏ hàng, checkout).

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không đổi sơ đồ route đang chạy ổn nếu không cần.

Thông tin tôi cung cấp (thay [ ]):
- Phiên bản router: [react-router-dom v6/v7 hay khác]
- Lỗi nguyên văn / triệu chứng: [DÁN, ví dụ "useNavigate() may be used only in the context of a <Router> component" hoặc "vào /san-pham/gach-bong-30x30 bị trắng"]
- Khai báo route (App/Router config): [DÁN]
- Component gây lỗi (chỗ dùng useNavigate/useParams/Link): [DÁN]

Chẩn đoán theo checklist React Router v6/v7:
1. Hook router (useNavigate/useParams/useLocation) bị gọi ở component nằm NGOÀI <BrowserRouter>/<RouterProvider>.
2. Route con khai báo sai: thiếu <Outlet/> ở layout cha, hoặc path con đặt dấu "/" đầu khiến thành absolute.
3. Dynamic param sai tên: route khai báo :slug nhưng code đọc params.id.
4. Thiếu route catch-all "*" nên URL hợp lệ vẫn rơi vào trắng.
5. Link/NavLink dùng "to" sai (tương đối vs tuyệt đối), hoặc dùng thẻ <a href> làm reload mất state.
6. Lazy route + Suspense thiếu fallback gây trắng khi tách bundle.

Yêu cầu:
- Chỉ ra nguyên nhân gốc + dòng cần sửa.
- Bản vá TỐI THIỂU: bọc đúng Router, thêm <Outlet/>, sửa path/param — chỉ chạm route liên quan, KHÔNG viết lại toàn bộ bảng route.
- Đảm bảo URL thân thiện SEO của Daisan (vd /san-pham/:slug, /danh-muc/:slug) vẫn giữ nguyên.

Ràng buộc: React function component + hooks, Tailwind; trang 404/empty giữ phong cách & màu CAM Daisan.

Output:
- "Nguyên nhân gốc".
- "Bản vá": before/after phần route/hook liên quan.
- "Danh sách file thay đổi".
- "Cách kiểm tra": liệt kê các URL cần thử lại (sản phẩm, danh mục, route con, URL sai → 404 đúng).
Tiêu chí hoàn thành: mọi route điều hướng đúng, không lỗi context, 404 hiển thị trang tùy biến Daisan thay vì trắng.
```
- **Đầu ra mong muốn:** Nguyên nhân gốc về cấu hình router, bản vá tối thiểu cho route/hook liên quan, giữ URL SEO, và danh sách URL cần test lại.
- **Lưu ý khi dùng:** Nêu rõ phiên bản react-router-dom (v6 vs v7 khác cú pháp). Lỗi "useNavigate ... context of a Router" thường do test/Storybook hoặc component dùng ngoài cây Router. Giữ nguyên slug SEO — đừng để Claude đổi `:slug` thành `:id`.

---

### 56. Sửa lỗi Tailwind không hiển thị (class không ăn style)

- **Khi nào dùng:** Khi class Tailwind viết đúng nhưng không có hiệu lực, hoặc một số class (đặc biệt class động/màu thương hiệu) bị mất style sau build.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan, debug lỗi TAILWIND KHÔNG ÁP DỤNG STYLE trong app React của hệ sinh thái Daisan (DaisanStore/DaisanTiles). Class viết ra nhưng UI không đổi.

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không đổi design token/brand color đang chuẩn.

Thông tin tôi cung cấp (thay [ ]):
- Phiên bản Tailwind: [v3 hay v4]
- Triệu chứng cụ thể: [DÁN, ví dụ "class bg-daisan-500 không lên màu cam", "padding md: không ăn", "class chạy dev nhưng mất khi build production"]
- tailwind.config (content/theme) + file CSS gốc (@tailwind / @import): [DÁN]
- Đoạn JSX dùng class lỗi: [DÁN]

Chẩn đoán theo checklist:
1. Cấu hình content/paths không quét tới file chứa class (thiếu đường dẫn src, .tsx, hoặc thư mục component dùng chung) → class bị purge khi build.
2. Class động ghép chuỗi (`bg-${color}-500`, `text-daisan-${level}`) bị Tailwind purge vì không nhận diện được chuỗi tĩnh → cần safelist hoặc map class đầy đủ.
3. Màu thương hiệu CAM Daisan chưa khai báo trong theme.extend.colors nên `bg-daisan-500` không tồn tại.
4. Thiếu directive @tailwind base/components/utilities (v3) hoặc @import "tailwindcss" (v4), hoặc CSS gốc không được import vào entry.
5. Xung đột thứ tự CSS / bị override bởi CSS khác / dùng @apply sai chỗ.
6. (v4) thay đổi cú pháp config sang CSS-first nhưng vẫn để config kiểu cũ.

Yêu cầu:
- Chỉ ra nguyên nhân gốc.
- Bản vá TỐI THIỂU: bổ sung đúng path content / khai báo màu daisan trong theme / safelist class động — KHÔNG đổi token màu đã chuẩn, KHÔNG thay toàn bộ config.
- Với class động: đề xuất cách an toàn (map object class tĩnh) thay vì ghép chuỗi.

Ràng buộc: giữ bảng màu thương hiệu CAM Daisan (đỏ cam) + xám/xanh; mobile-first.

Output:
- "Nguyên nhân gốc".
- "Bản vá": phần config/CSS/JSX cần sửa (before/after).
- "Danh sách file thay đổi".
- "Cách kiểm tra": build lại và xác nhận class lên đúng ở cả dev và production.
Tiêu chí hoàn thành: class hiển thị đúng ở dev và sau build, màu CAM Daisan đúng, không class nào bị purge ngoài ý muốn.
```
- **Đầu ra mong muốn:** Xác định nguyên nhân (purge/content path/màu chưa khai báo/class động), bản vá tối thiểu vào config/CSS và cách viết class động an toàn, kèm cách verify ở production.
- **Lưu ý khi dùng:** Lỗi "dev ổn, build mất style" gần như luôn là purge do `content` thiếu path hoặc class ghép chuỗi. Khai báo màu `daisan` trong `theme.extend.colors` trước. Phân biệt Tailwind v3 vs v4 vì cú pháp config khác nhau.

---

### 57. Sửa lỗi responsive bị vỡ (mobile/tablet lệch, tràn ngang)

- **Khi nào dùng:** Khi grid sản phẩm gạch, header, hay bộ lọc bị tràn ngang, chồng lấn hoặc vỡ bố cục trên mobile/tablet dù desktop vẫn đẹp.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan chuyên responsive, debug lỗi BỐ CỤC VỠ TRÊN MOBILE/TABLET cho app React + Tailwind của hệ sinh thái Daisan (lưới sản phẩm gạch, trang danh mục, bộ lọc thuộc tính, header, giỏ hàng).

Tuân thủ ERROR_PLAYBOOK.md và UI_UX_STANDARD.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, mobile-first, không phá layout desktop đang ổn.

Thông tin tôi cung cấp (thay [ ]):
- Triệu chứng + breakpoint lỗi: [DÁN, ví dụ "trên iPhone (375px) lưới sản phẩm tràn ngang, có scroll ngang", "tablet 768px filter đè lên grid"]
- Component/đoạn JSX + class Tailwind hiện tại: [DÁN]
- Ảnh chụp màn hình nếu có: [đính kèm/mô tả]

Chẩn đoán theo checklist responsive Tailwind:
1. Dùng width/spacing cố định (w-[1200px], px lớn) thay vì utility co giãn (max-w, w-full, container).
2. Grid cố định cột (grid-cols-4) không hạ cấp ở breakpoint nhỏ (thiếu grid-cols-1 sm:grid-cols-2 lg:grid-cols-4).
3. Phần tử gây tràn ngang: ảnh sản phẩm thiếu max-w-full, bảng thông số kỹ thuật gạch không cuộn, chuỗi dài (mã SKU) không break-words.
4. Flex thiếu flex-wrap / min-w-0 khiến item không co lại được.
5. Dùng giá trị viewport sai (100vw gây tràn do scrollbar), position absolute không kèm container relative.
6. Padding/gap quá lớn ở mobile, hoặc font-size không giảm theo breakpoint.

Yêu cầu:
- Chỉ ra phần tử/class gây vỡ và lý do.
- Bản vá TỐI THIỂU theo mobile-first: thêm/sửa đúng prefix breakpoint (sm/md/lg/xl), thêm flex-wrap/min-w-0/max-w-full — KHÔNG đập layout desktop, KHÔNG đổi cấu trúc component.
- Đảm bảo không còn scroll ngang ở 360px, 375px, 768px.

Ràng buộc: Tailwind mobile-first, vùng chạm tối thiểu 44px cho nút trên mobile, giữ màu CAM Daisan và spacing token chuẩn.

Output:
- "Nguyên nhân gốc" (liệt kê đúng phần tử/class).
- "Bản vá": class trước/sau cho từng phần tử.
- "Danh sách file thay đổi".
- "Cách kiểm tra": breakpoint cần test (360/375/414/768/1024) và tiêu chí không tràn ngang.
Tiêu chí hoàn thành: bố cục đẹp & không tràn ngang trên mobile/tablet, desktop giữ nguyên, đủ trạng thái như trước.
```
- **Đầu ra mong muốn:** Danh sách phần tử/class gây vỡ, bản vá class trước/sau theo mobile-first, và bộ breakpoint cần test để xác nhận hết tràn ngang.
- **Lưu ý khi dùng:** Cung cấp breakpoint cụ thể bị lỗi và ảnh chụp nếu có. Nguyên nhân tràn ngang số 1 là `w-[..px]` cố định và ảnh thiếu `max-w-full`. Nhắc Claude giữ nguyên desktop để không "sửa chỗ này hỏng chỗ kia".

---

### 58. Sửa lỗi build (Vite/Next build fail, lỗi compile/type)

- **Khi nào dùng:** Khi `npm run build`/`vite build`/`next build` thất bại với lỗi compile, type, hoặc thiếu dependency — đặc biệt trước khi deploy Docker.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan, debug lỗi BUILD THẤT BẠI cho app React + Tailwind (Vite hoặc Next.js) trong hệ sinh thái Daisan, thường gặp khi build trước lúc deploy lên Docker.

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không tắt type-check/lint để "qua cho xong", không refactor lan rộng.

Thông tin tôi cung cấp (thay [ ]):
- Lệnh build: [npm run build / vite build / next build]
- Log lỗi nguyên văn (đầy đủ, cả phần stack): [DÁN]
- File/dòng được nhắc trong log: [DÁN nội dung]
- Môi trường: [local Windows / CI / Docker Linux], Node version: [...]

Chẩn đoán theo checklist build:
1. Lỗi TypeScript thật (type không khớp, thiếu property trên type sản phẩm/đơn hàng) — sửa đúng type, không dùng any bừa.
2. Import không tồn tại / sai case (Windows build ổn, Docker Linux fail vì phân biệt hoa thường).
3. Thiếu dependency trong package.json (chạy được local do cài lẻ nhưng CI/Docker cài sạch nên thiếu).
4. Dùng API chỉ có ở client trong code chạy lúc build/SSR (window/document trong Next.js) — cần guard hoặc dynamic import ssr:false.
5. Biến môi trường thiếu lúc build (VITE_*, NEXT_PUBLIC_*) khiến giá trị undefined hoặc lỗi.
6. Cú pháp/feature chưa được transpile, hoặc xung đột version package.

Yêu cầu:
- Đọc log, xác định LỖI ĐẦU TIÊN thực sự (không phải lỗi dây chuyền phía sau).
- Nêu nguyên nhân gốc + dòng/file cần sửa.
- Bản vá TỐI THIỂU: sửa đúng type/import/guard, hoặc bổ sung dependency/env — KHÔNG dùng @ts-ignore/eslint-disable hàng loạt, KHÔNG hạ cấp config kiểm tra.
- Nếu là lỗi window/document trên SSR, đề xuất guard `typeof window !== 'undefined'` hoặc dynamic import ở mức nhỏ nhất.

Ràng buộc: giữ TypeScript strict & lint hiện có; nếu thêm dependency phải nêu rõ tên + lý do.

Output:
- "Lỗi gốc đầu tiên".
- "Nguyên nhân".
- "Bản vá": before/after, hoặc lệnh cài dependency/khai báo env cần thêm.
- "Danh sách file thay đổi".
- "Cách kiểm tra": chạy lại build sạch (xóa node_modules nếu cần) và xác nhận pass.
Tiêu chí hoàn thành: build pass trên cả local và môi trường Docker/CI, không tắt kiểm tra type/lint, không thêm any/ignore vô tội vạ.
```
- **Đầu ra mong muốn:** Xác định lỗi đầu tiên thực sự trong log, nguyên nhân gốc, bản vá tối thiểu (sửa type/import/guard hoặc thêm dep/env) và cách build lại sạch để verify.
- **Lưu ý khi dùng:** Luôn dán log đầy đủ — Claude cần thấy lỗi ĐẦU TIÊN, không phải lỗi dây chuyền. Nhấn mạnh "không tắt type-check để qua cho xong". Lỗi "local ổn, Docker fail" thường là case-sensitive hoặc thiếu dep trong package.json.

---

### 59. Sửa lỗi API (fetch fail, CORS, 401/500, dữ liệu rỗng)

- **Khi nào dùng:** Khi gọi API Daisan (PIM/catalog/search Elasticsearch/Laravel backend) bị lỗi: CORS, 401/403, 404, 500, timeout, hoặc trả dữ liệu nhưng UI không nhận đúng.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Fullstack Daisan, debug lỗi GỌI API giữa frontend React + Tailwind và backend Daisan (Laravel/PHP/MySQL, search qua Elasticsearch, dữ liệu sản phẩm theo schema PIM).

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN (client hay server hay tầng mạng) → SỬA TỐI THIỂU, không sửa bừa cả hai đầu khi chưa khoanh vùng.

Thông tin tôi cung cấp (thay [ ]):
- Triệu chứng + mã lỗi: [DÁN, ví dụ "fetch /api/products bị CORS", "401 Unauthorized", "200 nhưng products = undefined", "search Elasticsearch trả rỗng"]
- Tab Network (request URL, method, status, response body, request/response headers): [DÁN]
- Code gọi API ở frontend (fetch/axios + xử lý response): [DÁN]
- Endpoint backend liên quan nếu có: [DÁN route/controller]

Chẩn đoán theo lớp, khoanh vùng trước khi sửa:
1. Tầng mạng/CORS: thiếu header Access-Control-Allow-Origin, sai origin, preflight OPTIONS fail → đây là cấu hình server, không "vá" bằng cách tắt bảo mật ở client.
2. Xác thực: 401/403 do thiếu/sai token (Bearer), token hết hạn, cookie không gửi kèm (thiếu credentials: 'include').
3. URL/base sai: VITE_API_URL/baseURL sai môi trường (dev trỏ nhầm prod), thiếu prefix /api, trailing slash.
4. Hợp đồng dữ liệu: response bọc trong { data: [...] } nhưng client đọc thẳng res; field tên khác (snake_case backend vs camelCase client); phân trang khác cấu trúc.
5. Lỗi 500 server: đọc message để biết là validation, query MySQL, hay mapping Elasticsearch.
6. Xử lý bất đồng bộ/lỗi: thiếu try/catch, không check res.ok, không xử lý loading/empty/error nên UI hiểu nhầm là rỗng.

Yêu cầu:
- Khoanh vùng: lỗi ở CLIENT, SERVER hay MẠNG/CORS — nêu bằng chứng từ Network.
- Bản vá TỐI THIỂU đúng tầng: sửa cách đọc response / thêm token / sửa baseURL / hoặc chỉ ra cấu hình CORS phía Laravel cần chỉnh — KHÔNG tắt CORS toàn cục bừa bãi, KHÔNG hardcode token.
- Đảm bảo UI có đủ state loading/empty/error theo ERROR_PLAYBOOK, dùng mock data đúng schema PIM khi cần test.

Ràng buộc: React hooks; thông báo lỗi cho người dùng bằng tiếng Việt, UI lỗi giữ màu CAM Daisan; không lộ chi tiết kỹ thuật ra UI.

Output:
- "Khoanh vùng lỗi" (client/server/mạng + bằng chứng).
- "Nguyên nhân gốc".
- "Bản vá": before/after ở đúng tầng.
- "Danh sách file thay đổi".
- "Cách kiểm tra": lệnh/curl hoặc bước test lại request, xác nhận status 2xx và UI nhận đúng dữ liệu.
Tiêu chí hoàn thành: API trả đúng, UI hiển thị dữ liệu/empty/error đúng, không tắt bảo mật, không hardcode bí mật.
```
- **Đầu ra mong muốn:** Khoanh vùng lỗi (client/server/mạng) kèm bằng chứng từ Network, nguyên nhân gốc, bản vá tối thiểu đúng tầng và cách test lại bằng curl/Network.
- **Lưu ý khi dùng:** Dán đầy đủ thông tin tab Network (status, headers, body). CORS phải sửa ở server, đừng để Claude "vá" bằng cách tắt bảo mật client. Lỗi "200 nhưng undefined" thường do response bọc `{ data: [...] }` hoặc snake_case vs camelCase.

---

### 60. Sửa lỗi state/render (re-render vô hạn, state không cập nhật, stale state)

- **Khi nào dùng:** Khi gặp "Too many re-renders", giỏ hàng/bộ lọc không cập nhật khi bấm, state cũ bị "kẹt", hoặc useEffect chạy lặp vô hạn.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan chuyên React state, debug lỗi STATE/RENDER trong app React + Tailwind của hệ sinh thái Daisan (giỏ hàng, bộ lọc thuộc tính gạch, biến thể sản phẩm, ô tìm kiếm).

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC LỖI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không thay quản lý state toàn cục khi chỉ cần sửa một hook.

Thông tin tôi cung cấp (thay [ ]):
- Triệu chứng / lỗi: [DÁN, ví dụ "Too many re-renders", "bấm thêm vào giỏ nhưng số lượng không đổi", "đổi bộ lọc mà list không cập nhật", "useEffect chạy liên tục"]
- Component + hook liên quan (useState/useEffect/useMemo/useCallback/reducer/context): [DÁN]

Chẩn đoán theo checklist React state:
1. Re-render vô hạn: gọi setState trực tiếp trong thân render, hoặc useEffect setState mà dependency thay đổi mỗi lần (object/array/function tạo mới mỗi render).
2. Cập nhật state không bất biến: mutate trực tiếp mảng/đối tượng (push, gán field) khiến React không nhận ra thay đổi → UI không cập nhật (rất hay gặp với mảng items giỏ hàng).
3. Stale closure: dùng giá trị state cũ trong callback/setInterval/effect; cần dùng dạng updater setState(prev => ...).
4. Dependency array sai: thiếu hoặc thừa dependency ở useEffect/useMemo/useCallback.
5. Key sai trong list (dùng index) khiến React tái dùng nhầm node, state con bị lẫn.
6. Lift state / context: state đặt sai cấp khiến cập nhật không lan tới nơi cần.

Yêu cầu:
- Chỉ ra nguyên nhân gốc + dòng cụ thể.
- Bản vá TỐI THIỂU: sửa cập nhật bất biến (spread/map/filter), dùng updater function, sửa dependency, memo hóa đúng chỗ — KHÔNG thêm Redux/Zustand nếu chỉ cần sửa hook cục bộ, KHÔNG đổi kiến trúc state toàn app.
- Giải thích vì sao bản vá khắc phục đúng vòng đời render.

Ràng buộc: React function component + hooks; logic giỏ hàng/bộ lọc phải đúng số lượng, biến thể, tồn kho theo schema PIM.

Output:
- "Nguyên nhân gốc".
- "Bản vá": before/after đoạn hook/cập nhật state.
- "Danh sách file thay đổi".
- "Cách kiểm tra": thao tác cụ thể (thêm giỏ, đổi filter, đổi số lượng) để xác nhận state cập nhật đúng và không re-render thừa.
Tiêu chí hoàn thành: state cập nhật đúng, hết re-render vô hạn, không phát sinh cảnh báo hook, không đổi kiến trúc state ngoài phạm vi.
```
- **Đầu ra mong muốn:** Nguyên nhân gốc về vòng đời render/state, bản vá tối thiểu (cập nhật bất biến, updater function, sửa deps), và thao tác cụ thể để xác nhận hết lỗi.
- **Lưu ý khi dùng:** "UI không đổi khi bấm" thường do mutate trực tiếp mảng thay vì tạo mảng mới. "Too many re-renders" do setState trong thân render. Ngăn Claude lôi Redux/Zustand vào khi chỉ cần sửa một hook.

---

### 61. Sửa lỗi component không hiện (render ra rỗng dù có dữ liệu)

- **Khi nào dùng:** Khi component (card sản phẩm, modal, dropdown bộ lọc, danh sách) không xuất hiện dù không có lỗi đỏ — DOM trống hoặc bị ẩn.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend Daisan, debug lỗi COMPONENT KHÔNG HIỂN THỊ trong app React + Tailwind của hệ sinh thái Daisan (card sản phẩm gạch, modal chi tiết, dropdown lọc theo kích thước/màu/bề mặt, danh sách kết quả search). Không có lỗi đỏ nhưng component không hiện.

Tuân thủ ERROR_PLAYBOOK.md: ĐỌC TRẠNG THÁI → TÌM NGUYÊN NHÂN → SỬA TỐI THIỂU, không xóa logic điều kiện đang cần thiết.

Thông tin tôi cung cấp (thay [ ]):
- Triệu chứng: [DÁN, ví dụ "list sản phẩm trống dù API trả 12 item", "modal không mở khi bấm", "dropdown filter không thấy"]
- Component + nơi render nó (parent) + dữ liệu/điều kiện hiển thị: [DÁN]

Chẩn đoán theo checklist "không render":
1. Điều kiện render chặn nhầm: `{isOpen && <Modal/>}` với isOpen luôn false; `{items.length && ...}` trả 0 (falsy) làm mất render; điều kiện loading mãi không tắt.
2. Dữ liệu thực sự rỗng/không như nghĩ: items là undefined, hoặc nằm trong res.data chứ không phải res; map sai field schema PIM.
3. Bị ẩn bằng CSS: display:none, hidden, opacity-0, h-0/overflow-hidden, z-index thấp bị che, hoặc nằm ngoài viewport (absolute lệch).
4. Component được render nhưng JSX trả null do early return (state error/empty kích hoạt nhầm).
5. Portal/modal thiếu container, hoặc thiếu state mở; dropdown thiếu xử lý toggle.
6. Key/guard khiến React bỏ qua, hoặc parent không thực sự render child (quên đặt <Child/> vào cây).

Yêu cầu:
- Phân biệt rõ: component KHÔNG được render, render ra NULL, hay render nhưng BỊ ẨN bằng CSS — nêu cách tôi tự kiểm tra nhanh (Elements/DevTools).
- Chỉ ra nguyên nhân gốc.
- Bản vá TỐI THIỂU: sửa điều kiện (dùng items?.length > 0), sửa đọc dữ liệu, gỡ class ẩn, hoặc bật state — KHÔNG xóa state loading/empty/error, KHÔNG đổi cấu trúc component.

Ràng buộc: React hooks, Tailwind; giữ đủ 4 state (hover/loading/empty/error) và màu CAM Daisan.

Output:
- "Phân loại" (không render / null / bị ẩn).
- "Nguyên nhân gốc".
- "Bản vá": before/after.
- "Danh sách file thay đổi".
- "Cách kiểm tra": bước xác nhận component hiện đúng với dữ liệu có và empty state đúng khi không dữ liệu.
Tiêu chí hoàn thành: component hiển thị đúng khi có dữ liệu, empty state đúng khi rỗng, không mất các state khác.
```
- **Đầu ra mong muốn:** Phân loại đúng (không render / null / bị ẩn CSS), nguyên nhân gốc, bản vá tối thiểu cho điều kiện/đọc dữ liệu/CSS, và cách xác nhận hiển thị đúng.
- **Lưu ý khi dùng:** Bẫy kinh điển `{items.length && <List/>}` render ra số `0`; dùng `items?.length > 0`. Nhắc Claude phân biệt "không render" với "bị ẩn bằng CSS" qua DevTools Elements. Giữ lại empty/loading state — đừng để nó xóa.

---

### 62. Sửa giao diện xấu/lệch bố cục (căn lề, khoảng cách, alignment)

- **Khi nào dùng:** Khi component chạy đúng nhưng nhìn xấu/lệch: chữ không thẳng hàng, khoảng cách lộn xộn, card cao thấp khác nhau, nút lệch, không bám chuẩn UI Daisan.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư Frontend kiêm UI craftsman của Daisan, tinh chỉnh GIAO DIỆN XẤU/LỆCH BỐ CỤC cho app React + Tailwind trong hệ sinh thái Daisan (lưới card sản phẩm gạch, trang chi tiết, bộ lọc, header, bảng giá sỉ DaisanDepot). Code chạy đúng nhưng trông chưa chỉn chu.

Tuân thủ ERROR_PLAYBOOK.md + UI_UX_STANDARD.md: ĐỌC HIỆN TRẠNG → TÌM CHỖ LỆCH → SỬA TỐI THIỂU bằng class Tailwind, không đổi cấu trúc HTML/logic, không đổi token thương hiệu.

Thông tin tôi cung cấp (thay [ ]):
- Vấn đề thẩm mỹ cụ thể: [DÁN, ví dụ "card sản phẩm cao thấp lệch nhau", "giá và nút thêm giỏ không thẳng đáy", "khoảng cách giữa các section lúc to lúc nhỏ", "chữ tiêu đề dài đẩy layout"]
- JSX + class Tailwind hiện tại: [DÁN]
- Ảnh chụp nếu có: [đính kèm/mô tả]

Chẩn đoán theo checklist UI craft:
1. Alignment: thiếu items-center/justify-between, baseline lệch, icon và chữ không cùng trục; cần flex + items-center hoặc grid căn chuẩn.
2. Chiều cao card không đều: thiếu h-full/flex-col + mt-auto để đẩy nút giá xuống đáy; ảnh tỉ lệ khác nhau cần aspect-ratio cố định cho ảnh gạch.
3. Khoảng cách không nhất quán: trộn margin lung tung thay vì dùng gap/space-y theo thang spacing token Daisan (4/8/12/16/24...).
4. Typography: cỡ chữ/đậm/màu không theo cấp bậc UI_UX_STANDARD; tiêu đề dài cần line-clamp.
5. Lưới: cột không đều do thiếu grid + gap chuẩn; phần tử tràn do thiếu min-w-0.
6. Tinh chỉnh brand: dùng đúng màu CAM Daisan cho CTA, viền/nền xám trung tính, bo góc & shadow đồng nhất.

Yêu cầu:
- Liệt kê các điểm lệch cụ thể và lý do.
- Bản vá TỐI THIỂU bằng class Tailwind: căn flex/grid, đồng đều chiều cao card (h-full + flex-col + mt-auto), chuẩn hóa gap/spacing theo token, aspect-ratio cho ảnh, line-clamp cho tiêu đề — KHÔNG đổi cấu trúc DOM lớn, KHÔNG thêm CSS rời.
- Bám UI_UX_STANDARD và bảng màu CAM Daisan; CTA "Thêm vào giỏ"/"Báo giá" nổi bật đúng brand.

Ràng buộc: Tailwind mobile-first, vùng chạm nút ≥ 44px, giữ accessibility (tương phản đủ).

Output:
- "Các điểm lệch" (gạch đầu dòng).
- "Bản vá": class trước/sau cho từng phần tử.
- "Danh sách file thay đổi".
- "Cách kiểm tra": so sánh trước/sau trên grid nhiều card và ở mobile/desktop.
Tiêu chí hoàn thành: card đều nhau, mọi thứ thẳng hàng, khoảng cách nhất quán theo token, đúng chuẩn UI & màu CAM Daisan, không đổi logic.
```
- **Đầu ra mong muốn:** Danh sách điểm lệch, bản vá tối thiểu bằng class Tailwind (alignment, h-full + mt-auto, gap chuẩn, aspect-ratio, line-clamp), và cách so sánh trước/sau.
- **Lưu ý khi dùng:** Card cao thấp lệch luôn fix bằng `h-full` + `flex flex-col` + `mt-auto` cho phần giá/nút và `aspect-[..]` cho ảnh. Cung cấp ảnh chụp để Claude thấy đúng chỗ lệch. Nhắc nó chuẩn hóa spacing theo token thay vì margin tùy hứng, và không đổi cấu trúc DOM.
