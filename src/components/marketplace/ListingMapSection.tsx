"use client";

import { useState } from "react";
import ListingMap from "@/components/map/ListingMap";

type ListingMapSectionProps = {
  lat: number;
  lng: number;
};

export default function ListingMapSection({
  lat,
  lng,
}: ListingMapSectionProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_50px_-30px_rgba(120,83,47,0.15)]">
      <h2 className="text-lg font-bold text-stone-900">Map location</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Load the map only when you need directions.
      </p>

      {loaded ? (
        <div className="mt-5">
          <ListingMap lat={lat} lng={lng} height="260px" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="secondary-button mt-5"
        >
          Load map
        </button>
      )}
    </div>
  );
}
