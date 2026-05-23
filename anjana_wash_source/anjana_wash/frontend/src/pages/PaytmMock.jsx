import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PaytmMock() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const bookingId = searchParams.get("booking_id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "success" | "failed"

  useEffect(() => {
    if (!bookingId) {
      toast.error("Invalid transaction link");
      nav("/");
      return;
    }
    api.get(`/bookings/${bookingId}`)
      .then((r) => {
        setBooking(r.data);
        setLoading(false);
      })
      .catch((e) => {
        toast.error("Failed to load invoice details");
        nav("/");
      });
  }, [bookingId, nav]);

  const handlePay = async () => {
    setPaying(true);
    // Simulate gateway delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try {
      await api.post("/payment/paytm/callback", { booking_id: bookingId });
      setStatus("success");
      toast.success("Payment Successful via Paytm!");
      // Redirect after success animation
      setTimeout(() => {
        nav(`/token/${bookingId}`);
      }, 2500);
    } catch (e) {
      setStatus("failed");
      toast.error("Paytm transaction failed");
      setPaying(false);
    }
  };

  const handleCancel = () => {
    toast.error("Payment cancelled by customer");
    nav("/payment");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-6">
        <RefreshCw className="h-10 w-10 text-[#002970] animate-spin" />
        <p className="mt-4 font-display font-medium text-sm text-muted-foreground">Connecting to Paytm Secure Gateway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-4 sm:p-6" data-testid="paytm-mock-page">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full max-w-md bg-white border border-[#e1e6eb] rounded-[16px] overflow-hidden shadow-lg"
          >
            {/* Paytm Top Brand Banner */}
            <div className="bg-[#002970] px-6 py-5 flex items-center justify-between text-white relative">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-2xl tracking-tighter">
                  <span fill="#ffffff">pay</span>
                  <span className="text-[#00baf2]">tm</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                <ShieldCheck className="h-3.5 w-3.5 text-[#00baf2]" strokeWidth={2.5} /> SECURE
              </div>
            </div>

            {/* Merchant Details */}
            <div className="px-6 py-6 border-b border-[#f0f3f6]">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Merchant</div>
              <div className="font-display font-black text-lg text-[#002970] mt-0.5">ANJANA SERVICE STATION</div>
              <div className="mt-1.5 flex justify-between items-center bg-[#f8fafc] border border-[#e8edf2] rounded-[10px] px-3.5 py-2.5">
                <div>
                  <div className="text-[10px] text-muted-foreground font-semibold">ORDER ID</div>
                  <div className="font-mono text-xs text-[#002970] font-bold">{booking?.id?.slice(3, 15).toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-semibold">AMOUNT DUE</div>
                  <div className="font-display font-black text-xl text-[#002970]">₹{booking?.price}</div>
                </div>
              </div>
            </div>

            {/* UPI Option Container */}
            <div className="p-6 bg-[#fcfdfe]">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Preferred Payment Option</div>
              <div className="border border-[#e2e8f0] rounded-[12px] bg-white p-4 flex items-center gap-3.5 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-[#00baf2]/10 grid place-items-center flex-shrink-0">
                  <span className="font-display font-bold text-xs text-[#00baf2]">UPI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm text-[#002970]">Paytm UPI Engine</div>
                  <div className="text-xs text-muted-foreground truncate">Direct checkout from your linked bank account</div>
                </div>
              </div>

              {/* Pay and Cancel Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full h-13 bg-[#00baf2] hover:bg-[#009ed4] text-white font-display font-bold text-base rounded-[10px] flex items-center justify-center gap-2 transition-all shadow-md shadow-[#00baf2]/25"
                >
                  {paying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processing Securely...
                    </>
                  ) : (
                    <>
                      Pay ₹{booking?.price}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={paying}
                  className="w-full h-11 bg-transparent border border-[#cbd5e1] hover:bg-[#f8fafc] text-muted-foreground font-display font-semibold text-sm rounded-[10px] transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            </div>

            {/* Footer trust badges */}
            <div className="bg-[#f8fafc] px-6 py-4.5 border-t border-[#e2e8f0] text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <span>Verified by Paytm Safe Shield</span>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white border border-[#e1e6eb] rounded-[20px] p-8 text-center shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="h-16 w-16 bg-[#4ade80]/15 text-[#16a34a] rounded-full grid place-items-center mx-auto"
            >
              <CheckCircle2 className="h-10 w-10" strokeWidth={2.5} />
            </motion.div>
            <h2 className="font-display font-black text-2xl text-[#002970] mt-5">Payment Successful</h2>
            <p className="text-sm text-muted-foreground mt-2">Your Paytm transaction of ₹{booking?.price} was completed. Redirecting to token confirmation...</p>
          </motion.div>
        )}

        {status === "failed" && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white border border-[#e1e6eb] rounded-[20px] p-8 text-center shadow-2xl"
          >
            <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full grid place-items-center mx-auto">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="font-display font-black text-2xl text-[#002970] mt-5">Transaction Failed</h2>
            <p className="text-sm text-muted-foreground mt-2">We could not process this transaction.</p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-6 px-5 py-2 bg-[#002970] text-white rounded-full text-sm font-semibold"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
