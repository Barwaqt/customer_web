// Explicit searches only: no autocomplete or background geocoding.
let lastRequest = 0;
const cache = new Map<string, { expires: number; results: unknown[] }>();
export async function GET(request: Request) {
 const q = new URL(request.url).searchParams.get("q")?.trim() || "";
 if (q.length < 3 || q.length > 150) return Response.json({ error: "Enter a place name between 3 and 150 characters." }, { status: 400 });
 const key = q.toLowerCase();
 const stored = cache.get(key);
 if (stored && stored.expires > Date.now()) return Response.json({ results: stored.results });
 if (Date.now() - lastRequest < 1100) return Response.json({ error: "Please wait a moment before searching again." }, { status: 429 });
 lastRequest = Date.now();
 try {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ q, format: "jsonv2", countrycodes: "ae", addressdetails: "1", limit: "5" }).toString();
  const response = await fetch(url, { headers: { "User-Agent": "Barwaqt-Storefront-Demo/1.0", "Accept-Language": "en" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Location provider unavailable");
  const raw = await response.json() as { lat: string; lon: string; display_name: string; name?: string; address?: { city?: string; town?: string; state?: string } }[];
  const results = raw.map(place => ({ lat: Number(place.lat), lng: Number(place.lon), name: place.name || place.display_name.split(",")[0], label: place.display_name, city: place.address?.city || place.address?.town || place.address?.state || "" })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (cache.size >= 100) cache.delete(cache.keys().next().value!);
  cache.set(key, { results, expires: Date.now() + 3600000 });
  return Response.json({ results });
 } catch { return Response.json({ error: "Location search is unavailable. Choose a point on the map or enter your address manually." }, { status: 503 }); }
}
