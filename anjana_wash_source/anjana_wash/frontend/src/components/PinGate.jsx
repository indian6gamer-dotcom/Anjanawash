import { useState } from "react";
import { api } from "@/lib/api";
import { Lock, Delete, Droplets } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PinGate({ role, children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  if (unlocked) return children;

  const push = (d) => { if (pin.length < 6) setPin(pin + d); };
  const back = () => setPin(pin.slice(0, -1));

  const submit = async () => {
    if (pin.length < 4) { toast.error("PIN must be 4-6 digits"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-pin", { role, pin });
      if (data.success) {
        setUnlocked(true);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 400);
        toast.error("Incorrect PIN");
        setPin("");
      }
    } catch { toast.error("Error verifying PIN"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center p-6 relative overflow-hidden" data-testid={`pin-gate-${role}`}>
      <div className="absolute inset-0 grid-pattern opacity-60" />
      <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-1/4 -right-40 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative w-full max-w-sm bg-card border border-border rounded-[22px] elev-3 p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-[14px] bg-secondary text-accent grid place-items-center relative overflow-hidden">
            <Lock className="h-5 w-5 relative z-10" strokeWidth={2.5} />
            <div className="absolute -inset-1 bg-primary/30 blur-xl" />
          </div>
          <div>
            <div className="label-caps">Restricted Area</div>
            <div className="font-display font-black text-2xl tracking-tight">{role === "worker" ? "Worker" : "Owner"} PIN</div>
          </div>
        </div>

        <motion.div
          animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex gap-2 justify-center mb-6"
          data-testid="pin-display"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={`h-12 w-9 border rounded-[10px] grid place-items-center font-mono text-2xl transition-all ${
                  filled ? "border-primary bg-primary/5 scale-[1.03]" : "border-border"
                }`}
              >
                {filled ? "•" : ""}
              </div>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <motion.button
              key={d}
              onClick={() => push(d)}
              data-testid={`pin-key-${d}`}
              whileTap={{ scale: 0.92 }}
              className="h-14 border border-border rounded-[14px] font-display font-bold text-2xl bg-card hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors"
            >
              {d}
            </motion.button>
          ))}
          <motion.button onClick={back} data-testid="pin-key-back" whileTap={{ scale: 0.92 }} className="h-14 border border-border rounded-[14px] grid place-items-center bg-muted hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors">
            <Delete className="h-5 w-5" strokeWidth={2.5} />
          </motion.button>
          <motion.button onClick={() => push("0")} whileTap={{ scale: 0.92 }} data-testid="pin-key-0" className="h-14 border border-border rounded-[14px] font-display font-bold text-2xl bg-card hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors">0</motion.button>
          <motion.button onClick={submit} disabled={loading} data-testid="pin-submit" whileTap={{ scale: 0.95 }} className="h-14 bg-primary text-primary-foreground rounded-[14px] font-display font-bold brand-glow disabled:opacity-50">
            {loading ? "…" : "OK"}
          </motion.button>
        </div>

        <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Droplets className="h-3 w-3" strokeWidth={2.5} />
          Default {role} PIN: <span className="font-mono font-bold">{role === "worker" ? "1234" : "9999"}</span> (change in Owner section)
        </div>
      </motion.div>
    </div>
  );
}
