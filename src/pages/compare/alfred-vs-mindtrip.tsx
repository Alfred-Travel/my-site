import React from 'react';
import Head from 'next/head';

const COMPETITOR = 'Mindtrip';

const COMPARISON_ROWS = [
  { feature: 'Validation Depth', alfred: 'Yes (multi-LLM, route-aware travel logic)', competitor: 'Strong inspiration and map UX, but no visible validation engine' },
  { feature: 'Execution Positioning', alfred: 'Validated itinerary flow and booking-ready planning', competitor: 'Strong collaboration, receipts, collections, and discovery tools' },
  { feature: 'Group Planning', alfred: 'Structured around itinerary execution and shared trip planning', competitor: 'Strong social planning, group chat, and collaborative ideation' },
  { feature: 'Surface Coverage', alfred: 'iOS, Android, and web positioning', competitor: 'Strong web and iPhone experience, but narrower execution messaging' },
];

export default function AlfredVsMindtrip() {
  const title = `Alfred vs ${COMPETITOR}: Which AI Travel Planner Fits Better in 2026?`;
  const conclusion = `${COMPETITOR} has become a stronger discovery and collaboration product, but Alfred still has the clearer position when a traveler needs validated trip structure and execution-ready planning.`;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the main difference between Alfred and Mindtrip?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mindtrip is strongest when a traveler wants collaborative inspiration, collections, and social planning surfaces. Alfred is stronger when the traveler needs itinerary structure, multi-city logic, and booking-ready execution.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which AI travel planner is better for multi-city execution?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Alfred is better positioned for multi-city execution because it emphasizes route-aware trip structure, itinerary validation, and practical planning flow instead of stopping at inspiration.',
        },
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{title} | Alfred Travel</title>
        <meta
          name="description"
          content={`Mindtrip vs Alfred Travel: compare itinerary validation, booking-ready flow, and AI itinerary planner depth. The clearest ${COMPETITOR} alternative when you need structured, editable trips—not only collaborative inspiration.`}
        />
        <meta
          name="keywords"
          content={`Mindtrip vs Alfred Travel, Alfred vs ${COMPETITOR}, ${COMPETITOR} alternative, best AI travel planner, AI itinerary planner, free AI trip planner, travel planning app, trip planner comparison`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', marginBottom: '2rem' }}>
          {title}
        </h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: 'var(--secondary-color)', color: 'white' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Alfred</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>{COMPETITOR}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{row.feature}</td>
                <td style={{ padding: '1rem', color: 'var(--secondary-color)' }}>{row.alfred}</td>
                <td style={{ padding: '1rem' }}>{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          Mindtrip&apos;s current product emphasizes group chat, events, Google Pins, collections, receipts, and creator-style discovery. Alfred should answer that by owning the execution layer: validated trip structure, multi-city sequencing, and booking-ready travel flow.
        </p>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {conclusion}
        </p>

        <section style={{ marginTop: '2rem', lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem' }}>
            Alfred vs Mindtrip for 2026 travel intent
          </h2>
          <p>
            Mindtrip has broadened its product around collaborative planning and
            discovery. That makes it relevant for travelers who want to collect
            ideas, share plans with friends, and keep trip context in one place.
          </p>
          <p>
            Alfred&apos;s stronger lane is different. It should win users who need an
            AI travel planner that does more than inspire. Alfred is more credible
            when the query is about validated itineraries, multi-city flow, hotel
            and flight coordination, and turning a trip idea into something easier
            to execute.
          </p>
        </section>

        <section style={{ marginTop: '2rem', lineHeight: 1.7 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem' }}>
            FAQ
          </h2>
          <p>
            <strong>What is the main difference between Alfred and Mindtrip?</strong><br />
            Mindtrip is strongest for collaborative inspiration and trip idea
            gathering. Alfred is stronger for itinerary structure, route-aware
            planning, and booking-ready execution.
          </p>
          <p>
            <strong>Which AI travel planner is better for multi-city execution?</strong><br />
            Alfred is better positioned for multi-city execution because it
            emphasizes travel logic, sequencing, and usable itinerary flow rather
            than stopping at discovery.
          </p>
        </section>

        <a
          href="https://apps.apple.com/au/app/alfred-travel/id6745240301"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            background: 'var(--secondary-color)',
            color: 'var(--primary-color)',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
            marginTop: '2rem',
          }}
        >
          Download Alfred
        </a>
      </main>
    </>
  );
}
