import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Share2,
  Sliders,
  Calendar,
  AlertCircle,
  Eye,
  Pause,
  Play,
  Trash2,
  Radio,
  Sprout,
  Target,
  FileText,
  BadgeCheck,
} from 'lucide-react';

const INITIAL_REQUIREMENTS = [
  {
    id: 'REQ-MRB-2026-091',
    crop: 'Paddy (PR-126 Basmati)',
    volumeTonnes: 500,
    maxRate: 2180,
    quality: 'Moisture <14%, Broken <5%',
    radiusKm: 50,
    villagesReached: 24,
    responses: 8,
    status: 'Active Broadcast',
    postedDate: '16 Sep 2026',
  },
  {
    id: 'REQ-MRB-2026-088',
    crop: 'Paddy (Common / Sona Masoori)',
    volumeTonnes: 300,
    maxRate: 2150,
    quality: 'Moisture <13.5%, Broken <4%',
    radiusKm: 25,
    villagesReached: 14,
    responses: 6,
    status: 'Active Broadcast',
    postedDate: '12 Sep 2026',
  },
  {
    id: 'REQ-MRB-2026-074',
    crop: 'Wheat (Sharbati HD-2967)',
    volumeTonnes: 150,
    maxRate: 2320,
    quality: 'Moisture <12%, Foreign Matter <1%',
    radiusKm: 100,
    villagesReached: 42,
    responses: 11,
    status: 'Paused',
    postedDate: '01 Sep 2026',
  },
];

export default function Requirements() {
  const [requirements, setRequirements] = useState(INITIAL_REQUIREMENTS);
  const [currentStep, setCurrentStep] = useState(1);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Form State
  const [wizardData, setWizardData] = useState({
    crop: 'Paddy',
    variety: 'Kharif Common / PR-126',
    quantityTonnes: 200,
    moisturePercent: 14,
    brokenGrainPercent: 4.5,
    grainLengthMm: 6.8,
    maxOfferPrice: 2180,
    deliveryWindowStart: '2026-10-05',
    deliveryWindowEnd: '2026-10-25',
    radiusKm: 50,
  });

  const handleInputChange = (field, value) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    const newReq = {
      id: `REQ-MRB-2026-${Math.floor(100 + Math.random() * 900)}`,
      crop: `${wizardData.crop} (${wizardData.variety})`,
      volumeTonnes: Number(wizardData.quantityTonnes),
      maxRate: Number(wizardData.maxOfferPrice),
      quality: `Moisture <${wizardData.moisturePercent}%, Broken <${wizardData.brokenGrainPercent}%`,
      radiusKm: Number(wizardData.radiusKm),
      villagesReached: wizardData.radiusKm === 10 ? 8 : wizardData.radiusKm === 25 ? 18 : wizardData.radiusKm === 50 ? 32 : 58,
      responses: 0,
      status: 'Active Broadcast',
      postedDate: 'Today',
    };

    setRequirements([newReq, ...requirements]);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setCurrentStep(1);
    }, 3000);
  };

  const toggleStatus = (id) => {
    setRequirements((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'Active Broadcast' ? 'Paused' : 'Active Broadcast' }
          : r
      )
    );
  };

  const deleteRequirement = (id) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const steps = [
    { number: 1, title: 'Crop & Volume' },
    { number: 2, title: 'Quality Parameters' },
    { number: 3, title: 'Commercial Terms' },
    { number: 4, title: 'Target Radius' },
    { number: 5, title: 'Broadcast' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
            Demand Aggregation Engine
          </span>
        </div>
        <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
          Requirements Management
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm font-medium">
          Broadcast milling specs directly to registered farmer FPOs and eliminate middleman markups.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: POST NEW REQUIREMENT WIZARD (5 STEPS)                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-8">
        
        {/* Wizard Header & Progress Tabs */}
        <div className="border-b border-stone-100 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#0F3D2E]">
                Post New Procurement Requirement
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Step {currentStep} of 5: {steps[currentStep - 1].title}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1F6B4A] bg-[#E8F2EC] px-3 py-1 rounded-full">
              FPO Direct Broadcast
            </span>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s) => {
              const isDone = s.number < currentStep;
              const isCurrent = s.number === currentStep;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => setCurrentStep(s.number)}
                  className={`text-left p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'border-[#1F6B4A] bg-[#E8F2EC] text-[#0F3D2E]'
                      : isDone
                      ? 'border-emerald-200 bg-stone-50 text-stone-700'
                      : 'border-stone-200 bg-transparent text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isCurrent
                          ? 'bg-[#0F3D2E] text-white'
                          : isDone
                          ? 'bg-[#059669] text-white'
                          : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      {s.number}
                    </span>
                    <span className="text-[11px] font-bold hidden sm:inline truncate">
                      {s.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Body */}
        {broadcastSuccess ? (
          <div className="py-12 text-center max-w-md mx-auto space-y-3 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-[#E8F2EC] text-[#059669] flex items-center justify-center mx-auto shadow-sm">
              <BadgeCheck className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-[#0F3D2E]">
              Requirement Broadcasted Successfully
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Dispatched to {wizardData.radiusKm === 10 ? 8 : wizardData.radiusKm === 25 ? 18 : wizardData.radiusKm === 50 ? 32 : 58} verified village FPOs within {wizardData.radiusKm} km radius. Offers will appear in your Active Deals pipeline.
            </p>
          </div>
        ) : (
          <div>
            {/* STEP 1: Crop Selection & Quantity */}
            {currentStep === 1 && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Select Target Commodity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Paddy', 'Wheat', 'Sugarcane'].map((crop) => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleInputChange('crop', crop)}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          wizardData.crop === crop
                            ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white shadow-xs'
                            : 'border-stone-200 bg-[#F5F7F2] text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <Sprout className="w-5 h-5 mx-auto mb-1.5" />
                        <span className="text-sm font-extrabold">{crop}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Variety / Grade Specification
                    </label>
                    <input
                      type="text"
                      value={wizardData.variety}
                      onChange={(e) => handleInputChange('variety', e.target.value)}
                      placeholder="e.g. PR-126 / Basmati / Sharbati"
                      className="w-full bg-[#F5F7F2] text-sm px-4 py-3 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Total Required Quantity (Tonnes)
                    </label>
                    <input
                      type="number"
                      value={wizardData.quantityTonnes}
                      onChange={(e) => handleInputChange('quantityTonnes', e.target.value)}
                      min={10}
                      max={5000}
                      className="w-full bg-[#F5F7F2] text-sm px-4 py-3 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none font-bold text-[#0F3D2E]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">
                      Equivalent to {wizardData.quantityTonnes * 10} Quintals
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Quality Parameters */}
            {currentStep === 2 && (
              <div className="space-y-6 max-w-2xl">
                <p className="text-xs text-stone-500 font-medium">
                  Set laboratory acceptance criteria for electronic weighbridge intake.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#F5F7F2] p-4 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Max Moisture Content (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={wizardData.moisturePercent}
                      onChange={(e) => handleInputChange('moisturePercent', e.target.value)}
                      className="w-full bg-white text-sm font-bold p-2.5 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Standard benchmark: &lt;14.0%</span>
                  </div>

                  <div className="bg-[#F5F7F2] p-4 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Max Broken Grain (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={wizardData.brokenGrainPercent}
                      onChange={(e) => handleInputChange('brokenGrainPercent', e.target.value)}
                      className="w-full bg-white text-sm font-bold p-2.5 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Grade-A standard: &lt;5.0%</span>
                  </div>

                  <div className="bg-[#F5F7F2] p-4 rounded-2xl border border-stone-200">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Minimum Grain Length (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={wizardData.grainLengthMm}
                      onChange={(e) => handleInputChange('grainLengthMm', e.target.value)}
                      className="w-full bg-white text-sm font-bold p-2.5 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Basmati length: 6.6 - 7.2 mm</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Commercial Terms */}
            {currentStep === 3 && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Maximum Offer Price (Rs / Quintal)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-stone-500 text-sm">
                        Rs
                      </span>
                      <input
                        type="number"
                        value={wizardData.maxOfferPrice}
                        onChange={(e) => handleInputChange('maxOfferPrice', e.target.value)}
                        className="w-full bg-[#F5F7F2] text-sm pl-11 pr-4 py-3 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none font-extrabold text-[#0F3D2E]"
                      />
                    </div>
                    <span className="text-[11px] text-[#059669] font-bold mt-1 block">
                      MSP Reference: Rs 2,203/q • Mandi Avg: Rs 2,150/q
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Payment Terms
                    </label>
                    <div className="p-3 bg-[#F5F7F2] rounded-2xl border border-stone-200 text-xs font-semibold text-stone-700">
                      <p className="font-bold text-[#0F3D2E]">GramSetu Escrow Guarantee</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        T+1 direct bank transfer upon mill weighbridge confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Delivery Window Window
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] text-stone-500 font-semibold block mb-1">Start Date</span>
                      <input
                        type="date"
                        value={wizardData.deliveryWindowStart}
                        onChange={(e) => handleInputChange('deliveryWindowStart', e.target.value)}
                        className="w-full bg-[#F5F7F2] text-xs p-2.5 rounded-xl border border-stone-200 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-500 font-semibold block mb-1">End Date</span>
                      <input
                        type="date"
                        value={wizardData.deliveryWindowEnd}
                        onChange={(e) => handleInputChange('deliveryWindowEnd', e.target.value)}
                        className="w-full bg-[#F5F7F2] text-xs p-2.5 rounded-xl border border-stone-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Target Sourcing Radius */}
            {currentStep === 4 && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Select Procurement Radius
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[10, 25, 50, 100].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => handleInputChange('radiusKm', radius)}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          wizardData.radiusKm === radius
                            ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white shadow-xs'
                            : 'border-stone-200 bg-[#F5F7F2] text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <Target className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-base font-extrabold">{radius} km</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#E8F2EC] p-5 rounded-2xl border border-[#1F6B4A]/20">
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-[#1F6B4A]" />
                    <div>
                      <p className="text-sm font-extrabold text-[#0F3D2E]">
                        Estimated Reach: {wizardData.radiusKm === 10 ? '8 Villages (~120 Farmers)' : wizardData.radiusKm === 25 ? '18 Villages (~450 Farmers)' : wizardData.radiusKm === 50 ? '32 Villages (~1,100 Farmers)' : '58 Villages (~2,400 Farmers)'}
                      </p>
                      <p className="text-xs text-stone-600 mt-0.5">
                        High Sentinel-2 crop vigor index (&gt;0.70) detected in 74% of target geofence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Final Broadcast Summary */}
            {currentStep === 5 && (
              <div className="space-y-6 max-w-2xl">
                <div className="bg-[#F5F7F2] p-5 rounded-2xl border border-stone-200 space-y-3 text-xs">
                  <h4 className="font-extrabold text-sm text-[#0F3D2E] border-b border-stone-200 pb-2">
                    Review Broadcast Specification
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-stone-600">
                    <div>Commodity: <strong className="text-stone-800">{wizardData.crop} - {wizardData.variety}</strong></div>
                    <div>Quantity: <strong className="text-stone-800">{wizardData.quantityTonnes} Tonnes</strong></div>
                    <div>Max Rate: <strong className="text-[#059669]">Rs {wizardData.maxOfferPrice} / Quintal</strong></div>
                    <div>Target Radius: <strong className="text-stone-800">{wizardData.radiusKm} km</strong></div>
                    <div>Quality Specs: <strong className="text-stone-800">Moisture &lt;{wizardData.moisturePercent}%, Broken &lt;{wizardData.brokenGrainPercent}%</strong></div>
                    <div>Delivery Window: <strong className="text-stone-800">{wizardData.deliveryWindowStart} to {wizardData.deliveryWindowEnd}</strong></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBroadcast}
                  className="w-full py-4 rounded-2xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Broadcast Requirement to Village FPOs</span>
                </button>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-stone-100">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentStep === 1
                    ? 'text-stone-300 cursor-not-allowed'
                    : 'bg-[#F5F7F2] text-stone-700 hover:bg-stone-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                  className="flex items-center gap-1.5 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SECTION B: ACTIVE REQUIREMENTS TABLE                                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-[#0F3D2E]">
              Active Broadcast Requirements
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Live broadcasted procurements monitored by regional FPO secretaries.
            </p>
          </div>
          <span className="text-xs font-bold bg-[#F5F7F2] text-stone-600 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {requirements.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200/80">
                <th className="py-3.5 px-4">Requirement ID</th>
                <th className="py-3.5 px-4">Crop & Volume</th>
                <th className="py-3.5 px-4">Max Offer Rate</th>
                <th className="py-3.5 px-4">Villages Reached</th>
                <th className="py-3.5 px-4">FPO Responses</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-[#F5F7F2]/50 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#0F3D2E]">
                    {req.id}
                    <span className="block text-[10px] text-stone-400 font-normal">
                      Posted: {req.postedDate}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-stone-800">{req.crop}</span>
                    <span className="block text-[11px] text-stone-500 font-bold">
                      {req.volumeTonnes} Tonnes ({req.volumeTonnes * 10} q)
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-black text-[#059669] text-sm">
                      Rs {req.maxRate.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-stone-400">/ Quintal</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-stone-800">{req.villagesReached} Villages</span>
                    <span className="block text-[10px] text-stone-400">within {req.radiusKm} km</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block bg-[#E8F2EC] text-[#1F6B4A] font-extrabold px-2.5 py-1 rounded-full text-[11px]">
                      {req.responses} FPO Offers
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        req.status === 'Active Broadcast'
                          ? 'bg-[#E8F2EC] text-[#059669]'
                          : 'bg-amber-100 text-[#D97706]'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(req.id)}
                        title={req.status === 'Active Broadcast' ? 'Pause Broadcast' : 'Resume Broadcast'}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-[#0F3D2E] hover:bg-stone-100 transition-colors"
                      >
                        {req.status === 'Active Broadcast' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRequirement(req.id)}
                        title="Delete Requirement"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
