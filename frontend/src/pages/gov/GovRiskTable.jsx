const rows = [
    { village: "Rampur", offer: 1800, fair: 2150, gap: "16%", ndvi: 0.74, risk: "High" },
    { village: "Sitapur", offer: 1900, fair: 2140, gap: "11%", ndvi: 0.68, risk: "Medium" },
    { village: "Bilari", offer: 1920, fair: 2130, gap: "10%", ndvi: 0.66, risk: "Medium" },
    { village: "Kanth", offer: 2050, fair: 2170, gap: "5.5%", ndvi: 0.7, risk: "Low" },
    { village: "Bagh Farm", offer: 2100, fair: 2150, gap: "2%", ndvi: 0.71, risk: "Low" },
  ];
  
  const riskColor = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-emerald-100 text-emerald-800",
  };
  
  export default function GovRiskTable() {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Village Risk Table</h1>
          <p className="mt-1 text-sm text-[#5C6B63]">
            Price-gap ranking for district intervention
          </p>
        </div>
  
        <div className="overflow-x-auto rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F5F7F2] text-left text-[#5C6B63]">
              <tr>
                <th className="p-4">Village</th>
                <th className="p-4">Offer</th>
                <th className="p-4">Fair</th>
                <th className="p-4">Gap</th>
                <th className="p-4">NDVI</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.village} className="border-t border-emerald-50">
                  <td className="p-4 font-semibold text-[#0F3D2E]">{r.village}</td>
                  <td className="p-4">₹{r.offer}</td>
                  <td className="p-4">₹{r.fair}</td>
                  <td className="p-4">{r.gap}</td>
                  <td className="p-4">{r.ndvi}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskColor[r.risk]}`}>
                      {r.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }