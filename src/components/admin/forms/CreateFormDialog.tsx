"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { createForm } from "@/lib/forms/formsApi";
import type { AdminForm } from "@/lib/forms/types";
import { Field } from "@/components/admin/page-builder/fields";

export function CreateFormDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (form: AdminForm) => void;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Ad boş ola bilməz");
    setIsCreating(true);
    setError(null);
    try {
      const form = await createForm(name.trim());
      setName("");
      onCreated(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Forma yaradıla bilmədi");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setName("");
          setError(null);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Yeni forma</DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted-foreground)]">
              Ad yalnız admin paneldə görünür (məs. “Kampaniya forması”). Sahələri növbəti ekranda qurursunuz.
            </DialogDescription>
          </DialogHeader>
          <Field label="Forma adı">
            <Input autoFocus value={name} maxLength={200} onChange={(e) => setName(e.target.value)} placeholder="Məs. Kampaniya forması" />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 size={14} className="animate-spin" />}
              Yarat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
