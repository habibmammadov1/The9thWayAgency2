"use client"

import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/admin/ui/button"
import { Copy, RefreshCw, KeyRound, AlertTriangle } from "lucide-react"

interface EditUserDialogProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
  }
  isCurrentUser: boolean
  onClose: () => void
  onSuccess: () => void
  onToast: (msg: { title: string, description?: string, variant?: "default" | "destructive" | "success" }) => void
}

const formSchema = z.object({
  name: z.string().min(1, "Ad tələb olunur"),
  email: z.string().email("Düzgün e-poçt ünvanı daxil edin"),
  role: z.string().min(1, "Rol tələb olunur"),
  isActive: z.boolean()
})

export function EditUserDialog({ user, isCurrentUser, onClose, onSuccess, onToast }: EditUserDialogProps) {
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPasswordReset, setShowPasswordReset] = React.useState(false)
  const [newTempPassword, setNewTempPassword] = React.useState("")
  const [isResetting, setIsResetting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    const parsed = formSchema.safeParse(formData)
    if (!parsed.success) {
      const newErrors: Record<string, string> = {}
      parsed.error.issues.forEach((err: any) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message
      })
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${user.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Xəta baş verdi")
      }

      onToast({ title: "Məlumatlar yeniləndi", variant: "success" })
      onSuccess()
    } catch (err: any) {
      onToast({ title: "Xəta", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateAndResetPassword = async () => {
    // Generate new strong password
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    setIsResetting(true)
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${user.id}/reset-password`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pass })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Şifrə sıfırlana bilmədi")
      }

      setNewTempPassword(pass)
      onToast({ title: "Şifrə sıfırlandı", variant: "success" })
    } catch (err: any) {
      onToast({ title: "Xəta", description: err.message, variant: "destructive" })
    } finally {
      setIsResetting(false)
    }
  }

  const copyPassword = () => {
    if (!newTempPassword) return
    navigator.clipboard.writeText(newTempPassword)
    onToast({ title: "Şifrə kopyalandı", variant: "default" })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--background)] p-6 shadow-xl border border-[var(--border)]">
        <h2 className="mb-6 text-xl font-bold text-[var(--foreground)]">İstifadəçini Redaktə Et</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Ad və Soyad</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">E-poçt</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Rol</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
            >
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Aktiv Hesab</p>
              <p className="text-xs text-[var(--muted-foreground)]">İstifadəçinin sistemə girişinə icazə verir</p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={formData.isActive}
                disabled={isCurrentUser} // Cannot deactivate oneself
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <div className="peer h-6 w-11 rounded-full bg-[var(--border)] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--foreground)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-disabled:opacity-50"></div>
            </label>
          </div>
          {isCurrentUser && (
            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              Öz hesabınızı deaktiv edə bilməzsiniz.
            </p>
          )}

          {/* Password Reset Section */}
          <div className="pt-4 border-t border-[var(--border)] mt-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Şifrə
            </h3>
            
            {!showPasswordReset ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowPasswordReset(true)}>
                Şifrəni Sıfırla
              </Button>
            ) : (
              <div className="bg-[var(--secondary)]/50 p-4 rounded-lg border border-[var(--border)] space-y-3">
                <p className="text-sm">Bu istifadəçi üçün yeni müvəqqəti şifrə yaradın.</p>
                
                {newTempPassword ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] p-2 rounded">
                      <code className="flex-1 font-mono">{newTempPassword}</code>
                      <Button type="button" variant="ghost" size="icon" onClick={copyPassword} title="Kopyala">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      Diqqət: Şifrəni istifadəçiyə göndərin. O, daxil olanda şifrəni dəyişməli olacaq.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" onClick={generateAndResetPassword} disabled={isResetting}>
                      {isResetting ? "Sıfırlanır..." : "Yeni Şifrə Yarat"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowPasswordReset(false)}>
                      Ləğv et
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Bağla
            </Button>
            <Button type="submit" disabled={isSubmitting || (formData.name === user.name && formData.email === user.email && formData.role === user.role && formData.isActive === user.isActive)}>
              {isSubmitting ? "Yadda saxlanılır..." : "Yadda Saxla"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
