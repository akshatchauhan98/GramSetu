import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Satellite,
  Scale,
  Calendar,
  Layers,
  Sprout,
  ArrowUpRight,
  Droplets,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Module 1: Monthly Sourcing Trends
const MONTHLY_SOURCING_DATA = [
  { month: 'Apr', volumeTonnes: 320, directPercent: 35 },
  { month: 'May', volumeTonnes: 480, directPercent: 42 },
  { month: 'Jun', volumeTonnes: 540, directPercent: 55 },
  { month: 'Jul', volumeTonnes: 720, directPercent: 64 },
  { month: 'Aug', volumeTonnes: 980, directPercent: 78 },
  { month: 'Sep', volumeTonnes: 1245, directPercent: 86 },
];

// Module 2: Cost Efficiency (GramSetu Direct vs Regional Broker Rate in Rs/Quintal)
const COST_COMPARISON_DATA = [
  { crop: 'Paddy (Common)', gramsetuRate: 2150, brokerRate: 2310, savings: 160 },
  { crop: 'Paddy (PR-126)', gramsetuRate: 2180, brokerRate: 2340, savings: 160 },
  { crop: 'Basmati (PB-1121)', gramsetuRate: 3450, brokerRate: 3680, savings: 230 },
  { crop: 'Wheat (Sharbati)', gramsetuRate: 2320, brokerRate: 2490, savings: 170 },
];

// Module 3: Moisture Distribution across Sourced Batches
const MOISTURE_AUDIT_DATA = [
  { range: '<12% Optimal', batches: 42, color: '#059669' },
  { range: '12% - 14% Standard', batches: 68, color: '#1F6B4A' },
  { range: '14% - 15% Marginal', batches: 12, color: '#D97706' },
  { range: '>15% Rejected/Drying', batches: 2, color: '#DC2626' },
];

// Module 4: 30-Day Predictive Regional Harvest Yield Forecast
const HARVEST_FORECAST_DATA = [
  { date: '18 Sep', predictedHarvestTonnes: 45, confidence: 96 },
  { date: '22 Sep', predictedHarvestTonnes: 90, confidence: 95 },
  { date: '26 Sep', predictedHarvestTonnes: 180, confidence: 93 },
  { date: '30 Sep', predictedHarvestTonnes: 320, confidence: 91 },
  { date: '04 Oct', predictedHarvestTonnes: 540, confidence: 90 },
  { date: '08 Oct', predictedHarvestTonnes: 680, confidence: 88 },
  { date: '12 Oct', predictedHarvestTonnes: 820, confidence: 87 },
  { date: '16 Oct', predictedHarvestTonnes: 610, confidence: 85 },
];

export default function MillAnalytics() {
  const [activeRange, setActiveRange] = useState('6M');

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Procurement Intelligence Suite
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Mill Procurement Analytics
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Data models tracking intake tonnage, intermediary cost leakage prevention, and Sentinel-2 predictive yield cycles.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-stone-200 text-xs font-bold text-stone-600 self-start sm:self-auto">
          {['1M', '3M', '6M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeRange === range
                  ? 'bg-[#0F3D2E] text-white shadow-xs'
                  : 'hover:bg-stone-100 text-stone-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Season Intake</span>
            <TrendingUp className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F3D2E]">4,285</span>
            <span className="text-xs font-bold text-stone-500">Tonnes</span>
          </div>
          <span className="text-[10px] text-[#059669] font-bold mt-1 block">
            +32% vs Kharif 2025
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Direct FPO Share</span>
            <CheckCircle2 className="w-4 h-4 text-[#1F6B4A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#1F6B4A]">86.4%</span>
          </div>
          <span className="text-[10px] text-stone-500 font-semibold mt-1 block">
            Brokers bypassed on 89 deals
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase">Avg Moisture Rating</span>
            <Droplets className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black text-[#0F3D2E]">13.2%</span>
          </div>
          <span className="text-[10px] text-[#059669] font-bold mt-1 block">
            Optimal (Rejection rate 0.4%)
          </span>
        </div>

        <div className="bg-[#0F3D2E] text-white p-5 rounded-3xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-200 uppercase">Broker Savings</span>
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-white">Rs 18.45 L</span>
          </div>
          <span className="text-[10px] text-emerald-200 font-bold mt-1 block">
            Avg Rs 165/q preserved
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1 & 2: SOURCING TRENDS (AREA) & COST EFFICIENCY (BAR)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Monthly Sourcing Trends */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0F3D2E]">
                  1. Direct Sourcing Volume Progression
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Monthly intake in Tonnes and increasing Direct FPO penetration
                </p>
              </div>
              <span className="text-xs font-bold text-[#1F6B4A] bg-[#E8F2EC] px-2.5 py-1 rounded-full">
                Tonnes / Month
              </span>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SOURCING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsSourcingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F3D2E" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0F3D2E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0F3D2E] text-white p-3 rounded-xl shadow-lg text-xs">
                          <p className="font-bold text-emerald-200">{label}</p>
                          <p className="font-black text-sm mt-1">{payload[0].value} Tonnes</p>
                          <p className="text-[10px] text-stone-300">Direct Share: {payload[0].payload.directPercent}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="volumeTonnes" stroke="#0F3D2E" strokeWidth={3} fill="url(#analyticsSourcingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module 2: Cost Efficiency vs Regional Broker Benchmark */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0F3D2E]">
                  2. Cost Efficiency vs Broker Benchmark
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  GramSetu Direct Buy Rate vs Regional Middleman Rates (Rs / Quintal)
                </p>
              </div>
              <span className="text-xs font-bold text-[#059669] bg-[#E8F2EC] px-2.5 py-1 rounded-full">
                Rs / Quintal
              </span>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COST_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
                <XAxis dataKey="crop" tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 10 }} />
                <YAxis domain={[1800, 3800]} tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-xl border border-stone-200 text-xs">
                          <p className="font-bold text-[#0F3D2E]">{label}</p>
                          <p className="text-[#059669] font-extrabold mt-1">Direct: Rs {payload[0].value}/q</p>
                          <p className="text-stone-500 line-through">Broker: Rs {payload[1].value}/q</p>
                          <p className="text-[11px] font-bold text-[#1F6B4A] mt-1">Spread Saved: Rs {payload[0].payload.savings}/q</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="gramsetuRate" name="GramSetu Direct" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="brokerRate" name="Broker Rate" fill="#D1D5DB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODULE 3 & 4: QUALITY AUDIT & PREDICTIVE YIELD FORECAST                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 3: Quality Audit */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-extrabold text-[#0F3D2E]">
                  3. Quality Audit &amp; Moisture Analysis
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Weighbridge laboratory batch test distribution
                </p>
              </div>
              <span className="text-xs font-bold text-[#059669] bg-[#E8F2EC] px-2.5 py-1 rounded-md">
                98.4% Pass Rate
              </span>
            </div>

            <div className="space-y-4 my-5">
              {MOISTURE_AUDIT_DATA.map((item) => (
                <div key={item.range}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-stone-700">{item.range}</span>
                    <span className="font-extrabold text-stone-800">{item.batches} Batches ({Math.round((item.batches / 124) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(item.batches / 124) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F5F7F2] p-3 rounded-2xl">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Avg Broken Grain</span>
              <strong className="text-stone-800 text-sm">3.8%</strong>
              <span className="text-[10px] text-[#059669] block font-semibold">Below 5% threshold</span>
            </div>
            <div className="bg-[#F5F7F2] p-3 rounded-2xl">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Dispatches Audited</span>
              <strong className="text-stone-800 text-sm">124 Weighbridge Slips</strong>
              <span className="text-[10px] text-stone-500 block">100% digital trace</span>
            </div>
          </div>
        </div>

        {/* Module 4: Predictive Yield Forecast */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-[#1F6B4A]" />
                <div>
                  <h3 className="text-base font-extrabold text-[#0F3D2E]">
                    4. Predictive Harvest Yield Forecast (30-Day)
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    AI forecast derived from Sentinel-2 NDVI canopy vigor curves
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-600 bg-[#F5F7F2] px-2.5 py-1 rounded-md">
                Bareilly-MRB Belt
              </span>
            </div>

            <div className="w-full h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HARVEST_FORECAST_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#78827A', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0F3D2E] text-white p-3 rounded-xl shadow-lg text-xs">
                            <p className="font-bold text-emerald-200">{label}</p>
                            <p className="font-black text-sm mt-0.5">{payload[0].value} Tonnes Expected</p>
                            <p className="text-[10px] text-stone-300">Confidence: {payload[0].payload.confidence}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedHarvestTonnes"
                    stroke="#1F6B4A"
                    strokeWidth={3}
                    dot={{ fill: '#0F3D2E', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">
              Peak harvest window projected: <strong className="text-[#0F3D2E]">08 Oct - 14 Oct 2026</strong>
            </span>
            <span className="text-[#059669] font-bold">
              +1,200 T incoming capacity
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}