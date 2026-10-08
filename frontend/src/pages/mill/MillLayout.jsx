import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Factory,
  MapPin,
  ClipboardList,
  ShoppingCart,
  Briefcase,
  Users,
  Truck,
  BarChart3,
  CreditCard,
  ArrowLeft,
  Bell,
  Search,
  CheckCircle2,
  X,
  ChevronDown,
} from 'lucide-react';
import { useMillCart } from '../../context/MillCartContext';

export default function MillLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totals, notification } = useMillCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(3);

  const notificationsList = [
    {
      id: 1,
      title: 'Direct Offer Accepted',
      desc: 'Rampur Krishi Vikas Samiti accepted offer @ Rs 2,180/q (50 T locked)',
      time: '2 mins ago',
      type: 'success',
    },
    {
      id: 2,
      title: 'Satellite Scan Refreshed',
      desc: 'Sentinel-2 scan for Sitapur recorded NDVI improvement to 0.71',
      time: '14 mins ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Logistics Dispatched',
      desc: 'Vehicle UP-22-AT-4521 en route from Rampur to Moradabad Processing Unit',
      time: '45 mins ago',
      type: 'truck',
    },
  ];

  const navTabs = [
    { name: 'Dashboard', path: '/mill', icon: Factory },
    { name: 'Supply Map', path: '/mill/map', icon: MapPin },
    { name: 'Requirements', path: '/mill/requirements', icon: ClipboardList },
    {
      name: 'Procurement Cart',
      path: '/mill/cart',
      icon: ShoppingCart,
      badge: totals.itemCount,
    },
    { name: 'Active Deals', path: '/mill/deals', icon: Briefcase },
    { name: 'Farmer Directory', path: '/mill/farmers', icon: Users },
    { name: 'Logistics', path: '/mill/logistics', icon: Truck },
    { name: 'Analytics', path: '/mill/analytics', icon: BarChart3 },
    { name: 'Payments', path: '/mill/payments', icon: CreditCard },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    // Route to supply map or farmer directory with query
    navigate(`/mill/map?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F2] font-sans text-[#14201B] selection:bg-[#E8F2EC]">
      {/* Toast Notification Container */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 bg-[#0F3D2E] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-500/30 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            
            {/* Left Brand Identity */}
            <Link to="/mill" className="flex items-center gap-3 shrink-0 group">
              <div className="p-2.5 bg-[#0F3D2E] text-white rounded-2xl group-hover:bg-[#1F6B4A] transition-colors shadow-xs">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-[#0F3D2E] tracking-tight">
                    GramSetu Mill OS
                  </h1>
                  <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider bg-[#E8F2EC] text-[#1F6B4A] px-2 py-0.5 rounded-md">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 font-semibold tracking-wide">
                  Direct Procurement Hub
                </p>
              </div>
            </Link>

            {/* Center: Global Search Bar */}
            <div className="flex-1 max-w-xl mx-2 sm:mx-6">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search villages, farmer FPOs, crops..."
                  className="w-full bg-[#F5F7F2] hover:bg-stone-100/80 focus:bg-white text-xs sm:text-sm pl-10 pr-8 py-2.5 rounded-2xl border border-stone-200 focus:border-[#1F6B4A] focus:ring-2 focus:ring-[#1F6B4A]/10 outline-none transition-all placeholder:text-stone-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Right: Notifications, Profile, Back Link */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* Notifications Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-2xl bg-[#F5F7F2] hover:bg-[#E8F2EC] text-stone-600 hover:text-[#0F3D2E] transition-colors"
                  aria-label="System Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlerts > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#DC2626] rounded-full ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div>
                        <h4 className="text-sm font-bold text-[#0F3D2E]">System Alerts</h4>
                        <p className="text-[11px] text-stone-500">Real-time procurement updates</p>
                      </div>
                      <button
                        onClick={() => setUnreadAlerts(0)}
                        className="text-[11px] text-[#1F6B4A] font-bold hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="divide-y divide-stone-100 mt-2 max-h-72 overflow-y-auto">
                      {notificationsList.map((notif) => (
                        <div key={notif.id} className="py-2.5 hover:bg-[#F5F7F2] px-2 rounded-xl transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-[#0F3D2E]">{notif.title}</span>
                            <span className="text-[10px] text-stone-400 shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{notif.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Organization Profile Badge */}
              <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-stone-200">
                <div className="w-9 h-9 rounded-2xl bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  MR
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#0F3D2E] leading-tight">
                    Moradabad Rice Works
                  </p>
                  <p className="text-[10px] text-stone-500 font-semibold">
                    Procurement Director
                  </p>
                </div>
              </div>

              {/* Back to Website Link */}
              <Link
                to="/"
                id="mill-back-to-website"
                title="Back to Website Landing Page"
                className="flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-[#0F3D2E] bg-[#F5F7F2] hover:bg-[#E8F2EC] px-3.5 py-2 rounded-2xl transition-colors shrink-0 shadow-xs border border-stone-200/60"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Website</span>
                <span className="sm:hidden">Website</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Deep Forest Green Sub-Navigation Bar */}
        <div className="bg-[#0F3D2E] px-4 sm:px-6 lg:px-8 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {navTabs.map((item) => {
              const isActive =
                item.path === '/mill'
                  ? location.pathname === '/mill'
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-[#0F3D2E] shadow-sm'
                      : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6B4A]' : 'text-emerald-300'}`} />
                  <span>{item.name}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-[#0F3D2E] text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#059669] rounded-full -mb-1" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <Outlet />
      </main>
    </div>
  );
}