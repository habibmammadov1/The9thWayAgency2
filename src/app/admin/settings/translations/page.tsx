"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllTranslations, updateTranslations, TranslationEntry } from "@/lib/api";
import { useToast } from "@/components/admin/ui/use-toast";
import { Button } from "@/components/admin/ui/button";
import {
  Languages,
  Search,
  Save,
  Loader2,
  Check,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A "row" in the editor represents one key across all 3 locales */
interface TranslationRow {
  namespace: string;
  key: string;
  az: string;
  en: string;
  ru: string;
  updatedAt: string; // latest updatedAt across the 3 locale entries
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupEntries(entries: TranslationEntry[]): TranslationRow[] {
  const map = new Map<string, Partial<TranslationRow>>();
  for (const entry of entries) {
    const rowKey = `${entry.namespace}::${entry.key}`;
    const existing = map.get(rowKey) || { namespace: entry.namespace, key: entry.key, updatedAt: entry.updatedAt };
    (existing as any)[entry.locale] = entry.value;
    // Keep the most-recently-updated timestamp
    if (entry.updatedAt > (existing.updatedAt || "")) existing.updatedAt = entry.updatedAt;
    map.set(rowKey, existing);
  }
  return Array.from(map.values()) as TranslationRow[];
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("az-AZ", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TranslationsPage() {
  const { toast } = useToast();

  const [allRows, setAllRows] = useState<TranslationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edits: map of "namespace::key::locale" → new value
  const [edits, setEdits] = useState<Map<string, string>>(new Map());

  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // ── Data loading ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const entries = await fetchAllTranslations();
      const rows = groupEntries(entries);
      setAllRows(rows);
      // Auto-select first namespace
      if (rows.length > 0 && !selectedNamespace) {
        setSelectedNamespace(rows[0].namespace);
      }
    } catch (err: any) {
      toast({ title: "Xəta", description: err.message || "Tərcümələr yüklənə bilmədi.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived state ────────────────────────────────────────────────────────
  const namespaces = useMemo(() => {
    return [...new Set(allRows.map((r) => r.namespace))].sort();
  }, [allRows]);

  const filteredRows = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return allRows.filter((row) => {
      const matchesNS = !selectedNamespace || row.namespace === selectedNamespace;
      if (!lowerSearch) return matchesNS;
      return (
        matchesNS &&
        (row.key.toLowerCase().includes(lowerSearch) ||
          row.az?.toLowerCase().includes(lowerSearch) ||
          row.en?.toLowerCase().includes(lowerSearch) ||
          row.ru?.toLowerCase().includes(lowerSearch))
      );
    });
  }, [allRows, selectedNamespace, search]);

  const editCount = edits.size;

  // ── Cell edit handler ────────────────────────────────────────────────────
  const handleCellChange = (
    namespace: string,
    key: string,
    locale: string,
    value: string
  ) => {
    const editKey = `${namespace}::${key}::${locale}`;
    setEdits((prev) => {
      const next = new Map(prev);
      next.set(editKey, value);
      return next;
    });
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (editCount === 0) return;
    setIsSaving(true);
    try {
      const updates = Array.from(edits.entries()).map(([editKey, value]) => {
        const [namespace, key, locale] = editKey.split("::");
        return { namespace, key, locale, value };
      });
      const result = await updateTranslations(updates);
      toast({
        title: "Yadda saxlanıldı",
        description: `${result.updated} tərcümə yeniləndi.`,
      });
      setEdits(new Map());
      // Reload to get fresh updatedAt timestamps
      await loadData();
    } catch (err: any) {
      toast({ title: "Xəta", description: err.message || "Saxlama zamanı xəta baş verdi.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Discard ───────────────────────────────────────────────────────────────
  const handleDiscard = () => {
    setEdits(new Map());
  };

  // ── Cell value (edited or original) ──────────────────────────────────────
  const getCellValue = (namespace: string, key: string, locale: "az" | "en" | "ru", original: string) => {
    const editKey = `${namespace}::${key}::${locale}`;
    return edits.has(editKey) ? edits.get(editKey)! : original || "";
  };

  const isEdited = (namespace: string, key: string, locale: string) =>
    edits.has(`${namespace}::${key}::${locale}`);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col gap-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-5 border-b bg-white shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
            <Languages className="text-[var(--primary)]" />
            Tərcümə Redaktoru
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Vebsaytın interfeys mətnlərini üç dil üçün idarə edin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {editCount > 0 && (
            <>
              <button
                onClick={handleDiscard}
                className="text-xs text-neutral-500 hover:text-black transition-colors"
              >
                Dəyişiklikləri ləğv et
              </button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-black text-white hover:bg-neutral-800 rounded-full px-5 text-xs font-bold flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {editCount} dəyişikliyi saxla
              </Button>
            </>
          )}
          <button
            onClick={loadData}
            disabled={isLoading}
            title="Yenilə"
            className="w-8 h-8 rounded-full border flex items-center justify-center text-neutral-400 hover:text-black transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Namespace sidebar ── */}
        <aside className="w-52 shrink-0 border-r bg-neutral-50/60 overflow-y-auto flex flex-col">
          <div className="px-3 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1">
              Namespace
            </p>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-neutral-300" size={20} />
            </div>
          ) : (
            namespaces.map((ns) => {
              const nsEdits = Array.from(edits.keys()).filter((k) => k.startsWith(`${ns}::`)).length;
              return (
                <button
                  key={ns}
                  onClick={() => setSelectedNamespace(ns)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors",
                    selectedNamespace === ns
                      ? "bg-white text-black font-semibold border-r-2 border-[var(--primary)]"
                      : "text-neutral-600 hover:bg-white hover:text-black"
                  )}
                >
                  <span className="truncate">{ns}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {nsEdits > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#D9C2A0] text-black text-[9px] font-bold flex items-center justify-center">
                        {nsEdits}
                      </span>
                    )}
                    {selectedNamespace === ns && (
                      <ChevronRight size={12} className="text-neutral-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </aside>

        {/* ── Main editor area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="px-5 py-3 border-b bg-white shrink-0">
            <div className="relative max-w-md">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Açar söz və ya dəyərlə axtar..."
                className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-300"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm">Yüklənir...</p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-400">
                <Languages size={40} className="stroke-[1.5]" />
                <p className="text-sm">Heç bir nəticə tapılmadı.</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-neutral-50 border-b text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                    <th className="py-3 px-5 text-left w-56">Açar</th>
                    <th className="py-3 px-4 text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-sm bg-[#0066CC]/10 text-[#0066CC] text-[9px] font-bold flex items-center justify-center">AZ</span>
                        Azərbaycanca
                      </span>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-sm bg-[#D9C2A0]/20 text-[#8B6C3E] text-[9px] font-bold flex items-center justify-center">EN</span>
                        İngiliscə
                      </span>
                    </th>
                    <th className="py-3 px-4 text-left">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-sm bg-red-50 text-red-500 text-[9px] font-bold flex items-center justify-center">RU</span>
                        Rusca
                      </span>
                    </th>
                    <th className="py-3 px-4 text-left w-36 text-right">Son dəyişiklik</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRows.map((row) => (
                    <tr
                      key={`${row.namespace}::${row.key}`}
                      className={cn(
                        "group hover:bg-neutral-50/70 transition-colors",
                        (isEdited(row.namespace, row.key, "az") ||
                          isEdited(row.namespace, row.key, "en") ||
                          isEdited(row.namespace, row.key, "ru")) &&
                          "bg-[#D9C2A0]/10"
                      )}
                    >
                      {/* Key */}
                      <td className="py-3 px-5 align-top">
                        <code className="text-xs bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded font-mono break-all">
                          {row.key}
                        </code>
                        {(isEdited(row.namespace, row.key, "az") ||
                          isEdited(row.namespace, row.key, "en") ||
                          isEdited(row.namespace, row.key, "ru")) && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-[#8B6C3E] bg-[#D9C2A0]/40 px-1.5 py-0.5 rounded-full">
                            <Check size={8} /> dəyişdirildi
                          </span>
                        )}
                      </td>

                      {/* AZ */}
                      <TranslationCell
                        value={getCellValue(row.namespace, row.key, "az", row.az)}
                        isEdited={isEdited(row.namespace, row.key, "az")}
                        onChange={(v) => handleCellChange(row.namespace, row.key, "az", v)}
                        locale="az"
                      />

                      {/* EN */}
                      <TranslationCell
                        value={getCellValue(row.namespace, row.key, "en", row.en)}
                        isEdited={isEdited(row.namespace, row.key, "en")}
                        onChange={(v) => handleCellChange(row.namespace, row.key, "en", v)}
                        locale="en"
                      />

                      {/* RU */}
                      <TranslationCell
                        value={getCellValue(row.namespace, row.key, "ru", row.ru)}
                        isEdited={isEdited(row.namespace, row.key, "ru")}
                        onChange={(v) => handleCellChange(row.namespace, row.key, "ru", v)}
                        locale="ru"
                      />

                      {/* updatedAt */}
                      <td className="py-3 px-4 align-top text-right">
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                          {formatDate(row.updatedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TranslationCell ──────────────────────────────────────────────────────────

function TranslationCell({
  value,
  isEdited,
  onChange,
  locale,
}: {
  value: string;
  isEdited: boolean;
  onChange: (v: string) => void;
  locale: string;
}) {
  const borderColor =
    locale === "az" ? "focus:border-[#D9C2A0]" :
    locale === "en" ? "focus:border-[#D9C2A0]" :
    "focus:border-[#D9C2A0]";

  return (
    <td className="py-2 px-4 align-top">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={value.length > 80 ? 3 : 2}
        className={cn(
          "w-full text-sm resize-none rounded-lg border bg-white px-3 py-2 transition-all focus:outline-none focus:ring-1 focus:ring-neutral-200 leading-relaxed",
          borderColor,
          isEdited
            ? "border-[#D9C2A0] bg-[#D9C2A0]/5 text-black"
            : "border-transparent hover:border-neutral-200 text-neutral-700"
        )}
      />
    </td>
  );
}
