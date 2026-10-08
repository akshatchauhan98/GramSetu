import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Sprout,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  Send,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

const FPO_DATA = [
  {
    id: 'FPO-01',
    name: 'Rampur Krishi Vikas Samiti',
    regNo: 'UP-BRY-FPO-2021-0941',
    village: 'Rampur',
    district: 'Bareilly District',
    state: 'Uttar Pradesh',
    contactPerson: 'Maheshwar Singh',
    phone: '+91 94521 88390',
    email: 'rampur.fpo@gramsetu.org',
    trustRating: 4.9,
    farmerMembers: 420,
    historicalVolumeTonnes: 1850,
    avgNdvi: 0.74,
    crops: ['Paddy', 'Wheat'],
    bankVerified: true,
  },
  {
    id: 'FPO-02',
    name: 'Kalyanpur Gramin Utthan FPO',
    regNo: 'UP-MRB-FPO-2020-0432',
    village: 'Kalyanpur',
    district: 'Moradabad District',
    state: 'Uttar Pradesh',
    contactPerson: 'Om Prakash Sharma',
    phone: '+91 97190 62381',
    email: 'kalyanpur.fpo@gramsetu.org',
    trustRating: 5.0,
    farmerMembers: 580,
    historicalVolumeTonnes: 2400,
    avgNdvi: 0.81,
    crops: ['Paddy', 'Sugarcane'],
    bankVerified: true,
  },
  {
    id: 'FPO-03',
    name: 'Kanth Kisan Jagriti Mandal',
    regNo: 'UP-MRB-FPO-2021-0812',
    village: 'Kanth',
    district: 'Moradabad District',
    state: 'Uttar Pradesh',
    contactPerson: 'Suresh Chandra',
    phone: '+91 94123 77209',
    email: 'kanth.fpo@gramsetu.org',
    trustRating: 4.8,
    farmerMembers: 310,
    historicalVolumeTonnes: 1280,
    avgNdvi: 0.70,
    crops: ['Paddy', 'Mustard'],
    bankVerified: true,
  },
  {
    id: 'FPO-04',
    name: 'Sitapur Agro Producers Co.',
    regNo: 'UP-STP-FPO-2022-1104',
    village: 'Sitapur',
    district: 'Sitapur District',
    state: 'Uttar Pradesh',
    contactPerson: 'Devendra Yadav',
    phone: '+91 98380 44120',
    email: 'sitapur.agro@gramsetu.org',
    trustRating: 4.7,
    farmerMembers: 290,
    historicalVolumeTonnes: 940,
    avgNdvi: 0.68,
    crops: ['Paddy'],
    bankVerified: true,
  },
  {
    id: 'FPO-05',
    name: 'Bagh Progressive Farmers Group',
    regNo: 'UP-MRB-FPO-2023-1590',
    village: 'Bagh Farm',
    district: 'Moradabad District',
    state: 'Uttar Pradesh',
    contactPerson: 'Vikram Singh',
    phone: '+91 98971 30045',
    email: 'bagh.farmers@gramsetu.org',
    trustRating: 4.9,
    farmerMembers: 140,
    historicalVolumeTonnes: 620,
    avgNdvi: 0.71,
    crops: ['Paddy', 'Vegetables'],
    bankVerified: true,
  },
  {
    id: 'FPO-06',
    name: 'Mohanpur Annadata Sangathan',
    regNo: 'UP-SMB-FPO-2022-0761',
    village: 'Mohanpur',
    district: 'Sambhal District',
    state: 'Uttar Pradesh',
    contactPerson: 'Harish Kumar',
    phone: '+91 96340 91823',
    email: 'mohanpur.fpo@gramsetu.org',
    trustRating: 4.5,
    farmerMembers: 220,
    historicalVolumeTonnes: 780,
    avgNdvi: 0.58,
    crops: ['Paddy', 'Wheat'],
    bankVerified: true,
  },
];

export default function FarmerDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [contactModalFpo, setContactModalFpo] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  const districts = ['All', 'Moradabad District', 'Bareilly District', 'Sitapur District', 'Sambhal District'];

  const filteredFpos = useMemo(() => {
    return FPO_DATA.filter((fpo) => {
      if (districtFilter !== 'All' && fpo.district !== districtFilter) return false;
      if (fpo.trustRating < minRatingFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = fpo.name.toLowerCase().includes(q);
        const matchVillage = fpo.village.toLowerCase().includes(q);
        const matchContact = fpo.contactPerson.toLowerCase().includes(q);
        const matchReg = fpo.regNo.toLowerCase().includes(q);
        if (!matchName && !matchVillage && !matchContact && !matchReg) return false;
      }
      return true;
    });
  }, [searchTerm, districtFilter, minRatingFilter]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setContactModalFpo(null);
      setMessageSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Verified FPO Supplier Registry
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Farmer &amp; FPO Directory
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Browse verified institutional farmer producer organizations with satellite crop health ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-white px-3.5 py-2 rounded-2xl border border-stone-200 text-stone-700">
            {filteredFpos.length} Verified FPOs
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FPO name, village, reg no..."
              className="w-full bg-[#F5F7F2] text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none placeholder:text-stone-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District Filter */}
          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full bg-[#F5F7F2] text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none font-semibold text-stone-700 cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Min Rating Filter */}
          <div>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="w-full bg-[#F5F7F2] text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none font-semibold text-stone-700 cursor-pointer"
            >
              <option value={0}>All Trust Ratings</option>
              <option value={4.5}>Rating 4.5+ Stars</option>
              <option value={4.8}>Rating 4.8+ Stars</option>
              <option value={5.0}>Rating 5.0 Prime</option>
            </select>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRID OF VERIFIED VILLAGE FPO SUPPLIER CARDS                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFpos.map((fpo) => (
          <div
            key={fpo.id}
            className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-stone-300 transition-all group"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-[#0F3D2E] leading-snug">
                      {fpo.name}
                    </h3>
                  </div>
                  <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                    {fpo.regNo}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-black text-amber-800">
                    {fpo.trustRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Metadata row */}
              <div className="py-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <MapPin className="w-4 h-4 text-[#1F6B4A] shrink-0" />
                  <span className="font-medium">
                    {fpo.village}, {fpo.district}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-stone-600">
                  <Users className="w-4 h-4 text-[#1F6B4A] shrink-0" />
                  <span className="font-medium">
                    {fpo.farmerMembers} Member Farmers Represented
                  </span>
                </div>

                <div className="flex items-center gap-2 text-stone-600">
                  <Building2 className="w-4 h-4 text-[#1F6B4A] shrink-0" />
                  <span className="font-medium">
                    Representative: {fpo.contactPerson}
                  </span>
                </div>
              </div>

              {/* Satellite Metrics Pill */}
              <div className="bg-[#F5F7F2] p-3 rounded-2xl flex items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">
                    Historical Supply
                  </span>
                  <span className="font-extrabold text-[#0F3D2E]">
                    {fpo.historicalVolumeTonnes} Tonnes
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">
                    Mean NDVI
                  </span>
                  <span className="font-extrabold text-[#059669]">
                    NDVI {fpo.avgNdvi}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
              <a
                href={`tel:${fpo.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F5F7F2] hover:bg-[#E8F2EC] text-[#0F3D2E] font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#1F6B4A]" />
                <span>Call Direct</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setContactModalFpo(fpo);
                  setMessageSent(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message Modal */}
      {contactModalFpo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setContactModalFpo(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F3D2E]">
                  Official FPO Transmission
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {contactModalFpo.name}
                </p>
              </div>
            </div>

            {messageSent ? (
              <div className="py-8 text-center text-[#059669] font-bold text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Message Transmitted to FPO Dispatcher</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="bg-[#F5F7F2] p-3 rounded-2xl text-xs space-y-1">
                  <p className="text-stone-500">Recipient Secretary:</p>
                  <p className="font-bold text-stone-800">{contactModalFpo.contactPerson} ({contactModalFpo.phone})</p>
                </div>

                <label className="block text-xs font-bold text-stone-700">
                  Procurement Inquiry Message
                </label>
                <textarea
                  rows={3}
                  defaultValue={`Moradabad Rice Works request: Please provide availability schedule for Paddy harvest from ${contactModalFpo.village}.`}
                  className="w-full bg-[#F5F7F2] text-xs p-3 rounded-xl border border-stone-200 outline-none focus:border-[#1F6B4A]"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Official Transmission</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
