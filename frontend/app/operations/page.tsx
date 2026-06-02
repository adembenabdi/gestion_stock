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
import { getRole, can } from '@/lib/auth'

export default function OperationsPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!can(getRole()).recordOperations) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const [operations, setOperations] = useState([
    {
      id: 1,
      date: '2024-06-02',
      type: 'IN',
      part: 'Carburateur',
      partCode: 'CAR-001',
      quantity: 50,
      branch: 'Agence A',
      status: 'completed',
      user: 'Karim Benali',
    },
    {
      id: 2,
      date: '2024-06-02',
      type: 'OUT',
      part: 'Filtre a huile',
      partCode: 'OIL-002',
      quantity: 100,
      branch: 'Agence B',
      status: 'completed',
      user: 'Sonia Mansour',
    },
    {
      id: 3,
      date: '2024-06-01',
      type: 'IN',
      part: "Bougies d'allumage",
      partCode: 'SPK-004',
      quantity: 200,
      branch: 'Agence C',
      status: 'pending',
      user: 'Yacine Hamdi',
    },
  ])

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newOperation, setNewOperation] = useState({
    type: 'IN',
    part: '',
    quantity: '',
    branch: 'branch-a',
  })

  const handleAddOperation = () => {
    if (newOperation.part && newOperation.quantity) {
      const parts = [
        { id: 1, name: 'Carburateur', code: 'CAR-001' },
        { id: 2, name: 'Filtre a huile', code: 'OIL-002' },
        { id: 3, name: 'Plaquettes de frein', code: 'BRK-003' },
        { id: 4, name: "Bougies d'allumage", code: 'SPK-004' },
      ]
      const selectedPart = parts.find(p => p.name === newOperation.part)

      setOperations([
        {
          id: operations.length + 1,
          date: new Date().toISOString().split('T')[0],
          type: newOperation.type as 'IN' | 'OUT',
          part: newOperation.part,
          partCode: selectedPart?.code || '',
          quantity: parseInt(newOperation.quantity),
          branch: newOperation.branch === 'branch-a' ? 'Agence A' : newOperation.branch === 'branch-b' ? 'Agence B' : newOperation.branch === 'branch-c' ? 'Agence C' : 'Agence D',
          status: 'completed',
          user: 'Utilisateur actuel',
        },
        ...operations,
      ])
      setNewOperation({ type: 'IN', part: '', quantity: '', branch: 'branch-a' })
      setIsAddOpen(false)
    }
  }

  const handleApproveOperation = (id: number) => {
    setOperations(
      operations.map(op =>
        op.id === id ? { ...op, status: 'completed' as const } : op
      )
    )
  }

  const handleRejectOperation = (id: number) => {
    setOperations(
      operations.map(op =>
        op.id === id ? { ...op, status: 'rejected' as const } : op
      )
    )
  }

  if (!allowed) return null

  return (
    <MainLayout title="Mouvements" subtitle="Enregistrez les entrees et sorties de stock">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Mouvements du jour</p>
          <p className="text-3xl font-bold text-foreground">12</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Validations en attente</p>
          <p className="text-3xl font-bold text-accent">3</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-2">Ce mois-ci</p>
          <p className="text-3xl font-bold text-primary">847</p>
        </Card>
      </div>

      {/* Add Operation Button */}
      <div className="mb-8">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Plus size={20} />
              Nouveau mouvement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Enregistrer un mouvement</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enregistrez une entree ou une sortie de stock
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="type" className="text-foreground">Type de mouvement</Label>
                <Select value={newOperation.type} onValueChange={(val) => setNewOperation({ ...newOperation, type: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Entree</SelectItem>
                    <SelectItem value="OUT">Sortie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="part" className="text-foreground">Piece</Label>
                <Select value={newOperation.part} onValueChange={(val) => setNewOperation({ ...newOperation, part: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Selectionner une piece" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carburateur">Carburateur</SelectItem>
                    <SelectItem value="Filtre a huile">Filtre a huile</SelectItem>
                    <SelectItem value="Plaquettes de frein">Plaquettes de frein</SelectItem>
                    <SelectItem value="Bougies d'allumage">Bougies d'allumage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-foreground">Quantite</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={newOperation.quantity}
                  onChange={(e) => setNewOperation({ ...newOperation, quantity: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div>
                <Label htmlFor="branch" className="text-foreground">Agence</Label>
                <Select value={newOperation.branch} onValueChange={(val) => setNewOperation({ ...newOperation, branch: val })}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="branch-a">Agence A</SelectItem>
                    <SelectItem value="branch-b">Agence B</SelectItem>
                    <SelectItem value="branch-c">Agence C</SelectItem>
                    <SelectItem value="branch-d">Agence D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-border">
                Annuler
              </Button>
              <Button onClick={handleAddOperation} className="bg-accent hover:bg-accent/90">
                Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Operations List */}
      <div className="space-y-4">
        {operations.map((operation) => (
          <Card key={operation.id} className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      operation.type === 'IN'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {operation.type === 'IN' ? 'ENTREE' : 'SORTIE'}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      operation.status === 'completed'
                        ? 'bg-primary/20 text-primary'
                        : operation.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {operation.status === 'completed' ? 'Termine' : operation.status === 'pending' ? 'En attente' : 'Refuse'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Piece</p>
                    <p className="font-semibold text-foreground">{operation.part}</p>
                    <p className="text-xs text-muted-foreground">{operation.partCode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Quantite</p>
                    <p className="text-2xl font-bold text-accent">{operation.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Agence</p>
                      <p className="font-semibold text-foreground">{operation.branch}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Date et utilisateur</p>
                    <p className="font-semibold text-foreground">{operation.date}</p>
                    <p className="text-xs text-muted-foreground">{operation.user}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {operation.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveOperation(operation.id)}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Check size={16} />
                    Valider
                  </Button>
                  <Button
                    onClick={() => handleRejectOperation(operation.id)}
                    size="sm"
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <X size={16} />
                    Refuser
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </MainLayout>
  )
}
