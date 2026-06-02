'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/main-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { getRole, can } from '@/lib/auth'

interface ImportRow {
  line: number
  reference: string
  quantity: number
  status: 'created' | 'updated' | 'error'
  message: string
}

// Mock import report (no backend) — illustrates additive import + auto-creation.
const mockReport: ImportRow[] = [
  { line: 2, reference: 'CAR-001', quantity: 10, status: 'updated', message: 'Stock mis a jour : 20 + 10 = 30' },
  { line: 3, reference: 'OIL-002', quantity: 50, status: 'updated', message: 'Stock mis a jour : 120 + 50 = 170' },
  { line: 4, reference: 'NEW-009', quantity: 25, status: 'created', message: 'Reference inconnue — piece et stock crees automatiquement' },
  { line: 5, reference: '', quantity: 0, status: 'error', message: 'Reference manquante — ligne ignoree' },
]

export default function ImportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [allowed, setAllowed] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [report, setReport] = useState<ImportRow[] | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const role = getRole()
    if (!can(role).importExcel) {
      router.replace('/dashboard')
      return
    }
    setAllowed(true)
  }, [router])

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return
    }
    setFileName(file.name)
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`)
    setReport(null)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const onImport = () => {
    if (!fileName) return
    setIsProcessing(true)
    // Simulate processing — seed data only.
    setTimeout(() => {
      setReport(mockReport)
      setIsProcessing(false)
    }, 800)
  }

  const reset = () => {
    setFileName('')
    setFileSize('')
    setReport(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (!allowed) return null

  const created = report?.filter((r) => r.status === 'created').length ?? 0
  const updated = report?.filter((r) => r.status === 'updated').length ?? 0
  const errors = report?.filter((r) => r.status === 'error').length ?? 0

  return (
    <MainLayout title="Importation Excel" subtitle="Ajoutez du stock via un fichier .xlsx : quantites cumulatives et creation automatique des pieces">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload zone */}
        <Card className="lg:col-span-2 bg-card border border-border p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
              isDragging ? 'border-accent bg-accent/5' : 'border-border'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-accent/15 text-accent flex items-center justify-center mx-auto mb-4">
              <Upload size={28} />
            </div>
            <p className="font-semibold text-foreground mb-1">Deposez votre fichier Excel ici</p>
            <p className="text-sm text-muted-foreground mb-4">Seuls les fichiers .xlsx sont pris en charge</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-sidebar"
              onClick={() => inputRef.current?.click()}
            >
              Parcourir
            </Button>
          </div>

          {/* Selected file */}
          {fileName && (
            <div className="mt-4 flex items-center justify-between p-4 rounded-lg bg-sidebar border border-sidebar-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileSpreadsheet className="text-accent shrink-0" size={22} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground">{fileSize}</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button
              onClick={onImport}
              disabled={!fileName || isProcessing}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
            >
              {isProcessing ? 'Importation en cours...' : 'Importer le stock'}
            </Button>
          </div>
        </Card>

        {/* Help / template */}
        <Card className="bg-card border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Regles d importation</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
              Les quantites sont <span className="text-foreground font-medium">cumulatives</span> (20 + 10 = 30).
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
              Les references inconnues creent automatiquement la piece et le stock.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
              Colonnes : <span className="text-foreground font-medium">reference, quantite, agence</span>.
            </li>
          </ul>
          <Button variant="outline" className="w-full mt-6 border-border text-foreground hover:bg-sidebar">
            <Download size={18} />
            Telecharger le modele
          </Button>
        </Card>
      </div>

      {/* Import report */}
      {report && (
        <Card className="bg-card border border-border mt-6 overflow-hidden">
          <div className="p-6 border-b border-border flex flex-wrap items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Rapport d importation</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/20 text-primary">{updated} mis a jour</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent">{created} creees</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-destructive/20 text-destructive">{errors} erreurs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sidebar border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ligne</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reference</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Quantite</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.line} className="border-b border-border">
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.line}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-accent">{row.reference || '—'}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">{row.quantity}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                          row.status === 'updated'
                            ? 'bg-primary/20 text-primary'
                            : row.status === 'created'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {row.status === 'error' ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                        {row.status === 'updated' ? 'mis a jour' : row.status === 'created' ? 'cree' : 'erreur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </MainLayout>
  )
}
