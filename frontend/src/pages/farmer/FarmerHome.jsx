import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  ShieldAlert,
  Satellite,
  Factory,
  MessageCircle,
} from 'lucide-react'

import { useLanguage } from '../../context/LanguageContext'
import { useUser } from '../../context/UserContext'

import KrishiSaathiVoice from '../../components/KrishiSaathiVoice'
import FarmerWelcomeVoice from '../../components/FarmerWelcomeVoice'
import MspCard from '../../components/MspCard'

export default function FarmerHome() {
  const { language, t } = useLanguage()
  const { user } = useUser()

  const [selectedCrop, setSelectedCrop] = useState('Paddy')

  // ------------------------------------------------------------
  // AUTHENTICATED FARMER INFORMATION
  // ------------------------------------------------------------

  const farmerName =
    user?.name ||
    (language === 'hi' ? 'किसान' : 'Farmer')

  const villageName =
    user?.village ||
    (language === 'hi' ? 'उपलब्ध नहीं' : 'Not Available')

  // ------------------------------------------------------------
  // CROP OPTIONS
  // ------------------------------------------------------------

  const cropOptions = [
    {
      key: 'Paddy',
      label: language === 'hi' ? 'धान (Paddy)' : 'Paddy',
    },
    {
      key: 'Wheat',
      label: language === 'hi' ? 'गेहूँ (Wheat)' : 'Wheat',
    },
    {
      key: 'Mustard',
      label: language === 'hi' ? 'सरसों (Mustard)' : 'Mustard',
    },
    {
      key: 'Maize',
      label: language === 'hi' ? 'मक्का (Maize)' : 'Maize',
    },
    {
      key: 'Gram',
      label: language === 'hi' ? 'चना (Gram)' : 'Gram',
    },
    {
      key: 'Cotton',
      label: language === 'hi' ? 'कपास (Cotton)' : 'Cotton',
    },
  ]

  // ------------------------------------------------------------
  // FARMER ACTIONS
  // ------------------------------------------------------------

  const actions = [
    {
      to: '/farmer/broker',
      icon: ShieldAlert,
      title: t('farmerHome.actions.brokerTitle'),
      hint: t('farmerHome.actions.brokerHint'),
    },
    {
      to: '/farmer/satellite',
      icon: Satellite,
      title: t('farmerHome.actions.satelliteTitle'),
      hint: t('farmerHome.actions.satelliteHint'),
    },
    {
      to: '/farmer/mills',
      icon: Factory,
      title: t('farmerHome.actions.millsTitle'),
      hint: t('farmerHome.actions.millsHint'),
    },
    {
      to: '/farmer/advisory',
      icon: MessageCircle,
      title: t('farmerHome.actions.advisoryTitle'),
      hint: t('farmerHome.actions.advisoryHint'),
    },
  ]

  return (
    <div className="space-y-6">

      {/* --------------------------------------------------------
          AUTOMATIC FARMER WELCOME VOICE
      --------------------------------------------------------- */}

      <FarmerWelcomeVoice />

      {/* --------------------------------------------------------
          FARMER HEADER
      --------------------------------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F3D2E] md:text-3xl">
            {language === 'hi'
              ? user?.name
                ? `नमस्ते, ${farmerName} जी`
                : 'नमस्ते, किसान जी'
              : user?.name
                ? `Namaste, ${farmerName}`
                : 'Namaste, Farmer'}
          </h1>

          <span className="mt-2 inline-flex rounded-full bg-[#E8F2EC] px-3 py-1 text-sm font-medium text-[#1F6B4A]">
            {language === 'hi'
              ? `गाँव: ${villageName}`
              : `Village: ${villageName}`}
          </span>
        </div>

        {/* ------------------------------------------------------
            CROP SELECTION
        ------------------------------------------------------- */}

        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-[#0F3D2E]/10 bg-white p-1.5 shadow-lg shadow-[#0F3D2E]/5">

          {cropOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedCrop(opt.key)}
              className={[
                'rounded-xl px-4 py-2 text-xs font-semibold transition-colors',
                selectedCrop.toLowerCase() === opt.key.toLowerCase()
                  ? 'bg-[#0F3D2E] text-white shadow-sm'
                  : 'text-[#5C6B63] hover:bg-[#E8F2EC] hover:text-[#0F3D2E]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}

        </div>
      </div>

      {/* --------------------------------------------------------
          KRISHI SAATHI
      --------------------------------------------------------- */}

      <KrishiSaathiVoice />

      {/* --------------------------------------------------------
          OFFICIAL MSP CARD
      --------------------------------------------------------- */}

      <MspCard cropName={selectedCrop} />

      {/* --------------------------------------------------------
          ACTION CARDS
      --------------------------------------------------------- */}

      <div className="grid grid-cols-2 gap-3 md:gap-4">

        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.to}
              to={action.to}
              className="rounded-3xl border border-[#0F3D2E]/8 bg-white p-5 shadow-lg shadow-[#0F3D2E]/6 transition hover:-translate-y-0.5 hover:shadow-xl"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F2EC] text-[#1F6B4A]">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              <p className="mt-3 text-base font-semibold text-[#0F3D2E] md:text-lg">
                {action.title}
              </p>

              <p className="mt-1 text-sm text-[#5C6B63]">
                {action.hint}
              </p>

            </Link>
          )
        })}

      </div>

      {/* --------------------------------------------------------
          BOTTOM SUMMARY
      --------------------------------------------------------- */}

      <div className="grid gap-3 rounded-3xl bg-[#163D32] p-5 text-white shadow-xl md:grid-cols-3 md:p-6">

        {/* Satellite / NDVI */}

        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">
            {t('farmerHome.stats.ndvi')}
          </p>

          <p className="mt-1 text-2xl font-semibold">
            <span className="text-sm font-medium text-white/80">
              {language === 'hi'
                ? 'डेटा उपलब्ध नहीं'
                : 'Data unavailable'}
            </span>
          </p>
        </div>

        {/* Mills */}

        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">
            {language === 'hi' ? 'मिल्स' : 'Mills'}
          </p>

          <p className="mt-1 text-xl font-semibold">
            {t('farmerHome.stats.mills')}
          </p>
        </div>

        {/* Advice */}

        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">
            {language === 'hi' ? 'सलाह' : 'Advice'}
          </p>

          <p className="mt-1 text-xl font-semibold text-[#C5D86D]">
            {t('farmerHome.stats.advice')}
          </p>
        </div>

      </div>

    </div>
  )
}