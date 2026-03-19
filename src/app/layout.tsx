import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "../components/site/SiteHeader";
import { SiteFooter } from "../components/site/SiteFooter";
import { softwareApplicationSchema } from "../lib/site-data";

export const metadata: Metadata = {
  title: "Alfred | The World’s Smartest AI Trip Planner & Travel Assistant",
  description:
    "Plan your next adventure in seconds with Alfred, the #1 AI Travel Planner. Generate smart itineraries, book flights/hotels, and earn rewards. Start your AI holiday planning today.",
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
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
