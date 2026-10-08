import React, { createContext, useContext, useState, useMemo } from 'react';

const MillCartContext = createContext(null);

const INITIAL_CART_ITEMS = [
  {
    id: 'v-rampur',
    village: 'Rampur',
    district: 'Bareilly District',
    tonnes: 120,
    ratePerQuintal: 2180,
    brokerRate: 2300,
    ndvi: 0.74,
    fpoName: 'Rampur Krishi Vikas Samiti',
    fpoContact: 'Maheshwar Singh (+91 94521 88390)',
    harvestDate: '10 Oct - 25 Oct',
    availableTonnes: 480,
  },
  {
    id: 'v-bagh',
    village: 'Bagh Farm',
    district: 'Moradabad District',
    tonnes: 15,
    ratePerQuintal: 2180,
    brokerRate: 2300,
    ndvi: 0.71,
    fpoName: 'Bagh Progressive Farmers Group',
    fpoContact: 'Vikram Singh (+91 98971 30045)',
    harvestDate: 'Ready Now',
    availableTonnes: 65,
  },
  {
    id: 'v-kanth',
    village: 'Kanth',
    district: 'Moradabad District',
    tonnes: 150,
    ratePerQuintal: 2175,
    brokerRate: 2300,
    ndvi: 0.70,
    fpoName: 'Kanth Kisan Jagriti Mandal',
    fpoContact: 'Suresh Chandra (+91 94123 77209)',
    harvestDate: '12 Oct - 28 Oct',
    availableTonnes: 210,
  },
];

export function MillCartProvider({ children }) {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const [notification, setNotification] = useState(null);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const addToCart = (villageData, tonnes = 50, rate = 2180) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === villageData.id);
      if (existing) {
        showToast(`Updated ${villageData.name || existing.village} allocation to ${existing.tonnes + tonnes} T`);
        return prev.map((item) =>
          item.id === villageData.id ? { ...item, tonnes: item.tonnes + tonnes } : item
        );
      }
      showToast(`Added ${villageData.name || 'Village'} (${tonnes} T) to procurement cart`);
      return [
        ...prev,
        {
          id: villageData.id,
          village: villageData.name,
          district: villageData.district || 'Uttar Pradesh',
          tonnes: tonnes || 50,
          ratePerQuintal: rate || villageData.fairPrice || 2180,
          brokerRate: 2300,
          ndvi: villageData.ndvi || 0.72,
          fpoName: villageData.fpoName || `${villageData.name} Kisan FPO`,
          fpoContact: villageData.fpoContact || 'FPO Desk (+91 98380 00000)',
          harvestDate: villageData.harvestWindow || 'October 2026',
          availableTonnes: villageData.estimatedYieldTonnes || 300,
        },
      ];
    });
  };

  const updateQuantity = (id, newTonnes) => {
    const validQty = Math.max(1, Number(newTonnes) || 1);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, tonnes: validQty } : item))
    );
  };

  const updateRate = (id, newRate) => {
    const validRate = Math.max(100, Number(newRate) || 100);
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ratePerQuintal: validRate } : item))
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const removed = prev.find((i) => i.id === id);
      if (removed) {
        showToast(`Removed ${removed.village} from cart`);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Procurement cart cleared');
  };

  // Calculations
  // 1 Tonne = 10 Quintals
  const totals = useMemo(() => {
    let totalTonnes = 0;
    let subtotal = 0;
    let brokerBaselineCost = 0;

    cartItems.forEach((item) => {
      const quintals = item.tonnes * 10;
      const lineCost = quintals * item.ratePerQuintal;
      const brokerLineCost = quintals * (item.brokerRate || 2300);

      totalTonnes += item.tonnes;
      subtotal += lineCost;
      brokerBaselineCost += brokerLineCost;
    });

    // 1.5% Platform Convenience Fee
    const convenienceFee = Math.round(subtotal * 0.015);
    // Estimated Freight Logistics: Rs 450 per tonne
    const estimatedLogistics = Math.round(totalTonnes * 450);
    // 5% GST on commodities/services
    const gstTax = Math.round((subtotal + convenienceFee) * 0.05);
    // Net Payable Total
    const netTotal = subtotal + convenienceFee + estimatedLogistics + gstTax;
    // Direct Savings vs Regional Brokerage Rate
    const netSavings = Math.max(0, brokerBaselineCost - subtotal);

    return {
      itemCount: cartItems.length,
      totalTonnes,
      subtotal,
      convenienceFee,
      estimatedLogistics,
      gstTax,
      netTotal,
      brokerBaselineCost,
      netSavings,
    };
  }, [cartItems]);

  return (
    <MillCartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        updateRate,
        removeFromCart,
        clearCart,
        totals,
        notification,
      }}
    >
      {children}
    </MillCartContext.Provider>
  );
}

export function useMillCart() {
  const context = useContext(MillCartContext);
  if (!context) {
    throw new Error('useMillCart must be used within a MillCartProvider');
  }
  return context;
}
