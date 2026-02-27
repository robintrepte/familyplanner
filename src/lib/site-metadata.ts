/**
 * Centralised site metadata for SEO, Open Graph, and JSON-LD.
 * Set NEXT_PUBLIC_APP_URL in production for correct absolute URLs (e.g. https://your-domain.com).
 */
export const SITE = {
  name: "Family Planner",
  shortDescription: "A simple, beautiful family week planner",
  description:
    "Family Planner is a 7-day week calendar for couples and families. View husband and wife columns side by side, create combined events for family time, and use A/B weeks. Drag-and-drop scheduling, categories, and PWA support. Data stays in your SQLite database.",
  url:
    typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "https://familyplanner.app",
  ogImagePath: "/icons/icon-512.png",
  keywords: [
    "family planner",
    "week planner",
    "family calendar",
    "couples calendar",
    "shared schedule",
    "A/B week",
    "drag and drop calendar",
    "PWA",
    "SQLite",
  ],
  category: "Productivity",
  openGraph: {
    type: "website" as const,
    locale: "en_US",
  },
};

export function getJsonLdWebApplication() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    applicationCategory: SITE.category,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
