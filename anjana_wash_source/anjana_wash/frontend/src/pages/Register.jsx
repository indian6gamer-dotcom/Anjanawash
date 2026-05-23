import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, User, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Stepper from "@/components/Stepper";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem("anjana_details");
    return saved ? JSON.parse(saved) : { customer_name: "", phone: "", vehicle_number: "" };
  });

  const submit = (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.vehicle_number) {
      toast.error("Please fill all fields"); return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Enter a valid 10-digit phone number"); return;
    }
    sessionStorage.setItem("anjana_details", JSON.stringify(form));
    nav("/photo");
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-10" data-testid="register-page">
      <Stepper step={1} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-4">Your details</h1>
        <p className="text-muted-foreground mt-2">Quick contact details so we know who's next in line.</p>
      </motion.div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field icon={User} label="Full Name">
          <input
            data-testid="input-name"
            type="text"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="input-field"
            placeholder="e.g. Rakesh Kumar"
          />
        </Field>
        <Field icon={Phone} label="Phone Number">
          <input
            data-testid="input-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field font-mono"
            placeholder="9876543210"
          />
        </Field>
        <Field icon={Car} label="Vehicle Number">
          <input
            data-testid="input-vehicle-number"
            type="text"
            value={form.vehicle_number}
            onChange={(e) => setForm({ ...form, vehicle_number: e.target.value.toUpperCase() })}
            className="input-field font-mono font-bold uppercase tracking-wider"
            placeholder="KA01AB1234"
          />
        </Field>

        <button
          type="submit"
          data-testid="submit-registration"
          className="group w-full h-14 bg-primary text-primary-foreground font-display font-bold text-lg rounded-full brand-glow elev-lift flex items-center justify-center gap-2"
        >
          Continue to Photo
          <span className="h-7 w-7 grid place-items-center rounded-full bg-primary-foreground/15 group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </button>
      </form>
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="label-caps mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        {label}
      </div>
      {children}
    </div>
  );
}
