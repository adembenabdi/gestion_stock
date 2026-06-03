'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, AlertCircle, Package, Wallet } from 'lucide-react'
import { getRole, getStoreId } from '@/lib/auth'
import { computeReturnedTotal, computeInvoiceTotal, getFinancialSummary, getMockState } from '@/lib/mock-store'
import type { UserRole } from '@/lib/seed-data'

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('Seller')
  const [storeName, setStoreName] = useState('Magasin courant')
  const [cards, setCards] = useState<Array<{ label: string; value: string; color: string; icon: React.ReactNode }>>([])
  const [recentEvents, setRecentEvents] = useState<Array<{ id: number; title: string; subtitle: string; badge: string }>>([])

  useEffect(() => {
    const currentRole = getRole()
    const currentStoreId = getStoreId()
    const state = getMockState()

    setRole(currentRole)

    const selectedStore = state.stores.find((s) => s.id === currentStoreId)
    setStoreName(selectedStore?.name || 'Tous les magasins')

    const financial = getFinancialSummary(currentRole, currentStoreId)
    const scopedInvoices = currentRole === 'Administrator'
      ? state.invoices
      : state.invoices.filter((x) => x.storeId === currentStoreId)

    const scopedStock = currentRole === 'Administrator'
      ? state.stock
      : state.stock.filter((x) => x.storeId === currentStoreId)

    const lowStock = scopedStock.filter((x) => x.normalQty + x.cabaQty > 0 && x.normalQty + x.cabaQty < 5).length
    const totalQty = scopedStock.reduce((sum, x) => sum + x.normalQty + x.cabaQty, 0)

    setCards([
      {
        label: 'Unites disponibles',
        value: String(totalQty),
        color: 'bg-primary/10',
        icon: <Package className="text-primary" size={24} />,
      },
      {
        label: 'Lignes en stock faible',
        value: String(lowStock),
        color: 'bg-destructive/10',
        icon: <AlertCircle className="text-destructive" size={24} />,
      },
      {
        label: 'Ventes (DZD)',
        value: financial.sales.toLocaleString(),
        color: 'bg-accent/10',
        icon: <TrendingUp className="text-accent" size={24} />,
      },
      {
        label: 'Net (DZD)',
        value: financial.net.toLocaleString(),
        color: 'bg-primary/10',
        icon: <Wallet className="text-primary" size={24} />,
      },
    ])

    const invoiceEvents = scopedInvoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      title: `${inv.invoiceNumber} - ${computeInvoiceTotal(inv).toLocaleString()} DZD`,
      subtitle: `${new Date(inv.createdAt).toLocaleDateString()} - Retours ${computeReturnedTotal(inv).toLocaleString()} DZD`,
      badge: inv.status,
    }))

    const auditEvents = state.audit.slice(0, 3).map((a) => ({
      id: 1000 + a.id,
      title: a.action,
      subtitle: `${a.actor} - ${a.details}`,
      badge: 'AUDIT',
    }))

    setRecentEvents([...invoiceEvents, ...auditEvents].slice(0, 6))
  }, [])

  return (
    <MainLayout title="Tableau de bord" subtitle={`Role: ${role} - Perimetre: ${storeName}`}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((stat, index) => (
          <Card key={index} className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <BarChart3 className="text-muted-foreground" size={16} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Evenements recents</h2>
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg bg-sidebar hover:bg-sidebar/80 transition-colors border border-sidebar-border"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.subtitle}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent">{event.badge}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
