// GramSetu Centralized Single Source of Truth
export const DEMO_DATA = {
    // Common Crop & Price Benchmarks
    crop: {
      name: "धान (Paddy)",
      type: "paddy",
      msp: 2203,
      mandiRate: 2150,
      millRate: 2180,
      fairPrice: 2150, // Calculated fair benchmark
      defaultBrokerOffer: 1800, // Exploit quote
      defaultQtyQuintals: 50,
    },
  
    // Primary Village Story: Rampur
    heroVillage: {
      id: "rampur-01",
      name: "Rampur",
      nameHindi: "रामपुर",
      district: "Moradabad",
      state: "Uttar Pradesh",
      polygonId: "6a99c6ffdddba80008a5115e",
      areaHectares: 202.98,
      lat: 28.8100,
      lng: 78.7500,
      ndvi: 0.74,
      healthLabel: "उत्कृष्ट फसल",
      estimatedYieldTonnes: 480,
      harvestWindow: "10 Oct - 25 Oct",
      brokerOffer: 1800,
      gapPercentage: 16.2, // (2150 - 1800) / 2150 * 100
      totalLossFor50Q: 17500, // (2150 - 1800) * 50
      riskLevel: "High",
    },
  
    // District Clusters for Mill Map & Gov Table
    villageClusters: [
      {
        id: "v-rampur",
        name: "Rampur Cluster",
        nameHindi: "रामपुर क्लस्टर",
        lat: 28.8100,
        lng: 78.7500,
        estimatedYieldTonnes: 480,
        ndvi: 0.74,
        status: "Ready Now",
        harvestWindow: "10 Oct - 25 Oct",
        brokerOffer: 1800,
        fairPrice: 2150,
        gapPercentage: "16%",
        riskLevel: "High",
        mapX: "30%",
        mapY: "40%",
      },
      {
        id: "v-sitapur",
        name: "Sitapur Cluster",
        nameHindi: "सीतापुर क्लस्टर",
        lat: 28.8350,
        lng: 78.7800,
        estimatedYieldTonnes: 320,
        ndvi: 0.68,
        status: "8 Days Left",
        harvestWindow: "18 Oct - 02 Nov",
        brokerOffer: 1900,
        fairPrice: 2140,
        gapPercentage: "11%",
        riskLevel: "Medium",
        mapX: "58%",
        mapY: "35%",
      },
      {
        id: "v-bagh",
        name: "Bagh Farm",
        nameHindi: "बाग फार्म",
        lat: 28.8386,
        lng: 78.7733,
        estimatedYieldTonnes: 15,
        ndvi: 0.71,
        status: "Ready Now",
        harvestWindow: "Ready",
        brokerOffer: 2100,
        fairPrice: 2150,
        gapPercentage: "2%",
        riskLevel: "Low",
        mapX: "45%",
        mapY: "62%",
      },
      {
        id: "v-kanth",
        name: "Kanth Cluster",
        nameHindi: "कांठ क्लस्टर",
        lat: 28.8500,
        lng: 78.7200,
        estimatedYieldTonnes: 210,
        ndvi: 0.70,
        status: "Ready Now",
        harvestWindow: "12 Oct - 28 Oct",
        brokerOffer: 2050,
        fairPrice: 2170,
        gapPercentage: "5.5%",
        riskLevel: "Low",
        mapX: "20%",
        mapY: "25%",
      },
      {
        id: "v-[#0F3D2E]",
        name: "Mohanpur",
        nameHindi: "मोहनपुर",
        lat: 28.7900,
        lng: 78.8000,
        estimatedYieldTonnes: 90,
        ndvi: 0.55,
        status: "Harvest Low",
        harvestWindow: "Completed",
        brokerOffer: 1920,
        fairPrice: 2130,
        gapPercentage: "10%",
        riskLevel: "Medium",
        mapX: "70%",
        mapY: "58%",
      },
    ],
  
    // Nearby Mills for Farmer
    nearbyMills: [
      {
        id: "m-shree",
        name: "Shree Rice Mill",
        distanceKm: 4.2,
        buyingRate: 2180,
        requiredTonnes: 120,
        status: "Active Today",
      },
      {
        id: "m-ganga",
        name: "Ganga Foods Pvt Ltd",
        distanceKm: 7.8,
        buyingRate: 2165,
        requiredTonnes: 80,
        status: "Active Today",
      },
      {
        id: "m-bharat",
        name: "Bharat Agro Processing",
        distanceKm: 11.5,
        buyingRate: 2175,
        requiredTonnes: 150,
        status: "Open Tomorrow",
      },
    ],
  
    // AI Advisory Output
    aiAdvisory: {
      hindiText:
        "आपकी फसल बहुत स्वस्थ है (NDVI 0.74)। रामपुर में ब्रोकर का ₹1,800 भाव अत्यधिक कम (16% का नुकसान) है। आज पास की 'Shree Rice Mill' ₹2,180 में सीधा धान खरीद रही है। जल्दबाजी न करें, कम से कम ₹2,150 पर ही सौदा करें।",
    },
  
    // Gov Command KPIs
    govKPIs: {
      farmersActive: "1,280",
      millsActive: "18",
      avgBrokerGap: "₹280/q",
      highRiskVillagesCount: 7,
      directDealsThisWeek: 42,
      mspBreachFlags: 3,
    },
  };