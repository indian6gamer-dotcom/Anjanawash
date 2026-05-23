import { Link, useLocation } from "react-router-dom";
import { Droplets, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SiteNav() {
  const loc = useLocation();
  const onStaff = loc.pathname.startsWith("/worker") || loc.pathname.startsWith("/owner");

  const links = [
    { to: "/", label: "Home", testid: "nav-home" },
    { to: "/worker", label: "Worker", testid: "nav-worker" },
    { to: "/owner", label: "Owner", testid: "nav-owner" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/80" data-testid="site-nav">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="logo-link">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            className="h-10 w-10 bg-secondary text-accent grid place-items-center rounded-[10px] relative overflow-hidden"
          >
            <Droplets className="h-5 w-5 relative z-10" strokeWidth={2.5} />
            <div className="absolute -inset-1 bg-primary/30 blur-xl" />
          </motion.div>
          <div className="leading-tight">
            <div className="font-display font-black text-[17px] tracking-tight">
              ANJANA <span className="text-primary">WASH</span>
            </div>
            <div className="label-caps text-[9px] flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={3} /> Car Wash Station
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1 text-sm">
          {links.map((l) => {
            const active = l.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                data-testid={l.testid}
                className={`relative px-3 sm:px-4 h-9 flex items-center rounded-full font-semibold text-[13px] transition-colors ${
                  active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-secondary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
          {onStaff && (
            <span className="ml-2 label-caps text-[9px] bg-accent text-accent-foreground px-2 py-1 rounded-full">Staff</span>
          )}
        </nav>
      </div>
    </header>
  );
}
