import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  ArrowUpRight,
  Wallet,
  FileText,
  Plus,
  X,
  Lock,
  Receipt,
  Scale,
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-MRB-9901',
    fpoPayee: 'Rampur Krishi Vikas Samiti',
    village: 'Rampur',
    bankAccount: 'HDFC Bank •• 4912',
    volumeTonnes: 50,
    dispatchedAmount: 1090000,
    status: 'Settled',
    date: '18 Sep 2026',
    receiptRef: 'RCP-2026-091',
    weighbridgeSlip: 'WB-RAM-412',
  },
  {
    id: 'TXN-MRB-9884',
    fpoPayee: 'Kalyanpur Gramin Utthan FPO',
    village: 'Kalyanpur',
    bankAccount: 'Punjab National Bank •• 8821',
    volumeTonnes: 120,
    dispatchedAmount: 2592000,
    status: 'In Escrow',
    date: '17 Sep 2026',
    receiptRef: 'RCP-2026-088',
    weighbridgeSlip: 'WB-KAL-109',
  },
  {
    id: 'TXN-MRB-9872',
    fpoPayee: 'Kanth Kisan Jagriti Mandal',
    village: 'Kanth',
    bankAccount: 'State Bank of India •• 3301',
    volumeTonnes: 85,
    dispatchedAmount: 1848750,
    status: 'Settled',
    date: '15 Sep 2026',
    receiptRef: 'RCP-2026-074',
    weighbridgeSlip: 'WB-KAN-802',
  },
  {
    id: 'TXN-MRB-9850',
    fpoPayee: 'Bagh Progressive Farmers Group',
    village: 'Bagh Farm',
    bankAccount: 'Bank of Baroda •• 1290',
    volumeTonnes: 15,
    dispatchedAmount: 327000,
    status: 'Processing',
    date: '14 Sep 2026',
    receiptRef: 'RCP-2026-061',
    weighbridgeSlip: 'WB-BAG-023',
  },
];

export default function Payments() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000000');
  const [escrowBalance, setEscrowBalance] = useState(4850000);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amt = Number(depositAmount) || 0;
    setEscrowBalance((prev) => prev + amt);
    setDepositSuccess(true);
    setTimeout(() => {
      setDepositSuccess(false);
      setShowDepositModal(false);
    }, 2000);
  };

  const releaseEscrowPayment = (txnId) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'Settled' } : t))
    );
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4A]">
              Institutional Escrow &amp; Settlements
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F3D2E] tracking-tight mt-0.5">
            Payments &amp; Disbursements
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-medium">
            Automated T+1 milestone settlements upon digital weighbridge slip verification.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDepositModal(true)}
          className="flex items-center gap-2 bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white px-5 py-2.5 rounded-2xl font-bold text-xs transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Escrow Vault</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FINANCIAL OVERVIEW METRIC CARDS                                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#0F3D2E] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Active Escrow Balance
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">
                Rs {(escrowBalance / 100000).toFixed(2)} L
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100 font-medium">
            <span>Locked in District Vault</span>
            <span className="font-bold text-white">100% Secured</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Budget Disbursed
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#0F3D2E]">
                Rs 58.57 L
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 font-medium">
            <span>270 Tonnes Settled (Kharif 2026)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pending Weighbridge Release
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#D97706]">
                Rs 25.92 L
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-500 font-medium">
            <span>1 Escrow batch in verification</span>
          </div>
        </div>

        <div className="bg-[#E8F2EC] p-6 rounded-3xl border border-[#1F6B4A]/20 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
              Broker Leakage Saved
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#059669]">
                Rs 18.45 L
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1F6B4A]/15 text-xs text-stone-600 font-medium">
            <span>Average 8.2% cost reduction</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TRANSACTION LEDGER TABLE                                                 */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#0F3D2E]">
              Procurement Disbursement Ledger
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Itemized direct bank transfers to verified FPO accounts.
            </p>
          </div>
          <span className="text-xs font-bold bg-[#F5F7F2] text-stone-600 px-3 py-1.5 rounded-xl">
            {transactions.length} Ledger Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200/80">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">FPO Payee &amp; Bank</th>
                <th className="py-3.5 px-4">Village Cluster</th>
                <th className="py-3.5 px-4">Volume</th>
                <th className="py-3.5 px-4">Dispatched Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#F5F7F2]/50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-[#0F3D2E]">
                    {txn.id}
                    <span className="block text-[10px] text-stone-400 font-sans">
                      Date: {txn.date}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-stone-800">{txn.fpoPayee}</span>
                    <span className="block text-[11px] text-stone-500 font-mono">
                      {txn.bankAccount}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-stone-800">
                    {txn.village}
                    <span className="block text-[10px] text-stone-400 font-mono">
                      Slip: {txn.weighbridgeSlip}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-extrabold text-stone-800 text-sm">
                      {txn.volumeTonnes} T
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      ({txn.volumeTonnes * 10} Quintals)
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-black text-[#0F3D2E] text-sm">
                      Rs {txn.dispatchedAmount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        txn.status === 'Settled'
                          ? 'bg-[#E8F2EC] text-[#059669]'
                          : txn.status === 'In Escrow'
                          ? 'bg-amber-100 text-[#D97706]'
                          : 'bg-blue-100 text-[#2563EB]'
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {txn.status === 'In Escrow' && (
                        <button
                          type="button"
                          onClick={() => releaseEscrowPayment(txn.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white text-[11px] font-bold transition-colors shadow-xs"
                        >
                          Release Funds
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveReceipt(txn)}
                        className="p-1.5 rounded-xl text-stone-500 hover:text-[#0F3D2E] hover:bg-stone-100 transition-colors"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escrow Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[#E8F2EC] text-[#0F3D2E] flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6 text-[#1F6B4A]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0F3D2E]">
                  Top Up Escrow Vault
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Moradabad Rice Works Primary Sourcing Account
                </p>
              </div>
            </div>

            {depositSuccess ? (
              <div className="py-8 text-center text-[#059669] font-bold text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10" />
                <span>Escrow Funds Allocated Successfully</span>
              </div>
            ) : (
              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Deposit Amount (INR)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#F5F7F2] text-sm font-extrabold p-3 rounded-xl border border-stone-200 outline-none text-[#0F3D2E]"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block font-medium">
                    Rs {(Number(depositAmount) / 100000).toFixed(2)} Lakhs
                  </span>
                </div>

                <div className="bg-[#F5F7F2] p-3 rounded-2xl space-y-1">
                  <p className="text-stone-500">Source Account:</p>
                  <p className="font-bold text-stone-800">State Bank of India (A/C •• 9012)</p>
                  <p className="text-[10px] text-stone-500">Authorized Signatory: Procurement Director</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold transition-colors shadow-xs"
                >
                  Deposit to Escrow Vault
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F6B4A] bg-[#E8F2EC] px-2.5 py-0.5 rounded-md">
                Official GramSetu Settlement Voucher
              </span>
              <h3 className="font-black text-lg text-[#0F3D2E] mt-1">
                Moradabad Rice Works
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                {activeReceipt.receiptRef} • {activeReceipt.date}
              </p>
            </div>

            <div className="py-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Beneficiary FPO:</span>
                <strong className="text-stone-800">{activeReceipt.fpoPayee}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Disbursement Account:</span>
                <strong className="text-stone-800 font-mono">{activeReceipt.bankAccount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Origin Village:</span>
                <strong className="text-stone-800">{activeReceipt.village}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Weighbridge Cert Slip:</span>
                <strong className="text-stone-800 font-mono">{activeReceipt.weighbridgeSlip}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Sourced Quantity:</span>
                <strong className="text-stone-800">{activeReceipt.volumeTonnes} Tonnes</strong>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between items-baseline">
                <span className="font-bold text-stone-700">Total Settled Value:</span>
                <strong className="text-base font-black text-[#059669]">
                  Rs {activeReceipt.dispatchedAmount.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#F5F7F2] text-stone-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading voucher ${activeReceipt.receiptRef}.pdf`);
                  setActiveReceipt(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#1F6B4A] text-white font-bold text-xs shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
