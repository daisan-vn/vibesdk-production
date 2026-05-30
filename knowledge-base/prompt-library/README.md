# Daisan.ai — Prompt Library (75 prompt thực chiến)

Thư viện **75 prompt copy-paste dùng ngay** cho Claude và Daisan.ai khi xây dựng/nâng cấp các sản phẩm trong hệ sinh thái Daisan (VLXD, gạch ốp lát, marketplace, admin, search, ads). Ưu tiên **React + Tailwind**, mở rộng **Laravel / API / Elasticsearch / Odoo / Drupal / Apify** khi cần.

Mỗi prompt viết theo cấu trúc: **Tên · Khi nào dùng · Prompt đầy đủ để copy · Đầu ra mong muốn · Lưu ý khi dùng**. Tất cả gắn brand Daisan (màu CAM Daisan), không copy thương hiệu bên thứ ba, và tham chiếu [knowledge base](../README.md).

## 6 nhóm — 75 prompt

| Nhóm | File | Số prompt | Phạm vi |
|---|---|---|---|
| 1 | [NHOM-1-prompt-nen-tang.md](NHOM-1-prompt-nen-tang.md) | 1–7 (7) | Khởi tạo vai trò: Frontend Engineer, Product Architect, UI/UX Designer, Debug Fixer, Code Reviewer, Refactor Engineer, AI Business Analyst |
| 2 | [NHOM-2-prompt-tao-giao-dien.md](NHOM-2-prompt-tao-giao-dien.md) | 8–24 (17) | Tạo trang: landing, DaisanStore home, danh mục, chi tiết SP, shop/NCC, giỏ hàng, checkout, login, search, dashboard, admin layout, quản lý SP/đơn/KH/NCC, báo cáo doanh thu, AI tối ưu SP |
| 3 | [NHOM-3-prompt-tao-component.md](NHOM-3-prompt-tao-component.md) | 25–40 (16) | Component: Header, SearchBar, ProductCard, ShopCard, CategoryGrid, FlashSale, Voucher, Sidebar, StatCard, DataTable, Form, Modal, Tabs, FilterSidebar, Pagination, Footer |
| 4 | [NHOM-4-prompt-backend-api-database.md](NHOM-4-prompt-backend-api-database.md) | 41–52 (12) | API marketplace, database (SP/đơn/NCC/KH), Laravel CRUD/API, ES mapping, filter/facet/sort, tích hợp Odoo/Apify/Drupal |
| 5 | [NHOM-5-prompt-sua-loi.md](NHOM-5-prompt-sua-loi.md) | 53–62 (10) | Sửa lỗi kiểu Lovable: blank screen, import/export, router, Tailwind, responsive vỡ, build, API, state/render, component không hiện, lệch bố cục |
| 6 | [NHOM-6-prompt-kiem-tra-nang-cap.md](NHOM-6-prompt-kiem-tra-nang-cap.md) | 63–75 (13) | Review UI/code/responsive/a11y/perf/security, refactor, tách component, chuẩn folder, tối ưu nội dung VN/CTA/conversion, checklist bàn giao |

## Cách dùng

1. **Khởi tạo vai trò trước** (Nhóm 1): dán prompt vai trò vào System/đầu phiên để "đóng vai".
2. **Giao việc cụ thể**: chọn prompt ở Nhóm 2–4, thay các biến (tên sản phẩm Daisan, thuộc tính gạch, nguồn dữ liệu) rồi gửi.
3. **Sửa lỗi / nâng cấp**: dùng Nhóm 5–6 khi có lỗi hoặc trước khi bàn giao.
4. **Nạp knowledge base**: để prompt phát huy tối đa, đính kèm/nạp các file ở [`../`](../README.md) (đặc biệt brand + UI/code standard) vào ngữ cảnh.

> Liên quan: [System prompts đa-agent](../system-prompts/README.md) — dùng kèm khi vận hành Daisan.ai theo kiến trúc nhiều agent.
