// Centralized seed data for the frontend (no backend / no database).
// All pages read their mock data from here so the demo stays consistent.

export type UserRole = 'Administrator' | 'Branch Manager' | 'Viewer'

export interface SeedUser {
  id: number
  name: string
  email: string
  role: UserRole
  branch: string
  status: 'active' | 'inactive'
}

export interface Branch {
  id: number
  name: string
  location: string
  manager: string
  status: 'active' | 'inactive'
}

export interface Part {
  id: number
  code: string
  name: string
  category: string
  unit: string
  price: number
  totalStock: number
}

export interface StockPerBranch {
  name: string
  qty: number
}

export interface StockItem {
  id: number
  partName: string
  partCode: string
  category: string
  stock: number
  unit: string
  branches: StockPerBranch[]
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  price: string
}

export type MovementType = 'IN' | 'OUT' | 'TRANSFER'

export interface Movement {
  id: number
  date: string
  time: string
  type: MovementType
  part: string
  code: string
  quantity: number
  branch: string
  user: string
  reference: string
}

// --- Demo accounts (one per role, used by the login quick-access buttons) ---
export const demoAccounts: { role: UserRole; name: string; email: string; description: string }[] = [
  {
    role: 'Administrator',
    name: 'Sarah Admin',
    email: 'admin@inventorypro.com',
    description: 'Acces total : utilisateurs, agences, catalogue et toutes les agences',
  },
  {
    role: 'Branch Manager',
    name: 'John Manager',
    email: 'manager@inventorypro.com',
    description: 'Gere le stock et les mouvements d une agence',
  },
  {
    role: 'Viewer',
    name: 'Mike Viewer',
    email: 'viewer@inventorypro.com',
    description: 'Lecture seule : consultation du stock et historique des mouvements',
  },
]

// --- Branches ---
export const branches: Branch[] = [
  { id: 1, name: 'Agence A', location: 'Siege principal', manager: 'John Manager', status: 'active' },
  { id: 2, name: 'Agence B', location: 'Centre-ville', manager: 'Jane Smith', status: 'active' },
  { id: 3, name: 'Agence C', location: 'Cote Est', manager: 'Mike Johnson', status: 'active' },
  { id: 4, name: 'Agence D', location: 'Cote Ouest', manager: 'Tom Davis', status: 'active' },
]

// --- Users ---
export const users: SeedUser[] = [
  { id: 1, name: 'Sarah Admin', email: 'admin@inventorypro.com', role: 'Administrator', branch: 'Toutes les agences', status: 'active' },
  { id: 2, name: 'John Manager', email: 'manager@inventorypro.com', role: 'Branch Manager', branch: 'Agence A', status: 'active' },
  { id: 3, name: 'Mike Viewer', email: 'viewer@inventorypro.com', role: 'Viewer', branch: 'Agence B', status: 'active' },
  { id: 4, name: 'Jane Smith', email: 'jane@inventorypro.com', role: 'Branch Manager', branch: 'Agence B', status: 'active' },
]

// --- Parts catalog ---
export const parts: Part[] = [
  { id: 1, code: 'CAR-001', name: 'Carburateur', category: 'Moteur', unit: 'pcs', price: 89.99, totalStock: 45 },
  { id: 2, code: 'OIL-002', name: 'Filtre a huile', category: 'Filtres', unit: 'pcs', price: 12.5, totalStock: 120 },
  { id: 3, code: 'BRK-003', name: 'Plaquettes de frein', category: 'Freinage', unit: 'sets', price: 34.99, totalStock: 8 },
  { id: 4, code: 'SPK-004', name: 'Bougies d allumage', category: 'Allumage', unit: 'pcs', price: 8.99, totalStock: 0 },
  { id: 5, code: 'BAT-005', name: 'Batterie 12V', category: 'Electrique', unit: 'pcs', price: 120.0, totalStock: 25 },
]

// --- Distribution des stocks par agence (utilisee par la consultation) ---
export const stockItems: StockItem[] = [
  {
    id: 1,
    partName: 'Carburateur',
    partCode: 'CAR-001',
    category: 'Moteur',
    stock: 45,
    unit: 'pcs',
    branches: [
      { name: 'Agence A', qty: 20 },
      { name: 'Agence B', qty: 15 },
      { name: 'Agence C', qty: 10 },
    ],
    status: 'in-stock',
    price: '$89.99',
  },
  {
    id: 2,
    partName: 'Filtre a huile',
    partCode: 'OIL-002',
    category: 'Filtres',
    stock: 120,
    unit: 'pcs',
    branches: [
      { name: 'Agence A', qty: 50 },
      { name: 'Agence D', qty: 70 },
    ],
    status: 'in-stock',
    price: '$12.50',
  },
  {
    id: 3,
    partName: 'Plaquettes de frein',
    partCode: 'BRK-003',
    category: 'Freinage',
    stock: 8,
    unit: 'sets',
    branches: [{ name: 'Agence C', qty: 8 }],
    status: 'low-stock',
    price: '$34.99',
  },
  {
    id: 4,
    partName: 'Bougies d allumage',
    partCode: 'SPK-004',
    category: 'Allumage',
    stock: 0,
    unit: 'pcs',
    branches: [],
    status: 'out-of-stock',
    price: '$8.99',
  },
]

// --- Historique des mouvements ---
export const movements: Movement[] = [
  { id: 1, date: '2024-06-02', time: '14:30', type: 'IN', part: 'Carburateur', code: 'CAR-001', quantity: 50, branch: 'Agence A', user: 'John Manager', reference: 'PO-2024-001' },
  { id: 2, date: '2024-06-02', time: '13:15', type: 'OUT', part: 'Filtre a huile', code: 'OIL-002', quantity: 100, branch: 'Agence B', user: 'Jane Smith', reference: 'SO-2024-156' },
  { id: 3, date: '2024-06-01', time: '10:45', type: 'IN', part: 'Bougies d allumage', code: 'SPK-004', quantity: 200, branch: 'Agence C', user: 'Mike Johnson', reference: 'PO-2024-002' },
  { id: 4, date: '2024-06-01', time: '09:20', type: 'OUT', part: 'Plaquettes de frein', code: 'BRK-003', quantity: 75, branch: 'Agence A', user: 'Sarah Wilson', reference: 'SO-2024-155' },
  { id: 5, date: '2024-05-31', time: '16:00', type: 'IN', part: 'Batterie 12V', code: 'BAT-005', quantity: 30, branch: 'Agence D', user: 'Tom Davis', reference: 'PO-2024-003' },
  { id: 6, date: '2024-05-31', time: '11:30', type: 'TRANSFER', part: 'Filtre a huile', code: 'OIL-002', quantity: 20, branch: 'Agence B → Agence A', user: 'John Manager', reference: 'TR-2024-001' },
]
