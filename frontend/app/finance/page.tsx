'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { addExpense, computeReturnedTotal, computeInvoiceTotal, getFinancialSummary, getMockState } from '@/lib/mock-store'
import { can, getName, getRole, getStoreId } from '@/lib/auth'

export default function FinancePage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [message, setMessage] = useState('')
  const [open, setOpen] = useState(false)
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [refreshToken, setRefreshToken] = useState(0)

  const role = getRole()
  const storeId = getStoreId()
  const state = useMemo(() => getMockState(), [refreshToken])

  useEffect(() => {
    if (!can(getRole()).viewFinance) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const summary = getFinancialSummary(role, storeId)

  const scopedInvoices = role === 'Administrator'
    ? state.invoices
    : state.invoices.filter((x) => x.storeId === storeId)

  const scopedExpenses = role === 'Administrator'
    ? state.expenses
    : state.expenses.filter((x) => x.storeId === storeId)

  const handleAddExpense = () => {
    const targetStoreId = role === 'Administrator' ? (storeId || state.stores[0]?.id || 1) : (storeId || 1)
    const result = addExpense({
      storeId: targetStoreId,
      title: expenseTitle,
      amount: Number(expenseAmount),
      actor: getName(),
    })

    setMessage(result.message)
    if (result.ok) {
      setOpen(false)
      setExpenseTitle('')
      setExpenseAmount('')
      setRefreshToken((x) => x + 1)
    }
  }

  if (!allowed) return null

  return (
    <MainLayout title="Finance" subtitle="Store managers see their store. Admin sees global performance and comparisons.">
      {message && (
        <Card className="bg-card border border-border p-4 mb-6 text-sm text-foreground">{message}</Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Sales</p>
          <p className="text-2xl font-bold text-foreground">{summary.sales.toLocaleString()} DZD</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Returns</p>
          <p className="text-2xl font-bold text-foreground">{summary.returns.toLocaleString()} DZD</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Expenses</p>
          <p className="text-2xl font-bold text-foreground">{summary.expenses.toLocaleString()} DZD</p>
        </Card>
        <Card className="bg-card border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Net</p>
          <p className="text-2xl font-bold text-accent">{summary.net.toLocaleString()} DZD</p>
        </Card>
      </div>

      <div className="mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">Add expense</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Record expense</DialogTitle>
              <DialogDescription className="text-muted-foreground">Simple business expense tracking for store performance.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <Label className="text-foreground">Title</Label>
                <Input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Amount (DZD)</Label>
                <Input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} className="bg-input border-border text-foreground" />
              </div>
              <Button className="bg-accent hover:bg-accent/90" onClick={handleAddExpense}>Save expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Invoice revenue and returns</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Invoice</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Sales</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Returns</th>
                </tr>
              </thead>
              <tbody>
                {scopedInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-accent">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">{computeInvoiceTotal(inv).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">{computeReturnedTotal(inv).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Title</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {scopedExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-border hover:bg-sidebar/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(exp.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{exp.title}</td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">{exp.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
