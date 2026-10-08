import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useUser } from "../../context/UserContext";
import { apiService } from "../../services/apiService";
import VoiceButton from "../../components/VoiceButton";
import {
  Building2,
  Factory,
  MapPin,
  Landmark,
  Handshake,
  Package,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  X,
  Wheat,
  Info,
  CheckCircle2
} from "lucide-react";

export default function NearbyMills() {
  const { language, t } = useLanguage();
  const { user } = useUser();

  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [selectedVariety, setSelectedVariety] = useState("Common");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [millData, setMillData] = useState(null);
  const [sentInterest, setSentInterest] = useState({});
  const [selectedMillModal, setSelectedMillModal] = useState(null);

  // Authenticated farmer location source of truth
  const village = user?.village || "";
  const district = user?.district || "";
  const state = user?.state || "Uttar Pradesh";

  const cropOptions = [
    { key: "Paddy", label: language === "hi" ? "धान (Paddy)" : "Paddy" },
    { key: "Wheat", label: language === "hi" ? "गेहूँ (Wheat)" : "Wheat" },
    { key: "Mustard", label: language === "hi" ? "सरसों (Mustard)" : "Mustard" },
    { key: "Maize", label: language === "hi" ? "मक्का (Maize)" : "Maize" },
    { key: "Gram", label: language === "hi" ? "चना (Gram)" : "Gram" }
  ];

  const varietyOptions = {
    Paddy: [
      { key: "Common", label: language === "hi" ? "सामान्य (Common)" : "Common" },
      { key: "Grade A", label: language === "hi" ? "ग्रेड ए (Grade A)" : "Grade A" }
    ],
    Wheat: [
      { key: "Common", label: language === "hi" ? "सामान्य (Common)" : "Common" },
      { key: "Lok-1", label: language === "hi" ? "लोक-1 (Lok-1)" : "Lok-1" },
      { key: "Sharbati", label: language === "hi" ? "शरबती (Sharbati)" : "Sharbati" }
    ],
    Mustard: [
      { key: "Common", label: language === "hi" ? "सामान्य (Common)" : "Common" }
    ],
    Maize: [
      { key: "Common", label: language === "hi" ? "सामान्य (Common)" : "Common" }
    ],
    Gram: [
      { key: "Common", label: language === "hi" ? "सामान्य (Common)" : "Common" }
    ]
  };

  const fetchNearbyMills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getNearbyMillsWithPrices({
        village,
        district,
        state,
        crop: selectedCrop,
        variety: selectedVariety
      });

      if (res && res.success) {
        setMillData(res);
      } else {
        setError(res?.error || (language === 'hi' ? 'डेटा लोड करने में विफल' : 'Failed to load mill data'));
      }
    } catch (err) {
      console.error("Error fetching nearby mills:", err);
      setError(err.message || (language === 'hi' ? 'सर्वर कनेक्शन त्रुटि' : 'Server connection error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyMills();
  }, [selectedCrop, selectedVariety, village, district, state]);

  // Handle crop change
  const handleCropChange = (cropKey) => {
    setSelectedCrop(cropKey);
    const varieties = varietyOptions[cropKey] || [{ key: "Common", label: "Common" }];
    setSelectedVariety(varieties[0].key);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ---------------------------------------------------------------- */}
      {/* 1. HEADER & LOCATION INFORMATION                                 */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#0F3D2E] to-[#175C46] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <Factory className="w-7 h-7 text-[#C5D86D]" />
              {language === "hi" ? "पास की प्रोसेसिंग मिल्स" : "Nearby Processing Mills"}
            </h1>
            <button
              onClick={fetchNearbyMills}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-700/60 hover:bg-emerald-700/80 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              {language === "hi" ? "रिफ्रेश करें" : "Refresh Data"}
            </button>
          </div>

          {/* Location Badge */}
          {village ? (
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-500/40 rounded-full px-4 py-1.5 text-sm text-emerald-100 font-medium">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                {language === "hi" ? `${village}, ${district || state} के पास` : `Near ${village}, ${district || state}`}
              </span>
            </div>
          ) : (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-3 text-amber-200 text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
                <span>
                  {language === "hi"
                    ? "पास की मिलों की सूची देखने के लिए कृपया अपनी प्रोफाइल में गाँव चुनें।"
                    : "Please select your village in Profile to see nearby mills."}
                </span>
              </div>
              <Link
                to="/farmer/profile"
                className="bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shrink-0 hover:bg-amber-300"
              >
                {language === "hi" ? "प्रोफाइल अपडेट करें" : "Update Profile"}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 2. CROP & VARIETY SELECTION SECTOR                                */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Wheat className="w-4 h-4 text-emerald-600" />
              {language === "hi" ? "फसल और किस्म चुनें" : "Select Crop & Variety"}
            </span>
            <div className="flex flex-wrap gap-2">
              {cropOptions.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleCropChange(c.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCrop === c.key
                      ? "bg-[#0F3D2E] text-white shadow-xs scale-[1.02]"
                      : "bg-emerald-50 text-[#0F3D2E] hover:bg-emerald-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variety Dropdown */}
          <div className="shrink-0 space-y-1">
            <label className="text-xs text-[#5C6B63] block font-medium">
              {language === "hi" ? "किस्म (Variety):" : "Variety:"}
            </label>
            <select
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
              className="bg-emerald-50/80 border border-emerald-200 text-[#0F3D2E] font-semibold text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(varietyOptions[selectedCrop] || [{ key: "Common", label: "Common" }]).map((v) => (
                <option key={v.key} value={v.key}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* 3. OFFICIAL MSP BENCHMARK BANNER                                  */}
      {/* ---------------------------------------------------------------- */}
      {millData?.msp && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-[#0F3D2E] rounded-xl shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#5C6B63] font-medium uppercase tracking-wide">
                {language === "hi" ? "भारत सरकार द्वारा घोषित एमएसपी (MSP)" : "Official Government MSP"} ({millData.msp.marketingSeason || '2026-27'})
              </p>
              <p className="text-xl font-extrabold text-[#0F3D2E]">
                ₹{millData.msp.price?.toLocaleString('en-IN')}{" "}
                <span className="text-xs font-normal text-[#5C6B63]">/ {language === "hi" ? "क्विंटल" : "quintal"}</span>
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-[#5C6B63]">
            <p className="font-semibold text-emerald-800">{millData.msp.source || "Government of India / PIB"}</p>
            <p>{language === "hi" ? "आधिकारिक न्यूनतम समर्थन मूल्य" : "Minimum Support Price"}</p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 4. MILL CARDS DISPLAY SECTORS                                     */}
      {/* ---------------------------------------------------------------- */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 space-y-3">
          <Loader2 className="w-8 h-8 text-[#0F3D2E] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#5C6B63]">
            {language === "hi" ? "पास की मिलों एवं रेट्स की जानकारी लोड हो रही है..." : "Loading nearby mills and current prices..."}
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center text-red-700 space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchNearbyMills}
            className="bg-red-600 text-white font-semibold text-xs px-4 py-2 rounded-full hover:bg-red-700"
          >
            {language === "hi" ? "पुनः प्रयास करें" : "Try Again"}
          </button>
        </div>
      ) : !millData?.mills || millData.mills.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-emerald-100 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-[#0F3D2E]">
            {language === "hi" ? "कोई पास की मिल नहीं मिली" : "No Nearby Mills Found"}
          </h3>
          <p className="text-sm text-[#5C6B63]">
            {language === "hi"
              ? `गाँव ${village || district} के पास अभी कोई पंजीकृत मिल उपलब्ध नहीं है।`
              : `No registered mills found near ${village || district || 'your location'}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {millData.mills.map((m) => {
            const hasOffer = m.offerPrice !== null && m.offerPrice !== undefined;
            const mspPrice = millData?.msp?.price || 0;
            const diff = hasOffer ? m.offerPrice - mspPrice : null;

            // Spoken text for VoiceButton
            const spokenText =
              language === "hi"
                ? `${m.name}, ${m.district}। ${
                    m.distanceKm !== null
                      ? `दूरी ${m.distanceKm} किलोमीटर है।`
                      : "दूरी उपलब्ध नहीं है।"
                  } भारत सरकार का एमएसपी ${mspPrice} रुपये प्रति क्विंटल है। ${
                    hasOffer
                      ? `वर्तमान मिल ऑफर ${m.offerPrice} रुपये प्रति क्विंटल है। एमएसपी से अंतर ${
                          diff >= 0 ? `प्लस ${diff}` : `माइनस ${Math.abs(diff)}`
                        } रुपये है।`
                      : "आज कोई सक्रिय मिल ऑफर उपलब्ध नहीं है।"
                  }`
                : `${m.name} in ${m.district}. ${
                    m.distanceKm !== null
                      ? `Distance is ${m.distanceKm} kilometers.`
                      : "Distance is unavailable."
                  } Government MSP is ${mspPrice} rupees per quintal. ${
                    hasOffer
                      ? `Current mill offer is ${m.offerPrice} rupees per quintal. Difference from MSP is ${
                          diff >= 0 ? `+${diff}` : `-${Math.abs(diff)}`
                        } rupees.`
                      : "No active mill offer submitted today."
                  }`;

            return (
              <div
                key={m.millId}
                className="bg-white rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Mill Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-50 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-[#0F3D2E]">{m.name}</h2>
                      {m.verificationSource && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {m.verificationSource}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-[#5C6B63]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        {m.distanceKm !== null ? (
                          <span>
                            <strong className="text-slate-900 font-bold">{m.distanceKm} km away</strong> • {m.district}, {m.state}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            {language === "hi" ? "दूरी उपलब्ध नहीं" : "Distance unavailable"} • {m.district}, {m.state}
                          </span>
                        )}
                      </span>

                      {m.locationVerified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {language === "hi" ? "लोकेशन सत्यापित" : "Location verified"}
                        </span>
                      )}

                      <span className="text-slate-300">•</span>

                      <span className="flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5 text-emerald-600 inline" />
                        {selectedCrop} — {selectedVariety}
                      </span>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="shrink-0">
                    {m.offerStatus === "active" ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100/80 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {language === "hi" ? "आज सक्रिय (Active Today)" : "Active Today"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        {language === "hi" ? "कोई सक्रिय ऑफर नहीं" : "No Active Offer"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Comparison Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Government MSP */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-slate-500" /> {language === "hi" ? "सरकारी MSP" : "Government MSP"}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{mspPrice?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {language === "hi" ? "न्यूनतम समर्थन मूल्य" : "Official MSP"}
                    </p>
                  </div>

                  {/* 2. Current Mill Offer */}
                  <div className={`rounded-2xl p-3.5 border space-y-1 ${
                    hasOffer ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/60 border-amber-200"
                  }`}>
                    <div className="flex items-center justify-between text-xs text-[#5C6B63] font-medium">
                      <span className="flex items-center gap-1"><Handshake className="w-3.5 h-3.5 text-emerald-600" /> {language === "hi" ? "वर्तमान मिल ऑफर" : "Current Mill Offer"}</span>
                    </div>
                    {hasOffer ? (
                      <div>
                        <p className="text-lg font-bold text-[#0F3D2E]">
                          ₹{m.offerPrice?.toLocaleString('en-IN')}{" "}
                          <span className="text-xs font-normal text-emerald-700">/ {language === "hi" ? "क्विंटल" : "quintal"}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {language === "hi" ? "मिल द्वारा प्रस्तुत ऑफर" : "Mill submitted offer"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-base font-bold text-amber-900">
                          {language === "hi" ? "उपलब्ध नहीं" : "Unavailable"}
                        </p>
                        <p className="text-[11px] text-amber-700">
                          {language === "hi" ? "आज कोई सक्रिय ऑफर प्रस्तुत नहीं है।" : "No active mill offer submitted today."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3. Difference from MSP */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-slate-500" /> {language === "hi" ? "MSP से अंतर" : "Difference from MSP"}</span>
                    </div>
                    {hasOffer && diff !== null ? (
                      <div>
                        <p className={`text-lg font-bold flex items-center gap-1 ${
                          diff > 0 ? "text-emerald-700" : diff < 0 ? "text-amber-700" : "text-slate-700"
                        }`}>
                          {diff > 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-600 inline" />
                          ) : diff < 0 ? (
                            <TrendingDown className="w-4 h-4 text-amber-600 inline" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-500 inline" />
                          )}
                          {diff > 0 ? `+₹${diff}` : diff < 0 ? `-₹${Math.abs(diff)}` : `₹0`}
                          <span className="text-xs font-normal text-slate-500"> / q</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {language === "hi" ? "वास्तविक गणितीय अंतर" : "Factual price difference"}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-base font-semibold text-slate-400">N/A</p>
                        <p className="text-[11px] text-slate-400">
                          {language === "hi" ? "ऑफर अनुपलब्ध" : "Offer unavailable"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4. Mill Requirement */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-slate-500" /> {language === "hi" ? "खरीद आवश्यकता" : "Requirement"}</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {m.requirementMT !== null ? (
                        <span>{m.requirementMT} <span className="text-xs font-normal text-slate-500">{language === "hi" ? "टन" : "MT"}</span></span>
                      ) : (
                        <span className="text-sm font-normal text-slate-500 italic">
                          {language === "hi" ? "उपलब्ध नहीं" : "Not provided"}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {language === "hi" ? "कुल मांग क्षमता" : "Quantity needed"}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-50 pt-3">
                  <VoiceButton
                    text={spokenText}
                    language={language}
                    label={language === "hi" ? "मिल रेट सुनें" : "Listen Rate"}
                    variant="secondary"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMillModal(m)}
                      className="rounded-full bg-emerald-50 text-[#0F3D2E] hover:bg-emerald-100 px-4 py-2 text-xs font-semibold border border-emerald-200 transition-colors flex items-center gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5" />
                      {language === "hi" ? "मिल विवरण देखें" : "View Mill Details"}
                    </button>

                    <button
                      onClick={() => setSentInterest((s) => ({ ...s, [m.millId]: true }))}
                      className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs ${
                        sentInterest[m.millId]
                          ? "bg-emerald-700 text-white flex items-center gap-1"
                          : "bg-[#0F3D2E] text-white hover:bg-[#175C46]"
                      }`}
                    >
                      {sentInterest[m.millId] ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 inline text-emerald-200" />
                          <span>{language === "hi" ? "रुचि भेज दी गई" : "Interest Sent"}</span>
                        </>
                      ) : (
                        language === "hi" ? "सीधी रुचि भेजें" : "Send Direct Interest"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* 5. MILL DETAILS / CONTACT MODAL                                   */}
      {/* ---------------------------------------------------------------- */}
      {selectedMillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  {selectedMillModal.name}
                </h3>
                <p className="text-xs text-[#5C6B63] mt-0.5">
                  {selectedMillModal.district}, {selectedMillModal.state}
                </p>
              </div>
              <button
                onClick={() => setSelectedMillModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-[#0F3D2E] font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === "hi" ? "पता / स्थान:" : "Address / Location:"}</span>
                </div>
                <p className="text-slate-700 pl-6 text-xs">
                  {selectedMillModal.address || `${selectedMillModal.village || selectedMillModal.district}, ${selectedMillModal.district}, ${selectedMillModal.state}`}
                </p>
              </div>

              {selectedMillModal.phone && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2 text-slate-600 text-xs">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    {language === "hi" ? "फोन नंबर:" : "Phone:"}
                  </span>
                  <a
                    href={`tel:${selectedMillModal.phone}`}
                    className="font-bold text-[#0F3D2E] hover:underline text-sm"
                  >
                    {selectedMillModal.phone}
                  </a>
                </div>
              )}

              {selectedMillModal.email && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="flex items-center gap-2 text-slate-600 text-xs">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    {language === "hi" ? "ईमेल आईडी:" : "Email:"}
                  </span>
                  <a
                    href={`mailto:${selectedMillModal.email}`}
                    className="font-bold text-[#0F3D2E] hover:underline text-xs"
                  >
                    {selectedMillModal.email}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="flex items-center gap-2 text-slate-600 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {language === "hi" ? "डेटा स्रोत / सत्यापन:" : "Source / Verification:"}
                </span>
                <span className="font-semibold text-xs text-emerald-800">
                  {selectedMillModal.verificationSource || "Existing GramSetu Mill Master"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedMillModal(null)}
                className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                {language === "hi" ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}