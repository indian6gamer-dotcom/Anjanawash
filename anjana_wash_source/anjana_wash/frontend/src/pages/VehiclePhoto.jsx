import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Upload, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { fileToBase64 } from "@/lib/api";
import Stepper from "@/components/Stepper";

export default function VehiclePhoto() {
  const nav = useNavigate();
  const [preview, setPreview] = useState(() => sessionStorage.getItem("anjana_photo") || "");

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error("Photo must be under 4MB"); return; }
    const b64 = await fileToBase64(file);
    setPreview(b64);
    sessionStorage.setItem("anjana_photo", b64);
  };

  const next = () => {
    if (!preview) { toast.error("Please upload a vehicle photo"); return; }
    nav("/category");
  };

  // Guard: require details from step 1
  if (!sessionStorage.getItem("anjana_details")) {
    nav("/register");
    return null;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10" data-testid="photo-page">
      <Stepper step={2} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tight mt-4">Vehicle photo</h1>
        <p className="text-muted-foreground mt-2">A quick snap helps our worker identify your vehicle in the queue.</p>
      </motion.div>

      <label className="mt-8 block cursor-pointer group" data-testid="vehicle-photo-upload">
        <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="sr-only" />
        {preview ? (
          <div className="relative border border-border rounded-[14px] overflow-hidden elev-2">
            <img src={preview} alt="vehicle" className="w-full h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 chip bg-background/90 backdrop-blur">
              <CheckCircle2 className="h-3 w-3" strokeWidth={3} style={{ color: "hsl(var(--success))" }} /> Ready
            </div>
            <div className="absolute bottom-3 right-3 chip bg-background/90 backdrop-blur">
              <Upload className="h-3 w-3" strokeWidth={2.5} /> Tap to replace
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-[14px] h-72 grid place-items-center bg-muted/50 group-hover:bg-muted group-hover:border-primary/40 transition-colors">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-card border border-border grid place-items-center mx-auto elev-1">
                <Camera className="h-7 w-7 text-primary" strokeWidth={2.5} />
              </div>
              <div className="mt-3 font-display font-bold text-lg">Tap to take a photo</div>
              <div className="text-xs text-muted-foreground mt-1">JPG/PNG · under 4MB</div>
            </div>
          </div>
        )}
      </label>

      <button
        onClick={next}
        disabled={!preview}
        data-testid="photo-continue"
        className="group mt-6 w-full h-14 bg-primary text-primary-foreground font-display font-bold text-lg rounded-full brand-glow elev-lift flex items-center justify-center gap-2 disabled:opacity-50"
      >
        Continue to Vehicle
        <span className="h-7 w-7 grid place-items-center rounded-full bg-primary-foreground/15 group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
    </div>
  );
}
