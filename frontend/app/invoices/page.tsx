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
import { can, getName, getRole, getStoreId } from '@/lib/auth'
import { createInvoice, getMockState } from '@/lib/mock-store'

interface InvoiceLineInput {
  productId: string
  quantity: string
}

export default function InvoicesPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [lines, setLines] = useState<InvoiceLineInput[]>([{ productId: '1', quantity: '1' }])
  const [refreshToken, setRefreshToken] = useState(0)

  const state = useMemo(() => getMockState(), [refreshToken])
  const role = getRole()
  const currentStoreId = getStoreId() || 1

  useEffect(() => {
    if (!can(getRole()).createInvoices) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const scopedInvoices = role === 'Administrator'
    ? state.invoices
    : state.invoices.filter((x) => x.storeId === currentStoreId)

  const handleAddLine = () => {
    setLines((prev) => [...prev, { productId: String(state.products[0]?.id || 1), quantity: '1' }])
  }

  const handleCreate = () => {
    const payloadItems = lines
      .map((line) => ({ productId: Number(line.productId), quantity: Number(line.quantity) }))
      .filter((line) => line.productId > 0 && line.quantity > 0)

    const result = createInvoice({
      sellerName: getName(),
      storeId: role === 'Administrator' ? Number(lines[0]?.productId ? currentStoreId : currentStoreId) : currentStoreId,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerAddress: customerAddress || undefined,
      items: payloadItems,
    })

    setMessage(result.message)
    if (result.ok) {
      setOpen(false)
      setCustomerName('')
      setCustomerPhone('')
      setCustomerAddress('')
      setLines([{ productId: String(state.products[0]?.id || 1), quantity: '1' }])
      setRefreshToken((x) => x + 1)
    }
  }

  if (!allowed) return null

  return (
    <MainLayout title="Factures" subtitle="Create and manage invoices with optional customer details">
      {message && (
        <Card className="bg-card border border-border p-4 mb-6 text-sm text-foreground">{message}</Card>
      )}

      <div className="mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">New invoice</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create invoice</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Customer info is optional. Invoice can be created with product lines only.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">Customer Name (optional)</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Customer Phone (optional)</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-foreground">Customer Address (optional)</Label>
                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
            </div>

            <div className="space-y-3 py-4">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-foreground">Product</Label>
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
                        {state.products.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.reference} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Quantity</Label>
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
              <Button variant="outline" className="border-border text-foreground" onClick={handleAddLine}>Add line</Button>
              <Button className="bg-accent hover:bg-accent/90" onClick={handleCreate}>Create invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Invoice</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Store</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Seller</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Customer</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Total (DZD)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {scopedInvoices.map((invoice) => {
                const store = state.stores.find((s) => s.id === invoice.storeId)
                const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
                return (
                  <tr key={invoice.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-accent">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{store?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{invoice.seller}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.customerName || 'Walk-in customer'}</td>
                    <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">{total.toLocaleString()}</td>
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
