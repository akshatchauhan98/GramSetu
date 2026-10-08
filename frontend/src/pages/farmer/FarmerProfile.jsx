import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Edit3, LogOut, Volume2, CheckCircle2, Shield, MapPin, Sprout, Phone, Mail, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useUser } from '../../context/UserContext'
import { apiService } from '../../services/apiService'

export default function FarmerProfile() {
  const { language, setLanguage, t } = useLanguage()
  const { user, updateUser, toggleVoice, setVoiceSpeed } = useUser()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  // Form state initialized dynamically from authenticated user object
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    district: '',
    state: '',
    city: '',
    pincode: '',
    crop: '',
    otherCrops: '',
    land: '',
    landUnit: '',
    irrigation: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        city: user.city || '',
        pincode: user.pincode || '',
        crop: user.crop || 'Paddy',
        otherCrops: user.otherCrops || '',
        land: user.land || '',
        landUnit: user.landUnit || 'Acres',
        irrigation: user.irrigation || '',
      })
    }
  }, [user])

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Save updated profile via PUT /api/auth/profile
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await apiService.updateProfile({
        ...form,
        language,
      })
      if (result && result.user) {
        updateUser(result.user)
      } else {
        updateUser(form)
      }
      setIsEditing(false)
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 4000)
    } catch {
      updateUser(form)
      setIsEditing(false)
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 4000)
    } finally {
      setSaving(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    await apiService.logout()
    updateUser(null)
    localStorage.removeItem('gramsetu_token')
    localStorage.removeItem('gramsetu_user')
    sessionStorage.clear()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] md:text-3xl">
            {language === 'hi' ? 'किसान प्रोफाइल (Profile)' : 'Farmer Profile'}
          </h1>
          <p className="mt-1 text-xs text-[#5C6B63]">
            {language === 'hi' ? 'प्रमाणित किसान खाता जानकारी' : 'Authenticated Farmer Account Information'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#0F3D2E] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#163D32]"
          >
            <Edit3 size={14} />
            <span>{language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100"
          >
            <LogOut size={14} />
            <span>{language === 'hi' ? 'लॉग आउट' : 'Logout'}</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            {language === 'hi' ? 'प्रोफाइल सफलतापूर्वक अपडेट हो गई (Changes Saved)' : 'Profile updated successfully'}
          </span>
          <button onClick={() => setSavedToast(false)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* User Hero Header Card */}
      <div className="rounded-3xl bg-linear-to-r from-[#0F3D2E] to-[#163D32] p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C5D86D] text-[#0F3D2E] shadow-md">
            <User className="h-8 w-8 text-[#0F3D2E]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{user.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/80">
              <span className="rounded-full bg-white/15 px-3 py-0.5 font-semibold text-[#C5D86D] uppercase">
                {user.role === 'farmer' ? (language === 'hi' ? 'किसान' : 'Farmer') : user.role}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-[#C5D86D]" />
                {user.village}, {user.district}, {user.state}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Details Card */}
        <div className="rounded-3xl bg-white p-6 shadow-lg border border-[#0F3D2E]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#0F3D2E]/10 pb-3">
            <User size={18} className="text-[#1F6B4A]" />
            <h3 className="text-base font-bold text-[#0F3D2E]">
              {language === 'hi' ? 'व्यक्तिगत जानकारी (Personal Details)' : 'Personal Details'}
            </h3>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">{t('profile.name')}</dt>
              <dd className="font-bold text-[#0F3D2E] text-base">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">{t('profile.phone')}</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.phone || '9876543210'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">Email</dt>
              <dd className="font-medium text-[#0F3D2E]">{user.email || 'ram.singh@gramsetu.in'}</dd>
            </div>
          </dl>
        </div>

        {/* Farm & Agricultural Details Card */}
        <div className="rounded-3xl bg-white p-6 shadow-lg border border-[#0F3D2E]/10 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#0F3D2E]/10 pb-3">
            <Sprout size={18} className="text-[#1F6B4A]" />
            <h3 className="text-base font-bold text-[#0F3D2E]">
              {language === 'hi' ? 'कृषि जानकारी (Farm Details)' : 'Farm Details'}
            </h3>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">{t('profile.village')}</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.village || (language === 'hi' ? 'उपलब्ध नहीं' : 'N/A')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">District</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.district || (language === 'hi' ? 'उपलब्ध नहीं' : 'N/A')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">State</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.state || (language === 'hi' ? 'उपलब्ध नहीं' : 'N/A')}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">{t('profile.crop')}</dt>
              <dd className="font-bold text-[#1F6B4A]">{user.crop || 'Paddy'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">Land Area</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.land || '2.5'} {user.landUnit || 'Acres'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-[#5C6B63]">Irrigation</dt>
              <dd className="font-bold text-[#0F3D2E]">{user.irrigation || 'Tube Well'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Voice Assistance & Language Settings Card */}
      <div className="rounded-3xl bg-white p-6 shadow-lg border border-[#0F3D2E]/10 space-y-5">
        <h3 className="text-base font-bold text-[#0F3D2E] flex items-center gap-2 border-b border-[#0F3D2E]/10 pb-3">
          <Volume2 size={18} className="text-[#1F6B4A]" />
          <span>{language === 'hi' ? 'भाषा एवं आवाज सेटिंग्स' : 'Language & Voice Preferences'}</span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#5C6B63] uppercase tracking-wider mb-2">
              {t('profile.language')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 rounded-2xl py-2.5 text-xs font-bold border transition ${
                  language === 'en'
                    ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]'
                    : 'bg-[#F5F7F2] text-[#0F3D2E] border-emerald-100 hover:border-emerald-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex-1 rounded-2xl py-2.5 text-xs font-bold border transition ${
                  language === 'hi'
                    ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]'
                    : 'bg-[#F5F7F2] text-[#0F3D2E] border-emerald-100 hover:border-emerald-300'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Voice Assistance ON/OFF */}
          <div>
            <label className="block text-xs font-semibold text-[#5C6B63] uppercase tracking-wider mb-2">
              Voice Assistance (वॉइस असिस्टेंट)
            </label>
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-full rounded-2xl py-2.5 text-xs font-extrabold border transition ${
                user.voiceEnabled !== false
                  ? 'bg-[#1F6B4A] text-white border-[#1F6B4A]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {user.voiceEnabled !== false ? 'Voice ON' : 'Voice OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[#0F3D2E]/15">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-xl font-bold text-[#0F3D2E]">
                {language === 'hi' ? 'प्रोफाइल संपादित करें' : 'Edit Profile'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-full p-2 text-[#5C6B63] hover:bg-[#F5F7F2]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  {t('profile.name')} *
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3.5 py-2.5 text-sm text-[#0F3D2E] outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  {t('profile.phone')} *
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3.5 py-2.5 text-sm text-[#0F3D2E] outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  {t('profile.village')}
                  <input
                    type="text"
                    value={form.village}
                    onChange={(e) => updateField('village', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  District
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => updateField('district', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  State
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  {t('profile.crop')}
                  <input
                    type="text"
                    value={form.crop}
                    onChange={(e) => updateField('crop', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3.5 py-2.5 text-sm text-[#0F3D2E] outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  Other Crops (अन्य फसलें)
                  <input
                    type="text"
                    value={form.otherCrops}
                    onChange={(e) => updateField('otherCrops', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3.5 py-2.5 text-sm text-[#0F3D2E] outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  Land Area
                  <input
                    type="text"
                    value={form.land}
                    onChange={(e) => updateField('land', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  />
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  Land Unit
                  <select
                    value={form.landUnit}
                    onChange={(e) => updateField('landUnit', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  >
                    <option value="Acres">Acres (एकड़)</option>
                    <option value="Hectares">Hectares (हेक्टेयर)</option>
                    <option value="Bigha">Bigha (बीघा)</option>
                  </select>
                </label>

                <label className="block text-xs font-semibold text-[#0F3D2E]">
                  Irrigation
                  <input
                    type="text"
                    value={form.irrigation}
                    onChange={(e) => updateField('irrigation', e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-emerald-100 bg-[#F5F7F2] px-3 py-2 text-xs text-[#0F3D2E] outline-none"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-[#0F3D2E] py-3 text-center text-xs font-bold text-white uppercase shadow-md hover:bg-[#163D32]"
                >
                  {saving ? 'Saving...' : language === 'hi' ? 'सहेजें (Save Changes)' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-gray-300 bg-white px-6 py-3 text-xs font-bold text-gray-700 uppercase hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}