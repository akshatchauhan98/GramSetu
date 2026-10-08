import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
// Farmer portal
import FarmerLayout from "./pages/farmer/FarmerLayout";
import FarmerHome from "./pages/farmer/FarmerHome";
import BrokerChecker from "./pages/farmer/BrokerChecker";
import SatelliteYield from "./pages/farmer/SatelliteYield";
import NearbyMills from "./pages/farmer/NearbyMills";
import FarmerAdvisory from "./pages/farmer/FarmerAdvisory";
import FarmerProfile from "./pages/farmer/FarmerProfile";

// Mill portal
import MillLayout from "./pages/mill/MillLayout";
import MillDashboard from "./pages/mill/MillDashboard";
import SupplyMap from "./pages/mill/SupplyMap";
import Requirements from "./pages/mill/Requirements";
import ProcurementCart from "./pages/mill/ProcurementCart";
import Deals from "./pages/mill/Deals";
import FarmerDirectory from "./pages/mill/FarmerDirectory";
import Logistics from "./pages/mill/Logistics";
import MillAnalytics from "./pages/mill/MillAnalytics";
import Payments from "./pages/mill/Payments";
import { MillCartProvider } from "./context/MillCartContext";

// Gov portal
import GovLayout from "./pages/gov/GovLayout";
import GovCommand from "./pages/gov/GovCommand";
import GovAlerts from "./pages/gov/GovAlerts";
import GovRiskTable from "./pages/gov/GovRiskTable";

// Demo Bar
import DemoBar from "./components/DemoBar";

import "./App.css";
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider } from "./context/UserContext";



function AppShell() {
  const { pathname } = useLocation();

  // Hide main marketing navbar inside app portals and auth screens
  const hideSiteNav =
    pathname.startsWith("/farmer") ||
    pathname.startsWith("/mill") ||
    pathname.startsWith("/gov") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  return (
    <div className="min-h-svh bg-[#F5F7F2] text-[#14201B] relative pb-16">
      {!hideSiteNav && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage initialMode="login" />} />
        <Route path="/register" element={<AuthPage initialMode="register" />} />
        <Route path="/auth" element={<AuthPage initialMode="login" />} />
        <Route path="/forgot-password" element={<AuthPage initialMode="forgot" />} />
        <Route path="/reset-password" element={<AuthPage initialMode="reset_token" />} />

        {/* Protected Farmer Portal */}
        <Route element={<ProtectedRoute allowedRoles={['farmer', 'mill', 'gov']} />}>
          <Route path="/farmer" element={<FarmerLayout />}>
            <Route index element={<FarmerHome />} />
            <Route path="broker" element={<BrokerChecker />} />
            <Route path="satellite" element={<SatelliteYield />} />
            <Route path="mills" element={<NearbyMills />} />
            <Route path="advisory" element={<FarmerAdvisory />} />
            <Route path="profile" element={<FarmerProfile />} />
          </Route>
        </Route>

        {/* Protected Mill Portal */}
        <Route element={<ProtectedRoute allowedRoles={['mill', 'farmer', 'gov']} />}>
          <Route
            path="/mill"
            element={
              <MillCartProvider>
                <MillLayout />
              </MillCartProvider>
            }
          >
            <Route index element={<MillDashboard />} />
            <Route path="map" element={<SupplyMap />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="cart" element={<ProcurementCart />} />
            <Route path="deals" element={<Deals />} />
            <Route path="farmers" element={<FarmerDirectory />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="analytics" element={<MillAnalytics />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Route>

        {/* Protected Gov Portal */}
        <Route element={<ProtectedRoute allowedRoles={['gov', 'farmer', 'mill']} />}>
          <Route path="/gov" element={<GovLayout />}>
            <Route index element={<GovCommand />} />
            <Route path="alerts" element={<GovAlerts />} />
            <Route path="risks" element={<GovRiskTable />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Quick Switcher */}
      <DemoBar />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <LanguageProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </LanguageProvider>
    </UserProvider>
  );
}