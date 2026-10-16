"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Eye, EyeOff, Layers, Loader2, Menu, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { useToast } from "@/components/admin/ui/use-toast";
import { ModuleHeader } from "@/components/admin/layout/ModuleHeader";
import { EmptyState } from "@/components/admin/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/admin/ui/alert-dialog";
import { CreatePageDialog } from "@/components/admin/page-builder/CreatePageDialog";
import { cn } from "@/lib/utils";
import { deletePage, duplicatePage, listPages, publishPage, unpublishPage } from "@/lib/page-builder/pagesApi";
import { PAGE_LOCALES, type AdminPageListItem } from "@/lib/page-builder/types";

type StatusFilter = "all" | "published" | "draft";

export default function PagesAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [pages, setPages] = useState<AdminPageListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AdminPageListItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setPages(await listPages());
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Səhifələr yüklənmədi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load (the loading flag starts as true)
  useEffect(() => {
    let cancelled = false;
    listPages()
      .then((data) => !cancelled && setPages(data))
      .catch((err) =>
        toast({ title: "Xəta", description: err instanceof Error ? err.message : "Səhifələr yüklənmədi", variant: "destructive" }),
      )
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter(
      (p) => (status === "all" || p.status === status) && (!q || p.title.toLowerCase().includes(q) || p.slug.includes(q)),
    );
  }, [pages, search, status]);

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      toast({ title: "Uğurlu", description: success });
      await load();
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Əməliyyat alınmadı", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (page: AdminPageListItem) => {
    setBusyId(page.id);
    try {
      const copy = await duplicatePage(page.id);
      toast({ title: "Kopyalandı", description: "Kopya qaralama kimi yaradıldı." });
      router.push(`/admin/pages/${copy.id}`);
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Kopyalamaq alınmadı", variant: "destructive" });
      setBusyId(null);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  return (
    <div>
      <ModuleHeader
        title="Səhifələr"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Yeni səhifə
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Başlıq və ya URL ilə axtar..." className="pl-9" />
        </div>
        <div className="inline-flex rounded-lg bg-[var(--muted)] p-1 self-start">
          {(
            [
              ["all", "Hamısı"],
              ["published", "Canlı"],
              ["draft", "Qaralama"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={cn("px-3 py-1.5 text-sm font-medium rounded-md", status === value ? "bg-white shadow-sm text-black" : "text-gray-500")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Hələ səhifə yoxdur"
          description="Bloklardan ibarət yeni səhifə yaradın: kampaniya, xidmət detalı, karyera və s."
          actionLabel="Yeni səhifə"
          onAction={() => setCreateOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] py-10 text-center">Axtarışa uyğun səhifə tapılmadı.</p>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_120px_120px_160px_150px] gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] bg-gray-50">
            <span>Başlıq</span>
            <span>URL</span>
            <span>Status</span>
            <span>Dillər</span>
            <span>Son dəyişiklik</span>
            <span className="text-right">Əməliyyatlar</span>
          </div>
          {filtered.map((page) => {
            const published = page.status === "published";
            const busy = busyId === page.id;
            const firstLocale = PAGE_LOCALES.find((l) => page.locales.includes(l)) ?? "az";
            return (
              <div
                key={page.id}
                className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_120px_120px_160px_150px] gap-2 md:gap-4 px-5 py-4 border-b last:border-b-0 border-[var(--border)] items-center hover:bg-gray-50/60"
              >
                <button type="button" onClick={() => router.push(`/admin/pages/${page.id}`)} className="text-left min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {page.title}
                    {page.showInNav && (
                      <span title="Menyuda görünür" className="text-gray-400">
                        <Menu size={13} />
                      </span>
                    )}
                  </div>
                </button>
                <span className="text-sm text-gray-500 truncate">/{page.slug}</span>
                <span>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      published ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700",
                    )}
                  >
                    {published ? "● Canlı" : "○ Qaralama"}
                  </span>
                </span>
                <span className="flex gap-1">
                  {PAGE_LOCALES.map((l) => (
                    <span
                      key={l}
                      className={cn(
                        "text-[10px] font-bold rounded px-1.5 py-0.5",
                        page.locales.includes(l) ? "bg-black text-white" : "bg-gray-100 text-gray-400 line-through",
                      )}
                    >
                      {l.toUpperCase()}
                    </span>
                  ))}
                </span>
                <span className="text-xs text-gray-500">{formatDate(page.updatedAt)}</span>
                <span className="flex md:justify-end gap-1">
                  {busy && <Loader2 size={16} className="animate-spin text-gray-400 m-2" />}
                  <IconButton title="Redaktə et" onClick={() => router.push(`/admin/pages/${page.id}`)} disabled={busy}>
                    <Pencil size={15} />
                  </IconButton>
                  {published && (
                    <a
                      href={`/${firstLocale}/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Saytda bax"
                      className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <IconButton
                    title={published ? "Dərcdən çıxar" : "Dərc et"}
                    disabled={busy}
                    onClick={() =>
                      published
                        ? run(page.id, () => unpublishPage(page.id), "Səhifə dərcdən çıxarıldı.")
                        : run(page.id, () => publishPage(page.id), "Səhifə dərc edildi.")
                    }
                  >
                    {published ? <EyeOff size={15} /> : <Eye size={15} />}
                  </IconButton>
                  <IconButton title="Kopyala" onClick={() => handleDuplicate(page)} disabled={busy}>
                    <Copy size={15} />
                  </IconButton>
                  <IconButton title="Sil" danger onClick={() => setToDelete(page)} disabled={busy}>
                    <Trash2 size={15} />
                  </IconButton>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <CreatePageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(page) => {
          setCreateOpen(false);
          router.push(`/admin/pages/${page.id}`);
        }}
      />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Səhifə silinsin?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” bütün dillərdəki məzmunu ilə birlikdə silinəcək. Bu əməliyyat geri qaytarılmır. Sadəcə saytdan gizlətmək
              istəyirsinizsə, “Dərcdən çıxar” istifadə edin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (toDelete) run(toDelete.id, () => deletePage(toDelete.id), "Səhifə silindi.");
                setToDelete(null);
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn("p-2 rounded-md text-gray-500 disabled:opacity-40", danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-gray-100")}
    >
      {children}
    </button>
  );
}
