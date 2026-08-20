"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, Menu, ExternalLink, LogOut } from "lucide-react"
import { Button } from "@/components/admin/ui/button"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

interface TopbarProps {
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
  isMobile: boolean
}

export function Topbar({ isCollapsed, setIsCollapsed, isMobile }: TopbarProps) {
  const pathname = usePathname()
  const { user, logout } = useAdminAuth()
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("http://localhost:4000/health");
        if (isMounted) setApiStatus(res.ok ? "ok" : "error");
      } catch (err) {
        if (isMounted) setApiStatus("error");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBreadcrumb = () => {
    const parts = pathname.split("/").filter(Boolean)
    if (parts.length <= 1) return "Ana Səhifə"
    const section = parts[1]
    const map: Record<string, string> = {
      services: "Xidmətlər",
      blogs: "Bloqlar",
      about: "Haqqımızda",
      portfolio: "Portfolio",
      team: "Komanda",
      contact: "Əlaqə",
      branding: "Sayt Ayarları / Brendinq",
      navigation: "Sayt Ayarları / Naviqasiya",
      translations: "Sayt Ayarları / Tərcümələr",
      settings: "Sayt Ayarları / Ümumi",
    }
    return map[section] || section
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  // User's initials for avatar
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          aria-label="Menyu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden text-sm font-medium text-[var(--muted-foreground)] sm:block">
          Admin / <span className="text-[var(--foreground)]">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* API connectivity indicator */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <div className={`h-2.5 w-2.5 rounded-full ${apiStatus === 'ok' ? 'bg-lime-500' : apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">
            {apiStatus === 'ok' ? 'API Qoşulu' : apiStatus === 'error' ? 'API Əlaqəsi Yoxdur' : 'Yoxlanılır...'}
          </span>
        </div>

        <Button variant="outline" size="sm" asChild className="hidden sm:flex">
          <Link href="/az" target="_blank">
            Saytı Gör
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
        </Button>

        {/* User avatar + name + logout */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--secondary)] text-sm font-bold text-[var(--foreground)] select-none"
            title={user ? `${user.name} (${user.email})` : ""}
          >
            {initials}
          </div>
          {user && (
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-[var(--foreground)]">{user.name}</span>
              <span className="text-[10px] text-[var(--muted-foreground)]">{user.email}</span>
            </div>
          )}
          <Button
            id="topbar-logout-btn"
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Çıxış"
            className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
