/**
 * Hybrid Geocoder for Indore, India
 * 
 * Strategy (FIXED — Nominatim first for accuracy):
 * 1. First try Nominatim API for accurate, real-world coordinates
 * 2. If Nominatim fails (network error, rate limit, etc.), fall back to local lookup
 * 3. Returns null if nothing works (caller should use fallback)
 */

// Known Indore locations — used ONLY as fallback when Nominatim is unavailable
// These are approximate area centers, NOT exact addresses
const INDORE_LANDMARKS = {
  // Residential Areas
  'vijay nagar': { lat: 22.7533, lng: 75.8937 },
  'scheme 54': { lat: 22.7532, lng: 75.8829 },
  'scheme 78': { lat: 22.7470, lng: 75.9060 },
  'scheme 140': { lat: 22.7650, lng: 75.9050 },
  'palasia': { lat: 22.7244, lng: 75.8839 },
  'rajwada': { lat: 22.7163, lng: 75.8540 },
  'sapna sangeeta': { lat: 22.7230, lng: 75.8610 },
  'bhawarkua': { lat: 22.7210, lng: 75.8649 },
  'bhanwarkuan': { lat: 22.7210, lng: 75.8649 },
  'geeta bhawan': { lat: 22.7121, lng: 75.8752 },
  'rau': { lat: 22.6574, lng: 75.8578 },
  'nipania': { lat: 22.7647, lng: 75.9100 },
  'bengali square': { lat: 22.7436, lng: 75.8966 },
  'super corridor': { lat: 22.7700, lng: 75.9100 },
  'bypass road': { lat: 22.7600, lng: 75.8200 },
  'ab road': { lat: 22.7243, lng: 75.8689 },
  'mg road': { lat: 22.7230, lng: 75.8610 },
  'mahatma gandhi road': { lat: 22.7230, lng: 75.8610 },
  'nehru nagar': { lat: 22.7080, lng: 75.8648 },
  'sneh nagar': { lat: 22.7340, lng: 75.8710 },
  'annapurna': { lat: 22.7292, lng: 75.8505 },
  'sudama nagar': { lat: 22.7010, lng: 75.8580 },
  'mhow': { lat: 22.5543, lng: 75.7617 },
  'tilak nagar': { lat: 22.7150, lng: 75.8400 },
  'usha nagar': { lat: 22.6956, lng: 75.8376 },
  'mahalaxmi nagar': { lat: 22.7200, lng: 75.8320 },
  'pipliyahana': { lat: 22.7400, lng: 75.8900 },
  'silicon city': { lat: 22.7580, lng: 75.9020 },
  'khajrana': { lat: 22.7350, lng: 75.9050 },
  'aerodrome': { lat: 22.7220, lng: 75.8030 },
  'saket nagar': { lat: 22.7520, lng: 75.8720 },

  // Key Landmarks & Junctions — corrected coordinates
  'indus satellite greens': { lat: 22.7831, lng: 75.8931 },
  'indus satellite': { lat: 22.7831, lng: 75.8931 },
  'indus satellites': { lat: 22.7831, lng: 75.8931 },
  'indus town': { lat: 22.7820, lng: 75.8920 },
  'dewas naka': { lat: 22.7795, lng: 75.8865 },
  'dewas naka indore': { lat: 22.7795, lng: 75.8865 },
  'treasure island': { lat: 22.7543, lng: 75.8947 },
  'c21 mall': { lat: 22.7476, lng: 75.8973 },
  'phoenix citadel': { lat: 22.7539, lng: 75.8956 },
  'central mall': { lat: 22.7475, lng: 75.8970 },
  'apollo hospital': { lat: 22.7244, lng: 75.8839 },
  'my hospital': { lat: 22.7159, lng: 75.8567 },
  'bombay hospital': { lat: 22.7300, lng: 75.8620 },
  'choithram hospital': { lat: 22.7160, lng: 75.8780 },
  'medanta hospital': { lat: 22.7610, lng: 75.9130 },
  'iit indore': { lat: 22.5205, lng: 75.9205 },
  'iim indore': { lat: 22.6744, lng: 75.8444 },
  'devi ahilya university': { lat: 22.7230, lng: 75.8010 },
  'holkar stadium': { lat: 22.7230, lng: 75.8170 },
  'lalbagh': { lat: 22.7180, lng: 75.8570 },
  'sarafa bazaar': { lat: 22.7182, lng: 75.8574 },
  'chappan dukan': { lat: 22.7235, lng: 75.8630 },
  'patalpani': { lat: 22.5050, lng: 75.7680 },
  'railway station': { lat: 22.7183, lng: 75.8360 },
  'indore junction': { lat: 22.7183, lng: 75.8360 },
  'radisson': { lat: 22.7530, lng: 75.8940 },
  'marriott': { lat: 22.7510, lng: 75.8920 },
  'sayaji hotel': { lat: 22.7345, lng: 75.8970 },
  'malwa mill': { lat: 22.7130, lng: 75.8480 },
  'jawahar marg': { lat: 22.7170, lng: 75.8520 },
  'chl hospital': { lat: 22.7300, lng: 75.8620 },
  'ring road': { lat: 22.7400, lng: 75.8600 },
  'mr 10': { lat: 22.7450, lng: 75.8980 },
  'mr 9': { lat: 22.7350, lng: 75.9000 },
  'mr 10 road': { lat: 22.7450, lng: 75.8980 },
  'agra bombay road': { lat: 22.7243, lng: 75.8689 },
  'khandwa road': { lat: 22.6850, lng: 75.8560 },
  'airport': { lat: 22.7217, lng: 75.8011 },
  'devi ahilyabai holkar airport': { lat: 22.7217, lng: 75.8011 },
  'bus stand': { lat: 22.7220, lng: 75.8350 },
  'gangwal bus stand': { lat: 22.7220, lng: 75.8350 },
};

/**
 * Look up known Indore landmark coordinates from the address text
 * Used ONLY as fallback when Nominatim is unavailable
 */
function lookupLocal(address) {
  if (!address) return null;
  const lower = address.toLowerCase().trim();

  // Direct match
  if (INDORE_LANDMARKS[lower]) return INDORE_LANDMARKS[lower];

  // Check if any known landmark name is contained in the address
  // Sort keys by length descending so longer (more specific) matches win first
  const sortedKeys = Object.keys(INDORE_LANDMARKS).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) return INDORE_LANDMARKS[key];
  }

  return null;
}

/**
 * Try Nominatim API with multiple query variations
 */
async function nominatimGeocode(address) {
  const queries = [
    address + ', Indore, Madhya Pradesh, India',
    address + ', Indore, India',
    address,
  ];

  for (const q of queries) {
    try {
      const encoded = encodeURIComponent(q);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept': 'application/json', 'User-Agent': 'KabadBecho/1.0' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          source: 'nominatim',
          displayName: data[0].display_name,
        };
      }
      // Rate limit between attempts
      await new Promise(r => setTimeout(r, 1100));
    } catch (err) {
      console.warn('Nominatim geocoding attempt failed:', err);
    }
  }

  return null;
}

/**
 * Main geocode function — tries Nominatim FIRST (accurate), then local lookup as fallback
 * Returns { lat, lng } or null
 */
export async function geocodeAddress(address) {
  if (!address) return null;

  // 1. Try Nominatim API FIRST for accurate real-world coordinates
  try {
    const remote = await nominatimGeocode(address);
    if (remote) {
      console.log(`[Geocoder] Nominatim hit: "${address}" → [${remote.lat}, ${remote.lng}] (${remote.displayName})`);
      return { lat: remote.lat, lng: remote.lng };
    }
  } catch (err) {
    console.warn(`[Geocoder] Nominatim failed for "${address}", trying local fallback...`, err);
  }

  // 2. Fallback: Try local lookup (instant, offline — only used when API fails)
  const local = lookupLocal(address);
  if (local) {
    console.log(`[Geocoder] Local fallback hit: "${address}" → [${local.lat}, ${local.lng}] (approximate)`);
    return local;
  }

  console.warn(`[Geocoder] Failed completely for: "${address}"`);
  return null;
}

export default geocodeAddress;
