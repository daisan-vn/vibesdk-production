/**
 * Knowledge Base registry for the /resources surface.
 *
 * The markdown source lives in `knowledge-base/` at the repo root and is
 * bundled at BUILD time via `import.meta.glob({ eager, query: '?raw' })`, so
 * no backend / runtime fs access is required — the docs ship inside the client
 * bundle and render with react-markdown on `/resources/:slug`.
 */

// Eagerly import every markdown file under knowledge-base/ as a raw string.
// Keys look like "/knowledge-base/README.md".
const RAW = import.meta.glob('/knowledge-base/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export type DocCategoryId =
  | 'start'
  | 'guides'
  | 'docs'
  | 'prompts'
  | 'agents'
  | 'ops';

export interface DocCategory {
  id: DocCategoryId;
  title: string;
  description: string;
  /** lucide-react icon name, mapped in the page component */
  icon: string;
}

export interface DocMeta {
  slug: string;
  title: string;
  description: string;
  category: DocCategoryId;
  /** path key into RAW */
  path: string;
}

export interface Doc extends DocMeta {
  content: string;
  /** estimated reading time in minutes */
  readingMinutes: number;
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: 'start',
    title: 'Bắt đầu',
    description: 'Tầm nhìn và cách Daisan AI biến mô tả thành ứng dụng thương mại.',
    icon: 'GraduationCap',
  },
  {
    id: 'guides',
    title: 'Cẩm nang',
    description: 'Bối cảnh kinh doanh, thương hiệu và thư viện component của Daisan.',
    icon: 'Map',
  },
  {
    id: 'docs',
    title: 'Tài liệu kỹ thuật',
    description: 'Chuẩn code, UI/UX và prompt để bản dựng luôn nhất quán.',
    icon: 'FileCode',
  },
  {
    id: 'prompts',
    title: 'Thư viện Prompt',
    description: '6 nhóm prompt mẫu: nền tảng, giao diện, component, backend, sửa lỗi, nâng cấp.',
    icon: 'BookOpen',
  },
  {
    id: 'agents',
    title: 'AI Agents',
    description: 'System prompt của 12 agent chuyên biệt và quy trình phối hợp.',
    icon: 'Bot',
  },
  {
    id: 'ops',
    title: 'Vận hành & Lỗi',
    description: 'Sổ tay xử lý lỗi và kế hoạch kiến trúc của nền tảng.',
    icon: 'LifeBuoy',
  },
];

// Curated metadata (title/description/category) per source file. Order here is
// the display order within each category.
const DOC_META: DocMeta[] = [
  // --- start ---
  { slug: 'gioi-thieu', title: 'Giới thiệu bộ tài liệu', description: 'Tổng quan kho tri thức nền tảng của Daisan AI.', category: 'start', path: '/knowledge-base/README.md' },
  { slug: 'tam-nhin', title: 'Tầm nhìn Daisan AI', description: 'Định hướng sản phẩm và triết lý xây dựng.', category: 'start', path: '/knowledge-base/DAISAN_AI_VISION.md' },

  // --- guides ---
  { slug: 'boi-canh-kinh-doanh', title: 'Bối cảnh kinh doanh Daisan', description: 'Hệ sinh thái VLXD, gạch ốp lát, B2B/B2C và showroom.', category: 'guides', path: '/knowledge-base/DAISAN_BUSINESS_CONTEXT.md' },
  { slug: 'thuong-hieu', title: 'Bộ nhận diện thương hiệu', description: 'Màu cam #FF3D00, giọng điệu và quy tắc thương hiệu.', category: 'guides', path: '/knowledge-base/DAISAN_BRAND_CONTEXT.md' },
  { slug: 'thu-vien-component', title: 'Hướng dẫn thư viện component', description: 'Các component dùng lại cho storefront và dashboard.', category: 'guides', path: '/knowledge-base/COMPONENT_LIBRARY_GUIDE.md' },

  // --- docs ---
  { slug: 'chuan-code', title: 'Chuẩn viết code', description: 'Quy ước code để bản dựng sạch và dễ bảo trì.', category: 'docs', path: '/knowledge-base/CODE_STANDARD.md' },
  { slug: 'chuan-ui-ux', title: 'Chuẩn UI/UX', description: 'Nguyên tắc thiết kế giao diện đồng nhất.', category: 'docs', path: '/knowledge-base/UI_UX_STANDARD.md' },
  { slug: 'chuan-prompt', title: 'Chuẩn viết prompt', description: 'Cách viết prompt hiệu quả cho Daisan AI.', category: 'docs', path: '/knowledge-base/PROMPT_STANDARD.md' },

  // --- prompts ---
  { slug: 'prompt-tong-quan', title: 'Tổng quan thư viện prompt', description: 'Cách dùng 6 nhóm prompt mẫu.', category: 'prompts', path: '/knowledge-base/prompt-library/README.md' },
  { slug: 'prompt-nen-tang', title: 'Nhóm 1 — Prompt nền tảng', description: 'Khởi tạo dự án và định hình ý tưởng.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-1-prompt-nen-tang.md' },
  { slug: 'prompt-giao-dien', title: 'Nhóm 2 — Tạo giao diện', description: 'Prompt dựng trang và bố cục.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-2-prompt-tao-giao-dien.md' },
  { slug: 'prompt-component', title: 'Nhóm 3 — Tạo component', description: 'Prompt tạo các thành phần tái sử dụng.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-3-prompt-tao-component.md' },
  { slug: 'prompt-backend', title: 'Nhóm 4 — Backend/API/Database', description: 'Prompt cho API, dữ liệu và logic.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-4-prompt-backend-api-database.md' },
  { slug: 'prompt-sua-loi', title: 'Nhóm 5 — Sửa lỗi', description: 'Prompt chẩn đoán và khắc phục lỗi.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-5-prompt-sua-loi.md' },
  { slug: 'prompt-kiem-tra', title: 'Nhóm 6 — Kiểm tra & nâng cấp', description: 'Prompt rà soát chất lượng và mở rộng.', category: 'prompts', path: '/knowledge-base/prompt-library/NHOM-6-prompt-kiem-tra-nang-cap.md' },

  // --- agents ---
  { slug: 'agents-tong-quan', title: 'Tổng quan 12 AI Agents', description: 'Vai trò của từng agent chuyên biệt.', category: 'agents', path: '/knowledge-base/system-prompts/README.md' },
  { slug: 'agent-master', title: 'Master System Prompt', description: 'Prompt gốc điều phối toàn bộ Daisan AI.', category: 'agents', path: '/knowledge-base/system-prompts/DAISAN_AI_MASTER_SYSTEM_PROMPT.md' },
  { slug: 'agent-workflow', title: 'Quy trình phối hợp agent', description: 'Luồng làm việc giữa 12 agent.', category: 'agents', path: '/knowledge-base/system-prompts/DAISAN_AI_AGENT_WORKFLOW.md' },
  { slug: 'agent-work-mode', title: 'Work Mode System Prompt', description: '7 chế độ làm việc: Hỏi, Tư vấn, Kế hoạch, Học, Sửa lỗi, Review, Build.', category: 'agents', path: '/knowledge-base/system-prompts/DAISAN_AI_WORK_MODE_SYSTEM_PROMPT.md' },
  { slug: 'agent-planner', title: 'Product Planner Agent', description: 'Lập kế hoạch sản phẩm và blueprint.', category: 'agents', path: '/knowledge-base/system-prompts/PRODUCT_PLANNER_AGENT_PROMPT.md' },
  { slug: 'agent-designer', title: 'UI/UX Designer Agent', description: 'Thiết kế giao diện và trải nghiệm.', category: 'agents', path: '/knowledge-base/system-prompts/UI_UX_DESIGNER_AGENT_PROMPT.md' },
  { slug: 'agent-frontend', title: 'Frontend Engineer Agent', description: 'Dựng giao diện React.', category: 'agents', path: '/knowledge-base/system-prompts/FRONTEND_ENGINEER_AGENT_PROMPT.md' },
  { slug: 'agent-backend', title: 'Backend Engineer Agent', description: 'Xây API và logic phía server.', category: 'agents', path: '/knowledge-base/system-prompts/BACKEND_ENGINEER_AGENT_PROMPT.md' },
  { slug: 'agent-database', title: 'Database Architect Agent', description: 'Thiết kế lược đồ dữ liệu.', category: 'agents', path: '/knowledge-base/system-prompts/DATABASE_ARCHITECT_AGENT_PROMPT.md' },
  { slug: 'agent-search', title: 'Search Engineer Agent', description: 'Tìm kiếm và lọc dữ liệu.', category: 'agents', path: '/knowledge-base/system-prompts/SEARCH_ENGINEER_AGENT_PROMPT.md' },
  { slug: 'agent-content', title: 'AI Content Agent', description: 'Sinh nội dung và mô tả sản phẩm.', category: 'agents', path: '/knowledge-base/system-prompts/AI_CONTENT_AGENT_PROMPT.md' },
  { slug: 'agent-qa', title: 'QA Review Agent', description: 'Kiểm thử và đánh giá chất lượng.', category: 'agents', path: '/knowledge-base/system-prompts/QA_REVIEW_AGENT_PROMPT.md' },
  { slug: 'agent-debug', title: 'Debug Fixer Agent', description: 'Phát hiện và sửa lỗi tự động.', category: 'agents', path: '/knowledge-base/system-prompts/DEBUG_FIXER_AGENT_PROMPT.md' },
  { slug: 'agent-deploy', title: 'Deployment Agent', description: 'Triển khai ứng dụng lên Cloudflare.', category: 'agents', path: '/knowledge-base/system-prompts/DEPLOYMENT_AGENT_PROMPT.md' },
  { slug: 'agent-refactor', title: 'Refactor Agent', description: 'Tối ưu và làm gọn mã nguồn.', category: 'agents', path: '/knowledge-base/system-prompts/REFACTOR_AGENT_PROMPT.md' },

  // --- ops ---
  { slug: 'so-tay-loi', title: 'Sổ tay xử lý lỗi', description: 'Các lỗi thường gặp và cách khắc phục.', category: 'ops', path: '/knowledge-base/ERROR_PLAYBOOK.md' },
  { slug: 'kien-truc', title: 'Kế hoạch kiến trúc 12-agent', description: 'Lộ trình tái cấu trúc pipeline của nền tảng.', category: 'ops', path: '/knowledge-base/ARCHITECTURE_REWRITE_PLAN.md' },
];

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Build the full doc list, keeping only entries whose source file actually
// bundled (defensive — a renamed/removed file is silently skipped, never crashes).
export const DOCS: Doc[] = DOC_META.filter((m) => typeof RAW[m.path] === 'string').map(
  (m) => ({
    ...m,
    content: RAW[m.path],
    readingMinutes: readingMinutes(RAW[m.path]),
  }),
);

export function getDoc(slug: string): Doc | undefined {
  return DOCS.find((d) => d.slug === slug);
}

export function getDocsByCategory(id: DocCategoryId): Doc[] {
  return DOCS.filter((d) => d.category === id);
}

export function getCategory(id: DocCategoryId): DocCategory | undefined {
  return DOC_CATEGORIES.find((c) => c.id === id);
}
