import { useEffect, useRef } from "react";
import L from "leaflet";

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#D9534F;border:3px solid #FDFBF7;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function LocationPicker({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const start: [number, number] =
      latitude != null && longitude != null ? [latitude, longitude] : DEFAULT_CENTER;

    const map = L.map(containerRef.current).setView(start, latitude != null ? 16 : 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (latitude != null && longitude != null) {
      markerRef.current = L.marker(start, { icon: markerIcon }).addTo(map);
    }

    map.on("click", (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      onChangeRef.current(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full overflow-hidden rounded-2xl border border-border"
      aria-label="Pick your delivery location on the map"
    />
  );
}