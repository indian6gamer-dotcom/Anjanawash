import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import Landing from "@/pages/Landing";
import Register from "@/pages/Register";
import VehiclePhoto from "@/pages/VehiclePhoto";
import CategoryPicker from "@/pages/CategoryPicker";
import SelectService from "@/pages/SelectService";
import Payment from "@/pages/Payment";
import PaytmMock from "@/pages/PaytmMock";
import TokenPage from "@/pages/TokenPage";
import Worker from "@/pages/Worker";
import Owner from "@/pages/Owner";
import PinGate from "@/components/PinGate";
import SiteNav from "@/components/SiteNav";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SiteNav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/photo" element={<VehiclePhoto />} />
          <Route path="/category" element={<CategoryPicker />} />
          <Route path="/service" element={<SelectService />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/paytm-mock" element={<PaytmMock />} />
          <Route path="/token/:id" element={<TokenPage />} />
          <Route path="/worker" element={<PinGate role="worker"><Worker /></PinGate>} />
          <Route path="/owner" element={<PinGate role="owner"><Owner /></PinGate>} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
