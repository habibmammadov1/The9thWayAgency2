"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error ?? "Giriş uğursuz oldu. Yenidən cəhd edin.")
        return
      }

      // Successful login — redirect into the admin shell
      router.push("/admin")
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
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
          <h1 className="mb-6 text-xl font-bold text-[var(--foreground)]">Daxil Ol</h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                E-poçt
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--foreground)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
              >
                Şifrə
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              id="login-submit"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-[var(--foreground)] py-3 text-sm font-bold uppercase tracking-wider text-[var(--background)] transition-opacity disabled:opacity-50 hover:opacity-90 cursor-pointer"
            >
              {loading ? "Yüklənir..." : "Daxil Ol"}
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
