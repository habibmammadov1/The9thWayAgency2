"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CalendarX2, ChevronLeft, ChevronRight, Loader2, Trash2, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { useToast } from "@/components/admin/ui/use-toast";
import { Textarea } from "@/components/admin/ui/textarea";
import { cn } from "@/lib/utils";
import { deleteBooking, listBookings, updateBooking } from "@/lib/booking/bookingApi";
import type { AdminBooking, BookingScope, BookingsPage } from "@/lib/booking/types";
import { formatDateTime, formatTimeOnly } from "./format";

const SCOPES: { value: BookingScope; label: string }[] = [
  { value: "upcoming", label: "Gələcək" },
  { value: "past", label: "Keçmiş" },
  { value: "cancelled", label: "Ləğv edilmiş" },
];

const notifySidebar = () => window.dispatchEvent(new Event("bookings-updated"));

export function BookingsList() {
  const { toast } = useToast();
  const [scope, setScope] = useState<BookingScope>("upcoming");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BookingsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = useCallback(
    (err: unknown, fallback: string) =>
      toast({ title: "Xəta", description: err instanceof Error ? err.message : fallback, variant: "destructive" }),
    [toast],
  );

  const reload = useCallback(async () => {
    try {
      setData(await listBookings(scope, page));
    } catch (err) {
      fail(err, "Rezervasiyalar yüklənmədi");
    }
  }, [scope, page, fail]);

  useEffect(() => {
    let cancelled = false;
    listBookings(scope, page)
      .then((res) => !cancelled && setData(res))
      .catch((err) => fail(err, "Rezervasiyalar yüklənmədi"))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [scope, page, fail]);

  const zone = data?.timezone ?? "Asia/Baku";

  const open = (b: AdminBooking) => {
    setSelected(b);
    setNote(b.adminNote ?? "");
    if (!b.isSeen) {
      updateBooking(b.id, { isSeen: true })
        .then(() => {
          notifySidebar();
          return reload();
        })
        .catch(() => undefined);
    }
  };

  const patch = async (b: AdminBooking, body: { status?: "confirmed" | "cancelled"; adminNote?: string | null }, okMsg: string) => {
    setBusy(true);
    try {
      const updated = await updateBooking(b.id, body);
      setSelected(body.adminNote !== undefined ? { ...b, ...updated } : null);
      toast({ title: okMsg });
      await reload();
      notifySidebar();
    } catch (err) {
      fail(err, "Dəyişiklik alınmadı");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (b: AdminBooking) => {
    if (!window.confirm("Bu rezervasiya həmişəlik silinsin? Ziyarətçinin məlumatı da silinəcək. Geri qaytarmaq mümkün deyil.")) return;
    setBusy(true);
    try {
      await deleteBooking(b.id);
      setSelected(null);
      toast({ title: "Silindi" });
      await reload();
      notifySidebar();
    } catch (err) {
      fail(err, "Silmək alınmadı");
    } finally {
      setBusy(false);
    }
  };

  const bookings = data?.bookings ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg bg-[var(--muted)] p-1">
        {SCOPES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => {
              setScope(s.value);
              setPage(1);
              setIsLoading(true);
            }}
            className={cn("px-3 py-1.5 text-sm font-medium rounded-md", scope === s.value ? "bg-white shadow-sm text-black" : "text-gray-500")}
          >
            {s.label}
            {s.value === "upcoming" && data && data.unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[#D9C2A0] px-1.5 text-[10px] font-bold text-black">{data.unreadCount}</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--muted-foreground)]">Saatlar biznes saat qurşağında göstərilir: {zone}</p>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--primary)]" size={28} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-white py-16 text-neutral-400">
          <CalendarX2 size={40} className="stroke-[1.5]" />
          <p className="text-sm">Rezervasiya yoxdur.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b text-xs font-bold text-neutral-500 uppercase">
                <th className="py-3 px-5">Vaxt</th>
                <th className="py-3 px-5">Görüş növü</th>
                <th className="py-3 px-5">Ad</th>
                <th className="py-3 px-5">Əlaqə</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} onClick={() => open(b)} className="cursor-pointer border-b last:border-b-0 hover:bg-neutral-50/70">
                  <td className={cn("py-3 px-5 whitespace-nowrap", !b.isSeen && "font-bold")}>
                    {formatDateTime(b.startsAt, zone)}–{formatTimeOnly(b.endsAt, zone)}
                  </td>
                  <td className="py-3 px-5">{b.type.name}</td>
                  <td className="py-3 px-5">{b.name}</td>
                  <td className="py-3 px-5 text-gray-500">{b.email}</td>
                  <td className="py-3 px-5">
                    {b.status === "cancelled" ? (
                      <span className="rounded-full border border-neutral-300 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-500">Ləğv</span>
                    ) : !b.isSeen ? (
                      <span className="rounded-full bg-[#D9C2A0] px-2.5 py-1 text-[10px] font-bold uppercase text-black">Yeni</span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-600">Təsdiq</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
          </Button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight />
          </Button>
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.type.name}</DialogTitle>
              </DialogHeader>
              <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Vaxt</dt>
                <dd className="font-semibold">
                  {formatDateTime(selected.startsAt, zone)}–{formatTimeOnly(selected.endsAt, zone)}
                </dd>
                <dt className="text-gray-500">Ad</dt>
                <dd>{selected.name}</dd>
                <dt className="text-gray-500">E-poçt</dt>
                <dd>
                  <a className="underline" href={`mailto:${selected.email}`}>
                    {selected.email}
                  </a>
                </dd>
                {selected.phone && (
                  <>
                    <dt className="text-gray-500">Telefon</dt>
                    <dd>{selected.phone}</dd>
                  </>
                )}
                {selected.message && (
                  <>
                    <dt className="text-gray-500">Mesaj</dt>
                    <dd className="whitespace-pre-wrap">{selected.message}</dd>
                  </>
                )}
                {selected.answers?.map((a) => (
                  <React.Fragment key={a.fieldId}>
                    <dt className="text-gray-500">{a.label}</dt>
                    <dd className="whitespace-pre-wrap break-words">
                      {a.value === true ? "Bəli" : Array.isArray(a.value) ? a.value.join(", ") : String(a.value)}
                    </dd>
                  </React.Fragment>
                ))}
                <dt className="text-gray-500">Ziyarətçinin saat qurşağı</dt>
                <dd>
                  {selected.visitorTimezone} ({formatDateTime(selected.startsAt, selected.visitorTimezone)})
                </dd>
                <dt className="text-gray-500">Dil</dt>
                <dd>{selected.locale.toUpperCase()}</dd>
                <dt className="text-gray-500">Rezerv tarixi</dt>
                <dd>{formatDateTime(selected.createdAt, zone)}</dd>
              </dl>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Admin qeydi (yalnız sizə görünür)</label>
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
                <Button variant="outline" size="sm" disabled={busy || note === (selected.adminNote ?? "")} onClick={() => patch(selected, { adminNote: note.trim() || null }, "Qeyd saxlandı")}>
                  Qeydi saxla
                </Button>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-2">
                {selected.status === "confirmed" ? (
                  <Button variant="outline" disabled={busy} onClick={() => patch(selected, { status: "cancelled" }, "Ləğv edildi, vaxt azad oldu")}>
                    <XCircle /> Ləğv et
                  </Button>
                ) : (
                  <Button variant="outline" disabled={busy} onClick={() => patch(selected, { status: "confirmed" }, "Bərpa edildi")}>
                    <Undo2 /> Bərpa et
                  </Button>
                )}
                <Button variant="destructive" disabled={busy} onClick={() => remove(selected)}>
                  <Trash2 /> Sil
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
