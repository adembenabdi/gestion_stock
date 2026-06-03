'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { getRole, getStoreId } from '@/lib/auth'
import { getMockState } from '@/lib/mock-store'
import type { UserRole } from '@/lib/seed-data'

export default function HistoryPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole>('Seller')
  const [movementRows, setMovementRows] = useState<Array<{
    id: number
    createdAt: string
    type: string
    productRef: string
    productName: string
    quantity: number
    storeName: string
    byUser: string
    note: string
  }>>([])
  const [auditRows, setAuditRows] = useState<Array<{ id: number; createdAt: string; actor: string; action: string; details: string }>>([])

  useEffect(() => {
    const currentRole = getRole()
    const currentStoreId = getStoreId()
    const state = getMockState()
    setRole(currentRole)

    const scopedMovements = currentRole === 'Administrator'
      ? state.movements
      : state.movements.filter((x) => x.storeId === currentStoreId)

    const movementView = scopedMovements.map((m) => {
      const product = state.products.find((p) => p.id === m.productId)
      const store = state.stores.find((s) => s.id === m.storeId)
      return {
        id: m.id,
        createdAt: m.createdAt,
        type: m.type,
        productRef: product?.reference || 'INCONNU',
        productName: product?.name || 'Produit inconnu',
        quantity: m.quantity,
        storeName: store?.name || 'Magasin inconnu',
        byUser: m.byUser,
        note: m.note,
      }
    })

    const scopedAudit = currentRole === 'Administrator'
      ? state.audit
      : state.audit.filter((a) => a.details.toLowerCase().includes((state.stores.find((s) => s.id === currentStoreId)?.name || '').toLowerCase()))

    setMovementRows(movementView)
    setAuditRows(scopedAudit)
  }, [])

  const filteredMovements = movementRows.filter((m) => {
    const q = search.toLowerCase()
    return q.length === 0
      || m.productName.toLowerCase().includes(q)
      || m.productRef.toLowerCase().includes(q)
      || m.type.toLowerCase().includes(q)
      || m.note.toLowerCase().includes(q)
  })

  const filteredAudit = auditRows.filter((a) => {
    const q = search.toLowerCase()
    return q.length === 0
      || a.action.toLowerCase().includes(q)
      || a.actor.toLowerCase().includes(q)
      || a.details.toLowerCase().includes(q)
  })

  return (
    <MainLayout title="Audit et tracabilite" subtitle={`Portee du role: ${role}`}>
      <Card className="bg-card border border-border p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Rechercher dans les mouvements et l audit"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Mouvements de stock</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date et heure</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produit</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Qte</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Magasin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Note</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{new Date(movement.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground">{movement.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{movement.productName}</p>
                      <p className="text-xs text-accent">{movement.productRef}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-foreground">{movement.quantity}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{movement.storeName}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{movement.byUser}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{movement.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-card border border-border overflow-hidden mt-6">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Journal d audit</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date et heure</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Acteur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudit.map((entry) => (
                <tr key={entry.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{entry.actor}</td>
                  <td className="px-6 py-4 text-sm text-accent font-semibold">{entry.action}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  )
}
