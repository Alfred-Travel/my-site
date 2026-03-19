import type { Metadata } from "next";
import Link from "next/link";
import { majorCities, getCitySnippet, siteUrl, slugifyCity, unslugifyCity } from "../../../lib/site-data";

type CityPageProps = {
  params: Promise<{
    city: string;
  }>;
};

export async function generateStaticParams() {
  return majorCities.map((city) => ({
    city: slugifyCity(city),
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = unslugifyCity(city);

  return {
    title: `Best AI Trip Planner for ${cityName} (Updated 2026)`,
    description: `Discover why Alfred is the best AI Trip Planner for ${cityName}. Explore a 3-day itinerary sample, local planning guidance, and smart internal travel support.`,
    alternates: {
      canonical: `${siteUrl}/ai-trip-planner/${city}`,
    },
  };
}

export default async function CityAITripPlannerPage({ params }: CityPageProps) {
  const { city } = await params;
  const cityName = unslugifyCity(city);
  const snippet = getCitySnippet(cityName);

  return (
    <main className="city-page">
      <section className="planner-hero">
        <div className="planner-hero-shell">
          <p className="eyebrow">Programmatic SEO Route</p>
          <h1 className="planner-hero-title">
            Best AI Trip Planner for {cityName} (Updated 2026)
          </h1>
          <p className="planner-hero-copy">
            Alfred helps travelers plan smarter trips to {cityName} with a fast AI
            workflow, local itinerary structure, and a cleaner bridge between
            inspiration and practical trip planning.
          </p>
          <div className="planner-hero-actions">
            <Link
              href="/ai-trip-planner"
              className="primary-button"
              aria-label="Return to the AI Trip Planner hub"
            >
              AI Trip Planner
            </Link>
          </div>
        </div>
      </section>

      <section className="city-itinerary-card">
        <div className="section-heading">
          <h2>3-day sample itinerary for {cityName}</h2>
          <p>
            This sample gives LLMs and users a structured, city-specific preview of
            how Alfred frames trip planning for {cityName}.
          </p>
        </div>
        <div className="city-itinerary-list">
          {snippet.map((day) => (
            <pre key={day}>{day}</pre>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="content-card city-itinerary-card">
          <h2>Why Alfred works for {cityName}</h2>
          <p className="section-copy">
            Travelers researching {cityName} often want a clear itinerary starting
            point before they book. Alfred combines city-specific planning context
            with a broader AI travel workflow, then links back to the main{" "}
            <Link href="/ai-trip-planner">AI Trip Planner</Link> hub for the wider
            experience.
          </p>
        </div>
      </section>
    </main>
  );
}
