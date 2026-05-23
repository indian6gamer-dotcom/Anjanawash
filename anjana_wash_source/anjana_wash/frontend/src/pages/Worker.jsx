import { useEffect, useState, useCallback } from "react";
import { api, fileToBase64 } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, RefreshCw, Inbox, Clock, X } from "lucide-react";
import { toast } from "sonner";

export default function Worker() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/queue");
      setQueue(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  const complete = async (b, worker_photo = null) => {
    try {
      await api.post(`/bookings/${b.id}/complete`, { worker_photo });
      toast.success(`${b.token} marked complete`);
      setCompleting(null);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  const onComplete = (b) => {
    if (b.payment_method === "cash") setCompleting(b);
    else complete(b);
  };

  const counts = {
    total: queue.length,
    cash: queue.filter((b) => b.payment_method === "cash").length,
    online: queue.filter((b) => b.payment_method === "online").length,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8" data-testid="worker-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="label-caps">Worker Queue</div>
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">Next Up</h1>
        </div>
        <button
          onClick={refresh}
          data-testid="refresh-queue"
          className="h-10 px-4 bg-card border border-border rounded-full font-display font-bold flex items-center gap-2 elev-2 hover:elev-3 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} /> Refresh
        </button>
      </div>

      {/* summary chips */}
      <div className="mt-4 flex gap-2 flex-wrap">
        <Chip label="In queue" value={counts.total} primary />
        <Chip label="Cash" value={counts.cash} />
        <Chip label="Online" value={counts.online} />
      </div>

      {queue.length === 0 && (
        <div className="mt-10 bg-card border border-dashed border-border rounded-[20px] p-14 text-center">
          <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mx-auto">
            <Inbox className="h-6 w-6 text-muted-foreground" strokeWidth={2.5} />
          </div>
          <div className="font-display font-bold text-lg mt-3">Queue is clear</div>
          <div className="text-sm text-muted-foreground">No vehicles waiting. Take a breather.</div>
        </div>
      )}

      <div className="mt-5 grid gap-3">
        <AnimatePresence>
          {queue.map((b, i) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 120, transition: { duration: 0.25 } }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="bg-card border border-border rounded-[18px] elev-2 overflow-hidden"
              data-testid={`queue-item-${b.token}`}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-56 h-44 flex-shrink-0">
                  <img src={b.vehicle_photo} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 chip bg-background/90 backdrop-blur">
                    <Clock className="h-3 w-3" strokeWidth={2.5} />
                    {fmtTime(b.created_at)}
                  </div>
                </div>
                <div className="flex-1 p-5 flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-xl tracking-tight bg-secondary text-secondary-foreground px-2.5 py-1 rounded-[10px]">{b.token}</span>
                    <span className="chip bg-primary/10 text-primary border-primary/20">{b.service_name}</span>
                    <span className="chip bg-card border-border">
                      {b.parent_category_label ? `${b.parent_category_label} · ${b.category_label}` : (b.category_label || "—")}
                    </span>
                    <span className="font-display font-black text-base text-foreground">₹{b.price}</span>
                    <span
                      className={`chip ${b.payment_method === "cash" ? "bg-accent/15 text-foreground border-accent/30" : "border-success/30 text-foreground"}`}
                      style={b.payment_method === "online" ? { background: "hsl(var(--success) / 0.12)" } : {}}
                    >
                      {b.payment_method === "cash" ? "Cash" : `Paid · ${providerShort(b)}`}
                    </span>
                  </div>
                  <div className="mt-2 font-display font-bold text-xl truncate">{b.customer_name}</div>
                  <div className="font-mono text-sm text-muted-foreground">{b.vehicle_number} · {b.phone}</div>
                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => onComplete(b)}
                      data-testid={`complete-${b.token}`}
                      className="w-full h-11 bg-accent text-accent-foreground font-display font-bold rounded-full accent-glow elev-lift flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" strokeWidth={3} /> Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {completing && <CashCompleteModal booking={completing} onCancel={() => setCompleting(null)} onSubmit={(p) => complete(completing, p)} />}
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, value, primary }) {
  return (
    <div className={`rounded-full border px-4 h-9 flex items-center gap-2 ${primary ? "bg-secondary text-secondary-foreground border-secondary" : "bg-card border-border"}`}>
      <span className="label-caps text-[10px]" style={primary ? { color: "hsl(var(--accent))" } : {}}>{label}</span>
      <span className="font-display font-black text-base">{value}</span>
    </div>
  );
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function providerShort(b) {
  if (b.payment_provider === "gpay") return "GPay";
  if (b.payment_provider === "phonepe") return "PhonePe";
  if (b.payment_provider === "paytm") return "Paytm";
  return "Online";
}

function CashCompleteModal({ booking, onCancel, onSubmit }) {
  const [photo, setPhoto] = useState("");
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast.error("Under 4MB please"); return; }
    const b64 = await fileToBase64(f);
    setPhoto(b64);
  };

  const submit = async () => {
    if (!photo) { toast.error("Upload a cash/receipt photo"); return; }
    setBusy(true);
    await onSubmit(photo);
    setBusy(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-6 z-50"
      data-testid="cash-modal"
    >
      <motion.div
        initial={{ scale: 0.94, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-card border border-border rounded-[22px] w-full max-w-md p-6 elev-3"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="label-caps">Cash Received</div>
            <h2 className="font-display font-black text-2xl tracking-tight">{booking.token} · ₹{booking.price}</h2>
          </div>
          <button onClick={onCancel} className="h-9 w-9 rounded-full grid place-items-center hover:bg-muted"><X className="h-4 w-4" strokeWidth={2.5} /></button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Snap a photo of the cash or receipt as confirmation.</p>

        <label className="mt-4 block cursor-pointer group">
          <input data-testid="worker-photo-input" type="file" accept="image/*" capture="environment" onChange={handle} className="sr-only" />
          {photo ? (
            <div className="relative rounded-[14px] overflow-hidden border border-border elev-1">
              <img src={photo} alt="" className="w-full h-52 object-cover" />
              <div className="absolute top-2 right-2 chip bg-background/90 backdrop-blur">Tap to replace</div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-[14px] h-52 grid place-items-center bg-muted/50 group-hover:bg-muted group-hover:border-primary/40 transition-colors">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-card border border-border grid place-items-center mx-auto elev-1">
                  <Camera className="h-5 w-5 text-primary" strokeWidth={2.5} />
                </div>
                <div className="font-display font-bold mt-2">Tap to capture</div>
              </div>
            </div>
          )}
        </label>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onCancel} data-testid="cash-cancel" className="h-11 bg-card border border-border rounded-full font-display font-bold">Cancel</button>
          <button onClick={submit} disabled={busy} data-testid="cash-confirm" className="h-11 bg-primary text-primary-foreground rounded-full font-display font-bold brand-glow disabled:opacity-50">
            {busy ? "Saving…" : "Confirm Complete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
