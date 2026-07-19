'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, ShieldAlert, ShieldCheck, Trash2, UserPlus } from 'lucide-react'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { StatefulButton } from '@/components/motion/button/stateful'
import { Button } from '@/components/motion/button/base'
import ConfirmDialog, { type ConfirmState } from '@/app/dashboard/confirm-dialog'

interface AdminUser {
  _id: string
  name: string
  email: string
  phone: string
  gender: 'male' | 'female' | 'prefer not to say'
  dateOfBirth: string
  role: 'user' | 'admin'
  status: 'active' | 'suspended'
  createdAt: string
}

function toDateInput(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const EMPTY_ADD = {
  name: '', email: '', phone: '', gender: 'male',
  dateOfBirth: '', password: '', role: 'user',
}

export default function UsersContent() {
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')

  // Detail / edit modal
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', gender: 'male', dateOfBirth: '', role: 'user' })
  const [modalError, setModalError] = useState('')

  // Add-user modal
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_ADD)
  const [addError, setAddError] = useState('')
  const [addState, setAddState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Confirmation gate (shared for save / suspend / delete)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, query])

  // ── Open a user's detail modal ──────────────────────────────────────────────
  function openUser(u: AdminUser) {
    setSelected(u)
    setModalError('')
    setEditForm({
      name: u.name, phone: u.phone, gender: u.gender,
      dateOfBirth: toDateInput(u.dateOfBirth), role: u.role,
    })
  }

  // ── Run a confirmed action, keeping the confirm dialog open until it resolves ─
  async function runConfirm(state: ConfirmState) {
    setConfirm(state)
  }
  async function handleConfirm() {
    if (!confirm) return
    setConfirmBusy(true)
    try {
      await confirm.onConfirm()
    } finally {
      setConfirmBusy(false)
      setConfirm(null)
    }
  }

  // ── Save edits ──────────────────────────────────────────────────────────────
  function requestSave() {
    if (!selected) return
    setModalError('')
    runConfirm({
      title: 'Save changes?',
      description: `Update the profile for "${selected.name}". This overwrites their current details.`,
      actionLabel: 'Save changes',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${selected._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        })
        const data = await res.json()
        if (!res.ok) { setModalError(data.error || 'Update failed.'); return }
        setUsers((prev) => prev.map((u) => (u._id === selected._id ? { ...u, ...data.user } : u)))
        setSelected(null)
      },
    })
  }

  // ── Suspend / reactivate ─────────────────────────────────────────────────────
  function requestToggleStatus() {
    if (!selected) return
    const next = selected.status === 'suspended' ? 'active' : 'suspended'
    runConfirm({
      title: next === 'suspended' ? 'Suspend this user?' : 'Reactivate this user?',
      description: next === 'suspended'
        ? `"${selected.name}" will be blocked from logging in until reactivated.`
        : `"${selected.name}" will be able to log in again.`,
      actionLabel: next === 'suspended' ? 'Suspend' : 'Reactivate',
      destructive: next === 'suspended',
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${selected._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        })
        const data = await res.json()
        if (!res.ok) { setModalError(data.error || 'Update failed.'); return }
        setUsers((prev) => prev.map((u) => (u._id === selected._id ? { ...u, status: next } : u)))
        setSelected((s) => (s ? { ...s, status: next } : s))
      },
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  function requestDelete() {
    if (!selected) return
    runConfirm({
      title: 'Delete this user?',
      description: `"${selected.name}" will be permanently removed. This cannot be undone.`,
      actionLabel: 'Delete user',
      destructive: true,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${selected._id}`, { method: 'DELETE' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) { setModalError(data.error || 'Delete failed.'); return }
        setUsers((prev) => prev.filter((u) => u._id !== selected._id))
        setSelected(null)
      },
    })
  }

  // ── Add user ────────────────────────────────────────────────────────────────
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddState('loading')
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || 'Failed to create user.')
        setAddState('error')
        setTimeout(() => setAddState('idle'), 2000)
        return
      }
      setUsers((prev) => [data.user, ...prev])
      setAddState('success')
      setTimeout(() => {
        setAddOpen(false)
        setAddForm(EMPTY_ADD)
        setAddState('idle')
      }, 800)
    } catch {
      setAddError('Network error. Please try again.')
      setAddState('error')
      setTimeout(() => setAddState('idle'), 2000)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} total · click a user to manage
          </p>
        </div>
        <Button variant="primary" size="md" ripple onClick={() => { setAddForm(EMPTY_ADD); setAddError(''); setAddOpen(true) }}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add user
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Empty className="border border-dashed min-h-48">
          <EmptyHeader>
            <EmptyTitle>No users found</EmptyTitle>
            <EmptyDescription>Try a different search, or add a new user.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u._id}
                  onClick={() => openUser(u)}
                  className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.role === 'admin'
                      ? <Badge>Admin</Badge>
                      : <Badge variant="outline">User</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    {u.status === 'suspended'
                      ? <Badge variant="destructive"><ShieldAlert className="mr-1 h-3 w-3" />Suspended</Badge>
                      : <Badge variant="secondary">Active</Badge>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── User detail / edit modal ─────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.name}
                  {selected.status === 'suspended' && (
                    <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>{selected.email} · joined {fmtDate(selected.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="u-name">Name</Label>
                  <Input id="u-name" value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-phone">Phone</Label>
                  <Input id="u-phone" value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="u-gender">Gender</Label>
                    <NativeSelect id="u-gender" value={editForm.gender}
                      onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}>
                      <NativeSelectOption value="male">Male</NativeSelectOption>
                      <NativeSelectOption value="female">Female</NativeSelectOption>
                      <NativeSelectOption value="prefer not to say">Prefer not to say</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="u-dob">Date of birth</Label>
                    <Input id="u-dob" type="date" value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u-role">Role</Label>
                  <NativeSelect id="u-role" value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}>
                    <NativeSelectOption value="user">User</NativeSelectOption>
                    <NativeSelectOption value="admin">Admin</NativeSelectOption>
                  </NativeSelect>
                </div>

                {modalError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{modalError}</p>
                )}
              </div>

              <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" ripple onClick={requestToggleStatus}>
                    {selected.status === 'suspended'
                      ? <><ShieldCheck className="mr-1.5 h-4 w-4" />Reactivate</>
                      : <><ShieldAlert className="mr-1.5 h-4 w-4" />Suspend</>}
                  </Button>
                  <Button
                    variant="outline" size="sm" ripple
                    className="text-destructive hover:text-destructive"
                    onClick={requestDelete}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />Delete
                  </Button>
                </div>
                <Button variant="primary" size="sm" ripple onClick={requestSave}>
                  Save changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add-user modal ───────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (addState !== 'loading') setAddOpen(open) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />Add a user</DialogTitle>
            <DialogDescription>Create a new account. They can log in with the password you set.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-name">Name</Label>
              <Input id="a-name" value={addForm.name} required
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-email">Email</Label>
                <Input id="a-email" type="email" value={addForm.email} required
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-phone">Phone</Label>
                <Input id="a-phone" placeholder="01XXXXXXXXX" value={addForm.phone} required
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-gender">Gender</Label>
                <NativeSelect id="a-gender" value={addForm.gender}
                  onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value }))}>
                  <NativeSelectOption value="male">Male</NativeSelectOption>
                  <NativeSelectOption value="female">Female</NativeSelectOption>
                  <NativeSelectOption value="prefer not to say">Prefer not to say</NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-dob">Date of birth</Label>
                <Input id="a-dob" type="date" value={addForm.dateOfBirth} required
                  onChange={(e) => setAddForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-password">Password</Label>
                <Input id="a-password" type="password" value={addForm.password} required minLength={6}
                  onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-role">Role</Label>
                <NativeSelect id="a-role" value={addForm.role}
                  onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}>
                  <NativeSelectOption value="user">User</NativeSelectOption>
                  <NativeSelectOption value="admin">Admin</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            {addError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{addError}</p>
            )}

            <DialogFooter>
              <StatefulButton
                type="submit"
                state={addState}
                size="md"
                loadingText="Creating…"
                successText="User created!"
                errorText="Try again"
                className="rounded-md"
              >
                Create user
              </StatefulButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation gate ────────────────────────────────────────────────── */}
      <ConfirmDialog
        confirm={confirm ? { ...confirm, onConfirm: handleConfirm } : null}
        loading={confirmBusy}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
