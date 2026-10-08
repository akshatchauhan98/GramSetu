// GramSetu Web Speech API Service
// Reusable service wrapping window.speechSynthesis gracefully

/**
 * Centralized function to build dynamic personalized farmer welcome message
 * @param {Object} params
 * @param {string} [params.language='hi'] - 'hi' | 'en'
 * @param {string} [params.userName] - Authenticated user name
 * @returns {string}
 */
export function buildFarmerWelcomeMessage({ language = 'hi', userName } = {}) {
  const cleanName = typeof userName === 'string' ? userName.trim() : ''

  if (language === 'hi') {
    if (cleanName) {
      return `नमस्ते ${cleanName} जी। ग्रामसेतु में आपका स्वागत है। आज मैं आपकी खेती और फसल से जुड़ी जानकारी में आपकी सहायता करने के लिए तैयार हूँ।`
    }
    return `नमस्ते किसान जी। ग्रामसेतु में आपका स्वागत है। आज मैं आपकी खेती और फसल से जुड़ी जानकारी में आपकी सहायता करने के लिए तैयार हूँ।`
  } else {
    if (cleanName) {
      return `Namaste ${cleanName} ji. Welcome to GramSetu. I am ready to help you with your farming and crop-related information today.`
    }
    return `Namaste Farmer. Welcome to GramSetu. I am ready to help you with your farming and crop-related information today.`
  }
}

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null
    this.voices = []
    this.currentUtterance = null

    if (this.synth) {
      this.loadVoices()
      if (typeof this.synth.addEventListener === 'function') {
        this.synth.addEventListener('voiceschanged', () => this.loadVoices())
      } else if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  loadVoices() {
    if (!this.synth) return
    try {
      this.voices = this.synth.getVoices() || []
    } catch {
      this.voices = []
    }
  }

  isSupported() {
    return !!this.synth && typeof window.SpeechSynthesisUtterance !== 'undefined'
  }

  getBestVoice(language = 'hi') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices()
    }

    const normLang = (language || 'hi').toLowerCase()

    if (normLang === 'hi') {
      // 1. Exact hi-IN match
      let voice = this.voices.find(
        (v) => v.lang === 'hi-IN' || v.lang.replace('_', '-') === 'hi-IN'
      )
      if (voice) return voice

      // 2. Any hi-* locale match
      voice = this.voices.find(
        (v) => v.lang && v.lang.toLowerCase().startsWith('hi')
      )
      if (voice) return voice

      // 3. Voice name contains 'hindi'
      voice = this.voices.find(
        (v) => v.name && v.name.toLowerCase().includes('hindi')
      )
      if (voice) return voice

      // 4. Fallback to null so utterance.lang = 'hi-IN' allows browser native Hindi TTS engine without forcing an English voice
      return null
    } else {
      // 1. Exact en-IN match
      let voice = this.voices.find(
        (v) => v.lang === 'en-IN' || v.lang.replace('_', '-') === 'en-IN'
      )
      if (voice) return voice

      // 2. Exact en-US match
      voice = this.voices.find(
        (v) => v.lang === 'en-US' || v.lang.replace('_', '-') === 'en-US'
      )
      if (voice) return voice

      // 3. Any en-* locale match
      voice = this.voices.find(
        (v) => v.lang && v.lang.toLowerCase().startsWith('en')
      )
      if (voice) return voice

      // 4. Browser default voice
      return this.voices[0] || null
    }
  }

  /**
   * Speak given text in language ('hi' or 'en')
   */
  speak(text, language = 'hi', options = {}) {
    return new Promise((resolve) => {
      if (!this.isSupported() || !text) {
        return resolve({ success: false, reason: 'unsupported' })
      }

      try {
        // Cancel any active speech
        this.cancel()

        if (this.synth.paused) {
          this.synth.resume()
        }

        const utterance = new SpeechSynthesisUtterance(text)

        // Set locale
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'

        // Select voice
        const voice = this.getBestVoice(language)
        if (voice) {
          utterance.voice = voice
        }

        // Set rate & pitch (slightly slower for agricultural clarity)
        const rateMap = { slow: 0.82, normal: 0.95, fast: 1.1 }
        utterance.rate = options.rate || rateMap[options.speed] || 0.85
        utterance.pitch = options.pitch || 1.0
        if (options.volume !== undefined) {
          utterance.volume = options.volume
        }

        utterance.onend = () => {
          this.currentUtterance = null
          if (options.onEnd) options.onEnd()
          resolve({ success: true })
        }

        utterance.onerror = (event) => {
          this.currentUtterance = null
          if (options.onError) options.onError(event)
          resolve({ success: false, error: event })
        }

        if (options.onStart) {
          utterance.onstart = () => options.onStart()
        }

        this.currentUtterance = utterance
        this.synth.speak(utterance)
      } catch (err) {
        this.currentUtterance = null
        resolve({ success: false, error: err })
      }
    })
  }

  cancel() {
    if (this.synth) {
      try {
        this.synth.cancel()
      } catch {}
    }
    this.currentUtterance = null
  }

  isSpeaking() {
    return !!this.synth && this.synth.speaking
  }
}

export const speechService = new SpeechService()

