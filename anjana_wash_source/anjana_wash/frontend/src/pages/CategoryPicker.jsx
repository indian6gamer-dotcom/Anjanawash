import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import * as Lc from "lucide-react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import Stepper from "@/components/Stepper";

const ICONS = {
  Car: Lc.Car,
  Bike: Lc.Bike,
  Truck: Lc.Truck,
  Bus: Lc.Bus,
  Tractor: Lc.Tractor || Lc.Truck,
  Construction: Lc.Construction || Lc.HardHat || Lc.Wrench,
};

export default function CategoryPicker() {
  const nav = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null); // top-level object
  const [sub, setSub] = useState(null); // sub object (for Car)

  useEffect(() => {
    if (!sessionStorage.getItem("anjana_details") || !sessionStorage.getItem("anjana_photo")) {
      nav("/register");
      return;
    }
    api.get("/categories").then((r) => setCategories(r.data));
  }, [nav]);

  const pick = (c) => {
    if (c.children?.length) {
      setSelected(c);
      setSub(null);
    } else {
      setSelected(c);
      setSub(null);
    }
  };

  const next = () => {
    const leaf = selected?.children?.length ? sub : selected;
    if (!leaf) { toast.error("Select a vehicle type"); return; }
    sessionStorage.setItem("anjana_category", JSON.stringify({
      id: leaf.id,
      label: leaf.label,
      parent_id: selected?.children?.length ? selected.id : null,
      parent_label: selected?.children?.length ? selected.label : null,
    }));
    nav("/service");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10" data-testid="category-page">
      <Stepper step={3} />
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-4">Pick your vehicle</h1>
      <p className="text-muted-foreground mt-2">Choose the category that fits your vehicle.</p>

      <AnimatePresence mode="wait">
        {!(selected?.children?.length && selected) && (
          <motion.div key="top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c, i) => {
              const Icon = ICONS[c.icon] || Lc.Car;
              const active = selected?.id === c.id;
              return (
                <motion.button
                  key={c.id}
                  onClick={() => pick(c)}
                  data-testid={`category-${c.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.35 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative aspect-[5/4] bg-card rounded-[18px] border p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    active ? "border-primary ring-4 ring-primary/15 elev-3" : "border-border elev-2 hover:border-foreground/20"
                  }`}
                >
                  <div className={`h-11 w-11 rounded-[12px] grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="font-display font-bold text-center">{c.label}</div>
                  {c.children?.length > 0 && <span className="chip bg-accent/15 border-accent/30 text-accent-foreground text-[9px]">3 types</span>}
                  {active && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {selected?.children?.length > 0 && (
          <motion.div key="sub" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mt-6">
            <button onClick={() => setSelected(null)} data-testid="back-to-categories" className="chip bg-card border-border mb-3">
              <ArrowLeft className="h-3 w-3" strokeWidth={2.5} /> Back · {selected.label}
            </button>
            <div className="label-caps mb-2">Select {selected.label} type</div>
            <div className="grid sm:grid-cols-3 gap-3">
              {selected.children.map((ch, i) => {
                const Icon = ICONS[ch.icon] || Lc.Car;
                const active = sub?.id === ch.id;
                return (
                  <motion.button
                    key={ch.id}
                    data-testid={`subcategory-${ch.id}`}
                    onClick={() => setSub(ch)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative bg-card rounded-[18px] border p-5 text-left transition-all ${
                      active ? "border-primary ring-4 ring-primary/15 elev-3" : "border-border elev-2 hover:border-foreground/20"
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-[12px] grid place-items-center ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div className="font-display font-bold text-lg mt-3">{ch.label}</div>
                    {active && (
                      <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={next}
        disabled={!selected || (selected.children?.length && !sub)}
        data-testid="category-continue"
        className="group mt-8 w-full h-14 bg-primary text-primary-foreground font-display font-bold text-lg rounded-full brand-glow elev-lift flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Continue to Service
        <span className="h-7 w-7 grid place-items-center rounded-full bg-primary-foreground/15 group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
