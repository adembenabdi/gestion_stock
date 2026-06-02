'use client'

import { Package } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
            <Package className="text-accent-foreground" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">InventoryPro</h1>
          <p className="text-sm text-muted-foreground mt-2">Systeme de gestion des pieces detachees</p>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {children}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          © 2024 InventoryPro. Tous droits reserves.
        </p>
      </div>
    </div>
  )
}
