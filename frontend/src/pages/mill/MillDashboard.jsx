import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Sprout,
  ArrowRight,
  Clock,
  Satellite,
  CreditCard,
  Truck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Building2,
  MapPin,
  FileCheck2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMillCart } from '../../context/MillCartContext';
import { fetchTodayPrice } from '../../services/api';

const WEEKLY_PROCUREMENT_DATA = [
  { day: 'Monday', tonnes: 65, villages: 3 },
  { day: 'Tuesday', tonnes: 85, villages: 4 },
  { day: 'Wednesday', tonnes: 55, villages: 3 },
  { day: 'Thursday', tonnes: 110, villages: 5 },
  { day: 'Friday', tonnes: 95, villages: 4 },
  { day: 'Saturday', tonnes: 130, villages: 6 },
  { day: 'Sunday', tonnes: 45, villages: 2 },
];

const TOP_VILLAGES = [
  {
    id: 'v-rampur',
    name: 'Rampur',
    district: 'Bareilly District',
    ndvi: 0.74,
    ndviStatus: 'NDVI 0.74 - Optimal',
    availableTonnes: 480,
    fairPrice: 2180,
    distanceKm: 42,
  },
  {
    id: 'v-kalyanpur',
    name: 'Kalyanpur',
    district: 'Moradabad District',
    ndvi: 0.81,
    ndviStatus: 'NDVI 0.81 - Prime',
    availableTonnes: 510,
    fairPrice: 2160,
    distanceKm: 28,
  },
  {
    id: 'v-kanth',
    name: 'Kanth',
    district: 'Moradabad District',
    ndvi: 0.70,
    ndviStatus: 'NDVI 0.70 - Optimal',
    availableTonnes: 210,
    fairPrice: 2175,
    distanceKm: 34,
  },
  {
    id: 'v-bagh',
    name: 'Bagh Farm',
    district: 'Moradabad District',
    ndvi: 0.71,
    ndviStatus: 'NDVI 0.71 - Optimal',
    availableTonnes: 65,
    fairPrice: 2180,
    distanceKm: 18,
  },
];

const LIVE_STREAM_EVENTS = [
  {
    id: 'ev-1',
    icon: CheckCircle2,
    iconColor: 'text-[#059669]',
    bgColor: 'bg-[#E8F2EC]',
    text: 'Rampur farmer FPO accepted direct offer at Rs 2,180/q — 50 Tonnes locked',
    meta: 'Direct Contract #MRB-8821',
    timestamp: '2 mins ago',
  },
  {
    id: 'ev-2',
    icon: Satellite,
    iconColor: 'text-[#1F6B4A]',
    bgColor: 'bg-[#E8F2EC]',
    text: 'Sentinel-2 satellite crop scan updated for Sitapur — NDVI index improved to 0.71',
    meta: 'Multi-spectral Band B8/B4 Analyzed',
    timestamp: '14 mins ago',
  },
  {
    id: 'ev-3',
    icon: CreditCard,
    iconColor: 'text-[#0F3D2E]',
    bgColor: 'bg-[#E8F2EC]',
    text: 'Payment of Rs 1,09,000 released to Kalyanpur procurement group',
    meta: 'Escrow Milestone: Weighbridge Slips Verified',
    timestamp: '32 mins ago',
  },
  {
    id: 'ev-4',
    icon: Truck,
    iconColor: 'text-[#1F6B4A]',
    bgColor: 'bg-[#E8F2EC]',
    text: 'Logistics Vehicle UP-22-AT-4521 dispatched from Rampur to Moradabad Processing Unit',
    meta: 'Driver: Ramesh Yadav • 20 Tonne Payload',
    timestamp: '1 hour ago',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F3D2E] text-white p-3 rounded-2xl shadow-xl border border-emerald-500/20 text-xs">
        <p className="font-bold text-emerald-200">{label}</p>
        <p className="mt-1 font-extrabold text-base text-white">
          {payload[0].value} <span className="text-xs font-normal text-emerald-300">Tonnes</span>
        </p>
        <p className="text-[11px] text-stone-300 mt-0.5">
          Active Villages: {payload[0].payload.villages}
        </p>
      </div>
    );
  }
  return null;
};

export default function MillDashboard() {
  const { addToCart } = useMillCart();
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    async function loadPrice() {
      const data = await fetchTodayPrice();
      setPriceData(data);
    }
    loadPrice();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Title & Portal Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Live Satellite Sourcing Terminal
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F3D2E] tracking-tight mt-1">
            Procurement Overview
          </h2>
          <p className="text-stone-500 text-sm font-medium mt-0.5">
            Moradabad Processing Division • Season: Kharif Paddy 2026
          </p>
        </div>

        {/* Quick Date and Status Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-xs text-xs font-semibold text-stone-600">
            <Calendar className="w-4 h-4 text-[#1F6B4A]" />
            <span>Today: 18 September 2026</span>
          </div>
          <Link
            to="/mill/map"
            className="flex items-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white px-4 py-2 rounded-2xl text-xs font-bold transition-colors shadow-xs"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Supply Map</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: EXECUTIVE KPI METRICS (4 Cards in Grid)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Requirement */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Today's Requirement
              </span>
              <span className="text-[11px] font-bold text-stone-400 bg-[#F5F7F2] px-2 py-0.5 rounded-md">
                Target
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#0F3D2E] tracking-tight">500</span>
              <span className="text-base font-bold text-stone-500">Tonnes</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Daily Milling Capacity</span>
            <span className="font-bold text-stone-700">650 T/day</span>
          </div>
        </div>

        {/* Card 2: Already Secured */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Already Secured
              </span>
              <span className="text-[11px] font-bold text-[#059669] bg-[#E8F2EC] px-2 py-0.5 rounded-md">
                36% Fulfilled
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#059669] tracking-tight">180</span>
              <span className="text-base font-bold text-stone-500">Tonnes</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#059669] h-full rounded-full" style={{ width: '36%' }} />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-stone-500 font-medium">
              <span>Remaining to source</span>
              <span className="font-bold text-[#0F3D2E]">320 Tonnes</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Direct Buy Rate */}
        <div className="bg-[#0F3D2E] text-white p-6 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <ShieldCheck className="absolute right-[-10px] top-[-10px] w-28 h-28 text-white/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Avg Direct Buy Rate
              </span>
              <span className="text-[11px] font-bold bg-white/15 text-white px-2 py-0.5 rounded-md">
                Verified Direct
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white tracking-tight">Rs 2,180</span>
              <span className="text-sm font-bold text-emerald-200">/ Quintal</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100/80 font-medium relative z-10">
            <span>MSP Reference Benchmark</span>
            <span className="font-bold text-white">Rs 2,203 /q</span>
          </div>
        </div>

        {/* Card 4: Savings vs Broker */}
        <div className="bg-[#E8F2EC] p-6 rounded-3xl border border-[#1F6B4A]/20 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
                Savings vs Broker (Rs 2,300/q)
              </span>
              <div className="p-1 rounded-lg bg-emerald-200 text-[#0F3D2E]">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#0F3D2E] tracking-tight">-Rs 120</span>
              <span className="text-sm font-bold text-[#1F6B4A]">/ Quintal</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1F6B4A]/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F6B4A] uppercase tracking-wider">
                Total Saved Today
              </span>
              <span className="text-sm font-black text-[#0F3D2E]">
                Rs 2,16,000
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION B & C: LIVE STREAM (2/3) + TOP READY VILLAGES (1/3)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION B: LIVE PROCUREMENT ACTIVITY STREAM (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#E8F2EC] text-[#0F3D2E]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F3D2E]">
                    Live Procurement Activity Stream
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Real-time field updates, FPO acceptances, and satellite triggers
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#1F6B4A] bg-[#E8F2EC] px-2.5 py-1 rounded-full">
                Auto-Synced
              </span>
            </div>

            <div className="divide-y divide-stone-100 mt-2">
              {LIVE_STREAM_EVENTS.map((event) => {
                const IconComponent = event.icon;
                return (
                  <div
                    key={event.id}
                    className="py-3.5 flex items-start gap-4 hover:bg-[#F5F7F2]/60 px-2 rounded-2xl transition-colors"
                  >
                    <div className={`p-2.5 rounded-2xl ${event.bgColor} ${event.iconColor} shrink-0 mt-0.5`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-[#14201B] leading-snug">
                        {event.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-400 font-medium">
                        <span className="text-stone-500">{event.meta}</span>
                        <span>•</span>
                        <span>{event.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Showing last 4 direct procurement interactions</span>
            <Link
              to="/mill/deals"
              className="text-[#1F6B4A] font-bold hover:text-[#0F3D2E] flex items-center gap-1"
            >
              <span>View Deals Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* SECTION C: TOP READY VILLAGES (1/3 width) */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#E8F2EC] text-[#0F3D2E]">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F3D2E]">
                    Top Ready Villages
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium">
                    Satellite verified crop density
                  </p>
                </div>
              </div>
              <Link to="/mill/map" className="text-xs font-bold text-[#1F6B4A] hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-stone-100 mt-2 space-y-1">
              {TOP_VILLAGES.map((village) => (
                <div key={village.id} className="py-3 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#E8F2EC] text-[#1F6B4A] flex items-center justify-center shrink-0 mt-0.5">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F3D2E]">
                          {village.name}, <span className="font-normal text-stone-500">{village.district}</span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F2EC] text-[#1F6B4A]">
                            {village.ndviStatus}
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {village.availableTonnes} T Avail
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart({
                        id: village.id,
                        name: village.name,
                        district: village.district,
                        ndvi: village.ndvi,
                        estimatedYieldTonnes: village.availableTonnes,
                        fairPrice: village.fairPrice,
                      }, 50, village.fairPrice)}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      Procure Direct
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <Link
              to="/mill/map"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#F5F7F2] hover:bg-[#E8F2EC] text-xs font-bold text-[#0F3D2E] transition-colors"
            >
              <span>Explore Supply Map Geofences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION D: WEEKLY PROCUREMENT VOLUME CHART (Recharts Area Chart)         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
                Intake Trend
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#0F3D2E] mt-0.5">
              Weekly Procurement Volume (Tonnes)
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Daily verified intake across all direct village FPO clusters
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1F6B4A]" />
              <span className="font-semibold text-stone-600">Volume (Tonnes)</span>
            </div>
            <div className="bg-[#F5F7F2] px-3 py-1 rounded-xl text-stone-600 font-bold">
              Total Week: 585 Tonnes
            </div>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_PROCUREMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="millGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1F6B4A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1F6B4A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2EB" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#78827A', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#78827A', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="tonnes"
                stroke="#1F6B4A"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#millGreenGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: COST SAVINGS BANNER                                           */}
      {/* ========================================================================= */}
      <div className="bg-[#0F3D2E] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Intermediary Bypass Efficiency
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
              Cumulative Savings: Moradabad Rice Works has saved Rs 18,45,000 by bypassing regional intermediaries across 89 direct procurement transactions on GramSetu.
            </h4>
          </div>
        </div>

        <Link
          to="/mill/analytics"
          className="shrink-0 flex items-center gap-2 bg-white text-[#0F3D2E] hover:bg-emerald-50 px-5 py-3 rounded-2xl font-bold text-xs tracking-wide transition-colors shadow-xs"
        >
          <span>View Cost Audit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}