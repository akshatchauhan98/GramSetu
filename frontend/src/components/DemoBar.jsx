import { Link, useLocation } from "react-router-dom";
import { Globe, User, AlertTriangle, Factory, Landmark, MapPin } from "lucide-react";

export default function DemoBar() {
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-3 left-1/2 z-[9999] -translate-x-1/2 transform rounded-full border border-emerald-200/80 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md transition-all">
      <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold">
        <span className="hidden px-2 text-[11px] uppercase tracking-wider text-[#5C6B63] sm:inline">
          Portals:
        </span>

        <Link
          to="/"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            pathname === "/"
              ? "bg-[#0F3D2E] text-white"
              : "text-[#0F3D2E] hover:bg-emerald-50"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        <Link
          to="/mill"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            pathname.startsWith("/mill")
              ? "bg-[#0F3D2E] text-white font-bold"
              : "text-[#0F3D2E] hover:bg-emerald-50"
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          <span>Mill OS</span>
        </Link>

        <Link
          to="/farmer"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            pathname.startsWith("/farmer") && !pathname.includes("broker")
              ? "bg-[#0F3D2E] text-white"
              : "text-[#0F3D2E] hover:bg-emerald-50"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Farmer</span>
        </Link>

        <Link
          to="/gov/alerts"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
            pathname.startsWith("/gov")
              ? "bg-[#0F3D2E] text-white"
              : "text-[#0F3D2E] hover:bg-emerald-50"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Gov Hub</span>
        </Link>
      </div>
    </div>
  );
}