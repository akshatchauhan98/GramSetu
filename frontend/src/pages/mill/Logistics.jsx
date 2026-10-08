import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Calendar,
  Scale,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
  Navigation,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

// Custom SVG Icon for Truck Markers
const truckIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#0F3D2E" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck">
  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
  <path d="M15 18H9"/>
  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
  <circle cx="17" cy="18" r="2"/>
  <circle cx="7" cy="18" r="2"/>
</svg>`;

const truckLeafletIcon = L.divIcon({
  html: `<div style="background-color: #0F3D2E; border: 2px solid white; border-radius: 12px; padding: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
  </div>`,
  className: 'custom-truck-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const millLeafletIcon = L.divIcon({
  html: `<div style="background-color: #059669; border: 2px solid white; border-radius: 12px; padding: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>
  </div>`,
  className: 'custom-mill-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const INITIAL_TRUCKS = [
  {
    id: 'TRK-01',
    regNo: 'UP-22-AT-4521',
    driver: 'Ramesh Yadav',
    phone: '+91 98381 22910',
    origin: 'Rampur Cluster',
    destination: 'Moradabad Mill (Unit 1)',
    cargoWeightTonnes: 20,
    cargoType: 'Paddy (PR-126)',
    status: 'In Transit',
    speedKmH: 48,
    eta: 'Today, 3:45 PM',
    currentCoords: [28.825, 78.895],
    routePath: [
      [28.815, 79.025], // Rampur
      [28.825, 78.895], // Current truck pos
      [28.838, 78.775], // Moradabad Mill
    ],
  },
  {
    id: 'TRK-02',
    regNo: 'UP-21-BN-9034',
    driver: 'Santosh Pal',
    phone: '+91 97190 44211',
    origin: 'Kanth Village',
    destination: 'Moradabad Mill (Unit 1)',
    cargoWeightTonnes: 15,
    cargoType: 'Paddy (Common)',
    status: 'In Transit',
    speedKmH: 52,
    eta: 'Today, 2:15 PM',
    currentCoords: [28.845, 78.745],
    routePath: [
      [28.850, 78.720], // Kanth
      [28.845, 78.745], // Current truck pos
      [28.838, 78.775], // Moradabad Mill
    ],
  },
  {
    id: 'TRK-03',
    regNo: 'UP-25-CT-1188',
    driver: 'Manjeet Singh',
    phone: '+91 94123 00812',
    origin: 'Sitapur Agro FPO',
    destination: 'Moradabad Mill (Unit 2)',
    cargoWeightTonnes: 25,
    cargoType: 'Paddy (Grade A)',
    status: 'Scheduled Loading',
    speedKmH: 0,
    eta: 'Tomorrow, 11:00 AM',
    currentCoords: [28.835, 78.995],
    routePath: [
      [28.835, 78.995],
      [28.838, 78.775],
    ],
  },
];

export default function Logistics() {
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // New Booking State
  const [bookingData, setBookingData] = useState({
    vehicleCapacity: '10T',
    pickupVillage: 'Rampur',
    pickupDate: '2026-09-20',
    notes: 'Electronic weighbridge verification required at origin.',
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingModal(false);
    }, 2500);
  };

  const millCoords = [28.838, 78.775];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Farm-to-Gate Supply Chain Telematics
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Logistics &amp; Fleet Tracking
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Live GPS telemetry of dispatched heavy transport trucks and automated village pickup scheduling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Village Transport</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: INTERACTIVE VEHICLE TRACKING CANVAS (LEAFLET MAP)             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#1F6B4A]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F3D2E]">
                Live GPS Transit Map (UP NH-24 / Bareilly-Moradabad Corridor)
              </h3>
              <p className="text-[11px] text-stone-500">
                Tracking 2 moving commercial trucks, 1 scheduled loading
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-ping" />
            <span>GPS Satellite Uplink Active</span>
          </div>
        </div>

        <div className="w-full h-96 relative z-0">
          <MapContainer
            center={[28.825, 78.895]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Live Telematics: GramSetu Fleet OS'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Destination Mill Marker */}
            <Marker position={millCoords} icon={millLeafletIcon}>
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <h4 className="font-black text-xs text-[#0F3D2E]">
                    Moradabad Rice Works (Central Silo)
                  </h4>
                  <p className="text-[10px] text-stone-500">Processing &amp; Weighbridge Gate 1</p>
                  <p className="text-[10px] text-[#059669] font-bold mt-1">Status: Accepting Unloading</p>
                </div>
              </Popup>
            </Marker>

            {/* In-Transit Truck Markers & Paths */}
            {trucks.map((truck) => (
              <React.Fragment key={truck.id}>
                <Polyline
                  positions={truck.routePath}
                  pathOptions={{
                    color: truck.status === 'In Transit' ? '#1F6B4A' : '#A8A29E',
                    weight: 4,
                    dashArray: truck.status === 'In Transit' ? '6, 8' : undefined,
                    opacity: 0.8,
                  }}
                />

                <Marker position={truck.currentCoords} icon={truckLeafletIcon}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                        <h4 className="font-black text-xs text-[#0F3D2E] font-mono">
                          {truck.regNo}
                        </h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#E8F2EC] text-[#059669]">
                          {truck.speedKmH} km/h
                        </span>
                      </div>
                      <div className="py-2 text-xs space-y-1 text-stone-600">
                        <p>Driver: <strong>{truck.driver}</strong></p>
                        <p>Origin: <strong>{truck.origin}</strong></p>
                        <p>Cargo: <strong>{truck.cargoWeightTonnes} T ({truck.cargoType})</strong></p>
                        <p className="text-[#059669] font-bold">ETA: {truck.eta}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: FLEET MANIFEST TABLE                                           */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0F3D2E]">
              Fleet Transit Manifest
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Verified electronic consignments and driver contact coordinates.
            </p>
          </div>
          <span className="text-xs font-bold bg-[#F5F7F2] text-stone-600 px-3 py-1.5 rounded-xl">
            {trucks.length} Dispatched Vehicles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200/80">
                <th className="py-3.5 px-4">Vehicle Reg No</th>
                <th className="py-3.5 px-4">Driver Details</th>
                <th className="py-3.5 px-4">Origin Village</th>
                <th className="py-3.5 px-4">Destination Mill</th>
                <th className="py-3.5 px-4">Cargo Weight</th>
                <th className="py-3.5 px-4">Status &amp; ETA</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-[#F5F7F2]/50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[#0F3D2E]">
                    {truck.regNo}
                    <span className="block text-[10px] text-stone-400 font-sans">
                      {truck.id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-stone-800">{truck.driver}</span>
                    <span className="block text-[11px] text-stone-500">{truck.phone}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-stone-800">
                    {truck.origin}
                  </td>
                  <td className="py-4 px-4 text-stone-600">
                    {truck.destination}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-black text-[#0F3D2E] text-sm">
                      {truck.cargoWeightTonnes} T
                    </span>
                    <span className="block text-[10px] text-stone-400 font-semibold">
                      {truck.cargoType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        truck.status === 'In Transit'
                          ? 'bg-[#E8F2EC] text-[#059669]'
                          : 'bg-amber-100 text-[#D97706]'
                      }`}
                    >
                      {truck.status}
                    </span>
                    <span className="block text-[11px] text-stone-500 font-medium mt-0.5">
                      {truck.eta}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <a
                      href={`tel:${truck.phone}`}
                      className="inline-flex items-center gap-1 bg-[#F5F7F2] hover:bg-[#E8F2EC] text-[#0F3D2E] px-3 py-1.5 rounded-xl font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#1F6B4A]" />
                      <span>Call Driver</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: TRANSPORT BOOKING MODAL                                        */}
      {/* ========================================================================= */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#1F6B4A]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F3D2E]">
                  Request Village Heavy Transport
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Dispatch dedicated commercial carrier for farm cluster pickup
                </p>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center text-[#059669] font-bold text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10" />
                <span>Transport Request Dispatched</span>
                <p className="text-xs text-stone-500 font-normal mt-1">
                  Assigned carrier fleet will confirm driver details within 30 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-2">
                    Commercial Vehicle Capacity
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['5T Medium', '10T Heavy', '20T Multi-Axle'].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setBookingData((prev) => ({ ...prev, vehicleCapacity: cap }))}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          bookingData.vehicleCapacity === cap
                            ? 'border-[#0F3D2E] bg-[#0F3D2E] text-white shadow-xs'
                            : 'border-stone-200 bg-[#F5F7F2] text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="font-bold block">{cap}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Origin Village
                    </label>
                    <select
                      value={bookingData.pickupVillage}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, pickupVillage: e.target.value }))}
                      className="w-full bg-[#F5F7F2] p-2.5 rounded-xl border border-stone-200 outline-none font-semibold text-stone-700 cursor-pointer"
                    >
                      <option value="Rampur">Rampur Cluster</option>
                      <option value="Sitapur">Sitapur Cluster</option>
                      <option value="Kalyanpur">Kalyanpur FPO</option>
                      <option value="Kanth">Kanth Cluster</option>
                      <option value="Bagh Farm">Bagh Farm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1">
                      Scheduled Pickup Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.pickupDate}
                      onChange={(e) => setBookingData((prev) => ({ ...prev, pickupDate: e.target.value }))}
                      className="w-full bg-[#F5F7F2] p-2.5 rounded-xl border border-stone-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Special Instructions / Weighbridge Notes
                  </label>
                  <textarea
                    rows={2}
                    value={bookingData.notes}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-[#F5F7F2] p-2.5 rounded-xl border border-stone-200 outline-none"
                  />
                </div>

                <div className="bg-[#E8F2EC] p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-stone-600 font-medium">Estimated Freight Charge:</span>
                  <strong className="text-[#0F3D2E] font-bold text-sm">
                    {bookingData.vehicleCapacity === '5T Medium' ? 'Rs 3,500' : bookingData.vehicleCapacity === '10T Heavy' ? 'Rs 6,200' : 'Rs 11,500'}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold transition-colors shadow-xs"
                >
                  Confirm Transport Booking
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
