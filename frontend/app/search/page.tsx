'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { availabilityForProduct, getMockState } from '@/lib/mock-store'
import { getStoreId } from '@/lib/auth'

export default function SearchPage() {
  const [reference, setReference] = useState('CAB-001')
  const [requiredQty, setRequiredQty] = useState(20)
  const [resolvedStoreId, setResolvedStoreId] = useState(1)
  const [result, setResult] = useState<ReturnType<typeof availabilityForProduct>>(null)

  useEffect(() => {
    const fallback = getMockState().stores[0]?.id || 1
    setResolvedStoreId(getStoreId() || fallback)
  }, [])

  useEffect(() => {
    setResult(availabilityForProduct(reference.trim(), resolvedStoreId))
  }, [reference, resolvedStoreId])

  const reachableQty = (result?.currentQty || 0)
    + (result?.nearby.reduce((sum, x) => sum + x.quantity, 0) || 0)
    + (result?.other.reduce((sum, x) => sum + x.quantity, 0) || 0)

  const canFulfill = reachableQty >= requiredQty

  return (
    <MainLayout title="Recherche intelligente" subtitle="Sequence automatique: current store -> same region -> global stores">
      <div className="mb-8">
        <div className="flex gap-3 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Enter product reference (example: CAB-001)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="w-40">
            <Input
              type="number"
              min={1}
              value={requiredQty}
              onChange={(e) => setRequiredQty(Number(e.target.value || 1))}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="w-48">
            <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => setResult(availabilityForProduct(reference.trim(), resolvedStoreId))}>
              Check availability
            </Button>
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          <Card className="bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground mb-2">Product</p>
            <p className="text-xl font-semibold text-foreground">{result.product.name} ({result.product.reference})</p>
            <p className="text-sm text-muted-foreground mt-1">
              Required: {requiredQty} - Reachable: {reachableQty}
            </p>
            <p className={`mt-3 text-sm font-semibold ${canFulfill ? 'text-primary' : 'text-destructive'}`}>
              {canFulfill ? 'Order can be fulfilled with intelligent sourcing.' : 'Order cannot be fully fulfilled with current stock.'}
            </p>
          </Card>

          <Card className="bg-card border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">1) Current store</h2>
            <div className="p-4 rounded-lg bg-sidebar border border-sidebar-border">
              <p className="text-sm text-foreground">{result.currentStore?.name || 'Current store'}</p>
              <p className="text-2xl font-bold text-accent">{result.currentQty}</p>
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">2) Nearby stores (same region)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.nearby.map((item) => (
                <div key={item.store.id} className="p-4 rounded-lg bg-sidebar border border-sidebar-border">
                  <p className="text-sm text-foreground">{item.store.name}</p>
                  <p className="text-xs text-muted-foreground">{item.store.region}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{item.quantity}</p>
                </div>
              ))}
              {result.nearby.length === 0 && (
                <p className="text-sm text-muted-foreground">No nearby stock available.</p>
              )}
            </div>
          </Card>

          <Card className="bg-card border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">3) Other stores (global)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.other.map((item) => (
                <div key={item.store.id} className="p-4 rounded-lg bg-sidebar border border-sidebar-border">
                  <p className="text-sm text-foreground">{item.store.name}</p>
                  <p className="text-xs text-muted-foreground">{item.store.region}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{item.quantity}</p>
                </div>
              ))}
              {result.other.length === 0 && (
                <p className="text-sm text-muted-foreground">No global stock available outside your region.</p>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="bg-card border border-border p-12 text-center">
          <p className="text-muted-foreground">Unknown reference. Try CAB-001, FIL-002, BAT-003, or SPK-004.</p>
        </Card>
      )}
    </MainLayout>
  )
}
