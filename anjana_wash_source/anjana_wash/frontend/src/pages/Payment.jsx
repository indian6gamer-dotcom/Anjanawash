import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Banknote, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import Stepper from "@/components/Stepper";

// Crisp Paytm SVG Logo inside deep blue rect matching the brand
const PaytmLogo = () => (
  <svg viewBox="0 0 100 32" className="h-7 w-20" aria-hidden="true" style={{ display: "block" }}>
    <rect width="100" height="32" rx="6" fill="#002970" />
    <text x="50%" y="21" dominantBaseline="middle" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="'Outfit', sans-serif">
      <tspan fill="#ffffff">Pay</tspan>
      <tspan fill="#00baf2">tm</tspan>
    </text>
  </svg>
);

export default function Payment() {
  const nav = useNavigate();
  const [choice, setChoice] = useState(null); // "cash" | "paytm"
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  const [details] = useState(() => JSON.parse(sessionStorage.getItem("anjana_details") || "null"));
  const [photo] = useState(() => sessionStorage.getItem("anjana_photo") || "");
  const [category] = useState(() => JSON.parse(sessionStorage.getItem("anjana_category") || "null"));
  const [serviceId] = useState(() => sessionStorage.getItem("anjana_service_id"));
  const [service, setService] = useState(null);

  useEffect(() => {
    if (submittedRef.current) return;
    if (!details || !photo || !category || !serviceId) { nav("/register"); return; }
    api.get(`/services/by-category/${category.id}`).then((r) => {
      const s = r.data.find((x) => x.id === serviceId);
      if (!s) { nav("/service"); return; }
      setService(s);
    });
  }, [nav, details, photo, category, serviceId]);

  const svc = service;

  const proceed = async () => {
    if (!choice) { toast.error("Choose a payment method"); return; }
    setLoading(true);
    try {
      const payment_method = choice === "cash" ? "cash" : "online";
      const payment_provider = choice === "cash" ? null : choice;
      const { data: booking } = await api.post("/bookings", {
        customer_name: details.customer_name,
        phone: details.phone,
        vehicle_number: details.vehicle_number,
        vehicle_photo: photo,
        category_id: category.id,
        service_id: serviceId,
        payment_method,
        payment_provider,
      });
      submittedRef.current = true;
      sessionStorage.removeItem("anjana_details");
      sessionStorage.removeItem("anjana_photo");
      sessionStorage.removeItem("anjana_category");
      sessionStorage.removeItem("anjana_service_id");
      if (choice === "cash") {
        nav(`/token/${booking.id}`);
      } else {
        const { data: init } = await api.post("/payment/paytm/initiate", { booking_id: booking.id });
        nav(init.checkout_url);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create booking");
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-10" data-testid="payment-page">
      <Stepper step={5} />
      <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-4">Payment method</h1>

      {svc && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 relative overflow-hidden rounded-[18px] bg-secondary text-secondary-foreground p-6 elev-3 noise">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="label-caps text-accent">Total</div>
              <div className="font-display font-bold text-lg">{svc.name}</div>
              <div className="text-xs opacity-75">
                {category?.parent_label ? `${category.parent_label} · ${category.label}` : category?.label}
                {svc.description ? ` · ${svc.description}` : ""}
              </div>
            </div>
            <div className="font-display font-black text-5xl tracking-tighter">₹{svc.price}</div>
          </div>
        </motion.div>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <div className="label-caps mb-2">Pay at the counter</div>
          <PayOption
            testid="pay-cash"
            active={choice === "cash"}
            onClick={() => setChoice("cash")}
            iconEl={<Banknote className="h-5 w-5" strokeWidth={2.5} />}
            title="Cash"
            desc="Pay the worker when the wash is done."
          />
        </div>
        <div>
          <div className="label-caps mb-2">Pay online · UPI</div>
          <div className="grid gap-3">
            <PayOption
              testid="pay-paytm"
              active={choice === "paytm"}
              onClick={() => setChoice("paytm")}
              iconEl={<PaytmLogo />}
              title="Paytm"
              desc="Pay instantly using Paytm Secure Payment Gateway."
              badge="Secure"
            />
          </div>
        </div>
      </div>

      <button
        onClick={proceed}
        disabled={loading || !choice}
        data-testid="payment-proceed"
        className="group mt-8 w-full h-14 bg-accent text-accent-foreground font-display font-bold text-lg rounded-full accent-glow elev-lift flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? "Processing…" : choice === "cash" ? "Generate Token" : "Proceed to Pay"}
        <span className="h-7 w-7 grid place-items-center rounded-full bg-accent-foreground/10 group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}

function PayOption({ active, onClick, iconEl, title, desc, badge, testid }) {
  return (
    <motion.button
      onClick={onClick}
      data-testid={testid}
      whileTap={{ scale: 0.98 }}
      className={`relative text-left p-5 bg-card rounded-[18px] border flex items-center gap-4 transition-all w-full ${
        active ? "border-primary ring-4 ring-primary/15 elev-3" : "border-border elev-2 hover:border-foreground/20"
      }`}
    >
      <div className={`h-12 w-12 rounded-[14px] grid place-items-center flex-shrink-0 ${active ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>
        {iconEl}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-lg">{title}</span>
          {badge && <span className="chip bg-accent/15 border-accent/30 text-accent-foreground">{badge}</span>}
        </div>
        <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
      </div>
      {active && (
        <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center flex-shrink-0">
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>
      )}
    </motion.button>
  );
}
