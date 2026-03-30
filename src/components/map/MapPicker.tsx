"use client";

import { useEffect, useRef, useState } from "react";
import { isGoogleMapsConfigured, loadGoogleMapsPlacesApi } from "@/utils/googleMaps";

interface Props {
  onChange: (coords: { lat: number; lng: number }) => void;
  defaultCenter?: { lat: number; lng: number };
  height?: string;
}

const NAIROBI = { lat: -1.286389, lng: 36.817223 };

export default function MapPicker({ onChange, defaultCenter = NAIROBI, height = "300px" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!isGoogleMapsConfigured()) {
      setError("Map selection is not available right now.");
      return;
    }

    let cancelled = false;

    const initMap = async () => {
      try {
        const google = await loadGoogleMapsPlacesApi();
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        markerRef.current = new google.maps.Marker({
          position: defaultCenter,
          map,
          draggable: true,
        });

        const handlePositionChange = () => {
          const pos = markerRef.current?.getPosition?.();
          if (!pos) return;
          onChangeRef.current({ lat: pos.lat(), lng: pos.lng() });
        };

        markerRef.current.addListener("dragend", handlePositionChange);

        map.addListener("click", (e: any) => {
          if (!e.latLng || !markerRef.current) return;
          markerRef.current.setPosition(e.latLng);
          onChangeRef.current({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      } catch {
        if (!cancelled) setError("Map failed to load right now.");
      }
    };

    void initMap();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-stone-100 px-4 text-center text-sm text-stone-400"
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return <div ref={mapRef} className="w-full rounded-2xl overflow-hidden" style={{ height }} />;
}
