"use client";

import React, { useEffect, useRef } from "react";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onCoordinatesChange
}: LocationPickerMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMapMessage = (event: MessageEvent) => {
      // Accept coordinates messages from our map picker page
      if (event.data && event.data.type === "COORDINATES_SELECTED") {
        const { lat, lng } = event.data;
        if (typeof lat === "number" && typeof lng === "number") {
          onCoordinatesChange(lat, lng);
        }
      }
    };

    window.addEventListener("message", handleMapMessage);
    return () => {
      window.removeEventListener("message", handleMapMessage);
    };
  }, [onCoordinatesChange]);

  // Keep map marker synced if coordinates are edited externally
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Optionally could send a postMessage to reposition if needed, 
      // but query parameter on initial load is usually sufficient
    }
  }, [latitude, longitude]);

  const mapSrc = `/admin/map-picker.html?lat=${latitude}&lng=${longitude}`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Draggable Map picker container */}
      <div className="w-full h-[320px] rounded-2xl overflow-hidden border border-neutral-200 shadow-sm relative bg-neutral-100">
        <iframe
          ref={iframeRef}
          src={mapSrc}
          className="w-full h-full border-none"
          title="Location Coordinate Picker Map"
        />
      </div>
      
      {/* Coordinate metrics label (Read-only) */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-500 font-mono">
        <span className="font-semibold">Seçilmiş Koordinatlar:</span>
        <span className="bg-white border px-2.5 py-1 rounded font-semibold text-black">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </span>
      </div>
    </div>
  );
}
