'use client';
import { useEffect, useRef, useState } from 'react';
import s from './delivery-location.module.css';

const storageKey = 'barwaqt-delivery-location';
type Location = { city: string; area: string; formatted?: string; lat?: number; lng?: number };

function readLocation(): Location | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (value && typeof value.city === 'string' && value.city.trim()) {
      return value;
    }
  } catch {}
  return null;
}

const POPULAR_CITIES = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Multan', 'Faisalabad'];

export default function DeliveryLocation() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ name: string; label: string; city: string; zone: string; lat: number; lng: number }[]>([]);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocation(readLocation());
    function sync() {
      setLocation(readLocation());
    }
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function saveAndClose(next: Location) {
    setLocation(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
    dialog.current?.close();
  }

  function open() {
    setMessage('');
    setSearch('');
    setResults([]);
    dialog.current?.showModal();
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setMessage('Detecting your location…');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`/api/commerce/maps/reverse-geocode?lat=${lat}&lng=${lng}`);
          const json = await res.json();
          if (json.data) {
            const d = json.data;
            saveAndClose({
              city: d.city || 'Islamabad',
              area: d.zone || d.street || 'Central',
              formatted: d.formattedAddress,
              lat,
              lng,
            });
            return;
          }
        } catch {
          // Fallback if network issue
        }
        saveAndClose({ city: 'Islamabad', area: 'Current Location', lat, lng });
        setLocating(false);
      },
      () => {
        setMessage('Could not access your location. Please select or search your city below.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim().length < 2) return;
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch(`/api/location-search?q=${encodeURIComponent(search.trim())}`);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        setResults(json.results);
      } else {
        setMessage('No areas found. Try a different city or sector name.');
      }
    } catch {
      setMessage('Search unavailable. Choose a city below.');
    } finally {
      setBusy(false);
    }
  }

  const displayText = location?.area && location?.city
    ? `${location.area}, ${location.city}`
    : location?.city || 'Pakistan';

  return (
    <>
      <button
        className={s.trigger}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Deliver to ${displayText}`}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span>
          <small>Deliver to</small>
          <b>{displayText}</b>
        </span>
      </button>

      <dialog ref={dialog} className={s.dialog} aria-labelledby="delivery-location-title">
        <button className={s.close} type="button" aria-label="Close location selector" onClick={() => dialog.current?.close()}>
          ×
        </button>
        <h2 id="delivery-location-title">Where should we deliver?</h2>
        <p>Set your delivery destination in Pakistan to see available products and delivery schedules.</p>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            minHeight: 46,
            background: '#eaf9e7',
            color: '#16733c',
            border: '1px solid #c2ecc6',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            margin: '18px 0 14px',
          }}
        >
          <span>⌖</span>
          {locating ? 'Detecting your location…' : 'Use Current Location (GPS)'}
        </button>

        {/* Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, margin: '8px 0 14px' }}>
          <input
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
            }}
            placeholder="Search sector, area, or landmark…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy || search.trim().length < 2}
            style={{
              padding: '10px 18px',
              background: '#021016',
              color: 'white',
              border: 0,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {busy ? '…' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {results.length > 0 && (
          <div style={{ display: 'grid', gap: 6, marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  saveAndClose({
                    city: r.city,
                    area: r.zone || r.name,
                    formatted: r.label,
                    lat: r.lat,
                    lng: r.lng,
                  })
                }
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <b style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>{r.name}</b>
                <small style={{ color: '#64748b', fontSize: 11 }}>{r.label}</small>
              </button>
            ))}
          </div>
        )}

        {/* Popular Cities */}
        <div style={{ marginTop: 10 }}>
          <small style={{ display: 'block', color: '#64748b', marginBottom: 8, fontWeight: 600, fontSize: 11 }}>
            POPULAR CITIES
          </small>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => saveAndClose({ city: c, area: 'City Center' })}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: location?.city === c ? '#021016' : '#fff',
                  color: location?.city === c ? '#fff' : '#334155',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p role="status" style={{ fontSize: 12, color: '#dc2626', marginTop: 14 }}>
            {message}
          </p>
        )}
      </dialog>
    </>
  );
}
