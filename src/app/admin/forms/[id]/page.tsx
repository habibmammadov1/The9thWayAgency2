"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/ui/use-toast";
import { FormEditor } from "@/components/admin/forms/FormEditor";
import { getForm } from "@/lib/forms/formsApi";
import type { AdminForm } from "@/lib/forms/types";

function EditFormContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = params.id as string;
  const [form, setForm] = useState<AdminForm | null>(null);

  useEffect(() => {
    let cancelled = false;
    getForm(id)
      .then((data) => !cancelled && setForm(data))
      .catch((err) => {
        if (cancelled) return;
        toast({ title: "Xəta", description: err instanceof Error ? err.message : "Forma yüklənmədi", variant: "destructive" });
        router.push("/admin/forms");
      });
    return () => {
      cancelled = true;
    };
  }, [id, router, toast]);

  if (!form) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
        <p className="text-sm text-[var(--muted-foreground)]">Forma yüklənir...</p>
      </div>
    );
  }

  return <FormEditor key={form.id} initialForm={form} initialTab={searchParams.get("tab") === "responses" ? "responses" : "fields"} />;
}

export default function EditFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Yüklənir...</div>}>
      <EditFormContent />
    </Suspense>
  );
}
