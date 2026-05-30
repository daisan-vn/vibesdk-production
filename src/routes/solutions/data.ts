export interface DaisanSolution {
  slug: string;
  name: string;
  eyebrow: string;
  tagline: string;
  problem: string;
  features: { title: string; desc: string }[];
  outcomes: string[];
  templates: string[];
  cta: string;
}

export const SOLUTIONS: DaisanSolution[] = [
  {
    slug: "pim",
    name: "Product Information Management",
    eyebrow: "PIM",
    tagline: "One source of truth for every product, attribute, and asset.",
    problem:
      "Tile and building-material catalogs sprawl across spreadsheets, supplier PDFs, and inconsistent SKUs — so the same product ships with different specs, missing media, and broken SEO.",
    features: [
      {
        title: "Products & SKUs",
        desc: "Model variants, units, and pack sizes with validated SKUs and lifecycle states.",
      },
      {
        title: "Attributes & categories",
        desc: "Define attribute sets per category and enforce required fields before publish.",
      },
      {
        title: "Media library",
        desc: "Attach images, swatches, and spec sheets with reusable, role-based assets.",
      },
      {
        title: "SEO fields",
        desc: "Manage titles, slugs, and structured metadata at the product and category level.",
      },
      {
        title: "Publish rules",
        desc: "Gate publishing on completeness checks, channels, and regional availability.",
      },
    ],
    outcomes: [
      "Consistent specs across every storefront and channel",
      "Faster catalog onboarding for new supplier ranges",
      "Fewer returns from inaccurate product data",
    ],
    templates: ["Tile catalog starter", "Attribute set builder", "Channel publish workflow"],
    cta: "Build your PIM",
  },
  {
    slug: "storefront",
    name: "DaisanStore Storefront",
    eyebrow: "Storefront",
    tagline: "Launch a conversion-ready storefront for your DaisanStore catalog.",
    problem:
      "Generic e-commerce themes don't understand tiles and building materials — shoppers can't filter by finish, size, or coverage, and local SEO is an afterthought.",
    features: [
      {
        title: "Homepage sections",
        desc: "Compose hero, featured collections, and promo blocks from reusable modules.",
      },
      {
        title: "Product listing",
        desc: "Faceted filtering by finish, size, and coverage with fast category browsing.",
      },
      {
        title: "Product detail",
        desc: "Spec tables, swatch galleries, and coverage calculators on every product page.",
      },
      {
        title: "Collections & campaigns",
        desc: "Curate seasonal collections and time-boxed campaign landing pages.",
      },
      {
        title: "Local SEO",
        desc: "Region-aware metadata, schema, and sitemaps tuned for local search.",
      },
    ],
    outcomes: [
      "Higher add-to-cart from richer product pages",
      "Better organic ranking on local material searches",
      "Faster campaign launches without developer time",
    ],
    templates: ["DaisanStore home", "Collection landing", "Campaign page"],
    cta: "Launch your storefront",
  },
  {
    slug: "b2b",
    name: "B2B Dealer Portal",
    eyebrow: "B2B",
    tagline: "Pricing groups, quotations, and project pricing for dealers.",
    problem:
      "Dealers and contractors need negotiated pricing, bulk quotes, and project terms — but retail checkout flows force manual back-and-forth over email and phone.",
    features: [
      {
        title: "Dealer accounts",
        desc: "Onboard dealers with approval, credit terms, and per-account catalogs.",
      },
      {
        title: "Pricing groups",
        desc: "Assign tiered price lists and discounts by dealer segment or region.",
      },
      {
        title: "Quotations",
        desc: "Generate, version, and approve quotes that convert directly into orders.",
      },
      {
        title: "Bulk & project pricing",
        desc: "Apply volume breaks and project-level pricing across large line items.",
      },
    ],
    outcomes: [
      "Faster quote turnaround for dealer accounts",
      "Accurate, policy-driven negotiated pricing",
      "More repeat orders from project pipelines",
    ],
    templates: ["Dealer onboarding", "Quotation builder", "Project pricing sheet"],
    cta: "Open your dealer portal",
  },
  {
    slug: "b2c",
    name: "B2C Retail Experience",
    eyebrow: "B2C",
    tagline: "Profiles, wishlists, and quote history for retail shoppers.",
    problem:
      "Homeowners researching tiles abandon carts when they can't save favorites, revisit past quotes, or track retail orders in one place.",
    features: [
      {
        title: "Customer profiles",
        desc: "Let shoppers manage addresses, preferences, and saved projects.",
      },
      {
        title: "Wishlist",
        desc: "Save products and swatches to compare and revisit across sessions.",
      },
      {
        title: "Quote history",
        desc: "Keep a record of requested quotes with status and easy re-quote.",
      },
      {
        title: "Retail orders",
        desc: "Track placed orders, fulfillment status, and reorders in one view.",
      },
    ],
    outcomes: [
      "Lower cart abandonment from saved projects",
      "Higher repeat purchase from order history",
      "Smoother path from browsing to checkout",
    ],
    templates: ["Customer account hub", "Wishlist page", "Order tracking"],
    cta: "Build your retail experience",
  },
  {
    slug: "showroom",
    name: "Showroom Network",
    eyebrow: "Showroom",
    tagline: "Locations, staff, and appointment booking for every showroom.",
    problem:
      "Customers want to see tiles in person, but scattered location pages, no display inventory, and phone-only booking lose high-intent visits.",
    features: [
      {
        title: "Locations & regions",
        desc: "Manage showroom directories grouped by region with hours and maps.",
      },
      {
        title: "Staff directory",
        desc: "Assign sales staff to showrooms with roles and contact details.",
      },
      {
        title: "Products on display",
        desc: "Show which products are physically available to view at each location.",
      },
      {
        title: "Appointment booking",
        desc: "Let customers book showroom visits tied to staff availability.",
      },
    ],
    outcomes: [
      "More booked, higher-intent showroom visits",
      "Clear visibility into on-display inventory",
      "Better staff utilization across locations",
    ],
    templates: ["Showroom locator", "Staff directory", "Booking flow"],
    cta: "Map your showrooms",
  },
  {
    slug: "lead-rfq",
    name: "Lead & RFQ Management",
    eyebrow: "Lead / RFQ",
    tagline: "Capture quote requests and route leads to the right owner.",
    problem:
      "Project inquiries arrive through forms, chat, and showrooms with no shared queue — leads go cold before anyone follows up.",
    features: [
      {
        title: "Quote requests",
        desc: "Capture structured RFQs with product context and customer details.",
      },
      {
        title: "Quote cart",
        desc: "Let visitors assemble a multi-product request before submitting.",
      },
      {
        title: "Lead assignment",
        desc: "Auto-route leads to staff or regions with clear ownership.",
      },
      {
        title: "Status & follow-up",
        desc: "Track lead status, reminders, and follow-up activity to close.",
      },
    ],
    outcomes: [
      "Faster first response on inbound RFQs",
      "Fewer dropped leads with clear ownership",
      "Higher quote-to-order conversion",
    ],
    templates: ["RFQ form", "Quote cart", "Lead pipeline board"],
    cta: "Capture more leads",
  },
  {
    slug: "internal-tools",
    name: "Internal Tools & Operations",
    eyebrow: "Internal Tools",
    tagline: "Admin dashboards and ops workflows for your team.",
    problem:
      "Operations teams stitch together spreadsheets and ad-hoc admin screens to run catalog, pricing, and fulfillment — slow, error-prone, and hard to audit.",
    features: [
      {
        title: "Admin dashboards",
        desc: "Surface catalog, order, and lead metrics in one operational view.",
      },
      {
        title: "Ops workflows",
        desc: "Model approvals and hand-offs as repeatable, trackable workflows.",
      },
      {
        title: "Role-based access",
        desc: "Scope tools and data by team role with audit-friendly permissions.",
      },
      {
        title: "Bulk operations",
        desc: "Edit pricing, status, and attributes across many records at once.",
      },
    ],
    outcomes: [
      "Less manual spreadsheet work for ops",
      "Faster, auditable internal approvals",
      "Fewer errors from bulk, governed edits",
    ],
    templates: ["Ops dashboard", "Approval workflow", "Bulk editor"],
    cta: "Build internal tools",
  },
  {
    slug: "deployment-diagnostics",
    name: "Deployment & Diagnostics",
    eyebrow: "Deployment",
    tagline: "Deploy, map domains, and diagnose issues with confidence.",
    problem:
      "Shipping an app should be the easy part — but unmapped domains, unregistered apps, and cryptic \"App not found\" errors stall launches.",
    features: [
      {
        title: "Deploy",
        desc: "Push builds to production with versioned, repeatable deployments.",
      },
      {
        title: "Register app",
        desc: "Register the app so it resolves and routes correctly on the platform.",
      },
      {
        title: "Map domain",
        desc: "Connect a custom domain and verify DNS and routing end to end.",
      },
      {
        title: "Verify URL",
        desc: "Confirm the live URL responds and serves the intended app.",
      },
      {
        title: "Diagnose \"App not found\"",
        desc: "Walk through registration, routing, and domain checks to resolve errors.",
      },
    ],
    outcomes: [
      "Reliable, repeatable production deploys",
      "Faster resolution of routing and domain issues",
      "Fewer launch-blocking \"App not found\" errors",
    ],
    templates: ["Deploy checklist", "Domain mapping guide", "Diagnostics runbook"],
    cta: "Deploy with confidence",
  },
];

export function getSolution(slug: string): DaisanSolution | undefined {
  return SOLUTIONS.find((solution) => solution.slug === slug);
}
