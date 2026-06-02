'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SearchPage() {
  const [search, setSearch] = useState('')
  const [branch, setBranch] = useState('all')
  const [status, setStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Mock search results
  const results = [
    {
      id: 1,
      partName: 'Carburateur',
      partCode: 'CAR-001',
      category: 'Moteur',
      stock: 45,
      unit: 'pcs',
      branches: [
        { name: 'Agence A', qty: 20 },
        { name: 'Agence B', qty: 15 },
        { name: 'Agence C', qty: 10 },
      ],
      status: 'in-stock',
      price: '89,99 €',
    },
    {
      id: 2,
      partName: 'Filtre a huile',
      partCode: 'OIL-002',
      category: 'Filtres',
      stock: 120,
      unit: 'pcs',
      branches: [
        { name: 'Agence A', qty: 50 },
        { name: 'Agence D', qty: 70 },
      ],
      status: 'in-stock',
      price: '12,50 €',
    },
    {
      id: 3,
      partName: 'Plaquettes de frein',
      partCode: 'BRK-003',
      category: 'Freins',
      stock: 8,
      unit: 'jeux',
      branches: [
        { name: 'Agence C', qty: 8 },
      ],
      status: 'low-stock',
      price: '34,99 €',
    },
    {
      id: 4,
      partName: "Bougies d'allumage",
      partCode: 'SPK-004',
      category: 'Allumage',
      stock: 0,
      unit: 'pcs',
      branches: [],
      status: 'out-of-stock',
      price: '8,99 €',
    },
  ]

  const branchValueToName: Record<string, string> = {
    'branch-a': 'Agence A',
    'branch-b': 'Agence B',
    'branch-c': 'Agence C',
    'branch-d': 'Agence D',
  }

  const filteredResults = results.filter((item) => {
    const term = search.trim().toLowerCase()
    const matchesSearch =
      term === '' ||
      item.partName.toLowerCase().includes(term) ||
      item.partCode.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)

    const matchesStatus = status === 'all' || item.status === status

    const matchesBranch =
      branch === 'all' ||
      item.branches.some((b) => b.name === branchValueToName[branch])

    return matchesSearch && matchesStatus && matchesBranch
  })

  const handleClearFilters = () => {
    setSearch('')
    setBranch('all')
    setStatus('all')
  }

  return (
    <MainLayout title="Recherche piece" subtitle="Recherchez et consultez les quantites dans toutes les agences">
      {/* Search Bar */}
      <div className="mb-8">
        <div className="flex gap-3 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher par nom, code ou categorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-border text-foreground hover:bg-sidebar"
          >
            <Filter size={20} />
              <span>Filtres</span>
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-6 bg-card border border-border rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Agence</label>
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les agences</SelectItem>
                    <SelectItem value="branch-a">Agence A</SelectItem>
                    <SelectItem value="branch-b">Agence B</SelectItem>
                    <SelectItem value="branch-c">Agence C</SelectItem>
                    <SelectItem value="branch-d">Agence D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Statut</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="low-stock">Stock faible</SelectItem>
                    <SelectItem value="out-of-stock">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-sidebar"
                >
                  <X size={18} />
                  Effacer les filtres
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {filteredResults.length} resultat{filteredResults.length > 1 ? 's' : ''}
        </p>
        {filteredResults.map((item) => (
          <Card key={item.id} className="bg-card border border-border p-6 hover:border-accent/50 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Nom de la piece</p>
                <p className="font-semibold text-foreground">{item.partName}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.partCode}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Categorie</p>
                <p className="font-semibold text-foreground">{item.category}</p>
              </div>
              <div className="flex items-start justify-between md:flex-col">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Stock total</p>
                  <p className="text-2xl font-bold text-accent">{item.stock} {item.unit}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    item.status === 'in-stock'
                      ? 'bg-primary/20 text-primary'
                      : item.status === 'low-stock'
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-destructive/20 text-destructive'
                  }`}
                >
                  {item.status === 'in-stock' ? 'En stock' : item.status === 'low-stock' ? 'Stock faible' : 'Rupture'}
                </span>
              </div>
            </div>

            {/* Distribution par agence */}
            {item.branches.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Disponible par agence</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {item.branches.map((branch, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-sidebar">
                      <p className="text-xs text-muted-foreground">{branch.name}</p>
                      <p className="text-lg font-semibold text-foreground">{branch.qty}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.branches.length === 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground italic">Aucun stock disponible dans les agences</p>
              </div>
            )}
          </Card>
        ))}
        {filteredResults.length === 0 && (
          <Card className="bg-card border border-border p-12 text-center">
            <p className="text-muted-foreground">Aucune piece ne correspond a votre recherche.</p>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
