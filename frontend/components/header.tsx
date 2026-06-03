'use client'

import { useEffect, useState } from 'react'
import { Bell, User, ChevronDown, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getName, getRole, clearSession } from '@/lib/auth'

interface HeaderProps {
  title: string
  subtitle?: string
}

const roleLabels: Record<string, string> = {
  Administrator: 'Administrateur',
  'Store Manager': 'Responsable magasin',
  Seller: 'Vendeur',
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [userRole, setUserRole] = useState('Seller')

  useEffect(() => {
    setUserName(getName())
    setUserRole(getRole())
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Administrator': 'bg-destructive/20 text-destructive',
      'Store Manager': 'bg-accent/20 text-accent',
      'Seller': 'bg-primary/20 text-primary',
    }
    return colors[role] || 'bg-muted text-muted-foreground'
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <User size={18} className="text-accent-foreground" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-medium text-foreground capitalize">{userName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${getRoleColor(userRole)}`}>
                    {roleLabels[userRole] || userRole}
                  </span>
                </div>
                <ChevronDown size={16} className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="text-xs text-muted-foreground py-1.5">
                Connecte en tant que {userName}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Parametres</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut size={16} className="mr-2" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
