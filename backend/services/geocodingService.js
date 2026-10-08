import https from 'https';
import http from 'http';

// In-memory cache for resolved locations to avoid repeating geocoding API requests
const locationCache = new Map();

/**
 * Reusable helper for Indian mobile number normalization (Requirement 3)
 */
export function normalizeIndianMobile(value) {
  if (!value) return '';
  let str = String(value).trim().replace(/[\s\-]/g, '');
  if (str.startsWith('+91')) {
    str = str.substring(3);
  } else if (str.startsWith('91') && str.length === 12) {
    str = str.substring(2);
  }
  const digitsOnly = str.replace(/\D/g, '');
  return digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;
}

/**
 * Validate Indian 10-digit mobile number format (Requirement 9)
 */
export function isValidIndianMobile(mobile) {
  const norm = normalizeIndianMobile(mobile);
  return /^[6-9]\d{9}$/.test(norm);
}

/**
 * Check if identifier is an email (Requirement 8)
 */
export function isEmail(identifier) {
  return typeof identifier === 'string' && identifier.includes('@');
}

/**
 * Calculate straight-line geographic distance in km between two lat/lng coordinates using the Haversine formula.
 */

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) {
    return null;
  }

  const R = 6371; // Earth radius in km
  const dLat = (nLat2 - nLat1) * (Math.PI / 180);
  const dLon = (nLon2 - nLon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nLat1 * (Math.PI / 180)) *
      Math.cos(nLat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place
  return Math.round(distance * 10) / 10;
}

/**
 * Helper to HTTP/HTTPS fetch JSON from Nominatim
 */
function fetchNominatimJson(queryString) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryString)}&limit=1`;
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'GramSetu-App/1.0 (contact@gramsetu.in)'
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve([]);
          }
        });
      }
    );
    req.on('error', () => resolve([]));
  });
}

/**
 * Resolve coordinates for a given query string with caching & verification logic
 */
export async function geocodeQuery(queryText, expectedDistrict = '', expectedState = 'Uttar Pradesh') {
  const cleanQuery = queryText.trim();
  if (!cleanQuery) return null;

  const cacheKey = cleanQuery.toLowerCase();
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey);
  }

  try {
    const results = await fetchNominatimJson(cleanQuery);
    if (results && results.length > 0) {
      const topResult = results[0];
      const lat = parseFloat(topResult.lat);
      const lon = parseFloat(topResult.lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        const displayName = topResult.display_name || '';
        // Verify state/country match
        const isIndia = displayName.toLowerCase().includes('india');
        const stateMatch = !expectedState || displayName.toLowerCase().includes(expectedState.toLowerCase());

        if (isIndia && stateMatch) {
          const resObj = {
            latitude: lat,
            longitude: lon,
            displayName,
            locationSource: 'OpenStreetMap / verified geocoding',
            locationVerified: true
          };
          locationCache.set(cacheKey, resObj);
          return resObj;
        }
      }
    }
  } catch (err) {
    console.error(`Geocoding error for query "${cleanQuery}":`, err.message);
  }

  const nullObj = {
    latitude: null,
    longitude: null,
    locationSource: null,
    locationVerified: false
  };
  locationCache.set(cacheKey, nullObj);
  return nullObj;
}

/**
 * Resolver for Farmer Village Coordinates
 */
export async function resolveFarmerVillageCoordinates({ village = '', district = '', state = 'Uttar Pradesh' } = {}) {
  const cleanVillage = village.trim();
  const cleanDistrict = district.trim();
  const cleanState = state.trim() || 'Uttar Pradesh';

  if (!cleanVillage && !cleanDistrict) {
    return { village: cleanVillage, district: cleanDistrict, state: cleanState, latitude: null, longitude: null, resolved: false };
  }

  // Pre-configured fast lookups for common UP villages/districts to avoid external API delays
  const staticLookups = {
    'gahmar, ghazipur, uttar pradesh': { latitude: 25.4992, longitude: 83.8089 },
    'ghazipur, uttar pradesh': { latitude: 25.5804, longitude: 83.5770 },
    'varanasi, uttar pradesh': { latitude: 25.3176, longitude: 82.9739 },
    'akbarpur, ambedkar nagar, uttar pradesh': { latitude: 26.4201, longitude: 82.5383 },
    'ambedkar nagar, uttar pradesh': { latitude: 26.4201, longitude: 82.5383 },
    'lucknow, uttar pradesh': { latitude: 26.8467, longitude: 80.9462 },
    'gorakhpur, uttar pradesh': { latitude: 26.7606, longitude: 83.3732 },
    'prayagraj, uttar pradesh': { latitude: 25.4358, longitude: 81.8463 },
    'sitapur, uttar pradesh': { latitude: 27.5683, longitude: 80.6806 }
  };

  const lookupKey = `${cleanVillage ? cleanVillage + ', ' : ''}${cleanDistrict ? cleanDistrict + ', ' : ''}${cleanState}`.toLowerCase();
  if (staticLookups[lookupKey]) {
    return {
      village: cleanVillage,
      district: cleanDistrict,
      state: cleanState,
      latitude: staticLookups[lookupKey].latitude,
      longitude: staticLookups[lookupKey].longitude,
      resolved: true
    };
  }

  // Strategy 1: Village + District + State + India
  if (cleanVillage && cleanDistrict) {
    const q = `${cleanVillage}, ${cleanDistrict}, ${cleanState}, India`;
    const geo = await geocodeQuery(q, cleanDistrict, cleanState);
    if (geo && geo.latitude !== null) {
      return {
        village: cleanVillage,
        district: cleanDistrict,
        state: cleanState,
        latitude: geo.latitude,
        longitude: geo.longitude,
        resolved: true
      };
    }
  }

  // Strategy 2: District + State + India
  if (cleanDistrict) {
    const q = `${cleanDistrict}, ${cleanState}, India`;
    const geo = await geocodeQuery(q, cleanDistrict, cleanState);
    if (geo && geo.latitude !== null) {
      return {
        village: cleanVillage,
        district: cleanDistrict,
        state: cleanState,
        latitude: geo.latitude,
        longitude: geo.longitude,
        resolved: true
      };
    }
  }

  return {
    village: cleanVillage,
    district: cleanDistrict,
    state: cleanState,
    latitude: null,
    longitude: null,
    resolved: false
  };
}
