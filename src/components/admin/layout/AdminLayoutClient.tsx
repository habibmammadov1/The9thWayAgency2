"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/admin/layout/Sidebar"
import { Topbar } from "@/components/admin/layout/Topbar"
import { Toaster } from "@/components/admin/ui/toaster"
import { AdminAuthProvider, AdminUser } from "@/contexts/AdminAuthContext"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [authState, setAuthState] = React.useState<"checking" | "authenticated" | "unauthenticated">("checking")
  const [user, setUser] = React.useState<AdminUser | null>(null)

  // Responsive layout — always run regardless of page
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auth check on mount — always run so hooks order is stable
  React.useEffect(() => {
    // Skip auth check on the login page itself
    if (isLoginPage) {
      setAuthState("authenticated") // not really needed, but keeps state consistent
      return
    }

    let cancelled = false

    async function checkAuth() {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
        })

        if (cancelled) return

        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setAuthState("authenticated")
        } else {
          setAuthState("unauthenticated")
          router.replace("/admin/login")
        }
      } catch {
        if (!cancelled) {
          setAuthState("unauthenticated")
          router.replace("/admin/login")
        }
      }
    }

    checkAuth()
    return () => { cancelled = true }
  }, [router, isLoginPage])

  // --- Conditional renders come AFTER all hooks ---

  const isChangePasswordPage = pathname === "/admin/change-password"

  // If authenticated but needs to change password, force redirect
  React.useEffect(() => {
    if (authState === "authenticated" && user?.mustChangePassword && !isChangePasswordPage && !isLoginPage) {
      router.replace("/admin/change-password")
    }
  }, [authState, user, isChangePasswordPage, isLoginPage, router])

  // Login page or change password page: bypass the auth guard and admin shell entirely
  if (isLoginPage || isChangePasswordPage) {
    return <>{children}</>
  }

  // While checking auth — show a centered spinner (no flash of admin UI)
  if (authState === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
          <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
            Yüklənir...
          </span>
        </div>
      </div>
    )
  }

  // If unauthenticated, render nothing (router.replace already fired)
  if (authState === "unauthenticated") {
    return null
  }

  return (
    <AdminAuthProvider user={user}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && !isCollapsed && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setIsCollapsed(true)}
          />
        )}

        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobile={isMobile}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            isMobile={isMobile}
          />
          <main className="flex-1 overflow-y-auto bg-[var(--background)] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </div>
    </AdminAuthProvider>
  )
}
