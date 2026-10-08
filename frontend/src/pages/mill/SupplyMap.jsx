import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Sprout,
  MapPin,
  Filter,
  SlidersHorizontal,
  Plus,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  X,
  Send,
  Building2,
  ShoppingCart,
} from 'lucide-react';
import { useMillCart } from '../../context/MillCartContext';
import { fetchDistrictVillages } from '../../services/api';

// Fix for default Leaflet marker icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically re-center map when a village card is clicked
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 12, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function SupplyMap() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { addToCart, totals } = useMillCart();

  const [villages, setVillages] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('ndvi');
  const [selectedVillageForMap, setSelectedVillageForMap] = useState(null);
  const [contactModalVillage, setContactModalVillage] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  // Center of UP Bareilly-Rampur belt
  const defaultCenter = [28.815, 79.025];

  useEffect(() => {
    async function loadVillages() {
      const data = await fetchDistrictVillages('Moradabad');
      setVillages(data);
      if (data.length > 0) {
        setSelectedVillageForMap(data[0]);
      }
    }
    loadVillages();
  }, []);

  // Filter logic
  const filteredVillages = useMemo(() => {
    return villages
      .filter((v) => {
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = v.name.toLowerCase().includes(q);
          const matchDistrict = v.district.toLowerCase().includes(q);
          const matchFPO = v.fpoName?.toLowerCase().includes(q);
          const matchId = v.id.toLowerCase().includes(q);
          if (!matchName && !matchDistrict && !matchFPO && !matchId) return false;
        }

        // Category filter
        if (activeFilter === 'Harvest Ready') return v.status === 'Harvest Ready';
        if (activeFilter === 'High NDVI') return v.ndvi >= 0.70;
        if (activeFilter === 'Nearby') return v.distanceKm <= 50;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'volume') return b.estimatedYieldTonnes - a.estimatedYieldTonnes;
        if (sortBy === 'ndvi') return b.ndvi - a.ndvi;
        if (sortBy === 'price') return a.fairPrice - b.fairPrice;
        return 0;
      });
  }, [villages, searchQuery, activeFilter, sortBy]);

  const handleContactFPO = (village) => {
    setContactModalVillage(village);
    setMessageSent(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setContactModalVillage(null);
      setMessageSent(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Satellite Geofence Explorer
            </span>
            <span className="text-[10px] bg-[#E8F2EC] text-[#0F3D2E] font-bold px-2 py-0.5 rounded-md">
              Sentinel-2 L2A Multispectral
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Satellite Supply Map
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Real-time NDVI vegetation vigor, harvest readiness, and direct cluster sourcing for Uttar Pradesh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white px-3.5 py-2 rounded-2xl border border-stone-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>Optimal (NDVI &gt; 0.70)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white px-3.5 py-2 rounded-2xl border border-stone-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span>Ripening (0.55 - 0.69)</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SPLIT-SCREEN VIEW: 60% MAP CANVAS (LEFT), 40% DISCOVERY PANEL (RIGHT)     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        
        {/* ======================================================================= */}
        {/* LEFT SIDE: MAP CANVAS (60% -> lg:col-span-7)                             */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col relative">
          
          {/* Map Top Floating Overlay Info */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-md border border-stone-200/80 text-xs flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#1F6B4A]" />
            <div>
              <p className="font-bold text-[#0F3D2E]">Bareilly - Rampur - Moradabad Belt</p>
              <p className="text-[10px] text-stone-500">Center: 28.815 N, 79.025 E</p>
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[480px] lg:min-h-[620px] relative z-0">
            <MapContainer
              center={defaultCenter}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <MapController
                center={selectedVillageForMap ? selectedVillageForMap.coords : defaultCenter}
                zoom={12}
              />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Satellite Data: European Space Agency Sentinel-2'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {villages.map((village) => {
                const circleColor =
                  village.ndvi >= 0.75
                    ? '#059669' // Prime
                    : village.ndvi >= 0.70
                    ? '#1F6B4A' // Optimal
                    : '#D97706'; // Ripening / Moderate

                return (
                  <React.Fragment key={village.id}>
                    {/* Village Sentinel-2 NDVI Coverage Buffer Circle */}
                    <Circle
                      center={village.coords}
                      pathOptions={{
                        color: circleColor,
                        fillColor: circleColor,
                        fillOpacity: 0.25,
                        weight: 2,
                      }}
                      radius={village.polygonRadius || 2200}
                    />

                    {/* Pin Marker */}
                    <Marker position={village.coords}>
                      <Popup className="custom-mill-popup">
                        <div className="p-1 min-w-[220px]">
                          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                            <div>
                              <h4 className="font-extrabold text-sm text-[#0F3D2E]">
                                {village.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 font-medium">
                                {village.district}
                              </p>
                            </div>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: village.ndvi >= 0.70 ? '#E8F2EC' : '#FEF3C7',
                                color: village.ndvi >= 0.70 ? '#0F3D2E' : '#B45309',
                              }}
                            >
                              NDVI {village.ndvi}
                            </span>
                          </div>

                          <div className="py-2.5 space-y-1.5 text-xs text-stone-600">
                            <div className="flex justify-between">
                              <span className="text-stone-500">Estimated Yield:</span>
                              <strong className="text-stone-800">{village.estimatedYieldTonnes} Tonnes</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">Harvest Window:</span>
                              <strong className="text-[#059669]">{village.harvestWindow}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-stone-500">Fair Benchmark:</span>
                              <strong className="text-[#0F3D2E]">Rs {village.fairPrice} / Quintal</strong>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-stone-500">FPO Group:</span>
                              <span className="text-stone-700 font-medium truncate max-w-[120px]">
                                {village.fpoName}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 space-y-1.5">
                            <button
                              type="button"
                              onClick={() => addToCart(village, 50, village.fairPrice)}
                              className="w-full flex items-center justify-center gap-1.5 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white py-2 rounded-xl font-bold text-xs transition-colors shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Procurement Cart</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleContactFPO(village)}
                              className="w-full flex items-center justify-center gap-1.5 bg-[#F5F7F2] hover:bg-[#E8F2EC] text-[#0F3D2E] py-1.5 rounded-xl font-semibold text-xs transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#1F6B4A]" />
                              <span>Contact FPO Representative</span>
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT SIDE: VILLAGE SOURCING DIRECTORY PANEL (40% -> lg:col-span-5)      */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by village name or polygon ID..."
                className="w-full bg-[#F5F7F2] text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] outline-none placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
              {['All', 'Harvest Ready', 'High NDVI', 'Nearby'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-[#0F3D2E] text-white'
                      : 'bg-[#F5F7F2] text-stone-600 hover:bg-stone-200/60'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort Options Row */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span className="font-semibold">{filteredVillages.length} Clusters Located</span>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-[#0F3D2E] outline-none cursor-pointer"
                >
                  <option value="ndvi">Sort by: NDVI Score</option>
                  <option value="volume">Sort by: Volume</option>
                  <option value="distance">Sort by: Distance</option>
                  <option value="price">Sort by: Price Gap</option>
                </select>
              </div>
            </div>

            {/* Scrollable Village Cards List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredVillages.map((village) => {
                const ndviPercent = Math.min(100, Math.round(village.ndvi * 100));
                const isSelected = selectedVillageForMap?.id === village.id;

                return (
                  <div
                    key={village.id}
                    onClick={() => setSelectedVillageForMap(village)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1F6B4A] bg-[#E8F2EC]/40 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-[#F5F7F2]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-[#0F3D2E]">
                            {village.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 font-semibold">
                            • {village.distanceKm} km distance
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{village.district}</p>
                      </div>

                      {/* Quick Action Add Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(village, 50, village.fairPrice);
                        }}
                        title="Add 50 Tonnes to Cart"
                        className="p-2 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white transition-transform active:scale-95 shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* NDVI Progress Bar & Volume */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-stone-600">Sentinel-2 Crop Vigor</span>
                        <span className="text-[#1F6B4A] font-bold">
                          NDVI {village.ndvi} ({ndviPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${ndviPercent}%`,
                            backgroundColor: village.ndvi >= 0.70 ? '#059669' : '#D97706',
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-stone-500">Available: </span>
                        <strong className="text-stone-800">{village.estimatedYieldTonnes} T</strong>
                      </div>
                      <div>
                        <span className="text-stone-500">Benchmark: </span>
                        <strong className="text-[#0F3D2E]">Rs {village.fairPrice}/q</strong>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredVillages.length === 0 && (
                <div className="text-center py-10 text-stone-400">
                  <p className="text-sm font-semibold">No village clusters found</p>
                  <p className="text-xs mt-1">Try broadening your search query or filters.</p>
                </div>
              )}
            </div>

          </div>

          {/* ===================================================================== */}
          {/* BOTTOM CART PREVIEW BAR                                               */}
          {/* ===================================================================== */}
          <div className="mt-4 pt-4 border-t border-stone-200">
            <div className="bg-[#0F3D2E] text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div>
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                  Direct Sourcing Staging
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
                  {totals.itemCount} Villages Selected • {totals.totalTonnes} Tonnes
                </p>
                <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                  Total Est: Rs {totals.netTotal.toLocaleString('en-IN')}
                </p>
              </div>

              <Link
                to="/mill/cart"
                className="flex items-center gap-2 bg-white text-[#0F3D2E] hover:bg-[#E8F2EC] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#1F6B4A]" />
                <span>Review Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Contact FPO Modal */}
      {contactModalVillage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setContactModalVillage(null)}
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
                  Contact FPO Representative
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {contactModalVillage.name} Cluster • {contactModalVillage.district}
                </p>
              </div>
            </div>

            <div className="bg-[#F5F7F2] p-4 rounded-2xl text-xs space-y-1.5 mb-4">
              <p className="text-stone-500">Registered Entity:</p>
              <p className="font-bold text-stone-800 text-sm">{contactModalVillage.fpoName}</p>
              <p className="text-stone-600 font-medium">{contactModalVillage.fpoContact}</p>
              <p className="text-[11px] text-[#059669] font-bold">Verified Registration: {contactModalVillage.regNo || 'UP-FPO-VERIFIED'}</p>
            </div>

            {messageSent ? (
              <div className="py-6 text-center text-[#059669] font-bold text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Inquiry Broadcasted to FPO Secretary</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Direct Message / Offer Specification
                </label>
                <textarea
                  rows={3}
                  defaultValue={`Greetings from Moradabad Rice Works. We are interested in procuring 50-100 Tonnes from ${contactModalVillage.name} at Rs ${contactModalVillage.fairPrice}/q. Please confirm harvest readiness.`}
                  className="w-full bg-[#F5F7F2] text-xs p-3 rounded-xl border border-stone-200 outline-none focus:border-[#1F6B4A]"
                />

                <div className="flex gap-2 pt-2">
                  <a
                    href={`tel:${contactModalVillage.fpoContact?.split(' ')[1] || '9838000000'}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F5F7F2] hover:bg-[#E8F2EC] text-[#0F3D2E] py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#1F6B4A]" />
                    <span>Call Direct</span>
                  </a>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}