'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Users, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addStore, addUser, getMockState } from '@/lib/mock-store'
import { can, getRole } from '@/lib/auth'
import type { UserRole } from '@/lib/seed-data'

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!can(getRole()).administer) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const state = getMockState()
  const users = state.users
  const stores = state.stores

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Seller' as UserRole, storeId: '1' })
  const [newBranch, setNewBranch] = useState({ name: '', location: '', region: 'North' })

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const result = addUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        storeId: newUser.role === 'Administrator' ? null : Number(newUser.storeId),
      })
      setMessage(result.message)
      if (result.ok) {
        setNewUser({ name: '', email: '', role: 'Seller', storeId: '1' })
        setIsUserDialogOpen(false)
        setRefreshToken((x) => x + 1)
      }
    }
  }

  const handleAddBranch = () => {
    if (newBranch.name && newBranch.location && newBranch.region) {
      const result = addStore({
        name: newBranch.name,
        location: newBranch.location,
        region: newBranch.region,
      })
      setMessage(result.message)
      if (result.ok) {
        setNewBranch({ name: '', location: '', region: 'North' })
        setIsBranchDialogOpen(false)
        setRefreshToken((x) => x + 1)
      }
    }
  }

  if (!allowed) return null

  return (
    <MainLayout title="Administration" subtitle="Gerez les utilisateurs, les agences et les parametres systeme">
      {message && (
        <Card className="bg-card border border-border p-4 mb-6 text-sm text-foreground">{message}</Card>
      )}

      <div className="mb-6 flex justify-end">
        <Link href="/admin/points-de-vente">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
            Voir points de vente et stock total
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-sidebar border border-border">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={18} />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building2 size={18} />
            Agences
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-8">
          <div className="space-y-6">
            {/* Add User Button */}
            <div className="flex justify-end">
              <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    <Plus size={20} />
                    Ajouter un utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Ajouter un utilisateur</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Creez un nouveau compte utilisateur pour votre equipe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name" className="text-foreground">Nom complet</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-foreground">Rôle</Label>
                      <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val as UserRole })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Store Manager">Store Manager</SelectItem>
                          <SelectItem value="Seller">Seller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="branch" className="text-foreground">Store</Label>
                      <Select value={newUser.storeId} onValueChange={(val) => setNewUser({ ...newUser, storeId: val })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={String(store.id)}>{store.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setIsUserDialogOpen(false)} className="border-border">
                      Annuler
                    </Button>
                    <Button onClick={handleAddUser} className="bg-accent hover:bg-accent/90">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Users Table */}
            <Card className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nom</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">E-mail</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Agence</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{user.role}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{user.storeId ? stores.find((s) => s.id === user.storeId)?.name : 'All Stores'}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                            {user.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button className="p-2 text-muted-foreground hover:text-accent transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="mt-8">
          <div className="space-y-6">
            {/* Add Branch Button */}
            <div className="flex justify-end">
              <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                    <Plus size={20} />
                    Ajouter une agence
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Ajouter une agence</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Creez une nouvelle agence
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="branch-name" className="text-foreground">Nom de l agence</Label>
                      <Input
                        id="branch-name"
                        placeholder="Ex. Agence D"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-foreground">Emplacement</Label>
                      <Input
                        id="location"
                        placeholder="Ex. Central district"
                        value={newBranch.location}
                        onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region" className="text-foreground">Region</Label>
                      <Select value={newBranch.region} onValueChange={(val) => setNewBranch({ ...newBranch, region: val })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="North">North</SelectItem>
                          <SelectItem value="East">East</SelectItem>
                          <SelectItem value="West">West</SelectItem>
                          <SelectItem value="South">South</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setIsBranchDialogOpen(false)} className="border-border">
                      Annuler
                    </Button>
                    <Button onClick={handleAddBranch} className="bg-accent hover:bg-accent/90">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Branches Table */}
            <Card className="bg-card border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sidebar border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Agence</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Emplacement</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Responsable</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((branch) => (
                      <tr key={branch.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{branch.location}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{branch.region}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                            {branch.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button className="p-2 text-muted-foreground hover:text-accent transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  )
}
