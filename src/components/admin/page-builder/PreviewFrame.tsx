"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Monitor, RefreshCw, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "@/lib/page-builder/preview";
import type { PageBlock } from "@/lib/page-builder/types";

const DEVICE_WIDTH = { desktop: 1280, mobile: 390 } as const;

/**
 * Live preview: renders /{locale}/page-preview (the real site layout) in an iframe
 * and pushes the editor's current blocks into it with postMessage.
 */
export function PreviewFrame({ locale, slug, blocks }: { locale: string; slug: string; blocks: PageBlock[] }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<keyof typeof DEVICE_WIDTH>("desktop");
  const [available, setAvailable] = useState({ width: 600, height: 700 });
  const [reloadKey, setReloadKey] = useState(0);
  const latest = useRef({ blocks, slug });
  useEffect(() => {
    latest.current = { blocks, slug };
  }, [blocks, slug]);

  const send = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const visible = latest.current.blocks
      .filter((b) => b.isVisible)
      .map((b) => ({ id: b.id, type: b.type, props: b.props as unknown as Record<string, unknown> }));
    win.postMessage({ type: PREVIEW_MESSAGE, blocks: visible, slug: latest.current.slug }, window.location.origin);
  }, []);

  // The preview page announces itself when it has loaded
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin === window.location.origin && event.data?.type === PREVIEW_READY) send();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  // Debounced updates while typing
  useEffect(() => {
    const t = setTimeout(send, 300);
    return () => clearTimeout(t);
  }, [blocks, slug, send]);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = DEVICE_WIDTH[device];
  const scale = Math.min(1, available.width / width);
  // The iframe behaves like a real browser window of this size and scrolls internally
  const frameHeight = Math.max(400, available.height / scale);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Önizləmə</span>
        <div className="flex items-center gap-1">
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={cn("p-1.5 rounded-md", device === d ? "bg-black text-white" : "text-gray-500 hover:bg-gray-200")}
              title={d === "desktop" ? "Desktop" : "Mobil"}
            >
              {d === "desktop" ? <Monitor size={15} /> : <Smartphone size={15} />}
            </button>
          ))}
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200" title="Yenilə">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>
      <div ref={wrapperRef} className="flex-1 min-h-0 rounded-xl border border-[var(--border)] bg-gray-200 overflow-hidden">
        <div className="mx-auto" style={{ width: width * scale, height: frameHeight * scale }}>
          <iframe
            key={`${locale}-${reloadKey}`}
            ref={iframeRef}
            src={`/${locale}/page-preview`}
            title="Səhifə önizləməsi"
            style={{ width, height: frameHeight, transform: `scale(${scale})`, transformOrigin: "top left" }}
            className="bg-white border-0 block"
          />
        </div>
      </div>
    </div>
  );
}
