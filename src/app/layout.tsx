import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import {
  organizationSchema,
  siteUrl,
  softwareApplicationSchema,
  websiteSchema,
} from "../lib/site-data";

export const metadata: Metadata = {
  title: "Alfred | The World’s Smartest AI Trip Planner & Travel Assistant",
  description:
    "Plan your next adventure in seconds with Alfred, the #1 AI Travel Planner. Generate smart itineraries, book flights/hotels, and earn rewards. Start your AI holiday planning today.",
  keywords: [
    "AI travel planner",
    "AI trip planner",
    "itinerary planner",
    "travel planning app",
    "best AI travel planner",
    "free AI trip planner",
    "Mindtrip alternative",
    "Mindtrip vs Alfred Travel",
    "AI itinerary planner",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Alfred | The World’s Smartest AI Trip Planner & Travel Assistant",
    description:
      "Plan your next adventure in seconds with Alfred, the AI trip planner for validated itineraries, multi-city travel, and booking-ready planning.",
    url: siteUrl,
    siteName: "Alfred Travel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alfred | The World’s Smartest AI Trip Planner & Travel Assistant",
    description:
      "Validated itineraries, multi-city planning, and booking-ready travel execution in one AI travel planner.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/brand/alfred-logo-header.png", type: "image/png" },
    ],
    apple: "/images/brand/alfred-logo-header.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
