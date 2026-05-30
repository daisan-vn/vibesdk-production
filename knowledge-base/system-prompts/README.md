# Daisan.ai — Bộ System Prompt đa-agent

Bộ **system prompt theo từng vai trò AI Agent** để vận hành Daisan.ai như một trợ lý code chuyên nghiệp kiểu Lovable (kiến trúc đa-agent). Mỗi file là một system prompt **copy-paste dùng được ngay**, viết theo cấu trúc chuẩn: Vai trò · Nhiệm vụ chính · Quy tắc bắt buộc · Quy tắc KHÔNG được làm · Quy trình xử lý · Định dạng đầu ra · Ví dụ đầu ra.

Tất cả agent đều tham chiếu bộ knowledge base ở [`../`](../README.md) (brand, business, UI/UX, code, prompt, error, component).

## Danh sách agent

| Agent | File | Vai trò 1 dòng |
|---|---|---|
| 🧭 Master Orchestrator | [DAISAN_AI_MASTER_SYSTEM_PROMPT.md](DAISAN_AI_MASTER_SYSTEM_PROMPT.md) | Tổng điều phối: hiểu yêu cầu, hỏi lại, lập kế hoạch, route agent, gác cổng chất lượng |
| 📋 Product Planner | [PRODUCT_PLANNER_AGENT_PROMPT.md](PRODUCT_PLANNER_AGENT_PROMPT.md) | Feature list, personas, page/module, user stories, acceptance criteria |
| 🎨 UI/UX Designer | [UI_UX_DESIGNER_AGENT_PROMPT.md](UI_UX_DESIGNER_AGENT_PROMPT.md) | Layout, section, bố cục, UI spec, desktop/mobile, chuẩn SaaS/marketplace/dashboard |
| ⚛️ Frontend Engineer | [FRONTEND_ENGINEER_AGENT_PROMPT.md](FRONTEND_ENGINEER_AGENT_PROMPT.md) | React/Tailwind, chia component, mock data, responsive, states, không phá code cũ |
| 🔧 Backend Engineer | [BACKEND_ENGINEER_AGENT_PROMPT.md](BACKEND_ENGINEER_AGENT_PROMPT.md) | API, backend Laravel/PHP, tích hợp MySQL/ES/Odoo/Drupal/Apify, bảo mật & phân quyền |
| 🗄️ Database Architect | [DATABASE_ARCHITECT_AGENT_PROMPT.md](DATABASE_ARCHITECT_AGENT_PROMPT.md) | Bảng, relationship, index, mô hình dữ liệu marketplace + search |
| 🔍 Search Engineer | [SEARCH_ENGINEER_AGENT_PROMPT.md](SEARCH_ENGINEER_AGENT_PROMPT.md) | ES mapping, search API, filter/facet/sort/suggestion, Daisan.vn |
| ✍️ AI Content | [AI_CONTENT_AGENT_PROMPT.md](AI_CONTENT_AGENT_PROMPT.md) | Nội dung sản phẩm, SEO, mô tả, chuẩn hóa thuộc tính, marketing |
| 🐞 Debug Fixer | [DEBUG_FIXER_AGENT_PROMPT.md](DEBUG_FIXER_AGENT_PROMPT.md) | Đọc lỗi, tìm nguyên nhân, sửa tối thiểu, không vỡ layout |
| ✅ QA Review | [QA_REVIEW_AGENT_PROMPT.md](QA_REVIEW_AGENT_PROMPT.md) | Kiểm tra UI/code/responsive/logic/bảo mật/nội dung + checklist nghiệm thu |
| 🧹 Refactor | [REFACTOR_AGENT_PROMPT.md](REFACTOR_AGENT_PROMPT.md) | Tách component, làm sạch, giảm lặp, chuẩn folder, không đổi hành vi |
| 🚀 Deployment | [DEPLOYMENT_AGENT_PROMPT.md](DEPLOYMENT_AGENT_PROMPT.md) | Build, deploy, env, lỗi build, checklist publish |

## Phối hợp giữa các agent

👉 Xem [DAISAN_AI_AGENT_WORKFLOW.md](DAISAN_AI_AGENT_WORKFLOW.md) — sơ đồ luồng, hợp đồng bàn giao (handoff) giữa từng cặp agent, vòng lặp (QA fail → Engineer; mơ hồ → Master hỏi lại), và ví dụ end-to-end.

Luồng chính:

```
User Request → Master → Product Planner → UI/UX Designer
  → Frontend/Backend Engineer (+ Database / Search / Content khi cần)
  → Debug Fixer → QA Review → Final Delivery
```

## Cách dùng

- **Triển khai kỹ thuật:** mỗi agent = một system prompt nạp vào một bước/agent tương ứng trong pipeline của Daisan.ai. Master nhận input người dùng, các agent con nhận output của bước trước theo handoff contract trong workflow doc.
- **Tùy biến:** chỉnh trực tiếp file, giữ nguyên 8 mục cấu trúc để dễ diff và nạp tự động.
- **Nguồn ràng buộc:** mọi agent phải tuân knowledge base ở thư mục cha (đặc biệt brand + business + code/UI standard).
