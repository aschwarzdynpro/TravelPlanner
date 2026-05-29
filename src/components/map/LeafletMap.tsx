"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
};

// Webpack/Turbopack rewrite the default icon URLs, so point Leaflet at the
// bundled asset URLs explicitly (otherwise markers render as broken images).
const DefaultIcon = L.icon({
  iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src,
  iconUrl: (markerIcon as unknown as { src: string }).src,
  shadowUrl: (markerShadow as unknown as { src: string }).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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
        <Marker key={m.id} position={[m.latitude, m.longitude]} icon={DefaultIcon}>
          <Popup>
            <strong>{m.title}</strong>
            {m.subtitle && (
              <>
                <br />
                {m.subtitle}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
