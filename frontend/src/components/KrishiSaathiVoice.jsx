import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Send,
  Sparkles,
  MessageSquare,
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Calendar,
  ShieldAlert,
  Info,
  FileImage,
  RefreshCw,
  Sprout,
  HeartPulse,
  TrendingUp,
  CalendarDays,
  MessageCircle,
  Image as ImageIcon,
  BadgeCheck,
  Wheat
} from 'lucide-react'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'
import { speechService } from '../services/speechService'
import { voiceInputService } from '../services/voiceInputService'
import { voiceAssistantService } from '../services/voiceAssistantService'
import { apiService } from '../services/apiService'

export default function KrishiSaathiVoice({ className = '' }) {
  const { language } = useLanguage()
  const { user } = useUser()

  // Voice State: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
  const [status, setStatus] = useState('IDLE')
  const [queryText, setQueryText] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [responseResult, setResponseResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true)

  // Camera / Farm Photo Analysis States
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const [qualityWarning, setQualityWarning] = useState('')
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [isSpeakingAnalysis, setIsSpeakingAnalysis] = useState(false)

  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setIsRecognitionSupported(voiceInputService.isSupported())
  }, [])

  useEffect(() => {
    return () => {
      speechService.cancel()
      voiceInputService.stopListening()
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  // Sample prompt chips for quick tapping
  const samplePrompts =
    language === 'hi'
      ? [
          'आज धान का क्या भाव है?',
          'व्यापारी 1800 दे रहा है क्या करूं?',
          'मेरी फसल कैसी है?',
          'पास में कौन सी मिल है?',
        ]
      : [
          'What is the paddy price today?',
          'Broker offered 1800, is it fair?',
          'How is my satellite crop health?',
          'Which mills are buying nearby?',
        ]

  // Handle Photo Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    setImageError('')
    setQualityWarning('')
    setAnalysisResult(null)

    // Validate MIME type
    if (!file.type || !file.type.startsWith('image/')) {
      setImageError(
        language === 'hi'
          ? 'केवल JPG, PNG, या WEBP फोटो प्रारूप समर्थित हैं।'
          : 'Only JPG, PNG, or WEBP image formats are supported.'
      )
      return
    }

    // Validate File Size (Max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setImageError(
        language === 'hi'
          ? 'फोटो का आकार 10 MB से कम होना चाहिए।'
          : 'Photo size must be less than 10 MB.'
      )
      return
    }

    // Revoke old URL if exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    const objectUrl = URL.createObjectURL(file)
    setSelectedImage(file)
    setImagePreview(objectUrl)

    // Basic Quality Check
    const img = new Image()
    img.src = objectUrl
    img.onload = () => {
      if (img.width < 150 || img.height < 150) {
        setQualityWarning(
          language === 'hi'
            ? 'फोटो बहुत धुंधली या छोटी है। कृपया फसल की साफ और पास से फोटो लें।'
            : 'The photo is too blurry or small. Please take a clear photo of the crop from closer.'
        )
      }
    }
  }

  // Clear/Remove Photo
  const handleRemovePhoto = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setSelectedImage(null)
    setImagePreview(null)
    setImageError('')
    setQualityWarning('')
    setAnalysisResult(null)
    setIsSpeakingAnalysis(false)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Execute AI Vision Analysis for Farm Photo
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return

    setIsAnalyzingImage(true)
    setImageError('')
    setQueryText('')
    setResponseResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('language', language)
      formData.append('crop', user?.crop || 'Paddy')
      formData.append('variety', user?.variety || 'Common')
      formData.append('village', user?.village || '')
      formData.append('district', user?.district || '')
      formData.append('state', user?.state || '')
      formData.append('sowingDate', user?.sowingDate || '')
      formData.append('transplantingDate', user?.transplantingDate || '')
      formData.append('farmerQuestion', manualInput || '')

      const response = await apiService.analyzeFarmImage(formData)

      if (response && response.success && response.analysis) {
        setAnalysisResult(response.analysis)
      } else {
        throw new Error(response?.message || (
          language === 'hi'
            ? 'फोटो का विश्लेषण अभी नहीं हो सका। कृपया कुछ देर बाद फिर प्रयास करें।'
            : "We couldn't analyze the photo right now. Please try again."
        ))
      }
    } catch (err) {
      console.error('Photo analysis failure:', err.message)
      setImageError(
        err.message || (
          language === 'hi'
            ? 'फोटो का विश्लेषण अभी नहीं हो सका। कृपया कुछ देर बाद फिर प्रयास करें।'
            : "We couldn't analyze the photo right now. Please try again."
        )
      )
    } finally {
      setIsAnalyzingImage(false)
    }
  }

  // Speak Vision Analysis Audio Summary
  const handleSpeakAnalysisSummary = async () => {
    if (!analysisResult) return

    if (isSpeakingAnalysis) {
      speechService.cancel()
      setIsSpeakingAnalysis(false)
      return
    }

    const textToSpeak =
      analysisResult.spokenSummary ||
      analysisResult.healthSummary ||
      (language === 'hi'
        ? 'फसल फोटो का विश्लेषण पूरा हो गया है।'
        : 'Crop photo analysis is complete.')

    setIsSpeakingAnalysis(true)
    await speechService.speak(textToSpeak, language, {
      speed: user?.voiceSpeed || 'slow',
      onEnd: () => setIsSpeakingAnalysis(false),
      onError: () => setIsSpeakingAnalysis(false),
    })
  }

  // Execute Intent Resolution & Automatic Speech
  const processAndSpeakAnswer = async (question) => {
    if (!question || question.trim() === '') return

    setStatus('PROCESSING')
    setQueryText(question)
    setResponseResult(null)

    try {
      // Build dynamic farmer context from authenticated user profile
      const aiContext = {
        language,
        crop: user?.crop || 'Paddy',
        variety: user?.variety || 'Common',
        village: user?.village || null,
        district: user?.district || null,
        state: user?.state || null,
        user,
      }

      let result = null

      // Attempt AI backend advisory service first
      try {
        const apiRes = await apiService.getAdvisory(question, aiContext)
        if (apiRes && apiRes.success && apiRes.answer) {
          result = {
            displayText: apiRes.answer,
            spokenText: apiRes.answer,
          }
        }
      } catch (apiErr) {
        console.warn('Backend AI Advisory notice, using local voiceAssistantService:', apiErr.message)
      }

      // Fallback to client-side voice assistant service if backend API is not available
      if (!result || !result.displayText) {
        result = voiceAssistantService.processQuery(question, { user, language }, language)
      }

      setResponseResult(result)
      setStatus('SPEAKING')

      await speechService.speak(result.spokenText, language, {
        speed: user?.voiceSpeed || 'slow',
        onEnd: () => setStatus('IDLE'),
        onError: () => setStatus('IDLE'),
      })
    } catch (err) {
      setStatus('ERROR')
      setErrorMessage(
        language === 'hi'
          ? 'क्षमा करें, जानकारी खोजने में समस्या आई। फिर से प्रयास करें।'
          : 'Sorry, could not fetch information. Please try again.'
      )
    }
  }

  // Start Mic Listening
  const handleStartListening = () => {
    speechService.cancel()

    if (!isRecognitionSupported) {
      return
    }

    setStatus('LISTENING')
    setErrorMessage('')

    const started = voiceInputService.startListening({
      language,
      onResult: (transcript) => {
        setStatus('PROCESSING')
        processAndSpeakAnswer(transcript)
      },
      onError: () => {
        setStatus('ERROR')
        setErrorMessage(
          language === 'hi'
            ? 'मुझे आपकी बात ठीक से समझ नहीं आई। कृपया फिर से पूछें।'
            : 'Could not hear clearly. Please tap and ask again.'
        )
      },
      onEnd: () => {},
    })

    if (!started) {
      setStatus('ERROR')
      setErrorMessage(
        language === 'hi'
          ? 'माइक शुरू करने में समस्या आई। कृपया टाइप करें।'
          : 'Could not start microphone. Please type your query.'
      )
    }
  }

  // Stop Speech Output
  const handleStopSpeaking = () => {
    speechService.cancel()
    setStatus('IDLE')
  }

  // Replay Speech Output
  const handleReplaySpeaking = async () => {
    if (!responseResult) return
    setStatus('SPEAKING')
    await speechService.speak(responseResult.spokenText, language, {
      speed: user?.voiceSpeed || 'slow',
      onEnd: () => setStatus('IDLE'),
      onError: () => setStatus('IDLE'),
    })
  }

  // Handle Manual Form Submit
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    const text = manualInput
    setManualInput('')
    processAndSpeakAnswer(text)
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0F3D2E] via-[#163D32] to-[#0F3D2E] p-6 text-white shadow-2xl border border-white/15 ${className}`}
    >
      {/* Hidden Native File Inputs for Camera and Upload */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelect}
        className="hidden"
        aria-label="Take farm photo with camera"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
        aria-label="Upload farm photo from device"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C5D86D] text-[#0F3D2E]">
            <Wheat size={20} />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white md:text-lg">
              GramSetu Krishi Saathi (कृषि साथी)
            </h3>
            <p className="text-xs text-[#C5D86D]">
              {language === 'hi' ? 'वॉइस एवं कैमरा AI कृषि सहायक' : 'Voice & Camera AI Farming Assistant'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {status === 'LISTENING' && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/30 px-3 py-1 text-xs font-bold text-red-200 border border-red-400/40 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-400"></span>
            {language === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
          </span>
        )}
        {status === 'PROCESSING' && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/30 px-3 py-1 text-xs font-bold text-amber-200 border border-amber-400/40 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-amber-300"></span>
            {language === 'hi' ? 'खोज रहा हूँ...' : 'Processing...'}
          </span>
        )}
        {status === 'SPEAKING' && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#C5D86D]/30 px-3 py-1 text-xs font-bold text-[#C5D86D] border border-[#C5D86D]/40 animate-pulse">
            <Volume2 size={14} className="animate-bounce" />
            {language === 'hi' ? 'बोल रहा हूँ...' : 'Answering...'}
          </span>
        )}
        {isAnalyzingImage && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#C5D86D]/30 px-3 py-1 text-xs font-bold text-[#C5D86D] border border-[#C5D86D]/40 animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            {language === 'hi' ? 'फोटो विश्लेषण...' : 'Analyzing Photo...'}
          </span>
        )}
      </div>

      {/* Main Interactive Centerpiece: Mic + Camera Actions */}
      <div className="my-6 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-white/80 mb-4">
          {status === 'LISTENING'
            ? language === 'hi' ? 'कृपया अपना सवाल बोलें...' : 'Please speak your question...'
            : status === 'PROCESSING'
            ? language === 'hi' ? 'ग्रामसेतु डेटा से जानकारी जुटाई जा रही है...' : 'Fetching data from GramSetu...'
            : isAnalyzingImage
            ? language === 'hi' ? 'आपकी फसल की फोटो का विश्लेषण हो रहा है...' : 'Analyzing your crop photo...'
            : language === 'hi' ? 'बोलकर पूछें या फसल की फोटो लें:' : 'Ask by voice or capture crop photo:'}
        </p>

        {/* Large Accessible Microphone & Camera Row */}
        <div className="flex items-center justify-center gap-4">
          {/* Camera Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current && cameraInputRef.current.click()}
            title={language === 'hi' ? 'कैमरा से फोटो लें' : 'Take photo with camera'}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/25 hover:text-[#C5D86D] border border-white/20 transition-all active:scale-95 shadow-md"
          >
            <Camera size={22} />
          </button>

          {/* Large Microphone Button */}
          <div className="relative">
            {status === 'LISTENING' && (
              <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping pointer-events-none"></div>
            )}
            {status === 'SPEAKING' && (
              <div className="absolute -inset-4 rounded-full bg-[#C5D86D]/30 animate-ping pointer-events-none"></div>
            )}

            <button
              type="button"
              onClick={status === 'SPEAKING' ? handleStopSpeaking : handleStartListening}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
                status === 'LISTENING'
                  ? 'bg-red-600 text-white ring-4 ring-red-400 scale-110'
                  : status === 'SPEAKING'
                  ? 'bg-[#C5D86D] text-[#0F3D2E] ring-4 ring-white scale-105'
                  : 'bg-[#C5D86D] text-[#0F3D2E] hover:bg-white hover:scale-105'
              }`}
              aria-label={
                status === 'LISTENING'
                  ? 'Stop listening'
                  : status === 'SPEAKING'
                  ? 'Stop speaking'
                  : 'Tap to speak question'
              }
            >
              {status === 'LISTENING' ? (
                <MicOff size={32} />
              ) : status === 'SPEAKING' ? (
                <Square size={28} className="fill-[#0F3D2E]" />
              ) : (
                <Mic size={34} />
              )}
            </button>
          </div>

          {/* Upload Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title={language === 'hi' ? 'फोटो अपलोड करें' : 'Upload photo'}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white hover:bg-white/25 hover:text-[#C5D86D] border border-white/20 transition-all active:scale-95 shadow-md"
          >
            <Upload size={22} />
          </button>
        </div>

        {/* Action Label */}
        <p className="mt-3 text-xs font-bold tracking-wider text-[#C5D86D] uppercase">
          {status === 'LISTENING'
            ? language === 'hi' ? 'माइक चालू है' : 'Mic Active'
            : status === 'SPEAKING'
            ? language === 'hi' ? 'जवाब रोकने के लिए दबाएं' : 'Tap to Stop Answer'
            : language === 'hi' ? 'बोलें • फोटो लें • अपलोड करें' : 'Voice • Camera • Upload'}
        </p>
      </div>

      {/* Selected Image Preview & Action Controls */}
      {imagePreview && (
        <div className="mb-5 rounded-2xl bg-white/10 p-4 border border-white/20 backdrop-blur-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#C5D86D] flex items-center gap-1.5 uppercase tracking-wider">
              <FileImage size={14} />
              <span>{language === 'hi' ? 'चयनित फसल फोटो' : 'Selected Farm Photo'}</span>
            </span>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 border border-red-400/30 hover:bg-red-500/30 transition-colors"
            >
              <X size={12} />
              <span>{language === 'hi' ? 'फोटो हटाएँ' : 'Remove Photo'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <img
              src={imagePreview}
              alt="Farm crop preview"
              className="h-32 w-32 rounded-2xl object-cover border-2 border-[#C5D86D]/60 shadow-md shrink-0"
            />
            <div className="flex-1 space-y-2 text-left w-full">
              <p className="text-xs text-white/80 font-medium">
                {selectedImage ? `${selectedImage.name} (${(selectedImage.size / (1024 * 1024)).toFixed(2)} MB)` : ''}
              </p>

              {qualityWarning && (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 p-2 text-xs text-amber-200 border border-amber-400/30">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{qualityWarning}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyzePhoto}
                disabled={isAnalyzingImage}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#C5D86D] px-5 py-2.5 text-xs font-extrabold text-[#0F3D2E] uppercase hover:bg-white transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isAnalyzingImage ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{language === 'hi' ? 'फसल का विश्लेषण करें' : 'Analyze Farm'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Validation & Processing Error Display with Retry */}
      {imageError && (
        <div className="mb-4 rounded-2xl bg-red-500/20 p-4 text-xs text-red-200 border border-red-400/30 text-center font-semibold space-y-3 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={18} className="shrink-0 text-red-300" />
            <span>{imageError}</span>
          </div>
          {selectedImage && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleAnalyzePhoto}
                disabled={isAnalyzingImage}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-1.5 text-xs font-bold text-white transition border border-white/30 disabled:opacity-50"
              >
                <RefreshCw size={13} className={isAnalyzingImage ? 'animate-spin' : ''} />
                <span>{isAnalyzingImage ? (language === 'hi' ? 'विश्लेषण हो रहा है...' : 'Analyzing...') : (language === 'hi' ? 'दोबारा प्रयास करें' : 'Try Again')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Structured Farm Vision Analysis Report Card */}
      {analysisResult && (
        <div className="mb-6 rounded-3xl bg-white/10 p-5 border border-white/20 backdrop-blur-md space-y-4 text-left">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#C5D86D] text-[#0F3D2E]">
                <Sprout size={18} />
              </span>
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{language === 'hi' ? 'फसल फोटो विश्लेषण रिपोर्ट' : 'Farm Photo Analysis Report'}</span>
                  {analysisResult.cropConfidence && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-[#C5D86D] flex items-center gap-1">
                      <BadgeCheck size={12} />
                      <span>{analysisResult.cropConfidence}</span>
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-[#C5D86D] font-medium mt-0.5">
                  {analysisResult.crop || (language === 'hi' ? 'धान (Paddy)' : 'Paddy')}
                </p>
              </div>
            </div>

            {/* Listen / Replay Audio Button */}
            <button
              type="button"
              onClick={handleSpeakAnalysisSummary}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition border ${
                isSpeakingAnalysis
                  ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                  : 'bg-white/20 text-white hover:bg-white/30 border-white/20'
              }`}
            >
              <Volume2 size={14} className={isSpeakingAnalysis ? 'animate-bounce' : ''} />
              <span>{isSpeakingAnalysis ? (language === 'hi' ? 'बोल रहे हैं...' : 'Speaking...') : (language === 'hi' ? 'सुनें' : 'Listen')}</span>
            </button>
          </div>

          {/* Low Quality Photo Alert */}
          {analysisResult.imageQuality === 'poor' && (
            <div className="rounded-2xl bg-amber-500/20 p-3 text-xs text-amber-200 border border-amber-400/30 flex items-center gap-2 font-medium">
              <ImageIcon size={16} className="shrink-0 text-amber-300" />
              <span>{language === 'hi' ? 'फोटो स्पष्ट नहीं है। कृपया पौधे की पत्तियों और फसल का थोड़ा नज़दीक से साफ फोटो लें।' : 'Photo is unclear. Please take a clearer close-up photograph of the crop leaves.'}</span>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/60 flex items-center gap-1">
                <TrendingUp size={12} className="text-[#C5D86D]" />
                <span>{language === 'hi' ? 'विकास अवस्था' : 'Growth Stage'}</span>
              </span>
              <span className="text-xs font-bold text-white mt-1 block">
                {analysisResult.growthStage || (language === 'hi' ? 'बालियाँ बनने की अवस्था' : 'Panicle Development')}
              </span>
            </div>

            <div className="rounded-2xl bg-white/10 p-3 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/60 flex items-center gap-1">
                <HeartPulse size={12} className="text-[#C5D86D]" />
                <span>{language === 'hi' ? 'फसल स्वास्थ्य' : 'Crop Health'}</span>
              </span>
              <span className="text-xs font-extrabold text-[#C5D86D] mt-1 flex items-center gap-1">
                <CheckCircle2 size={14} />
                <span>{analysisResult.healthStatus === 'healthy' ? (language === 'hi' ? 'उत्तम (Healthy)' : 'Healthy') : (language === 'hi' ? 'ध्यान देने योग्य (Attention Needed)' : 'Attention Needed')}</span>
              </span>
            </div>
          </div>

          {/* Summary */}
          {analysisResult.healthSummary && (
            <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] font-bold text-[#C5D86D] uppercase tracking-wider block">
                {language === 'hi' ? 'स्वास्थ्य सारांश:' : 'Health Overview:'}
              </span>
              <p className="text-xs leading-relaxed text-white/95 font-medium">
                {analysisResult.healthSummary}
              </p>
            </div>
          )}

          {/* Symptoms & Possible Issues */}
          <div className="grid gap-3 sm:grid-cols-2">
            {analysisResult.visibleSymptoms && analysisResult.visibleSymptoms.length > 0 && (
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-[#C5D86D] uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>{language === 'hi' ? 'दिखाई देने वाले लक्षण:' : 'Visible Symptoms:'}</span>
                </span>
                <ul className="space-y-1 text-xs text-white/90">
                  {analysisResult.visibleSymptoms.map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#C5D86D]">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.possibleIssues && analysisResult.possibleIssues.length > 0 && (
              <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-[#C5D86D] uppercase tracking-wider flex items-center gap-1">
                  <Info size={13} />
                  <span>{language === 'hi' ? 'संभावित कारण:' : 'Possible Causes:'}</span>
                </span>
                <ul className="space-y-1 text-xs text-white/90">
                  {analysisResult.possibleIssues.map((iss, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-300">•</span>
                      <span>{iss}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Estimated Harvest Window Range */}
          {analysisResult.estimatedHarvestWindow && (
            <div className="flex items-center gap-2 rounded-2xl bg-[#C5D86D]/20 p-3 border border-[#C5D86D]/30 text-xs font-semibold text-white">
              <CalendarDays size={18} className="text-[#C5D86D] shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5D86D] block">
                  {language === 'hi' ? 'कटाई का अनुमान (Estimated Harvest Window):' : 'Estimated Harvest Window:'}
                </span>
                <span>{analysisResult.estimatedHarvestWindow}</span>
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {analysisResult.recommendedActions && analysisResult.recommendedActions.length > 0 && (
            <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-[11px] font-bold text-[#C5D86D] uppercase tracking-wider flex items-center gap-1">
                <MessageCircle size={13} />
                <span>{language === 'hi' ? 'अभी क्या करें (Recommended Next Steps):' : 'Recommended Next Steps:'}</span>
              </span>
              <ul className="space-y-1 text-xs text-white/95">
                {analysisResult.recommendedActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#C5D86D]">✓</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer Box */}
          <div className="rounded-2xl bg-white/5 p-2.5 text-[11px] text-white/70 border border-white/10 italic flex items-start gap-1.5">
            <ShieldAlert size={14} className="shrink-0 text-amber-300 mt-0.5" />
            <span>
              {analysisResult.disclaimer ||
                (language === 'hi'
                  ? 'यह विश्लेषण केवल फोटो पर आधारित एक प्रारंभिक आकलन है। सटीक निदान के लिए प्रत्यक्ष निरीक्षण आवश्यक है।'
                  : 'This analysis is a preliminary assessment based solely on the photograph. Direct field inspection is recommended.')}
            </span>
          </div>


          {/* Retake Photo Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center gap-1.5 rounded-2xl bg-white/15 px-4 py-2 text-xs font-bold text-white hover:bg-white/25 border border-white/20 transition-all"
            >
              <RefreshCw size={14} />
              <span>{language === 'hi' ? 'दूसरी फोटो लें' : 'Take Another Photo'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Question & Voice Answer Display Box */}
      {queryText && (
        <div className="mb-5 rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C5D86D] mb-1">
            <MessageSquare size={14} />
            <span>{language === 'hi' ? 'आपका सवाल:' : 'Your Question:'}</span>
            <span className="text-white italic">&quot;{queryText}&quot;</span>
          </div>

          {responseResult && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#C5D86D] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={14} />
                  <span>{language === 'hi' ? 'ग्रामसेतु उत्तर:' : 'GramSetu Answer:'}</span>
                </span>
                {status === 'SPEAKING' ? (
                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-1 rounded-full bg-red-500/30 px-3 py-1 text-xs font-bold text-white border border-red-400/30"
                  >
                    <Square size={10} className="fill-white" />
                    <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReplaySpeaking}
                    className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white hover:bg-white/25 border border-white/20"
                  >
                    <Volume2 size={12} />
                    <span>{language === 'hi' ? 'फिर सुनें' : 'Replay'}</span>
                  </button>
                )}
              </div>

              <p className="text-base font-semibold leading-relaxed text-white md:text-lg">
                {responseResult.displayText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Voice Error Message Display */}
      {status === 'ERROR' && errorMessage && (
        <div className="mb-4 rounded-2xl bg-red-500/20 p-3.5 text-xs text-red-200 border border-red-400/30 text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Clickable Sample Prompt Chips */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">
          {language === 'hi' ? 'या इन सवालों पर टैप करें:' : 'Or tap a sample question:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => processAndSpeakAnswer(prompt)}
              className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white border border-white/15 hover:bg-white/20 hover:border-[#C5D86D]/50 transition-all text-left"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Fallback Text Input */}
      <form onSubmit={handleManualSubmit} className="mt-5 flex gap-2">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder={
            language === 'hi' ? 'अपना सवाल यहाँ लिखें...' : 'Type your question here...'
          }
          className="w-full rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/45 border border-white/15 outline-none focus:border-[#C5D86D]"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[#C5D86D] px-4 py-2.5 text-xs font-bold text-[#0F3D2E] uppercase hover:bg-white transition-colors shrink-0 flex items-center gap-1 shadow-md"
        >
          <Send size={14} />
          <span>{language === 'hi' ? 'पूछें' : 'Ask'}</span>
        </button>
      </form>
    </div>
  )
}
