import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MedScan from "./pages/MedScan";
import Nutrition from "./pages/Nutrition";
import PredictiveHealth from "./pages/PredictiveHealth";
import FamilySafety from "./pages/FamilySafety";
import IoTIntegration from "./pages/IoTIntegration";
import Medications from "./pages/Medications";
import Appointments from "./pages/Appointments";
import HealthChatbot from "./pages/HealthChatbot";
import DoctorSearch from "./pages/DoctorSearch";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/med-scan" element={<Layout><MedScan /></Layout>} />
          <Route path="/nutrition" element={<Layout><Nutrition /></Layout>} />
          <Route path="/predictive-health" element={<Layout><PredictiveHealth /></Layout>} />
          <Route path="/family-safety" element={<Layout><FamilySafety /></Layout>} />
          <Route path="/iot-integration" element={<Layout><IoTIntegration /></Layout>} />
          <Route path="/medications" element={<Layout><Medications /></Layout>} />
          <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
          <Route path="/health-chatbot" element={<Layout><HealthChatbot /></Layout>} />
          <Route path="/doctor-search" element={<Layout><DoctorSearch /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
