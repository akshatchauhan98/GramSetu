import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2, Sparkles, ShieldCheck, MapPin, Building2, Wheat } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { apiService } from '../services/apiService'
import { getStates, getDistricts, getVillages } from '../data/locationData'
import VoiceWelcome from '../components/VoiceWelcome'

export default function AuthPage({ initialMode }) {
  const { language, setLanguage } = useLanguage()
  const { user, isAuthenticated, isLoading: authLoading, loginUser, sessionError, setSessionError } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const tokenFromUrl = searchParams.get('token')

  const [mode, setMode] = useState(tokenFromUrl ? 'reset_token' : (initialMode || 'login')) // 'login' | 'register' | 'forgot' | 'reset_token'
  const [role, setRole] = useState('farmer') // 'farmer' | 'mill' | 'gov'
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Location Hierarchy States
  const [statesList, setStatesList] = useState(getStates())
  const [districtsList, setDistrictsList] = useState([])
  const [villagesList, setVillagesList] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)
  const [villageSearch, setVillageSearch] = useState('')

  // Password Reset States
  const [forgotMethod, setForgotMethod] = useState('email')
  const [forgotStep, setForgotStep] = useState(1)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryPhone, setRecoveryPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [resetToken, setResetToken] = useState(tokenFromUrl || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // Form Fields
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    name: '',
    phone: '',
    email: '',
    village: '',
    district: '',
    state: '',
    city: '',
    pincode: '244001',
    crop: 'Paddy',
    otherCrops: 'Wheat, Mustard',
    land: '2.5',
    landUnit: 'Acres',
    irrigation: 'Tube Well & Canal',
  })

  // If user is already authenticated and validated by /api/auth/me, redirect to portal
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'mill') navigate('/mill', { replace: true })
      else if (user.role === 'gov') navigate('/gov', { replace: true })
      else navigate('/farmer', { replace: true })
    }
  }, [authLoading, isAuthenticated, user, navigate])

  // Fetch States from API on Mount (with local dataset fallback)
  useEffect(() => {
    let isMounted = true
    async function fetchStates() {
      try {
        const res = await apiService.getLocationStates()
        if (isMounted && res && Array.isArray(res.states) && res.states.length > 0) {
          setStatesList(res.states)
        }
      } catch (err) {
        // Fallback already set
      }
    }
    fetchStates()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (tokenFromUrl) {
      setMode('reset_token')
      setResetToken(tokenFromUrl)
    } else if (initialMode) {
      setMode(initialMode)
    }
  }, [tokenFromUrl, initialMode])

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  // Location Handlers
  const handleStateChange = async (e) => {
    const selectedState = e.target.value
    setForm((prev) => ({
      ...prev,
      state: selectedState,
      district: '',
      village: ''
    }))
    setVillageSearch('')

    const localDists = getDistricts(selectedState)
    setDistrictsList(localDists)
    setVillagesList([])

    if (selectedState) {
      setLoadingDistricts(true)
      try {
        const res = await apiService.getLocationDistricts(selectedState)
        if (res && Array.isArray(res.districts) && res.districts.length > 0) {
          setDistrictsList(res.districts)
        }
      } catch (err) {
        // Fallback already set
      } finally {
        setLoadingDistricts(false)
      }
    }
  }

  const handleDistrictChange = async (e) => {
    const selectedDistrict = e.target.value
    setForm((prev) => ({
      ...prev,
      district: selectedDistrict,
      village: ''
    }))
    setVillageSearch('')

    const localVlgs = getVillages(form.state, selectedDistrict)
    setVillagesList(localVlgs)

    if (selectedDistrict && form.state) {
      setLoadingVillages(true)
      try {
        const res = await apiService.getLocationVillages(form.state, selectedDistrict)
        if (res && Array.isArray(res.villages) && res.villages.length > 0) {
          setVillagesList(res.villages)
        }
      } catch (err) {
        // Fallback already set
      } finally {
        setLoadingVillages(false)
      }
    }
  }

  const handleVillageSearchChange = async (e) => {
    const q = e.target.value
    setVillageSearch(q)

    const allVlgs = getVillages(form.state, form.district)
    const filtered = allVlgs.filter(v => v.toLowerCase().includes(q.toLowerCase()))
    setVillagesList(filtered)

    if (form.state && form.district) {
      try {
        const res = await apiService.getLocationVillages(form.state, form.district, q)
        if (res && Array.isArray(res.villages) && res.villages.length > 0) {
          setVillagesList(res.villages)
        }
      } catch (err) {
        // Fallback already set
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    if (setSessionError) setSessionError('')

    try {
      let result

      if (mode === 'login') {
        const loginIdentifier = form.identifier || form.phone || form.email
        if (!loginIdentifier) {
          throw new Error(language === 'hi' ? 'कृपया ईमेल या मोबाइल नंबर दर्ज करें।' : 'Please enter your email or mobile number.')
        }
        if (!form.password) {
          throw new Error(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.')
        }

        // Validate mobile format if not an email
        if (!loginIdentifier.includes('@')) {
          const digitsOnly = String(loginIdentifier).trim().replace(/[\s\-+]/g, '').slice(-10)
          if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
            throw new Error(language === 'hi' ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.')
          }
        }

        result = await apiService.login({
          identifier: loginIdentifier,
          password: form.password,
          role,
        })

      } else {
        // Registration Validation
        if (!form.name) {
          throw new Error(language === 'hi' ? 'कृपया अपना नाम दर्ज करें।' : 'Please enter your name.')
        }
        if (role === 'farmer' && !form.phone) {
          throw new Error(language === 'hi' ? 'कृपया मोबाइल नंबर दर्ज करें।' : 'Please enter your mobile number.')
        }
        if (!form.state) {
          throw new Error(language === 'hi' ? 'कृपया राज्य चुनें।' : 'Please select a state.')
        }
        if (!form.district) {
          throw new Error(language === 'hi' ? 'कृपया ज़िला चुनें।' : 'Please select a district.')
        }
        if (!form.village) {
          throw new Error(language === 'hi' ? 'कृपया गाँव चुनें।' : 'Please select a village.')
        }

        result = await apiService.register({
          ...form,
          role,
          language,
        })
      }

      if (result && result.user && result.token) {
        loginUser(result.user, result.token)
        if (result.user.role === 'mill') {
          navigate('/mill')
        } else if (result.user.role === 'gov') {
          navigate('/gov')
        } else {
          navigate('/farmer')
        }
      } else {
        throw new Error(result?.message || 'Authentication failed.')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check details.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Handlers
  const handleForgotEmail = async (e) => {
    if (e) e.preventDefault()
    if (!recoveryEmail) {
      setErrorMsg(language === 'hi' ? 'कृपया अपना ईमेल दर्ज करें।' : 'Please enter your email address.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiService.forgotPasswordEmail(recoveryEmail)
      setSuccessMsg(res.message || (language === 'hi' ? 'यदि इस ईमेल के लिए खाता मौजूद है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।' : 'If an account exists for this email, a password reset link has been sent.'))
    } catch (err) {
      setErrorMsg(err.message || (language === 'hi' ? 'पुनर्प्राप्ति अनुरोध विफल रहा।' : 'Recovery request failed.'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendMobileOtp = async (e) => {
    if (e) e.preventDefault()
    if (!recoveryPhone) {
      setErrorMsg(language === 'hi' ? 'कृपया अपना 10-अंकीय मोबाइल नंबर दर्ज करें।' : 'Please enter your 10-digit mobile number.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiService.forgotPasswordMobile(recoveryPhone)
      setSuccessMsg(res.message || (language === 'hi' ? 'यदि मोबाइल नंबर पंजीकृत है, तो 6-अंकीय OTP भेजा गया है।' : 'If the mobile number is registered, an OTP has been sent.'))
      setForgotStep(2)
      setResendTimer(60)
    } catch (err) {
      setErrorMsg(err.message || (language === 'hi' ? 'OTP अनुरोध विफल रहा।' : 'OTP request failed.'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg(language === 'hi' ? 'कृपया 6-अंकीय OTP दर्ज करें।' : 'Please enter the 6-digit OTP.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiService.verifyResetOtp(recoveryPhone, otpCode)
      setSuccessMsg(res.message || (language === 'hi' ? 'OTP सत्यापित हो गया। कृपया नया पासवर्ड बनाएं।' : 'OTP verified. Please create your new password.'))
      setForgotStep(3)
    } catch (err) {
      setErrorMsg(err.message || (language === 'hi' ? 'गलत OTP। कृपया पुनः प्रयास करें।' : 'Incorrect OTP. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetMobile = async (e) => {
    if (e) e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg(language === 'hi' ? 'पासवर्ड में कम से कम 8 अक्षर होने चाहिए।' : 'Password must contain at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(language === 'hi' ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiService.resetPasswordMobile(recoveryPhone, otpCode, newPassword)
      setSuccessMsg(res.message || (language === 'hi' ? 'पासवर्ड सफलतापूर्वक रीसेट हो गया।' : 'Password reset successfully.'))
      setForgotStep(4)
      setResetComplete(true)
    } catch (err) {
      setErrorMsg(err.message || (language === 'hi' ? 'पासवर्ड रीसेट करने में समस्या आई।' : 'Password reset failed.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetTokenSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!resetToken) {
      setErrorMsg(language === 'hi' ? 'रीसेट टोकन गायब या अमान्य है।' : 'Reset token is missing or invalid.')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMsg(language === 'hi' ? 'पासवर्ड में कम से कम 8 अक्षर होने चाहिए।' : 'Password must contain at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(language === 'hi' ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await apiService.resetPasswordEmail(resetToken, newPassword)
      setSuccessMsg(res.message || (language === 'hi' ? 'पासवर्ड सफलतापूर्वक रीसेट हो गया।' : 'Password reset successfully.'))
      setForgotStep(4)
      setResetComplete(true)
    } catch (err) {
      setErrorMsg(err.message || (language === 'hi' ? 'पासवर्ड रीसेट करने में समस्या आई।' : 'Password reset failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-[#F5F7F2] py-8 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100/80 grid grid-cols-1 lg:grid-cols-12">

        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN: BRANDING & AGRICULTURAL VISUAL                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0F3D2E] via-[#14523E] to-[#175C46] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background overlay */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <Wheat className="w-80 h-80 text-white" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Wheat className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">GramSetu</h1>
                <p className="text-xs text-emerald-200 font-medium">(ग्रामसेतु)</p>
              </div>
            </Link>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-emerald-50">
                {language === 'hi' ? 'किसानों को सीधे बेहतर बाज़ारों से जोड़ना' : 'Connecting Farmers Directly to Better Markets'}
              </h2>
              <p className="text-sm text-emerald-200/90 leading-relaxed">
                {language === 'hi'
                  ? 'उपग्रह आधारित डेटा और पारदर्शी मिल रेट्स के साथ अपनी फसल का सही मूल्य प्राप्त करें।'
                  : 'Get true value for your hard work with satellite crop intelligence and direct verified mill offers.'}
              </p>
            </div>

            {/* Visual Image Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-emerald-500/30 my-4">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                alt="Agricultural fields"
                className="w-full h-44 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F3D2E]/90 via-transparent to-transparent flex items-end p-4">
                <p className="text-xs font-semibold text-emerald-100 italic">
                  "{language === 'hi' ? 'आपकी फसल। आपका बाज़ार। आपकी पसंद।' : 'Your crops. Your market. Your choice.'}"
                </p>
              </div>
            </div>

            {/* Highlights list */}
            <div className="space-y-2 text-xs font-medium text-emerald-100">
              <div className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? 'भारत सरकार द्वारा घोषित MSP गारंटी' : 'Official Govt MSP Guarantee'}</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'hi' ? 'सीधे सत्यापित मिल खरीदार ऑफर' : 'Direct Verified Mill Buyer Offers'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10 border-t border-emerald-700/50 mt-6 text-[11px] text-emerald-300/80 flex items-center justify-between">
            <span>© 2026 GramSetu India</span>
            <Link to="/" className="hover:underline text-white font-semibold">
              {language === 'hi' ? 'वेबसाइट देखें' : 'Visit Website'}
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN: VOICE WELCOME + LOGIN / REGISTER FORM               */}
        {/* ------------------------------------------------------------------ */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Top Navigation Row: Language Switcher & Home link */}
            <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
              <Link to="/" className="text-xs font-bold text-[#0F3D2E] hover:underline flex items-center gap-1.5">
                <span>{language === 'hi' ? 'होमपेज पर जाएं' : 'Back to Home'}</span>
              </Link>

              {/* Language Switcher */}
              <div className="flex items-center rounded-full border border-emerald-200 bg-[#F5F7F2] p-0.5 text-xs font-semibold shadow-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    language === 'en'
                      ? 'bg-[#0F3D2E] text-white shadow-xs'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    language === 'hi'
                      ? 'bg-[#0F3D2E] text-white shadow-xs'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Bilingual Voice Assistant Component */}
            <VoiceWelcome mode={mode} language={language} onLanguageChange={setLanguage} />

            {/* Session Expiry or Custom Alerts */}
            {sessionError && (
              <div className="rounded-2xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200 flex items-start gap-2.5">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-bold">{sessionError}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-2xl bg-red-50 p-3.5 text-xs text-red-800 border border-red-200 flex items-start gap-2.5">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="rounded-2xl bg-emerald-50 p-3.5 text-xs text-[#0F3D2E] border border-emerald-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{successMsg}</p>
                </div>
              </div>
            )}

            {/* Mode Tabs (Sign In vs Create Account) */}
            {mode !== 'forgot' && mode !== 'reset_token' && (
              <div className="flex rounded-2xl bg-[#F5F7F2] p-1 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    mode === 'login'
                      ? 'bg-[#0F3D2E] text-white shadow-xs'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                >
                  {language === 'hi' ? 'लॉग इन करें' : 'Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className={`flex-1 py-2.5 rounded-xl transition-all ${
                    mode === 'register'
                      ? 'bg-[#0F3D2E] text-white shadow-xs'
                      : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                  }`}
                >
                  {language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
                </button>
              </div>
            )}

            {/* Role Selection */}
            {(mode === 'login' || mode === 'register') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C6B63]">
                  {language === 'hi' ? 'पोर्टल चुनें (Select Role):' : 'Select Role:'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    ['farmer', language === 'hi' ? 'किसान' : 'Farmer'],
                    ['mill', language === 'hi' ? 'मिल खरीदार' : 'Mill Buyer'],
                    ['gov', language === 'hi' ? 'सरकारी ऑपरेटर' : 'Gov Auditor'],
                  ].map(([rKey, rLabel]) => (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => setRole(rKey)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        role === rKey
                          ? 'bg-[#1F6B4A] text-white border-[#1F6B4A] shadow-xs scale-[1.02]'
                          : 'bg-[#F5F7F2] text-[#0F3D2E] border-emerald-100 hover:border-emerald-300'
                      }`}
                    >
                      {rLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Headers */}
            <div>
              {mode === 'login' && (
                <div>
                  <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                    {language === 'hi' ? 'ग्रामसेतु में आपका स्वागत है' : 'Welcome to GramSetu'}
                  </h3>
                  <p className="text-xs text-[#5C6B63] mt-0.5">
                    {language === 'hi' ? 'जारी रखने के लिए लॉग इन करें' : 'Login to continue'}
                  </p>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                    {language === 'hi' ? 'अपना ग्रामसेतु खाता बनाएं' : 'Create your GramSetu account'}
                  </h3>
                  <p className="text-xs text-[#5C6B63] mt-0.5">
                    {language === 'hi' ? 'अपनी जानकारी भरकर खाता बनाएं' : 'Enter your details to create your account'}
                  </p>
                </div>
              )}

              {mode === 'forgot' && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setForgotStep(1)
                      setErrorMsg('')
                      setSuccessMsg('')
                    }}
                    className="inline-flex items-center text-xs font-bold text-[#1F6B4A] hover:underline mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    {language === 'hi' ? 'लॉग इन पर वापस जाएं' : 'Back to Login'}
                  </button>
                  {forgotStep === 1 && (
                    <>
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                      </h3>
                      <p className="text-xs text-[#5C6B63] mt-0.5 font-medium">
                        {language === 'hi' ? 'पासवर्ड रीसेट करने का तरीका चुनें।' : 'Choose how you want to reset your password.'}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* LOGIN & REGISTER FORMS */}
            {(mode === 'login' || mode === 'register') && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'login' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        {language === 'hi' ? 'ईमेल या मोबाइल नंबर' : 'Email or Mobile Number'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.identifier}
                        onChange={(e) => update('identifier', e.target.value)}
                        placeholder={language === 'hi' ? '9876543210 या email@example.com' : '9876543210 or email@example.com'}
                        className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-4 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        {language === 'hi' ? 'पासवर्ड' : 'Password'} *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] pl-4 pr-11 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#0F3D2E]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot')
                            setErrorMsg('')
                            setSuccessMsg('')
                          }}
                          className="text-xs font-bold text-[#1F6B4A] hover:underline"
                        >
                          {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{language === 'hi' ? 'लॉग इन करें' : 'Log In'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Register Fields */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'पूरा नाम' : 'Full Name'} *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder={language === 'hi' ? 'उदा. राम सिंह' : 'e.g. Ram Singh'}
                          className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-3.5 py-2 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'} {role === 'farmer' ? '*' : ''}
                        </label>
                        <input
                          type="tel"
                          required={role === 'farmer'}
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value)}
                          placeholder="9876543210"
                          className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-3.5 py-2 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="farmer@gramsetu.in"
                          className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-3.5 py-2 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'पासवर्ड' : 'Password'} *
                        </label>
                        <input
                          type="password"
                          required
                          value={form.password}
                          onChange={(e) => update('password', e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-3.5 py-2 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    {/* Dependent Location Selectors */}
                    <div className="border-t border-emerald-50 pt-3 space-y-3">
                      <p className="text-xs font-bold text-[#5C6B63] uppercase tracking-wider">
                        📍 {language === 'hi' ? 'स्थान विवरण (Location Details)' : 'Location Details'}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {/* State */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#0F3D2E] mb-1">
                            {language === 'hi' ? 'राज्य' : 'State'} *
                          </label>
                          <select
                            value={form.state}
                            onChange={handleStateChange}
                            required
                            className="w-full rounded-xl border border-emerald-200 bg-[#F5F7F2] px-2.5 py-2 text-xs text-[#0F3D2E] font-semibold outline-none focus:border-emerald-500"
                          >
                            <option value="">{language === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}</option>
                            {statesList.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* District */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#0F3D2E] mb-1">
                            {language === 'hi' ? 'ज़िला' : 'District'} *
                          </label>
                          <select
                            value={form.district}
                            onChange={handleDistrictChange}
                            disabled={!form.state}
                            required
                            className="w-full rounded-xl border border-emerald-200 bg-[#F5F7F2] px-2.5 py-2 text-xs text-[#0F3D2E] font-semibold outline-none focus:border-emerald-500 disabled:opacity-50"
                          >
                            <option value="">{language === 'hi' ? '-- ज़िला चुनें --' : '-- Select District --'}</option>
                            {districtsList.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Village */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#0F3D2E] mb-1">
                            {language === 'hi' ? 'गाँव' : 'Village'} *
                          </label>
                          <select
                            value={form.village}
                            onChange={(e) => update('village', e.target.value)}
                            disabled={!form.district}
                            required
                            className="w-full rounded-xl border border-emerald-200 bg-[#F5F7F2] px-2.5 py-2 text-xs text-[#0F3D2E] font-semibold outline-none focus:border-emerald-500 disabled:opacity-50"
                          >
                            <option value="">{language === 'hi' ? '-- गाँव चुनें --' : '-- Select Village --'}</option>
                            {villagesList.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{language === 'hi' ? 'खाता बनाएं' : 'Create Account'}</span>
                    </button>
                  </>
                )}
              </form>
            )}

            {/* FORGOT PASSWORD FORM & OTP / RESET FLOW */}
            {mode === 'forgot' && (
              <div className="space-y-4">
                {forgotStep === 1 && (
                  <>
                    {/* Method Selector Tabs */}
                    <div className="flex rounded-2xl bg-[#F5F7F2] p-1 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMethod('email')
                          setErrorMsg('')
                          setSuccessMsg('')
                        }}
                        className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          forgotMethod === 'email'
                            ? 'bg-[#0F3D2E] text-white shadow-xs font-bold'
                            : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                        }`}
                      >
                        <span>{language === 'hi' ? 'ईमेल' : 'Email'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMethod('mobile')
                          setErrorMsg('')
                          setSuccessMsg('')
                        }}
                        className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                          forgotMethod === 'mobile'
                            ? 'bg-[#0F3D2E] text-white shadow-xs font-bold'
                            : 'text-[#5C6B63] hover:text-[#0F3D2E]'
                        }`}
                      >
                        <span>{language === 'hi' ? 'मोबाइल OTP' : 'Mobile OTP'}</span>
                      </button>
                    </div>

                    {/* Email Mode Form */}
                    {forgotMethod === 'email' && (
                      <form onSubmit={handleForgotEmail} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                            {language === 'hi' ? 'पंजीकृत ईमेल पता' : 'Registered Email Address'} *
                          </label>
                          <input
                            type="email"
                            required
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder={language === 'hi' ? 'अपना पंजीकृत ईमेल दर्ज करें' : 'Enter your registered email'}
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-4 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <p className="text-xs text-[#5C6B63] mt-1.5 leading-relaxed font-medium">
                            {language === 'hi'
                              ? 'हम आपके पंजीकृत ईमेल पते पर एक सुरक्षित पासवर्ड रीसेट लिंक भेजेंगे।'
                              : "We'll send a secure password reset link to your registered email address."}
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>{language === 'hi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link'}</span>
                        </button>
                      </form>
                    )}

                    {/* Mobile OTP Mode Form */}
                    {forgotMethod === 'mobile' && (
                      <form onSubmit={handleSendMobileOtp} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                            {language === 'hi' ? 'पंजीकृत मोबाइल नंबर' : 'Registered Mobile Number'} *
                          </label>
                          <input
                            type="tel"
                            required
                            value={recoveryPhone}
                            onChange={(e) => setRecoveryPhone(e.target.value)}
                            placeholder={language === 'hi' ? 'अपना 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Enter your 10-digit mobile number'}
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-4 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <p className="text-xs text-[#5C6B63] mt-1.5 leading-relaxed font-medium">
                            {language === 'hi'
                              ? 'हम आपके पंजीकृत मोबाइल नंबर पर एक सत्यापन कोड भेजेंगे।'
                              : "We'll send a verification code to your registered mobile number."}
                          </p>
                          <p className="text-xs text-emerald-800 font-bold mt-1.5">
                            +91 {recoveryPhone ? recoveryPhone.replace(/\D/g, '').slice(-10) : 'XXXXX XXXXX'}
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>{language === 'hi' ? 'OTP भेजें' : 'Send OTP'}</span>
                        </button>
                      </form>
                    )}
                  </>
                )}

                {/* Step 2: OTP Screen */}
                {forgotStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'मोबाइल नंबर सत्यापित करें' : 'Verify Mobile Number'}
                      </h3>
                      <p className="text-xs text-[#5C6B63] mt-1 font-medium">
                        {language === 'hi'
                          ? `हमने 6-अंकीय OTP भेजा है: +91 ${recoveryPhone.replace(/\D/g, '').slice(-10)}`
                          : `We've sent a 6-digit OTP to: +91 ${recoveryPhone.replace(/\D/g, '').slice(-10)}`}
                      </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'OTP दर्ज करें' : 'Enter OTP'} *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full text-center tracking-[0.5em] text-lg font-bold rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] px-4 py-3 text-[#0F3D2E] outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length !== 6}
                        className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{language === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP'}</span>
                      </button>

                      <div className="pt-2 text-center">
                        {resendTimer > 0 ? (
                          <p className="text-xs text-[#5C6B63] font-medium">
                            {language === 'hi'
                              ? `OTP दोबारा भेजें (${resendTimer} सेकंड में उपलब्ध)`
                              : `Resend available in ${resendTimer} seconds`}
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendMobileOtp}
                            disabled={loading}
                            className="text-xs font-extrabold text-[#1F6B4A] hover:underline"
                          >
                            {language === 'hi' ? 'OTP दोबारा भेजें' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: New Password Screen */}
                {forgotStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'नया पासवर्ड बनाएं' : 'Create New Password'}
                      </h3>
                      <p className="text-xs text-[#5C6B63] mt-1 font-medium">
                        {language === 'hi' ? 'कृपया अपना नया पासवर्ड दर्ज करें' : 'Please enter your new password'}
                      </p>
                    </div>

                    <form onSubmit={handleResetMobile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'नया पासवर्ड' : 'New Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] pl-4 pr-11 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#0F3D2E]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'नया पासवर्ड दोबारा दर्ज करें' : 'Confirm New Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] pl-4 pr-11 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#0F3D2E]"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-100 space-y-1 font-medium">
                        <p>• {language === 'hi' ? 'कम से कम 8 अक्षर होने चाहिए' : 'At least 8 characters'}</p>
                        <p>• {language === 'hi' ? 'एक मजबूत पासवर्ड का उपयोग करें' : 'Use a strong password'}</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Password'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Step 4: Password Reset Successfully */}
                {forgotStep === 4 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'पासवर्ड सफलतापूर्वक रीसेट हो गया' : 'Password Reset Successfully'}
                      </h3>
                      <p className="text-xs text-[#5C6B63]">
                        {language === 'hi' ? 'आपका पासवर्ड अपडेट कर दिया गया है।' : 'Your password has been updated.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setForgotStep(1)
                        setForgotMethod('email')
                        setRecoveryEmail('')
                        setRecoveryPhone('')
                        setOtpCode('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setErrorMsg('')
                        setSuccessMsg('')
                      }}
                      className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md"
                    >
                      {language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* RESET TOKEN FORM (From email link /reset-password?token=...) */}
            {mode === 'reset_token' && (
              <div className="space-y-4">
                {!resetComplete ? (
                  <>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'नया पासवर्ड बनाएं' : 'Create New Password'}
                      </h3>
                      <p className="text-xs text-[#5C6B63] mt-1 font-medium">
                        {language === 'hi' ? 'कृपया अपना नया पासवर्ड दर्ज करें' : 'Please enter your new password'}
                      </p>
                    </div>

                    <form onSubmit={handleResetTokenSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'नया पासवर्ड' : 'New Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] pl-4 pr-11 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#0F3D2E]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                          {language === 'hi' ? 'नया पासवर्ड दोबारा दर्ज करें' : 'Confirm New Password'} *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-emerald-200/80 bg-[#F5F7F2] pl-4 pr-11 py-2.5 text-sm text-[#0F3D2E] outline-none focus:border-emerald-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C6B63] hover:text-[#0F3D2E]"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-900 border border-emerald-100 space-y-1 font-medium">
                        <p>• {language === 'hi' ? 'कम से कम 8 अक्षर होने चाहिए' : 'At least 8 characters'}</p>
                        <p>• {language === 'hi' ? 'एक मजबूत पासवर्ड का उपयोग करें' : 'Use a strong password'}</p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>{language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Password'}</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-[#0F3D2E]">
                        {language === 'hi' ? 'पासवर्ड सफलतापूर्वक रीसेट हो गया' : 'Password Reset Successfully'}
                      </h3>
                      <p className="text-xs text-[#5C6B63]">
                        {language === 'hi' ? 'आपका पासवर्ड अपडेट कर दिया गया है।' : 'Your password has been updated.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login')
                        setForgotStep(1)
                        setForgotMethod('email')
                        setRecoveryEmail('')
                        setRecoveryPhone('')
                        setOtpCode('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setErrorMsg('')
                        setSuccessMsg('')
                      }}
                      className="w-full rounded-full bg-[#0F3D2E] hover:bg-[#16523F] py-3 text-sm font-extrabold text-white transition-all shadow-md"
                    >
                      {language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Login'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer toggle link */}
          <div className="border-t border-emerald-50 pt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-[#5C6B63]">
                {language === 'hi' ? 'क्या आपका खाता नहीं है?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className="font-extrabold text-[#1F6B4A] hover:underline"
                >
                  {language === 'hi' ? 'खाता बनाएं' : 'Create Account'}
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-xs text-[#5C6B63]">
                {language === 'hi' ? 'क्या आपका पहले से खाता है?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className="font-extrabold text-[#1F6B4A] hover:underline"
                >
                  {language === 'hi' ? 'लॉग इन करें' : 'Log In'}
                </button>
              </p>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  )
}