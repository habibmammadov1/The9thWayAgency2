"use client"

import * as React from "react"
import { UploadCloud, RefreshCw, Save } from "lucide-react"
import { Button } from "@/components/admin/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/admin/ui/card"
import { useToast } from "@/components/admin/ui/use-toast"
import { ImageUploadField } from "@/components/admin/ui/ImageUploadField"

export function BrandingModule() {
  const { toast } = useToast()
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  // Default mock logo (the 9th way text or a simple icon)
  const defaultLogo = "THE9THWAY"

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Basic validation
    if (!file.type.includes('image/')) {
      toast({
        title: "Xəta",
        description: "Zəhmət olmasa düzgün şəkil formatı seçin (SVG, PNG, JPG).",
        variant: "destructive"
      })
      return
    }

    // Create a local preview URL
    const url = URL.createObjectURL(file)
    setLogoPreview(url)
  }

  const handleReset = () => {
    setLogoPreview(null)
  }

  const handleSave = () => {
    // TODO: wire to backend
    // e.g. const formData = new FormData(); formData.append("logo", selectedFile);
    // await fetch("/api/branding/logo", { method: "POST", body: formData });
    
    toast({
      title: "Uğurlu",
      description: "Loqo yeniləndi (demo)",
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Brendinq</h1>
        <p className="text-[var(--muted-foreground)]">Saytın vizual kimliyini və loqolarını idarə edin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Əsas Loqo</CardTitle>
          <CardDescription>
            Bu loqo həm açıq (Navbar), həm də tünd (Footer) fonlarda istifadə olunacaq. Ən yaxşı nəticə üçün transparan SVG və ya PNG formatından istifadə edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Previews */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Açıq Fon Önizləməsi</span>
              <div className="flex h-40 items-center justify-center rounded-md border border-[var(--border)] bg-white p-6">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Light" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-display text-2xl font-bold tracking-tight text-black">{defaultLogo}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Tünd Fon Önizləməsi</span>
              <div className="flex h-40 items-center justify-center rounded-md border border-[var(--border)] bg-[#0A0A0A] p-6">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Dark" className="max-h-full max-w-full object-contain brightness-0 invert" />
                ) : (
                  <span className="font-display text-2xl font-bold tracking-tight text-white">{defaultLogo}</span>
                )}
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Yeni Loqo Yüklə</span>
            <ImageUploadField 
              value={logoPreview} 
              onChange={setLogoPreview} 
              onClear={handleReset} 
            />
          </div>

        </CardContent>
        <CardFooter className="flex justify-between border-t border-[var(--border)] bg-[var(--muted)]/50 px-6 py-4">
          <Button variant="outline" onClick={handleReset} disabled={!logoPreview}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sıfırla
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Saxla
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
