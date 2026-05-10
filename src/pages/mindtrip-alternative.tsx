import React from "react";
import Head from "next/head";
import Link from "next/link";

const PAGE_TITLE =
  "Alfred Travel: A Practical Mindtrip Alternative for AI Itinerary Planning";

const COMPARISON_ROWS = [
  {
    feature: "AI itinerary generation",
    alfred:
      "Yes—built around structured, editable itineraries and practical pacing",
    mindtrip:
      "Strong AI-assisted discovery and collaborative trip-building experiences",
  },
  {
    feature: "Structured day-by-day planning",
    alfred: "Core focus—clear daily sequencing and logistics-aware flow",
    mindtrip:
      "Solid trip organisation with emphasis on shared planning and discovery surfaces",
  },
  {
    feature: "Editable itinerary flow",
    alfred: "Designed so plans behave like living documents you can revise quickly",
    mindtrip:
      "Flexible for groups collecting ideas; emphasis varies toward collaboration features",
  },
  {
    feature: "Mobile-first trip use",
    alfred: "iOS, Android, and web for on-trip iteration",
    mindtrip: "Strong mobile and web experiences for travellers who prefer maps-first UX",
  },
  {
    feature: "Traveller-first booking intent layer",
    alfred:
      "Connects itinerary clarity with booking-ready intent and partner-aligned flows",
    mindtrip:
      "Offers booking-adjacent discovery; positioning often highlights social and creator-style planning",
  },
  {
    feature: "Designed for itinerary sharing",
    alfred: "Share structured itineraries so companions see the same plan",
    mindtrip:
      "Strong collaboration, collections, and social trip surfaces for shared ideation",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is Alfred the same category of product as Mindtrip?",
    a: "Both sit in AI travel planning, but they stress different moments. Mindtrip is widely associated with collaborative discovery and shared trip context. Alfred stresses structured itineraries, editable execution flow, and booking intent—use the comparison table above to match your priority.",
  },
  {
    q: "Why look for a Mindtrip alternative?",
    a: "Travellers often shop alternatives when they want clearer day-by-day structure, less fragmentation between inspiration and execution, or a workflow tuned to editing a single itinerary as dates change.",
  },
  {
    q: "Does Alfred replace OTAs or booking sites?",
    a: "No. Alfred helps you clarify intent and itinerary shape first; when you are ready, you can move toward booking through partner flows from alfredtravel.io.",
  },
];

export default function MindtripAlternativePage() {
  const metaDescription =
    "Looking for a Mindtrip alternative? Alfred Travel helps travellers turn trip ideas into structured, editable itineraries for real holidays.";
  const keywords =
    "Mindtrip alternative, Mindtrip vs Alfred Travel, best AI travel planner, AI itinerary planner, free AI trip planner, travel planning app, AI travel planner, AI trip planner, itinerary planner";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: PAGE_TITLE,
    description: metaDescription,
    url: "https://www.alfredtravel.io/mindtrip-alternative",
    isPartOf: {
      "@type": "WebSite",
      name: "Alfred Travel",
      url: "https://www.alfredtravel.io",
    },
  };

  return (
    <>
      <Head>
        <title>{PAGE_TITLE} | Alfred Travel</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <link
          rel="canonical"
          href="https://www.alfredtravel.io/mindtrip-alternative"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
        />
      </Head>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          {PAGE_TITLE}
        </h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          If you are comparing{" "}
          <strong>AI travel planner</strong> and <strong>AI trip planner</strong>{" "}
          options, start with what you need on the trip: collaborative discovery,
          or structured, editable itineraries you can actually follow. Alfred Travel
          is built for the second lane—without pretending every traveller has the
          same priority.
        </p>
        <p style={{ fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          Read the deeper feature contrast on{" "}
          <Link href="/compare/alfred-vs-mindtrip">Alfred vs Mindtrip</Link>, see
          today&apos;s distribution angle on{" "}
          <a href="/blog/expedia-b2b-ai-travel-planning-alfred-travel.html">
            Expedia B2B growth and the intent layer
          </a>
          , and browse a worked destination example on the{" "}
          <a href="/itineraries/paris.html">Paris itinerary</a>
          .
        </p>

        <section style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            Why Travellers Look for a Mindtrip Alternative
          </h2>
          <p>
            Many travellers love map-first ideation and shared trip threads. Others
            hit a wall when inspiration does not convert into <strong>order</strong>—days,
            distances, opening hours, and what happens when one flight moves.
            Searching for a <strong>Mindtrip alternative</strong> often means you
            want an <strong>itinerary planner</strong> that keeps one editable
            backbone as booking surfaces multiply.
          </p>
        </section>

        <section style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            Alfred Travel&apos;s Difference
          </h2>
          <p>
            Alfred is an AI-powered <strong>travel planning app</strong> focused on
            turning trip intent into structured plans—so you can revise quickly,
            share clearly, and move toward booking when constraints are real. It is
            a practical answer for people who describe themselves as looking for a{" "}
            <strong>free AI trip planner</strong> entry point with room to grow
            into fuller execution.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            Alfred Travel vs Mindtrip
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: "1rem" }}>
            Use this as orientation, not a scorecard—products evolve. We describe
            Mindtrip cautiously based on its public positioning around collaborative
            planning and discovery.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1rem" }}>
            <thead>
              <tr style={{ background: "var(--secondary-color)", color: "white" }}>
                <th style={{ padding: "1rem", textAlign: "left" }}>Feature</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Alfred Travel</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Mindtrip</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: "1rem", color: "var(--secondary-color)" }}>
                    {row.alfred}
                  </td>
                  <td style={{ padding: "1rem" }}>{row.mindtrip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            Who Should Use Alfred Travel?
          </h2>
          <p>
            Alfred fits travellers who want <strong>best AI travel planner</strong>{" "}
            outcomes on execution—multi-day structure, fewer contradictions, and a
            clearer path from plan to booking. If your primary joy is social
            brainstorming with lightweight lists, other tools may feel more natural.
          </p>
        </section>

        <section style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            Try Alfred Travel
          </h2>
          <p>
            Start at{" "}
            <a href="https://www.alfredtravel.io">https://www.alfredtravel.io</a>{" "}
            to turn your next trip idea into a structured itinerary you can edit.
            Return to the{" "}
            <Link href="/">homepage</Link>, explore{" "}
            <a href="/itineraries/index.html">itinerary guides</a>, or read the{" "}
            <a href="/blog/index.html">blog index</a> for more planning notes.
          </p>
        </section>

        <section style={{ marginTop: "2rem", lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem" }}>
            FAQ
          </h2>
          {FAQ_ITEMS.map((item) => (
            <p key={item.q} style={{ marginBottom: "1.25rem" }}>
              <strong>{item.q}</strong>
              <br />
              {item.a}
            </p>
          ))}
        </section>

        <a
          href="https://www.alfredtravel.io"
          style={{
            display: "inline-block",
            background: "var(--secondary-color)",
            color: "var(--primary-color)",
            padding: "1rem 2rem",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            marginTop: "1rem",
          }}
        >
          Open Alfred Travel
        </a>
      </main>
    </>
  );
}
