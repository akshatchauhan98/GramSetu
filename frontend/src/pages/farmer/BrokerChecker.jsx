import { Landmark, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { apiService } from "../../services/apiService";
import VoiceButton from "../../components/VoiceButton";
import { numberToHindiWords, numberToEnglishWords } from "../../utils/numberToSpokenWords";

export default function BrokerChecker() {
  const { language, t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [mspPrice, setMspPrice] = useState(2441);
  const [brokerPrice, setBrokerPrice] = useState(2000);
  const [qty, setQty] = useState(50);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function fetchMsp() {
      try {
        const res = await apiService.getMSPByCrop(selectedCrop);
        if (res && res.success && res.data && res.data.length > 0) {
          setMspPrice(res.data[0].mspPerQuintal);
        }
      } catch {
        // Maintain last known or fallback to official paddy 2441
        setMspPrice(selectedCrop === "Wheat" ? 2585 : 2441);
      }
    }
    fetchMsp();
  }, [selectedCrop]);

  const result = useMemo(() => {
    const gap = mspPrice - Number(brokerPrice || 0);
    const loss = gap * Number(qty || 0);
    let level = "fair";
    let title = language === "hi" ? "उचित सरकारी ऑफ़र" : "Fair Govt Offer";
    let color = "bg-emerald-50 border-emerald-200 text-emerald-900";

    if (gap > 300) {
      level = "high";
      title = t('brokerChecker.highExploit');
      color = "bg-red-50 border-red-200 text-red-800";
    } else if (gap > 100) {
      level = "medium";
      title = t('brokerChecker.mediumWarning');
      color = "bg-amber-50 border-amber-200 text-amber-900";
    } else if (gap > 0) {
      level = "low";
      title = t('brokerChecker.lowWarning');
      color = "bg-orange-50 border-orange-200 text-orange-900";
    }

    let spokenText = "";
    if (language === "hi") {
      if (gap > 0) {
        spokenText = `सावधान। आपको ${numberToHindiWords(
          brokerPrice
        )} रुपये प्रति क्विंटल का भाव दिया गया है। यह सरकारी एमएसपी से ${numberToHindiWords(
          gap
        )} रुपये कम है। ${numberToHindiWords(
          qty
        )} क्विंटल पर आपका अनुमानित नुकसान ${numberToHindiWords(
          loss
        )} रुपये हो सकता है।`;
      } else {
        spokenText = `यह ऑफ़र एमएसपी के अनुकूल है। आपको ${numberToHindiWords(
          brokerPrice
        )} रुपये प्रति क्विंटल का भाव मिल रहा है।`;
      }
    } else {
      if (gap > 0) {
        spokenText = `Warning. You have been offered ${numberToEnglishWords(
          brokerPrice
        )} rupees per quintal. This is ${numberToEnglishWords(
          gap
        )} rupees below the Govt MSP. For ${numberToEnglishWords(
          qty
        )} quintals, your estimated gap could be ${numberToEnglishWords(
          loss
        )} rupees.`;
      } else {
        spokenText = `This offer aligns with Govt MSP. You have been offered ${numberToEnglishWords(
          brokerPrice
        )} rupees per quintal.`;
      }
    }

    return { gap, loss, level, title, color, spokenText };
  }, [brokerPrice, qty, mspPrice, language, t]);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3D2E]">{t('brokerChecker.title')}</h1>
        <p className="mt-1 text-sm text-[#5C6B63]">{t('brokerChecker.subtitle')}</p>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        {/* Crop Selection */}
        <div>
          <label className="block text-sm font-medium text-[#0F3D2E] mb-2">
            {language === 'hi' ? 'फसल चुनें (Crop)' : 'Select Crop'}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedCrop('Paddy')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCrop === 'Paddy' ? 'bg-[#0F3D2E] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
               धान (Paddy)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCrop('Wheat')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                selectedCrop === 'Wheat' ? 'bg-[#0F3D2E] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
               गेहूँ (Wheat)
            </button>
          </div>
        </div>

        <label className="block text-sm font-medium text-[#0F3D2E]">
          {t('brokerChecker.brokerInputLabel')}
          <input
            type="number"
            value={brokerPrice}
            onChange={(e) => setBrokerPrice(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-4 py-3 outline-none focus:border-emerald-300"
          />
        </label>

        <label className="block text-sm font-medium text-[#0F3D2E]">
          {t('brokerChecker.qtyInputLabel')}
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-4 py-3 outline-none focus:border-emerald-300"
          />
        </label>

        <button
          onClick={() => setChecked(true)}
          className="w-full rounded-full bg-[#0F3D2E] px-5 py-3 font-semibold text-white hover:opacity-95"
        >
          {t('brokerChecker.checkButton')}
        </button>
      </div>

      {checked && (
        <div className={`rounded-3xl border p-6 ${result.color}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{result.title}</h2>
            <VoiceButton
              text={result.spokenText}
              language={language}
              label={language === 'hi' ? 'चेतावनी सुनें' : 'Listen Alert'}
              variant={result.gap > 0 ? 'badge' : 'primary'}
            />
          </div>

          <div className="mt-3 text-sm space-y-1">
            <p className="flex items-center gap-1.5">
              <Landmark size={14} />
              <span>{language === 'hi' ? 'सरकारी न्यूनतम समर्थन मूल्य (MSP):' : 'Government MSP:'} <b>₹{mspPrice} / क्विंटल</b></span>
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <TrendingUp size={14} />
              <span>{language === 'hi' ? 'मंडी भाव:' : 'Mandi Price:'} <span className="italic">{language === 'hi' ? 'मंडी भाव उपलब्ध नहीं है' : 'Mandi price unavailable'}</span></span>
            </p>
          </div>

          <p className="mt-2 text-sm">
            {language === 'hi' ? 'एमएसपी से अंतर:' : 'Gap from MSP:'} <b>₹{result.gap}</b> / quintal
          </p>
          <p className="mt-3 text-lg font-semibold">
            {t('brokerChecker.lossLabel')} ₹{result.loss.toLocaleString("en-IN")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/farmer/mills" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0F3D2E] border border-emerald-200 shadow-xs">
              {t('brokerChecker.viewMills')}
            </Link>
            <Link to="/farmer/advisory" className="rounded-full bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white shadow-xs">
              {t('brokerChecker.getAdvice')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}