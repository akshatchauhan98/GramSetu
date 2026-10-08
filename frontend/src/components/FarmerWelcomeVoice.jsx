import { useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { speechService, buildFarmerWelcomeMessage } from '../services/speechService'

export default function FarmerWelcomeVoice() {
  const { language } = useLanguage()
  const { user } = useUser()
  const hasSpokenWelcomeRef = useRef(false)
  const pendingWelcomeRef = useRef(false)

  // Trigger welcome message on initial mount of the Farmer dashboard
  useEffect(() => {
    const isVoiceOn = user?.voiceEnabled !== false

    if (!isVoiceOn || !speechService.isSupported()) {
      return
    }

    if (hasSpokenWelcomeRef.current) {
      return
    }

    hasSpokenWelcomeRef.current = true

    const welcomeMsg = buildFarmerWelcomeMessage({
      language,
      userName: user?.name,
    })

    const attemptSpeak = async () => {
      try {
        const result = await speechService.speak(welcomeMsg, language, {
          speed: user?.voiceSpeed || 'slow',
          onError: () => {
            // Autoplay blocked by browser policy
            pendingWelcomeRef.current = true
          },
        })

        if (!result || !result.success) {
          pendingWelcomeRef.current = true
        }
      } catch (err) {
        pendingWelcomeRef.current = true
      }
    }

    attemptSpeak()
  }, [])

  // Handle browser autoplay restriction: attempt welcome on user's first valid interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      const isVoiceOn = user?.voiceEnabled !== false
      if (pendingWelcomeRef.current && isVoiceOn && speechService.isSupported()) {
        pendingWelcomeRef.current = false
        const welcomeMsg = buildFarmerWelcomeMessage({
          language,
          userName: user?.name,
        })
        speechService.speak(welcomeMsg, language, {
          speed: user?.voiceSpeed || 'slow',
        })
      }
    }

    window.addEventListener('pointerdown', handleUserInteraction, { once: true })
    window.addEventListener('click', handleUserInteraction, { once: true })
    window.addEventListener('keydown', handleUserInteraction, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('click', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }
  }, [language, user?.name, user?.voiceEnabled])

  // Cancel speech if Voice is turned OFF
  useEffect(() => {
    if (user?.voiceEnabled === false) {
      speechService.cancel()
    }
  }, [user?.voiceEnabled])

  return null
}
