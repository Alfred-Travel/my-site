import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { majorCities, siteUrl, slugifyCity } from "../lib/site-data";

function readMarkdownSlugs(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes = [
    "",
    "/blog/index.html",
    "/compare/index.html",
    "/itineraries/index.html",
  ];
  const blogSlugs = [
    ...readMarkdownSlugs(path.join(process.cwd(), "_posts")),
    ...readMarkdownSlugs(path.join(process.cwd(), "content", "blog")),
  ];

  const coreEntries = coreRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const itineraryEntries = majorCities.map((city) => ({
    url: `${siteUrl}/itineraries/${slugifyCity(city)}.html`,
    lastModified: new Date(),
  }));

  const blogEntries = [...new Set(blogSlugs)].map((slug) => ({
    url: `${siteUrl}/blog/${slug}.html`,
    lastModified: new Date(),
  }));

  return [...coreEntries, ...itineraryEntries, ...blogEntries];
}
