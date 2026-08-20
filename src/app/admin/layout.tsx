import * as React from "react"
import { Metadata } from "next"
import { gilroy } from "@/fonts/gilroy"
import { belwe } from "@/fonts/belwe"
import "../globals.css"
import "./admin.css"
import { AdminLayoutClient } from "@/components/admin/layout/AdminLayoutClient"

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Panel | THE9THWAY",
    default: "Admin Panel | THE9THWAY",
  },
  description: "THE9THWAY Agency Admin Dashboard",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="az" className="admin-theme" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${gilroy.variable} ${belwe.variable} antialiased bg-[var(--background)] text-[var(--foreground)] leading-relaxed`}>
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </body>
    </html>
  )
}
