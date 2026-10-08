import { Link } from "react-router-dom";
import { TriangleAlert, CircleCheck, Satellite, TrendingDown, Landmark } from "lucide-react";

const kpis = [
  ["Farmers Active", "1,280"],
  ["Mills Active", "18"],
  ["Avg Broker Gap", "₹280/q"],
  ["High-risk Villages", "7"],
  ["Direct Deals / week", "42"],
  ["MSP Breach Flags", "3"],
];

export default function GovCommand() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E]">District Command Center</h1>
        <p className="mt-1 text-sm text-[#5C6B63]">
          Moradabad block view • farm-gate fairness intelligence
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {kpis.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-[#5C6B63]">{label}</p>
            <p className="mt-1 text-xl font-bold text-[#0F3D2E]">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-[#0F3D2E] p-5 text-white">
        <p className="text-sm font-medium">
          Middleman Leakage Index: <b>High in 7 villages</b>
        </p>
        <p className="mt-2 text-sm text-white/80">
          Action: push fair-price advisories + monitor repeated low broker quotes + promote direct mill linkage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#0F3D2E]">Top risk villages</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#14201B]">
            <li className="flex items-center gap-1.5"><TriangleAlert size={14} className="text-red-600 shrink-0" /> <span>Rampur — gap 16% — offer ₹1800 vs fair ₹2150</span></li>
            <li className="flex items-center gap-1.5"><TriangleAlert size={14} className="text-amber-600 shrink-0" /> <span>Sitapur — gap 11% — repeated low quotes</span></li>
            <li className="flex items-center gap-1.5"><TriangleAlert size={14} className="text-amber-600 shrink-0" /> <span>Bilari — gap 10% — weak mill linkage</span></li>
          </ul>
          <Link
            to="/gov/risks"
            className="mt-4 inline-block rounded-full bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Open Risk Table
          </Link>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#0F3D2E]">Today’s system signals</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#14201B]">
            <li className="flex items-center gap-1.5"><CircleCheck size={14} className="text-emerald-600 shrink-0" /> <span>42 direct deals this week</span></li>
            <li className="flex items-center gap-1.5"><Satellite size={14} className="text-emerald-600 shrink-0" /> <span>NDVI healthy clusters ready for harvest</span></li>
            <li className="flex items-center gap-1.5"><TrendingDown size={14} className="text-amber-600 shrink-0" /> <span>Broker gap average ₹280/quintal</span></li>
            <li className="flex items-center gap-1.5"><Landmark size={14} className="text-slate-600 shrink-0" /> <span>3 MSP-breach style flags need review</span></li>
          </ul>
          <Link
            to="/gov/alerts"
            className="mt-4 inline-block rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-[#0F3D2E]"
          >
            Open Alerts
          </Link>
        </div>
      </div>
    </div>
  );
}