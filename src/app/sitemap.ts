import type { MetadataRoute } from "next";
import { majorCities, siteUrl, slugifyCity } from "../lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const coreRoutes = [
    "",
    "/ai-trip-planner",
    "/ai-travel-planner",
    "/ai-holiday-planner",
    "/vs/alfred-vs-wonderplan-vs-tripadvisor",
  ];

  const coreEntries = coreRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const cityEntries = majorCities.map((city) => ({
    url: `${siteUrl}/ai-trip-planner/${slugifyCity(city)}`,
    lastModified: new Date(),
  }));

  return [...coreEntries, ...cityEntries];
}
