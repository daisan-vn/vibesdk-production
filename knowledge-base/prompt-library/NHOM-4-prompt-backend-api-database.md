# NHÓM 4 — Prompt backend / API / database

Bộ prompt thực chiến giúp đội Daisan thiết kế API, schema database, Laravel CRUD/API và tích hợp Elasticsearch, Odoo, Apify, Drupal cho hệ sinh thái thương mại VLXD / gạch ốp lát — dùng được ngay với Claude và Daisan.ai.

---

### 41. Thiết kế API marketplace VLXD (REST contract đa hệ thống)
- **Khi nào dùng:** Khi cần định nghĩa lớp API tổng cho marketplace Daisan kết nối DaisanStore, DaisanTiles, DaisanDepot, B2B và Daisan AI search — trước khi code backend.
- **Prompt đầy đủ để copy:**
```
Bạn là Kiến trúc sư API backend cho hệ sinh thái marketplace Daisan (thương mại vật liệu xây dựng, gạch ốp lát, B2C + B2B + bán sỉ).

BỐI CẢNH:
- Các hệ thống tiêu thụ API: DaisanStore (TMĐT B2C/B2B), DaisanTiles (bán lẻ gạch), DaisanDepot (bán sỉ), B2B.daisan.vn, Daisan AI (search/recommend), Daisan Ads.
- Stack backend: Laravel + PHP + MySQL, search Elasticsearch, ERP Odoo, crawler Apify, CMS News Drupal.
- Tham chiếu knowledge-base/{DAISAN_BUSINESS_CONTEXT, CODE_STANDARD, ERROR_PLAYBOOK}.md nếu có.

YÊU CẦU: Thiết kế REST API contract cho marketplace, gồm các domain: products (catalog gạch/VLXD có thuộc tính kích thước, bề mặt, chống trượt R-rating, hệ số hút nước, đơn vị m2/viên/thùng), categories, suppliers (nhà cung cấp/nhà máy), orders (hỗ trợ giá B2C lẻ và B2B theo bậc số lượng/m2), pricing tiers, inventory theo kho/chi nhánh, search & facets, cart, quotation (báo giá sỉ).
Với mỗi endpoint hãy nêu: method + path (versioned /api/v1/...), mục đích, query/path params, request body mẫu (JSON), response body mẫu (JSON), mã lỗi (400/401/403/404/409/422/429), phân trang (cursor/page), và quyền truy cập theo vai trò (guest, customer, b2b_buyer, sales, admin).
RÀNG BUỘC:
- Tuân thủ chuẩn REST, đặt tên resource số nhiều, dùng JSON snake_case nhất quán.
- Hỗ trợ đa đơn vị tính gạch (m2, viên, thùng, pallet) và quy đổi.
- Idempotency cho POST orders (Idempotency-Key header).
- Chuẩn hóa lỗi theo một envelope: { success, data, error: { code, message, fields } }.
- Có rate limit và ETag/caching cho catalog.
OUTPUT MONG MUỐN: Bảng tổng hợp endpoint + chi tiết JSON mẫu cho 8-10 endpoint quan trọng nhất, kèm sơ đồ quan hệ resource và ghi chú versioning/deprecation.
TIÊU CHÍ HOÀN THÀNH: Một frontend hoặc đối tác có thể tích hợp mà không cần hỏi thêm; mỗi endpoint có ví dụ request/response thật, không placeholder mơ hồ.
```
- **Đầu ra mong muốn:** Một tài liệu API contract gồm bảng liệt kê endpoint, JSON request/response mẫu, bảng mã lỗi và ma trận quyền theo vai trò, áp dụng đúng nghiệp vụ gạch/VLXD.
- **Lưu ý khi dùng:** Thay danh sách hệ thống/vai trò nếu khác. Nhấn mạnh đa đơn vị tính gạch và giá B2B theo bậc — đây là điểm dễ bị bỏ sót. Yêu cầu Claude xuất thêm OpenAPI YAML nếu cần feed vào codegen.

---

### 42. Thiết kế database sản phẩm gạch/VLXD (schema + thuộc tính kỹ thuật)
- **Khi nào dùng:** Khi dựng hoặc tái cấu trúc bảng sản phẩm cho catalog Daisan với thuộc tính kỹ thuật đặc thù gạch và biến thể.
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia thiết kế cơ sở dữ liệu MySQL cho catalog thương mại điện tử ngành gạch ốp lát và vật liệu xây dựng (Daisan).

BỐI CẢNH: Sản phẩm gồm gạch ốp lát, đá, thiết bị vệ sinh, vật tư phụ. Catalog dùng cho DaisanStore/DaisanTiles/DaisanDepot và đẩy sang Elasticsearch để search. Stack: Laravel + MySQL.

YÊU CẦU: Thiết kế schema MySQL cho domain sản phẩm, gồm các bảng: products, product_variants (theo màu/kích thước/bề mặt), product_attributes & attribute_values (EAV hoặc cột chuyên biệt — đề xuất phương án và lý do), categories (cây phân cấp, nested set hoặc adjacency list), brands, product_images, product_units (đơn vị m2/viên/thùng/pallet và hệ số quy đổi), inventory_stock (theo kho/chi nhánh), price_lists & prices (B2C lẻ và B2B theo bậc).
Thuộc tính kỹ thuật gạch cần mô hình hóa: kích thước (vd 600x600), độ dày, bề mặt (bóng/mờ/nhám), hệ số hút nước, độ chống trượt (R9-R13), khả năng chịu lực, xuất xứ, số viên/m2, số m2/thùng, trọng lượng.
Với mỗi bảng: liệt kê cột + kiểu dữ liệu + nullable + khóa chính/ngoại + index, kèm ghi chú nghiệp vụ. Đưa ra ràng buộc toàn vẹn, chiến lược index cho truy vấn lọc theo thuộc tính, và lưu ý chuẩn hóa vs phi chuẩn hóa cho hiệu năng search.
RÀNG BUỘC: Dùng quy ước đặt tên snake_case số nhiều, có created_at/updated_at/deleted_at (soft delete), charset utf8mb4. Slug SEO unique. Hỗ trợ đa ngôn ngữ ở mức tên/mô tả nếu hợp lý.
OUTPUT MONG MUỐN: DDL CREATE TABLE đầy đủ cho các bảng cốt lõi + sơ đồ quan hệ (mô tả text/ERD), giải thích lựa chọn EAV vs cột, và 3-5 ví dụ truy vấn lọc thường gặp.
TIÊU CHÍ HOÀN THÀNH: Schema chạy được trên MySQL 8, hỗ trợ biến thể + đa đơn vị + thuộc tính kỹ thuật gạch, sẵn sàng map sang Eloquent model.
```
- **Đầu ra mong muốn:** Bộ DDL `CREATE TABLE` đầy đủ, ERD mô tả, phân tích EAV vs cột chuyên biệt và ví dụ truy vấn lọc theo thuộc tính kỹ thuật gạch.
- **Lưu ý khi dùng:** Quyết định EAV hay cột cố định phụ thuộc số lượng thuộc tính động — nói rõ với Claude nếu catalog đa ngành để tránh schema cứng. Kiểm tra index trùng và độ dài slug trước khi áp dụng production.

---

### 43. Thiết kế database đơn hàng (B2C lẻ + B2B sỉ, đa đơn vị)
- **Khi nào dùng:** Khi thiết kế module đặt hàng/giỏ hàng/báo giá cho Daisan có cả bán lẻ và bán sỉ theo m2.
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia thiết kế database giao dịch cho thương mại điện tử VLXD (Daisan), hỗ trợ cả bán lẻ B2C và bán sỉ B2B theo m2/pallet.

BỐI CẢNH: Đơn hàng phát sinh từ DaisanStore, DaisanTiles (lẻ), DaisanDepot (sỉ), B2B.daisan.vn. Cần đồng bộ sang Odoo (ERP) sau này. Stack: Laravel + MySQL.

YÊU CẦU: Thiết kế schema MySQL cho domain đơn hàng, gồm: orders, order_items, order_status_history, carts & cart_items, quotations & quotation_items (báo giá sỉ có hiệu lực thời gian), payments, shipments & shipment_items (giao theo kho/chi nhánh, hỗ trợ giao hàng cồng kềnh gạch), order_addresses (giao/xuất hóa đơn), applied_discounts/promotions, returns/refunds.
Yêu cầu nghiệp vụ đặc thù gạch: mỗi order_item lưu đơn vị tính (m2/viên/thùng/pallet), số lượng theo đơn vị mua, quy đổi ra m2 và ra viên, giá theo bậc B2B, ghi nhận hao hụt cắt gạch (% dự phòng), khối lượng/thể tích để tính phí vận chuyển.
Với mỗi bảng: cột + kiểu + nullable + khóa + index + ghi chú. Đề xuất state machine trạng thái đơn (draft, pending, confirmed, packed, shipped, delivered, completed, cancelled, returned) và bảng lịch sử trạng thái. Lưu snapshot giá/tên sản phẩm tại thời điểm đặt để không bị thay đổi khi catalog cập nhật.
RÀNG BUỘC: snake_case, soft delete nơi phù hợp, mã đơn hàng có format dễ đọc (vd DS-2026-000123) unique, dùng DECIMAL cho tiền (không float), lưu currency và tax rõ ràng, đảm bảo idempotency khi tạo đơn.
OUTPUT MONG MUỐN: DDL đầy đủ + sơ đồ quan hệ + sơ đồ state machine trạng thái + ví dụ tính tổng tiền có thuế/giảm giá/phí ship cho 1 đơn gạch.
TIÊU CHÍ HOÀN THÀNH: Schema phản ánh đúng quy trình mua gạch theo m2, giữ được lịch sử và snapshot giá, sẵn sàng đồng bộ Odoo.
```
- **Đầu ra mong muốn:** DDL các bảng giao dịch, sơ đồ state machine trạng thái đơn, logic snapshot giá và ví dụ tính tổng đơn gạch theo m2 có hao hụt/thuế/ship.
- **Lưu ý khi dùng:** Luôn dùng DECIMAL cho tiền và lưu snapshot giá — đây là 2 lỗi kinh điển. Nếu sẽ đồng bộ Odoo, yêu cầu Claude chừa cột external_odoo_id ngay từ đầu.

---

### 44. Thiết kế database nhà cung cấp / nhà máy (supplier & sourcing)
- **Khi nào dùng:** Khi mô hình hóa nhà cung cấp gạch, nhà máy, bảng giá nhập và liên kết sản phẩm-nhà cung cấp cho marketplace Daisan.
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia thiết kế database cho marketplace VLXD nhiều nhà cung cấp (Daisan), nơi mỗi sản phẩm gạch có thể đến từ nhiều nhà máy/đại lý.

BỐI CẢNH: Daisan vừa bán hàng tự kinh doanh vừa làm marketplace cho nhà cung cấp bên thứ ba (nhà máy gạch, đại lý vùng). Cần theo dõi giá nhập, công nợ, năng lực giao hàng, vùng phục vụ. Stack: Laravel + MySQL, có thể đồng bộ Odoo.

YÊU CẦU: Thiết kế schema MySQL domain nhà cung cấp, gồm: suppliers (thông tin pháp lý, MST, loại: nhà máy/đại lý/NCC vật tư), supplier_contacts, supplier_products (giá nhập, MOQ tối thiểu, lead time, đơn vị cung cấp), supplier_price_history, supplier_warehouses (kho/vùng phục vụ), supplier_documents (hợp đồng, chứng nhận CO/CQ, tiêu chuẩn chất lượng gạch), supplier_ratings (đánh giá giao hàng/chất lượng), purchase_orders & po_items (đặt hàng nhập), supplier_payments/debts (công nợ phải trả).
Yêu cầu nghiệp vụ: hỗ trợ 1 sản phẩm — nhiều nhà cung cấp với giá/lead time khác nhau (chọn NCC tối ưu), vùng phục vụ theo tỉnh/thành để tính ưu tiên giao gạch cồng kềnh, lưu chứng nhận chất lượng (hệ số hút nước, chống trượt) gắn theo lô.
Với mỗi bảng: cột + kiểu + khóa + index + ghi chú nghiệp vụ. Nêu ràng buộc toàn vẹn và chiến lược chọn nhà cung cấp tối ưu (truy vấn mẫu).
RÀNG BUỘC: snake_case, soft delete, DECIMAL cho tiền, chừa cột external_odoo_id để đồng bộ ERP, audit created_by/updated_by.
OUTPUT MONG MUỐN: DDL đầy đủ + ERD mô tả + truy vấn mẫu "tìm nhà cung cấp tốt nhất cho sản phẩm X giao về tỉnh Y" cân bằng giá/lead time/đánh giá.
TIÊU CHÍ HOÀN THÀNH: Schema hỗ trợ marketplace đa NCC, theo dõi công nợ và chứng nhận chất lượng gạch, sẵn sàng đồng bộ Odoo.
```
- **Đầu ra mong muốn:** DDL các bảng nhà cung cấp/PO/công nợ, ERD và truy vấn chọn NCC tối ưu theo giá-lead time-vùng giao.
- **Lưu ý khi dùng:** Làm rõ Daisan là marketplace đa NCC hay chỉ tự kinh doanh — ảnh hưởng lớn tới bảng supplier_products. Nhắc lưu chứng nhận CO/CQ vì khách B2B gạch thường yêu cầu.

---

### 45. Thiết kế database khách hàng (B2C + B2B, phân khúc & công nợ)
- **Khi nào dùng:** Khi dựng module khách hàng/CRM cơ bản cho Daisan có cả khách lẻ và khách doanh nghiệp/nhà thầu mua sỉ.
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia thiết kế database khách hàng/CRM cho thương mại VLXD (Daisan) phục vụ cả khách lẻ B2C và khách doanh nghiệp/nhà thầu B2B.

BỐI CẢNH: Khách hàng gồm: người mua lẻ trên DaisanStore/DaisanTiles, nhà thầu/cửa hàng vật liệu mua sỉ trên DaisanDepot/B2B.daisan.vn. Cần phân nhóm giá, theo dõi công nợ, lịch sử mua, hạn mức tín dụng. Stack: Laravel + MySQL, đồng bộ Odoo.

YÊU CẦU: Thiết kế schema MySQL domain khách hàng, gồm: customers (loại individual/business), customer_companies (MST, ngành nghề, quy mô), customer_contacts, customer_addresses (giao/xuất hóa đơn), customer_groups (phân khúc giá: lẻ, thầu, đại lý, VIP), customer_price_assignments (gán bảng giá B2B), credit_limits & customer_debts (hạn mức & công nợ phải thu), loyalty_points (nếu có), customer_activity_log (truy cập/mua), saved_carts/wishlists.
Yêu cầu nghiệp vụ: 1 công ty có nhiều người liên hệ đặt hàng; gán nhóm giá quyết định giá B2B theo bậc m2; theo dõi công nợ và hạn mức tín dụng để chặn đặt hàng khi vượt hạn mức; phân khúc khách theo doanh số để Daisan Ads/CRM remarketing.
Với mỗi bảng: cột + kiểu + khóa + index + ghi chú. Nêu ràng buộc, chính sách bảo mật dữ liệu cá nhân (PII), và truy vấn mẫu "khách B2B nợ quá hạn mức".
RÀNG BUỘC: snake_case, soft delete, DECIMAL cho tiền/công nợ, mã hóa/giới hạn truy cập PII, external_odoo_id, audit fields.
OUTPUT MONG MUỐN: DDL đầy đủ + ERD + truy vấn phân khúc khách + truy vấn kiểm tra hạn mức tín dụng trước khi cho đặt đơn sỉ.
TIÊU CHÍ HOÀN THÀNH: Schema phân biệt rõ B2C/B2B, gán nhóm giá, theo dõi công nợ/hạn mức, đồng bộ Odoo, tôn trọng PII.
```
- **Đầu ra mong muốn:** DDL bảng khách hàng/công ty/nhóm giá/công nợ, ERD, truy vấn phân khúc và kiểm tra hạn mức tín dụng.
- **Lưu ý khi dùng:** Đừng gộp individual và business vào một bảng phẳng — yêu cầu Claude tách rõ. Nhắc về PII và hạn mức tín dụng vì đây là nghiệp vụ B2B sống còn của bán sỉ gạch.

---

### 46. Laravel CRUD sản phẩm (Model + Migration + Controller + Resource + Validation)
- **Khi nào dùng:** Khi cần code module quản lý sản phẩm gạch trong Laravel theo chuẩn, không chỉ schema.
- **Prompt đầy đủ để copy:**
```
Bạn là Senior Laravel Engineer của Daisan, viết module CRUD sản phẩm gạch/VLXD theo chuẩn CODE_STANDARD của đội.

BỐI CẢNH: Catalog gạch có biến thể, đa đơn vị (m2/viên/thùng), thuộc tính kỹ thuật (kích thước, bề mặt, chống trượt). API phục vụ admin (quản trị) và đẩy dữ liệu sang Elasticsearch. Stack: Laravel 11 + PHP 8.2 + MySQL. Tham chiếu knowledge-base/{CODE_STANDARD, ERROR_PLAYBOOK}.md.

YÊU CẦU: Viết đầy đủ cho resource Product:
1. Migration tạo bảng products + product_variants + product_units (DECIMAL cho giá, slug unique, soft delete, foreign key category_id/brand_id).
2. Eloquent Model Product với fillable, casts, quan hệ (belongsTo category/brand, hasMany variants/images/units), accessor slug, scope active.
3. FormRequest StoreProductRequest & UpdateProductRequest với validation đầy đủ (kích thước, đơn vị, giá > 0, slug unique, ảnh).
4. API Resource ProductResource & ProductCollection trả JSON chuẩn envelope.
5. ProductController (apiResource) với index (phân trang + filter), store, show, update, destroy — dùng dependency injection, transaction khi tạo kèm variants, trả mã HTTP đúng.
6. Service/Action class tách logic nghiệp vụ khỏi controller; phát event ProductSaved để observer đẩy sang Elasticsearch.
7. Route khai báo trong routes/api.php với prefix v1 và middleware auth/role.
RÀNG BUỘC: Tuân thủ PSR-12, type hint đầy đủ, không query trong controller (đưa vào repository/service), xử lý lỗi và rollback transaction, không lộ field nhạy cảm trong Resource, code comment tiếng Việt ngắn gọn ở chỗ nghiệp vụ.
OUTPUT MONG MUỐN: Toàn bộ code các file trên, mỗi file trong code block riêng có đường dẫn, kèm ví dụ request/response và lệnh migrate/test.
TIÊU CHÍ HOÀN THÀNH: Code chạy được trên Laravel 11, pass validation, tạo product kèm variants trong 1 transaction, sẵn sàng đồng bộ Elasticsearch.
```
- **Đầu ra mong muốn:** Bộ file Laravel hoàn chỉnh (migration, model, request, resource, controller, service, route) đúng PSR-12, có transaction và event đồng bộ ES.
- **Lưu ý khi dùng:** Nêu rõ phiên bản Laravel/PHP để tránh cú pháp lệch. Yêu cầu tách service/repository nếu không Claude hay nhồi logic vào controller. Kiểm tra event/observer ES có khớp index mapping ở prompt 48.

---

### 47. Laravel API đơn hàng (đặt hàng B2B/B2C, transaction & state machine)
- **Khi nào dùng:** Khi triển khai luồng tạo đơn/giỏ hàng/báo giá trong Laravel với tính toán giá gạch theo m2 và an toàn giao dịch.
- **Prompt đầy đủ để copy:**
```
Bạn là Senior Laravel Engineer của Daisan, xây dựng API đặt hàng cho thương mại gạch/VLXD hỗ trợ B2C lẻ và B2B sỉ theo m2.

BỐI CẢNH: Đơn hàng cần snapshot giá, tính theo đơn vị m2/viên/thùng, áp giá B2B theo nhóm khách, kiểm tra tồn kho theo chi nhánh, kiểm tra hạn mức công nợ với khách B2B, idempotent khi tạo đơn. Stack: Laravel 11 + MySQL. Tham chiếu knowledge-base/{CODE_STANDARD, ERROR_PLAYBOOK}.md.

YÊU CẦU: Viết module đặt hàng:
1. Endpoint POST /api/v1/orders nhận giỏ hàng (items: product_variant_id, unit, quantity), customer_id, địa chỉ giao; hỗ trợ Idempotency-Key.
2. OrderService::place() trong DB transaction: load sản phẩm + giá theo nhóm khách, quy đổi đơn vị ra m2/viên, tính subtotal/thuế/giảm giá/phí ship, snapshot giá & tên, trừ tồn kho (lock for update), kiểm tra hạn mức công nợ B2B (chặn nếu vượt), tạo order + order_items + order_status_history.
3. State machine trạng thái đơn (draft→pending→confirmed→...); endpoint cập nhật trạng thái có kiểm tra transition hợp lệ.
4. FormRequest validation, Resource trả JSON envelope, mã lỗi rõ ràng (409 hết hàng, 422 vượt hạn mức, 400 dữ liệu sai).
5. Event OrderPlaced để gửi notification và đồng bộ Odoo sau này.
RÀNG BUỘC: PSR-12, type hint, DECIMAL cho tiền, dùng transaction + lock tồn kho tránh oversell, idempotency tránh tạo trùng đơn, không tính giá ở client, log lỗi theo ERROR_PLAYBOOK, comment nghiệp vụ tiếng Việt.
OUTPUT MONG MUỐN: Code OrderController, OrderService, FormRequest, Resource, state machine, migration bổ sung nếu cần; ví dụ request/response cho đơn gạch tính theo m2 và trường hợp lỗi vượt hạn mức.
TIÊU CHÍ HOÀN THÀNH: Tạo đơn an toàn trong transaction, không oversell, snapshot giá đúng, chặn B2B vượt hạn mức, idempotent.
```
- **Đầu ra mong muốn:** Module đặt hàng Laravel có transaction, lock tồn kho, snapshot giá, kiểm tra hạn mức, state machine và ví dụ tính đơn gạch theo m2.
- **Lưu ý khi dùng:** Nhấn mạnh lock tồn kho (`lockForUpdate`) và idempotency — thiếu là oversell/đơn trùng. Đảm bảo giá tính ở server, không nhận giá từ client. Khớp đơn vị quy đổi với schema ở prompt 43.

---

### 48. Elasticsearch mapping cho sản phẩm gạch (analyzer tiếng Việt)
- **Khi nào dùng:** Khi index catalog gạch lên Elasticsearch và cần search tiếng Việt chuẩn (có dấu/không dấu, đồng nghĩa, kích thước).
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia Elasticsearch xây dựng search cho catalog gạch ốp lát/VLXD của Daisan, tối ưu tiếng Việt.

BỐI CẢNH: Sản phẩm có tên tiếng Việt (vd "Gạch granite 600x600 mặt mờ chống trượt"), người dùng gõ có dấu hoặc không dấu, viết tắt, sai chính tả nhẹ. Cần search nhanh, lọc theo thuộc tính kỹ thuật và sort. Stack: Elasticsearch 8, dữ liệu đẩy từ Laravel/MySQL. Tham chiếu knowledge-base/DAISAN_BUSINESS_CONTEXT.md.

YÊU CẦU: Thiết kế index settings + mapping cho products:
1. Custom analyzer tiếng Việt: tokenizer phù hợp, lower case, loại bỏ dấu (asciifolding/icu_folding) để match không dấu, hỗ trợ synonym (vd "wc"≈"thiết bị vệ sinh", "ốp"≈"lát" nếu hợp lý), edge n-gram cho autocomplete, giữ field gốc cho phrase match có dấu.
2. Mapping field: name (text + keyword + autocomplete subfield), description, sku, brand, category (keyword + path hierarchy), kích thước (vd "600x600" keyword + width/height numeric), bề mặt, chống trượt (R-rating keyword), hệ số hút nước (numeric range), giá (numeric), đơn vị, tồn kho (boolean in_stock), thuộc tính kỹ thuật, popularity/score để boost.
3. Cấu hình synonym filter và stop words tiếng Việt; phân biệt analyzer cho indexing vs search.
4. Ví dụ document JSON cho 1 sản phẩm gạch.
RÀNG BUỘC: Mapping rõ ràng cho từng field (analyzer/normalizer), tránh dynamic mapping bừa, tối ưu cho cả full-text và filter/aggregation, sẵn sàng cho facet ở prompt search.
OUTPUT MONG MUỐN: JSON settings (analysis/analyzer/filter) + mappings đầy đủ + 1 document mẫu + ghi chú reindex khi đổi mapping.
TIÊU CHÍ HOÀN THÀNH: Search "gach granite 60x60" (không dấu, viết tắt) trả đúng "Gạch granite 600x600"; filter theo R-rating và hệ số hút nước hoạt động; autocomplete mượt.
```
- **Đầu ra mong muốn:** JSON settings + mappings Elasticsearch với analyzer tiếng Việt (folding, synonym, edge n-gram), document mẫu và ghi chú reindex.
- **Lưu ý khi dùng:** Phân biệt analyzer indexing vs search_analyzer để synonym/folding không gây nhiễu. Chuẩn bị danh sách synonym ngành gạch thực tế đưa vào. Đổi mapping cần reindex — đừng quên alias.

---

### 49. Search filter / facet / sort cho catalog gạch (Elasticsearch query)
- **Khi nào dùng:** Khi xây trang kết quả tìm kiếm/danh mục gạch có bộ lọc, facet đếm số lượng và sắp xếp — tầng query phía backend.
- **Prompt đầy đủ để copy:**
```
Bạn là chuyên gia Elasticsearch + backend Laravel xây dựng search query cho trang danh mục/tìm kiếm gạch của Daisan.

BỐI CẢNH: Index products đã có analyzer tiếng Việt (mapping đã định nghĩa). Trang catalog cần: ô search full-text, bộ lọc trái (thương hiệu, kích thước, bề mặt, chống trượt, khoảng giá, còn hàng), facet hiển thị số lượng mỗi giá trị, sort (liên quan, giá tăng/giảm, mới nhất, bán chạy), phân trang. Stack: Laravel gọi Elasticsearch 8.

YÊU CẦU:
1. Viết Elasticsearch query DSL kết hợp: full-text multi_match (boost name > description, fuzziness cho sai chính tả nhẹ), filter context cho các bộ lọc (term/terms/range) để cache tốt, post_filter để facet đa chọn không bị tự loại trừ.
2. Aggregations cho facet: terms agg (brand, kích thước, bề mặt, R-rating), range agg (giá, hệ số hút nước), trả về count mỗi bucket; xử lý đúng facet đa chọn (post_filter + agg riêng cho từng facet đang lọc).
3. Sort theo nhiều tiêu chí + tie-break, phân trang (from/size hoặc search_after cho deep paging).
4. Lớp Laravel: SearchService nhận query params (q, filters[], sort, page) → build query → gọi ES → map kết quả + facet về JSON envelope cho frontend.
RÀNG BUỘC: Đặt filter trong filter context (không tính _score) để cache, tránh deep pagination tốn kém, sanitize input, trả về facet kèm count chính xác khi đa chọn, code Laravel PSR-12 type hint.
OUTPUT MONG MUỐN: Query DSL JSON đầy đủ (search + agg + sort + paging) cho 1 trang catalog gạch + code SearchService Laravel + JSON response mẫu (kết quả + facets + tổng số + phân trang).
TIÊU CHÍ HOÀN THÀNH: Lọc đa chọn "kích thước 600x600 + 800x800" cho count đúng; sort giá hoạt động; search_after cho trang sâu; facet count khớp kết quả.
```
- **Đầu ra mong muốn:** Query DSL Elasticsearch hoàn chỉnh (full-text + aggregations + sort + paging), SearchService Laravel và JSON response mẫu kèm facet count.
- **Lưu ý khi dùng:** Facet đa chọn dễ sai — yêu cầu Claude dùng `post_filter` + agg riêng cho facet đang active. Đặt bộ lọc vào filter context để cache. Khớp tên field với mapping ở prompt 48.

---

### 50. Tích hợp Odoo cơ bản (đồng bộ sản phẩm/đơn/tồn kho)
- **Khi nào dùng:** Khi cần nối Laravel/Daisan với Odoo ERP để đồng bộ sản phẩm, đơn hàng, tồn kho, đối tác.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư tích hợp hệ thống cho Daisan, kết nối backend Laravel với Odoo ERP (XML-RPC/JSON-RPC) để đồng bộ dữ liệu thương mại gạch/VLXD.

BỐI CẢNH: Odoo quản lý sản phẩm (product.template/product.product), đối tác (res.partner = khách/NCC), đơn bán (sale.order), tồn kho (stock.quant), hóa đơn (account.move). Daisan (Laravel + MySQL) là hệ thống bán hàng front. Cần đồng bộ 2 chiều có kiểm soát: catalog & tồn từ Odoo về, đơn hàng từ Daisan lên Odoo.

YÊU CẦU:
1. Viết client kết nối Odoo qua XML-RPC (authenticate, execute_kw) đóng gói trong OdooService (Laravel), cấu hình host/db/user/api_key qua .env, xử lý lỗi & timeout & retry.
2. Hàm đồng bộ: pullProducts (map product.template → bảng products, đơn vị/giá/tồn), pushOrder (map order Daisan → sale.order + order_line, gắn external_odoo_id), upsertPartner (khách/NCC ↔ res.partner), pullStock (cập nhật tồn theo kho).
3. Cơ chế mapping ID (external_odoo_id), tránh trùng/duplicate, xử lý conflict (nguồn sự thật cho từng loại dữ liệu), idempotency, log đồng bộ (sync_logs).
4. Lập lịch đồng bộ (queue/cron) + đồng bộ realtime qua event (OrderPlaced → đẩy Odoo).
RÀNG BUỘC: Không hardcode credential, dùng queue cho tác vụ nặng, retry có backoff, ghi log thành công/thất bại, không để đồng bộ làm chậm request người dùng, code Laravel PSR-12.
OUTPUT MONG MUỐN: Code OdooService + các hàm sync + cấu hình .env mẫu + bảng mapping field Daisan↔Odoo + ví dụ pushOrder thành công và cách xử lý khi Odoo lỗi.
TIÊU CHÍ HOÀN THÀNH: Push 1 đơn Daisan tạo đúng sale.order trong Odoo, lưu external_odoo_id, idempotent, có log; pull tồn cập nhật đúng bảng inventory.
```
- **Đầu ра mong muốn:** OdooService Laravel với client XML-RPC, các hàm pull/push, bảng mapping field Daisan↔Odoo, cấu hình env và xử lý lỗi/idempotency/log.
- **Lưu ý khi dùng:** Xác định rõ "nguồn sự thật" cho từng loại dữ liệu (giá/tồn từ Odoo, đơn từ Daisan) để tránh ghi đè vòng lặp. Luôn đẩy đồng bộ qua queue, đừng chặn request. Kiểm tra phiên bản Odoo vì API model có thể khác.

---

### 51. Tích hợp Apify crawler data (chuẩn hóa & nạp vào catalog)
- **Khi nào dùng:** Khi lấy dữ liệu sản phẩm/giá đối thủ hoặc nguồn ngoài qua Apify và nạp/đối soát vào hệ thống Daisan.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư data integration cho Daisan, nạp dữ liệu crawl từ Apify (sản phẩm gạch/VLXD, giá thị trường) vào backend Laravel + MySQL một cách an toàn và chuẩn hóa.

BỐI CẢNH: Apify Actor crawl dữ liệu (tên sản phẩm, giá, kích thước, hình ảnh, nguồn URL) trả dataset JSON. Daisan dùng dữ liệu để: làm giàu catalog, theo dõi giá thị trường, gợi ý sản phẩm. Cần ingest theo lô, chuẩn hóa, khử trùng lặp, không ghi đè dữ liệu gốc đáng tin. Stack: Laravel + MySQL, có thể đẩy sang Elasticsearch.

YÊU CẦU:
1. Viết ApifyService (Laravel) gọi Apify API: trigger actor run, poll trạng thái hoặc nhận webhook khi xong, tải dataset items (phân trang), cấu hình token/actor_id qua .env, retry & timeout.
2. Pipeline ingest: validate từng item, chuẩn hóa (parse kích thước "60x60"→600x600, chuẩn đơn vị, làm sạch giá về số, chuẩn hóa tên), map sang bảng staging (crawled_products) trước khi merge.
3. Khử trùng lặp & matching: gắn với sản phẩm Daisan qua SKU/tên/kích thước (fuzzy), đánh dấu cần review thủ công khi không chắc; lưu nguồn (source_url, crawled_at), không tự ghi đè giá bán chính thức.
4. Theo dõi giá: bảng price_observations lưu lịch sử giá thị trường theo thời gian phục vụ phân tích/Ads.
5. Lập lịch (queue/cron), log ingest, báo cáo số bản ghi mới/cập nhật/bỏ qua.
RÀNG BUỘC: Tôn trọng pháp lý/robots, không hardcode token, ingest qua queue theo lô tránh quá tải DB, dữ liệu crawl vào staging trước (không trực tiếp vào catalog production), idempotency theo source_url, log đầy đủ, PSR-12.
OUTPUT MONG MUỐN: Code ApifyService + pipeline ingest + migration bảng staging/price_observations + logic chuẩn hóa & matching + ví dụ một lần ingest (input dataset → kết quả).
TIÊU CHÍ HOÀN THÀNH: Một dataset Apify được nạp vào staging, chuẩn hóa kích thước/giá, match được sản phẩm hiện có, ghi lịch sử giá, không phá dữ liệu catalog gốc.
```
- **Đầu ra mong muốn:** ApifyService + pipeline ingest qua staging, logic chuẩn hóa/matching/khử trùng lặp, bảng price_observations và ví dụ ingest một dataset.
- **Lưu ý khi dùng:** Luôn vào staging trước, không ghi thẳng catalog production. Làm rõ quy tắc matching (SKU vs fuzzy tên) và ngưỡng cần review tay. Lưu ý pháp lý/robots khi crawl đối thủ.

---

### 52. Tích hợp Drupal News API (đồng bộ tin tức/blog vào hệ sinh thái)
- **Khi nào dùng:** Khi kéo nội dung từ News.daisan.vn (Drupal) vào DaisanStore/landing/app để hiển thị tin tức, hướng dẫn chọn gạch, SEO content.
- **Prompt đầy đủ để copy:**
```
Bạn là kỹ sư tích hợp content cho Daisan, kết nối backend/frontend với News.daisan.vn (Drupal) qua JSON:API/REST để hiển thị tin tức & nội dung hướng dẫn ngành gạch/VLXD.

BỐI CẢNH: News.daisan.vn chạy Drupal, expose nội dung qua JSON:API (node--article) hoặc REST. Các hệ thống cần dùng: DaisanStore (khối tin tức/blog, bài "hướng dẫn chọn gạch"), landing, app. Stack tiêu thụ: Laravel (backend cache) + React + Tailwind (frontend). Tham chiếu knowledge-base/{DAISAN_BRAND_CONTEXT, UI_UX_STANDARD}.md.

YÊU CẦU:
1. Viết NewsService (Laravel) gọi Drupal JSON:API: list bài viết (lọc theo category/tag gạch, ngôn ngữ, sort theo ngày), get chi tiết bài theo slug, include hình ảnh/field media, xử lý phân trang JSON:API (links.next), cấu hình base_url qua .env.
2. Chuẩn hóa response Drupal (cấu trúc data/attributes/relationships) về DTO gọn cho frontend (title, slug, excerpt, cover_image, published_at, category, body html sanitize).
3. Caching (cache tag, TTL) để không gọi Drupal mỗi request; cơ chế invalidate khi có bài mới (webhook Drupal hoặc cron refresh).
4. API endpoint Laravel /api/v1/news (list + detail) trả JSON envelope cho React.
5. Gợi ý component React + Tailwind hiển thị danh sách tin (card có cover, tiêu đề, excerpt, ngày) và trang chi tiết, dùng màu CAM Daisan cho nhãn/category, sanitize HTML body an toàn (chống XSS).
RÀNG BUỘC: Không gọi Drupal trực tiếp từ client (đi qua Laravel cache), sanitize HTML, xử lý khi Drupal lỗi/timeout (fallback cache cũ), không hardcode URL, PSR-12 cho Laravel, component React tái sử dụng theo COMPONENT_LIBRARY_GUIDE.
OUTPUT MONG MUỐN: Code NewsService + chuẩn hóa DTO + endpoint Laravel + cấu hình cache + component React/Tailwind danh sách & chi tiết tin + ví dụ JSON Drupal đầu vào và JSON envelope đầu ra.
TIÊU CHÍ HOÀN THÀNH: Lấy danh sách bài "hướng dẫn chọn gạch" từ Drupal, cache đúng, hiển thị card tin theo brand Daisan trong React, body sanitize an toàn, chịu được khi Drupal tạm lỗi.
```
- **Đầu ra mong muốn:** NewsService Laravel + endpoint cache, DTO chuẩn hóa từ JSON:API Drupal, component React/Tailwind danh sách & chi tiết tin theo brand Daisan, có sanitize và fallback.
- **Lưu ý khi dùng:** Đi qua Laravel cache, không gọi Drupal từ client. Cấu trúc JSON:API lồng relationships khá rối — yêu cầu Claude xuất ví dụ input/output thật. Bắt buộc sanitize HTML body để chống XSS.
