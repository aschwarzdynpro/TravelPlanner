"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  // Distinguishes the pin style/colour. Defaults to "area".
  kind?: "area" | "hotel";
  // Optional sequence number drawn on the pin (e.g. hotel order along the trip).
  index?: number;
  // Optional extra line shown in the popup (e.g. price · dates).
  detail?: string;
};

// Colour-coded teardrop pin built as a div icon, so we don't depend on bundled
// image assets and can tint area vs. hotel pins differently. An optional number
// is drawn upright in the centre.
function pinIcon(color: string, index?: number) {
  const label =
    index != null
      ? `<span style="
          position:absolute;inset:0;display:flex;align-items:center;
          justify-content:center;transform:rotate(45deg);
          color:#fff;font:700 11px/1 system-ui,sans-serif;
        ">${index}</span>`
      : "";
  return L.divIcon({
    className: "",
    html: `<div style="
      position:relative;width:22px;height:22px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);
    ">${label}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20],
  });
}

const AREA_ICON = pinIcon("#2563eb"); // blue
const HOTEL_ICON = pinIcon("#e11d48"); // rose
// Numbered hotel icons are built on demand and cached per number.
const numberedHotelIcons = new Map<number, L.DivIcon>();
function hotelIcon(index?: number): L.DivIcon {
  if (index == null) return HOTEL_ICON;
  let icon = numberedHotelIcons.get(index);
  if (!icon) {
    icon = pinIcon("#e11d48", index);
    numberedHotelIcons.set(index, icon);
  }
  return icon;
}

export default function LeafletMap({
  markers,
  className = "h-full w-full",
}: {
  markers: MapMarker[];
  className?: string;
}) {
  const { center, zoom } = useMemo(() => {
    if (markers.length === 0) {
      // Fallback: roughly centered on Europe.
      return { center: [48.0, 10.0] as [number, number], zoom: 4 };
    }
    if (markers.length === 1) {
      return {
        center: [markers[0].latitude, markers[0].longitude] as [number, number],
        zoom: 11,
      };
    }
    const lats = markers.map((m) => m.latitude);
    const lngs = markers.map((m) => m.longitude);
    const center: [number, number] = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
    // Rough zoom from the bounding-box span.
    const span = Math.max(
      Math.max(...lats) - Math.min(...lats),
      Math.max(...lngs) - Math.min(...lngs),
    );
    const zoom = span > 10 ? 4 : span > 4 ? 5 : span > 1 ? 7 : span > 0.2 ? 9 : 11;
    return { center, zoom };
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={m.kind === "hotel" ? hotelIcon(m.index) : AREA_ICON}
        >
          <Popup>
            <strong>{m.title}</strong>
            {m.subtitle && (
              <>
                <br />
                {m.subtitle}
              </>
            )}
            {m.detail && (
              <>
                <br />
                <span style={{ color: "#666" }}>{m.detail}</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
