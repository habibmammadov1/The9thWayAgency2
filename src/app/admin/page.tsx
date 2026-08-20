"use client"

import * as React from "react"
import { 
  FileText, 
  Users, 
  FolderOpen, 
  Briefcase,
  Plus,
  PenTool,
  Image as ImageIcon,
  CheckCircle2,
  Edit,
  Settings
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/admin/ui/card"
import { Button } from "@/components/admin/ui/button"
import { motion } from "framer-motion"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

// Generate a random sparkline data
const generateSparkline = () => Array.from({ length: 10 }, (_, i) => ({ value: Math.random() * 100 + 20 }))

const stats = [
  { title: "Səhifə", value: "6", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", data: generateSparkline() },
  { title: "Komanda Üzvü", value: "12", icon: Users, color: "text-lime-500", bg: "bg-lime-500/10", data: generateSparkline() },
  { title: "Bloq Yazısı", value: "6", icon: Briefcase, color: "text-purple-500", bg: "bg-purple-500/10", data: generateSparkline() },
  { title: "Portfolio Layihəsi", value: "4", icon: FolderOpen, color: "text-orange-500", bg: "bg-orange-500/10", data: generateSparkline() },
]

const recentActivity = [
  { id: 1, action: "Ana səhifə yeniləndi", time: "2 saat əvvəl", type: "edit", icon: Edit, color: "text-blue-500" },
  { id: 2, action: "Yeni komanda üzvü əlavə edildi: Aytən", time: "5 saat əvvəl", type: "add", icon: Plus, color: "text-lime-500" },
  { id: 3, action: "Bloq yazısı dərc edildi: Rəqəmsal Marketinq", time: "1 gün əvvəl", type: "publish", icon: CheckCircle2, color: "text-purple-500" },
  { id: 4, action: "Sayt loqosu dəyişdirildi", time: "2 gün əvvəl", type: "system", icon: Settings, color: "text-gray-400" },
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Sabahınız xeyir"
  if (hour < 18) return "Günortanız xeyir"
  return "Axşamınız xeyir"
}

export default function AdminDashboard() {
  const [greeting, setGreeting] = React.useState("Xoş gəldiniz")

  React.useEffect(() => {
    setGreeting(getGreeting())
  }, [])

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Header Zone with Signature Glow */}
      <div className="relative">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-[var(--primary)]/20 rounded-full blur-[60px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tighter text-black">{greeting}, Admin 👋</h1>
          <p className="text-[var(--muted-foreground)] mt-2 font-medium">Bu, The9thway Agency üçün idarəetmə panelidir.</p>
        </div>
      </div>

      {/* Stats Zone (Container Card) */}
      <section className="bg-[var(--paper)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight">İcmal</h2>
          <div className="w-12 h-1 bg-[var(--primary)] mt-2 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden bg-white shadow-sm border border-[var(--border)] rounded-xl h-full flex flex-col justify-between p-6">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="text-5xl font-extrabold tracking-tighter text-black mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-[var(--muted-foreground)]">{stat.title}</div>
                </div>
                
                <div className="flex justify-end mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                  <div className={cn("p-1.5 rounded-md", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
              </div>
              
              {/* Sparkline Background - Smaller & muted */}
              <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stat.data}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="currentColor" 
                      strokeWidth={1.5} 
                      dot={false} 
                      className={stat.color}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Activity Zone (Different tone) */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight">Son Fəaliyyət və Keçidlər</h2>
          <div className="w-12 h-1 bg-[var(--primary)] mt-2 rounded-full" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-6 uppercase tracking-wider">Son Fəaliyyət</h3>
            <div className="space-y-6">
              {recentActivity.map((activity, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  key={activity.id} 
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5">
                    <activity.icon className={cn("h-5 w-5", activity.color)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-6 uppercase tracking-wider">Sürətli Keçidlər</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="justify-start h-12 bg-[var(--paper)]/50 border-dashed hover:bg-[var(--accent)] transition-colors">
                <PenTool className="mr-3 h-4 w-4 text-[var(--muted-foreground)]" />
                Bloq Yaz
              </Button>
              <Button variant="outline" className="justify-start h-12 bg-[var(--paper)]/50 border-dashed hover:bg-[var(--accent)] transition-colors">
                <Plus className="mr-3 h-4 w-4 text-[var(--muted-foreground)]" />
                Komanda Üzvü Əlavə Et
              </Button>
              <Button variant="outline" className="justify-start h-12 bg-[var(--paper)]/50 border-dashed hover:bg-[var(--accent)] transition-colors">
                <ImageIcon className="mr-3 h-4 w-4 text-[var(--muted-foreground)]" />
                Brendinq Parametrləri
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
