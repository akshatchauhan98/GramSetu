import { User, LogOut, Edit3, ChevronDown, CheckCircle2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'

export default function ProfileDropdown() {
  const { language } = useLanguage()
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="rounded-full bg-[#0F3D2E] px-4 py-2 text-xs font-bold text-white uppercase hover:bg-[#163D32]"
      >
        {language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
      </Link>
    )
  }

  const roleLabels = {
    farmer: language === 'hi' ? 'किसान (Farmer)' : 'Farmer',
    mill: language === 'hi' ? 'मिल खरीदार (Mill)' : 'Mill Buyer',
    gov: language === 'hi' ? 'सरकारी ऑपरेटर (Gov)' : 'Gov Auditor',
  }

  const profilePath = user.role === 'mill' ? '/mill' : user.role === 'gov' ? '/gov' : '/farmer/profile'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-[#0F3D2E]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F3D2E] shadow-xs hover:border-[#1F6B4A] transition"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F2EC] text-[#1F6B4A]">
          <User size={13} />
        </span>
        <span className="max-w-[100px] truncate font-bold">{user.name || 'Profile'}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-3xl bg-white p-4 shadow-2xl border border-[#0F3D2E]/10 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Card Summary */}
          <div className="border-b border-[#0F3D2E]/10 pb-3 mb-3">
            <p className="text-sm font-extrabold text-[#0F3D2E]">{user.name}</p>
            <p className="text-xs text-[#5C6B63] mt-0.5">{user.email || user.phone}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="rounded-full bg-[#E8F2EC] px-2.5 py-0.5 text-[10px] font-bold text-[#1F6B4A] uppercase">
                {roleLabels[user.role] || user.role}
              </span>
              {user.village && (
                <span className="text-[11px] text-[#5C6B63]">{user.village}</span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-1">
            <Link
              to={profilePath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold text-[#0F3D2E] hover:bg-[#F5F7F2] transition"
            >
              <User size={15} className="text-[#1F6B4A]" />
              <span>{language === 'hi' ? 'प्रोफाइल देखें' : 'View Profile'}</span>
            </Link>

            <Link
              to="/farmer/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold text-[#0F3D2E] hover:bg-[#F5F7F2] transition"
            >
              <Edit3 size={15} className="text-[#1F6B4A]" />
              <span>{language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>{language === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
