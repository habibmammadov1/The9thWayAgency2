import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/admin/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[var(--primary)]/10">
        <Icon className="w-8 h-8 text-[var(--primary)]" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
