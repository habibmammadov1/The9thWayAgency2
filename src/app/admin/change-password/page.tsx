"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Şifrələr uyğun gəlmir")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? "Şifrə dəyişdirilə bilmədi. Yenidən cəhd edin.")
        return
      }

      // Successful password change — reload the window to trigger fresh auth check and enter the admin panel
      window.location.href = "/admin"
    } catch {
      setError("Server ilə əlaqə qurula bilmədi. API işlədiyindən əmin olun.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <span
            className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] uppercase"
            style={{ fontFamily: "var(--font-gilroy), sans-serif", letterSpacing: "0.12em" }}
          >
            THE9THWAY
          </span>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
            Təhlükəsizlik
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
          <h1 className="mb-2 text-xl font-bold text-[var(--foreground)]">Yeni Şifrə Təyin Edin</h1>
          <p className="mb-6 text-xs text-[var(--muted-foreground)]">
            Hesabınızın təhlükəsizliyi üçün davam etməzdən əvvəl yeni şifrə təyin etməlisiniz.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                Yeni Şifrə
              </label>
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                Şifrəni Təsdiqləyin
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              id="change-password-submit"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[var(--foreground)] py-3 text-sm font-bold uppercase tracking-wider text-[var(--background)] transition-opacity disabled:opacity-50 hover:opacity-90 cursor-pointer"
            >
              {loading ? "Yadda saxlanılır..." : "Yadda Saxla və Daxil Ol"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} The9thway Agency
        </p>
      </div>
    </div>
  )
}
