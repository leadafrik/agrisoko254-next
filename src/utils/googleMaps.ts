const GOOGLE_MAPS_SCRIPT_ID = "agrisoko-google-maps-script";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let googleMapsLoader: Promise<any> | null = null;

export interface GooglePlaceSelection {
  formattedAddress: string;
  approximateLocation: string;
  countryCode?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  coordinates?: { lat: number; lng: number };
}

const getAddressComponent = (place: any, supportedTypes: string[]) => {
  const components = Array.isArray(place?.address_components) ? place.address_components : [];
  return components.find((c: any) => supportedTypes.some((t) => c?.types?.includes(t))) || null;
};

const cleanAdministrativeLabel = (value?: string) =>
  String(value || "")
    .replace(/\bcounty\b/gi, "")
    .replace(/\bconstituency\b/gi, "")
    .replace(/\bward\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizeLocationToken = (value?: string) =>
  cleanAdministrativeLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const matchLocationCandidate = (
  candidate: string | undefined,
  options: Array<string | { value: string; label?: string }>
): string | undefined => {
  const normalizedCandidate = normalizeLocationToken(candidate);
  if (!normalizedCandidate) return undefined;

  const mapped = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : { value: o.value, label: o.label || o.value }
  );

  const exact = mapped.find((o) => normalizeLocationToken(o.label) === normalizedCandidate);
  if (exact) return exact.value;

  const inclusive = mapped.find((o) => {
    const n = normalizeLocationToken(o.label);
    return n.includes(normalizedCandidate) || normalizedCandidate.includes(n);
  });
  return inclusive?.value;
};

export const isGoogleMapsConfigured = () => Boolean(GOOGLE_MAPS_API_KEY);

const ensurePlacesLibrary = async (googleMaps: any) => {
  if (googleMaps?.maps?.places) return googleMaps;
  if (typeof googleMaps?.maps?.importLibrary === "function") {
    const placesLib = await googleMaps.maps.importLibrary("places");
    if (placesLib && googleMaps?.maps && !googleMaps.maps.places) {
      googleMaps.maps.places = placesLib;
    }
  }
  if (googleMaps?.maps?.places) return googleMaps;
  throw new Error("Google Maps loaded without Places library.");
};

export const loadGoogleMapsPlacesApi = async (): Promise<any> => {
  if (typeof window === "undefined") throw new Error("Google Maps is only available in the browser.");

  const win = window as any;
  if (win.google?.maps?.places) return win.google;
  if (win.google?.maps) return ensurePlacesLibrary(win.google);

  if (!GOOGLE_MAPS_API_KEY) throw new Error("Google Maps API key is not configured.");
  if (googleMapsLoader) return googleMapsLoader;

  googleMapsLoader = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = async () => {
      try { resolve(await ensurePlacesLibrary(win.google)); }
      catch (err) { reject(err); }
    };
    const handleError = () => reject(new Error("Failed to load Google Maps."));

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY!)}&libraries=places&loading=async&region=KE&language=en`;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  }).catch((err) => { googleMapsLoader = null; throw err; });

  return googleMapsLoader;
};

export const extractPlaceSelection = (place: any): GooglePlaceSelection => {
  const loc = place?.geometry?.location;
  const formattedAddress = String(place?.formatted_address || place?.name || "").trim();
  const sublocality =
    getAddressComponent(place, [
      "sublocality_level_1",
      "sublocality",
      "administrative_area_level_3",
      "locality",
    ])?.long_name || "";
  const ward =
    getAddressComponent(place, [
      "administrative_area_level_4",
      "sublocality_level_2",
      "neighborhood",
      "political",
    ])?.long_name || "";
  const county =
    getAddressComponent(place, ["administrative_area_level_1"])?.long_name || "";
  const countryComponent = getAddressComponent(place, ["country"]);
  const approximateLocation =
    formattedAddress ||
    cleanAdministrativeLabel([place?.name, sublocality, ward].filter(Boolean).join(", "));

  return {
    formattedAddress,
    approximateLocation,
    countryCode: String(countryComponent?.short_name || "").trim().toUpperCase() || undefined,
    county: cleanAdministrativeLabel(county),
    constituency: cleanAdministrativeLabel(sublocality),
    ward: cleanAdministrativeLabel(ward),
    coordinates:
      loc && typeof loc.lat === "function" && typeof loc.lng === "function"
        ? { lat: loc.lat(), lng: loc.lng() }
        : undefined,
  };
};

export const reverseGeocodeCoordinates = async (
  latitude: number,
  longitude: number
): Promise<GooglePlaceSelection> => {
  const google = await loadGoogleMapsPlacesApi();
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude }, region: "KE" },
      (results: any, status: any) => {
        if (status !== "OK" || !Array.isArray(results) || !results.length) {
          reject(new Error("We could not match your current location to a place in Kenya."));
          return;
        }
        resolve({ ...extractPlaceSelection(results[0]), coordinates: { lat: latitude, lng: longitude } });
      }
    );
  });
};
