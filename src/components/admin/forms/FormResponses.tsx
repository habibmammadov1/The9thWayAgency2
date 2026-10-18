"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Archive, CheckCheck, ChevronLeft, ChevronRight, Inbox, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { useToast } from "@/components/admin/ui/use-toast";
import { cn } from "@/lib/utils";
import { deleteSubmission, listSubmissions, setSubmissionStatus } from "@/lib/forms/formsApi";
import type { AnswerValue, FormSubmissionItem, SubmissionStatus, SubmissionsPage } from "@/lib/forms/types";

const FILTERS: { value: SubmissionStatus | "all"; label: string }[] = [
  { value: "all", label: "Hamısı" },
  { value: "new", label: "Yeni" },
  { value: "read", label: "Oxunub" },
  { value: "archived", label: "Arxiv" },
];

const STATUS_LABEL: Record<SubmissionStatus, string> = { new: "Yeni", read: "Oxunub", archived: "Arxiv" };

function formatDate(d: string) {
  const date = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function displayValue(value: AnswerValue): string {
  if (value === true) return "Bəli";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        status === "new" && "bg-[#D9C2A0] text-black",
        status === "read" && "bg-neutral-100 text-neutral-600",
        status === "archived" && "border border-neutral-300 text-neutral-500",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function FormResponses({ formId }: { formId: string }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<SubmissionStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SubmissionsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<FormSubmissionItem | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await listSubmissions(formId, filter, page));
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Cavablar yüklənmədi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [formId, filter, page, toast]);

  useEffect(() => {
    let cancelled = false;
    listSubmissions(formId, filter, page)
      .then((res) => !cancelled && setData(res))
      .catch((err) =>
        toast({ title: "Xəta", description: err instanceof Error ? err.message : "Cavablar yüklənmədi", variant: "destructive" }),
      )
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [formId, filter, page, toast]);

  const notifySidebar = () => window.dispatchEvent(new Event("forms-updated"));

  const changeStatus = async (item: FormSubmissionItem, status: SubmissionStatus) => {
    try {
      await setSubmissionStatus(item.id, status);
      setSelected((s) => (s && s.id === item.id ? { ...s, status } : s));
      await load();
      notifySidebar();
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Status dəyişmədi", variant: "destructive" });
    }
  };

  const remove = async (item: FormSubmissionItem) => {
    if (!window.confirm("Bu cavab həmişəlik silinsin? Geri qaytarmaq mümkün deyil.")) return;
    try {
      await deleteSubmission(item.id);
      setSelected(null);
      toast({ title: "Silindi", description: "Cavab silindi." });
      await load();
      notifySidebar();
    } catch (err) {
      toast({ title: "Xəta", description: err instanceof Error ? err.message : "Silmək alınmadı", variant: "destructive" });
    }
  };

  const open = (item: FormSubmissionItem) => {
    setSelected(item);
    if (item.status === "new") changeStatus(item, "read");
  };

  const submissions = data?.submissions ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setFilter(f.value);
              setPage(1);
              setIsLoading(true);
            }}
            className={cn("px-3 py-1.5 text-sm font-medium rounded-md", filter === f.value ? "bg-white shadow-sm text-black" : "text-gray-500")}
          >
            {f.label}
            {f.value === "new" && data && data.unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#D9C2A0] px-1.5 text-[10px] font-bold text-black">{data.unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-white py-16 text-neutral-400">
          <Inbox size={40} className="stroke-[1.5]" />
          <p className="text-sm">Cavab tapılmadı.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b text-xs font-bold text-neutral-500 uppercase">
                  <th className="py-3 px-5">Tarix</th>
                  <th className="py-3 px-5">Cavablar</th>
                  <th className="py-3 px-5">Dil</th>
                  <th className="py-3 px-5">Səhifə</th>
                  <th className="py-3 px-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => open(s)}
                    className={cn("cursor-pointer hover:bg-neutral-50/70", s.status === "new" && "font-semibold bg-neutral-50/30")}
                  >
                    <td className="py-3 px-5 text-xs text-neutral-500 whitespace-nowrap">{formatDate(s.createdAt)}</td>
                    <td className="py-3 px-5 max-w-md">
                      <div className="truncate text-neutral-700">
                        {s.data.slice(0, 3).map((a) => `${a.label}: ${displayValue(a.value)}`).join("  ·  ")}
                      </div>
                    </td>
                    <td className="py-3 px-5 uppercase text-xs">{s.locale}</td>
                    <td className="py-3 px-5 text-xs text-neutral-500">{s.sourcePage ? `/${s.sourcePage}` : "—"}</td>
                    <td className="py-3 px-5 text-center">
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-5 py-3 bg-neutral-50/50">
              <span className="text-xs text-neutral-500">
                Səhifə {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <DialogTitle>Cavab</DialogTitle>
                <StatusBadge status={selected.status} />
              </div>
              <p className="text-xs text-neutral-500">
                {formatDate(selected.createdAt)} · {selected.locale.toUpperCase()}
                {selected.sourcePage ? ` · /${selected.sourcePage}` : ""}
              </p>
            </DialogHeader>

            <dl className="divide-y border-y text-sm">
              {selected.data.map((a) => (
                <div key={a.fieldId} className="py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{a.label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap break-words text-neutral-800">
                    {a.type === "email" ? (
                      <a href={`mailto:${displayValue(a.value)}`} className="text-blue-600 hover:underline">
                        {displayValue(a.value)}
                      </a>
                    ) : a.type === "phone" ? (
                      <a href={`tel:${displayValue(a.value)}`} className="hover:underline">
                        {displayValue(a.value)}
                      </a>
                    ) : (
                      displayValue(a.value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {selected.status !== "read" && (
                  <Button variant="outline" size="sm" onClick={() => changeStatus(selected, "read")}>
                    <CheckCheck size={14} /> Oxunub
                  </Button>
                )}
                {selected.status !== "new" && (
                  <Button variant="outline" size="sm" onClick={() => changeStatus(selected, "new")}>
                    Yeni kimi işarələ
                  </Button>
                )}
                {selected.status !== "archived" && (
                  <Button variant="outline" size="sm" onClick={() => changeStatus(selected, "archived")}>
                    <Archive size={14} /> Arxivlə
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => remove(selected)}>
                <Trash2 size={14} /> Sil
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
