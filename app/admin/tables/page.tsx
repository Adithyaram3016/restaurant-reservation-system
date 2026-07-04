'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check, X, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface TableItem {
  _id: string
  tableNumber: number
  capacity: number
}

interface AddForm {
  tableNumber: string
  capacity: string
}

export default function ManageTablesPage() {
  const [tables, setTables] = useState<TableItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ tableNumber: string; capacity: string }>({ tableNumber: '', capacity: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<AddForm>({ tableNumber: '', capacity: '' })
  const [addErrors, setAddErrors] = useState<{ tableNumber?: string; capacity?: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadTables() {
      try {
        const data = await api.tables.list()
        setTables(data)
      } catch (error) {
        toast.error('Could not load tables.')
      } finally {
        setLoading(false)
      }
    }
    loadTables()
  }, [])

  function startEdit(t: TableItem) {
    setEditId(t._id)
    setEditForm({ tableNumber: String(t.tableNumber), capacity: String(t.capacity) })
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    try {
      const result = await api.tables.update(editId, {
        tableNumber: Number(editForm.tableNumber),
        capacity: Number(editForm.capacity),
      })
      setTables((prev) =>
        prev.map((t) => t._id === editId ? result.table : t).sort((a, b) => a.tableNumber - b.tableNumber)
      )
      setEditId(null)
      toast.success('Table updated.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update table.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTable(id: string) {
    try {
      await api.tables.delete(id)
      setTables((prev) => prev.filter((t) => t._id !== id))
      setDeleteId(null)
      toast.success('Table removed.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete table.')
    }
  }

  function validateAdd() {
    const e: { tableNumber?: string; capacity?: string } = {}
    if (!addForm.tableNumber) e.tableNumber = 'Table number is required.'
    else if (tables.some((t) => t.tableNumber === Number(addForm.tableNumber))) e.tableNumber = 'Table number already exists.'
    if (!addForm.capacity) e.capacity = 'Capacity is required.'
    else if (Number(addForm.capacity) < 1 || Number(addForm.capacity) > 20) e.capacity = 'Capacity must be between 1 and 20.'
    setAddErrors(e)
    return Object.keys(e).length === 0
  }

  async function addTable() {
    if (!validateAdd()) return
    setSaving(true)
    try {
      const result = await api.tables.create({
        tableNumber: Number(addForm.tableNumber),
        capacity: Number(addForm.capacity),
      })
      setTables((prev) => [...prev, result.table].sort((a, b) => a.tableNumber - b.tableNumber))
      setAddForm({ tableNumber: '', capacity: '' })
      setShowAddForm(false)
      toast.success(`Table ${addForm.tableNumber} added.`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add table.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Tables</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tables.length} tables total</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add table
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Tables',   value: tables.length,                      color: 'text-primary',     bg: 'bg-primary/5 border-primary/20'     },
          { label: 'Avg. Capacity',  value: tables.length > 0 ? (tables.reduce((s, t) => s + t.capacity, 0) / tables.length).toFixed(1) : '0', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border px-4 py-3 ${bg}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Add table form */}
      {showAddForm && (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-foreground mb-4">Add New Table</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Table Number</label>
              <input
                type="number"
                value={addForm.tableNumber}
                onChange={(e) => { setAddForm((p) => ({ ...p, tableNumber: e.target.value })); setAddErrors((p) => ({ ...p, tableNumber: undefined })) }}
                placeholder="e.g. 13"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
              {addErrors.tableNumber && <p className="text-xs text-destructive">{addErrors.tableNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Seating Capacity</label>
              <input
                type="number"
                value={addForm.capacity}
                onChange={(e) => { setAddForm((p) => ({ ...p, capacity: e.target.value })); setAddErrors((p) => ({ ...p, capacity: undefined })) }}
                placeholder="e.g. 4"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
              {addErrors.capacity && <p className="text-xs text-destructive">{addErrors.capacity}</p>}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={addTable} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Table
            </Button>
            <Button variant="outline" onClick={() => { setShowAddForm(false); setAddErrors({}) }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Table grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((t) =>
          editId === t._id ? (
            /* Edit card */
            <div key={t._id} className="bg-accent border-2 border-primary rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Editing</p>
              <div className="space-y-2">
                <input
                  type="number"
                  value={editForm.tableNumber}
                  onChange={(e) => setEditForm((p) => ({ ...p, tableNumber: e.target.value }))}
                  placeholder="Table #"
                  className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm((p) => ({ ...p, capacity: e.target.value }))}
                  placeholder="Capacity"
                  className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Normal card */
            <div key={t._id} className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Table</p>
                  <p className="text-2xl font-bold text-foreground leading-none">{t.tableNumber}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                    aria-label="Edit table"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  {deleteId === t._id ? (
                    <button
                      onClick={() => deleteTable(t._id)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      aria-label="Confirm delete"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteId(t._id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      aria-label="Delete table"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span>{t.capacity} seats</span>
              </div>

              {deleteId === t._id && (
                <div className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5">
                  Click ✓ again to confirm.{' '}
                  <button onClick={() => setDeleteId(null)} className="underline font-medium">Undo</button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
