import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Timer, ShieldCheck, Droplets, Star } from "lucide-react";

const HERO = "https://images.pexels.com/photos/28995189/pexels-photo-28995189.jpeg";
const BASIC = "https://images.unsplash.com/photo-1772176859958-315908af85a0";
const PREMIUM = "https://images.unsplash.com/photo-1761312834165-c27d037b3a6b";

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] } }),
};

export default function Landing() {
  return (
    <div data-testid="landing-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={HERO} alt="" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-10 items-center">
          <motion.div initial="hidden" animate="show" variants={fade} className="lg:col-span-7">
            <motion.span variants={fade} custom={0} className="chip bg-card/80 backdrop-blur">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" style={{ background: "hsl(var(--success))" }} />
              Open now · walk-ins welcome
            </motion.span>

            <motion.h1 variants={fade} custom={1} className="mt-6 font-display font-black tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
              A spotless wash.<br />
              <span className="gradient-text">Every single time.</span>
            </motion.h1>

            <motion.p variants={fade} custom={2} className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Register your vehicle, pick a wash, pay by cash or Paytm — grab your token and relax. Anjana Wash handles the rest.
            </motion.p>

            <motion.div variants={fade} custom={3} className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/register"
                data-testid="cta-register"
                className="group inline-flex items-center gap-2 bg-primary text-primary-foreground pl-6 pr-5 h-13 py-4 rounded-full font-display font-bold brand-glow elev-lift"
              >
                Register Vehicle
                <span className="h-7 w-7 grid place-items-center rounded-full bg-primary-foreground/15 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
              <Link
                to="/worker"
                data-testid="cta-staff"
                className="inline-flex items-center gap-2 bg-card border border-border px-6 py-4 rounded-full font-display font-bold elev-2 hover:elev-3 transition-all"
              >
                Staff Entry
              </Link>
            </motion.div>

            <motion.div variants={fade} custom={4} className="mt-10 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" strokeWidth={0} />)}
                <span className="font-semibold ml-1">4.9</span>
                <span className="text-muted-foreground">· 1.2k washes</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">Avg 18 min</span> per wash
              </div>
            </motion.div>
          </motion.div>

          {/* Showcase card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-accent/30 rounded-[28px] blur-2xl -z-10" />
              <div className="bg-card border border-border rounded-[20px] overflow-hidden elev-3">
                <div className="relative h-56 overflow-hidden">
                  <img src={PREMIUM} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 chip bg-background/90">
                    <Droplets className="h-3 w-3 text-primary" strokeWidth={2.5} /> Now Showing
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
                    <div>
                      <div className="label-caps text-[9px] text-white/90">Today's Hero</div>
                      <div className="font-display font-black text-white text-2xl tracking-tight drop-shadow">Premium Foam Bath</div>
                    </div>
                    <div className="font-display font-black text-white text-3xl tracking-tighter drop-shadow">₹300</div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3 text-center">
                  <Mini label="Today" value="24" sub="washes" />
                  <Mini label="Avg" value="17m" sub="per car" accent />
                  <Mini label="Queue" value="3" sub="waiting" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature row */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="label-caps">Why Anjana</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mt-1">Simple, transparent, fast.</h2>
          </div>
          <Link to="/register" className="text-sm font-semibold text-primary hover:underline">Book now →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, t: "Three Wash Tiers", d: "Basic, Premium, and Full Detailing — priced transparently." },
            { icon: Timer, t: "Instant Tokens", d: "Skip the chaos. A simple daily token tracks your vehicle." },
            { icon: ShieldCheck, t: "Cash or Paytm", d: "Pay however you like. UPI powered by Paytm." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              data-testid={`feature-${i}`}
              className="bg-card border border-border rounded-[18px] p-6 elev-2 elev-lift"
            >
              <div className="h-11 w-11 rounded-[12px] bg-primary/10 text-primary grid place-items-center">
                <f.icon className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <h3 className="font-display font-bold text-xl mt-4">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="label-caps">Menu</div>
        <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight mt-1">Pick your wash</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { id: "basic", name: "Basic Wash", price: 150, img: BASIC, desc: "Exterior foam wash + tyre shine." },
            { id: "premium", name: "Premium Wash", price: 300, img: PREMIUM, desc: "Exterior + interior vacuum + dashboard polish.", hot: true },
            { id: "detailing", name: "Full Detailing", price: 600, img: HERO, desc: "Full detailing + wax + interior deep clean." },
          ].map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-[18px] border border-border bg-card elev-2 elev-lift"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={s.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {s.hot && <span className="absolute top-3 right-3 chip bg-accent text-accent-foreground border-transparent">Popular</span>}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-5 flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-xl">{s.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                </div>
                <div className="font-display font-black text-3xl tracking-tighter">₹{s.price}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-16">
          <div className="relative rounded-[24px] bg-secondary text-secondary-foreground p-8 sm:p-12 overflow-hidden noise">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-end">
              <div>
                <div className="label-caps text-accent">Ready when you are</div>
                <div className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-2 max-w-2xl">
                  Drive in. Register. We'll make it shine.
                </div>
              </div>
              <Link
                to="/register"
                data-testid="cta-bottom"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-4 rounded-full font-display font-bold accent-glow whitespace-nowrap"
              >
                Start Booking <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value, sub, accent }) {
  return (
    <div className={`rounded-[12px] p-3 border ${accent ? "bg-accent/10 border-accent/30" : "bg-muted/60 border-border"}`}>
      <div className="label-caps text-[9px]">{label}</div>
      <div className="font-display font-black text-xl mt-0.5 tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
