import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TokenPage() {
  const { id } = useParams();
  const [b, setB] = useState(null);

  useEffect(() => { api.get(`/bookings/${id}`).then((r) => setB(r.data)); }, [id]);

  if (!b) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  const copy = () => {
    navigator.clipboard.writeText(b.token);
    toast.success("Token copied");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center p-6 relative overflow-hidden" data-testid="token-page">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-20 -left-32 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-20 -right-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        className="relative w-full max-w-md bg-card border border-border rounded-[24px] elev-3 overflow-hidden"
      >
        <div className="p-6 pb-4 text-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="h-14 w-14 rounded-full bg-success text-success-foreground grid place-items-center mx-auto elev-2"
            style={{ background: "hsl(var(--success))", color: "white" }}
          >
            <CheckCircle2 className="h-7 w-7" strokeWidth={2.5} />
          </motion.div>
          <div className="label-caps mt-4">Booking Confirmed</div>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.25 }}
            className="relative my-3"
          >
            <div className="font-display font-black tracking-tighter gradient-text" style={{ fontSize: "clamp(5rem, 16vw, 8rem)", lineHeight: 0.9 }} data-testid="token-display">
              {b.token}
            </div>
            <button onClick={copy} className="absolute top-2 right-0 h-8 w-8 rounded-full bg-muted hover:bg-secondary hover:text-secondary-foreground grid place-items-center transition-colors" title="Copy token">
              <Copy className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </motion.div>
          <p className="text-sm text-muted-foreground">Show this token at the counter.</p>
        </div>

        <div className="px-6 pb-6">
          <div className="bg-muted/60 border border-border rounded-[16px] p-4 grid gap-2.5">
            <Row label="Customer" value={b.customer_name} />
            <Row label="Vehicle" value={b.vehicle_number} mono />
            <Row label="Type" value={b.parent_category_label ? `${b.parent_category_label} · ${b.category_label}` : b.category_label} />
            <Row label="Service" value={`${b.service_name} · ₹${b.price}`} />
            <Row
              label="Payment"
              value={
                <span className={`chip ${b.payment_status === "paid" ? "bg-success/15 text-foreground border-success/30" : "bg-accent/15 text-foreground border-accent/30"}`}>
                  {providerLabel(b)} · {b.payment_status.toUpperCase()}
                </span>
              }
            />
          </div>
          <Link
            to="/"
            data-testid="token-home"
            className="mt-5 w-full h-12 bg-secondary text-secondary-foreground rounded-full font-display font-bold flex items-center justify-center gap-2 elev-2 hover:elev-3 transition-all"
          >
            <Home className="h-4 w-4" strokeWidth={2.5} /> Back to Home
          </Link>
        </div>

        <div className="border-t border-dashed border-border bg-muted/40 px-6 py-3 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>ANJANA WASH · {new Date(b.created_at).toLocaleDateString()}</span>
          <span className="font-mono">#{b.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <div className="label-caps text-[10px]">{label}</div>
      <div className={`font-bold text-right ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function providerLabel(b) {
  if (b.payment_method === "cash") return "CASH";
  if (b.payment_provider === "gpay") return "GOOGLE PAY";
  if (b.payment_provider === "phonepe") return "PHONEPE";
  if (b.payment_provider === "paytm") return "PAYTM";
  return "ONLINE";
}
