export type UserRole = 'Administrator' | 'Store Manager' | 'Seller'

export type StockClass = 'NORMAL' | 'CABA'
export type MovementType = 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN'
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Store {
  id: number
  name: string
  region: string
  location: string
  status: 'active' | 'inactive'
}

export interface SeedUser {
  id: number
  name: string
  email: string
  role: UserRole
  storeId: number | null
  status: 'active' | 'inactive'
}

export interface Product {
  id: number
  reference: string
  name: string
  category?: string
  sellingPrice: number
}

export interface StockRecord {
  productId: number
  storeId: number
  normalQty: number
  cabaQty: number
}

export interface Movement {
  id: number
  createdAt: string
  type: MovementType
  productId: number
  quantity: number
  storeId: number
  byUser: string
  note: string
}

export interface TransferRequest {
  id: number
  productId: number
  quantity: number
  fromStoreId: number
  toStoreId: number
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  status: TransferStatus
}

export interface InvoiceItem {
  productId: number
  quantity: number
  unitPrice: number
}

export interface ReturnItem {
  productId: number
  quantity: number
}

export interface Invoice {
  id: number
  invoiceNumber: string
  storeId: number
  seller: string
  createdAt: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  items: InvoiceItem[]
  returnedItems: ReturnItem[]
  status: 'OPEN' | 'PARTIAL_RETURN' | 'FULL_RETURN'
}

export interface Expense {
  id: number
  storeId: number
  title: string
  amount: number
  createdAt: string
}

export interface AuditEntry {
  id: number
  createdAt: string
  actor: string
  action: string
  details: string
}

export interface SeedState {
  users: SeedUser[]
  stores: Store[]
  products: Product[]
  stock: StockRecord[]
  movements: Movement[]
  transfers: TransferRequest[]
  invoices: Invoice[]
  expenses: Expense[]
  audit: AuditEntry[]
}

export const demoAccounts: { role: UserRole; name: string; email: string; storeId: number | null; description: string }[] = [
  {
    role: 'Administrator',
    name: 'Sarah Admin',
    email: 'admin@inventorypro.com',
    storeId: null,
    description: 'Global inventory, finance, users, transfer approvals, Normal/CABA reports',
  },
  {
    role: 'Store Manager',
    name: 'Karim Manager',
    email: 'manager@inventorypro.com',
    storeId: 1,
    description: 'Manage one store stock, invoices, returns, expenses and transfer requests',
  },
  {
    role: 'Seller',
    name: 'Nadia Seller',
    email: 'seller@inventorypro.com',
    storeId: 1,
    description: 'Sales operations, invoice creation and intelligent product availability search',
  },
]

export const initialState: SeedState = {
  stores: [
    { id: 1, name: 'Store A', region: 'North', location: 'Algiers Center', status: 'active' },
    { id: 2, name: 'Store B', region: 'North', location: 'Bab Ezzouar', status: 'active' },
    { id: 3, name: 'Store C', region: 'East', location: 'Constantine', status: 'active' },
    { id: 4, name: 'Store D', region: 'West', location: 'Oran', status: 'active' },
  ],
  users: [
    { id: 1, name: 'Sarah Admin', email: 'admin@inventorypro.com', role: 'Administrator', storeId: null, status: 'active' },
    { id: 2, name: 'Karim Manager', email: 'manager@inventorypro.com', role: 'Store Manager', storeId: 1, status: 'active' },
    { id: 3, name: 'Nadia Seller', email: 'seller@inventorypro.com', role: 'Seller', storeId: 1, status: 'active' },
    { id: 4, name: 'Sonia Manager', email: 'manager.b@inventorypro.com', role: 'Store Manager', storeId: 2, status: 'active' },
  ],
  products: [
    { id: 1, reference: 'CAB-001', name: 'Cable', category: 'Electric', sellingPrice: 1200 },
    { id: 2, reference: 'FIL-002', name: 'Filter', category: 'Maintenance', sellingPrice: 1900 },
    { id: 3, reference: 'BAT-003', name: 'Battery 12V', category: 'Power', sellingPrice: 12500 },
    { id: 4, reference: 'SPK-004', name: 'Spark Plug', category: 'Engine', sellingPrice: 650 },
  ],
  stock: [
    { productId: 1, storeId: 1, normalQty: 5, cabaQty: 10 },
    { productId: 1, storeId: 2, normalQty: 6, cabaQty: 4 },
    { productId: 1, storeId: 3, normalQty: 3, cabaQty: 12 },
    { productId: 1, storeId: 4, normalQty: 10, cabaQty: 20 },
    { productId: 2, storeId: 1, normalQty: 20, cabaQty: 5 },
    { productId: 2, storeId: 2, normalQty: 7, cabaQty: 8 },
    { productId: 2, storeId: 3, normalQty: 2, cabaQty: 0 },
    { productId: 3, storeId: 1, normalQty: 4, cabaQty: 1 },
    { productId: 3, storeId: 4, normalQty: 9, cabaQty: 3 },
    { productId: 4, storeId: 1, normalQty: 0, cabaQty: 15 },
    { productId: 4, storeId: 2, normalQty: 1, cabaQty: 3 },
  ],
  movements: [
    {
      id: 1,
      createdAt: '2026-06-01T09:10:00.000Z',
      type: 'IN',
      productId: 1,
      quantity: 10,
      storeId: 1,
      byUser: 'Karim Manager',
      note: 'Manual stock entry',
    },
    {
      id: 2,
      createdAt: '2026-06-02T11:30:00.000Z',
      type: 'OUT',
      productId: 2,
      quantity: 4,
      storeId: 1,
      byUser: 'Nadia Seller',
      note: 'Invoice INV-102',
    },
  ],
  transfers: [
    {
      id: 1,
      productId: 1,
      quantity: 8,
      fromStoreId: 2,
      toStoreId: 1,
      requestedBy: 'Sonia Manager',
      requestedAt: '2026-06-02T14:00:00.000Z',
      status: 'PENDING',
    },
  ],
  invoices: [
    {
      id: 1,
      invoiceNumber: 'INV-100',
      storeId: 1,
      seller: 'Nadia Seller',
      createdAt: '2026-06-01T16:20:00.000Z',
      customerName: 'Ali B.',
      customerPhone: '0555000011',
      items: [
        { productId: 1, quantity: 5, unitPrice: 1200 },
        { productId: 2, quantity: 2, unitPrice: 1900 },
      ],
      returnedItems: [],
      status: 'OPEN',
    },
    {
      id: 2,
      invoiceNumber: 'INV-101',
      storeId: 2,
      seller: 'Seller B',
      createdAt: '2026-06-02T10:00:00.000Z',
      items: [{ productId: 1, quantity: 3, unitPrice: 1200 }],
      returnedItems: [{ productId: 1, quantity: 1 }],
      status: 'PARTIAL_RETURN',
    },
  ],
  expenses: [
    { id: 1, storeId: 1, title: 'Delivery Truck', amount: 15000, createdAt: '2026-06-01T08:00:00.000Z' },
    { id: 2, storeId: 1, title: 'Packaging', amount: 4200, createdAt: '2026-06-02T08:00:00.000Z' },
    { id: 3, storeId: 2, title: 'Store Maintenance', amount: 7300, createdAt: '2026-06-02T08:00:00.000Z' },
  ],
  audit: [
    {
      id: 1,
      createdAt: '2026-06-01T09:10:00.000Z',
      actor: 'Karim Manager',
      action: 'STOCK_ENTRY',
      details: 'Added 10 units of CAB-001 in Store A',
    },
    {
      id: 2,
      createdAt: '2026-06-02T10:05:00.000Z',
      actor: 'Nadia Seller',
      action: 'INVOICE_CREATED',
      details: 'Created INV-101 in Store A',
    },
    {
      id: 3,
      createdAt: '2026-06-02T14:00:00.000Z',
      actor: 'Sonia Manager',
      action: 'TRANSFER_REQUESTED',
      details: 'Requested 8 x CAB-001 from Store B to Store A',
    },
  ],
}
