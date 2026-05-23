import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Check, ArrowRight, Droplets, Sparkles, Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Stepper from "@/components/Stepper";

const RANK_ICON = [Droplets, Sparkles, Star];

export default function SelectService() {
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const category = JSON.parse(sessionStorage.getItem("anjana_category") || "null");

  useEffect(() => {
    if (!sessionStorage.getItem("anjana_details") || !sessionStorage.getItem("anjana_photo") || !category) {
      nav("/register");
      return;
    }
    api.get(`/services/by-category/${category.id}`).then((r) => {
      setServices(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
    // eslint-disable-next-line
  }, [nav]);

  const next = () => {
    if (!selected) { toast.error("Select a service"); return; }
    sessionStorage.setItem("anjana_service_id", selected);
    nav("/payment");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10" data-testid="service-page">
      <Stepper step={4} />
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button onClick={() => nav("/category")} data-testid="back-to-category" className="chip bg-card">
          <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Change vehicle
        </button>
        {category && (
          <span className="chip bg-primary/10 text-primary border-primary/20">
            {category.parent_label ? `${category.parent_label} · ${category.label}` : category.label}
          </span>
        )}
      </div>
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-3">Choose your wash</h1>
      <p className="text-muted-foreground mt-2">Services and prices are tuned for your vehicle type.</p>

      {loading && <div className="mt-8 text-muted-foreground">Loading services…</div>}

      {!loading && services.length === 0 && (
        <div className="mt-8 bg-card border border-dashed border-border rounded-[18px] p-10 text-center">
          <div className="font-display font-bold">No services configured yet</div>
          <div className="text-sm text-muted-foreground mt-1">Ask the owner to add services for this vehicle type.</div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {services.map((s, i) => {
          const Icon = RANK_ICON[i] || Droplets;
          const active = selected === s.id;
          return (
            <motion.button
              key={s.id}
              data-testid={`service-${i}`}
              onClick={() => setSelected(s.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className={`relative text-left p-5 bg-card rounded-[18px] border transition-all flex items-center gap-5 w-full ${
                active ? "border-primary ring-4 ring-primary/15 elev-3" : "border-border elev-2 hover:border-foreground/20"
              }`}
            >
              <div className={`h-14 w-14 rounded-[14px] grid place-items-center flex-shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-black text-xl sm:text-2xl tracking-tight">{s.name}</div>
                {s.description && <div className="text-sm text-muted-foreground mt-0.5">{s.description}</div>}
              </div>
              <div className="text-right">
                <div className="label-caps text-[9px]">From</div>
                <div className="font-display font-black text-3xl tracking-tighter leading-none">₹{s.price}</div>
              </div>
              {active && (
                <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center elev-2">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={next}
        data-testid="service-continue"
        disabled={!selected}
        className="group mt-8 w-full h-14 bg-primary text-primary-foreground font-display font-bold text-lg rounded-full brand-glow elev-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:elev-2"
      >
        Continue to Payment
        <span className="h-7 w-7 grid place-items-center rounded-full bg-primary-foreground/15 group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
