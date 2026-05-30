export interface DaisanTemplate {
	cat: string;
	title: string;
	desc: string;
	prompt: string;
}

/**
 * Daisan-branded starter templates. Shared by the homepage teaser and the
 * full /templates gallery. Each `prompt` is a ready-to-build brief that gets
 * sent to the AI Studio via /chat/new.
 */
export const TEMPLATES: DaisanTemplate[] = [
	{
		cat: 'Storefront',
		title: 'DaisanStore Homepage',
		desc: 'Hero, featured collections, promotions.',
		prompt:
			'Build a modern DaisanStore storefront homepage with a hero, featured collections grid, trending products and promotional banners.',
	},
	{
		cat: 'PIM',
		title: 'Product Catalog Manager',
		desc: 'Filters, grid/list, bulk edit.',
		prompt:
			'Create a PIM product catalog manager with an advanced filter sidebar, grid/list toggle, sorting and bulk edit.',
	},
	{
		cat: 'Storefront',
		title: 'Tile Product Detail',
		desc: 'Gallery, specs, add to quote.',
		prompt:
			'Build a premium tile product detail page with an image gallery, specifications, related products and an add-to-quote bar.',
	},
	{
		cat: 'Showroom',
		title: 'Showroom Locator',
		desc: 'Map, list, contact details.',
		prompt:
			'Create a showroom locator with a searchable list, map, opening hours and contact details.',
	},
	{
		cat: 'Lead/RFQ',
		title: 'RFQ Quote Cart',
		desc: 'Add products, form, submit.',
		prompt:
			'Build an RFQ quote cart flow: add products to a quote, customer details form, and submit a request that creates a lead.',
	},
	{
		cat: 'B2B',
		title: 'B2B Pricing Portal',
		desc: 'Dealer tiers, pricing rules.',
		prompt:
			'Create a B2B pricing portal with dealer tiers, contract pricing rules and a price preview.',
	},
	{
		cat: 'Admin',
		title: 'Dealer Dashboard',
		desc: 'Orders, RFQs, account status.',
		prompt:
			'Build a dealer dashboard with orders, RFQ status, account information and quick actions.',
	},
	{
		cat: 'SEO',
		title: 'Local SEO Landing',
		desc: 'City landing for a showroom.',
		prompt:
			'Create a local SEO landing page for a tile showroom in a specific city, with offers and a contact form.',
	},
	{
		cat: 'Admin',
		title: 'Order Management Console',
		desc: 'Orders table, status, fulfilment.',
		prompt:
			'Build an order management console with an orders table, status filters, order detail drawer and fulfilment actions.',
	},
	{
		cat: 'PIM',
		title: 'Attribute & Category Editor',
		desc: 'Attributes, categories, taxonomy.',
		prompt:
			'Create a PIM attribute and category editor with a category tree, attribute groups and an inline editing table.',
	},
	{
		cat: 'B2C',
		title: 'Checkout & Cart Flow',
		desc: 'Cart, address, payment review.',
		prompt:
			'Build a B2C checkout flow with cart summary, address form, shipping options and an order review step.',
	},
	{
		cat: 'Showroom',
		title: 'Inspiration Gallery',
		desc: 'Curated rooms, tags, lookbook.',
		prompt:
			'Create a showroom inspiration gallery with curated room photos, filter tags, and a lookbook detail view linking to products.',
	},
];

/** Ordered category filters for the gallery — "All" is implicit and prepended. */
export const TEMPLATE_CATEGORIES = [
	'Storefront',
	'PIM',
	'B2B',
	'B2C',
	'Showroom',
	'Lead/RFQ',
	'Admin',
	'SEO',
] as const;
