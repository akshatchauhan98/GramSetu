import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Play, Square, Sparkles } from 'lucide-react'

export default function VoiceWelcome({
  mode = 'login',
  language = 'en',
  onLanguageChange
}) {
  const [speaking, setSpeaking] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [speechNotice, setSpeechNotice] = useState('')
  const synthRef = useRef(null)

  const messages = {
    login: {
      en: "Welcome to GramSetu. To continue, please log in using your email or mobile number. If you are new to GramSetu, please register to create your account.",
      hi: "ग्रामसेतु ऐप में आपका स्वागत है। आगे बढ़ने के लिए अपने मोबाइल नंबर या ईमेल से लॉग इन करें। अगर आप ग्रामसेतु पर नए हैं, तो अपना खाता बनाने के लिए रजिस्टर करें।"
    },
    register: {
      en: "Welcome to GramSetu registration. Please enter your details to create your account and access GramSetu services.",
      hi: "ग्रामसेतु पंजीकरण में आपका स्वागत है। अपना खाता बनाने और ग्रामसेतु की सेवाओं का उपयोग करने के लिए कृपया अपनी जानकारी भरें।"
    },
    forgot: {
      en: "Welcome to GramSetu password recovery. Choose email to receive a secure reset link, or choose mobile OTP to verify your registered mobile number.",
      hi: "ग्रामसेतु पासवर्ड रिकवरी में आपका स्वागत है। सुरक्षित रीसेट लिंक पाने के लिए ईमेल चुनें, या अपने पंजीकृत मोबाइल नंबर को सत्यापित करने के लिए मोबाइल OTP चुनें।"
    }
  }

  const currentMessage = (messages[mode] || messages.login)[language] || messages.login.en

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis

      const updateVoices = () => {
        const voices = synthRef.current.getVoices()
        if (voices && voices.length > 0) {
          setVoicesLoaded(true)
        }
      }

      updateVoices()

      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = updateVoices
      }
    } else {
      setSpeechSupported(false)
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const handleToggleSpeak = () => {
    if (!speechSupported || !synthRef.current) {
      setSpeechNotice('Speech synthesis is not supported on this browser.')
      return
    }

    if (speaking) {
      synthRef.current.cancel()
      setSpeaking(false)
      return
    }

    // Cancel any previous active utterance
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(currentMessage)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const availableVoices = synthRef.current.getVoices()

    if (availableVoices && availableVoices.length > 0) {
      let chosenVoice = null

      if (language === 'hi') {
        chosenVoice = availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'))
      } else {
        chosenVoice = availableVoices.find(v => v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en-in'))) ||
                      availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice
      }
    }

    utterance.onstart = () => {
      setSpeaking(true)
      setSpeechNotice('')
    }

    utterance.onend = () => {
      setSpeaking(false)
    }

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e.error)
      setSpeaking(false)
      setSpeechNotice('Tap Listen to hear the welcome message.')
    }

    try {
      synthRef.current.speak(utterance)
    } catch (err) {
      console.warn('Failed to trigger speech:', err.message)
      setSpeaking(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-[#0F3D2E] rounded-3xl p-5 text-white shadow-md space-y-3 relative overflow-hidden border border-emerald-700/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-700/60 rounded-xl text-emerald-200">
            {speaking ? <Volume2 className="w-5 h-5 animate-pulse text-emerald-300" /> : <Volume2 className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{language === 'hi' ? 'ग्रामसेतु वॉइस असिस्टेंट' : 'GramSetu Voice Assistant'}</span>
            </h4>
            <p className="text-xs text-emerald-200/90 font-medium">
              {language === 'hi' ? 'ग्रामसेतु में आपका स्वागत है' : 'Welcome to GramSetu'}
            </p>
          </div>
        </div>

        {/* Language selector toggle inside card */}
        {onLanguageChange && (
          <div className="inline-flex rounded-full bg-emerald-950/80 p-1 border border-emerald-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'en' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded-full transition-all ${
                language === 'hi' ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs' : 'text-emerald-200 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        )}
      </div>

      {/* Display text of spoken message */}
      <p className="text-xs text-emerald-100/90 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/60 leading-relaxed font-normal">
        "{currentMessage}"
      </p>

      {/* Action Button */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleToggleSpeak}
          aria-label="Listen to GramSetu welcome message"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs ${
            speaking
              ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 scale-[1.02]'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-[1.02]'
          }`}
        >
          {speaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'hi' ? 'बोल रहे हैं...' : 'Speaking...'}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'hi' ? 'स्वागत संदेश सुनें' : 'Listen to Welcome Message'}</span>
            </>
          )}
        </button>

        {speechNotice && (
          <span className="text-[11px] text-amber-300 font-medium italic">
            {speechNotice}
          </span>
        )}
      </div>
    </div>
  )
}
