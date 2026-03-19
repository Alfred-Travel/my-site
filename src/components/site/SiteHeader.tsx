import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about.html", label: "About Us" },
  { href: "/products.html", label: "Our Features" },
  { href: "/blog/index.html", label: "Blog" },
  { href: "/faq.html", label: "FAQ" },
  { href: "/faq.html#tutorials", label: "Tutorials" },
  { href: "/delete-account.html", label: "Support" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link href="/" className="brand-mark" aria-label="Go to Alfred homepage">
          Alfred
        </Link>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
        <Link
          href="/#faq"
          className="download-cta"
          aria-label="Explore Alfred AI trip planner"
        >
          Explore Alfred
        </Link>
      </nav>
    </header>
  );
}
