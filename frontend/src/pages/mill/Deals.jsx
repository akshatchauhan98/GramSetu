import React, { useState } from 'react';
import {
  Briefcase,
  ArrowRight,
  FileText,
  CheckCircle2,
  Truck,
  Phone,
  ShieldCheck,
  Scale,
  Clock,
  Building2,
  X,
  ChevronRight,
  MapPin,
  TrendingDown,
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'proposals',
    title: 'PROPOSALS SUBMITTED',
    description: 'Offers sent to village FPOs',
    accentColor: '#D97706',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-800',
    badgeColor: 'bg-amber-100 text-amber-900',
  },
  {
    id: 'negotiation',
    title: 'UNDER NEGOTIATION',
    description: 'Counter-offers under review',
    accentColor: '#2563EB',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-900',
  },
  {
    id: 'confirmed',
    title: 'CONTRACT CONFIRMED',
    description: 'Agreed rate locked, awaiting harvest',
    accentColor: '#059669',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-800',
    badgeColor: 'bg-emerald-100 text-emerald-900',
  },
  {
    id: 'logistics',
    title: 'LOGISTICS EN ROUTE',
    description: 'Vehicles dispatched, live GPS tracking',
    accentColor: '#7C3AED',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-900',
  },
];

const INITIAL_DEALS = [
  {
    id: 'DEAL-881',
    stage: 'proposals',
    village: 'Sitapur',
    district: 'Sitapur District',
    fpoName: 'Sitapur Agro Producers Co.',
    fpoContact: 'Devendra Yadav (+91 98380 44120)',
    volumeTonnes: 80,
    ratePerQuintal: 2165,
    brokerBenchmarkRate: 2300,
    progressPercent: 25,
    eta: '18 Oct 2026',
    ndvi: 0.68,
    contractRef: 'CTR-STP-2026-081',
    weighbridgeSlipStatus: 'Pending Harvest',
  },
  {
    id: 'DEAL-882',
    stage: 'negotiation',
    village: 'Mohanpur',
    district: 'Sambhal District',
    fpoName: 'Mohanpur Annadata Sangathan',
    fpoContact: 'Harish Kumar (+91 96340 91823)',
    volumeTonnes: 60,
    ratePerQuintal: 2150,
    brokerBenchmarkRate: 2280,
    progressPercent: 50,
    eta: '22 Oct 2026',
    ndvi: 0.58,
    contractRef: 'CTR-SMB-2026-042',
    weighbridgeSlipStatus: 'Rate Negotiation (Gap: Rs 20/q)',
  },
  {
    id: 'DEAL-883',
    stage: 'confirmed',
    village: 'Bagh Farm',
    district: 'Moradabad District',
    fpoName: 'Bagh Progressive Farmers Group',
    fpoContact: 'Vikram Singh (+91 98971 30045)',
    volumeTonnes: 15,
    ratePerQuintal: 2180,
    brokerBenchmarkRate: 2300,
    progressPercent: 75,
    eta: '10 Oct 2026',
    ndvi: 0.71,
    contractRef: 'CTR-MRB-2026-119',
    weighbridgeSlipStatus: 'Escrow Deposited (Rs 3,27,000)',
  },
  {
    id: 'DEAL-884',
    stage: 'confirmed',
    village: 'Rampur',
    district: 'Bareilly District',
    fpoName: 'Rampur Krishi Vikas Samiti',
    fpoContact: 'Maheshwar Singh (+91 94521 88390)',
    volumeTonnes: 120,
    ratePerQuintal: 2180,
    brokerBenchmarkRate: 2300,
    progressPercent: 80,
    eta: '12 Oct 2026',
    ndvi: 0.74,
    contractRef: 'CTR-BRY-2026-204',
    weighbridgeSlipStatus: 'Escrow Deposited (Rs 26,16,000)',
  },
  {
    id: 'DEAL-885',
    stage: 'logistics',
    village: 'Kanth',
    district: 'Moradabad District',
    fpoName: 'Kanth Kisan Jagriti Mandal',
    fpoContact: 'Suresh Chandra (+91 94123 77209)',
    volumeTonnes: 150,
    ratePerQuintal: 2175,
    brokerBenchmarkRate: 2300,
    progressPercent: 95,
    eta: 'Today (3:30 PM)',
    ndvi: 0.70,
    contractRef: 'CTR-MRB-2026-092',
    weighbridgeSlipStatus: 'En Route: Truck UP-22-AT-4521',
  },
];

export default function Deals() {
  const [deals, setDeals] = useState(INITIAL_DEALS);
  const [selectedDealModal, setSelectedDealModal] = useState(null);

  const stageOrder = ['proposals', 'negotiation', 'confirmed', 'logistics'];

  const advanceStage = (dealId) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== dealId) return deal;
        const currIndex = stageOrder.indexOf(deal.stage);
        if (currIndex >= stageOrder.length - 1) return deal;
        const nextStage = stageOrder[currIndex + 1];
        const nextProgress = Math.min(100, deal.progressPercent + 25);
        return { ...deal, stage: nextStage, progressPercent: nextProgress };
      })
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              B2B Contract Lifecycle Board
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Active Deals Pipeline
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Monitor proposal submissions, counter-negotiations, locked contracts, and live inbound transit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-white px-3.5 py-2 rounded-2xl border border-stone-200 text-stone-700">
            Total Pipeline Volume: <strong className="text-[#0F3D2E]">425 Tonnes</strong>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KANBAN PIPELINE BOARD (4 COLUMNS)                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
        {COLUMNS.map((column) => {
          const columnDeals = deals.filter((d) => d.stage === column.id);
          const totalColTonnes = columnDeals.reduce((sum, d) => sum + d.volumeTonnes, 0);

          return (
            <div
              key={column.id}
              className="bg-[#F5F7F2] rounded-3xl border border-stone-200/80 p-4 flex flex-col min-h-[560px]"
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-black tracking-wider uppercase"
                    style={{ color: column.accentColor }}
                  >
                    {column.title}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${column.badgeColor}`}>
                    {columnDeals.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                  <span className="truncate">{column.description}</span>
                  <span className="font-bold text-stone-700 shrink-0 ml-1">
                    {totalColTonnes} T
                  </span>
                </div>
              </div>

              {/* Deals Cards */}
              <div className="space-y-3.5 flex-1">
                {columnDeals.map((deal) => {
                  const quintals = deal.volumeTonnes * 10;
                  const contractValue = quintals * deal.ratePerQuintal;
                  const savings = quintals * (deal.brokerBenchmarkRate - deal.ratePerQuintal);

                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealModal(deal)}
                      className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 cursor-pointer hover:border-stone-300 hover:shadow-sm transition-all space-y-3"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-sm text-[#0F3D2E]">
                              {deal.village}
                            </h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#E8F2EC] text-[#059669]">
                              NDVI {deal.ndvi}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-medium">
                            {deal.fpoName}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-stone-400">
                          {deal.id}
                        </span>
                      </div>

                      {/* Volume and rate */}
                      <div className="bg-[#F5F7F2] p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-stone-400 block font-semibold">VOLUME</span>
                          <span className="font-extrabold text-stone-800">{deal.volumeTonnes} Tonnes</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block font-semibold">RATE</span>
                          <span className="font-extrabold text-[#059669]">Rs {deal.ratePerQuintal}/q</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-stone-500 mb-1">
                          <span>Progress</span>
                          <span className="text-[#0F3D2E] font-bold">{deal.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${deal.progressPercent}%`,
                              backgroundColor: column.accentColor,
                            }}
                          />
                        </div>
                      </div>

                      {/* ETA and Actions */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        <span className="text-stone-500 font-medium">
                          ETA: <strong className="text-stone-800">{deal.eta}</strong>
                        </span>

                        {deal.stage !== 'logistics' ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              advanceStage(deal.id);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-[#1F6B4A] hover:text-[#0F3D2E] bg-[#E8F2EC] hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>In Transit</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnDeals.length === 0 && (
                  <div className="py-12 text-center text-stone-400 text-xs font-medium">
                    No active deals in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Details Modal */}
      {selectedDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedDealModal(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#1F6B4A]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F3D2E]">
                  Contract Summary: {selectedDealModal.village}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {selectedDealModal.contractRef} • Deal ID: {selectedDealModal.id}
                </p>
              </div>
            </div>

            <div className="bg-[#F5F7F2] p-4 rounded-2xl text-xs space-y-2.5 mb-5">
              <div className="flex justify-between">
                <span className="text-stone-500">Contracted FPO:</span>
                <strong className="text-stone-800">{selectedDealModal.fpoName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Representative Contact:</span>
                <strong className="text-stone-800">{selectedDealModal.fpoContact}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Contract Volume:</span>
                <strong className="text-stone-800">{selectedDealModal.volumeTonnes} Tonnes ({selectedDealModal.volumeTonnes * 10} Quintals)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Locked Buy Rate:</span>
                <strong className="text-[#059669] font-bold">Rs {selectedDealModal.ratePerQuintal} / Quintal</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Regional Broker Rate:</span>
                <span className="line-through text-stone-400">Rs {selectedDealModal.brokerBenchmarkRate} / Quintal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Weighbridge Status:</span>
                <strong className="text-[#0F3D2E]">{selectedDealModal.weighbridgeSlipStatus}</strong>
              </div>
            </div>

            <div className="bg-[#E8F2EC] p-3.5 rounded-2xl border border-[#1F6B4A]/20 flex items-center justify-between text-xs mb-5">
              <div className="flex items-center gap-2 text-[#059669]">
                <TrendingDown className="w-4 h-4" />
                <span className="font-bold">Total Intermediary Savings:</span>
              </div>
              <span className="font-extrabold text-[#0F3D2E] text-sm">
                Rs {((selectedDealModal.volumeTonnes * 10) * (selectedDealModal.brokerBenchmarkRate - selectedDealModal.ratePerQuintal)).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex gap-3">
              <a
                href={`tel:${selectedDealModal.fpoContact.split(' ')[1] || '9838000000'}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F5F7F2] hover:bg-[#E8F2EC] text-[#0F3D2E] py-3 rounded-2xl font-bold text-xs transition-colors"
              >
                <Phone className="w-4 h-4 text-[#1F6B4A]" />
                <span>Call FPO Rep</span>
              </a>

              {selectedDealModal.stage !== 'logistics' ? (
                <button
                  type="button"
                  onClick={() => {
                    advanceStage(selectedDealModal.id);
                    setSelectedDealModal(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white py-3 rounded-2xl font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Advance Pipeline Stage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDealModal(null)}
                  className="flex-1 py-3 rounded-2xl bg-[#0F3D2E] text-white font-bold text-xs"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}