const alerts = [
    {
      id: 1,
      level: "High",
      text: "Rampur: broker offers 16% below fair price (₹1800 vs ₹2150)",
      time: "2 hrs ago",
      color: "bg-red-50 border-red-200 text-red-800",
    },
    {
      id: 2,
      level: "Medium",
      text: "Sitapur: repeated low quotes from same buyer pattern today",
      time: "Today",
      color: "bg-amber-50 border-amber-200 text-amber-900",
    },
    {
      id: 3,
      level: "Good",
      text: "Mohanpur: direct mill deal closed at near-fair band",
      time: "Today",
      color: "bg-emerald-50 border-emerald-200 text-emerald-900",
    },
    {
      id: 4,
      level: "Medium",
      text: "Bilari: farm-gate gap widened vs mandi by ₹240/q",
      time: "Yesterday",
      color: "bg-amber-50 border-amber-200 text-amber-900",
    },
  ];
  
  export default function GovAlerts() {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Exploitation Alerts</h1>
          <p className="mt-1 text-sm text-[#5C6B63]">
            Live fairness signals from farmer checks + market benchmarks
          </p>
        </div>
  
        {alerts.map((a) => (
          <div key={a.id} className={`rounded-3xl border p-5 shadow-sm ${a.color}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide">{a.level}</p>
              <p className="text-xs opacity-80">{a.time}</p>
            </div>
            <p className="mt-2 text-sm font-medium md:text-base">{a.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-full bg-[#0F3D2E] px-3 py-1.5 text-xs font-semibold text-white">
                Escalate to Officer
              </button>
              <button className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold">
                Mark Reviewed
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }