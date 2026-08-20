"use client"

import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/admin/ui/button"
import { Copy, RefreshCw } from "lucide-react"

interface CreateUserDialogProps {
  onClose: () => void
  onSuccess: () => void
  onToast: (msg: { title: string, description?: string, variant?: "default" | "destructive" | "success" }) => void
}

const formSchema = z.object({
  name: z.string().min(1, "Ad tələb olunur"),
  email: z.string().email("Düzgün e-poçt ünvanı daxil edin"),
  password: z.string().min(8, "Şifrə minimum 8 simvol olmalıdır"),
  role: z.string().min(1, "Rol tələb olunur")
})

export function CreateUserDialog({ onClose, onSuccess, onToast }: CreateUserDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let pass = ""
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password: pass }))
  }

  const copyPassword = () => {
    if (!formData.password) return
    navigator.clipboard.writeText(formData.password)
    onToast({ title: "Şifrə kopyalandı", variant: "default" })
  }

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
      const res = await fetch("http://localhost:4000/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Xəta baş verdi")
      }

      onToast({ title: "İstifadəçi yaradıldı", variant: "success" })
      onSuccess()
    } catch (err: any) {
      onToast({ title: "Xəta", description: err.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--background)] p-6 shadow-xl border border-[var(--border)]">
        <h2 className="mb-6 text-xl font-bold text-[var(--foreground)]">Yeni İstifadəçi</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Ad və Soyad</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              placeholder="Məs: Əli Əliyev"
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
              placeholder="admin@example.com"
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
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Müvəqqəti Şifrə</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)] font-mono"
                placeholder="Şifrə daxil edin və ya yaradın"
              />
              <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Avtomatik Yarat">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={copyPassword} title="Kopyala">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
              Diqqət: Bu şifrəni istifadəçiyə göndərməyi unutmayın. Onlar ilk girişdə şifrəni dəyişməyə məcbur ediləcəklər.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Ləğv et
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Yaradılır..." : "Yarat"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
