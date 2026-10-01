import { Activity, DatabaseZap } from "lucide-react";

const navItems = [
  { label: "Home", href: "#/" },
  { label: "Datasets", href: "#/datasets" },
  { label: "Query Builder", href: "#/query" },
  { label: "Compare", href: "#/compare" },
  { label: "Machine Learning", href: "#/machine-learning" },
  { label: "Docs", href: "#/docs" },
  { label: "Citations", href: "#/citations" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gt-gold/40 bg-white/95 shadow-sm backdrop-blur">
      <div className="h-1 bg-gt-gold" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8" style={{ flexWrap: "wrap", rowGap: "0.75rem" }}>
        <a href="#/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-gt-navy text-gt-gold shadow-[0_10px_30px_rgba(0,48,87,0.22)]">
            <DatabaseZap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-gt-navy">Georgia Tech</span>
            <span className="block text-sm font-semibold tracking-tight text-ink sm:text-base">Turbulence Database</span>
          </span>
        </a>

        <nav className="flex items-center gap-1" style={{ flexWrap: "wrap", rowGap: "0.25rem" }} aria-label="Primary navigation">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-gt-gold/40 hover:bg-cyan-50 hover:text-gt-navy"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-gt-gold/50 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-gt-navy shadow-sm">
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          System Online
        </div>
      </div>
    </header>
  );
}
