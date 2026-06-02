'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Building2, Boxes, PackageCheck } from 'lucide-react'
import { branches, stockItems } from '@/lib/seed-data'
import { getRole, can } from '@/lib/auth'

interface PointDeVenteRow {
  id: number
  nom: string
  emplacement: string
  totalStock: number
  referencesActives: number
  statut: 'Actif' | 'Inactif'
}

function buildPointsDeVenteRows(): PointDeVenteRow[] {
  const branchMap = new Map(branches.map((b) => [b.name, b]))
  const stockByBranch = new Map<string, { total: number; refs: Set<string> }>()

  for (const item of stockItems) {
    for (const branch of item.branches) {
      const current = stockByBranch.get(branch.name) || { total: 0, refs: new Set<string>() }
      current.total += branch.qty
      if (branch.qty > 0) {
        current.refs.add(item.partCode)
      }
      stockByBranch.set(branch.name, current)
    }
  }

  const names = new Set<string>([...branchMap.keys(), ...stockByBranch.keys()])

  return [...names]
    .map((name, index) => {
      const stock = stockByBranch.get(name)
      const branchInfo = branchMap.get(name)

      return {
        id: index + 1,
        nom: name,
        emplacement: branchInfo?.location || 'Non renseigne',
        totalStock: stock?.total || 0,
        referencesActives: stock?.refs.size || 0,
        statut: branchInfo?.status === 'inactive' ? 'Inactif' : 'Actif',
      }
    })
    .sort((a, b) => b.totalStock - a.totalStock)
}

export default function PointsDeVentePage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!can(getRole()).administer) {
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
      subtitle="Vue detaillee des agences avec leur stock total"
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Emplacement</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">References actives</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Stock total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{row.nom}</td>
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
