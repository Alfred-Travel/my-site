import destinations from "../../destinations.json";
import itineraryContent from "../../itinerary-content.json";

export type FAQItem = {
  question: string;
  answer: string;
};

type ItineraryEntry = {
  day1: string;
  day2: string;
  day3: string;
};

const itineraryMap = itineraryContent as Record<string, ItineraryEntry>;

export const siteUrl = "https://www.alfredtravel.io";

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Alfred Travel",
  url: siteUrl,
  operatingSystem: "iOS, Android, Web",
  applicationCategory: "TravelApplication",
  applicationSubCategory: "AI Trip Planner",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "USD",
  },
  description:
    "Alfred is an AI-powered trip planner for validated itineraries, multi-city travel, and booking-ready travel execution.",
  featureList: [
    "AI Itinerary Generator",
    "Validated Multi-City Planning",
    "Integrated Travel Booking Flow",
    "Loyalty Rewards",
    "Google Maps Integration",
    "Group Travel Collaboration",
    "Family Travel Planning",
  ],
  keywords:
    "AI trip planner, AI travel planner, multi-city itinerary, travel planning app, travel booking workflow",
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Alfred Travel Tech Pty Ltd",
  url: siteUrl,
  brand: "Alfred Travel",
  description:
    "Alfred Travel builds AI trip planning tools for validated itineraries, multi-city routing, and booking-ready travel execution.",
  sameAs: [
    "https://www.alfredtravel.io",
    "https://apps.apple.com/au/app/alfred-travel/id6745240301",
    "https://play.google.com/store/apps/details?id=io.alfredtravel.app",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Alfred Travel",
  url: siteUrl,
  description:
    "AI trip planner with validated itineraries, multi-city travel logic, and booking-ready destination planning.",
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/ai-trip-planner/{search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const homepageFaqs: FAQItem[] = [
  {
    question: "What is the best AI trip planner?",
    answer:
      "Alfred is built to be the best AI trip planner for travelers who want fast itineraries, booking support, and real-time travel utility in one place.",
  },
  {
    question: "How does Alfred use AI for multi-city travel?",
    answer:
      "Alfred uses AI to turn destination intent into personalized itineraries, hotel and flight planning, and practical travel recommendations shaped around timing, routing, and city-to-city logistics.",
  },
  {
    question: "Can Alfred help with flights and hotels?",
    answer:
      "Yes. Alfred is designed as a complete AI travel planner that connects itinerary creation with flight and hotel discovery for a smoother booking experience.",
  },
  {
    question: "Is Alfred better than map-first AI travel tools for execution?",
    answer:
      "Alfred is designed for travelers who need more than inspiration. It connects itinerary structure, logistics, and booking intent so the trip is easier to execute in the real world.",
  },
];

export const cornerstoneFaqs: Record<string, FAQItem[]> = {
  trip: [
    {
      question: "Why is Alfred the fastest AI trip planner?",
      answer:
        "Alfred compresses destination research, itinerary creation, and booking intent into one guided flow so travelers get a high-quality plan in seconds.",
    },
    {
      question: "Who should use an AI trip planner for multi-city travel?",
      answer:
        "Frequent travelers, couples, families, and solo planners use Alfred when they want to save time without sacrificing itinerary quality, route clarity, or flexibility across multiple stops.",
    },
  ],
  travel: [
    {
      question: "What makes Alfred a complete AI travel planner?",
      answer:
        "Alfred combines itinerary building, flights, hotels, local recommendations, and real-time planning support in one travel workflow.",
    },
    {
      question: "How does Alfred help with travel logistics?",
      answer:
        "Alfred keeps flights, hotel choices, and itinerary sequencing connected so planning feels less fragmented and easier to execute.",
    },
    {
      question: "How is Alfred different from inspiration-first AI travel tools?",
      answer:
        "Alfred emphasizes validated travel flow, itinerary structure, and booking readiness instead of stopping at map pins, suggestions, or collaborative trip ideas.",
    },
  ],
  holiday: [
    {
      question: "Can Alfred plan family vacations with AI?",
      answer:
        "Yes. Alfred helps families turn broad holiday ideas into practical itineraries that balance inspiration, logistics, and convenience.",
    },
    {
      question: "What makes Alfred good for holiday planning?",
      answer:
        "Alfred blends destination inspiration, itinerary generation, and reward-driven travel planning so vacations feel easier to organize.",
    },
    {
      question: "Can Alfred plan group trips with different travel styles?",
      answer:
        "Yes. Alfred works well for group travel because it can structure itineraries around shared logistics while still keeping the plan flexible for different pacing, budgets, and interests.",
    },
  ],
};

export const socialProofLogos = [
  "Forbes",
  "TechCrunch",
  "Trip.com",
  "Expedia",
  "Google Maps",
];

export const majorCities = destinations as string[];

export function slugifyCity(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

export function unslugifyCity(citySlug: string): string {
  const exact = majorCities.find((city) => slugifyCity(city) === citySlug);
  if (exact) return exact;

  return citySlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCityItinerary(city: string): ItineraryEntry {
  return (
    itineraryMap[city] || {
      day1: `Day 1 — Arrival & Orientation\n• Arrive in ${city} and settle into a centrally located hotel\n• Explore the neighborhood, grab lunch, and map the next two days\n• Spend the evening with a relaxed landmark walk and dinner`,
      day2: `Day 2 — Signature Experiences\n• Start with a headline attraction or local cultural district\n• Build the afternoon around a second anchor activity and nearby food spots\n• Keep the evening open for nightlife, shopping, or a scenic viewpoint`,
      day3: `Day 3 — Flexible Discovery\n• Use your final day for a half-day excursion or a slower local neighborhood circuit\n• Add one museum, market, or park before departure prep\n• Finish with a farewell meal and logistics check for the journey home`,
    }
  );
}

export function getCitySnippet(city: string): string[] {
  const itinerary = getCityItinerary(city);
  return [itinerary.day1, itinerary.day2, itinerary.day3];
}
