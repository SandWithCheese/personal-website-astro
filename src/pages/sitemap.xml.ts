import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const staticPages = ["/", "/projects", "/journals"];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getLastmod(date: Date, today: Date) {
  return formatDate(date > today ? today : date);
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://sandwicheese.tech");
  const posts = await getCollection("blog");
  const today = new Date();
  const todayLastmod = formatDate(today);

  const entries = [
    ...staticPages.map((path) => ({
      path,
      lastmod: todayLastmod,
    })),
    ...posts.map((post) => ({
      path: `/journals/${post.id}`,
      lastmod: getLastmod(post.data.pubDate, today),
    })),
  ];

  const urls = entries
    .map(({ path, lastmod }) => {
      const loc = new URL(path, siteUrl).toString();

      return [
        "  <url>",
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls,
      "</urlset>",
      "",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
