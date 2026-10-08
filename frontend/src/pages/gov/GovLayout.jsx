import { Link, NavLink, Outlet } from "react-router-dom";
import { Landmark } from "lucide-react";

const nav = [
  { to: "/gov", label: "Command", end: true },
  { to: "/gov/alerts", label: "Alerts" },
  { to: "/gov/risks", label: "Risk Table" },
];

export default function GovLayout() {
  return (
    <div className="min-h-screen bg-[#F5F7F2] text-[#14201B]">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="font-bold text-[#0F3D2E] flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-[#1F6B4A]" />
              <span>GramSetu Gov Portal</span>
            </div>
            <div className="text-xs text-[#5C6B63]">District fairness & leakage monitor</div>
          </div>
          <Link to="/" className="text-sm font-medium text-[#1F6B4A] hover:underline">
            ← Website
          </Link>
        </div>

        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-[#0F3D2E] text-white"
                    : "border border-emerald-100 bg-white text-[#0F3D2E]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}