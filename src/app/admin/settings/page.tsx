"use client"

import * as React from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/admin/ui/button"
import { Input } from "@/components/admin/ui/input"
import { Label } from "@/components/admin/ui/label"
import { useToast } from "@/components/admin/ui/use-toast"
import { fetchSiteSettingsStrict, updateSiteSettings } from "@/lib/api"

export default function GeneralSettingsPage() {
  const { toast } = useToast()
  const [whatsapp, setWhatsapp] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [loadFailed, setLoadFailed] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)
    try {
      const data = await fetchSiteSettingsStrict()
      setWhatsapp(data.whatsappNumber ?? "")
    } catch {
      // Never show an editable empty form: saving it would wipe the real number
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const saved = await updateSiteSettings({ whatsappNumber: whatsapp.trim() })
      setWhatsapp(saved.whatsappNumber ?? "")
      toast({ title: "Uğurlu", description: "Ayarlar yadda saxlanıldı. Saytda dəyişiklik dərhal görünür." })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ""
      toast({
        title: "Xəta",
        description: /unauthorized|no session|401/i.test(msg)
          ? "Sessiyanın vaxtı bitib. Yenidən daxil olun və təkrar cəhd edin."
          : msg || "Yadda saxlayarkən xəta baş verdi.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-500">
        <Loader2 className="animate-spin mr-2" size={18} /> Yüklənir...
      </div>
    )
  }

  if (loadFailed) {
    return (
      <div className="max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold mb-2">Ayarlar yüklənə bilmədi.</p>
        <p className="mb-4">Mövcud məlumatın üstünə yazmamaq üçün forma açılmadı.</p>
        <Button type="button" variant="outline" onClick={load}>Yenidən yüklə</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ümumi ayarlar</h1>
        <p className="text-sm text-neutral-500 mt-1">Bütün sayta aid ayarlar bir yerdən idarə olunur.</p>
      </div>

      <div className="rounded-2xl border bg-white p-6 space-y-3">
        <Label htmlFor="whatsapp" className="font-semibold">WhatsApp nömrəsi</Label>
        <Input
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="+1 (770) 679-2620"
          inputMode="tel"
          className="h-11"
        />
        <p className="text-xs text-neutral-500">
          Ölkə kodu ilə yazın. Bu nömrə ana səhifədə təsisçinin şəkli yanında və səhifənin aşağı küncündəki
          WhatsApp düyməsində istifadə olunur. Boş buraxsanız, həmin WhatsApp elementləri saytda gizlədilir.
        </p>
      </div>

      <Button type="button" onClick={save} disabled={saving} className="h-11 px-6">
        {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
        Yadda saxla
      </Button>
    </div>
  )
}
