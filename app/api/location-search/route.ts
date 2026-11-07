const base = (process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/$/, "");

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() || "";
  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  try {
    const res = await fetch(`${base}/maps/search?query=${encodeURIComponent(q)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("Location search failed");
    const json = await res.json();
    const items = (json.data || []) as {
      placeId: string;
      description: string;
      mainText: string;
      secondaryText?: string;
      latitude?: number;
      longitude?: number;
      city?: string;
      zone?: string;
      street?: string;
    }[];

    const results = items.map((p) => {
      let city = p.city;
      let zone = p.zone;
      if (!city) {
        const parts = (p.secondaryText || p.description || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        city = parts.length > 0 ? parts[0] : (p.mainText || "Pakistan");
      }
      if (!zone) {
        zone = p.mainText || city;
      }
      return {
        lat: p.latitude ?? 33.7215,
        lng: p.longitude ?? 73.0567,
        name: p.mainText || p.description.split(",")[0],
        label: p.description,
        city,
        zone,
        street: p.street || "",
        placeId: p.placeId,
      };
    });

    return Response.json({ results });
  } catch {
    return Response.json(
      {
        error: "Location search is temporarily unavailable. Enter your address manually.",
        results: [],
      },
      { status: 200 },
    );
  }
}
