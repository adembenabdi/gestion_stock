'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Check, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { approveTransfer, getMockState, requestTransfer } from '@/lib/mock-store'
import { can, getName, getRole, getStoreId } from '@/lib/auth'
import type { TransferRequest, UserRole } from '@/lib/seed-data'

export default function OperationsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [role, setRole] = useState<UserRole>('Seller')
  const [userName, setUserName] = useState('User')
  const [transferRows, setTransferRows] = useState<TransferRequest[]>([])

  useEffect(() => {
    const currentRole = getRole()
    if (!can(currentRole).recordOperations) {
      router.replace('/dashboard')
      return
    }

    setRole(currentRole)
    setUserName(getName())
    setTransferRows(getMockState().transfers)
    setAllowed(true)
  }, [router])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [newTransfer, setNewTransfer] = useState({
    productId: '1',
    quantity: '1',
    fromStoreId: String(getStoreId() || 1),
    toStoreId: '2',
  })

  const state = getMockState()

  const refresh = () => {
    setTransferRows(getMockState().transfers)
  }

  const handleCreateRequest = () => {
    const result = requestTransfer({
      productId: Number(newTransfer.productId),
      quantity: Number(newTransfer.quantity),
      fromStoreId: Number(newTransfer.fromStoreId),
      toStoreId: Number(newTransfer.toStoreId),
      requestedBy: userName,
    })
    setMessage(result.message)
    if (result.ok) {
      setIsAddOpen(false)
      refresh()
    }
  }

  const handleDecision = (requestId: number, approve: boolean) => {
    const result = approveTransfer(requestId, userName, approve)
    setMessage(result.message)
    if (result.ok) {
      refresh()
    }
  }

  if (!allowed) return null

  return (
    <MainLayout title="Transfer workflow" subtitle="Store managers request transfer. Admin approves and executes stock movement.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending requests</p>
          <p className="text-3xl font-bold text-foreground">{transferRows.filter((x) => x.status === 'PENDING').length}</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Approved requests</p>
          <p className="text-3xl font-bold text-accent">{transferRows.filter((x) => x.status === 'APPROVED').length}</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Rejected requests</p>
          <p className="text-3xl font-bold text-primary">{transferRows.filter((x) => x.status === 'REJECTED').length}</p>
        </Card>
      </div>

      {message && (
        <Card className="bg-card border border-border p-4 mb-6 text-sm text-foreground">{message}</Card>
      )}

      <div className="mb-8">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Plus size={20} />
              Request transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create transfer request</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Manager creates a request. Admin approval executes source to destination stock transfer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="product" className="text-foreground">Product</Label>
                <Select value={newTransfer.productId} onValueChange={(val) => setNewTransfer({ ...newTransfer, productId: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.reference} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newTransfer.quantity}
                  onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="source" className="text-foreground">Source store</Label>
                <Select value={newTransfer.fromStoreId} onValueChange={(val) => setNewTransfer({ ...newTransfer, fromStoreId: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.stores.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target" className="text-foreground">Target store</Label>
                <Select value={newTransfer.toStoreId} onValueChange={(val) => setNewTransfer({ ...newTransfer, toStoreId: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {state.stores.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-border">
                Cancel
              </Button>
              <Button onClick={handleCreateRequest} className="bg-accent hover:bg-accent/90">
                Submit request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {transferRows.map((row) => {
          const product = state.products.find((p) => p.id === row.productId)
          const source = state.stores.find((s) => s.id === row.fromStoreId)
          const target = state.stores.find((s) => s.id === row.toStoreId)

          return (
          <Card key={row.id} className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground">TRANSFER</span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      row.status === 'APPROVED'
                        ? 'bg-primary/20 text-primary'
                        : row.status === 'PENDING'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Product</p>
                    <p className="font-semibold text-foreground">{product?.name}</p>
                    <p className="text-xs text-muted-foreground">{product?.reference}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Quantity</p>
                    <p className="text-2xl font-bold text-accent">{row.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Route</p>
                    <p className="font-semibold text-foreground">{source?.name} to {target?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Requested by</p>
                    <p className="font-semibold text-foreground">{row.requestedBy}</p>
                    <p className="text-xs text-muted-foreground">{new Date(row.requestedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {row.status === 'PENDING' && role === 'Administrator' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDecision(row.id, true)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Check size={16} />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleDecision(row.id, false)}
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <X size={16} />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )})}
      </div>
    </MainLayout>
  )
}
