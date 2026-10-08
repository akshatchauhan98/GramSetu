import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import VoiceButton from "../../components/VoiceButton";
import KrishiSaathiVoice from "../../components/KrishiSaathiVoice";

export default function FarmerAdvisory() {
  const { language, t } = useLanguage();
  const [updated, setUpdated] = useState(false);

  const adviceText = updated ? t('advisory.newAdvice') : t('advisory.initialAdvice');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">{t('advisory.title')}</h1>
      </div>

      {/* Krishi Saathi Voice Assistant Component */}
      <KrishiSaathiVoice />

      {/* Advisory Output Card */}
      <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#5C6B63] uppercase tracking-wider">{t('advisory.context')}</p>
          <VoiceButton
            text={adviceText}
            language={language}
            label={language === 'hi' ? 'फिर सुनें' : 'Replay'}
            variant="secondary"
          />
        </div>

        <p className="mt-4 text-base leading-8 text-[#14201B] font-medium">{adviceText}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setUpdated(true)}
            className="rounded-full bg-[#0F3D2E] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95 shadow-xs"
          >
            {t('advisory.getNewAdvice')}
          </button>
          <Link
            to="/farmer/mills"
            className="rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0F3D2E] hover:bg-emerald-50 shadow-xs"
          >
            {t('advisory.viewMillsBtn')}
          </Link>
        </div>
      </section>

      <section className="rounded-3xl bg-emerald-50 p-5 text-sm font-medium text-[#0F3D2E] border border-emerald-200">
        {t('advisory.demoTag')}
      </section>
    </div>
  );
}