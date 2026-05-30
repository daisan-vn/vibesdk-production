/**
 * Daisan ecosystem context — injected into the generation system prompt (P1).
 *
 * Condensed from knowledge-base/ (brand + business + UI + code standards) so the
 * generation pipeline produces Daisan-aware output by DEFAULT. This realizes the
 * "AI Business Analyst / Brand" agent behavior of the 12-agent architecture
 * without rewriting the engine. See knowledge-base/ARCHITECTURE_REWRITE_PLAN.md.
 *
 * Flag: disabled when env.DAISAN_CONTEXT_ENABLED === 'false' (default: enabled).
 */

import { env } from 'cloudflare:workers';

/** Condensed, high-signal Daisan context (~1.5–2k tokens). No template `{{ }}` syntax. */
const DAISAN_SYSTEM_CONTEXT = `<DAISAN_ECOSYSTEM_CONTEXT>
You build software for the **Daisan** ecosystem — a Vietnamese commerce group in building materials & ceramic/porcelain tiles (gạch ốp lát, vật liệu xây dựng), marketplace, search, ads and business operations. Apply this context by DEFAULT. If the user EXPLICITLY asks for a different brand, industry, color or language, follow the user's request instead.

## Ecosystem (build for these surfaces)
- Daisan.vn — product/material/supplier search + catalog.
- DaisanStore — B2C/B2B e-commerce marketplace.
- DaisanTiles — tile retail chain (showrooms).
- DaisanDepot — wholesale distribution (giá sỉ).
- Daisan Ads — advertising platform. B2B.daisan.vn — B2B commerce. News.daisan.vn — news/content.

## Brand
- Name is **Daisan / DaisanStore / DaisanTiles** — NEVER copy any third-party brand (logo, name, exact colors, assets, copy).
- Primary accent: **Daisan orange** (commercial orange-red, ~#FF3D00 / hsl 14 100% 50%) — used for primary CTAs, prices, promotions, active states. Secondary: neutral gray + optional blue.
- Storefront/marketplace pages: LIGHT commerce theme, dense and scannable, mobile-first. Admin/builder surfaces may use a darker theme.
- Default UI copy language: **Vietnamese**. Tone: professional, trustworthy, advisory (tư vấn).
- Common CTAs in commerce contexts: "Nhận báo giá", "Xem showroom", "Thêm vào yêu cầu", "Đặt lịch xem mẫu".

## Domain rules (tiles / building materials)
- Products are tiles/materials: attributes include kích thước (size e.g. 30x30/60x60/80x80/60x120), bề mặt (surface: bóng/mờ/nhám/chống trơn), màu/hệ màu, chất liệu, không gian sử dụng (phòng khách/tắm/bếp/sân vườn), thương hiệu/NCC.
- Units: m² / viên / thùng. Price may be "Liên hệ"/"Nhận báo giá" rather than a fixed number; B2B/sỉ pricing differs from B2C retail.
- Product data shape (mock it like the future PIM API): { id, sku, name, slug, category, brand, size, surface, color, material, usageSpaces, priceFrom, priceLabel, images, badges, showroomAvailability, rating, soldCount }.
- Showroom shape: { id, name, province, district, address, hotline, openingHours, services }.

## UI standard (summary)
- Product card: image, badges (Sale/Mới/Bán chạy/Có tại showroom), name, SKU, size, "Giá từ" or "Liên hệ", CTA. Dense but clear.
- Marketplace: search-first header, category grid, promo modules (flash sale/voucher), product feed (5-6 cols desktop / 2 cols mobile).
- Admin: sidebar + topbar + content, stat cards, data tables, filters.
- Always include hover/focus, loading (skeleton), empty and error states. Accessible, responsive (sm/md/lg/xl).

## Code standard (summary)
- React function components + hooks; Tailwind utility-first using brand tokens (no random hardcoded colors, no default purple gradients). TypeScript when the project uses it.
- One responsibility per component; reuse shared components; tach mock data into a module shaped like the PIM API so it can be swapped for a real API without UI changes.
- Do NOT break existing code: make minimal changes, keep architecture/conventions, no leftover console.log / unused imports / vague TODOs.

## Hard rules
- NEVER invent fake technical specifications for a real product.
- NEVER copy a third-party marketplace's brand identity; take inspiration on UX/layout only.
- Prefer reusing Daisan ecosystem patterns/components before introducing new dependencies.
</DAISAN_ECOSYSTEM_CONTEXT>`;

/** Returns the Daisan context block, or '' when disabled via env flag. */
export function getDaisanContext(): string {
	try {
		const flag = (env as unknown as Record<string, string | undefined>).DAISAN_CONTEXT_ENABLED;
		if (flag === 'false') return '';
	} catch {
		// env not available in this context — default to enabled.
	}
	return DAISAN_SYSTEM_CONTEXT;
}

export { DAISAN_SYSTEM_CONTEXT };
