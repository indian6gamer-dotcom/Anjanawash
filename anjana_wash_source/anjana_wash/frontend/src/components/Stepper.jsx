import { CheckCircle2 } from "lucide-react";

const STEPS = ["Details", "Photo", "Vehicle", "Service", "Payment"];

export default function Stepper({ step }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap" data-testid="stepper">
      {STEPS.map((s, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className={`h-7 w-7 rounded-full grid place-items-center text-[11px] font-bold transition-colors ${
                active ? "bg-primary text-primary-foreground" : done ? "text-success-foreground" : "bg-muted text-muted-foreground"
              }`}
              style={done ? { background: "hsl(var(--success))", color: "white" } : {}}
            >
              {done ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : idx}
            </div>
            <span className={`text-[11px] font-semibold tracking-wide ${active ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {idx < STEPS.length && <div className="w-4 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
