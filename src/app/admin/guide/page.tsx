"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import { AlertTriangle, BookOpen, Info, Search, Sparkles } from "lucide-react";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";
import { Input } from "@/components/admin/ui/input";
import { CopyButton } from "@/components/admin/guide/CopyButton";
import { cn } from "@/lib/utils";
import {
  GUIDE_SECTIONS,
  SAMPLE_QUESTIONS,
  guideToText,
  sectionToText,
  type GuideBlock,
  type GuideSection,
} from "@/lib/admin-guide/content";

// The site address is only known in the browser. useSyncExternalStore keeps server and
// client markup identical on first render and then switches to the real address.
const subscribeNever = () => () => {};
function useSiteOrigin(): string {
  return useSyncExternalStore(subscribeNever, () => window.location.origin, () => "");
}

function Block({ block, origin }: { block: GuideBlock; origin: string }) {
  const show = (text: string) => text.split("{{SAYT}}").join(origin || "(sayt ünvanı)");
  switch (block.type) {
    case "p":
      return <p className="text-sm leading-relaxed text-neutral-700">{show(block.text)}</p>;
    case "note":
      return (
        <div className="flex gap-2.5 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>{show(block.text)}</span>
        </div>
      );
    case "warn":
      return (
        <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{show(block.text)}</span>
        </div>
      );
    case "steps":
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-bold text-black">{block.title}</h3>}
          <ol className="space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-neutral-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-black">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{show(item)}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "list":
      return (
        <div className="space-y-2">
          {block.title && <h3 className="text-sm font-bold text-black">{block.title}</h3>}
          <ul className="space-y-1.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-neutral-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span className="leading-relaxed">{show(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
  }
}

function SectionCard({ section, index, origin }: { section: GuideSection; index: number; origin: string }) {
  return (
    <section id={section.id} className="scroll-mt-28 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Bölmə {index + 1}</p>
          <h2 className="text-xl font-extrabold tracking-tight text-black">{section.title}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{section.summary}</p>
        </div>
        <CopyButton
          variant="outline"
          size="sm"
          label="Bu bölməni kopyala"
          toastDescription="Bölmənin mətni kopyalandı. İstədiyiniz AI-a yapışdırıb sualınızı yazın."
          getText={() => sectionToText(section, origin)}
        />
      </div>
      <div className="space-y-5">
        {section.blocks.map((block, i) => (
          <Block key={i} block={block} origin={origin} />
        ))}
      </div>
    </section>
  );
}

export default function GuidePage() {
  const origin = useSiteOrigin();
  const [query, setQuery] = useState("");

  const sections = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("az");
    if (!q) return GUIDE_SECTIONS;
    return GUIDE_SECTIONS.filter((s) => sectionToText(s, "").toLocaleLowerCase("az").includes(q));
  }, [query]);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div>
      <ModuleHeader
        title="Təlimat"
        actions={
          <CopyButton
            label="Təlimatı AI üçün kopyala"
            copiedLabel="Kopyalandı"
            toastDescription="Bütün təlimat kopyalandı. İndi ChatGPT, Claude və ya Gemini-yə yapışdırıb sualınızı yazın."
            getText={() => guideToText(GUIDE_SECTIONS, origin)}
          />
        }
      />

      {/* AI helper */}
      <div className="mb-8 rounded-2xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-5 md:p-7">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-black">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-black">Sualınız var? AI-dan soruşun</h2>
              <p className="mt-1 text-sm text-neutral-700">
                Bu təlimatı bir kliklə kopyalayıb istənilən AI köməkçiyə (ChatGPT, Claude, Gemini) verə bilərsiniz. O, təlimata əsasən sizə
                addım-addım izah edəcək.
              </p>
            </div>
            <ol className="space-y-1.5 text-sm text-neutral-800">
              <li><b>1.</b> Yuxarı sağdakı <b>&quot;Təlimatı AI üçün kopyala&quot;</b> düyməsini basın.</li>
              <li><b>2.</b> AI köməkçini açın və yeni söhbətdə kopyaladığınızı yapışdırın (Ctrl+V).</li>
              <li><b>3.</b> Mətnin sonunda &quot;Mənim sualım:&quot; yazılıb. Oradan sonra sualınızı yazıb göndərin.</li>
            </ol>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Nümunə suallar</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <span key={q} className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-neutral-700">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Contents */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Təlimatda axtar..." className="pl-9" />
          </div>
          <nav className="max-h-[60vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-2">
            {sections.length === 0 ? (
              <p className="p-3 text-sm text-neutral-500">Heç nə tapılmadı.</p>
            ) : (
              sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(s.id)}
                  className={cn("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-gray-100")}
                >
                  <BookOpen size={14} className="shrink-0 text-gray-400" />
                  <span className="truncate">{s.title}</span>
                </button>
              ))
            )}
          </nav>
        </aside>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} index={GUIDE_SECTIONS.indexOf(section)} origin={origin} />
          ))}
          {sections.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center text-sm text-neutral-500">
              Axtarışa uyğun bölmə tapılmadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
