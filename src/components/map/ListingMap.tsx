"use client";

import { useEffect, useRef, useState } from "react";
import { isGoogleMapsConfigured, loadGoogleMapsPlacesApi } from "@/utils/googleMaps";

interface Props {
  lat: number;
  lng: number;
  height?: string;
}

export default function ListingMap({ lat, lng, height = "250px" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!isGoogleMapsConfigured()) {
      setError("Map unavailable.");
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        const google = await loadGoogleMapsPlacesApi();
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        new google.maps.Marker({ position: { lat, lng }, map });
      } catch {
        if (!cancelled) setError("Map failed to load.");
      }
    };

    void initMap();
    return () => { cancelled = true; };
  }, [lat, lng]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-stone-100 text-sm text-stone-400"
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return <div ref={mapRef} className="w-full rounded-2xl overflow-hidden" style={{ height }} />;
}
