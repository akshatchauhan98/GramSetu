import { useState, useEffect } from 'react'
import { ExternalLink, ShieldCheck, AlertCircle, Loader2, Store, Factory, Landmark, Wheat } from 'lucide-react'
import { apiService } from '../services/apiService'
import { useLanguage } from '../context/LanguageContext'
import { useUser } from '../context/UserContext'

const fmt = (n) => typeof n === 'number' ? n.toLocaleString('en-IN') : n

export default function MspCard({ cropName, selectedCropKey }) {
  const { language } = useLanguage()
  const { user } = useUser()

  const [compareData, setCompareData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const effectiveCrop = (cropName || selectedCropKey || 'Paddy').trim()
  const userDistrict = user?.district || 'Ghazipur'
  const userState = user?.state || 'Uttar Pradesh'

  useEffect(() => {
    let isMounted = true

    async function fetchComparePrices() {
      if (!effectiveCrop) return

      setLoading(true)
      setError(null)

      try {
        const response = await apiService.getComparePrices({
          crop: effectiveCrop,
          state: userState,
          district: userDistrict
        })

        if (isMounted) {
          if (response && response.success) {
            setCompareData(response)
          } else {
            setCompareData(null)
            setError(language === 'hi' ? 'मूल्य तुलना डेटा उपलब्ध नहीं है।' : 'Price comparison data is unavailable.')
          }
        }
      } catch (err) {
        if (isMounted) {
          setCompareData(null)
          setError(language === 'hi' ? 'बाज़ार मूल्य लोड करने में असमर्थ।' : 'Unable to load market prices.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchComparePrices()

    return () => {
      isMounted = false
    }
  }, [effectiveCrop, userDistrict, userState, language])

  const msp = compareData?.msp
  const mandi = compareData?.mandi
  const millOffers = compareData?.millOffers || []
  const topMillOffer = millOffers.length > 0 ? millOffers[0] : null

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl shadow-[#0F3D2E]/8 border border-[#0F3D2E]/10 space-y-6">
      {/* Card Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0F3D2E]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F2EC] text-[#1F6B4A]">
            <Wheat className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0F3D2E]">
              {compareData?.crop || effectiveCrop} — {language === 'hi' ? 'वास्तविक बाज़ार एवं एमएसपी तुलना' : 'Real Market & MSP Comparison'}
            </h3>
            <p className="text-xs font-medium text-[#5C6B63]">
              {language === 'hi' 
                ? `स्थान: ${userDistrict}, ${userState} | सत्यापित सरकारी एवं मिल डेटा` 
                : `Location: ${userDistrict}, ${userState} | Verified Government & Mill Data`}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2EC] px-3.5 py-1 text-xs font-bold text-[#1F6B4A]">
          <ShieldCheck className="h-4 w-4" />
          {topMillOffer && topMillOffer.offerPrice > 0
            ? (language === 'hi' ? 'सरकारी, मंडी एवं मिल डेटा' : 'Government, Market & Mill Data')
            : (language === 'hi' ? 'सरकारी एवं मंडी डेटा' : 'Government & Market Data')}
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 text-[#1F6B4A]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm font-semibold">
            {language === 'hi' ? 'नवीनतम एमएसपी, मंडी एवं मिल भाव लोड हो रहे हैं...' : 'Loading latest MSP, Mandi & Mill prices...'}
          </span>
        </div>
      )}

      {/* Error / Failure Banner */}
      {!loading && error && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800 border border-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* THREE DISTINCT SECTIONS GRID: Government MSP | Mandi Price | Mill Offer */}
      {!loading && compareData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* 1. GOVERNMENT MSP CARD */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#F4F8F5] p-5 border border-[#1F6B4A]/20 transition hover:border-[#1F6B4A] shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-[#1F6B4A]/10 pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-[#1F6B4A]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
                    {language === 'hi' ? 'सरकारी MSP' : 'Government MSP'}
                  </span>
                </div>
                <span className="rounded-md bg-[#1F6B4A] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  {msp?.marketingSeason || 'Kharif'} {msp?.season || '2026-27'}
                </span>
              </div>

              <div className="mt-4">
                {msp ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-[#0F3D2E] md:text-4xl">
                        ₹{fmt(msp.price)}
                      </span>
                      <span className="text-xs font-semibold text-[#5C6B63]">
                        {language === 'hi' ? '/ क्विंटल' : '/ quintal'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium text-[#5C6B63]">
                      {language === 'hi' ? 'विपणन सत्र 2026-27 गारंटीकृत दर' : 'Marketing Season 2026-27 Guaranteed Floor Price'}
                    </p>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <span className="text-sm font-semibold text-gray-500">
                      {language === 'hi' ? 'एमएसपी डेटा उपलब्ध नहीं है' : 'MSP data unavailable'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#1F6B4A]/10 flex items-center justify-between text-[11px]">
              <span className="text-[#5C6B63] font-medium">
                {language === 'hi' ? 'स्रोत: भारत सरकार' : 'Source: Government of India'}
              </span>
              {msp?.sourceUrl && (
                <a
                  href={msp.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#1F6B4A] hover:underline"
                >
                  <span>PIB</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* 2. MANDI PRICE CARD (AGMARKNET) */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#FFFBF0] p-5 border border-amber-300/60 transition hover:border-amber-400 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    {language === 'hi' ? 'मंडी भाव (AGMARKNET)' : 'Mandi Price (AGMARKNET)'}
                  </span>
                </div>
                {mandi?.market && (
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {mandi.market} {language === 'hi' ? 'मंडी' : 'Mandi'}
                  </span>
                )}
              </div>

              <div className="mt-4">
                {mandi && mandi.modalPrice > 0 ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-amber-950 md:text-4xl">
                        ₹{fmt(mandi.modalPrice)}
                      </span>
                      <span className="text-xs font-semibold text-amber-800">
                        {language === 'hi' ? '/ क्विंटल (मॉडल भाव)' : '/ quintal (Modal)'}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between rounded-lg bg-amber-100/60 px-2.5 py-1.5 text-[11px] text-amber-900 font-medium">
                      <span>{language === 'hi' ? 'न्यूनतम - अधिकतम:' : 'Range:'}</span>
                      <span className="font-bold">₹{fmt(mandi.minPrice)} – ₹{fmt(mandi.maxPrice)}</span>
                    </div>

                    {mandi.date && (
                      <p className="mt-2 text-[11px] font-medium text-amber-800">
                        {language === 'hi' ? `दिनांक: ${mandi.date}` : `Date: ${mandi.date}`}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <span className="text-sm font-bold text-amber-900/70 block">
                      {language === 'hi' ? 'मंडी भाव उपलब्ध नहीं है' : 'Mandi price unavailable'}
                    </span>
                    <p className="mt-1 text-xs text-amber-700/80">
                      {language === 'hi' ? 'इस मंडी के लिए आज का डेटा अपडेट हो रहा है' : 'Daily market arrival data updating'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-amber-200 flex items-center justify-between text-[11px]">
              <span className="text-amber-900/80 font-medium">
                {mandi?.source || 'AGMARKNET / Government of India'}
              </span>
              {mandi?.sourceUrl && (
                <a
                  href={mandi.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:underline"
                >
                  <span>AGMARKNET</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* 3. MILL OFFER PRICE CARD */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#F0F5FF] p-5 border border-blue-200 transition hover:border-blue-400 shadow-sm">
            <div>
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-blue-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    {language === 'hi' ? 'मिल ऑफर भाव' : 'Mill Offer Price'}
                  </span>
                </div>
                {topMillOffer?.district && (
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    {topMillOffer.district}
                  </span>
                )}
              </div>

              <div className="mt-4">
                {topMillOffer && topMillOffer.offerPrice > 0 ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-blue-950 md:text-4xl">
                        ₹{fmt(topMillOffer.offerPrice)}
                      </span>
                      <span className="text-xs font-semibold text-blue-800">
                        {language === 'hi' ? '/ क्विंटल' : '/ quintal'}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-bold text-blue-900 line-clamp-1">
                      {topMillOffer.millName}
                    </p>

                    {topMillOffer.date && (
                      <p className="mt-1 text-[11px] font-medium text-blue-700">
                        {language === 'hi' ? `ऑफर तिथि: ${topMillOffer.date}` : `Offer Date: ${topMillOffer.date}`}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <span className="text-sm font-bold text-blue-900/80 block">
                      {language === 'hi' ? 'मिल ऑफर उपलब्ध नहीं है' : 'Mill offer unavailable'}
                    </span>
                    <p className="mt-1 text-xs text-blue-700/80">
                      {language === 'hi' ? 'कोई सक्रिय मिल बोली वर्तमान में उपलब्ध नहीं है।' : 'No active mill offers are currently available.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-blue-200 flex items-center justify-between text-[11px]">
              <span className="text-blue-900/80 font-medium">
                {topMillOffer?.source || 'Mill submitted offer'}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                {language === 'hi' ? 'सत्यापित खरीदार' : 'Direct Buyer'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* Bottom Explanatory Footer */}
      <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs text-[#5C6B63] border border-[#0F3D2E]/5 space-y-1">
        <p>
          <strong>MSP (न्यूनतम समर्थन मूल्य):</strong> {language === 'hi' ? 'भारत सरकार द्वारा घोषित गारंटीकृत न्यूनतम खरीद दर।' : 'Government of India guaranteed floor price.'}
        </p>
        <p>
          <strong>मंडी भाव (AGMARKNET):</strong> {language === 'hi' ? 'कृषि विपणन एवं निरीक्षण निदेशालय (DMI) द्वारा मॉडल दैनिक मंडी नीलामी दर।' : 'Official daily APMC market auction modal price from Directorate of Marketing & Inspection.'}
        </p>
        <p>
          <strong>मिल ऑफर:</strong> {language === 'hi' ? 'पंजीकृत राइस मिलों/निर्याटकों द्वारा प्रस्तुत प्रत्यक्ष खरीद प्रस्ताव।' : 'Direct buying offer submitted by registered rice mills & exporters.'}
        </p>
      </div>
    </div>
  )
}

