'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Shield, Building2, Eye as EyeIcon } from 'lucide-react'
import { demoAccounts, type UserRole } from '@/lib/seed-data'
import { setSession } from '@/lib/auth'

const ROLES: UserRole[] = ['Administrator', 'Store Manager', 'Seller']

const roleIcons: Record<UserRole, React.ReactNode> = {
  Administrator: <Shield size={18} />,
  'Store Manager': <Building2 size={18} />,
  Seller: <EyeIcon size={18} />,
}

const roleLabels: Record<UserRole, string> = {
  Administrator: 'Administrateur',
  'Store Manager': 'Responsable magasin',
  Seller: 'Vendeur',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('Seller')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const signInAs = (selectedRole: UserRole) => {
    const account = demoAccounts.find((a) => a.role === selectedRole)
    if (!account) return
    setSession({
      role: account.role,
      name: account.name,
      email: account.email,
      storeId: account.storeId,
    })
    router.push('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Mock authentication - no backend, seed data only.
    try {
      if (email && password && role) {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setSession({
          role,
          name: email.split('@')[0],
          email,
          storeId: role === 'Administrator' ? null : 1,
        })
        router.push('/dashboard')
      } else {
        setError('Veuillez remplir tous les champs')
      }
    } catch {
      setError('Identifiants invalides')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Bienvenue</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Connectez-vous a votre compte pour continuer
          </p>
        </div>

        {/* Quick role access */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Acces rapide - connexion directe
          </p>
          <div className="grid gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => signInAs(account.role)}
                className="flex items-center gap-3 w-full text-left p-3 rounded-lg border border-border bg-input hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <span className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  {roleIcons[account.role]}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-foreground">{roleLabels[account.role]}</span>
                  <span className="text-xs text-muted-foreground truncate">{account.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou connexion manuelle</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Adresse e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-foreground">
              Choisir le role
            </Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabels[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2"
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="flex items-center justify-between text-sm">
          <Link
            href="#"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Mot de passe oublie ?
          </Link>
          <Link
            href="#"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
