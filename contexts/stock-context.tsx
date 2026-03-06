"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface StockItem {
  id: string
  name: string
  category: string // Now uses category slug instead of hardcoded enum
  quantity: number
  unit: "kg" | "g" | "L" | "ml" | "pieces" | "sachets" | "boites"
  minQuantity: number
  unitPrice: number // Prix unitaire
  shelfLifeAfterOpening?: number // Durée de conservation après ouverture (en jours)
  supplier?: string
  lastUpdated: string
  batchNumber?: string // Added batch number for traceability
  receptionDate?: string // Date de réception pour gestion FIFO
}

export interface Supplier {
  id: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  type: "discount" | "free_item" | "special"
  value: string
  image?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Batch {
  id: string
  productId: string // Reference to StockItem
  supplierId?: string // Added supplier reference for traceability
  batchNumber: string
  quantity: number
  receptionDate: string // Date de réception (FIFO)
  productionDate?: string // Date de fabrication
  expirationDate: string // DLC du fabricant (produit fermé)
  openingDate?: string // Date d'ouverture du produit
  expirationAfterOpening?: string // Nouvelle DLC après ouverture
  isOpened: boolean // État du lot (fermé/ouvert)
  notes?: string // Notes spécifiques au lot
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string // Menu category (viennoiseries, patisseries, etc.)
  image?: string
  allergens: string[] // Gluten, Lait, Oeufs, Noix, etc.
  isAvailable: boolean
  tags?: string[] // Additional tags
  createdAt: string
  updatedAt: string
}

export interface MenuCategory {
  id: string
  name: string
  slug: string
  icon?: string
  order: number
  isActive: boolean
}

interface StockContextType {
  items: StockItem[]
  categories: Category[]
  suppliers: Supplier[]
  batches: Batch[]
  menuCategories: MenuCategory[]
  menuItems: MenuItem[]
  rewards: Reward[]
  addItem: (item: Omit<StockItem, "id" | "lastUpdated">) => void
  updateItem: (id: string, item: Partial<StockItem>) => void
  deleteItem: (id: string) => void
  addCategory: (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => void
  updateCategory: (id: string, category: Partial<Omit<Category, "id" | "createdAt">>) => void
  deleteCategory: (id: string) => void
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void
  updateSupplier: (id: string, supplier: Partial<Omit<Supplier, "id" | "createdAt">>) => void
  deleteSupplier: (id: string) => void
  addBatch: (batch: Omit<Batch, "id">) => void
  updateBatch: (id: string, batch: Partial<Batch>) => void
  deleteBatch: (id: string) => void
  openBatch: (id: string, openingDate: string) => void
  getBatchesByProduct: (productId: string) => Batch[]
  getActiveBatches: (productId: string) => Batch[]
  getArchivedBatches: (productId: string) => Batch[]
  getExpiringSoonBatches: () => Array<Batch & { productName: string }>
  getLowStockItems: () => StockItem[]
  addMenuCategory: (category: Omit<MenuCategory, "id" | "createdAt" | "updatedAt">) => void
  updateMenuCategory: (id: string, category: Partial<Omit<MenuCategory, "id" | "createdAt">>) => void
  deleteMenuCategory: (id: string) => void
  addMenuItem: (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => void
  updateMenuItem: (id: string, item: Partial<Omit<MenuItem, "id" | "createdAt">>) => void
  deleteMenuItem: (id: string) => void
  addReward: (reward: Omit<Reward, "id" | "createdAt" | "updatedAt">) => void
  updateReward: (id: string, reward: Partial<Omit<Reward, "id" | "createdAt">>) => void
  deleteReward: (id: string) => void
  getActiveRewards: () => Reward[]
}

const StockContext = createContext<StockContextType | undefined>(undefined)

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Farines & Céréales",
    slug: "farines",
    description: "Farines diverses, céréales et bases de pâtisserie",
    icon: "🌾",
    color: "#f59e0b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sucres & Édulcorants",
    slug: "sucres",
    description: "Sucres en poudre, glace, cassonade et édulcorants",
    icon: "🍬",
    color: "#ec4899",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Produits Laitiers",
    slug: "produits-laitiers",
    description: "Lait, crème, beurre, fromages",
    icon: "🥛",
    color: "#3b82f6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Œufs",
    slug: "oeufs",
    description: "Œufs frais, blancs, jaunes",
    icon: "🥚",
    color: "#fbbf24",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Chocolats & Cacao",
    slug: "chocolats",
    description: "Chocolat noir, lait, blanc, cacao en poudre",
    icon: "🍫",
    color: "#78350f",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Fruits Frais",
    slug: "fruits-frais",
    description: "Fruits frais de saison",
    icon: "🍓",
    color: "#ef4444",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Fruits Secs",
    slug: "fruits-secs",
    description: "Raisins secs, abricots, figues",
    icon: "🫐",
    color: "#a855f7",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Épices & Arômes",
    slug: "epices-aromes",
    description: "Vanille, cannelle, extraits, arômes",
    icon: "🌿",
    color: "#10b981",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Levures & Agents Levants",
    slug: "levures",
    description: "Levure fraîche, chimique, bicarbonate",
    icon: "⚗️",
    color: "#6366f1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Noix & Graines",
    slug: "noix-graines",
    description: "Amandes, noisettes, pistaches, graines",
    icon: "🥜",
    color: "#92400e",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "11",
    name: "Huiles & Matières Grasses",
    slug: "matieres-grasses",
    description: "Huiles végétales, beurre clarifié",
    icon: "🧈",
    color: "#eab308",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "12",
    name: "Décorations & Glaçages",
    slug: "decorations",
    description: "Pâte à sucre, colorants, décors",
    icon: "✨",
    color: "#f472b6",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "13",
    name: "Boissons (Café, Thé)",
    slug: "boissons",
    description: "Café, thé, infusions",
    icon: "☕",
    color: "#6b21a8",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "14",
    name: "Emballages",
    slug: "emballages",
    description: "Boîtes, sachets, papiers",
    icon: "📦",
    color: "#64748b",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "15",
    name: "Hygiène & Nettoyage",
    slug: "hygiene",
    description: "Produits de nettoyage et hygiène",
    icon: "🧹",
    color: "#06b6d4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "16",
    name: "Autre",
    slug: "autre",
    description: "Autres produits non classés",
    icon: "📋",
    color: "#6b7280",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialItems: StockItem[] = [
  {
    id: "1",
    name: "Farine T55",
    category: "farines",
    quantity: 45,
    unit: "kg",
    minQuantity: 20,
    unitPrice: 1.2,
    shelfLifeAfterOpening: 90, // 3 mois après ouverture
    supplier: "Moulins Viron",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sucre en poudre",
    category: "sucres",
    quantity: 15,
    unit: "kg",
    minQuantity: 25,
    unitPrice: 0.8,
    shelfLifeAfterOpening: 365, // 1 an après ouverture
    supplier: "Tereos",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Beurre AOP",
    category: "produits-laitiers",
    quantity: 18,
    unit: "kg",
    minQuantity: 15,
    unitPrice: 12.5,
    shelfLifeAfterOpening: 7, // 7 jours après ouverture
    supplier: "Isigny Sainte-Mère",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Œufs frais",
    category: "oeufs",
    quantity: 240,
    unit: "pieces",
    minQuantity: 180,
    unitPrice: 0.25,
    shelfLifeAfterOpening: 1, // 1 jour après cassage
    supplier: "Ferme locale",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Chocolat noir 70%",
    category: "chocolats",
    quantity: 8,
    unit: "kg",
    minQuantity: 10,
    unitPrice: 28.5,
    shelfLifeAfterOpening: 180, // 6 mois après ouverture
    supplier: "Valrhona",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Crème liquide 35%",
    category: "produits-laitiers",
    quantity: 12,
    unit: "L",
    minQuantity: 8,
    unitPrice: 3.5,
    shelfLifeAfterOpening: 3, // 3 jours après ouverture
    supplier: "Elle & Vire",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Amandes en poudre",
    category: "noix-graines",
    quantity: 5,
    unit: "kg",
    minQuantity: 3,
    unitPrice: 18.0,
    shelfLifeAfterOpening: 60, // 2 mois après ouverture
    supplier: "Barnier",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Vanille de Madagascar",
    category: "epices-aromes",
    quantity: 50,
    unit: "pieces",
    minQuantity: 30,
    unitPrice: 4.5,
    shelfLifeAfterOpening: 365, // 1 an après ouverture
    supplier: "Prova",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "9",
    name: "Café grains Arabica",
    category: "boissons",
    quantity: 10,
    unit: "kg",
    minQuantity: 5,
    unitPrice: 22.0,
    shelfLifeAfterOpening: 30, // 1 mois après ouverture
    supplier: "Lavazza",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "10",
    name: "Pâte à sucre blanche",
    category: "decorations",
    quantity: 3,
    unit: "kg",
    minQuantity: 2,
    unitPrice: 15.5,
    shelfLifeAfterOpening: 180, // 6 mois après ouverture
    supplier: "Scrapcooking",
    lastUpdated: new Date().toISOString(),
  },
]

const initialBatches: Batch[] = [
  {
    id: "b1",
    productId: "1",
    supplierId: "1", // Added supplier reference (Moulins Viron)
    batchNumber: "LOT2026001",
    quantity: 25,
    receptionDate: "2025-12-20",
    productionDate: "2025-12-15",
    expirationDate: "2026-06-15",
    isOpened: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b2",
    productId: "1",
    supplierId: "1", // Added supplier reference (Moulins Viron)
    batchNumber: "LOT2026011",
    quantity: 20,
    receptionDate: "2026-01-10",
    productionDate: "2026-01-05",
    expirationDate: "2026-07-05",
    openingDate: "2026-01-12",
    expirationAfterOpening: "2026-04-12",
    isOpened: true,
    notes: "Ouvert pour production croissants",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b3",
    productId: "3",
    supplierId: "3", // Added supplier reference (Isigny Sainte-Mère)
    batchNumber: "LOT2026003",
    quantity: 10,
    receptionDate: "2026-01-08",
    productionDate: "2026-01-05",
    expirationDate: "2026-02-28",
    isOpened: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b4",
    productId: "3",
    supplierId: "3", // Added supplier reference (Isigny Sainte-Mère)
    batchNumber: "LOT2026012",
    quantity: 8,
    receptionDate: "2026-01-15",
    productionDate: "2026-01-12",
    expirationDate: "2026-03-15",
    openingDate: "2026-01-16",
    expirationAfterOpening: "2026-01-23",
    isOpened: true,
    notes: "Ouvert pour feuilletage",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b5",
    productId: "6",
    supplierId: "3", // Added supplier reference (Isigny Sainte-Mère for crème)
    batchNumber: "LOT2026006",
    quantity: 12,
    receptionDate: "2026-01-20",
    productionDate: "2026-01-18",
    expirationDate: "2026-01-25",
    openingDate: "2026-01-21",
    expirationAfterOpening: "2026-01-24",
    isOpened: true,
    notes: "Ouvert pour chantilly",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Moulins Viron",
    contactName: "Pierre Dupont",
    email: "contact@moulins-viron.fr",
    phone: "+33 1 23 45 67 89",
    address: "12 Rue de la Meunerie, 75001 Paris",
    notes: "Fournisseur principal de farines biologiques",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Valrhona",
    contactName: "Sophie Martin",
    email: "pro@valrhona.com",
    phone: "+33 4 75 56 20 00",
    address: "26600 Tain-l'Hermitage",
    notes: "Chocolats de haute qualité",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Isigny Sainte-Mère",
    contactName: "Jean Bernard",
    email: "contact@isigny-ste-mere.com",
    phone: "+33 2 31 51 33 00",
    address: "2 Rue du Docteur Boutrois, 14230 Isigny-sur-Mer",
    notes: "Produits laitiers AOP, beurre et crème",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Ferme locale",
    contactName: "Marie Lefebvre",
    email: "ferme.locale@example.com",
    phone: "+33 6 12 34 56 78",
    address: "Route de la Ferme, 78000 Versailles",
    notes: "Œufs frais bio, livraison 2 fois par semaine",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Prova",
    contactName: "Laurent Dubois",
    email: "info@prova.fr",
    phone: "+33 4 93 45 67 89",
    address: "Zone Industrielle, 06200 Nice",
    notes: "Épices et arômes naturels",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialRewards: Reward[] = [
  {
    id: "r1",
    name: "Croissant Gratuit",
    description: "Un croissant artisanal offert",
    pointsCost: 50,
    type: "free_item",
    value: "1 croissant",
    image: "/golden-croissant.png",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r2",
    name: "Réduction 5 TND",
    description: "5 TND de réduction sur votre prochaine commande",
    pointsCost: 100,
    type: "discount",
    value: "5 TND",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r3",
    name: "Pâtisserie au Choix",
    description: "Une pâtisserie offerte parmi notre sélection",
    pointsCost: 150,
    type: "free_item",
    value: "1 pâtisserie",
    image: "/eclair-cafe.png",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r4",
    name: "Réduction 10 TND",
    description: "10 TND de réduction sur votre prochaine commande",
    pointsCost: 200,
    type: "discount",
    value: "10 TND",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r5",
    name: "Petit Déjeuner pour 2",
    description: "Formule petit déjeuner complète pour deux personnes",
    pointsCost: 300,
    type: "free_item",
    value: "Petit déjeuner duo",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r6",
    name: "Réduction 20 TND",
    description: "20 TND de réduction sur votre prochaine commande",
    pointsCost: 400,
    type: "discount",
    value: "20 TND",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "r7",
    name: "Gâteau Personnalisé",
    description: "Un gâteau personnalisé de 500g offert",
    pointsCost: 500,
    type: "special",
    value: "Gâteau 500g",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialMenuCategories: MenuCategory[] = [
  { id: "0", name: "Petit déjeuner", slug: "petit-dejeuner", icon: "🍳", order: 0, isActive: true },
  { id: "1", name: "Viennoiseries", slug: "viennoiseries", icon: "🥐", order: 1, isActive: true },
  { id: "2", name: "Pâtisseries", slug: "patisseries", icon: "🎂", order: 2, isActive: true },
  { id: "3", name: "Spécialités Tunisiennes", slug: "specialites-tunisiennes", icon: "⭐", order: 3, isActive: true },
  { id: "4", name: "Thés & Infusions", slug: "thes-infusions", icon: "☕", order: 4, isActive: true },
  { id: "5", name: "Boissons", slug: "boissons", icon: "🥤", order: 5, isActive: true },
]

const initialMenuItems: MenuItem[] = [
  {
    id: "0",
    name: "Petit Déjeuner Gourmand pour 2",
    description:
      "Assortiment complet pour deux personnes : 4 croissants frais, 2 pains au chocolat, 4 mini viennoiseries assorties, confiture maison (fraise & abricot), beurre AOP, jus d'orange pressé (500ml), 2 cafés ou thés au choix",
    price: 32.0,
    category: "petit-dejeuner",
    image: "/french-breakfast-table-with-croissants-and-coffee.jpg",
    allergens: ["Gluten", "Lait", "Oeufs"],
    isAvailable: true,
    tags: ["Pour 2 personnes", "Complet"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "00",
    name: "Petit Déjeuner Continental Duo",
    description:
      "Formule équilibrée pour deux : 2 croissants artisanaux, 2 pains tradition, fromage blanc fermier avec miel, salade de fruits frais de saison, 2 yaourts nature, jus multifruits (500ml), 2 expressos allongés ou cappuccinos",
    price: 28.5,
    category: "petit-dejeuner",
    image: "/continental-breakfast-with-bread-and-fresh-fruits.jpg",
    allergens: ["Gluten", "Lait"],
    isAvailable: true,
    tags: ["Pour 2 personnes", "Équilibré", "Fruits frais"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "1",
    name: "Croissant Artisanal",
    description: "Croissant pur beurre croustillant et fondant, préparé chaque matin",
    price: 4.5,
    category: "viennoiseries",
    image: "/golden-croissant.png",
    allergens: ["Gluten", "Lait"],
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Pain au Chocolat",
    description: "Viennoiserie pur beurre garnie de deux barres de chocolat noir",
    price: 5.5,
    category: "viennoiseries",
    image: "/pain-au-chocolat.png",
    allergens: ["Gluten", "Lait"],
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Éclair au Café",
    description: "Pâte à choux garnie de crème pâtissière au café, glaçage au café",
    price: 6.0,
    category: "patisseries",
    image: "/eclair-cafe.png",
    allergens: ["Gluten", "Lait", "Oeufs"],
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Makroud",
    description: "Pâtisserie tunisienne aux dattes et miel, parfumée à la fleur d'oranger",
    price: 3.5,
    category: "specialites-tunisiennes",
    image: "/makroud-tunisian-pastry.jpg",
    allergens: ["Gluten"],
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export function StockProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StockItem[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rewards, setRewards] = useState<Reward[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rewards")
      return saved ? JSON.parse(saved) : initialRewards
    }
    return initialRewards
  })
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("menuItems")
      return saved ? JSON.parse(saved) : initialMenuItems
    }
    return initialMenuItems
  })
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([])

  useEffect(() => {
    const storedItems = localStorage.getItem("pastry-stock")
    const storedBatches = localStorage.getItem("pastry-batches")
    const storedCategories = localStorage.getItem("pastry-categories")
    const storedSuppliers = localStorage.getItem("pastry-suppliers")
    const storedRewards = localStorage.getItem("pastry-rewards")
    const storedMenuItems = localStorage.getItem("pastry-menu-items")
    const storedMenuCategories = localStorage.getItem("pastry-menu-categories")

    if (storedItems) {
      setItems(JSON.parse(storedItems))
    } else {
      setItems(initialItems)
    }

    if (storedBatches) {
      setBatches(JSON.parse(storedBatches))
    } else {
      setBatches(initialBatches)
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories))
    } else {
      setCategories(initialCategories)
    }

    if (storedSuppliers) {
      setSuppliers(JSON.parse(storedSuppliers))
    } else {
      setSuppliers(initialSuppliers)
    }

    if (storedRewards) {
      setRewards(JSON.parse(storedRewards))
    } else {
      setRewards(initialRewards)
    }

    if (storedMenuItems) {
      setMenuItems(JSON.parse(storedMenuItems))
    } else {
      setMenuItems(initialMenuItems)
    }

    if (storedMenuCategories) {
      setMenuCategories(JSON.parse(storedMenuCategories))
    } else {
      setMenuCategories(initialMenuCategories)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-stock", JSON.stringify(items))
    }
  }, [items])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-batches", JSON.stringify(batches))
    }
  }, [batches])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-categories", JSON.stringify(categories))
    }
  }, [categories])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-suppliers", JSON.stringify(suppliers))
    }
  }, [suppliers])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-rewards", JSON.stringify(rewards))
    }
  }, [rewards])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-menu-items", JSON.stringify(menuItems))
    }
  }, [menuItems])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pastry-menu-categories", JSON.stringify(menuCategories))
    }
  }, [menuCategories])

  const addItem = (item: Omit<StockItem, "id" | "lastUpdated">) => {
    const newItem: StockItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString(),
    }
    setItems((prev) => [...prev, newItem])
  }

  const updateItem = (id: string, updates: Partial<StockItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item)),
    )
  }

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addCategory = (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, updates: Partial<Omit<Category, "id" | "createdAt">>) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id ? { ...category, ...updates, updatedAt: new Date().toISOString() } : category,
      ),
    )
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id))
    // Also remove items with this category
    setItems((prev) => prev.filter((item) => item.category !== categories.find((c) => c.id === id)?.slug))
  }

  const addSupplier = (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSuppliers((prev) => [...prev, newSupplier])
  }

  const updateSupplier = (id: string, updates: Partial<Omit<Supplier, "id" | "createdAt">>) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === id ? { ...supplier, ...updates, updatedAt: new Date().toISOString() } : supplier,
      ),
    )
  }

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id))
  }

  const getLowStockItems = () => {
    return items.filter((item) => item.quantity <= item.minQuantity)
  }

  const addBatch = (batch: Omit<Batch, "id">) => {
    const newBatch: Batch = {
      ...batch,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setBatches((prev) => [...prev, newBatch])

    // Update total quantity for the product
    updateProductQuantity(batch.productId)
  }

  const updateBatch = (id: string, updates: Partial<Batch>) => {
    setBatches((prev) => {
      const updated = prev.map((batch) =>
        batch.id === id ? { ...batch, ...updates, updatedAt: new Date().toISOString() } : batch,
      )
      const batch = updated.find((b) => b.id === id)
      if (batch) {
        updateProductQuantity(batch.productId)
      }
      return updated
    })
  }

  const deleteBatch = (id: string) => {
    const batch = batches.find((b) => b.id === id)
    if (batch) {
      setBatches((prev) => prev.filter((b) => b.id !== id))
      updateProductQuantity(batch.productId)
    }
  }

  const openBatch = (id: string, openingDate: string) => {
    const batch = batches.find((b) => b.id === id)
    if (!batch) return

    const product = items.find((item) => item.id === batch.productId)
    if (!product || !product.shelfLifeAfterOpening) return

    // Calculate new expiration date after opening
    const openDate = new Date(openingDate)
    openDate.setDate(openDate.getDate() + product.shelfLifeAfterOpening)

    updateBatch(id, {
      isOpened: true,
      openingDate: openingDate,
      expirationAfterOpening: openDate.toISOString().split("T")[0],
    })
  }

  const getBatchesByProduct = (productId: string) => {
    return batches
      .filter((batch) => batch.productId === productId)
      .sort((a, b) => new Date(a.receptionDate).getTime() - new Date(b.receptionDate).getTime())
  }

  const getActiveBatches = (productId: string) => {
    return batches
      .filter((batch) => batch.productId === productId && !batch.isOpened)
      .sort((a, b) => new Date(a.receptionDate).getTime() - new Date(b.receptionDate).getTime())
  }

  const getArchivedBatches = (productId: string) => {
    return batches
      .filter((batch) => batch.productId === productId && batch.isOpened)
      .sort((a, b) => new Date(a.openingDate!).getTime() - new Date(b.openingDate!).getTime())
  }

  const updateProductQuantity = (productId: string) => {
    const productBatches = batches.filter((b) => b.productId === productId)
    const totalQuantity = productBatches.reduce((sum, batch) => sum + batch.quantity, 0)

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: totalQuantity, lastUpdated: new Date().toISOString() } : item,
      ),
    )
  }

  const getExpiringSoonBatches = () => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    return batches
      .filter((batch) => {
        const expDate =
          batch.isOpened && batch.expirationAfterOpening
            ? new Date(batch.expirationAfterOpening)
            : new Date(batch.expirationDate)

        return expDate <= thirtyDaysFromNow && expDate >= new Date()
      })
      .map((batch) => {
        const productName = items.find((item) => item.id === batch.productId)?.name || ""
        return { ...batch, productName }
      })
  }

  const addMenuItem = (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setMenuItems((prev) => [...prev, newItem])
  }

  const updateMenuItem = (id: string, updates: Partial<Omit<MenuItem, "id" | "createdAt">>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item)),
    )
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addMenuCategory = (category: Omit<MenuCategory, "id" | "createdAt" | "updatedAt">) => {
    const newCategory: MenuCategory = {
      ...category,
      id: Date.now().toString(),
    }
    setMenuCategories((prev) => [...prev, newCategory])
  }

  const updateMenuCategory = (id: string, updates: Partial<Omit<MenuCategory, "id" | "createdAt">>) => {
    setMenuCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)))
  }

  const deleteMenuCategory = (id: string) => {
    setMenuCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const addReward = (reward: Omit<Reward, "id" | "createdAt" | "updatedAt">) => {
    const newReward: Reward = {
      ...reward,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRewards((prev) => [...prev, newReward])
  }

  const updateReward = (id: string, reward: Partial<Omit<Reward, "id" | "createdAt">>) => {
    setRewards((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              ...reward,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    )
  }

  const deleteReward = (id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id))
  }

  const getActiveRewards = () => {
    return rewards.filter((r) => r.isActive)
  }

  return (
    <StockContext.Provider
      value={{
        items,
        categories,
        suppliers,
        batches,
        menuCategories,
        menuItems,
        rewards,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addBatch,
        updateBatch,
        deleteBatch,
        openBatch,
        getBatchesByProduct,
        getActiveBatches,
        getArchivedBatches,
        getExpiringSoonBatches,
        getLowStockItems,
        addMenuCategory,
        updateMenuCategory,
        deleteMenuCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addReward,
        updateReward,
        deleteReward,
        getActiveRewards,
      }}
    >
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error("useStock must be used within StockProvider")
  }
  return context
}
