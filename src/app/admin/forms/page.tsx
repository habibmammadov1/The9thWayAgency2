"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Copy, Inbox, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
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
import { CreateFormDialog } from "@/components/admin/forms/CreateFormDialog";
import { cn } from "@/lib/utils";
import { deleteForm, duplicateForm, listForms } from "@/lib/forms/formsApi";
import { FORM_LOCALES, type AdminFormListItem } from "@/lib/forms/types";

const GRID = "md:grid-cols-[minmax(0,2fr)_120px_120px_140px_150px]";

function formatDate(d: string) {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function FormsAdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [forms, setForms] = useState<AdminFormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AdminFormListItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setForms(await listForms());
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Formalar yüklənmədi", variant: "destructive" });
    }
  }, [toast]);

  // Initial load (the loading flag starts as true)
  useEffect(() => {
    let cancelled = false;
    listForms()
      .then((data) => !cancelled && setForms(data))
      .catch((err) =>
        toast({ title: "Xəta", description: err instanceof Error ? err.message : "Formalar yüklənmədi", variant: "destructive" }),
      )
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const handleDuplicate = async (form: AdminFormListItem) => {
    setBusyId(form.id);
    try {
      const copy = await duplicateForm(form.id);
      toast({ title: "Kopyalandı", description: "Kopya cavablar olmadan yaradıldı." });
      router.push(`/admin/forms/${copy.id}`);
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Kopyalamaq alınmadı", variant: "destructive" });
      setBusyId(null);
    }
  };

  const handleDelete = async (form: AdminFormListItem) => {
    setBusyId(form.id);
    try {
      await deleteForm(form.id);
      toast({ title: "Silindi", description: "Forma silindi." });
      await reload();
    } catch (err) {
      toast({ title: "Silmək olmur", description: err instanceof Error ? err.message : "Silmək alınmadı", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <ModuleHeader
        title="Formalar"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Yeni forma
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Hələ forma yoxdur"
          description="Öz sahələrinizlə forma qurun və onu səhifə qurucusunda “Forma” bloku ilə istənilən səhifəyə əlavə edin."
          actionLabel="Yeni forma"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          <div className={cn("hidden md:grid gap-4 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] bg-gray-50", GRID)}>
            <span>Forma</span>
            <span>Dillər</span>
            <span>Cavablar</span>
            <span>Son dəyişiklik</span>
            <span className="text-right">Əməliyyatlar</span>
          </div>
          {forms.map((form) => {
            const busy = busyId === form.id;
            return (
              <div key={form.id} className={cn("grid grid-cols-1 gap-2 md:gap-4 px-5 py-4 border-b last:border-b-0 border-[var(--border)] items-center hover:bg-gray-50/60", GRID)}>
                <button type="button" onClick={() => router.push(`/admin/forms/${form.id}`)} className="text-left min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2">
                    {form.name}
                    {!form.isActive && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600">deaktiv</span>}
                  </div>
                </button>
                <span className="flex gap-1">
                  {FORM_LOCALES.map((l) => (
                    <span
                      key={l}
                      className={cn("text-[10px] font-bold rounded px-1.5 py-0.5", form.locales.includes(l) ? "bg-black text-white" : "bg-gray-100 text-gray-400 line-through")}
                    >
                      {l.toUpperCase()}
                    </span>
                  ))}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/forms/${form.id}?tab=responses`)}
                  className="inline-flex items-center gap-1.5 text-sm text-left hover:underline"
                >
                  <Inbox size={14} className="text-gray-400" />
                  {form.submissionCount}
                  {form.newCount > 0 && <span className="rounded-full bg-[#D9C2A0] px-1.5 text-[10px] font-bold text-black">{form.newCount} yeni</span>}
                </button>
                <span className="text-xs text-gray-500">{formatDate(form.updatedAt)}</span>
                <span className="flex md:justify-end gap-1">
                  {busy && <Loader2 size={16} className="animate-spin text-gray-400 m-2" />}
                  <button type="button" title="Redaktə et" disabled={busy} onClick={() => router.push(`/admin/forms/${form.id}`)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                    <Pencil size={15} />
                  </button>
                  <button type="button" title="Kopyala" disabled={busy} onClick={() => handleDuplicate(form)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                    <Copy size={15} />
                  </button>
                  <button type="button" title="Sil" disabled={busy} onClick={() => setToDelete(form)} className="p-2 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                    <Trash2 size={15} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <CreateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(form) => {
          setCreateOpen(false);
          router.push(`/admin/forms/${form.id}`);
        }}
      />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forma silinsin?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.name}” silinəcək. Cavabları olan formanı silmək olmur: bu halda formanı redaktorda “Deaktiv” edin, cavablar qalsın.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (toDelete) handleDelete(toDelete);
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
