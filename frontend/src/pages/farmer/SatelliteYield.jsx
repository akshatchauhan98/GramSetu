import { Satellite } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useUser } from "../../context/UserContext";
import VoiceButton from "../../components/VoiceButton";
import { numberToHindiWords, numberToEnglishWords } from "../../utils/numberToSpokenWords";

export default function SatelliteYield() {
  const { language, t } = useLanguage();
  const { user } = useUser();
  const villageName = user?.village || (language === 'hi' ? 'आपकी लोकेशन' : 'your location');
  const hasSatelliteData = ['rampur', 'sitapur', 'kalyanpur'].includes((user?.village || '').toLowerCase());

  const readings = [
    { date: "12 Aug", ndvi: 0.61 },
    { date: "27 Aug", ndvi: 0.68 },
    { date: "08 Sep", ndvi: 0.72 },
    { date: "18 Sep", ndvi: 0.74 },
  ];

  // Technically accurate spoken text
  const spokenText = hasSatelliteData
    ? (language === 'hi'
        ? `${villageName} गांव में satellite-based crop health index 0.74 है। हमारे अनुमान के अनुसार संभावित supply ${numberToHindiWords(480)} टन है।`
        : `${villageName} village has a satellite-based crop health index of 0.74. The estimated potential supply is ${numberToEnglishWords(480)} tonnes.`)
    : (language === 'hi'
        ? `${villageName} के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है।`
        : `Current satellite-based crop health data is not available for ${villageName}.`);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">{t('satellite.title')}</h1>
        <VoiceButton
          text={spokenText}
          language={language}
          label={language === 'hi' ? 'सैटेलाइट रिपोर्ट सुनें' : 'Listen Report'}
          variant="primary"
        />
      </div>

      {!hasSatelliteData ? (
        <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm text-amber-900 space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-base text-amber-900">
            <Satellite className="h-5 w-5 text-amber-700" />
            <h2>{language === 'hi' ? 'उपग्रह डेटा सूचना (Satellite Notice)' : 'Satellite Data Notice'}</h2>
          </div>
          <p className="text-sm leading-relaxed">
            {language === 'hi'
              ? `${villageName} के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है। केवल उपलब्ध जानकारी के आधार पर आपकी फसल की स्थिति का विश्वसनीय आकलन नहीं किया जा सकता।`
              : `Current satellite-based crop health data is not available for ${villageName}. Reliability of crop status cannot be determined without active high-resolution pass data.`}
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5C6B63]">{t('satellite.ndviScore')}</p>
              <VoiceButton
                text={spokenText}
                language={language}
                label={language === 'hi' ? 'सुनें' : 'Listen'}
                variant="secondary"
              />
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-3">
              <div className="text-5xl font-bold text-emerald-700">0.74</div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                {t('satellite.goodCropLabel')}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F5F7F2] p-4 border border-[#0F3D2E]/5">
                <p className="text-xs text-[#5C6B63]">{t('satellite.estYield')}</p>
                <p className="mt-1 text-xl font-bold text-[#0F3D2E]">{t('satellite.estYieldVal')}</p>
              </div>
              <div className="rounded-2xl bg-[#F5F7F2] p-4 border border-[#0F3D2E]/5">
                <p className="text-xs text-[#5C6B63]">{t('satellite.area')}</p>
                <p className="mt-1 text-xl font-bold text-[#0F3D2E]">{t('satellite.areaVal')}</p>
              </div>
              <div className="rounded-2xl bg-[#F5F7F2] p-4 border border-[#0F3D2E]/5">
                <p className="text-xs text-[#5C6B63]">{t('satellite.window')}</p>
                <p className="mt-1 text-xl font-bold text-[#0F3D2E]">{t('satellite.windowVal')}</p>
              </div>
            </div>

            <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-[#0F3D2E] border border-emerald-200">
              {t('satellite.summary')}
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-[#0F3D2E]">{t('satellite.pastReadings')}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {readings.map((r) => (
                <div key={r.date} className="rounded-2xl bg-[#F5F7F2] p-4 text-center">
                  <p className="text-xs text-[#5C6B63]">{r.date}</p>
                  <p className="mt-1 text-lg font-bold text-[#0F3D2E]">{r.ndvi}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}