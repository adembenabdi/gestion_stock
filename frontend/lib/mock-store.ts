import {
  initialState,
  type AuditEntry,
  type Expense,
  type Invoice,
  type Product,
  type ReturnItem,
  type SeedState,
  type StockClass,
  type StockRecord,
  type TransferRequest,
  type UserRole,
} from './seed-data'

const DB_KEY = 'inventorypro-mock-db-v1'

function cloneState(state: SeedState): SeedState {
  return JSON.parse(JSON.stringify(state)) as SeedState
}

function nowIso(): string {
  return new Date().toISOString()
}

export function getMockState(): SeedState {
  if (typeof window === 'undefined') return cloneState(initialState)
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const seeded = cloneState(initialState)
    localStorage.setItem(DB_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    return JSON.parse(raw) as SeedState
  } catch {
    const seeded = cloneState(initialState)
    localStorage.setItem(DB_KEY, JSON.stringify(seeded))
    return seeded
  }
}

export function saveMockState(state: SeedState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DB_KEY, JSON.stringify(state))
}

export function resetMockState() {
  if (typeof window === 'undefined') return
  localStorage.setItem(DB_KEY, JSON.stringify(cloneState(initialState)))
}

function nextId(items: Array<{ id: number }>): number {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
}

export function getStoreStockQty(stock: StockRecord[], productId: number, storeId: number): number {
  const rec = stock.find((x) => x.productId === productId && x.storeId === storeId)
  return (rec?.normalQty || 0) + (rec?.cabaQty || 0)
}

export function getAllStockQty(stock: StockRecord[], productId: number): number {
  return stock
    .filter((x) => x.productId === productId)
    .reduce((sum, rec) => sum + rec.normalQty + rec.cabaQty, 0)
}

function ensureStockRecord(state: SeedState, productId: number, storeId: number): StockRecord {
  const existing = state.stock.find((x) => x.productId === productId && x.storeId === storeId)
  if (existing) return existing
  const rec: StockRecord = { productId, storeId, normalQty: 0, cabaQty: 0 }
  state.stock.push(rec)
  return rec
}

function removeFromStock(rec: StockRecord, quantity: number): boolean {
  const total = rec.normalQty + rec.cabaQty
  if (quantity > total) return false

  let remaining = quantity
  const fromNormal = Math.min(rec.normalQty, remaining)
  rec.normalQty -= fromNormal
  remaining -= fromNormal
  if (remaining > 0) {
    rec.cabaQty -= remaining
  }

  return true
}

function addToStock(rec: StockRecord, quantity: number, stockClass: StockClass) {
  if (stockClass === 'NORMAL') {
    rec.normalQty += quantity
  } else {
    rec.cabaQty += quantity
  }
}

function addAudit(state: SeedState, actor: string, action: string, details: string) {
  const audit: AuditEntry = {
    id: nextId(state.audit),
    createdAt: nowIso(),
    actor,
    action,
    details,
  }
  state.audit.unshift(audit)
}

export function importStockRows(
  rows: Array<{ reference: string; name?: string; category?: string; price?: number; quantity: number; stockClass: StockClass }>,
  storeId: number,
  actor: string,
): Array<{ line: number; reference: string; quantity: number; status: 'created' | 'updated' | 'error'; message: string }> {
  const state = getMockState()
  const report: Array<{ line: number; reference: string; quantity: number; status: 'created' | 'updated' | 'error'; message: string }> = []

  rows.forEach((row, index) => {
    if (!row.reference || row.quantity <= 0) {
      report.push({
        line: index + 2,
        reference: row.reference,
        quantity: row.quantity,
        status: 'error',
        message: 'Invalid reference or quantity',
      })
      return
    }

    let product = state.products.find((p) => p.reference.toLowerCase() === row.reference.toLowerCase())
    let created = false

    if (!product) {
      product = {
        id: nextId(state.products),
        reference: row.reference,
        name: row.name || row.reference,
        category: row.category || 'Uncategorized',
        sellingPrice: row.price || 0,
      }
      state.products.push(product)
      created = true
    }

    const stockRec = ensureStockRecord(state, product.id, storeId)
    addToStock(stockRec, row.quantity, row.stockClass)

    state.movements.unshift({
      id: nextId(state.movements),
      createdAt: nowIso(),
      type: 'IN',
      productId: product.id,
      quantity: row.quantity,
      storeId,
      byUser: actor,
      note: `Excel import (${row.stockClass})`,
    })

    addAudit(
      state,
      actor,
      'STOCK_IMPORTED',
      `${created ? 'Created product and imported' : 'Imported'} ${row.quantity} x ${product.reference} in store ${storeId}`,
    )

    report.push({
      line: index + 2,
      reference: row.reference,
      quantity: row.quantity,
      status: created ? 'created' : 'updated',
      message: created ? 'Product created and stock added' : 'Stock updated',
    })
  })

  saveMockState(state)
  return report
}

export function requestTransfer(input: {
  productId: number
  quantity: number
  fromStoreId: number
  toStoreId: number
  requestedBy: string
}): { ok: boolean; message: string } {
  const state = getMockState()
  const available = getStoreStockQty(state.stock, input.productId, input.fromStoreId)
  if (input.quantity <= 0) return { ok: false, message: 'Quantity must be greater than 0' }
  if (available < input.quantity) return { ok: false, message: 'Not enough stock in source store' }

  const req: TransferRequest = {
    id: nextId(state.transfers),
    productId: input.productId,
    quantity: input.quantity,
    fromStoreId: input.fromStoreId,
    toStoreId: input.toStoreId,
    requestedBy: input.requestedBy,
    requestedAt: nowIso(),
    status: 'PENDING',
  }
  state.transfers.unshift(req)

  const product = state.products.find((p) => p.id === input.productId)
  const fromStore = state.stores.find((s) => s.id === input.fromStoreId)
  const toStore = state.stores.find((s) => s.id === input.toStoreId)
  addAudit(
    state,
    input.requestedBy,
    'TRANSFER_REQUESTED',
    `Requested ${input.quantity} x ${product?.reference || 'Unknown'} from ${fromStore?.name || 'N/A'} to ${toStore?.name || 'N/A'}`,
  )

  saveMockState(state)
  return { ok: true, message: 'Transfer request created' }
}

export function approveTransfer(requestId: number, adminName: string, approve: boolean): { ok: boolean; message: string } {
  const state = getMockState()
  const req = state.transfers.find((x) => x.id === requestId)
  if (!req) return { ok: false, message: 'Transfer request not found' }
  if (req.status !== 'PENDING') return { ok: false, message: 'Transfer request already processed' }

  if (!approve) {
    req.status = 'REJECTED'
    req.approvedBy = adminName
    req.approvedAt = nowIso()
    addAudit(state, adminName, 'TRANSFER_REJECTED', `Rejected transfer request #${req.id}`)
    saveMockState(state)
    return { ok: true, message: 'Transfer rejected' }
  }

  const source = ensureStockRecord(state, req.productId, req.fromStoreId)
  const target = ensureStockRecord(state, req.productId, req.toStoreId)
  if (!removeFromStock(source, req.quantity)) {
    return { ok: false, message: 'Cannot approve transfer: source stock became insufficient' }
  }
  addToStock(target, req.quantity, 'NORMAL')

  req.status = 'APPROVED'
  req.approvedBy = adminName
  req.approvedAt = nowIso()

  state.movements.unshift({
    id: nextId(state.movements),
    createdAt: nowIso(),
    type: 'TRANSFER_OUT',
    productId: req.productId,
    quantity: req.quantity,
    storeId: req.fromStoreId,
    byUser: adminName,
    note: `Transfer #${req.id} approved`,
  })

  state.movements.unshift({
    id: nextId(state.movements),
    createdAt: nowIso(),
    type: 'TRANSFER_IN',
    productId: req.productId,
    quantity: req.quantity,
    storeId: req.toStoreId,
    byUser: adminName,
    note: `Transfer #${req.id} approved`,
  })

  addAudit(state, adminName, 'TRANSFER_APPROVED', `Approved transfer request #${req.id}`)
  saveMockState(state)
  return { ok: true, message: 'Transfer approved and executed' }
}

function nextInvoiceNumber(state: SeedState): string {
  const max = state.invoices.reduce((acc, inv) => {
    const parsed = Number(inv.invoiceNumber.replace('INV-', ''))
    return Number.isNaN(parsed) ? acc : Math.max(acc, parsed)
  }, 99)
  return `INV-${max + 1}`
}

export function createInvoice(input: {
  sellerName: string
  storeId: number
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  items: Array<{ productId: number; quantity: number }>
}): { ok: boolean; message: string } {
  const state = getMockState()

  if (input.items.length === 0) return { ok: false, message: 'Add at least one invoice line' }

  for (const item of input.items) {
    const available = getStoreStockQty(state.stock, item.productId, input.storeId)
    if (item.quantity <= 0 || available < item.quantity) {
      return { ok: false, message: 'Insufficient stock for one or more products' }
    }
  }

  const invoice: Invoice = {
    id: nextId(state.invoices),
    invoiceNumber: nextInvoiceNumber(state),
    storeId: input.storeId,
    seller: input.sellerName,
    createdAt: nowIso(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerAddress: input.customerAddress,
    items: input.items.map((item) => {
      const product = state.products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product?.sellingPrice || 0,
      }
    }),
    returnedItems: [],
    status: 'OPEN',
  }

  invoice.items.forEach((item) => {
    const stock = ensureStockRecord(state, item.productId, input.storeId)
    removeFromStock(stock, item.quantity)

    state.movements.unshift({
      id: nextId(state.movements),
      createdAt: nowIso(),
      type: 'OUT',
      productId: item.productId,
      quantity: item.quantity,
      storeId: input.storeId,
      byUser: input.sellerName,
      note: `Invoice ${invoice.invoiceNumber}`,
    })
  })

  state.invoices.unshift(invoice)
  addAudit(state, input.sellerName, 'INVOICE_CREATED', `Created ${invoice.invoiceNumber} in store ${input.storeId}`)
  saveMockState(state)

  return { ok: true, message: `${invoice.invoiceNumber} created` }
}

export function applyReturn(input: {
  invoiceId: number
  actor: string
  items: ReturnItem[]
}): { ok: boolean; message: string } {
  const state = getMockState()
  const invoice = state.invoices.find((inv) => inv.id === input.invoiceId)
  if (!invoice) return { ok: false, message: 'Invoice not found' }

  for (const item of input.items) {
    const soldQty = invoice.items.find((x) => x.productId === item.productId)?.quantity || 0
    const alreadyReturned = invoice.returnedItems.find((x) => x.productId === item.productId)?.quantity || 0
    if (item.quantity <= 0 || alreadyReturned + item.quantity > soldQty) {
      return { ok: false, message: 'Invalid return quantity' }
    }
  }

  input.items.forEach((item) => {
    const existing = invoice.returnedItems.find((x) => x.productId === item.productId)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      invoice.returnedItems.push({ productId: item.productId, quantity: item.quantity })
    }

    const stock = ensureStockRecord(state, item.productId, invoice.storeId)
    addToStock(stock, item.quantity, 'NORMAL')

    state.movements.unshift({
      id: nextId(state.movements),
      createdAt: nowIso(),
      type: 'RETURN',
      productId: item.productId,
      quantity: item.quantity,
      storeId: invoice.storeId,
      byUser: input.actor,
      note: `Return for ${invoice.invoiceNumber}`,
    })
  })

  const sold = invoice.items.reduce((sum, x) => sum + x.quantity, 0)
  const returned = invoice.returnedItems.reduce((sum, x) => sum + x.quantity, 0)
  invoice.status = returned === sold ? 'FULL_RETURN' : returned > 0 ? 'PARTIAL_RETURN' : 'OPEN'

  addAudit(state, input.actor, 'RETURN_PROCESSED', `Processed return for ${invoice.invoiceNumber}`)
  saveMockState(state)
  return { ok: true, message: 'Return processed' }
}

export function addExpense(input: { storeId: number; title: string; amount: number; actor: string }): { ok: boolean; message: string } {
  const state = getMockState()
  if (input.amount <= 0 || !input.title.trim()) {
    return { ok: false, message: 'Expense title and amount are required' }
  }

  const expense: Expense = {
    id: nextId(state.expenses),
    storeId: input.storeId,
    title: input.title,
    amount: input.amount,
    createdAt: nowIso(),
  }

  state.expenses.unshift(expense)
  addAudit(state, input.actor, 'EXPENSE_ADDED', `Added expense ${input.title} (${input.amount}) for store ${input.storeId}`)
  saveMockState(state)
  return { ok: true, message: 'Expense added' }
}

export function computeInvoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function computeReturnedTotal(invoice: Invoice): number {
  return invoice.returnedItems.reduce((sum, item) => {
    const sold = invoice.items.find((x) => x.productId === item.productId)
    return sum + (sold?.unitPrice || 0) * item.quantity
  }, 0)
}

export function getFinancialSummary(role: UserRole, storeId: number | null) {
  const state = getMockState()
  const scopedInvoices = role === 'Administrator' ? state.invoices : state.invoices.filter((x) => x.storeId === storeId)
  const scopedExpenses = role === 'Administrator' ? state.expenses : state.expenses.filter((x) => x.storeId === storeId)

  const sales = scopedInvoices.reduce((sum, inv) => sum + computeInvoiceTotal(inv), 0)
  const returns = scopedInvoices.reduce((sum, inv) => sum + computeReturnedTotal(inv), 0)
  const expenses = scopedExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  return {
    sales,
    returns,
    expenses,
    net: sales - returns - expenses,
    invoiceCount: scopedInvoices.length,
  }
}

export function availabilityForProduct(reference: string, currentStoreId: number) {
  const state = getMockState()
  const product = state.products.find((x) => x.reference.toLowerCase() === reference.toLowerCase())
  if (!product) return null

  const currentStore = state.stores.find((x) => x.id === currentStoreId)
  const currentQty = getStoreStockQty(state.stock, product.id, currentStoreId)

  const nearby = state.stores
    .filter((store) => store.id !== currentStoreId && store.region === currentStore?.region)
    .map((store) => ({
      store,
      quantity: getStoreStockQty(state.stock, product.id, store.id),
    }))
    .filter((x) => x.quantity > 0)

  const other = state.stores
    .filter((store) => store.id !== currentStoreId && store.region !== currentStore?.region)
    .map((store) => ({
      store,
      quantity: getStoreStockQty(state.stock, product.id, store.id),
    }))
    .filter((x) => x.quantity > 0)

  return {
    product,
    currentStore,
    currentQty,
    nearby,
    other,
    totalQty: getAllStockQty(state.stock, product.id),
  }
}

export function addUser(input: { name: string; email: string; role: UserRole; storeId: number | null }): { ok: boolean; message: string } {
  const state = getMockState()
  state.users.push({
    id: nextId(state.users),
    name: input.name,
    email: input.email,
    role: input.role,
    storeId: input.storeId,
    status: 'active',
  })
  addAudit(state, 'Administrator', 'USER_CREATED', `Created ${input.role} user ${input.name}`)
  saveMockState(state)
  return { ok: true, message: 'User added' }
}

export function addStore(input: { name: string; region: string; location: string }): { ok: boolean; message: string } {
  const state = getMockState()
  state.stores.push({
    id: nextId(state.stores),
    name: input.name,
    region: input.region,
    location: input.location,
    status: 'active',
  })
  addAudit(state, 'Administrator', 'STORE_CREATED', `Created store ${input.name}`)
  saveMockState(state)
  return { ok: true, message: 'Store added' }
}
