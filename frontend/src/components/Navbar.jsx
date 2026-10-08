import { Menu, X, Globe, Wheat, Factory, Landmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import ProfileDropdown from './ProfileDropdown'

const links = [
  { href: '/', label: 'Home' },
  { href: '/#farmers', label: 'For Farmers' },
  { href: '/#mills', label: 'For Mills' },
  { href: '/#impact', label: 'Impact' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { language, setLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const onHero = pathname === '/' && !scrolled
  const solid = !onHero

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={[
        'fixed top-0 z-50 w-full px-8 py-4 transition-colors duration-300 md:px-16',
        solid ? 'bg-[#F5F7F2]/95 shadow-lg shadow-[#0F3D2E]/5 backdrop-blur-sm' : 'bg-transparent',
      ].join(' ')}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full text-lg',
              solid ? 'bg-[#E8F2EC] text-[#1F6B4A]' : 'bg-white/15 text-white',
            ].join(' ')}
            aria-hidden="true"
          >
            <Wheat className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span
              className={[
                'text-lg font-semibold tracking-tight',
                solid ? 'text-[#0F3D2E]' : 'text-white',
              ].join(' ')}
            >
              GramSetu
            </span>
            <span className={['text-[11px]', solid ? 'text-[#5C6B63]' : 'text-white/75'].join(' ')}>
              (ग्रामसेतु)
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={[
                'text-sm font-medium transition-opacity hover:opacity-70',
                solid ? 'text-[#14201B]' : 'text-white',
              ].join(' ')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Language Switcher */}
          <div
            className={[
              'flex items-center rounded-full p-0.5 text-xs font-semibold backdrop-blur-sm',
              solid
                ? 'border border-[#0F3D2E]/20 bg-white'
                : 'border border-white/30 bg-white/10 text-white',
            ].join(' ')}
          >
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                language === 'en'
                  ? solid
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'bg-white text-[#0F3D2E]'
                  : solid
                  ? 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Globe size={12} />
              <span>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                language === 'hi'
                  ? solid
                    ? 'bg-[#0F3D2E] text-white shadow-xs'
                    : 'bg-white text-[#0F3D2E]'
                  : solid
                  ? 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span>हिंदी</span>
            </button>
          </div>

          {/* Profile Dropdown */}
          <ProfileDropdown />

          <Link
            to="/farmer"
            className={[
              'flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase',
              solid ? 'bg-[#0F3D2E] text-white' : 'bg-[#F5F7F2] text-[#0F3D2E]',
            ].join(' ')}
          >
            <Wheat className="h-3.5 w-3.5" />
            <span>Farmer Portal</span>
          </Link>

          <Link
            to="/mill"
            className={[
              'flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase',
              solid
                ? 'border border-emerald-200 bg-white text-[#0F3D2E] hover:bg-emerald-50'
                : 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
            ].join(' ')}
          >
            <Factory className="h-3.5 w-3.5" />
            <span>Mill Portal</span>
          </Link>

          <Link
            to="/gov"
            className={[
              'flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em] uppercase',
              solid
                ? 'border border-emerald-200 bg-white text-[#0F3D2E] hover:bg-emerald-50'
                : 'border border-white/30 bg-white/10 text-white hover:bg-white/20',
            ].join(' ')}
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>Gov Portal</span>
          </Link>
        </div>

        <button
          type="button"
          className={[
            'rounded-full p-2 lg:hidden',
            solid ? 'text-[#0F3D2E]' : 'text-white',
          ].join(' ')}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="mt-4 rounded-3xl bg-[#F5F7F2] p-5 shadow-xl lg:hidden">
          <div className="flex flex-col gap-3">
            {/* Mobile Language Toggle */}
            <div className="flex items-center justify-between border-b border-[#0F3D2E]/10 pb-3">
              <span className="text-xs font-semibold text-[#5C6B63] uppercase">Language / भाषा</span>
              <div className="flex items-center rounded-full border border-[#0F3D2E]/20 bg-white p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    language === 'en' ? 'bg-[#0F3D2E] text-white' : 'text-[#5C6B63]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    language === 'hi' ? 'bg-[#0F3D2E] text-white' : 'text-[#5C6B63]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#14201B]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/farmer"
              className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#0F3D2E] px-5 py-3 text-center text-xs font-semibold tracking-[0.08em] text-white uppercase"
              onClick={() => setOpen(false)}
            >
              <Wheat className="h-4 w-4" />
              <span>Farmer Portal</span>
            </Link>
            <Link
              to="/mill"
              className="mt-2 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-center text-xs font-semibold tracking-[0.08em] text-[#0F3D2E] uppercase"
              onClick={() => setOpen(false)}
            >
              <Factory className="h-4 w-4" />
              <span>Mill Portal</span>
            </Link>
            <Link
              to="/gov"
              className="mt-2 flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-3 text-center text-xs font-semibold tracking-[0.08em] text-[#0F3D2E] uppercase"
              onClick={() => setOpen(false)}
            >
              <Landmark className="h-4 w-4" />
              <span>Gov Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
