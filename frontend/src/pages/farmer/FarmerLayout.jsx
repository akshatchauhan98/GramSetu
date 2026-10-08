import {
  Factory,
  Globe,
  Home,
  MessageCircle,
  Satellite,
  ShieldAlert,
  User,
  Volume2,
  VolumeX,
  Wheat,
} from 'lucide-react'

import { Link, NavLink, Outlet } from 'react-router-dom'

import { useLanguage } from '../../context/LanguageContext'
import { useUser } from '../../context/UserContext'

import ProfileDropdown from '../../components/ProfileDropdown'

function navClass({ isActive }) {
  return [
    'whitespace-nowrap text-sm font-medium transition-colors',
    isActive
      ? 'font-bold text-[#0F3D2E]'
      : 'text-[#5C6B63] hover:text-[#0F3D2E]',
  ].join(' ')
}

function bottomClass({ isActive }) {
  return [
    'flex flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium',
    isActive
      ? 'font-bold text-[#0F3D2E]'
      : 'text-[#5C6B63]',
  ].join(' ')
}

export default function FarmerLayout() {
  const { language, setLanguage, t } = useLanguage()
  const { user, toggleVoice } = useUser()

  const navLinks = [
    {
      to: '/farmer',
      label: t('nav.home'),
      icon: Home,
      end: true,
    },
    {
      to: '/farmer/broker',
      label: t('nav.broker'),
      icon: ShieldAlert,
    },
    {
      to: '/farmer/satellite',
      label: t('nav.satellite'),
      icon: Satellite,
    },
    {
      to: '/farmer/mills',
      label: t('nav.mills'),
      icon: Factory,
    },
    {
      to: '/farmer/advisory',
      label: t('nav.advisory'),
      icon: MessageCircle,
    },
    {
      to: '/farmer/profile',
      label: t('nav.profile'),
      icon: User,
    },
  ]

  return (
    <div className="relative isolate min-h-svh bg-[#F5F7F2] text-[#14201B]">

      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-top bg-no-repeat opacity-[0.14] transition-opacity duration-500"
        style={{
          backgroundImage: "url('/farmer-bg.jpg')",
        }}
        aria-hidden="true"
      />

      {/* Natural cream overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(245,247,242,0.45)_0%,rgba(245,247,242,0.85)_70%,rgba(245,247,242,0.95)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="sticky top-0 z-40 border-b border-[#0F3D2E]/8 bg-[#F5F7F2]/90 backdrop-blur-md">

          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">

            {/* GramSetu Farmer Brand */}

            <Link
              to="/farmer"
              className="flex shrink-0 items-center gap-2"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F2EC] text-[#1F6B4A]">
                <Wheat
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </span>

              <span className="leading-tight">
                <span className="block text-sm font-semibold tracking-tight text-[#0F3D2E]">
                  {t('common.farmerPortalTitle')}
                </span>

                <span className="text-[11px] text-[#5C6B63]">
                  {t('common.farmerPortalSub')}
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}

            <nav className="hidden items-center gap-5 lg:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={navClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Header Controls */}

            <div className="flex items-center gap-2 sm:gap-3">

              {/* Voice Toggle */}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    if (typeof toggleVoice === 'function') {
                      toggleVoice()
                    }
                  }}
                  title="Toggle Voice Assistance"
                  aria-label="Toggle Voice Assistance"
                  className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition sm:flex ${
                    user.voiceEnabled !== false
                      ? 'border-[#1F6B4A]/30 bg-[#E8F2EC] text-[#0F3D2E]'
                      : 'border-gray-200 bg-gray-100 text-gray-400'
                  }`}
                >
                  {user.voiceEnabled !== false ? (
                    <Volume2
                      size={13}
                      className="text-[#1F6B4A]"
                      aria-hidden="true"
                    />
                  ) : (
                    <VolumeX
                      size={13}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {user.voiceEnabled !== false
                      ? 'Voice ON'
                      : 'Voice OFF'}
                  </span>
                </button>
              )}

              {/* Language Switcher */}

              <div className="flex items-center rounded-full border border-[#0F3D2E]/20 bg-white p-0.5 text-xs font-semibold shadow-sm">

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                    language === 'en'
                      ? 'bg-[#0F3D2E] text-white shadow-sm'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                  aria-label="Switch to English"
                >
                  <Globe
                    size={12}
                    aria-hidden="true"
                  />
                  <span>EN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    language === 'hi'
                      ? 'bg-[#0F3D2E] text-white shadow-sm'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                  aria-label="Switch to Hindi"
                >
                  <span>हिंदी</span>
                </button>

              </div>

              {/* Profile */}

              <ProfileDropdown />

              {/* Website */}

              <Link
                to="/"
                className="hidden text-xs font-medium text-[#1F6B4A] hover:underline md:inline-block"
              >
                {t('common.website')}
              </Link>

            </div>
          </div>
        </header>

        {/* =====================================================
            FARMER PAGE CONTENT
        ====================================================== */}

        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-10">
          <Outlet />
        </main>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#0F3D2E]/10 bg-white/95 px-2 py-2 backdrop-blur-sm lg:hidden">

          <div className="mx-auto flex max-w-lg items-center justify-between">

            {navLinks.map((link) => {
              const Icon = link.icon

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={bottomClass}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>{link.label}</span>
                </NavLink>
              )
            })}

          </div>
        </nav>

      </div>
    </div>
  )
}