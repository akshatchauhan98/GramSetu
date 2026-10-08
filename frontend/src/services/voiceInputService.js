// GramSetu Web Speech Recognition Input Service (Prototype Abstraction)

class VoiceInputService {
  constructor() {
    const SpeechRecognition = typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null
  }

  isSupported() {
    return !!this.recognition
  }

  startListening({ language = 'hi', onResult, onError, onEnd }) {
    if (!this.isSupported()) {
      if (onError) onError('Speech recognition is not supported on this browser.')
      return false
    }

    try {
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (onResult) onResult(transcript)
      }

      this.recognition.onerror = (event) => {
        if (onError) onError(event.error)
      }

      this.recognition.onend = () => {
        if (onEnd) onEnd()
      }

      this.recognition.start()
      return true
    } catch (err) {
      if (onError) onError(err.message)
      return false
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop()
      } catch {}
    }
  }
}

export const voiceInputService = new VoiceInputService()
