import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button, ButtonProps } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedSaveButtonProps extends ButtonProps {
  onSave: () => Promise<void>;
  idleText?: string;
  loadingText?: string;
  successText?: string;
  errorText?: string;
}

export function AnimatedSaveButton({
  onSave,
  idleText = "Yadda Saxla",
  loadingText = "Saxlanılır...",
  successText = "Saxlanıldı",
  errorText = "Xəta!",
  className,
  ...props
}: AnimatedSaveButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleClick = async () => {
    if (status !== "idle") return;
    setStatus("loading");
    try {
      await onSave();
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("[AnimatedSaveButton] onSave threw:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      // Do NOT re-throw: the caller's own catch block already handled the toast.
      // We just need to show the error state on the button itself.
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={status === "loading" || props.disabled}
      className={cn("relative overflow-hidden w-[140px] transition-colors", className, {
        "bg-[#8B6C3E] hover:bg-[#7a5f35] text-white": status === "success",
        "bg-red-600 hover:bg-red-700 text-white": status === "error",
      })}
      {...props}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center w-full h-full"
          >
            {idleText}
          </motion.span>
        )}
        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2 w-full h-full"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-2 w-full h-full"
          >
            <Check className="h-4 w-4" />
            {successText}
          </motion.span>
        )}
        {status === "error" && (
          <motion.span
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-center gap-2 w-full h-full"
          >
            {errorText}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
