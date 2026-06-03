'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { applyReturn, getMockState } from '@/lib/mock-store'
import { can, getName, getRole, getStoreId } from '@/lib/auth'

interface ReturnLine {
  productId: string
  quantity: string
}

export default function ReturnsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('')
  const [lines, setLines] = useState<ReturnLine[]>([{ productId: '1', quantity: '1' }])

  const state = useMemo(() => getMockState(), [refreshToken])
  const role = getRole()
  const storeId = getStoreId()

  useEffect(() => {
    if (!can(getRole()).processReturns) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const scopedInvoices = role === 'Administrator'
    ? state.invoices
    : state.invoices.filter((x) => x.storeId === storeId)

  const selectedInvoice = scopedInvoices.find((x) => String(x.id) === selectedInvoiceId)

  const handleApplyReturn = () => {
    if (!selectedInvoiceId) {
      setMessage('Selectionnez une facture')
      return
    }

    const result = applyReturn({
      invoiceId: Number(selectedInvoiceId),
      actor: getName(),
      items: lines
        .map((line) => ({ productId: Number(line.productId), quantity: Number(line.quantity) }))
        .filter((line) => line.productId > 0 && line.quantity > 0),
    })

    setMessage(result.message)
    if (result.ok) {
      setOpen(false)
      setLines([{ productId: String(selectedInvoice?.items[0]?.productId || 1), quantity: '1' }])
      setRefreshToken((x) => x + 1)
    }
  }

  if (!allowed) return null

  return (
    <MainLayout title="Retours" subtitle="Gerer les retours complets et partiels. Les quantites reviennent en stock automatiquement.">
      {message && (
        <Card className="bg-card border border-border p-4 mb-6 text-sm text-foreground">{message}</Card>
      )}

      <div className="mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">Traiter un retour</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Retour de facture</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Retour complet: toutes les quantites vendues. Retour partiel: quantites selectionnees.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-foreground">Facture</Label>
                <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selectionner une facture" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopedInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={String(inv.id)}>
                        {inv.invoiceNumber} - {inv.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedInvoice && (
                <div className="p-3 rounded-lg bg-sidebar border border-sidebar-border text-sm text-foreground">
                  Lignes vendues: {selectedInvoice.items.map((line) => {
                    const p = state.products.find((x) => x.id === line.productId)
                    return `${p?.reference || 'Inconnu'} x${line.quantity}`
                  }).join(', ')}
                </div>
              )}

              <div className="space-y-3">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-foreground">Produit</Label>
                      <Select
                        value={line.productId}
                        onValueChange={(val) => {
                          setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, productId: val } : x)))
                        }}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(selectedInvoice?.items || []).map((invLine) => {
                            const product = state.products.find((p) => p.id === invLine.productId)
                            return (
                              <SelectItem key={invLine.productId} value={String(invLine.productId)}>
                                {product?.reference} - vendu {invLine.quantity}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-foreground">Quantite retour</Label>
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => {
                          setLines((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))
                        }}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="border-border text-foreground"
                  onClick={() => {
                    const defaultProductId = selectedInvoice?.items[0]?.productId || 1
                    setLines((prev) => [...prev, { productId: String(defaultProductId), quantity: '1' }])
                  }}
                >
                  Ajouter ligne de retour
                </Button>
                <Button className="bg-accent hover:bg-accent/90" onClick={handleApplyReturn}>Valider le retour</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Facture</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Magasin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Qte vendue</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Qte retournee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
              </tr>
            </thead>
            <tbody>
              {scopedInvoices.map((invoice) => {
                const sold = invoice.items.reduce((sum, x) => sum + x.quantity, 0)
                const returned = invoice.returnedItems.reduce((sum, x) => sum + x.quantity, 0)
                const store = state.stores.find((s) => s.id === invoice.storeId)
                return (
                  <tr key={invoice.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-accent">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{store?.name || 'Inconnu'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{sold}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{returned}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent">{invoice.status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </MainLayout>
  )
}
