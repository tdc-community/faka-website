import React, { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  X,
  Loader2,
} from "lucide-react"
import { api } from "@/lib/api"

// ---- Collapsible Section ----

function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-sm border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="font-serif text-base font-bold uppercase tracking-wide text-foreground">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="border-t border-border px-5 py-5">{children}</div>}
    </div>
  )
}

// ---- Input helpers ----

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-sm border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}

// ---- Confirm Dialog ----

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-sm border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-bold uppercase text-foreground">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Отказ
          </button>
          <button
            onClick={onConfirm}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Main Admin Page ----

const AVAILABLE_PERMISSIONS = [
  { id: "manage_magazine", label: "Управление на Списание (Табло)" },
  { id: "manage_users", label: "Управление на Потребители" },
  { id: "manage_roles", label: "Управление на Роли" },
  { id: "manage_settings", label: "Глобални Конфигурации" },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "settings">("users")

  // Roles State
  const [roles, setRoles] = useState<any[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleColor, setNewRoleColor] = useState("#ff0000")
  const [newRolePerms, setNewRolePerms] = useState<string[]>([])

  // Users State
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [managingUser, setManagingUser] = useState<any | null>(null)

  // Settings State
  const [settings, setSettings] = useState<any | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  // Settings Handlers
  function updateSetting(key: string, value: any) {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
    setSettingsSaved(false)
  }

  async function handleSaveSettings() {
    if (!settings) return
    setSettingsLoading(true)
    try {
      await api.updateSettings(settings)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2000)
    } catch {
      alert("Failed to save settings")
    } finally {
      setSettingsLoading(false)
    }
  }

  const refreshRoles = useCallback(async () => {
    setLoadingRoles(true)
    const data = await api.getRoles()
    if (!("error" in data)) setRoles(data)
    setLoadingRoles(false)
  }, [])

  const refreshUsers = useCallback(async () => {
    setLoadingUsers(true)
    const data = await api.getUsers()
    if (!("error" in data)) setUsers(data)
    setLoadingUsers(false)
  }, [])

  useEffect(() => {
    refreshRoles()
    refreshUsers()

    // Fetch global settings
    api.getSettings().then((data) => {
      if (!("error" in data)) setSettings(data)
    }).catch(console.error)
  }, [refreshRoles, refreshUsers])

  // Handlers
  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault()
    if (!newRoleName) return

    const permissionsJson = JSON.stringify(newRolePerms)

    await api.createRole({ name: newRoleName, color: newRoleColor, permissions: permissionsJson })
    setNewRoleName("")
    setNewRolePerms([])
    refreshRoles()
  }

  async function handleDeleteRole(id: number) {
    if (confirm("Сигурни ли сте, че искате да изтриете тази роля?")) {
      await api.deleteRole(id)
      refreshRoles()
      refreshUsers()
    }
  }

  async function toggleUserRole(userId: number, roleId: number, currentRoleIds: number[]) {
    const newRoleIds = currentRoleIds.includes(roleId)
      ? currentRoleIds.filter(id => id !== roleId)
      : [...currentRoleIds, roleId]

    await api.updateUserRoles(userId, newRoleIds)
    refreshUsers()
    // Update local managing user state if open
    if (managingUser && managingUser.id === userId) {
      setManagingUser({
        ...managingUser,
        roles: newRoleIds.map(id => roles.find(r => r.id === id)).filter(Boolean)
      })
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-7 w-1.5 rounded-sm bg-primary" />
              <div className="h-5 w-1.5 rounded-sm bg-primary/60" />
            </div>
            <span className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
              Faka<span className="text-primary">Performance</span>
              <span className="ml-2 text-xs font-normal normal-case tracking-normal text-muted-foreground">
                Супер Админ
              </span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="/staff"
              className="text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              Табло на Екипа
            </a>
            <a
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Eye className="h-4 w-4" />
              Виж Сайта
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-border pb-px text-sm font-bold uppercase tracking-wide">
          <button
            onClick={() => setActiveTab("users")}
            className={`border-b-2 py-2 px-1 transition-colors ${activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Потребители
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`border-b-2 py-2 px-1 transition-colors ${activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Управление на Роли
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`border-b-2 py-2 px-1 transition-colors ${activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Настройки
          </button>
        </div>

        {/* --- USERS TAB --- */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
                Директория на Потребителите
              </h2>
            </div>

            <div className="overflow-hidden rounded-sm border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-secondary/30 text-xs font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Потребител</th>
                      <th className="px-6 py-4">Баланс</th>
                      <th className="px-6 py-4">Активност</th>
                      <th className="px-6 py-4">Роли</th>
                      <th className="px-6 py-4 text-right">Управление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-serif uppercase items-center">
                          Няма намерени потребители
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-secondary/20">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            #{user.id}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold">{user.username}</span>
                          </td>
                          <td className="px-6 py-4 text-primary font-bold">
                            ${user.balance}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {user._count?.entries || 0} Коли | {user._count?.votes || 0} Гласа
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((r: any) => (
                                  <span
                                    key={r.id}
                                    style={{ backgroundColor: `${r.color}20`, color: r.color, borderColor: `${r.color}40` }}
                                    className="rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                  >
                                    {r.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-muted-foreground uppercase">Няма</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => setManagingUser(managingUser?.id === user.id ? null : user)}
                              className="text-xs font-bold uppercase text-primary hover:underline"
                            >
                              Роли
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Role Assignment Panel */}
            {managingUser && (
              <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold uppercase text-foreground">
                      Управление на Роли: {managingUser.username}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase mt-1">
                      Изберете ролите, които искате да присвоите на този потребител.
                    </p>
                  </div>
                  <button onClick={() => setManagingUser(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {roles.map(role => {
                    const hasRole = managingUser.roles?.some((r: any) => r.id === role.id)
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleUserRole(managingUser.id, role.id, managingUser.roles?.map((r: any) => r.id) || [])}
                        style={{
                          backgroundColor: hasRole ? `${role.color}20` : 'transparent',
                          borderColor: hasRole ? role.color : 'var(--border)',
                          color: hasRole ? role.color : 'inherit'
                        }}
                        className={`flex items-center gap-2 border rounded-sm px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:bg-secondary`}
                      >
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                      </button>
                    )
                  })}
                  {roles.length === 0 && (
                    <p className="text-sm text-muted-foreground">Първо създайте роли в раздела "Управление на Роли".</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ROLES TAB --- */}
        {activeTab === "roles" && (
          <div className="grid gap-8 lg:grid-cols-3">

            {/* Create Role Form */}
            <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-6 font-serif text-xl font-bold uppercase text-foreground">
                Нова Роля
              </h2>
              <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
                <TextInput
                  label="Име на Ролята (напр. Staff)"
                  value={newRoleName}
                  onChange={setNewRoleName}
                  placeholder="Въведете име"
                />
                <div>
                  <FieldLabel>Цвят (HEX)</FieldLabel>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newRoleColor}
                      onChange={(e) => setNewRoleColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-sm bg-secondary border border-border p-1"
                    />
                    <input
                      type="text"
                      value={newRoleColor}
                      onChange={(e) => setNewRoleColor(e.target.value)}
                      className="flex-1 rounded-sm border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase font-mono"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Разрешения</FieldLabel>
                  <div className="mt-2 space-y-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-sm border ${newRolePerms.includes(perm.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border bg-secondary"
                            }`}
                        >
                          {newRolePerms.includes(perm.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={newRolePerms.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRolePerms([...newRolePerms, perm.id])
                            } else {
                              setNewRolePerms(newRolePerms.filter((p) => p !== perm.id))
                            }
                          }}
                        />
                        <span className="text-sm text-foreground">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newRoleName}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Създай Роля
                </button>
              </form>
            </div>

            {/* Roles List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-serif text-xl font-bold uppercase text-foreground">
                Активни Роли
              </h2>

              {loadingRoles ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : roles.length === 0 ? (
                <div className="rounded-sm border border-dashed border-border p-10 text-center">
                  <p className="text-sm uppercase text-muted-foreground">Няма създадени роли.</p>
                </div>
              ) : (
                roles.map(role => (
                  <div key={role.id} className="flex items-center justify-between rounded-sm border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm font-bold text-lg"
                        style={{ backgroundColor: `${role.color}20`, color: role.color }}
                      >
                        {role.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold uppercase tracking-wider" style={{ color: role.color }}>
                          {role.name}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">
                          {role._count?.users || 0} Потребители с тази роля
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate max-w-xs">
                          {(() => {
                            try {
                              const perms = JSON.parse(role.permissions)
                              return Array.isArray(perms) && perms.length > 0
                                ? `Разрешения: ${perms.join(', ')}`
                                : 'Няма Разрешения'
                            } catch (e) {
                              return role.permissions ? `Разрешения: ${role.permissions}` : 'Няма Разрешения'
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Изтрий роля"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold uppercase text-foreground">
              Глобална Конфигурация
            </h2>
            {settings ? (
              <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-2">
                  <NumberInput
                    label="Такса за Участие в Конкурса ($)"
                    value={settings.entryFee || 1000}
                    onChange={(v) => updateSetting("entryFee", v)}
                    min={0}
                  />
                  <NumberInput
                    label="Текуща Активна Седмица"
                    value={settings.currentWeek || 1}
                    onChange={(v) => updateSetting("currentWeek", v)}
                    min={1}
                  />
                  <TextInput
                    label="API Ключ (За Уебхукове)"
                    value={settings.apiKey || ""}
                    onChange={(v) => updateSetting("apiKey", v)}
                  />
                  <TextInput
                    label="Уебхук URL за Теглене"
                    value={settings.withdrawUrl || ""}
                    onChange={(v) => updateSetting("withdrawUrl", v)}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsLoading}
                    className="flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {settingsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (settingsSaved ? <span className="flex items-center gap-1 text-green-700">Запазено!</span> : "Запази Настройки")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-8 border border-border rounded-sm bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
