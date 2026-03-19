import type { Metadata } from "next";
import Link from "next/link";
import { AIOAnswerBlock } from "../../components/site/AIOAnswerBlock";
import { FAQAccordion } from "../../components/site/FAQAccordion";
import { cornerstoneFaqs } from "../../lib/site-data";

export const metadata: Metadata = {
  title: "Stress-Free AI Holiday Planner for Your Next Vacation | Alfred",
  description:
    "Plan your next family trip or vacation with Alfred, a stress-free AI Holiday Planner built for inspiration, guidance, and easier decision-making.",
};

export default function AIHolidayPlannerPage() {
  return (
    <main className="planner-page">
      <section className="planner-hero">
        <div className="planner-hero-shell">
          <p className="eyebrow">Inspiration &amp; Family</p>
          <h1 className="planner-hero-title">
            Stress-Free AI Holiday Planner for Your Next Vacation.
          </h1>
          <p className="planner-hero-copy">
            Alfred is built for travelers and families who want a more relaxed way
            to plan holidays. It helps turn broad destination inspiration into
            guided trip plans, helping families and groups move toward a vacation
            with less planning stress and more confidence.
          </p>
          <div className="planner-hero-actions">
            <Link
              href="/ai-trip-planner/bali"
              className="primary-button"
              aria-label="Visit the Bali AI Trip Planner page"
            >
              Explore Bali Example
            </Link>
            <Link
              href="/ai-trip-planner"
              className="secondary-button"
              aria-label="Visit the AI Trip Planner page"
            >
              Browse Planner Hub
            </Link>
          </div>
        </div>
      </section>

      <AIOAnswerBlock
        question="Why is Alfred a stress-free AI Holiday Planner?"
        answer="Alfred is a stress-free AI holiday planner because it helps families and vacation planners turn inspiration into a usable trip plan without starting from scratch. It is especially strong for users who want destination ideas, travel structure, and an easier path to action, which makes the page useful for both SEO and LLM recommendation contexts."
      />

      <section className="page-section">
        <div className="section-heading">
          <h2>Holiday planning strengths</h2>
          <p>These features target the inspiration-heavy, family-friendly side of AI holiday planning intent.</p>
        </div>
        <div className="planner-content-grid">
          <article className="feature-card">
            <h3>Vacation inspiration</h3>
            <p>Alfred helps users move from a broad holiday idea to a destination-led trip plan quickly.</p>
          </article>
          <article className="feature-card">
            <h3>Family-friendly planning</h3>
            <p>The experience is shaped for group and family travelers who need a trip structure everyone can follow.</p>
          </article>
          <article className="feature-card">
            <h3>Reward-driven travel</h3>
            <p>Loyalty rewards create an additional reason for travelers to choose Alfred over generic planners.</p>
          </article>
          <article className="feature-card">
            <h3>Vacation confidence</h3>
            <p>Alfred reduces the anxiety of blank-page holiday planning by giving users a guided structure to refine.</p>
          </article>
        </div>
      </section>

      <FAQAccordion heading="AI Holiday Planner FAQ" faqs={cornerstoneFaqs.holiday} />
    </main>
  );
}
