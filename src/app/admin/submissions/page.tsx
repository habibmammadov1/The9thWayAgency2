"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchContactSubmissions, 
  updateSubmissionStatus 
} from "@/lib/api";
import { useToast } from "@/components/admin/ui/use-toast";
import { Button } from "@/components/admin/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/admin/ui/dialog";
import { 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  FileText, 
  CheckCheck, 
  Archive, 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  Loader2, 
  Reply 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Inline Badge component to avoid extra module imports
function Badge({ children, className, variant }: any) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
      variant === "secondary" ? "bg-neutral-100 text-neutral-600" :
      variant === "outline" ? "border border-neutral-300 text-neutral-500" :
      "bg-[#D9C2A0] text-black",
      className
    )}>
      {children}
    </span>
  );
}

// Inline date formatting helper
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

interface Submission {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  message: string;
  sourcePage: string;
  locale: string;
  status: "new" | "read" | "archived";
  createdAt: string;
}

export default function SubmissionsInboxPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [activeStatusFilter, currentPage]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetchContactSubmissions(activeStatusFilter, currentPage);
      setSubmissions(res.submissions || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      toast({
        title: "Xəta",
        description: "Müraciətləri yükləyərkən xəta baş verdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "new" | "read" | "archived") => {
    try {
      await updateSubmissionStatus(id, newStatus);
      toast({
        title: "Uğurlu",
        description: "Müraciət statusu yeniləndi.",
      });

      // Update locally
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub))
      );

      if (selectedSubmission?.id === id) {
        setSelectedSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Trigger custom window event to refresh sidebar badge
      window.dispatchEvent(new Event("submissions-updated"));
    } catch (err: any) {
      toast({
        title: "Xəta",
        description: err.message || "Status yenilənərkən xəta baş verdi.",
        variant: "destructive",
      });
    }
  };

  const truncateMessage = (text: string, len: number = 80) => {
    if (text.length <= len) return text;
    return text.substring(0, len) + "...";
  };

  const getStatusBadge = (status: "new" | "read" | "archived") => {
    switch (status) {
      case "new":
        return <Badge className="bg-[#D9C2A0] text-black hover:bg-[#D9C2A0] font-bold">Yeni</Badge>;
      case "read":
        return <Badge variant="secondary" className="bg-neutral-100 text-neutral-600">Oxunub</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-neutral-400 border-neutral-300">Arxiv</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 h-full w-full overflow-y-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-black flex items-center gap-2">
          <Inbox className="text-[var(--primary)]" />
          Müraciətlər qutusu (Inquiry Inbox)
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Vebsaytdan daxil olan əlaqə forması müraciətlərini izləyin və cavablandırın.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl border w-fit">
          {[
            { key: "all", label: "Hamısı" },
            { key: "new", label: "Yeni" },
            { key: "read", label: "Oxunmuş" },
            { key: "archived", label: "Arxivlənmiş" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveStatusFilter(f.key);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                activeStatusFilter === f.key
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-[var(--primary)]" size={36} />
          <p className="text-sm text-[var(--muted-foreground)]">Müraciətlər yüklənir...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-neutral-400 gap-2 border border-dashed rounded-3xl">
          <Inbox size={48} className="stroke-[1.5]" />
          <p className="text-sm">Heç bir müraciət tapılmadı.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b text-xs font-bold text-neutral-500 uppercase">
                  <th className="py-4 px-6">Ad Soyad</th>
                  <th className="py-4 px-6">E-poçt / Telefon</th>
                  <th className="py-4 px-6">Mesaj</th>
                  <th className="py-4 px-6">Mənbə</th>
                  <th className="py-4 px-6">Tarix</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      if (sub.status === "new") {
                        handleUpdateStatus(sub.id, "read");
                      }
                    }}
                    className={`hover:bg-neutral-50/70 cursor-pointer transition-colors ${
                      sub.status === "new" ? "font-semibold bg-neutral-50/20" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-semibold text-black">{sub.fullName}</td>
                    <td className="py-4 px-6 text-neutral-600">
                      <div className="flex flex-col">
                        <span>{sub.email}</span>
                        {sub.phone && <span className="text-xs text-neutral-400">{sub.phone}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-500 max-w-xs truncate">
                      {truncateMessage(sub.message)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
                        {sub.sourcePage === "home" ? "Ana Səhifə" : "Əlaqə Səhifəsi"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-neutral-400 text-xs">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-center">{getStatusBadge(sub.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4 bg-neutral-50/50">
              <span className="text-xs text-neutral-500">
                Səhifə {currentPage} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="h-8 w-8"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="h-8 w-8"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL DIALOG */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        {selectedSubmission && (
          <DialogContent className="max-w-xl rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-xl font-bold text-black">{selectedSubmission.fullName}</DialogTitle>
                {getStatusBadge(selectedSubmission.status)}
              </div>
            </DialogHeader>

            <div className="space-y-6 my-4 border-t border-b py-6 text-sm text-neutral-700">
              {/* Email details */}
              <div className="flex items-start md:items-center gap-3">
                <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <Mail size={14} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">E-poçt</span>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline font-medium break-all">
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>

              {/* Phone details */}
              {selectedSubmission.phone && (
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                    <Phone size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">Telefon</span>
                    <a href={`tel:${selectedSubmission.phone}`} className="hover:underline font-medium break-all">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Date & Language details in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                    <Calendar size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">Göndərilmə Tarixi</span>
                    <span className="font-medium break-words">
                      {formatDate(selectedSubmission.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start md:items-center gap-3">
                  <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                    <Globe size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider">Dil & Səhifə</span>
                    <span className="font-medium uppercase break-words">
                      {selectedSubmission.locale} ({selectedSubmission.sourcePage})
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Block */}
              <div className="flex items-start gap-3 bg-neutral-50 p-5 rounded-2xl border">
                <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-neutral-400 block font-semibold uppercase tracking-wider mb-1">Mesaj</span>
                  <p className="whitespace-pre-wrap leading-relaxed text-black font-normal break-words">{selectedSubmission.message}</p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row flex-wrap sm:justify-between items-center gap-3">
              {/* Left quick mail reply */}
              <a 
                href={`mailto:${selectedSubmission.email}?subject=THE9THWAY%20Agency%20Reply&body=Hello%20${encodeURIComponent(selectedSubmission.fullName)}%2C%0A%0A`}
                className="inline-flex items-center gap-2 bg-[#0B0B0C] hover:bg-neutral-800 text-white rounded-full px-5 py-2.5 text-xs font-bold shadow transition-colors"
              >
                <Reply size={14} /> Cavablandır (Mailto)
              </a>

              {/* Right status change toggles */}
              <div className="flex gap-2 ml-auto">
                {selectedSubmission.status !== "read" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedSubmission.id, "read")}
                    className="text-xs border-neutral-300 rounded-full px-4"
                  >
                    <CheckCheck size={14} className="mr-1 text-[#8B6C3E]" /> Oxundu
                  </Button>
                )}
                {selectedSubmission.status !== "archived" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedSubmission.id, "archived")}
                    className="text-xs border-neutral-300 rounded-full px-4"
                  >
                    <Archive size={14} className="mr-1 text-amber-600" /> Arxivlə
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
