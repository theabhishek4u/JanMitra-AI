import { NextResponse } from "next/server";

// Comprehensive Lucknow municipal wards & landmarks
const KNOWN_LOCATIONS = [
  { lat: 26.8532, lng: 80.9723, en: "Gomti Nagar, Lucknow", hi: "गोमती नगर, लखनऊ" },
  { lat: 26.8467, lng: 80.9462, en: "Hazratganj, Lucknow", hi: "हज़रतगंज, लखनऊ" },
  { lat: 26.8850, lng: 80.9380, en: "Aliganj, Lucknow", hi: "अलीगंज, लखनऊ" },
  { lat: 26.8800, lng: 80.9900, en: "Indira Nagar, Lucknow", hi: "इंदिरा नगर, लखनऊ" },
  { lat: 26.8700, lng: 80.9500, en: "Mahanagar, Lucknow", hi: "महानगर, लखनऊ" },
  { lat: 26.8300, lng: 80.9200, en: "Charbagh, Lucknow", hi: "चारबाग, लखनऊ" },
  { lat: 26.8650, lng: 80.9000, en: "Chowk, Lucknow", hi: "चौक, लखनऊ" },
  { lat: 26.8450, lng: 80.9250, en: "Aminabad, Lucknow", hi: "अमीनाबाद, लखनऊ" },
  { lat: 26.9100, lng: 80.9400, en: "Jankipuram, Lucknow", hi: "जानकीपुरम, लखनऊ" },
  { lat: 26.8900, lng: 80.9600, en: "Vikas Nagar, Lucknow", hi: "विकास नगर, लखनऊ" },
  { lat: 26.7900, lng: 80.9100, en: "Ashiyana, Lucknow", hi: "आशियाना, लखनऊ" },
  { lat: 26.8400, lng: 80.8800, en: "Rajajipuram, Lucknow", hi: "राजाजीपुरम, लखनऊ" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const lang = searchParams.get("lang") || "en";

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Missing lat or lng parameter" }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const isHi = lang === "hi";

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({
        area: isHi ? "गोमती नगर, लखनऊ" : "Gomti Nagar, Lucknow",
        lat: 26.8532,
        lng: 80.9723,
      });
    }

    // 1. Check local lookup table first (instant response, 0ms latency, zero timeout risk)
    let closestLoc = KNOWN_LOCATIONS[0];
    let minDistance = Infinity;

    for (const loc of KNOWN_LOCATIONS) {
      const dist = Math.hypot(lat - loc.lat, lng - loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestLoc = loc;
      }
    }

    // If within ~10km of a known municipal location in Lucknow, return immediately
    if (minDistance < 0.1) {
      return NextResponse.json({
        area: isHi ? closestLoc.hi : closestLoc.en,
        lat,
        lng,
        isLocalMatch: true,
      });
    }

    // 2. Safe external Nominatim lookup using Promise.race (prevents AbortSignal.timeout Turbopack crashes)
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`;

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2500)
      );

      const fetchPromise = fetch(nominatimUrl, {
        method: "GET",
        headers: {
          "User-Agent": "JanMitra-AI-Smart-Governance-App/1.0 (contact: theabhishek4u)",
          "Accept-Language": lang,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const data: any = await Promise.race([fetchPromise, timeoutPromise]);

      if (data && data.address) {
        const addr = data.address;
        const suburb = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
        const city = addr.city || addr.town || addr.village || addr.municipality;
        const state = addr.state || addr.region;

        let area = "";
        if (suburb && city) {
          area = `${suburb}, ${city}`;
        } else if (city) {
          area = `${city}, ${state || "UP"}`;
        } else if (state) {
          area = state;
        } else {
          area = data.display_name
            ? data.display_name.split(",").slice(0, 3).join(",").trim()
            : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }

        return NextResponse.json({
          area,
          lat,
          lng,
          addressDetails: data.address,
        });
      }
    } catch {
      // Nominatim failed or timed out — proceed to safe fallback
    }

    // 3. Graceful fallback
    return NextResponse.json({
      area: isHi ? closestLoc.hi : closestLoc.en,
      lat,
      lng,
      isFallback: true,
    });
  } catch (error: any) {
    return NextResponse.json({
      area: "Gomti Nagar, Lucknow",
      lat: 26.8532,
      lng: 80.9723,
      isFallback: true,
    });
  }
}
