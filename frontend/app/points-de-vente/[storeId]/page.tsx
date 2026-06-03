'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { can, getRole, getStoreId } from '@/lib/auth'
import { getMockState } from '@/lib/mock-store'

export default function PointDeVenteDetailPage() {
  const router = useRouter()
  const params = useParams<{ storeId: string }>()
  const [allowed, setAllowed] = useState(false)

  const state = useMemo(() => getMockState(), [])
  const storeId = Number(params.storeId)
  const role = getRole()
  const currentStoreId = getStoreId()

  useEffect(() => {
    if (!Number.isFinite(storeId)) {
      router.replace('/points-de-vente')
      return
    }

    if (can(role).administer || (role === 'Store Manager' && currentStoreId === storeId)) {
      setAllowed(true)
      return
    }

    if (role === 'Store Manager') {
      router.replace(`/points-de-vente/${currentStoreId || ''}`)
      return
    }

    router.replace('/dashboard')
  }, [router, role, currentStoreId, storeId])

  const store = state.stores.find((s) => s.id === storeId)

  const stockRows = state.stock
    .filter((row) => row.storeId === storeId)
    .map((row) => {
      const product = state.products.find((p) => p.id === row.productId)
      const total = row.normalQty + row.cabaQty
      return {
        productName: product?.name || 'Produit inconnu',
        reference: product?.reference || 'N/A',
        category: product?.category || 'Non classe',
        price: product?.sellingPrice || 0,
        normalQty: row.normalQty,
        cabaQty: row.cabaQty,
        totalQty: total,
      }
    })
    .sort((a, b) => b.totalQty - a.totalQty)

  const totalStock = stockRows.reduce((sum, row) => sum + row.totalQty, 0)
  const totalReferences = stockRows.filter((row) => row.totalQty > 0).length

  if (!allowed || !store) return null

  return (
    <MainLayout
      title={`Magasin: ${store.name}`}
      subtitle={`Region ${store.region} - ${store.location}`}
    >
      <div className="mb-6">
        <Link href="/points-de-vente" className="text-sm text-accent hover:underline">
          Retour a la liste des points de vente
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Stock total</p>
          <p className="text-3xl font-bold text-foreground">{totalStock}</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">References actives</p>
          <p className="text-3xl font-bold text-foreground">{totalReferences}</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Statut</p>
          <p className="text-3xl font-bold text-foreground">{store.status === 'active' ? 'Actif' : 'Inactif'}</p>
        </Card>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Produit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Categorie</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Stock total</th>
                {role === 'Administrator' && (
                  <>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Normal</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">CABA</th>
                  </>
                )}
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Prix (DZD)</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((row) => (
                <tr key={row.reference} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-accent">{row.reference}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.productName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.category}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">{row.totalQty}</td>
                  {role === 'Administrator' && (
                    <>
                      <td className="px-6 py-4 text-sm text-right text-foreground">{row.normalQty}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">{row.cabaQty}</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm text-right text-foreground">{row.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  )
}
