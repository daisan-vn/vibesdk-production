/**
 * Daisan specialist agents (P3): Database Architect, Search Engineer, AI Content.
 *
 * These are the three roles from the 12-agent architecture that the base VibeSDK
 * pipeline lacks. Each is a focused, conditional LLM step that produces a SHORT
 * design brief; the orchestrator aggregates the briefs and the blueprint step
 * incorporates them. Best-effort: a specialist failure is skipped, never fatal.
 */

export type SpecialistId = 'database' | 'search' | 'content';

export interface Specialist {
	id: SpecialistId;
	title: string;
	/** Activate only when the request clearly needs this specialist. */
	shouldRun(request: string): boolean;
	/** Focused system prompt; the user request is sent as the user message. */
	systemPrompt: string;
}

const has = (req: string, words: string[]) => {
	const r = req.toLowerCase();
	return words.some((w) => r.includes(w));
};

export const SPECIALISTS: Specialist[] = [
	{
		id: 'database',
		title: 'Database Architect',
		shouldRun: (req) =>
			has(req, [
				'database', 'data model', 'schema', 'pim', 'product', 'sản phẩm', 'catalog', 'danh mục',
				'order', 'đơn hàng', 'inventory', 'tồn kho', 'customer', 'khách hàng', 'supplier', 'nhà cung cấp',
				'dealer', 'đại lý', 'b2b', 'crm', 'erp', 'entity', 'table', 'bảng', 'relationship',
			]),
		systemPrompt:
			'Bạn là DATABASE ARCHITECT cho hệ sinh thái thương mại Daisan (gạch ốp lát/VLXD, marketplace). Với yêu cầu sau, hãy thiết kế MÔ HÌNH DỮ LIỆU NGẮN GỌN: các entity chính + trường quan trọng, quan hệ (1-1/1-n/n-n), index nên có cho lọc/tìm kiếm marketplace. Ánh xạ theo schema PIM (id, sku, attributes, price, stock, images, category…). KHÔNG viết code, chỉ thiết kế. Tối đa ~250 từ, dùng bullet/bảng gọn.',
	},
	{
		id: 'search',
		title: 'Search Engineer',
		shouldRun: (req) =>
			has(req, [
				'search', 'tìm kiếm', 'filter', 'lọc', 'facet', 'elasticsearch', 'sort', 'sắp xếp',
				'suggestion', 'gợi ý', 'autocomplete', 'catalog', 'danh mục', 'marketplace', 'find',
			]),
		systemPrompt:
			'Bạn là SEARCH ENGINEER cho Daisan.vn (Elasticsearch). Với yêu cầu sau, thiết kế NGẮN GỌN: Elasticsearch mapping (field type + analyzer tiếng Việt cho name/description), các FACET/FILTER (vd kích thước, bề mặt, màu, không gian, thương hiệu, giá), tiêu chí SORT, và suggestion/autocomplete. KHÔNG viết code app, chỉ thiết kế search. Tối đa ~250 từ.',
	},
	{
		id: 'content',
		title: 'AI Content & SEO',
		shouldRun: (req) =>
			has(req, [
				'content', 'nội dung', 'seo', 'blog', 'news', 'tin tức', 'mô tả', 'description', 'marketing',
				'landing', 'article', 'bài viết', 'tiêu đề', 'meta', 'storefront', 'campaign', 'chiến dịch',
			]),
		systemPrompt:
			'Bạn là AI CONTENT & SEO SPECIALIST cho Daisan (gạch ốp lát/VLXD). Với yêu cầu sau, gợi ý NGẮN GỌN: cấu trúc nội dung sản phẩm/trang, chuẩn hóa thuộc tính, và metadata SEO (title, slug, meta description, heading, schema.org phù hợp). Brand voice chuyên nghiệp tiếng Việt. KHÔNG bịa thông số kỹ thuật sản phẩm. Tối đa ~200 từ.',
	},
];
