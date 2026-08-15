import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Locate } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  readonly?: boolean;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [12.9716, 77.5946];

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#D9534F;border:3px solid #FDFBF7;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function LocationPicker({ latitude, longitude, onChange, readonly, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const start: [number, number] =
      latitude != null && longitude != null ? [latitude, longitude] : DEFAULT_CENTER;

    const map = L.map(containerRef.current, {
      zoomControl: !readonly,
      dragging: !readonly,
      scrollWheelZoom: !readonly,
      doubleClickZoom: !readonly,
    }).setView(start, latitude != null ? 16 : 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (latitude != null && longitude != null) {
      markerRef.current = L.marker(start, { icon: markerIcon }).addTo(map);
    }

    if (!readonly) {
      map.on("click", (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        onChangeRef.current(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      });
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readonly]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude != null && longitude != null) {
      const pos: [number, number] = [latitude, longitude];
      if (markerRef.current) {
        markerRef.current.setLatLng(pos);
      } else {
        markerRef.current = L.marker(pos, { icon: markerIcon }).addTo(mapRef.current);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [latitude, longitude]);

  function locateMe() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        onChangeRef.current(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(mapRef.current);
        }
      },
      (err) => {
        setLocating(false);
        alert(err.message || "Could not retrieve your location");
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`w-full overflow-hidden rounded-2xl border border-border ${className ?? "h-64"}`}
        aria-label="Pick your delivery location on the map"
      />
      {!readonly && (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 z-[400] h-10 w-10 rounded-full shadow-md"
          onClick={locateMe}
          disabled={locating}
          title="Use my current location"
        >
          <Locate className={`h-5 w-5 ${locating ? "animate-pulse text-berry" : "text-foreground"}`} />
        </Button>
      )}
    </div>
  );
}