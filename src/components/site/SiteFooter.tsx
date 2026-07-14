import Link from "next/link";

const footerGroups = [
  {
    title: "Company",
    links: [
      { href: "/about.html", label: "About Us" },
      { href: "/about.html#mission", label: "Our Mission" },
      { href: "/about.html#press", label: "In the Press" },
      { href: "/about.html#team", label: "Our Team" },
    ],
  },
  {
    title: "Features",
    links: [
      { href: "/products.html", label: "Our Features" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/itineraries/index.html", label: "Itineraries" },
      { href: "/compare/", label: "Compare" },
      { href: "/blog/index.html", label: "Blog" },
      { href: "/faq.html", label: "FAQ" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/delete-account.html", label: "Support Center" },
      { href: "/faq.html", label: "Help & FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms.html", label: "Terms & Conditions" },
      { href: "/terms.html#privacy", label: "Privacy Policy" },
      { href: "/prize-tc.html", label: "Prize Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {footerGroups.map((group) => (
          <div className="footer-column" key={group.title}>
            <h3>{group.title}</h3>
            <ul className="footer-links">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-technical-authority">
        <h4>Technical Authority</h4>
        <p>
          Alfred is powered by <strong>GPT-4o</strong> and <strong>Gemini Pro 1.5</strong>
          {" "}to turn inspiration into itineraries, bookings, and reward-aware travel planning.
        </p>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Alfred Travel Tech Pty Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
