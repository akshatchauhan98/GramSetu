import { motion, AnimatePresence } from 'framer-motion'
import {
  Factory,
  IndianRupee,
  MapPin,
  Satellite,
  ShieldAlert,
  Wheat,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Sprout,
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
  Users,
  Building2,
  Layers,
  Sparkles,
  BarChart2,
  Landmark
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useUser } from '../context/UserContext'


const HERO_IMG =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef6924?auto=format&fit=crop&w=2000&q=80'
const FARMER_IMG =
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=80'
const ROWS_IMG =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ----------------------------------------------------------------------
// DATA FOR THE GLOBAL AGRICULTURAL MARKETPLACE
// ----------------------------------------------------------------------
const MARKET_TICKER = [
  { crop: 'Paddy / धान', price: '₹2,150/q', change: '+2.4%', up: true },
  { crop: 'Wheat / गेहूं', price: '₹2,420/q', change: '+1.8%', up: true },
  { crop: 'Maize / मक्का', price: '₹2,050/q', change: '-0.6%', up: false },
  { crop: 'Pulses / दालें', price: '₹6,850/q', change: '+1.2%', up: true },
  { crop: 'Oilseeds / तिलहन', price: '₹5,400/q', change: '+0.5%', up: true },
]

const CATEGORIES = [
  { id: 'all', name: 'All Crops', nameHindi: 'सभी फसलें', icon: Sprout },
  { id: 'Paddy', name: 'Paddy', nameHindi: 'धान', icon: Wheat },
  { id: 'Wheat', name: 'Wheat', nameHindi: 'गेहूं', icon: Wheat },
  { id: 'Maize', name: 'Maize', nameHindi: 'मक्का', icon: Sprout },
  { id: 'Pulses', name: 'Pulses', nameHindi: 'दालें', icon: Sprout },
  { id: 'Oilseeds', name: 'Oilseeds', nameHindi: 'तिलहन', icon: Sprout },
]

const SUPPLY_LOCATIONS = [
  {
    id: 'rampur',
    village: 'Rampur',
    villageHindi: 'रामपुर',
    district: 'Moradabad',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    cropHindi: 'धान',
    tonnes: 480,
    areaHectares: 202.98,
    ndvi: 0.74,
    healthLabel: 'Excellent',
    fairPrice: 2150,
    brokerOffer: 1800,
    harvestWindow: '18 days',
    pos: [28.8100, 78.7500],
    isHighlighted: true,
  },
  {
    id: 'varanasi',
    village: 'Varanasi',
    villageHindi: 'वाराणसी',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    cropHindi: 'धान',
    tonnes: 320,
    areaHectares: 145.50,
    ndvi: 0.71,
    healthLabel: 'Good',
    fairPrice: 2160,
    brokerOffer: 1850,
    harvestWindow: '12 days',
    pos: [25.3176, 82.9739],
    isHighlighted: false,
  },
  {
    id: 'lucknow',
    village: 'Lucknow',
    villageHindi: 'लखनऊ',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    tonnes: 620,
    areaHectares: 260.00,
    ndvi: 0.78,
    healthLabel: 'Optimum',
    fairPrice: 2420,
    brokerOffer: 2100,
    harvestWindow: '22 days',
    pos: [26.8467, 80.9462],
    isHighlighted: false,
  },
  {
    id: 'gorakhpur',
    village: 'Gorakhpur',
    villageHindi: 'गोरखपुर',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    cropHindi: 'धान',
    tonnes: 410,
    areaHectares: 180.20,
    ndvi: 0.69,
    healthLabel: 'Good',
    fairPrice: 2140,
    brokerOffer: 1820,
    harvestWindow: '14 days',
    pos: [26.7606, 83.3732],
    isHighlighted: false,
  },
  {
    id: 'prayagraj',
    village: 'Prayagraj',
    villageHindi: 'प्रयागराज',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    crop: 'Wheat',
    cropHindi: 'गेहूं',
    tonnes: 280,
    areaHectares: 120.40,
    ndvi: 0.73,
    healthLabel: 'Optimum',
    fairPrice: 2400,
    brokerOffer: 2080,
    harvestWindow: '10 days',
    pos: [25.4358, 81.8463],
    isHighlighted: false,
  },
  {
    id: 'sitapur',
    village: 'Sitapur',
    villageHindi: 'सीतापुर',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    cropHindi: 'धान',
    tonnes: 350,
    areaHectares: 150.00,
    ndvi: 0.68,
    healthLabel: 'Good',
    fairPrice: 2140,
    brokerOffer: 1840,
    harvestWindow: '8 days',
    pos: [27.5684, 80.6819],
    isHighlighted: false,
  },
  {
    id: 'bareilly',
    village: 'Bareilly Cluster',
    villageHindi: 'बरेली क्लस्टर',
    district: 'Bareilly',
    state: 'Uttar Pradesh',
    crop: 'Maize',
    cropHindi: 'मक्का',
    tonnes: 240,
    areaHectares: 110.00,
    ndvi: 0.67,
    healthLabel: 'Healthy',
    fairPrice: 2050,
    brokerOffer: 1780,
    harvestWindow: '15 days',
    pos: [28.3670, 79.4150],
    isHighlighted: false,
  },
]

// Map center on UP/North India catchment
const MAP_CENTER = [26.8, 81.2]

// ----------------------------------------------------------------------
// HERO COMPONENT
// ----------------------------------------------------------------------
function Hero() {
  const { user, isAuthenticated } = useUser()

  return (
    <section id="home" className="relative isolate min-h-svh overflow-hidden">
      <img
        src={HERO_IMG}
        alt="Farmland at harvest"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-[#0F3D2E]/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-[#0F3D2E]/60 via-[#0F3D2E]/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-8 pb-16 pt-28 text-center md:px-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.05}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C5D86D]/40 bg-[#0F3D2E]/80 px-4 py-1.5 backdrop-blur-sm"
        >
          <Satellite size={16} className="text-[#C5D86D]" />
          <span className="gs-kicker text-[#C5D86D]">
            Satellite-Powered Farm-Gate Price Protection
          </span>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.12}
          className="gs-display text-5xl text-white sm:text-6xl md:text-7xl"
        >
          Fair prices.
          <br />
          Direct to mill.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.18}
          className="mt-3 mb-4 max-w-3xl text-center text-base font-medium tracking-[0.02em] text-[#F5F7F2] md:text-xl"
        >
          आसमान से फसल का अनुमान, किसान के हाथ में सही दाम।
        </motion.p>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.22}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg"
        >
          GramSetu uses Sentinel-2 satellite NDVI intelligence to estimate village crop yield
          and connect farmers directly with processing mills — ending broker monopoly at the farm gate.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.34}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {isAuthenticated && user ? (
            <Link
              to={user.role === 'mill' ? '/mill' : user.role === 'gov' ? '/gov' : '/farmer'}
              className="gs-pill bg-[#C5D86D] text-[#0F3D2E] font-extrabold shadow-xl hover:bg-white px-7"
            >
              GO TO DASHBOARD ({user.name})
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="gs-pill bg-[#C5D86D] text-[#0F3D2E] font-extrabold shadow-xl hover:bg-white px-7"
              >
                LOG IN
              </Link>
              <Link
                to="/register"
                className="gs-pill bg-white text-[#0F3D2E] font-extrabold shadow-xl hover:bg-emerald-50 px-7"
              >
                REGISTER
              </Link>
            </>
          )}
          <a
            href="#marketplace"
            className="gs-pill bg-[#0F3D2E] border border-white/30 text-white shadow-lg"
          >
            EXPLORE MARKETPLACE
          </a>
        </motion.div>


        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.48}
          className="absolute bottom-8 left-0 w-full text-center text-sm tracking-wide text-white/80"
        >
          Scroll to Discover Global Marketplace ↓
        </motion.p>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// LIVE MARKET TICKER STRIP
// ----------------------------------------------------------------------
function LiveMarketTicker() {
  return (
    <div className="border-b border-[#0F3D2E]/10 bg-[#0F3D2E] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between overflow-x-auto px-6 py-3 scrollbar-none">
        <div className="flex shrink-0 items-center gap-2 pr-6 border-r border-white/15">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C5D86D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C5D86D]"></span>
          </span>
          <span className="text-xs font-bold tracking-wider uppercase text-[#C5D86D]">
            Live Market Ticker
          </span>
        </div>

        <div className="flex items-center gap-8 px-4 text-xs font-medium">
          {MARKET_TICKER.map((item) => (
            <div key={item.crop} className="flex items-center gap-2 shrink-0">
              <span className="text-white/80">{item.crop}:</span>
              <span className="font-semibold text-white">{item.price}</span>
              <span
                className={`flex items-center text-[11px] font-bold ${
                  item.up ? 'text-[#C5D86D]' : 'text-amber-400'
                }`}
              >
                {item.up ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                {item.change}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden md:flex shrink-0 items-center gap-2 pl-6 border-l border-white/15 text-[11px] text-white/70">
          <span>Satellite-Verified Rates</span>
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// GRAMSETU STORY PROCESS INDICATOR
// ----------------------------------------------------------------------
function ProcessIndicator() {
  const flowSteps = [
    { label: 'SATELLITE INTELLIGENCE', desc: 'Sentinel-2 NDVI Scan', icon: Satellite },
    { label: 'EXPECTED VILLAGE SUPPLY', desc: 'Pre-Harvest Tonnage', icon: Layers },
    { label: 'FAIR PRICE BENCHMARK', desc: 'MSP + Mandi + Satellite', icon: IndianRupee },
    { label: 'MARKETPLACE', desc: 'Direct Discovery', icon: Sprout },
    { label: 'DIRECT MILL PROCUREMENT', desc: 'Zero Middleman Monopoly', icon: Factory },
    { label: 'FARMER GETS BETTER PRICE', desc: '12-18% Higher Income', icon: ShieldAlert },
  ]

  return (
    <section className="bg-[#E8F2EC]/60 px-6 py-10 md:px-16 border-b border-[#0F3D2E]/10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-center">
          <p className="gs-kicker text-[#1F6B4A]">The GramSetu Supply Engine</p>
          <h3 className="text-sm font-semibold tracking-tight text-[#0F3D2E] md:text-base">
            From Sentinel-2 Orbit to Direct Mill Payment
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={step.label}
                className="relative flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm border border-[#0F3D2E]/8 hover:border-[#1F6B4A]/40 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F2EC] text-[#0F3D2E] mb-2">
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#1F6B4A] uppercase">
                  Step 0{idx + 1}
                </span>
                <h4 className="mt-1 text-xs font-bold leading-snug text-[#0F3D2E]">
                  {step.label}
                </h4>
                <p className="mt-1 text-[11px] text-[#5C6B63]">{step.desc}</p>

                {idx < flowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-[#1F6B4A]">
                    <ArrowRight size={14} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// DETAIL MODAL FOR VILLAGE SUPPLY (e.g. RAMPUR DEMO)
// ----------------------------------------------------------------------
function SupplyDetailModal({ village, onClose }) {
  const navigate = useNavigate()
  if (!village) return null

  const netBrokerLoss = (village.fairPrice - village.brokerOffer) * 50

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[#0F3D2E]/15"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#1F6B4A]">
                  <MapPin size={12} /> {village.district}, {village.state}
                </span>
                {village.isHighlighted && (
                  <span className="rounded-full bg-[#C5D86D] px-3 py-1 text-xs font-bold text-[#0F3D2E]">
                    Main SIH Demo Village
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-2xl font-bold text-[#0F3D2E] md:text-3xl">
                {village.village} ({village.villageHindi})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#5C6B63] hover:bg-[#F5F7F2] hover:text-[#0F3D2E]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-[#F5F7F2] p-3 text-center">
              <span className="text-xs text-[#5C6B63]">Crop</span>
              <p className="mt-1 text-sm font-bold text-[#0F3D2E]">{village.crop} ({village.cropHindi})</p>
            </div>
            <div className="rounded-2xl bg-[#F5F7F2] p-3 text-center">
              <span className="text-xs text-[#5C6B63]">Coverage</span>
              <p className="mt-1 text-sm font-bold text-[#0F3D2E]">{village.areaHectares} ha</p>
            </div>
            <div className="rounded-2xl bg-[#E8F2EC] p-3 text-center border border-[#1F6B4A]/20">
              <span className="text-xs text-[#1F6B4A] font-semibold">NDVI Index</span>
              <p className="mt-1 text-sm font-extrabold text-[#0F3D2E]">{village.ndvi}</p>
            </div>
            <div className="rounded-2xl bg-[#F5F7F2] p-3 text-center">
              <span className="text-xs text-[#5C6B63]">Est. Supply</span>
              <p className="mt-1 text-sm font-bold text-[#0F3D2E]">{village.tonnes} Tonnes</p>
            </div>
          </div>

          {/* Price Benchmark Box */}
          <div className="mt-5 rounded-2xl bg-[#0F3D2E] p-5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#C5D86D] uppercase tracking-wider">
                  GramSetu Fair Price Benchmark
                </p>
                <p className="mt-1 text-2xl font-extrabold">₹{village.fairPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-white/70">/ quintal</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Local Broker Offer</p>
                <p className="mt-1 text-lg font-bold text-amber-300">₹{village.brokerOffer.toLocaleString('en-IN')} / q</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-xs">
              <span className="text-white/80">
                Farmer loss under broker quote: <strong className="text-amber-300">₹{(village.fairPrice - village.brokerOffer)}/q</strong>
              </span>
              <span className="text-[#C5D86D] font-bold">
                Protection: ₹{netBrokerLoss.toLocaleString('en-IN')} / 50q
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                onClose()
                navigate('/mill')
              }}
              className="flex-1 rounded-full bg-[#0F3D2E] py-3 text-center text-xs font-bold tracking-wider text-white uppercase shadow-lg hover:bg-[#163D32]"
            >
              Connect with Mill
            </button>
            <button
              onClick={() => {
                onClose()
                navigate('/farmer/satellite')
              }}
              className="flex-1 rounded-full border border-[#1F6B4A] bg-white py-3 text-center text-xs font-bold tracking-wider text-[#0F3D2E] uppercase hover:bg-[#E8F2EC]"
            >
              View Satellite Model
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ----------------------------------------------------------------------
// MAIN GLOBAL AGRICULTURAL MARKETPLACE SECTION
// ----------------------------------------------------------------------
function MarketplaceSection() {
  const navigate = useNavigate()
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all')
  const [minSupplyFilter, setMinSupplyFilter] = useState(0)
  const [selectedVillageModal, setSelectedVillageModal] = useState(null)

  // Filter supply locations
  const filteredLocations = useMemo(() => {
    return SUPPLY_LOCATIONS.filter((loc) => {
      // Category / Crop filter
      if (selectedCrop !== 'all' && loc.crop.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false
      }
      // Location dropdown filter
      if (selectedLocationFilter !== 'all' && loc.district !== selectedLocationFilter) {
        return false
      }
      // Min supply filter
      if (minSupplyFilter > 0 && loc.tonnes < minSupplyFilter) {
        return false
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchVillage = loc.village.toLowerCase().includes(q)
        const matchHindi = loc.villageHindi.includes(q)
        const matchDistrict = loc.district.toLowerCase().includes(q)
        const matchCrop = loc.crop.toLowerCase().includes(q)
        const matchState = loc.state.toLowerCase().includes(q)
        if (!matchVillage && !matchHindi && !matchDistrict && !matchCrop && !matchState) {
          return false
        }
      }
      return true
    })
  }, [selectedCrop, searchQuery, selectedLocationFilter, minSupplyFilter])

  return (
    <section id="marketplace" className="bg-[#F5F7F2] px-6 py-20 md:px-16 md:py-28 border-b border-[#0F3D2E]/10">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2EC] px-4 py-1.5 text-xs font-bold text-[#1F6B4A]">
            <Sprout size={14} /> GramSetu Direct Procurement
          </span>
          <h2 className="gs-display mt-4 text-4xl text-[#0F3D2E] sm:text-5xl md:text-6xl">
            Global Agricultural Marketplace
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#5C6B63] leading-relaxed">
            Connect crop supply directly with buyers, mills and procurement networks.
            Satellite-estimated tonnage, verified village health, and fair price discovery.
          </p>
        </div>

        {/* Category Pills Navigation */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = selectedCrop === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCrop(cat.id)}
                className={[
                  'flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all shadow-sm',
                  isActive
                    ? 'bg-[#0F3D2E] text-white shadow-md scale-105'
                    : 'border border-[#0F3D2E]/15 bg-white text-[#0F3D2E] hover:bg-[#E8F2EC]',
                ].join(' ')}
              >
                <Icon size={15} className={isActive ? 'text-[#C5D86D]' : 'text-[#1F6B4A]'} />
                <span>{cat.name}</span>
                <span className="opacity-75">({cat.nameHindi})</span>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 rounded-3xl bg-white p-4 shadow-xl shadow-[#0F3D2E]/5 border border-[#0F3D2E]/10">
          <div className="grid gap-4 md:grid-cols-12 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C6B63]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crop, village, district or mill..."
                className="w-full rounded-2xl bg-[#F5F7F2] pl-11 pr-4 py-3 text-sm text-[#0F3D2E] outline-none placeholder:text-[#5C6B63]/70 border border-transparent focus:border-[#1F6B4A]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5C6B63] hover:text-[#0F3D2E]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Location Select */}
            <div className="md:col-span-3">
              <select
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="w-full rounded-2xl bg-[#F5F7F2] px-4 py-3 text-sm text-[#0F3D2E] outline-none border border-transparent focus:border-[#1F6B4A]"
              >
                <option value="all">Location: All UP Districts</option>
                <option value="Moradabad">Moradabad (Rampur)</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Gorakhpur">Gorakhpur</option>
                <option value="Prayagraj">Prayagraj</option>
                <option value="Sitapur">Sitapur</option>
                <option value="Bareilly">Bareilly</option>
              </select>
            </div>

            {/* Quantity Select */}
            <div className="md:col-span-3">
              <select
                value={minSupplyFilter}
                onChange={(e) => setMinSupplyFilter(Number(e.target.value))}
                className="w-full rounded-2xl bg-[#F5F7F2] px-4 py-3 text-sm text-[#0F3D2E] outline-none border border-transparent focus:border-[#1F6B4A]"
              >
                <option value={0}>Min Supply: All Volumes</option>
                <option value={200}>Supply: 200+ Tonnes</option>
                <option value={350}>Supply: 350+ Tonnes</option>
                <option value={450}>Supply: 450+ Tonnes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hero Interactive Marketplace Map Visual */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-[#0F3D2E]/15 bg-white shadow-2xl">
          <div className="p-4 bg-[#0F3D2E] text-white flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#C5D86D] animate-pulse"></span>
              <h3 className="text-sm font-semibold tracking-wide">
                LIVE AGRICULTURAL SUPPLY NETWORK (INDIA - UP CATCHMENT)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1F6B4A]"></span> Verified Village Tonnage
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C5D86D]"></span> Main SIH Demo (Rampur)
              </span>
            </div>
          </div>

          <div className="h-[420px] w-full relative [&_.leaflet-container]:z-0 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full">
            <MapContainer center={MAP_CENTER} zoom={7} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocations.map((loc) => (
                <CircleMarker
                  key={loc.id}
                  center={loc.pos}
                  radius={loc.isHighlighted ? 14 : 10}
                  pathOptions={{
                    color: loc.isHighlighted ? '#0F3D2E' : '#1F6B4A',
                    fillColor: loc.isHighlighted ? '#C5D86D' : '#1F6B4A',
                    fillOpacity: 0.9,
                    weight: loc.isHighlighted ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedVillageModal(loc),
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[160px] text-xs font-sans">
                      <div className="flex items-center justify-between gap-2 border-b pb-1 mb-1">
                        <strong className="text-[#0F3D2E] text-sm">{loc.village}</strong>
                        <span className="text-[#1F6B4A] font-bold">{loc.crop}</span>
                      </div>
                      <p className="text-[#5C6B63]">Supply: <strong className="text-[#0F3D2E]">{loc.tonnes} T</strong></p>
                      <p className="text-[#5C6B63]">NDVI Index: <strong className="text-[#1F6B4A]">{loc.ndvi}</strong></p>
                      <p className="text-[#5C6B63]">Fair Benchmark: <strong className="text-[#0F3D2E]">₹{loc.fairPrice}/q</strong></p>
                      <button
                        onClick={() => setSelectedVillageModal(loc)}
                        className="mt-2 w-full rounded-full bg-[#0F3D2E] py-1 text-center text-[11px] font-bold text-white uppercase"
                      >
                        View Supply
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Marketplace Supply Cards */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#0F3D2E] md:text-2xl">
              Available Crop Supply ({filteredLocations.length} Locations)
            </h3>
            <span className="text-xs text-[#5C6B63] font-medium">
              Showing verified village listings
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLocations.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-3xl bg-white p-6 shadow-lg shadow-[#0F3D2E]/5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  item.isHighlighted
                    ? 'border-[#1F6B4A] ring-2 ring-[#1F6B4A]/20'
                    : 'border-[#0F3D2E]/10'
                }`}
              >
                {item.isHighlighted && (
                  <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#C5D86D] px-3 py-1 text-[11px] font-extrabold text-[#0F3D2E]">
                    ⭐ Featured SIH Demo Village
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-[#0F3D2E] group-hover:text-[#1F6B4A] transition-colors">
                      {item.village.toUpperCase()}
                    </h4>
                    <p className="text-xs font-medium text-[#5C6B63]">
                      {item.state} · {item.district}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#E8F2EC] px-3 py-1 text-xs font-bold text-[#1F6B4A]">
                    {item.crop} / {item.cropHindi}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-[#F5F7F2] p-3">
                    <span className="text-[#5C6B63]">Expected Supply</span>
                    <p className="mt-1 text-base font-bold text-[#0F3D2E]">{item.tonnes} Tonnes</p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F7F2] p-3">
                    <span className="text-[#5C6B63]">NDVI Greenness</span>
                    <p className="mt-1 text-base font-bold text-[#1F6B4A]">{item.ndvi}</p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F7F2] p-3">
                    <span className="text-[#5C6B63]">Fair Benchmark</span>
                    <p className="mt-1 text-base font-bold text-[#0F3D2E]">₹{item.fairPrice.toLocaleString('en-IN')} / q</p>
                  </div>

                  <div className="rounded-2xl bg-[#F5F7F2] p-3">
                    <span className="text-[#5C6B63]">Harvest Window</span>
                    <p className="mt-1 text-base font-bold text-[#0F3D2E]">{item.harvestWindow}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVillageModal(item)}
                    className="flex-1 rounded-full border border-[#1F6B4A] bg-white py-2.5 text-center text-xs font-bold text-[#0F3D2E] uppercase hover:bg-[#E8F2EC] transition-colors"
                  >
                    View Supply
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/mill')}
                    className="flex-1 rounded-full bg-[#0F3D2E] py-2.5 text-center text-xs font-bold text-white uppercase hover:bg-[#163D32] transition-colors shadow-md"
                  >
                    Connect with Mill
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Selected Village Modal / Rampur Popup */}
        {selectedVillageModal && (
          <SupplyDetailModal
            village={selectedVillageModal}
            onClose={() => setSelectedVillageModal(null)}
          />
        )}
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// DUAL PORTALS: FOR MILLS & BUYERS vs FOR FARMERS
// ----------------------------------------------------------------------
function DualPortalsSection() {
  return (
    <section className="bg-[#F5F7F2] px-6 py-20 md:px-16 border-b border-[#0F3D2E]/10">
      <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-2">
        {/* For Mills & Buyers Card */}
        <motion.div
          id="mills"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-white p-8 md:p-10 shadow-xl border border-[#0F3D2E]/10 flex flex-col justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F2EC] px-3.5 py-1 text-xs font-bold text-[#1F6B4A]">
              <Factory size={14} /> FOR MILLS & BUYERS
            </span>
            <h3 className="gs-display mt-4 text-3xl md:text-4xl text-[#0F3D2E]">
              Find verified village supply before harvest.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5C6B63]">
              Directly discover village cluster yield using satellite NDVI maps. Eliminate middleman uncertainty and secure pre-harvest contracts.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#F5F7F2] p-4">
                <span className="text-xs text-[#5C6B63]">Available Supply</span>
                <p className="mt-1 text-2xl font-extrabold text-[#0F3D2E]">4,820 T</p>
              </div>
              <div className="rounded-2xl bg-[#F5F7F2] p-4">
                <span className="text-xs text-[#5C6B63]">Active Villages</span>
                <p className="mt-1 text-2xl font-extrabold text-[#0F3D2E]">28</p>
              </div>
              <div className="rounded-2xl bg-[#F5F7F2] p-4">
                <span className="text-xs text-[#5C6B63]">Active Buyers</span>
                <p className="mt-1 text-2xl font-extrabold text-[#0F3D2E]">64</p>
              </div>
              <div className="rounded-2xl bg-[#F5F7F2] p-4">
                <span className="text-xs text-[#5C6B63]">Direct Procurement</span>
                <p className="mt-1 text-2xl font-extrabold text-[#1F6B4A]">₹2.4 Cr</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#0F3D2E]/10">
            <Link
              to="/mill"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F3D2E] px-8 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-lg hover:bg-[#163D32] transition-all w-full sm:w-auto"
            >
              <span>EXPLORE SUPPLY</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* For Farmers Card */}
        <motion.div
          id="farmers"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl bg-[#163D32] p-8 md:p-10 text-white shadow-xl flex flex-col justify-between"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F3D2E] px-3.5 py-1 text-xs font-bold text-[#C5D86D]">
              <Sprout size={14} /> FOR FARMERS
            </span>
            <h3 className="gs-display mt-4 text-3xl md:text-4xl text-white">
              Reach direct buyers and discover a fair price for your crop.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#E8F2EC]/85">
              Stop broker exploitation at the farm gate. Access Sentinel-2 crop health analysis, know your village benchmark, and sell directly to verified processing mills.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                <span className="text-xs text-white/70">Fair Price</span>
                <p className="mt-1 text-xl font-extrabold text-[#C5D86D]">₹2,150/q</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                <span className="text-xs text-white/70">Nearby Mills</span>
                <p className="mt-1 text-xl font-extrabold text-white">12</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xs">
                <span className="text-xs text-white/70">Potential Buyers</span>
                <p className="mt-1 text-xl font-extrabold text-white">8</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15">
            <Link
              to="/farmer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C5D86D] px-8 py-3.5 text-xs font-bold tracking-wider text-[#0F3D2E] uppercase shadow-lg hover:bg-white transition-all w-full sm:w-auto"
            >
              <span>FIND BUYERS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ----------------------------------------------------------------------
// HOW IT WORKS & IMPACT SECTIONS (PRESERVED)
// ----------------------------------------------------------------------
function HowItWorks() {
  const steps = [
    {
      n: '01',
      title: 'Satellite estimates village yield',
      text: 'Before harvest, NDVI maps crop health so supply is visible at village scale — not only after the broker arrives.',
    },
    {
      n: '02',
      title: 'Farmer sees a fair price in Hindi',
      text: 'MSP, mandi, mill, and GramSetu’s fair benchmark sit side by side. No opacity at the farm gate.',
    },
    {
      n: '03',
      title: 'Mill sources the cluster directly',
      text: 'Processing mills procure from village clusters — fewer layers, faster payment, honest discovery.',
    },
  ]

  return (
    <section className="bg-[#F5F7F2] px-8 py-24 md:px-16 border-b border-[#0F3D2E]/10">
      <div className="mx-auto max-w-7xl">
        <p className="gs-kicker text-[#1F6B4A]">How GramSetu Works</p>
        <h2 className="gs-display mt-3 max-w-xl text-4xl text-[#0F3D2E] md:text-5xl">
          From orbit to the farm gate in three steps
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, i) => (
            <motion.article
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className="rounded-3xl bg-white p-8 shadow-lg shadow-[#0F3D2E]/5 border border-[#0F3D2E]/8"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#0F3D2E] text-sm font-semibold text-white">
                {step.n}
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-[#14201B]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5C6B63]">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImpactStats() {
  const stats = [
    { value: '₹1.5 Lakh Cr', label: 'Middleman leakage opportunity' },
    { value: '15 Cr', label: 'Smallholders affected' },
    { value: '12–18%', label: 'Potential income recovery' },
    { value: '0', label: 'Brokers needed for fair discovery' },
  ]

  return (
    <section id="impact" className="bg-[#0F3D2E] px-8 py-20 md:px-16 md:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="gs-kicker text-[#C5D86D]">Impact</p>
        <h2 className="gs-display mt-3 max-w-2xl text-4xl text-white md:text-5xl">
          Value that never reached the farmer — until now.
        </h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl bg-white/5 p-6 border border-white/10">
              <p className="gs-display text-4xl text-[#C5D86D] md:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#0F3D2E] px-8 pb-20 md:px-16">
      <div className="mx-auto max-w-4xl border-t border-white/10 pt-20 text-center">
        <h2 className="gs-display text-4xl text-white md:text-6xl">
          We believe in fair value from the ground up.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-white/75">
          From village farm-gate to mill gate — transparent, satellite-verified, broker-free.
        </p>

        {/* Access all three portals */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/farmer" className="gs-pill bg-[#DCEFE4] text-[#0F3D2E] shadow-lg flex items-center gap-1.5">
            <Wheat size={16} /> Farmer Portal
          </Link>
          <Link to="/mill" className="gs-pill bg-white text-[#0F3D2E] shadow-lg flex items-center gap-1.5">
            <Factory size={16} /> Mill Portal
          </Link>
          <Link to="/gov" className="gs-pill bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20 flex items-center gap-1.5">
            <Landmark size={16} /> Gov Audit Portal
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="bg-[#0F3D2E] px-8 pb-8 text-white md:px-16 border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-12 pt-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Wheat size={20} className="text-[#C5D86D]" /> GramSetu
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            A satellite-verified bridge between Indian farmers and processing mills. Fair
            discovery. Direct procurement. No monopoly at the gate.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#C5D86D] uppercase">
            Contact
          </p>
          <p className="mt-3 text-sm text-white/80">hello@gramsetu.in</p>
          <p className="mt-1 text-sm text-white/80">+91 98765 43210</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#C5D86D] uppercase">
            Address
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            GramSetu Labs
            <br />
            Pune, Maharashtra
            <br />
            India
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-[#C5D86D] uppercase">
            Follow
          </p>
          <div className="mt-3 flex flex-col gap-1 text-sm text-white/80">
            <span>LinkedIn</span>
            <span>X / Twitter</span>
            <span>YouTube</span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/50">
        © 2026 GramSetu — Smart India Hackathon 2026 Project
      </p>
    </footer>
  )
}

// ----------------------------------------------------------------------
// MAIN LANDING PAGE CONTAINER
// ----------------------------------------------------------------------
export default function LandingPage() {
  return (
    <div className="bg-[#F5F7F2] text-[#14201B]">
      <Hero />
      <LiveMarketTicker />
      <ProcessIndicator />
      <MarketplaceSection />
      <DualPortalsSection />
      <HowItWorks />
      <ImpactStats />
      <FinalCta />
      <Footer />
    </div>
  )
}
