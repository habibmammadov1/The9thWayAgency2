"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import type { PublishCheck } from "./editorState";

export function PublishDialog({
  open,
  onOpenChange,
  checks,
  isDirty,
  isWorking,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checks: PublishCheck[];
  isDirty: boolean;
  isWorking: boolean;
  onConfirm: () => void;
}) {
  const errors = checks.filter((c) => c.level === "error");
  const warnings = checks.filter((c) => c.level === "warning");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{errors.length ? "Dərc etmək mümkün deyil" : "Dərc etməyə hazırdır?"}</DialogTitle>
          <DialogDescription className="text-xs text-[var(--muted-foreground)]">
            {isDirty ? "Yadda saxlanmamış dəyişikliklər əvvəlcə saxlanılacaq." : "Səhifə saytda görünəcək."}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm">
          {errors.map((c, i) => (
            <li key={`e${i}`} className="flex gap-2 text-red-700">
              <XCircle size={16} className="shrink-0 mt-0.5" /> {c.text}
            </li>
          ))}
          {errors.length === 0 && (
            <li className="flex gap-2 text-green-700">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> Ən azı bir dildə başlıq və blok var
            </li>
          )}
          {warnings.map((c, i) => (
            <li key={`w${i}`} className="flex gap-2 text-amber-700">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {c.text}
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isWorking}>
            Ləğv et
          </Button>
          {errors.length === 0 && (
            <Button onClick={onConfirm} disabled={isWorking}>
              {isWorking && <Loader2 size={14} className="animate-spin" />}
              Dərc et
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
