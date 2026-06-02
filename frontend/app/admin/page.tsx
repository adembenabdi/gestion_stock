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
import { getRole, can } from '@/lib/auth'

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (!can(getRole()).administer) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Responsable', branch: 'Agence A', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Vendeur', branch: 'Agence B', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Magasinier', branch: 'Agence C', status: 'active' },
  ])

  const [branches, setBranches] = useState([
    { id: 1, name: 'Agence A', location: 'Siege principal', manager: 'John Doe', status: 'active' },
    { id: 2, name: 'Agence B', location: 'Centre-ville', manager: 'Jane Smith', status: 'active' },
    { id: 3, name: 'Agence C', location: 'Cote Est', manager: 'Mike Johnson', status: 'active' },
  ])

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Vendeur', branch: 'branch-a' })
  const [newBranch, setNewBranch] = useState({ name: '', location: '', manager: '' })

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([
        ...users,
        {
          id: users.length + 1,
          ...newUser,
          status: 'active',
        },
      ])
      setNewUser({ name: '', email: '', role: 'Vendeur', branch: 'branch-a' })
      setIsUserDialogOpen(false)
    }
  }

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id))
  }

  const handleAddBranch = () => {
    if (newBranch.name && newBranch.location) {
      setBranches([
        ...branches,
        {
          id: branches.length + 1,
          ...newBranch,
          status: 'active',
        },
      ])
      setNewBranch({ name: '', location: '', manager: '' })
      setIsBranchDialogOpen(false)
    }
  }

  const handleDeleteBranch = (id: number) => {
    setBranches(branches.filter(b => b.id !== id))
  }

  if (!allowed) return null

  return (
    <MainLayout title="Administration" subtitle="Gerez les utilisateurs, les agences et les parametres systeme">
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
                      <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Responsable">Responsable</SelectItem>
                          <SelectItem value="Vendeur">Vendeur</SelectItem>
                          <SelectItem value="Magasinier">Magasinier</SelectItem>
                          <SelectItem value="Administrateur">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="branch" className="text-foreground">Agence</Label>
                      <Select value={newUser.branch} onValueChange={(val) => setNewUser({ ...newUser, branch: val })}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branch-a">Agence A</SelectItem>
                          <SelectItem value="branch-b">Agence B</SelectItem>
                          <SelectItem value="branch-c">Agence C</SelectItem>
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
                        <td className="px-6 py-4 text-sm text-foreground">{user.branch}</td>
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
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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
                        placeholder="Ex. Quartier ouest"
                        value={newBranch.location}
                        onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manager" className="text-foreground">Responsable</Label>
                      <Input
                        id="manager"
                        placeholder="Selectionner un responsable"
                        value={newBranch.manager}
                        onChange={(e) => setNewBranch({ ...newBranch, manager: e.target.value })}
                        className="bg-input border-border text-foreground"
                      />
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
                    {branches.map((branch) => (
                      <tr key={branch.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{branch.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{branch.location}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{branch.manager}</td>
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
                            <button
                              onClick={() => handleDeleteBranch(branch.id)}
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
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  )
}
