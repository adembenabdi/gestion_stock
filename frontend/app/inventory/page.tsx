'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { getRole, can } from '@/lib/auth'

export default function InventoryPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!can(getRole()).manageInventory) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const [parts, setParts] = useState([
    { id: 1, code: 'CAR-001', name: 'Carburateur', category: 'Moteur', unit: 'pcs', price: 89.99, totalStock: 45 },
    { id: 2, code: 'OIL-002', name: 'Filtre a huile', category: 'Filtres', unit: 'pcs', price: 12.50, totalStock: 120 },
    { id: 3, code: 'BRK-003', name: 'Plaquettes de frein', category: 'Freins', unit: 'jeux', price: 34.99, totalStock: 8 },
    { id: 4, code: 'SPK-004', name: "Bougies d'allumage", category: 'Allumage', unit: 'pcs', price: 8.99, totalStock: 0 },
    { id: 5, code: 'BAT-005', name: 'Batterie 12V', category: 'Electrique', unit: 'pcs', price: 120.00, totalStock: 25 },
  ])

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newPart, setNewPart] = useState({ code: '', name: '', category: '', unit: 'pcs', price: '' })
  const [editPart, setEditPart] = useState<null | { id: number; code: string; name: string; category: string; unit: string; price: string }>(null)

  const handleAddPart = () => {
    if (newPart.code && newPart.name && newPart.category && newPart.price) {
      setParts([
        ...parts,
        {
          id: parts.length + 1,
          ...newPart,
          price: parseFloat(newPart.price),
          totalStock: 0,
        },
      ])
      setNewPart({ code: '', name: '', category: '', unit: 'pcs', price: '' })
      setIsAddOpen(false)
    }
  }

  const handleSaveEdit = () => {
    if (!editPart) return
    if (editPart.code && editPart.name && editPart.category && editPart.price) {
      setParts(parts.map(p =>
        p.id === editPart.id
          ? { ...p, code: editPart.code, name: editPart.name, category: editPart.category, unit: editPart.unit, price: parseFloat(editPart.price) }
          : p
      ))
      setEditPart(null)
    }
  }

  const handleDeletePart = (id: number) => {
    setParts(parts.filter(p => p.id !== id))
  }

  const filteredParts = parts.filter(part =>
    part.code.toLowerCase().includes(search.toLowerCase()) ||
    part.name.toLowerCase().includes(search.toLowerCase())
  )

  if (!allowed) return null

  return (
    <MainLayout title="Catalogue" subtitle="Gerez votre catalogue de pieces et les stocks">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Rechercher par code ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
              <Plus size={20} />
              Ajouter une piece
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Ajouter une nouvelle piece</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Creez une nouvelle piece dans le catalogue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="code" className="text-foreground">Code piece</Label>
                <Input
                  id="code"
                  placeholder="ex. CAR-001"
                  value={newPart.code}
                  onChange={(e) => setNewPart({ ...newPart, code: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-foreground">Nom de la piece</Label>
                <Input
                  id="name"
                  placeholder="ex. Carburateur"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-foreground">Categorie</Label>
                <Input
                  id="category"
                  placeholder="ex. Moteur"
                  value={newPart.category}
                  onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="price" className="text-foreground">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={newPart.price}
                  onChange={(e) => setNewPart({ ...newPart, price: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-border">
                Annuler
              </Button>
              <Button onClick={handleAddPart} className="bg-accent hover:bg-accent/90">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Parts Table */}
      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nom de la piece</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Categorie</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Unite</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Prix</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Stock</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.map((part) => (
                <tr key={part.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-accent">{part.code}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{part.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{part.category}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{part.unit}</td>
                  <td className="px-6 py-4 text-sm text-right text-foreground font-semibold">{part.price.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`font-semibold ${part.totalStock === 0 ? 'text-destructive' : part.totalStock < 20 ? 'text-yellow-500' : 'text-primary'}`}>
                      {part.totalStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setEditPart({ id: part.id, code: part.code, name: part.name, category: part.category, unit: part.unit, price: String(part.price) })}
                        className="p-2 text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredParts.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Aucune piece ne correspond a votre recherche.
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editPart !== null} onOpenChange={(open) => !open && setEditPart(null)}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Modifier la piece</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Mettez a jour les informations de la piece
            </DialogDescription>
          </DialogHeader>
          {editPart && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-code" className="text-foreground">Code piece</Label>
                <Input
                  id="edit-code"
                  value={editPart.code}
                  onChange={(e) => setEditPart({ ...editPart, code: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="edit-name" className="text-foreground">Nom de la piece</Label>
                <Input
                  id="edit-name"
                  value={editPart.name}
                  onChange={(e) => setEditPart({ ...editPart, name: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="edit-category" className="text-foreground">Categorie</Label>
                <Input
                  id="edit-category"
                  value={editPart.category}
                  onChange={(e) => setEditPart({ ...editPart, category: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="edit-price" className="text-foreground">Prix</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editPart.price}
                  onChange={(e) => setEditPart({ ...editPart, price: e.target.value })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setEditPart(null)} className="border-border">
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} className="bg-accent hover:bg-accent/90">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
