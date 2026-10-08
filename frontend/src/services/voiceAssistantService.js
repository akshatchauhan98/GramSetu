// Krishi Saathi AI Voice Assistant Service

import { numberToEnglishWords, numberToHindiWords } from '../utils/numberToSpokenWords'

class VoiceAssistantService {
  constructor() {
    this.conversationContext = {
      lastIntent: null,
      lastTopic: null,
      turnCount: 0,
    }
  }

  processQuery(rawQuery, contextOrUser = {}, languageOverride) {
    const q = (rawQuery || '').toLowerCase().trim()

    // Resolve language & user details safely
    let lang = 'hi'
    let user = {}

    if (typeof contextOrUser === 'string') {
      lang = contextOrUser
    } else if (contextOrUser && typeof contextOrUser === 'object') {
      if (contextOrUser.language) {
        lang = contextOrUser.language
        user = contextOrUser.user || contextOrUser
      } else {
        user = contextOrUser
        lang = languageOverride || 'hi'
      }
    } else if (languageOverride) {
      lang = languageOverride
    }

    // Force strict language setting
    lang = lang === 'hi' ? 'hi' : 'en'

    const name = user.name || (lang === 'hi' ? 'किसान' : 'Farmer')
    const village = user.village || null
    const crop = (user.crop || 'Paddy').toLowerCase()

    // Parse numeric values inside user voice query
    const numbersInQuery = (q.match(/\d+/g) || []).map(Number)

    // ------------------------------------------------------------------
    // INTENT 1: BROKER OFFER & SELLING DECISION CHECK
    // ------------------------------------------------------------------
    const isBrokerIntent =
      q.includes('दलाल') ||
      q.includes('ब्रोकर') ||
      q.includes('ऑफर') ||
      q.includes('दे रहा') ||
      q.includes('नुकसान') ||
      q.includes('बेचाऊँ') ||
      q.includes('बेचूं') ||
      q.includes('बेचें') ||
      q.includes('बेचना') ||
      q.includes('बेचाऊ') ||
      q.includes('ब्रोकन') ||
      q.includes('broker') ||
      q.includes('trader') ||
      q.includes('offered') ||
      q.includes('offer') ||
      q.includes('sell') ||
      q.includes('selling') ||
      (numbersInQuery.length > 0 && (q.includes('दे') || q.includes('सही') || q.includes('रेट') || q.includes('भाव') || q.includes('में')))

    if (isBrokerIntent) {
      this.conversationContext.lastIntent = 'CHECK_BROKER'

      let brokerPrice = numbersInQuery.find((n) => n >= 1000 && n <= 5000) || 1800
      let qty = numbersInQuery.find((n) => n > 0 && n <= 500 && n !== brokerPrice) || 50

      const mspPrice = crop === 'wheat' ? 2585 : 2441
      const gap = mspPrice - brokerPrice
      const totalLoss = gap * qty

      let displayText = ''
      let spokenText = ''

      if (lang === 'hi') {
        if (gap > 0) {
          displayText = `यदि आपको ₹${brokerPrice} प्रति क्विंटल का ऑफर मिल रहा है, तो ध्यान दें कि खरीफ विपणन सत्र 2026-27 के लिए धान (सामान्य) का सरकारी MSP ₹${mspPrice} प्रति क्विंटल है। यह ₹${brokerPrice} का भाव MSP से ₹${gap} कम है। ${qty} क्विंटल बेचने पर आपका अनुमानित अंतर ₹${totalLoss.toLocaleString('en-IN')} हो सकता है। जल्दबाजी न करें, पास की राइस मिल या FPO से बेहतर दरों की तुलना करें।`
          spokenText = `यदि आपको ${numberToHindiWords(brokerPrice)} रुपये का भाव मिल रहा है, तो यह सरकारी एमएसपी से ${numberToHindiWords(gap)} रुपये कम है। ${numberToHindiWords(qty)} क्विंटल पर अनुमानित अंतर ${numberToHindiWords(totalLoss)} रुपये हो सकता है। पास की मिलों से तुलना करके ही सौदा करें।`
        } else {
          displayText = `₹${brokerPrice} प्रति क्विंटल का ऑफर सरकारी MSP (₹${mspPrice}) के अनुकूल है। फिर भी मंडी और मिल की वास्तविक दरों की जाँच करना लाभदायक रहेगा।`
          spokenText = `${numberToHindiWords(brokerPrice)} रुपये प्रति क्विंटल का भाव सरकारी एमएसपी के अनुकूल है।`
        }
      } else {
        if (gap > 0) {
          displayText = `If you are receiving an offer of ₹${brokerPrice}/q, please note that official Govt MSP for Paddy (Common) is ₹${mspPrice}/q. This offer is ₹${gap} below MSP. For ${qty} quintals, your estimated gap is ₹${totalLoss.toLocaleString('en-IN')}. Consider checking rates with nearby mills or your local FPO before deciding.`
          spokenText = `If you are offered ${numberToEnglishWords(brokerPrice)} rupees, that is ${numberToEnglishWords(gap)} rupees below official Govt MSP. Consider checking nearby mill rates before selling.`
        } else {
          displayText = `An offer of ₹${brokerPrice}/q aligns well with the official Govt MSP (₹${mspPrice}/q).`
          spokenText = `An offer of ${numberToEnglishWords(brokerPrice)} rupees per quintal aligns with Govt MSP.`
        }
      }

      return {
        intent: 'CHECK_BROKER',
        query: rawQuery,
        displayText,
        spokenText,
        data: { brokerPrice, mspPrice, gap, totalLoss, qty },
      }
    }

    // ------------------------------------------------------------------
    // INTENT 2: HARVEST TIMING
    // ------------------------------------------------------------------
    const isHarvestIntent =
      q.includes('कटाई') ||
      q.includes('काटना') ||
      q.includes('पकने') ||
      q.includes('harvest') ||
      q.includes('reap') ||
      q.includes('maturation')

    if (isHarvestIntent) {
      this.conversationContext.lastIntent = 'HARVEST_TIMING'
      let displayText = ''
      let spokenText = ''

      if (lang === 'hi') {
        displayText = `धान की कटाई में रोपाई/बुवाई की तारीख और फसल की किस्म के आधार पर आमतौर पर लगभग 20 से 30 दिन का समय लग सकता है। यह केवल एक अनुमान है। वास्तविक कटाई मौसम और खेत की स्थिति पर निर्भर करेगी।`
        spokenText = `धान की कटाई में आमतौर पर लगभग 20 से 30 दिन लग सकते हैं। यह केवल एक अनुमान है।`
      } else {
        displayText = `Crop harvest timing depends on variety, sowing date, and field conditions. Typically, paddy harvest is estimated within an approximate window of 20 to 30 days.`
        spokenText = `Paddy harvest is typically estimated within an approximate window of 20 to 30 days.`
      }

      return {
        intent: 'HARVEST_TIMING',
        query: rawQuery,
        displayText,
        spokenText,
        data: { estimatedHarvestWindow: '20-30 days' },
      }
    }

    // ------------------------------------------------------------------
    // INTENT 3: SATELLITE / CROP HEALTH
    // ------------------------------------------------------------------
    const isSatelliteIntent =
      q.includes('सैटेलाइट') ||
      q.includes('स्वास्थ्य') ||
      q.includes('फसल कैसी') ||
      q.includes('उपज') ||
      q.includes('ndvi') ||
      q.includes('satellite') ||
      q.includes('crop health') ||
      q.includes('how is my crop') ||
      q.includes('yield')

    if (isSatelliteIntent) {
      this.conversationContext.lastIntent = 'SATELLITE_CROP'

      // Check if user explicitly asks about a specific demo village (e.g. Rampur)
      const isExplicitRampurQuery = q.includes('रामपुर') || q.includes('rampur')
      const targetVillage = isExplicitRampurQuery
        ? (lang === 'hi' ? 'रामपुर' : 'Rampur')
        : village

      let displayText = ''
      let spokenText = ''

      if (isExplicitRampurQuery) {
        const ndvi = 0.74
        const estSupply = 480
        if (lang === 'hi') {
          displayText = `रामपुर गाँव में सैटेलाइट आधारित फसल स्वास्थ्य सूचकांक ${ndvi} (उत्तम फसल) है। हमारे मॉडल अनुमान के अनुसार संभावित आपूर्ति ${estSupply} टन है।`
          spokenText = `रामपुर गाँव में सैटेलाइट आधारित फसल स्वास्थ्य सूचकांक शून्य दशमलव सात चार है। हमारे अनुमान के अनुसार संभावित आपूर्ति ${numberToHindiWords(estSupply)} टन है।`
        } else {
          displayText = `Rampur village has a satellite-based crop health index of ${ndvi} (Good Crop). The estimated potential supply is ${estSupply} tonnes.`
          spokenText = `Rampur village has a satellite-based crop health index of zero point seven four. The estimated potential supply is ${numberToEnglishWords(estSupply)} tonnes.`
        }
      } else if (targetVillage) {
        if (lang === 'hi') {
          displayText = `${targetVillage} के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है।`
          spokenText = `${targetVillage} के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है।`
        } else {
          displayText = `Current satellite-based crop health data is not available for ${targetVillage}.`
          spokenText = `Current satellite-based crop health data is not available for ${targetVillage}.`
        }
      } else {
        if (lang === 'hi') {
          displayText = `आपकी लोकेशन के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है।`
          spokenText = `आपकी लोकेशन के लिए वर्तमान उपग्रह आधारित फसल स्वास्थ्य डेटा उपलब्ध नहीं है।`
        } else {
          displayText = `Current satellite-based crop health data is not available for your location.`
          spokenText = `Current satellite-based crop health data is not available for your location.`
        }
      }

      return {
        intent: 'SATELLITE_CROP',
        query: rawQuery,
        displayText,
        spokenText,
        data: { village: targetVillage, hasSatelliteData: isExplicitRampurQuery },
      }
    }

    // ------------------------------------------------------------------
    // INTENT 4: NEARBY MILLS / BUYERS
    // ------------------------------------------------------------------
    const isMillIntent =
      q.includes('मिल') ||
      q.includes('मिल्स') ||
      q.includes('खरीदार') ||
      q.includes('खरीद') ||
      q.includes('mill') ||
      q.includes('mills') ||
      q.includes('buyer') ||
      q.includes('buyers')

    if (isMillIntent) {
      this.conversationContext.lastIntent = 'NEARBY_MILLS'
      const millName = 'Shree Rice Mill'
      const dist = 4.2

      let displayText = ''
      let spokenText = ''

      if (lang === 'hi') {
        const vText = village ? `आपके गाँव (${village})` : 'आपके क्षेत्र'
        displayText = `${vText} के पास '${millName}' (${dist} किमी दूर) पंजीकृत राइस मिल है। सीधी खरीद के लिए संपर्क करें।`
        spokenText = `आपके पास श्री राइस मिल चार दशमलव दो किलोमीटर दूर उपलब्ध है।`
      } else {
        const vText = village ? `Near your village (${village})` : 'In your region'
        displayText = `${vText}, '${millName}' (${dist} km away) is registered for direct procurement.`
        spokenText = `Shree Rice Mill 4.2 kilometers away is available.`
      }

      return {
        intent: 'NEARBY_MILLS',
        query: rawQuery,
        displayText,
        spokenText,
        data: { millName, dist },
      }
    }

    // ------------------------------------------------------------------
    // INTENT 5: GOVERNMENT MSP & PRICES
    // ------------------------------------------------------------------
    const isPriceIntent =
      q.includes('भाव') ||
      q.includes('रेट') ||
      q.includes('दाम') ||
      q.includes('कीमत') ||
      q.includes('price') ||
      q.includes('rate') ||
      q.includes('cost') ||
      q.includes('mandi') ||
      q.includes('msp') ||
      q.includes('कितने')

    if (isPriceIntent) {
      this.conversationContext.lastIntent = 'TODAY_PRICE'
      const isWheat = crop === 'wheat' || q.includes('गेहूँ') || q.includes('wheat')
      const mspVal = isWheat ? 2585 : 2441
      const seasonText = isWheat ? 'रबी विपणन सत्र 2026-27' : 'खरीफ विपणन सत्र 2026-27'
      const seasonTextEn = isWheat ? 'Rabi Marketing Season 2026-27' : 'Kharif Marketing Season 2026-27'
      const cropLabel = isWheat ? (lang === 'hi' ? 'गेहूँ' : 'Wheat') : (lang === 'hi' ? 'धान (सामान्य)' : 'Paddy (Common)')

      let displayText = ''
      let spokenText = ''

      if (lang === 'hi') {
        displayText = `${seasonText} के लिए ${cropLabel} का भारत सरकार द्वारा निर्धारित न्यूनतम समर्थन मूल्य (MSP) ₹${mspVal} प्रति क्विंटल है। ध्यान रखें कि MSP और आज की मंडी या मिल की वास्तविक कीमत अलग हो सकती है।`
        spokenText = `${cropLabel} का भारत सरकार न्यूनतम समर्थन मूल्य ${numberToHindiWords(mspVal)} रुपये प्रति क्विंटल है।`
      } else {
        displayText = `The Govt of India MSP for ${cropLabel} for ${seasonTextEn} is ₹${mspVal}/quintal. (Mandi & mill rates are reported separately)`
        spokenText = `The Govt of India MSP for ${cropLabel} is ${numberToEnglishWords(mspVal)} rupees per quintal.`
      }

      return {
        intent: 'TODAY_PRICE',
        query: rawQuery,
        displayText,
        spokenText,
        data: { msp: mspVal, crop: cropLabel, season: seasonTextEn },
      }
    }

    // ------------------------------------------------------------------
    // FALLBACK FOR UNMATCHED SUBSTANTIVE QUESTION OR EMPTY QUESTION
    // ------------------------------------------------------------------
    if (q.length > 0) {
      const isWheat = crop === 'wheat'
      const mspVal = isWheat ? 2585 : 2441
      return {
        intent: 'GENERAL_QUESTION_FALLBACK',
        query: rawQuery,
        displayText:
          lang === 'hi'
            ? `आपके सवाल ("${rawQuery}") का उत्तर: खरीफ विपणन सत्र 2026-27 के लिए धान (सामान्य) का न्यूनतम समर्थन मूल्य ₹${mspVal}/क्विंटल है। विस्तृत तुलना या मंडी/मिल भाव की जानकारी के लिए आप विशिष्ट सवाल पूछ सकते हैं।`
            : `Answer to your question ("${rawQuery}"): The Govt MSP for Paddy (Common) is ₹${mspVal}/quintal. For specific price comparisons, feel free to ask details.`,
        spokenText:
          lang === 'hi'
            ? `धान का न्यूनतम समर्थन मूल्य ${numberToHindiWords(mspVal)} रुपये प्रति क्विंटल है।`
            : `The Govt MSP for Paddy is ${numberToEnglishWords(mspVal)} rupees per quintal.`,
      }
    }

    // State 1: No question provided yet
    return {
      intent: 'GENERAL_ASSIST',
      query: rawQuery,
      displayText:
        lang === 'hi'
          ? `नमस्ते किसान जी। मैं आपकी खेती और फसल विपणन से जुड़ी जानकारी में सहायता के लिए तैयार हूँ। अपना सवाल पूछिए।`
          : `Namaste Farmer. I am ready to assist with your agricultural and crop marketing queries. Ask your question.`,
      spokenText:
        lang === 'hi'
          ? `नमस्ते किसान जी, मैं आपकी कैसे सहायता कर सकता हूँ?`
          : `Namaste Farmer, how can I assist you today?`,
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService()
