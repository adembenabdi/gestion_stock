'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Package, 
  Search, 
  Boxes, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  Upload,
  Building2,
  Receipt,
  RotateCcw,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRole, clearSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface NavLink {
  href: string
  label: string
  icon: React.ReactNode
  section?: 'main' | 'admin'
  roles?: ('Administrator' | 'Store Manager' | 'Seller')[]
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Tableau de bord', icon: <Home size={20} />, section: 'main', roles: ['Administrator', 'Store Manager', 'Seller'] },
  { href: '/search', label: 'Recherche intelligente', icon: <Search size={20} />, section: 'main', roles: ['Administrator', 'Store Manager', 'Seller'] },
  { href: '/invoices', label: 'Factures', icon: <Receipt size={20} />, section: 'main', roles: ['Administrator', 'Store Manager', 'Seller'] },
  { href: '/returns', label: 'Retours', icon: <RotateCcw size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/inventory', label: 'Stock', icon: <Boxes size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/operations', label: 'Transferts', icon: <Package size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/finance', label: 'Finance', icon: <Wallet size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/points-de-vente', label: 'Points de vente', icon: <Building2 size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/import', label: 'Importer Excel', icon: <Upload size={20} />, section: 'main', roles: ['Administrator', 'Store Manager'] },
  { href: '/history', label: 'Audit', icon: <BarChart3 size={20} />, section: 'main', roles: ['Administrator', 'Store Manager', 'Seller'] },
  { href: '/admin', label: 'Administration', icon: <Settings size={20} />, section: 'admin', roles: ['Administrator'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState('Seller')

  useEffect(() => {
    setUserRole(getRole())
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push('/login')
  }

  const isActive = (href: string) => {
    return pathname.startsWith(href)
  }

  const visibleLinks = navLinks.filter(link => {
    return !link.roles || link.roles.includes(userRole as 'Administrator' | 'Store Manager' | 'Seller')
  })

  const mainLinksVisible = visibleLinks.filter(link => link.section === 'main')
  const adminLinksVisible = visibleLinks.filter(link => link.section === 'admin')

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Package className="text-sidebar-primary-foreground" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground text-sm">InventoryPro</span>
            <span className="text-xs text-sidebar-foreground/60">
              {userRole === 'Administrator' ? 'Administrateur' : userRole === 'Store Manager' ? 'Responsable magasin' : 'Vendeur'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Section */}
        <div className="space-y-1 mb-6">
          {mainLinksVisible.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(link.href)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Admin Section */}
        {adminLinksVisible.length > 0 && (
          <div className="space-y-1 pt-6 border-t border-sidebar-border">
            <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Administration
            </p>
            {adminLinksVisible.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <LogOut size={20} />
          <span>Deconnexion</span>
        </button>
      </div>
    </aside>
  )
}
