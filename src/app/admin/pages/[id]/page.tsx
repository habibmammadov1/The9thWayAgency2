"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/ui/use-toast";
import { PageEditor } from "@/components/admin/page-builder/PageEditor";
import { getPage } from "@/lib/page-builder/pagesApi";
import type { AdminPage } from "@/lib/page-builder/types";

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const [page, setPage] = useState<AdminPage | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPage(id)
      .then((data) => !cancelled && setPage(data))
      .catch((err) => {
        if (cancelled) return;
        toast({ title: "Xəta", description: err instanceof Error ? err.message : "Səhifə yüklənmədi", variant: "destructive" });
        router.push("/admin/pages");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router, toast]);

  if (!page) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
        <p className="text-sm text-[var(--muted-foreground)]">Səhifə yüklənir...</p>
      </div>
    );
  }

  // key: remount the editor when navigating between pages (e.g. after "duplicate")
  return <PageEditor key={page.id} initialPage={page} />;
}
