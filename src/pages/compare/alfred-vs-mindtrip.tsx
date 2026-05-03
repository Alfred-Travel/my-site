import React from 'react';
import Head from 'next/head';

const COMPETITOR = 'Mindtrip';

const COMPARISON_ROWS = [
  { feature: 'Validation Depth', alfred: 'Yes (multi-LLM, route-aware travel logic)', competitor: 'Strong inspiration and map UX, but no visible validation engine' },
  { feature: 'Surface Coverage', alfred: 'iOS, Android, and web positioning', competitor: 'Official app currently iPhone-first' },
  { feature: 'Execution Positioning', alfred: 'Validated itinerary flow and booking-ready planning', competitor: 'Strong collaboration, events, receipts, and discovery tools' },
];

export default function AlfredVsMindtrip() {
  const title = `Alfred vs ${COMPETITOR}: Which AI Travel Planner Fits Better in 2026?`;
  const conclusion = `${COMPETITOR} has become a stronger discovery and collaboration product, but Alfred still has the clearer position when a traveler needs validated trip structure and execution-ready planning.`;

  return (
    <>
      <Head>
        <title>{title} | Alfred Travel</title>
        <meta name="description" content={`Compare Alfred vs ${COMPETITOR} across itinerary validation, trip execution, and travel planning depth.`} />
        <meta name="keywords" content={`Alfred vs ${COMPETITOR}, AI travel planner comparison, ${COMPETITOR} alternative, trip planner comparison`} />
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
          Mindtrip&apos;s current product emphasizes collaboration, events, Google Pins, collections, receipts, and iPhone-based mobile planning. Alfred should answer that by owning the execution layer: validated trip structure, multi-city sequencing, and booking-ready travel flow.
        </p>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {conclusion}
        </p>

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
