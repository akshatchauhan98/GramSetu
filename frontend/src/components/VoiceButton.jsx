import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { speechService } from '../services/speechService'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'

export default function VoiceButton({
  text,
  language: overrideLang,
  label,
  variant = 'primary',
  autoPlay = false,
  ariaLabel,
  className = '',
}) {
  const { language: currentLang } = useLanguage()
  const { user } = useUser()
  const lang = overrideLang || currentLang

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported(speechService.isSupported())
  }, [])

  useEffect(() => {
    // If autoPlay is requested and user voiceEnabled is true
    if (autoPlay && user?.voiceEnabled && isSupported && text) {
      handleSpeak()
    }
    return () => {
      if (isSpeaking) {
        speechService.cancel()
      }
    }
  }, [autoPlay, text])

  const handleSpeak = async (e) => {
    if (e) e.stopPropagation()
    if (!isSupported || !text) return

    if (isSpeaking) {
      speechService.cancel()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    const result = await speechService.speak(text, lang, {
      speed: user?.voiceSpeed || 'slow',
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    })

    if (!result.success) {
      setIsSpeaking(false)
    }
  }

  if (!isSupported) {
    return null
  }

  const defaultLabel = label || (lang === 'hi' ? 'सुनें' : 'Listen')
  const defaultAriaLabel = ariaLabel || `${defaultLabel}: ${text.substring(0, 40)}`

  // Variant styling
  const variantStyles = {
    primary:
      'bg-[#0F3D2E] text-white hover:bg-[#163D32] border border-emerald-900/20 shadow-md',
    secondary:
      'bg-[#E8F2EC] text-[#0F3D2E] hover:bg-[#DCEFE4] border border-[#1F6B4A]/20 shadow-xs',
    badge:
      'bg-[#C5D86D] text-[#0F3D2E] hover:bg-white font-bold border border-[#0F3D2E]/20 shadow-xs',
    subtle:
      'bg-white/80 text-[#0F3D2E] hover:bg-white border border-[#0F3D2E]/10 shadow-2xs',
    inline:
      'bg-transparent text-[#0F3D2E] hover:text-[#1F6B4A] underline-offset-2',
  }

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={defaultAriaLabel}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all active:scale-95 ${
        variantStyles[variant] || variantStyles.primary
      } ${isSpeaking ? 'ring-2 ring-[#C5D86D] scale-105' : ''} ${className}`}
    >
      <Volume2
        size={16}
        className={`${isSpeaking ? 'animate-bounce text-[#C5D86D]' : ''}`}
      />
      <span>{isSpeaking ? (lang === 'hi' ? 'बोल रहे हैं...' : 'Speaking...') : defaultLabel}</span>
    </button>
  )
}
