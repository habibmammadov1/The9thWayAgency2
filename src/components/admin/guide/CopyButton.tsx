"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { useToast } from "@/components/admin/ui/use-toast";
import { copyText } from "@/lib/admin-guide/clipboard";

interface CopyButtonProps {
  /** Called on click, so the text (and site address) is built in the browser at that moment. */
  getText: () => string;
  label: string;
  copiedLabel?: string;
  toastDescription?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
}

export function CopyButton({
  getText,
  label,
  copiedLabel = "Kopyalandı",
  toastDescription,
  variant = "default",
  size = "default",
  className,
}: CopyButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleClick = async () => {
    const ok = await copyText(getText());
    if (!ok) {
      toast({
        title: "Kopyalamaq alınmadı",
        description: "Brauzer icazə vermədi. Mətni əl ilə seçib kopyalayın.",
        variant: "destructive",
      });
      return;
    }
    setCopied(true);
    if (toastDescription) toast({ title: "Kopyalandı", description: toastDescription });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Button type="button" variant={variant} size={size} onClick={handleClick} className={className}>
      {copied ? <Check /> : <Copy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
