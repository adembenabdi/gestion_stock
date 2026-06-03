'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { can, getRole, getStoreId } from '@/lib/auth'
import { getMockState } from '@/lib/mock-store'
import type { Product, UserRole } from '@/lib/seed-data'

export default function InventoryPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [role, setRole] = useState<UserRole>('Seller')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<Array<{
    product: Product
    storeName: string
    normalQty: number
    cabaQty: number
    totalQty: number
  }>>([])

  useEffect(() => {
    const currentRole = getRole()
    if (!can(currentRole).manageInventory) {
      router.replace('/dashboard')
      return
    }

    setRole(currentRole)
    const state = getMockState()
    const currentStoreId = getStoreId()
    const scopedStock = currentRole === 'Administrator'
      ? state.stock
      : state.stock.filter((x) => x.storeId === currentStoreId)

    const tableRows = scopedStock.map((stockRow) => {
      const product = state.products.find((p) => p.id === stockRow.productId)
      const store = state.stores.find((s) => s.id === stockRow.storeId)
      return {
        product: product || {
          id: stockRow.productId,
          reference: 'UNKNOWN',
          name: 'Unknown product',
          sellingPrice: 0,
          category: 'Unknown',
        },
        storeName: store?.name || 'Unknown store',
        normalQty: stockRow.normalQty,
        cabaQty: stockRow.cabaQty,
        totalQty: stockRow.normalQty + stockRow.cabaQty,
      }
    })

    setRows(tableRows)
    setAllowed(true)
  }, [router])

  const filteredRows = rows.filter((row) =>
    row.product.reference.toLowerCase().includes(search.toLowerCase()) ||
    row.product.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!allowed) return null

  return (
    <MainLayout title="Stock par magasin" subtitle="Admin sees Normal/CABA split; other roles see only physical total">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search by reference or product name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Store</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Total Qty</th>
                {role === 'Administrator' && (
                  <>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Normal Qty</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">CABA Qty</th>
                  </>
                )}
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Price (DZD)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={`${row.product.id}-${idx}`} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-accent">{row.product.reference}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.product.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.storeName}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">{row.totalQty}</td>
                  {role === 'Administrator' && (
                    <>
                      <td className="px-6 py-4 text-sm text-right text-foreground">{row.normalQty}</td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">{row.cabaQty}</td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm text-right text-foreground">{row.product.sellingPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRows.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No stock rows match your search.
          </div>
        )}
      </Card>
    </MainLayout>
  )
}
