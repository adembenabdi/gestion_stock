'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, AlertCircle, Package } from 'lucide-react'
import Link from 'next/link'
import { getRole, can } from '@/lib/auth'
import type { UserRole } from '@/lib/seed-data'

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole>('Viewer')

  useEffect(() => {
    setRole(getRole())
  }, [])

  const caps = can(role)

  // Mock data
  const stats = [
    {
      label: 'Total des pieces',
      value: '2,847',
      icon: <Package className="text-accent" size={24} />,
      change: '+12%',
      color: 'bg-accent/10',
    },
    {
      label: 'Articles a stock faible',
      value: '34',
      icon: <AlertCircle className="text-destructive" size={24} />,
      change: '-5%',
      color: 'bg-destructive/10',
    },
    {
      label: 'Total des agences',
      value: '8',
      icon: <BarChart3 className="text-primary" size={24} />,
      change: '+2%',
      color: 'bg-primary/10',
    },
    {
      label: 'Mouvements mensuels',
      value: '1,234',
      icon: <TrendingUp className="text-primary" size={24} />,
      change: '+18%',
      color: 'bg-primary/10',
    },
  ]

  const recentMovements = [
    { id: 1, part: 'Carburateur', type: 'Entree', quantity: 50, branch: 'Agence A', date: '2024-06-02' },
    { id: 2, part: 'Filtre a huile', type: 'Sortie', quantity: 100, branch: 'Agence B', date: '2024-06-02' },
    { id: 3, part: "Bougies d'allumage", type: 'Entree', quantity: 200, branch: 'Agence C', date: '2024-06-01' },
    { id: 4, part: 'Plaquettes de frein', type: 'Sortie', quantity: 75, branch: 'Agence A', date: '2024-06-01' },
  ]

  return (
    <MainLayout title="Tableau de bord" subtitle="Bienvenue. Voici un apercu de vos stocks.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs font-semibold text-accent">{stat.change}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent Movements & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <Card className="lg:col-span-2 bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Mouvements recents</h2>
          <div className="space-y-4">
            {recentMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between p-4 rounded-lg bg-sidebar hover:bg-sidebar/80 transition-colors border border-sidebar-border"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{movement.part}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {movement.branch} • {movement.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      movement.type === 'Entree'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {movement.type}
                  </span>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">
                    {movement.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Actions rapides</h2>
          <div className="space-y-3">
            <Link href="/search">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                Rechercher une piece
              </Button>
            </Link>
            {caps.recordOperations && (
              <Link href="/operations">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-sidebar">
                  Ajouter un mouvement
                </Button>
              </Link>
            )}
            {caps.manageInventory && (
              <Link href="/inventory">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-sidebar">
                  Gerer le catalogue
                </Button>
              </Link>
            )}
            {caps.importExcel && (
              <Link href="/import">
                <Button variant="outline" className="w-full border-border text-foreground hover:bg-sidebar">
                  Importer Excel
                </Button>
              </Link>
            )}
            <Link href="/history">
              <Button variant="outline" className="w-full border-border text-foreground hover:bg-sidebar">
                Voir l historique
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
