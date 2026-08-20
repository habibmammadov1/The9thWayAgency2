"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface ContactInfoMapProps {
  info?: {
    mapLatitude?: number | null;
    mapLongitude?: number | null;
  } | null;
}

export default function ContactInfoMap({ info }: ContactInfoMapProps) {
  const lat = info?.mapLatitude ?? 40.394508;
  const lng = info?.mapLongitude ?? 49.714875;

  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  /** null = not yet triggered, false = loading, true = loaded */
  const [iframeState, setIframeState] = useState<null | "loading" | "loaded">(
    null
  );

  // Trigger the iframe src only when the section scrolls near the viewport
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIframeState("loading");
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // start loading 200px before it enters view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full bg-white py-20 lg:py-32">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center justify-center">
          {/* Centered Map */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            ref={wrapperRef}
            className="w-full max-w-5xl h-[400px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-xl border border-gray-200 relative"
          >
            {/* ── Skeleton shown while map hasn't loaded yet ── */}
            {iframeState !== "loaded" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F6F4] z-10">
                {/* Fake map grid lines */}
                <div className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#0B0B0C 1px, transparent 1px), linear-gradient(90deg, #0B0B0C 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {/* Animated pin */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-[#D9C2A0] blur-xl opacity-60 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <MapPin
                        size={28}
                        className="text-[#D9C2A0] animate-bounce"
                        style={{ animationDuration: "1.4s" }}
                      />
                    </div>
                  </div>
                  <p className="text-[#8A8A87] text-sm font-medium tracking-wide">
                    {iframeState === "loading" ? "Xəritə yüklənir…" : ""}
                  </p>
                </div>
              </div>
            )}

            {/* ── Grayscale Map Container ── */}
            <div className="absolute inset-0 grayscale-[100%] contrast-[1.1] opacity-90">
              {/* iframe is only rendered (and src only set) after observer fires */}
              {iframeState !== null && (
                <iframe
                  src={mapSrc}
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    opacity: iframeState === "loaded" ? 1 : 0,
                    transition: "opacity 0.6s ease",
                  }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setIframeState("loaded")}
                />
              )}
            </div>

            {/* Brand Overlay Tint */}
            <div className="absolute inset-0 bg-[#D9C2A0] mix-blend-overlay opacity-10 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
