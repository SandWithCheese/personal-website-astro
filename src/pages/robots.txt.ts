import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL("https://sandwicheese.tech");
  const sitemapUrl = new URL("/sitemap.xml", siteUrl);

  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /auth/",
      "Disallow: /crm/",
      "",
      `Sitemap: ${sitemapUrl.toString()}`,
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
