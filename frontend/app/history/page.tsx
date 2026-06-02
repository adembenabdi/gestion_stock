'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function HistoryPage() {
  const [dateFrom, setDateFrom] = useState('2024-05-01')
  const [dateTo, setDateTo] = useState('2024-06-02')
  const [branch, setBranch] = useState('all')
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')

  const movements = [
    {
      id: 1,
      date: '2024-06-02',
      time: '14:30',
      type: 'IN',
      part: 'Carburateur',
      code: 'CAR-001',
      quantity: 50,
      branch: 'Agence A',
      user: 'Karim Benali',
      reference: 'PO-2024-001',
    },
    {
      id: 2,
      date: '2024-06-02',
      time: '13:15',
      type: 'OUT',
      part: 'Filtre a huile',
      code: 'OIL-002',
      quantity: 100,
      branch: 'Agence B',
      user: 'Sonia Mansour',
      reference: 'SO-2024-156',
    },
    {
      id: 3,
      date: '2024-06-01',
      time: '10:45',
      type: 'IN',
      part: "Bougies d'allumage",
      code: 'SPK-004',
      quantity: 200,
      branch: 'Agence C',
      user: 'Yacine Hamdi',
      reference: 'PO-2024-002',
    },
    {
      id: 4,
      date: '2024-06-01',
      time: '09:20',
      type: 'OUT',
      part: 'Plaquettes de frein',
      code: 'BRK-003',
      quantity: 75,
      branch: 'Agence A',
      user: 'Nadia Cherif',
      reference: 'SO-2024-155',
    },
    {
      id: 5,
      date: '2024-05-31',
      time: '16:00',
      type: 'IN',
      part: 'Batterie 12V',
      code: 'BAT-005',
      quantity: 30,
      branch: 'Agence D',
      user: 'Tarek Belaid',
      reference: 'PO-2024-003',
    },
    {
      id: 6,
      date: '2024-05-31',
      time: '11:30',
      type: 'TRANSFER',
      part: 'Filtre a huile',
      code: 'OIL-002',
      quantity: 20,
      branch: 'Agence B → Agence A',
      user: 'Karim Benali',
      reference: 'TR-2024-001',
    },
  ]

  const handleExport = () => {
    const csv = [
      ['Date', 'Heure', 'Type', 'Piece', 'Code', 'Quantite', 'Agence', 'Utilisateur', 'Reference'],
      ...movements.map(m => [
        m.date, m.time, m.type, m.part, m.code, m.quantity, m.branch, m.user, m.reference
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `movement-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredMovements = movements.filter(m =>
    (branch === 'all' || m.branch.includes(branch)) &&
    (type === 'all' || m.type === type) &&
    (search === '' || m.part.toLowerCase().includes(search.toLowerCase()) || m.code.includes(search))
  )

  return (
    <MainLayout title="Historique" subtitle="Consultez tous les mouvements de stock par agence">
      {/* Filters */}
      <Card className="bg-card border border-border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Du</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Au</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Agence</label>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les agences</SelectItem>
                <SelectItem value="Agence A">Agence A</SelectItem>
                <SelectItem value="Agence B">Agence B</SelectItem>
                <SelectItem value="Agence C">Agence C</SelectItem>
                <SelectItem value="Agence D">Agence D</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="IN">Entree</SelectItem>
                <SelectItem value="OUT">Sortie</SelectItem>
                <SelectItem value="TRANSFER">Transfert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleExport} variant="outline" className="w-full border-border text-foreground hover:bg-sidebar">
              <Download size={18} />
              Exporter
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Rechercher par nom ou code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </Card>

      {/* Movements Table */}
      <Card className="bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sidebar border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date et heure</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Piece</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Qte</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Agence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{movement.date}</p>
                      <p className="text-xs text-muted-foreground">{movement.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        movement.type === 'IN'
                          ? 'bg-primary/20 text-primary'
                          : movement.type === 'OUT'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-secondary/20 text-secondary-foreground'
                      }`}
                    >
                      {movement.type === 'IN' ? 'Entree' : movement.type === 'OUT' ? 'Sortie' : 'Transfert'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{movement.part}</p>
                      <p className="text-xs text-accent">{movement.code}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-foreground">{movement.quantity}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{movement.branch}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{movement.user}</td>
                  <td className="px-6 py-4 text-sm text-accent font-semibold">{movement.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-sidebar border-t border-border">
          <p className="text-sm text-muted-foreground">{filteredMovements.length} mouvements affiches</p>
        </div>
      </Card>
    </MainLayout>
  )
}
