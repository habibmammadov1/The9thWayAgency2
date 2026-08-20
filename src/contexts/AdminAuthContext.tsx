"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  mustChangePassword?: boolean
}

interface AdminAuthContextValue {
  user: AdminUser | null
  logout: () => Promise<void>
}

const AdminAuthContext = React.createContext<AdminAuthContextValue>({
  user: null,
  logout: async () => {},
})

export function useAdminAuth() {
  return React.useContext(AdminAuthContext)
}

export function AdminAuthProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: AdminUser | null
}) {
  const router = useRouter()

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      router.push("/admin/login")
    }
  }, [router])

  return (
    <AdminAuthContext.Provider value={{ user, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
