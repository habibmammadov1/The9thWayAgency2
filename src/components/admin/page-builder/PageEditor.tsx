"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Copy, ExternalLink, EyeOff, Loader2, Plus, Save, Send } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useToast } from "@/components/admin/ui/use-toast";
import { cn } from "@/lib/utils";
import { cloneBlocks, createBlock, validateSlug } from "@/lib/page-builder/registry";
import { publishPage, savePage, unpublishPage } from "@/lib/page-builder/pagesApi";
import { PAGE_LOCALES, type AdminPage, type BlockType, type PageLocale, type PageTranslation } from "@/lib/page-builder/types";
import { BlockList } from "./BlockList";
import { BlockLibraryDialog } from "./BlockLibraryDialog";
import { PageSettingsPanel } from "./PageSettingsPanel";
import { PreviewFrame } from "./PreviewFrame";
import { PublishDialog } from "./PublishDialog";
import { LOCALE_LABELS, payloadFromState, publishChecks, stateFromPage, type EditorState } from "./editorState";

type Tab = "content" | "settings";

export function PageEditor({ initialPage }: { initialPage: AdminPage }) {
  const router = useRouter();
  const { toast } = useToast();

  const [page, setPage] = useState(initialPage);
  const [state, setState] = useState<EditorState>(() => stateFromPage(initialPage));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(stateFromPage(initialPage)));
  const [locale, setLocale] = useState<PageLocale>(() => {
    const first = PAGE_LOCALES.find((l) => initialPage.translations.some((t) => t.locale === l));
    return first ?? "az";
  });
  const [tab, setTab] = useState<Tab>("content");
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(state) !== savedSnapshot, [state, savedSnapshot]);
  const isPublished = page.status === "published";
  const blocks = state.blocks[locale];
  const translation = state.translations[locale];
  const checks = useMemo(() => publishChecks(state), [state]);

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const updateTranslation = useCallback(
    (patch: Partial<PageTranslation>) =>
      setState((s) => ({ ...s, translations: { ...s.translations, [locale]: { ...s.translations[locale], ...patch } } })),
    [locale],
  );

  const setBlocks = useCallback(
    (next: EditorState["blocks"][PageLocale]) => setState((s) => ({ ...s, blocks: { ...s.blocks, [locale]: next } })),
    [locale],
  );

  const addBlock = (type: BlockType) => {
    const block = createBlock(type);
    setBlocks([...blocks, block]);
    setOpenBlockId(block.id);
  };

  const copyFromLocale = (source: PageLocale) => {
    setState((s) => ({
      ...s,
      blocks: { ...s.blocks, [locale]: cloneBlocks(s.blocks[source]) },
      translations: {
        ...s.translations,
        [locale]: {
          ...s.translations[source],
          locale,
          title: s.translations[locale].title || s.translations[source].title,
        },
      },
    }));
    toast({ title: "Kopyalandı", description: `${LOCALE_LABELS[source]} versiyası ${LOCALE_LABELS[locale]} dilinə kopyalandı. İndi mətnləri tərcümə edin.` });
  };

  /** Applies a server response while keeping the currently open block open. */
  const applyServerPage = (saved: AdminPage) => {
    const openIndex = blocks.findIndex((b) => b.id === openBlockId);
    const next = stateFromPage(saved);
    setPage(saved);
    setState(next);
    setSavedSnapshot(JSON.stringify(next));
    setOpenBlockId(openIndex >= 0 ? next.blocks[locale][openIndex]?.id ?? null : null);
  };

  const save = async (): Promise<boolean> => {
    const slugError = validateSlug(state.slug);
    if (slugError) {
      setTab("settings");
      toast({ title: "Xəta", description: slugError, variant: "destructive" });
      return false;
    }
    setIsSaving(true);
    try {
      const saved = await savePage(page.id, payloadFromState(state));
      applyServerPage(saved);
      toast({ title: "Yadda saxlanıldı", description: isPublished ? "Dəyişikliklər saytda görünür." : "Qaralama yeniləndi." });
      return true;
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Yadda saxlamaq alınmadı", variant: "destructive" });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setIsPublishing(true);
    try {
      if (isDirty && !(await save())) return;
      const published = await publishPage(page.id);
      setPage(published);
      setPublishOpen(false);
      toast({ title: "Dərc edildi", description: "Səhifə artıq saytda görünür." });
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Dərc etmək alınmadı", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublish = async () => {
    if (!window.confirm("Səhifə saytdan gizlədilsin? Məzmun silinmir, qaralama kimi qalır.")) return;
    setIsPublishing(true);
    try {
      setPage(await unpublishPage(page.id));
      toast({ title: "Dərcdən çıxarıldı", description: "Səhifə artıq saytda görünmür." });
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Əməliyyat alınmadı", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const goBack = (e: React.MouseEvent) => {
    if (isDirty && !window.confirm("Yadda saxlanmamış dəyişikliklər itəcək. Çıxmaq istəyirsiniz?")) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    router.push("/admin/pages");
  };

  const filledOtherLocales = PAGE_LOCALES.filter((l) => l !== locale && state.blocks[l].length > 0);
  const liveUrl = `/${PAGE_LOCALES.find((l) => page.translations.some((t) => t.locale === l)) ?? "az"}/${page.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky -top-4 sm:-top-6 lg:-top-8 z-40 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 py-4 bg-[#F7F6F4] border-b border-[var(--border)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/pages" onClick={goBack} className="p-2 rounded-lg hover:bg-white text-gray-600" title="Səhifələr">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight truncate">
                {state.translations.az.title || translation.title || page.slug}
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                    isPublished ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700",
                  )}
                >
                  {isPublished ? "● Canlı" : "○ Qaralama"}
                </span>
                {isDirty && <span className="text-amber-700">Yadda saxlanmamış dəyişikliklər var</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isPublished && (
              <>
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium px-3 h-9 rounded-md border border-[var(--border)] bg-white hover:bg-gray-50">
                  <ExternalLink size={14} /> Saytda bax
                </a>
                <Button variant="outline" onClick={unpublish} disabled={isPublishing}>
                  <EyeOff size={14} /> Dərcdən çıxar
                </Button>
              </>
            )}
            <Button variant="outline" onClick={save} disabled={!isDirty || isSaving}>
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Yadda saxla
            </Button>
            {!isPublished && (
              <Button onClick={() => setPublishOpen(true)} disabled={isPublishing}>
                <Send size={14} /> Dərc et
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
            {PAGE_LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLocale(l);
                  setOpenBlockId(null);
                }}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-1.5",
                  locale === l ? "bg-white shadow-sm text-black" : "text-gray-500",
                )}
              >
                {LOCALE_LABELS[l]}
                <span className={cn("w-1.5 h-1.5 rounded-full", state.translations[l].title.trim() ? "bg-green-500" : "bg-gray-300")} />
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
            {(
              [
                ["content", "Məzmun"],
                ["settings", "Ayarlar / SEO"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn("px-3 py-1.5 text-sm font-medium rounded-md", tab === value ? "bg-white shadow-sm text-black" : "text-gray-500")}
              >
                {label}
              </button>
            ))}
          </div>
          {isPublished && isDirty && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              <AlertTriangle size={12} /> Səhifə canlıdır: yadda saxlayanda dəyişikliklər dərhal saytda görünəcək
            </span>
          )}
        </div>
      </div>

      {tab === "settings" ? (
        <PageSettingsPanel
          state={state}
          locale={locale}
          savedSlug={page.slug}
          isPublished={isPublished}
          onChange={(patch) => setState((s) => ({ ...s, ...patch }))}
          onTranslationChange={updateTranslation}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 items-start">
          {/* Blocks */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Səhifə başlığı ({LOCALE_LABELS[locale]})</label>
              <Input
                value={translation.title}
                maxLength={300}
                placeholder="Məs. Yay kampaniyası 2026"
                onChange={(e) => updateTranslation({ title: e.target.value })}
              />
              {!translation.title.trim() && (
                <p className="text-[11px] text-amber-700">Başlıq boş qalsa, bu dil saytda göstərilməyəcək.</p>
              )}
            </div>

            {blocks.length === 0 && filledOtherLocales.length > 0 && (
              <div className="rounded-xl border border-dashed border-[var(--primary)] bg-[var(--primary)]/5 p-4 text-sm space-y-2">
                <p>Bu dildə hələ məzmun yoxdur. Başqa dildən kopyalayıb yalnız mətnləri tərcümə edə bilərsiniz:</p>
                <div className="flex flex-wrap gap-2">
                  {filledOtherLocales.map((l) => (
                    <Button key={l} variant="outline" size="sm" onClick={() => copyFromLocale(l)}>
                      <Copy size={13} /> {LOCALE_LABELS[l]} versiyasını kopyala
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <BlockList blocks={blocks} onChange={setBlocks} openId={openBlockId} setOpenId={setOpenBlockId} />

            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="w-full rounded-xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-gray-600 hover:border-[var(--primary)] hover:bg-white flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Blok əlavə et
            </button>
          </div>

          {/* Preview */}
          <div className="xl:sticky xl:top-36 h-[600px] xl:h-[calc(100vh-11rem)]">
            <PreviewFrame locale={locale} slug={state.slug} blocks={blocks} />
          </div>
        </div>
      )}

      <BlockLibraryDialog open={libraryOpen} onOpenChange={setLibraryOpen} onSelect={addBlock} />
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        checks={checks}
        isDirty={isDirty}
        isWorking={isPublishing || isSaving}
        onConfirm={publish}
      />
    </div>
  );
}
