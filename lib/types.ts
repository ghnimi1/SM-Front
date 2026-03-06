// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user" | "client";

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  loyaltyPoints?: number;
  loyaltyTier?: LoyaltyTier;
  totalSpent?: number;
}

// ─── Auth API payloads ────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Auth API responses ───────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Category API payloads ────────────────────────────────────────────────────

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryQueryParams {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Category API responses ───────────────────────────────────────────────────

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
  count: number;
  total: number;
  page: number;
  pages: number;
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

export interface CategoryStatistics {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
}

export interface CategoryStatisticsResponse {
  success: boolean;
  data: CategoryStatistics;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  category: Category | string;
  quantity: number;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  shelfLifeAfterOpening?: number;
  supplier?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Product API payloads ─────────────────────────────────────────────────────

export interface CreateProductPayload {
  name: string;
  category: string;
  quantity?: number;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  shelfLifeAfterOpening?: number;
  supplier?: string;
}

export interface UpdateProductPayload {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minQuantity?: number;
  unitPrice?: number;
  shelfLifeAfterOpening?: number;
  supplier?: string;
  isActive?: boolean;
}

export interface UpdateQuantityPayload {
  /** Set exact quantity */
  quantity?: number;
  /** Or adjust by a delta (positive or negative) */
  adjustment?: number;
}

export interface ProductQueryParams {
  category?: string;
  search?: string;
  isActive?: boolean;
}

// ─── Product API responses ────────────────────────────────────────────────────

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  count: number;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface ProductStatistics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
}

export interface ProductStatisticsResponse {
  success: boolean;
  data: ProductStatistics;
}

// ─── Generic API error ────────────────────────────────────────────────────────

export interface ApiError {
  error?: string;
  message?: string;
  errors?: string[];
  success: false;
}
