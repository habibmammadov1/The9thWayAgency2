"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Briefcase,
  FileText,
  Info,
  FolderOpen,
  Users,
  Phone,
  Settings,
  Image as ImageIcon,
  Menu,
  Languages,
  LogOut,
  User,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchContactSubmissions } from "@/lib/api"

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  showBadge?: boolean;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigation: NavigationSection[] = [
  {
    title: "Məzmun",
    items: [
      { name: "Ana Səhifə", href: "/admin/content/home", icon: Home },
      { name: "Xidmətlər", href: "/admin/content/services", icon: Briefcase },
      { name: "Rəylər", href: "/admin/content/testimonials", icon: MessageSquare },
      { name: "Bloqlar", href: "/admin/content/blogs", icon: FileText },
      { name: "Haqqımızda", href: "/admin/content/about", icon: Info },
      { name: "Portfolio", href: "/admin/content/portfolio", icon: FolderOpen },
      { name: "Komanda", href: "/admin/content/team", icon: Users },
      { name: "Müştəri Loqoları", href: "/admin/content/client-logos", icon: ImageIcon },
      { name: "Əlaqə", href: "/admin/content/contact", icon: Phone },
    ],
  },
  {
    title: "Sistem",
    items: [
      { name: "Müraciətlər", href: "/admin/submissions", icon: Inbox, showBadge: true },
      { name: "İstifadəçilər", href: "/admin/settings/users", icon: Users },
    ],
  },
  {
    title: "Sayt Ayarları",
    items: [
      { name: "Brendinq", href: "/admin/branding", icon: ImageIcon },
      { name: "Naviqasiya", href: "/admin/navigation", icon: Menu },
      { name: "Tərcümələr", href: "/admin/settings/translations", icon: Languages },
      { name: "Ümumi", href: "/admin/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
  isMobile: boolean
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobile }: SidebarProps) {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = React.useState(0)

  const fetchUnread = async () => {
    try {
      const res = await fetchContactSubmissions("new", 1)
      setUnreadCount(res.unreadCount || 0)
    } catch (e) {
      console.warn("Failed to load submissions count", e)
    }
  }

  React.useEffect(() => {
    fetchUnread()

    window.addEventListener("submissions-updated", fetchUnread)
    return () => window.removeEventListener("submissions-updated", fetchUnread)
  }, [])

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isCollapsed ? 72 : 260,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "relative flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-[var(--border)] bg-[var(--color-ink-lighter)] text-white shadow-sm z-40",
        isMobile && "fixed left-0 top-0"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--primary)] text-[var(--primary-foreground)] font-bold">
            9
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap font-display font-bold tracking-tight text-white"
              >
                Admin Panel
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 px-3 py-4">
        {navigation.map((section, index) => (
          <div key={section.title} className={cn(index !== 0 && "mt-4 pt-4 border-t border-[var(--border)]/50")}>
            {!isCollapsed && (
              <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70">
                {section.title}
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
                const isActive = pathnameWithoutLocale === item.href
              
                return (
                  <li key={item.name} className="relative">
                    {/* Sliding active indicator bar */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[var(--primary)] z-20 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Sliding active background tint */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeBackground"
                        className="absolute inset-0 bg-[var(--primary)] rounded-md z-0"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Link
                      href={item.href}
                      className={cn(
                        "group relative z-10 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:outline-none",
                        isActive
                          ? "text-[var(--primary-foreground)]"
                          : "text-[#C2C2C2] hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      {/* Icon micro-animation */}
                      <motion.div
                        animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="shrink-0 relative"
                      >
                        <item.icon 
                          className={cn(
                            "h-4 w-4 transition-colors duration-200", 
                            isActive ? "text-[var(--primary-foreground)]" : "text-[#C2C2C2] group-hover:text-white"
                          )}
                        />
                        {item.showBadge && unreadCount > 0 && isCollapsed && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[var(--primary)] border-2 border-[var(--color-ink-lighter)] rounded-full" />
                        )}
                      </motion.div>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-between truncate whitespace-nowrap"
                          >
                            <span>{item.name}</span>
                            {item.showBadge && unreadCount > 0 && (
                              <span className="ml-2 bg-[var(--primary)] text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 min-w-5 text-center">
                                {unreadCount}
                              </span>
                            )}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 px-3 py-4">
        <ul className="flex flex-col gap-1">
          <li>
            <button
              className={cn(
                "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
            >
              <User className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Profil</span>}
            </button>
          </li>
          <li>
            <button
              className={cn(
                "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300",
                isCollapsed && "justify-center px-0"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>Çıxış</span>}
            </button>
          </li>
        </ul>
      </div>
    </motion.aside>
  )
}
