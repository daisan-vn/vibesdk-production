# Daisan.ai — Knowledge Base

Bộ tài liệu nền tảng để **"đào tạo" Daisan.ai** — nền tảng AI hỗ trợ code chuyên nghiệp cho hệ sinh thái thương mại Daisan (vật liệu xây dựng, gạch ốp lát, marketplace, search, ads, quản trị doanh nghiệp).

Đây là **nguồn sự thật (source of truth)** về tầm nhìn, thương hiệu, nghiệp vụ, chuẩn UI/UX, chuẩn code, chuẩn prompt, sổ tay lỗi và thư viện component. Mọi system prompt, knowledge base và quy trình của Daisan.ai phải nhất quán với các tài liệu này.

## Mục lục

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | [DAISAN_AI_VISION.md](DAISAN_AI_VISION.md) | Tầm nhìn sản phẩm: Daisan.ai là gì, mục tiêu, khách hàng, năng lực cốt lõi, khác biệt vs Lovable/ChatGPT/Claude, lộ trình 3/6/12 tháng |
| 2 | [DAISAN_BRAND_CONTEXT.md](DAISAN_BRAND_CONTEXT.md) | Bối cảnh thương hiệu: hệ sinh thái, ngành hàng, khách hàng, ngôn ngữ & tông giọng, điều AI luôn phải nhớ |
| 3 | [DAISAN_BUSINESS_CONTEXT.md](DAISAN_BUSINESS_CONTEXT.md) | Bối cảnh nghiệp vụ: marketplace B2C/B2B, bán lẻ, bán sỉ, search, ads, PIM, tích hợp Odoo/Elasticsearch/Drupal/Apify/Laravel |
| 4 | [UI_UX_STANDARD.md](UI_UX_STANDARD.md) | Chuẩn giao diện: design system, landing/marketplace/dashboard/admin/product/search, mobile, checklist UI |
| 5 | [CODE_STANDARD.md](CODE_STANDARD.md) | Chuẩn code: React, Tailwind, component, folder, đặt tên, mock data, API, error handling, bảo mật, checklist review |
| 6 | [PROMPT_STANDARD.md](PROMPT_STANDARD.md) | Chuẩn prompt: công thức + mẫu prompt cho landing/marketplace/dashboard/listing/detail/CRUD/fix/refactor/responsive/tối ưu UI |
| 7 | [ERROR_PLAYBOOK.md](ERROR_PLAYBOOK.md) | Sổ tay lỗi: blank screen, import/export, router, Tailwind, render, API, state, responsive, hydration + quy trình debug |
| 8 | [COMPONENT_LIBRARY_GUIDE.md](COMPONENT_LIBRARY_GUIDE.md) | Thư viện 21 component chuẩn: Header, Footer, Sidebar, ProductCard, DataTable, Form, Modal, EmptyState... |

## Cách sử dụng

- **Cho đội IT / vận hành / kinh doanh Daisan:** đọc theo thứ tự 1→8 để nắm tầm nhìn → nghiệp vụ → chuẩn thực thi.
- **Cho việc nạp vào Daisan.ai (knowledge base / system prompt):** các tài liệu 2, 3 (brand + business context) và 4, 5, 7 (UI/code/error standard) là phần cốt lõi nên đưa vào ngữ cảnh khi AI lập kế hoạch và sinh code. Tài liệu 6 (prompt) và 8 (component) dùng làm thư viện tham chiếu khi tạo prompt và scaffold.
- **Khi cập nhật:** sửa trực tiếp file tương ứng, giữ nguyên cấu trúc heading + checklist để dễ diff và dễ nạp tự động.

> Quy ước: mỗi tài liệu đều có mục **"AI PHẢI LÀM"** và **"AI KHÔNG ĐƯỢC LÀM"** + checklist thực thi ở các phần quan trọng — đây là phần ưu tiên cao nhất khi huấn luyện hành vi AI.
