"use client"

import * as React from "react"
import { useAdminAuth } from "@/contexts/AdminAuthContext"
import { useToast } from "@/components/admin/ui/use-toast"
import { Button } from "@/components/admin/ui/button"
import { Edit2, Plus, Trash2, Shield, User } from "lucide-react"
import { CreateUserDialog } from "@/components/admin/settings/users/CreateUserDialog"
import { EditUserDialog } from "@/components/admin/settings/users/EditUserDialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/admin/ui/alert-dialog"

interface AdminUserRow {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "İndi"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} dəqiqə əvvəl`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} saat əvvəl`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays} gün əvvəl`
  
  return new Intl.DateTimeFormat("az-AZ").format(date)
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth()
  const { toast } = useToast()
  
  const [users, setUsers] = React.useState<AdminUserRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  const [showCreate, setShowCreate] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<AdminUserRow | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<AdminUserRow | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/admin/users", {
        credentials: "include"
      })
      if (!res.ok) throw new Error("API xətası")
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      toast({ title: "Xəta", description: "İstifadəçilər yüklənə bilmədi", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      const res = await fetch(`http://localhost:4000/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (!res.ok) {
        const data = await res.json().catch(()=>({}))
        throw new Error(data.error || "İstifadəçi silinə bilmədi")
      }
      toast({ title: "İstifadəçi silindi", variant: "success" })
      fetchUsers()
    } catch (error: any) {
      toast({ title: "Xəta", description: error.message, variant: "destructive" })
    } finally {
      setDeletingUser(null)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Yüklənir...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">İstifadəçilər</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Sistemə giriş hüququ olan idarəçilər.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni İstifadəçi
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--secondary)]/50 text-[var(--muted-foreground)]">
            <tr>
              <th className="px-6 py-4 font-semibold">İstifadəçi</th>
              <th className="px-6 py-4 font-semibold">Rol</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Son Giriş</th>
              <th className="px-6 py-4 font-semibold text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map(user => {
              const isMe = currentUser?.id === user.id
              
              return (
                <tr key={user.id} className="hover:bg-[var(--secondary)]/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--secondary)] text-[var(--foreground)] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)] flex items-center gap-2">
                          {user.name}
                          {isMe && <span className="text-[10px] bg-[var(--foreground)] text-[var(--background)] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Siz</span>}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--secondary)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)]">
                      {user.role === 'admin' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.isActive 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}></span>
                      {user.isActive ? "Aktiv" : "Deaktiv"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--muted-foreground)]">
                    {user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Heç vaxt"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)} title="Redaktə et">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setDeletingUser(user)} 
                        title={isMe ? "Öz hesabınızı silə bilməzsiniz" : "Sil"}
                        disabled={isMe}
                        className={isMe ? "opacity-30" : "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--muted-foreground)]">
                  İstifadəçi tapılmadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateUserDialog 
          onClose={() => setShowCreate(false)} 
          onSuccess={() => {
            setShowCreate(false)
            fetchUsers()
          }}
          onToast={toast}
        />
      )}

      {editingUser && (
        <EditUserDialog 
          user={editingUser}
          isCurrentUser={currentUser?.id === editingUser.id}
          onClose={() => setEditingUser(null)} 
          onSuccess={() => {
            setEditingUser(null)
            fetchUsers()
          }}
          onToast={toast}
        />
      )}

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İstifadəçini Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Əminsiniz? &quot;{deletingUser?.name}&quot; adlı istifadəçi tamamilə silinəcək və bu əməliyyatı geri qaytarmaq mümkün deyil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Bəli, Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

