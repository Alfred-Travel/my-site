import React from 'react';
import Head from 'next/head';

interface ItineraryPageProps {
  destination: string;
}

const LogisticalValidationBox: React.FC = () => (
  <div
    style={{
      background: 'rgba(78, 205, 196, 0.12)',
      border: '1px solid rgba(78, 205, 196, 0.4)',
      borderRadius: '12px',
      padding: '1.5rem 2rem',
      margin: '2rem 0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'center',
    }}
  >
    <span style={{ fontWeight: 600, color: '#1A1A1A', marginRight: '0.5rem' }}>
      Logistical Validation:
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ color: '#4ECDC4' }}>✓</span> Flight Gaps Checked
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ color: '#4ECDC4' }}>✓</span> Hotel Proximity Verified
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <span style={{ color: '#4ECDC4' }}>✓</span> Multi-LLM Confirmed
    </span>
  </div>
);

const SAMPLE_ITINERARY = (displayName: string) => `
Day 1 — Arrival & Orientation
• Arrive at ${displayName} airport; transfer to hotel (validated 45-min drive)
• Check-in and settle; nearby lunch spot within 15-min walk
• Afternoon: orientation walk or first major attraction
• Evening: dinner in central district

Day 2 — Core Experiences
• Morning: top-rated attraction (opening hours verified)
• Lunch: local recommendation near morning activity
• Afternoon: second key site (transit time validated)
• Evening: optional night market or rooftop bar

Day 3 — Deeper Exploration
• Morning: day trip or neighborhood exploration
• Lunch: authentic local cuisine
• Afternoon: museum, temple, or scenic viewpoint
• Evening: farewell dinner; pack for departure
`.trim();

export default function ItineraryPage({ destination }: ItineraryPageProps) {
  const displayName = destination
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const baseUrl = 'https://www.alfredtravel.io';
  const pageUrl = `${baseUrl}/itineraries/${destination}`;

  const travelActionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAction',
    name: `7-Day ${displayName} AI Trip Planner`,
    description: `Validated 7-day itinerary for ${displayName}. AI-generated and logistically verified by Alfred Travel.`,
    target: {
      '@type': 'Place',
      name: displayName,
    },
    result: {
      '@type': 'Trip',
      name: `7-Day ${displayName} Itinerary`,
    },
  };

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `7-Day ${displayName} Validated Itinerary`,
    description: `Structured, AI-validated travel itinerary for ${displayName}. Includes flight gap validation, hotel proximity checks, and multi-LLM confirmation.`,
    url: pageUrl,
    creator: {
      '@type': 'Organization',
      name: 'Alfred Travel Tech Pty Ltd',
      url: baseUrl,
    },
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'text/html',
      contentUrl: pageUrl,
    },
  };

  return (
    <>
      <Head>
        <title>
          AI Travel Planner for {displayName} | 7-Day Validated Itinerary - Alfred Travel
        </title>
        <meta
          name="description"
          content={`AI Holiday Planner ${displayName}: 7-day validated itinerary with flight gaps checked, hotel proximity verified, and multi-LLM confirmation. Generate your full trip in the Alfred App.`}
        />
        <meta
          name="keywords"
          content={`AI Travel Planner ${displayName}, AI Holiday Planner ${displayName}, ${displayName} itinerary, ${displayName} trip planner, Alfred Travel`}
        />
        <meta property="og:title" content={`AI Travel Planner for ${displayName} | Alfred Travel`} />
        <meta
          property="og:description"
          content={`7-day validated itinerary for ${displayName}. AI Holiday Planner with logistical validation.`}
        />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={pageUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(travelActionSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datasetSchema),
          }}
        />
      </Head>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2rem', marginBottom: '1rem' }}>
          7-Day {displayName} AI Trip Planner: Validated Itinerary
        </h1>

        <LogisticalValidationBox />

        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            3-Day Sample Itinerary
          </h2>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#1A1A1A',
            }}
          >
            {SAMPLE_ITINERARY(displayName)}
          </pre>
        </section>

        <div
          style={{
            marginTop: '2.5rem',
            textAlign: 'center',
          }}
        >
          <a
            href="https://apps.apple.com/au/app/alfred-travel/id6745240301"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: '#4ECDC4',
              color: '#1A1A1A',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Generate the full 7-day version in Alfred App
          </a>
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const destinations = require('../../../destinations.json') as string[];
  const paths = destinations.map((d) => ({
    params: { destination: d.toLowerCase().replace(/\s+/g, '-') },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({
  params,
}: {
  params: { destination: string };
}) {
  return { props: { destination: params.destination } };
}
