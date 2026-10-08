import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Building2,
  ShieldCheck,
  TrendingDown,
  Truck,
  FileText,
  CheckCircle2,
  ArrowRight,
  Plus,
  RotateCcw,
  Receipt,
  Scale,
  Calendar,
  X,
  MapPin,
  Lock,
} from 'lucide-react';
import { useMillCart } from '../../context/MillCartContext';

export default function ProcurementCart() {
  const {
    cartItems,
    updateQuantity,
    updateRate,
    removeFromCart,
    clearCart,
    totals,
  } = useMillCart();

  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const handleExecuteOrder = () => {
    const orderId = `PO-2026-MRB-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrderId(orderId);
    setOrderConfirmed(true);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Consolidated Sourcing Order
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Direct Procurement Cart
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Review village allocations, customize contracted tonnage, and lock benchmark pricing.
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#DC2626] bg-white px-3.5 py-2 rounded-2xl border border-stone-200 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Cart</span>
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-[#0F3D2E]">
            Your Procurement Cart is Empty
          </h3>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            Browse the Satellite Supply Map to identify high-NDVI village clusters ready for direct harvest intake.
          </p>
          <Link
            to="/mill/map"
            className="inline-flex items-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white px-6 py-3 rounded-2xl font-bold text-xs transition-colors shadow-sm"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Supply Map</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT PANEL: SOURCING BREAKDOWN (lg:col-span-8)                        */}
          {/* ===================================================================== */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-extrabold text-stone-700 uppercase tracking-wider">
                Village Sourcing Allocations ({cartItems.length})
              </h3>
              <span className="text-xs text-stone-500 font-semibold">
                1 Tonne = 10 Quintals
              </span>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => {
                const quintals = item.tonnes * 10;
                const lineTotal = quintals * item.ratePerQuintal;
                const brokerBaseline = quintals * (item.brokerRate || 2300);
                const lineSavings = brokerBaseline - lineTotal;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-6 transition-all hover:border-stone-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base text-[#0F3D2E]">
                            {item.village}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8F2EC] text-[#059669]">
                            NDVI {item.ndvi}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-medium mt-0.5">
                          {item.district} • {item.fpoName}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-500">
                          Est. Harvest: <strong className="text-stone-800">{item.harvestDate}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove allocation"
                          className="p-2 rounded-xl text-stone-400 hover:text-[#DC2626] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Editable fields & line total */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-center">
                      {/* Quantity Input */}
                      <div className="bg-[#F5F7F2] p-3 rounded-2xl border border-stone-200">
                        <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                          Contracted Tonnage
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max={item.availableTonnes || 1000}
                            value={item.tonnes}
                            onChange={(e) => updateQuantity(item.id, e.target.value)}
                            className="w-full bg-white text-sm font-extrabold px-3 py-1.5 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                          />
                          <span className="text-xs font-bold text-stone-500">T</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium mt-1 block">
                          {quintals} Quintals (Max {item.availableTonnes} T)
                        </span>
                      </div>

                      {/* Buy Rate Input */}
                      <div className="bg-[#F5F7F2] p-3 rounded-2xl border border-stone-200">
                        <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
                          Agreed Rate (Rs / Quintal)
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-500">Rs</span>
                          <input
                            type="number"
                            min="1000"
                            max="5000"
                            value={item.ratePerQuintal}
                            onChange={(e) => updateRate(item.id, e.target.value)}
                            className="w-full bg-white text-sm font-extrabold px-3 py-1.5 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                          />
                        </div>
                        <span className="text-[10px] text-[#059669] font-bold mt-1 block">
                          Broker quote: Rs {item.brokerRate || 2300}/q
                        </span>
                      </div>

                      {/* Line Total & Savings */}
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                          Line Subtotal
                        </span>
                        <span className="text-lg sm:text-xl font-black text-[#0F3D2E]">
                          Rs {lineTotal.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center sm:justify-end gap-1 text-[11px] font-bold text-[#059669] mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>Savings: Rs {lineSavings.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sourcing Escrow Assurance Card */}
            <div className="bg-[#E8F2EC] rounded-3xl p-5 border border-[#1F6B4A]/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0F3D2E] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div className="text-xs">
                <h5 className="font-extrabold text-[#0F3D2E]">
                  GramSetu Institutional Escrow & Quality Guarantee
                </h5>
                <p className="text-stone-600 mt-0.5 leading-snug">
                  Funds remain safely held in Moradabad District Escrow. Payment is automatically released only after digital weighbridge receipt and moisture testing compliance.
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT PANEL: STICKY FINANCIAL SUMMARY (lg:col-span-4)                */}
          {/* ===================================================================== */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className="border-b border-stone-100 pb-4">
                <h3 className="text-base font-extrabold text-[#0F3D2E]">
                  Financial Settlement Summary
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Direct commercial procurement invoice preview
                </p>
              </div>

              {/* Itemized calculation breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Gross Commodity Subtotal:</span>
                  <span className="font-bold text-stone-800">
                    Rs {totals.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Platform Convenience Fee</span>
                    <span className="text-[10px] text-stone-400">(1.5%)</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    Rs {totals.convenienceFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Estimated Logistics (Freight)</span>
                    <span className="text-[10px] text-stone-400">(@ Rs 450/T)</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    Rs {totals.estimatedLogistics.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Applicable Taxes</span>
                    <span className="text-[10px] text-stone-400">(GST 5%)</span>
                  </span>
                  <span className="font-bold text-stone-800">
                    Rs {totals.gstTax.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Net Total */}
                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#0F3D2E] block">
                      Net Total Amount
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      Total Volume: {totals.totalTonnes} Tonnes
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#0F3D2E] tracking-tight">
                    Rs {totals.netTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Financial Savings Callout */}
              <div className="bg-[#E8F2EC] p-4 rounded-2xl border border-[#1F6B4A]/25">
                <div className="flex items-center gap-2 text-[#059669] mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Direct Bypass Benefit
                  </span>
                </div>
                <p className="text-xs font-bold text-[#0F3D2E]">
                  Net savings vs broker procurement: Rs {totals.netSavings.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Based on current Moradabad local middleman quote (Rs 2,300/q).
                </p>
              </div>

              {/* Execute Button */}
              <button
                type="button"
                onClick={handleExecuteOrder}
                className="w-full py-4 rounded-2xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-black text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Execute Direct Procurement Order</span>
              </button>

              <p className="text-[11px] text-center text-stone-400 font-medium">
                Protected by GramSetu B2B Purchase Order Escrow Protocol
              </p>

            </div>
          </div>

        </div>
      )}

      {/* Order Execution Confirmation Modal */}
      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setOrderConfirmed(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#E8F2EC] text-[#059669] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1 mb-6">
              <h3 className="text-xl font-black text-[#0F3D2E]">
                Direct Procurement Order Executed
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Contract Reference: <strong className="text-stone-800 font-mono">{confirmedOrderId}</strong>
              </p>
            </div>

            <div className="bg-[#F5F7F2] p-4 rounded-2xl text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-stone-500">Procuring Entity:</span>
                <strong className="text-stone-800">Moradabad Rice Works</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Volume:</span>
                <strong className="text-stone-800">{totals.totalTonnes} Tonnes ({totals.totalTonnes * 10} Quintals)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Contract Value:</span>
                <strong className="text-[#0F3D2E] font-bold">Rs {totals.netTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Estimated Broker Savings:</span>
                <strong className="text-[#059669] font-bold">Rs {totals.netSavings.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOrderConfirmed(false)}
                className="flex-1 py-3 rounded-2xl bg-[#F5F7F2] hover:bg-stone-200 text-[#0F3D2E] font-bold text-xs transition-colors"
              >
                Close
              </button>
              <Link
                to="/mill/deals"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Track in Active Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
