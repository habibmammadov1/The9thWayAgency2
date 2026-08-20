"use client"

import * as React from "react"
import { Upload, X, ImageIcon, Loader2, Check } from "lucide-react"
import { useToast } from "@/components/admin/ui/use-toast"
import { Button } from "@/components/admin/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadFieldProps {
  value?: string | null
  onChange: (value: string) => void
  onClear?: () => void
  className?: string
  disabled?: boolean
}

export function ImageUploadField({
  value,
  onChange,
  onClear,
  className,
  disabled
}: ImageUploadFieldProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const uploadFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Səhv fayl formatı",
        description: "Yalnızca JPG, PNG, WEBP və SVG formatlı şəkillərə icazə verilir!",
        variant: "destructive"
      } as any)
      return
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fayl çox böyükdür",
        description: "Şəklin ölçüsü 5MB-dan çox ola bilməz!",
        variant: "destructive"
      } as any)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress since we can't easily hook into fetch's progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 0
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const res = await fetch("http://localhost:4000/api/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Şəkil yüklənərkən xəta baş verdi")
      }

      setUploadProgress(100)
      const data = await res.json()
      onChange(data.url)
      
      toast({
        title: "Uğurlu",
        description: "Şəkil uğurla yükləndi.",
        variant: "default"
      } as any)
    } catch (error: any) {
      console.error("[ImageUpload] Error uploading:", error)
      toast({
        title: "Xəta",
        description: error.message || "Şəkil yüklənərkən xəta baş verdi. Yenidən cəhd edin.",
        variant: "destructive"
      } as any)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(null)
      }, 500)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
    if (onClear) onClear()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.webp,.svg"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--paper)] aspect-[16/9] max-h-[220px] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Yüklənmiş şəkil"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white text-black border-white hover:bg-white/90"
              onClick={triggerFileInput}
              disabled={disabled || isUploading}
            >
              Dəyişdir
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9"
              onClick={handleClear}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all min-h-[140px]",
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] hover:border-[var(--primary)] bg-[var(--paper)]/50",
            (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Yüklənir... {uploadProgress !== null ? `${uploadProgress}%` : ""}
              </p>
              {uploadProgress !== null && (
                <div className="w-40 bg-gray-200 rounded-full h-1.5 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="bg-[var(--primary)] h-1.5 rounded-full transition-all duration-100" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="p-3 rounded-full bg-[var(--border)]/30 text-[var(--muted-foreground)]">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold">Şəkli buraya sürükləyin və ya fayl seçin</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Maksimum 5MB (JPG, PNG, WEBP, SVG)
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
