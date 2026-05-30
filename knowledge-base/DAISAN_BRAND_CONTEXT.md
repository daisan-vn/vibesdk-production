# DAISAN_BRAND_CONTEXT.md — Bối cảnh thương hiệu Daisan

> Tài liệu nền tảng định nghĩa **bối cảnh thương hiệu Daisan** để mọi tác vụ AI (viết nội dung, sinh code, thiết kế UI, tư vấn sản phẩm, sinh prompt) đều bám đúng bản sắc, ngành hàng, khách hàng và ngôn ngữ thương hiệu. Mục tiêu: bất kỳ output nào do Daisan.ai tạo ra cũng "đậm chất Daisan" — đúng tông giọng, đúng màu cam thương mại, đúng CTA, đúng từ vựng ngành vật liệu xây dựng (VLXD) và gạch ốp lát, không bịa thông số kỹ thuật. Đây là tài liệu BẮT BUỘC đọc trước khi sinh bất kỳ nội dung/giao diện nào mang thương hiệu Daisan.

---

## 1. Daisan là ai? — Hệ sinh thái thương mại VLXD & gạch ốp lát

**Daisan** là một **hệ sinh thái thương mại (commerce ecosystem)** chuyên về **vật liệu xây dựng, gạch ốp lát và vật liệu hoàn thiện**, kết hợp giữa bán lẻ, bán sỉ (B2B/B2C), marketplace, công cụ tìm kiếm sản phẩm/nhà cung cấp, nội dung chuyên ngành, quảng cáo và nền tảng AI hỗ trợ vận hành.

Daisan không phải một website đơn lẻ mà là **một cụm nền tảng (multi-platform)** xoay quanh chuỗi giá trị ngành xây dựng — hoàn thiện: từ **tìm kiếm sản phẩm/nhà cung cấp** (Daisan.vn) → **mua lẻ online** (DaisanStore) → **mua tại chuỗi showroom gạch** (DaisanTiles) → **mua sỉ giá phân phối** (DaisanDepot) → **giao dịch doanh nghiệp** (B2B.daisan.vn) → **đọc tin/nội dung ngành** (News.daisan.vn), tất cả được hỗ trợ bởi **Daisan AI** (tự động hóa, code, quản trị sản phẩm, tư vấn bán hàng) và **Daisan Ads** (quảng cáo).

### Định vị cốt lõi
- **Ngành:** Vật liệu xây dựng & hoàn thiện công trình, trọng tâm là **gạch ốp lát, gạch trang trí, thiết bị vệ sinh, vật liệu hoàn thiện**.
- **Mô hình:** Đa kênh (omnichannel) — online marketplace + chuỗi showroom thực tế + kênh phân phối sỉ + nền tảng B2B.
- **Khác biệt:** Kết hợp **dữ liệu sản phẩm sâu + tìm kiếm thông minh (Elasticsearch) + AI tư vấn + giá sỉ/đại lý** trong một hệ sinh thái thống nhất thương hiệu.
- **Lời hứa thương hiệu:** Giúp chủ nhà, nhà thầu, kiến trúc sư và đại lý **tìm đúng vật liệu — đúng giá — đúng nguồn cung** nhanh và đáng tin cậy.

### Stack kỹ thuật ưu tiên (để AI sinh code đúng định hướng)
| Lớp | Công nghệ ưu tiên |
|---|---|
| Frontend | **React + Tailwind CSS** |
| Backend | **Laravel + REST API** |
| Search | **Elasticsearch** |
| ERP | Tích hợp **Odoo** |
| CMS/News | **Drupal** |
| Crawl/Scrape dữ liệu | **Apify** (khi phù hợp) |
| Database | Quan hệ (MySQL/PostgreSQL) theo chuẩn Laravel |

---

## 2. Các thương hiệu trong hệ sinh thái Daisan

> Quy tắc nền tảng: **tất cả đều là một thương hiệu mẹ "Daisan"**. Tên phụ (Store, Tiles, Depot, AI, Ads) là **sub-brand**, viết liền và viết hoa chữ cái đầu của thành phần (DaisanStore, DaisanTiles…). Domain viết thường (daisan.vn, b2b.daisan.vn).

| Thương hiệu | Vai trò | Đối tượng chính | Mô tả ngắn |
|---|---|---|---|
| **Daisan.vn** | Cổng tìm kiếm & catalog | Mọi người dùng tìm vật liệu | Cổng tìm kiếm sản phẩm/VLXD/nhà cung cấp + catalog tổng. Là "cửa ngõ" khám phá sản phẩm và nhà cung cấp. |
| **DaisanStore** | Sàn TMĐT B2C/B2B | Chủ nhà, nhà thầu nhỏ, đại lý | Sàn thương mại điện tử bán hàng trực tuyến, giỏ hàng, đặt mua, theo dõi đơn. |
| **DaisanTiles** | Chuỗi bán lẻ gạch | Chủ nhà, KTS, nhà thầu | Chuỗi showroom/bán lẻ gạch ốp lát — trải nghiệm xem mẫu thực tế, đặt lịch showroom. |
| **DaisanDepot** | Trung tâm phân phối giá sỉ | Đại lý, nhà thầu lớn, dự án | Kho/trung tâm phân phối bán giá sỉ, số lượng lớn, chính sách đại lý. |
| **Daisan AI** | Nền tảng AI | Nội bộ + đối tác | AI hỗ trợ vận hành, sinh code, quản trị sản phẩm, tư vấn bán hàng, tự động hóa. Đây là nơi **Daisan.ai** (sản phẩm code-assistant) thuộc về. |
| **Daisan Ads** | Nền tảng quảng cáo | Nhà cung cấp, brand đối tác | Nền tảng quảng cáo/đẩy hiển thị sản phẩm, nhà cung cấp trong hệ sinh thái. |
| **B2B.daisan.vn** | Nền tảng thương mại B2B | Doanh nghiệp, đại lý, dự án | Cổng giao dịch B2B: báo giá, hợp đồng, công nợ, đặt hàng số lượng lớn, quản lý tài khoản doanh nghiệp. |
| **News.daisan.vn** | Tin tức & nội dung | Toàn ngành, người dùng cuối | Hệ thống tin tức/nội dung/tìm kiếm chuyên ngành xây dựng — hoàn thiện (chạy trên Drupal). |

### Nguyên tắc khi AI tham chiếu sub-brand
- Khi tạo nội dung/UI cho **một** kênh cụ thể, dùng đúng tên sub-brand đó (vd footer DaisanTiles ghi "DaisanTiles", không ghi "DaisanStore").
- Khi nói về toàn hệ thống → dùng **"hệ sinh thái Daisan"**.
- Không tự ý đặt tên sub-brand mới (vd "DaisanPaint", "DaisanPro") trừ khi người dùng yêu cầu rõ.

---

## 3. Ngành hàng trọng tâm

Mọi gợi ý sản phẩm, danh mục, schema dữ liệu, filter tìm kiếm và nội dung phải bám các nhóm ngành hàng sau:

### 3.1 Gạch ốp lát (ngành hàng lõi)
- Gạch ốp tường, gạch lát nền, gạch porcelain (sứ), ceramic, granite nhân tạo.
- Thuộc tính quan trọng: **kích thước (mm)**, bề mặt (bóng/mờ/nhám/men matt), khả năng chống trơn (R-rating), độ hút nước, ứng dụng (trong nhà/ngoài trời/sàn/tường), tông màu, vân (vân đá, vân gỗ, vân xi măng).

### 3.2 Gạch trang trí
- Gạch mosaic, gạch bông, gạch thẻ (subway), gạch giả cổ, gạch trang trí điểm nhấn.
- Thuộc tính: phong cách (Indochine, hiện đại, tân cổ điển, Địa Trung Hải…), vị trí ứng dụng (bếp, WC, mặt tiền, tiểu cảnh).

### 3.3 Vật liệu hoàn thiện
- Keo dán gạch, keo chà ron (mạch), ke gạch, phụ kiện ốp lát, nẹp trang trí, chống thấm.

### 3.4 Thiết bị vệ sinh
- Bồn cầu, lavabo (chậu rửa), sen vòi, bồn tắm, phụ kiện phòng tắm, vách kính.
- Thuộc tính: thương hiệu, công nghệ xả, chất liệu, kích thước lắp đặt.

### 3.5 Vật liệu xây dựng (mở rộng)
- Xi măng, vữa, gạch xây, vật liệu kết cấu, vật tư phụ trợ công trình — phục vụ nhóm nhà thầu/dự án.

> **Lưu ý dữ liệu:** Thông số kỹ thuật (kích thước, R-rating, độ hút nước, mã màu, xuất xứ…) phải lấy từ dữ liệu sản phẩm thật. **AI tuyệt đối không bịa thông số.** Khi thiếu dữ liệu, dùng placeholder rõ ràng (vd `{{ product.size }}`) hoặc ghi "Liên hệ để biết thông số chi tiết".

---

## 4. Nhóm khách hàng

| Nhóm | Nhu cầu chính | Ngôn ngữ/UX phù hợp |
|---|---|---|
| **Chủ nhà (homeowner)** | Chọn gạch/thiết bị đẹp, hợp phong cách, đúng ngân sách; cần tư vấn | Gần gũi, trực quan, nhiều hình ảnh, gợi ý phối cảnh, CTA "Nhận báo giá" / "Xem showroom" |
| **Nhà thầu (contractor)** | Số lượng lớn, tiến độ, giá tốt, sẵn hàng | Thông tin tồn kho, giá theo số lượng, đặt nhanh, công nợ |
| **Kiến trúc sư / Nhà thiết kế (KTS)** | Vật liệu đúng concept, mẫu mã, thông số kỹ thuật, tải catalog | Bộ lọc kỹ thuật chi tiết, tải spec/3D/ảnh độ phân giải cao, moodboard |
| **Dealer / Đại lý** | Giá đại lý, chính sách chiết khấu, nhập sỉ, quản lý đơn | Cổng đại lý, bảng giá riêng, đặt hàng số lượng lớn (DaisanDepot / B2B) |
| **B2B / Doanh nghiệp** | Hợp đồng, báo giá chính thức, công nợ, dự án | Quy trình duyệt báo giá, hóa đơn, quản lý nhiều tài khoản (B2B.daisan.vn) |
| **Showroom / Cửa hàng** | Trưng bày, đặt lịch khách, tra cứu tồn, chốt đơn tại quầy | Công cụ tra cứu nhanh, đặt lịch, quét mã sản phẩm |

### Hệ quả cho AI
- Luôn xác định **persona** trước khi viết nội dung/thiết kế luồng. Cùng một sản phẩm, chủ nhà cần "cảm hứng + báo giá", còn nhà thầu cần "giá sỉ + tồn kho".
- CTA và thông tin hiển thị thay đổi theo persona (xem mục 5 và 7).

---

## 5. Ngôn ngữ thương hiệu

### 5.1 Từ vựng NÊN dùng
- **Sản phẩm:** "gạch ốp lát", "gạch ốp tường", "gạch lát nền", "gạch trang trí", "thiết bị vệ sinh", "vật liệu hoàn thiện", "vật liệu xây dựng".
- **Hành động:** "Nhận báo giá", "Xem showroom", "Đặt lịch xem mẫu", "Tư vấn miễn phí", "Báo giá đại lý", "Mua sỉ", "Thêm vào giỏ".
- **Giá trị:** "chính hãng", "giá tốt", "nguồn cung uy tín", "giao tận công trình", "hỗ trợ kỹ thuật".
- **Đơn vị:** dùng **m²** cho gạch, "viên", "thùng", "bộ" (thiết bị), "kg/bao" (keo/xi măng) đúng theo loại hàng.

### 5.2 Từ vựng NÊN tránh
- Tránh tiếng lóng, từ thiếu chuyên nghiệp ("hàng xịn xò", "rẻ vô địch", "đỉnh nóc").
- Tránh cam kết tuyệt đối sai sự thật ("rẻ nhất Việt Nam", "tốt nhất thế giới") nếu không có cơ sở.
- Tránh thuật ngữ ngoại lai không cần thiết khi đã có từ tiếng Việt chuẩn ("tiles" → "gạch", trừ tên brand DaisanTiles).
- Tránh gọi sai đơn vị (vd bán gạch theo "cái" thay vì "viên/m²").

### 5.3 Cách gọi sản phẩm (naming convention)
Mẫu chuẩn: **[Loại] [Thương hiệu/Dòng] [Kích thước] [Bề mặt/Đặc tính]**

```
Gạch lát nền Porcelain DS-6012 600x600mm vân đá bóng kính
Gạch ốp tường Ceramic Sub-Trắng 300x600mm men matt
Sen tắm âm tường Daisan DSV-220 mạ chrome
```

- Mã sản phẩm (SKU) giữ nguyên định dạng gốc, không tự chế.
- Kích thước viết dạng `RxC mm` hoặc `RxCxD mm` (vd `600x600mm`).

---

## 6. Tông giọng nội dung (Tone of Voice)

Daisan giao tiếp với 4 đặc tính cốt lõi, áp dụng đồng thời:

| Đặc tính | Ý nghĩa | Biểu hiện thực tế |
|---|---|---|
| **Chuyên nghiệp** | Đúng thuật ngữ, chính xác kỹ thuật | Dùng đúng thông số, đơn vị, danh mục ngành |
| **Tin cậy** | Cam kết có cơ sở, minh bạch | Không bịa số, nêu nguồn gốc, nói rõ điều kiện báo giá |
| **Gần gũi** | Dễ hiểu với chủ nhà không rành kỹ thuật | Giải thích thuật ngữ, gợi ý phối hợp, ngôn ngữ thân thiện |
| **Định hướng tư vấn** | Luôn dẫn dắt tới giải pháp & bước tiếp theo | Kết bằng gợi ý + CTA ("Nhận báo giá", "Xem showroom") |

### Ví dụ tông giọng đúng
```
Gạch lát nền vân đá 600x600mm là lựa chọn phổ biến cho phòng khách
nhờ bề mặt bóng sang trọng và dễ vệ sinh. Nếu bạn đang phân vân giữa
các tông màu, đội ngũ Daisan có thể tư vấn phối màu theo không gian.
[Nhận báo giá]  [Xem showroom]
```

### Ví dụ tông giọng SAI (cần tránh)
```
Gạch này xịn lắm, rẻ nhất thị trường, mua ngay kẻo hết! Bao đẹp 100%.
```

---

## 7. Những điều AI LUÔN PHẢI NHỚ (Brand Rules)

1. **Brand = Daisan.** Mọi nội dung/UI thuộc thương hiệu Daisan; tên sub-brand viết đúng (DaisanStore, DaisanTiles, DaisanDepot, Daisan AI, Daisan Ads, B2B.daisan.vn, News.daisan.vn).
2. **Màu chủ đạo = Cam Daisan** (đỏ cam thương mại) cho điểm nhấn/CTA/logo; phụ là xám trung tính và xanh.
3. **CTA mặc định = "Nhận báo giá" và "Xem showroom"** (tùy persona thêm "Mua sỉ", "Báo giá đại lý", "Đặt lịch xem mẫu", "Thêm vào giỏ").
4. **Không bịa thông số sản phẩm** — kích thước, mã màu, R-rating, giá, tồn kho, xuất xứ phải từ dữ liệu thật hoặc placeholder.
5. **Đúng ngành hàng** — luôn ở trong khung VLXD/gạch ốp lát/hoàn thiện/thiết bị vệ sinh.
6. **Đúng đơn vị** — m²/viên/thùng/bộ/bao tùy sản phẩm.
7. **Đúng persona** — điều chỉnh nội dung & CTA theo chủ nhà / nhà thầu / KTS / đại lý / B2B.
8. **Stack đúng định hướng** — sinh code ưu tiên React + Tailwind (FE), Laravel + API (BE), Elasticsearch (search).

---

## 8. Bảng màu & Logo guideline cơ bản

### 8.1 Bảng màu thương hiệu

| Vai trò | Tên | Mã gợi ý (HEX) | Dùng cho |
|---|---|---|---|
| Primary | **Cam Daisan** | `#E8501E` (đỏ cam thương mại) | Logo, nút CTA, link nhấn, badge khuyến mãi |
| Primary đậm (hover) | Cam đậm | `#C63E12` | Trạng thái hover/active của nút |
| Neutral chính | Xám trung tính | `#4B5563` | Văn bản phụ, đường viền, nền nhạt `#F3F4F6` |
| Văn bản chính | Gần đen | `#1F2937` | Tiêu đề, nội dung |
| Accent phụ | Xanh | `#1E6FB8` | Link thông tin, trạng thái, nhãn kỹ thuật |
| Nền | Trắng/Trắng ngà | `#FFFFFF` / `#FAFAFA` | Nền trang, card |
| Thành công / Cảnh báo / Lỗi | Xanh lá / Vàng / Đỏ | `#16A34A` / `#F59E0B` / `#DC2626` | Trạng thái hệ thống |

> Mã HEX là **gợi ý mặc định** khi chưa có design token chính thức. Nếu dự án có file token/biến CSS thật, ưu tiên dùng token đó. Đặt tên token thống nhất, ví dụ `daisan-orange`, `daisan-orange-dark`, `daisan-gray`.

### 8.2 Cấu hình Tailwind (ví dụ áp dụng ngay)
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        daisan: {
          orange: '#E8501E',      // primary - Cam Daisan
          'orange-dark': '#C63E12',
          gray: '#4B5563',
          ink: '#1F2937',
          blue: '#1E6FB8',
          soft: '#F3F4F6',
        },
      },
    },
  },
};
```

```jsx
// Ví dụ CTA chuẩn thương hiệu (React + Tailwind)
export function QuoteCTA() {
  return (
    <div className="flex gap-3">
      <button className="rounded-lg bg-daisan-orange px-5 py-2.5 font-semibold text-white hover:bg-daisan-orange-dark transition">
        Nhận báo giá
      </button>
      <button className="rounded-lg border border-daisan-gray px-5 py-2.5 font-semibold text-daisan-ink hover:bg-daisan-soft transition">
        Xem showroom
      </button>
    </div>
  );
}
```

### 8.3 Logo guideline cơ bản
- Logo dùng wordmark **"Daisan"** (và sub-brand kèm hậu tố khi cần). Ưu tiên bản trên nền trắng/sáng dùng chữ tối + điểm nhấn cam; trên nền tối dùng bản đảo màu (trắng + cam).
- **Vùng an toàn (clear space):** chừa lề trống quanh logo tối thiểu bằng chiều cao chữ "D".
- **Kích thước tối thiểu:** không nhỏ hơn 24px chiều cao trên màn hình để giữ độ rõ.
- **Không được:** bóp méo tỉ lệ, đổi sang màu ngoài bảng thương hiệu, thêm đổ bóng/hiệu ứng lòe loẹt, đặt logo lên nền tương phản kém.
- Khi chưa có file logo chính thức, dùng placeholder text wordmark "Daisan" với chữ "san" hoặc dấu chấm nhấn màu Cam Daisan, không tự vẽ biểu tượng mới.

---

## 9. AI PHẢI LÀM

- **Luôn dùng tên thương hiệu chuẩn**: "Daisan" và sub-brand viết đúng chính tả/định dạng.
- **Luôn áp màu Cam Daisan** cho CTA/điểm nhấn; phần còn lại dùng xám/xanh trung tính.
- **Luôn đặt CTA phù hợp persona**, mặc định "Nhận báo giá" và "Xem showroom".
- **Luôn ở trong ngành hàng VLXD/gạch ốp lát/hoàn thiện/thiết bị vệ sinh** khi gợi ý sản phẩm/danh mục.
- **Luôn dùng dữ liệu thật hoặc placeholder rõ ràng** cho thông số/giá/tồn kho; ghi chú khi thiếu dữ liệu.
- **Luôn xác định persona + kênh (sub-brand)** trước khi sinh nội dung/UI/luồng.
- **Luôn giữ tông giọng** chuyên nghiệp – tin cậy – gần gũi – định hướng tư vấn.
- **Luôn dùng đúng đơn vị** (m²/viên/thùng/bộ/bao) và đúng cách gọi sản phẩm theo mục 5.3.
- **Luôn ưu tiên stack** React + Tailwind / Laravel + API / Elasticsearch khi sinh code.

## 10. AI KHÔNG ĐƯỢC LÀM

- **Không bịa thông số, giá, tồn kho, xuất xứ, mã màu, R-rating** của sản phẩm.
- **Không đặt tên sub-brand mới** hoặc đổi cách viết thương hiệu (vd "Dai San", "DAISAN STORE" tùy tiện) ngoài chuẩn.
- **Không dùng màu ngoài bảng thương hiệu** cho điểm nhấn chính, hoặc thay Cam Daisan bằng màu khác.
- **Không dùng tông giọng lóng/giật gân/cam kết sai sự thật** ("rẻ nhất VN", "đỉnh nóc").
- **Không gợi ý sản phẩm ngoài ngành** (vd thời trang, điện tử tiêu dùng) trừ khi được yêu cầu rõ.
- **Không bỏ CTA** trong các trang/nội dung hướng chuyển đổi.
- **Không dùng sai đơn vị** hoặc gọi sai tên sản phẩm.
- **Không bóp méo/biến dạng logo** hay vi phạm vùng an toàn, kích thước tối thiểu.

---

## 11. Checklist thực thi (dùng trước khi xuất bất kỳ output thương hiệu nào)

- [ ] Đã xác định đúng **sub-brand/kênh** (Daisan.vn, DaisanStore, DaisanTiles, DaisanDepot, B2B, News, Ads, AI)?
- [ ] Đã xác định đúng **persona** (chủ nhà / nhà thầu / KTS / đại lý / B2B / showroom)?
- [ ] Tên thương hiệu **viết đúng chuẩn** trong toàn bộ nội dung?
- [ ] Điểm nhấn/CTA dùng **Cam Daisan**; còn lại xám/xanh trung tính?
- [ ] Có **CTA phù hợp** ("Nhận báo giá" / "Xem showroom" / theo persona)?
- [ ] Sản phẩm nằm **trong ngành hàng trọng tâm** và gọi đúng tên/đơn vị?
- [ ] **Không có thông số/giá bịa**; chỗ thiếu dữ liệu dùng placeholder rõ ràng?
- [ ] Tông giọng **chuyên nghiệp – tin cậy – gần gũi – tư vấn** xuyên suốt?
- [ ] Nếu sinh code: dùng **React + Tailwind / Laravel + API / Elasticsearch** theo định hướng?
- [ ] Logo (nếu có) đúng **màu, vùng an toàn, kích thước tối thiểu**?
