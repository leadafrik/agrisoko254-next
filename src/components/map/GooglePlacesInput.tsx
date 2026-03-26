"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import {
  extractPlaceSelection,
  isGoogleMapsConfigured,
  loadGoogleMapsPlacesApi,
  reverseGeocodeCoordinates,
  type GooglePlaceSelection,
} from "@/utils/googleMaps";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (selection: GooglePlaceSelection) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export default function GooglePlacesInput({
  label,
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Search a market, landmark, or address",
  helperText = "Search once to auto-fill county, constituency, ward, and the exact place.",
  disabled = false,
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const listenerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onPlaceSelectedRef.current = onPlaceSelected; }, [onPlaceSelected]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (disabled || !inputRef.current) return;

      if (!isGoogleMapsConfigured()) {
        setLoadError("Google Maps search is not configured. Use the manual location fields below.");
        return;
      }

      try {
        const google = await loadGoogleMapsPlacesApi();
        if (cancelled || !inputRef.current) return;

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "ke" },
          fields: ["address_components", "formatted_address", "geometry", "name"],
        });

        listenerRef.current = autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace?.();
          if (!place) return;
          const selection = extractPlaceSelection(place);
          if (selection.countryCode && selection.countryCode !== "KE") {
            setLoadError("Please select a location within Kenya.");
            return;
          }
          onChangeRef.current(selection.formattedAddress || selection.approximateLocation || "");
          onPlaceSelectedRef.current(selection);
          setLoadError(null);
        });

        setLoadError(null);
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err?.message || "Google Maps search failed to load. Use the manual location fields below.");
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      const win = window as any;
      if (listenerRef.current && win.google?.maps?.event) {
        win.google.maps.event.removeListener(listenerRef.current);
      }
      listenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, [disabled]);

  const handleUseCurrentLocation = () => {
    if (disabled || isLocating) return;

    if (!navigator.geolocation) {
      setLoadError("This browser does not support location sharing. Search or use the manual fields below.");
      return;
    }

    setIsLocating(true);
    setLoadError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const selection = await reverseGeocodeCoordinates(
            position.coords.latitude,
            position.coords.longitude
          );
          if (selection.countryCode && selection.countryCode !== "KE") {
            setLoadError("Please share a location within Kenya.");
            return;
          }
          onChangeRef.current(selection.formattedAddress || selection.approximateLocation || "");
          onPlaceSelectedRef.current(selection);
          setLoadError(null);
        } catch (err: any) {
          setLoadError(err?.message || "We could not match your current location. Search or use the manual fields below.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Allow location in your browser to use this shortcut."
            : err.code === err.POSITION_UNAVAILABLE
            ? "Your current location is unavailable right now. Search or use the manual fields below."
            : "Location lookup timed out. Try again or use the manual fields below.";
        setLoadError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="block text-sm font-medium text-stone-700">{label}</label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={disabled || isLocating}
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Crosshair className="h-3.5 w-3.5" />
          {isLocating ? "Getting location..." : "Use my location"}
        </button>
      </div>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-xl border border-stone-200 py-3 pl-10 pr-4 text-sm focus:border-terra-400 focus:outline-none disabled:bg-stone-50"
        />
      </div>
      <p className={`mt-2 text-xs ${loadError ? "text-amber-700" : "text-stone-500"}`}>
        {loadError || helperText}
      </p>
    </div>
  );
}
