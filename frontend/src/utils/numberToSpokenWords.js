// GramSetu Natural Spoken Number Utility for Hindi & English
// Converts numerical values (e.g. 2150, 1800, 17500, 480) to natural spoken text

const HINDI_UNITS = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पांच', 'छह', 'सात', 'आठ', 'नौ',
  'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस',
  'बीस', 'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस',
  'तीस', 'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस',
  'चालीस', 'इकतालीस', 'बयालीस', 'तैंतालीस', 'चौंतालिस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास',
  'पचास', 'इक्यावन', 'बावन', 'तिर्पन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्टावन', 'उनसठ',
  'साठ', 'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सरसठ', 'अड़सठ', 'उनहत्तर',
  'सत्तर', 'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उनासी',
  'अस्सी', 'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अट्ठासी', 'नवासी',
  'नब्बे', 'इक्यान्वे', 'बयान्वे', 'तिरान्वे', 'चौरान्वे', 'पञ्चान्वे', 'छियान्वे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे'
]

const ENGLISH_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
]

const ENGLISH_TENS = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
]

/**
 * Converts a integer number to natural Hindi words
 */
export function numberToHindiWords(num) {
  num = Math.floor(Math.abs(Number(num) || 0))
  if (num === 0) return HINDI_UNITS[0]

  let words = ''

  // Lakhs
  if (num >= 100000) {
    const lakhs = Math.floor(num / 100000)
    words += numberToHindiWords(lakhs) + ' लाख '
    num %= 100000
  }

  // Thousands
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000)
    words += HINDI_UNITS[thousands] + ' हजार '
    num %= 1000
  }

  // Hundreds
  if (num >= 100) {
    const hundreds = Math.floor(num / 100)
    words += HINDI_UNITS[hundreds] + ' सौ '
    num %= 100
  }

  // Remaining 1-99
  if (num > 0) {
    words += HINDI_UNITS[num] + ' '
  }

  return words.trim()
}

/**
 * Converts an integer number to natural English words
 */
export function numberToEnglishWords(num) {
  num = Math.floor(Math.abs(Number(num) || 0))
  if (num === 0) return ENGLISH_UNITS[0]

  let words = ''

  if (num >= 100000) {
    const lakhs = Math.floor(num / 100000)
    words += numberToEnglishWords(lakhs) + ' hundred thousand '
    num %= 100000
  }

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000)
    words += numberToEnglishWords(thousands) + ' thousand '
    num %= 1000
  }

  if (num >= 100) {
    const hundreds = Math.floor(num / 100)
    words += ENGLISH_UNITS[hundreds] + ' hundred '
    num %= 100
  }

  if (num >= 20) {
    const tens = Math.floor(num / 10)
    const rem = num % 10
    words += ENGLISH_TENS[tens] + (rem ? ' ' + ENGLISH_UNITS[rem] : '') + ' '
  } else if (num > 0) {
    words += ENGLISH_UNITS[num] + ' '
  }

  return words.trim()
}

/**
 * Returns natural spoken price statement
 */
export function formatSpokenPrice(amount, lang = 'hi', suffix = '') {
  const n = Number(amount) || 0
  if (lang === 'hi') {
    const words = numberToHindiWords(n)
    const unitText = suffix ? ` ${suffix}` : ' रुपये'
    return `${words}${unitText}`
  } else {
    const words = numberToEnglishWords(n)
    const unitText = suffix ? ` ${suffix}` : ' rupees'
    return `${words}${unitText}`
  }
}
