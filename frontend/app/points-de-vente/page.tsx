'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Building2, Boxes, PackageCheck } from 'lucide-react'
import { can, getRole } from '@/lib/auth'
import { getMockState } from '@/lib/mock-store'

interface PointDeVenteRow {
  id: number
  nom: string
  region: string
  emplacement: string
  totalStock: number
  referencesActives: number
  statut: 'Actif' | 'Inactif'
}

function buildPointsDeVenteRows(): PointDeVenteRow[] {
  const state = getMockState()

  return state.stores
    .map((store) => {
      const storeStock = state.stock.filter((stock) => stock.storeId === store.id)
      const total = storeStock.reduce((sum, row) => sum + row.normalQty + row.cabaQty, 0)
      const refs = storeStock.filter((row) => row.normalQty + row.cabaQty > 0).length
      return {
        id: store.id,
        nom: store.name,
        region: store.region,
        emplacement: store.location,
        totalStock: total,
        referencesActives: refs,
        statut: (store.status === 'inactive' ? 'Inactif' : 'Actif') as 'Actif' | 'Inactif',
      }
    })
    .sort((a, b) => b.totalStock - a.totalStock)
}

export default function PointsDeVentePage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const role = getRole()
    if (!(can(role).administer || role === 'Store Manager')) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const rows = buildPointsDeVenteRows()
  const totalAgences = rows.length
  const stockGlobal = rows.reduce((sum, row) => sum + row.totalStock, 0)
  const agencesAvecStock = rows.filter((row) => row.totalStock > 0).length

  if (!allowed) return null

  return (
    <MainLayout
      title="Points de vente"
      subtitle="Cliquez sur un magasin pour voir le detail de son stock"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Total points de vente</p>
            <Building2 size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-bold text-foreground">{totalAgences}</p>
        </Card>

        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Stock global</p>
            <Boxes size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stockGlobal}</p>
        </Card>

        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Agences avec stock</p>
            <PackageCheck size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{agencesAvecStock}</p>
        </Card>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Point de vente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Region</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Emplacement</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">References actives</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Stock total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-accent">
                    <Link href={`/points-de-vente/${row.id}`} className="hover:underline">
                      {row.nom}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.region}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.emplacement}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground">{row.referencesActives}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-accent">{row.totalStock}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.statut === 'Actif'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                    >
                      {row.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  )
}
