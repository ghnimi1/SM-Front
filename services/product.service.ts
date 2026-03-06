import api from "@/lib/api"
import type {
  CreateProductPayload,
  MessageResponse,
  ProductListResponse,
  ProductQueryParams,
  ProductResponse,
  ProductStatisticsResponse,
  UpdateProductPayload,
  UpdateQuantityPayload,
} from "@/lib/types"

export const ProductService = {
  /**
   * GET /products
   * Returns a list of products with optional filters (category, search, isActive).
   */
  async getAll(params?: ProductQueryParams): Promise<ProductListResponse> {
    const { data } = await api.get<ProductListResponse>("/products", { params })
    return data
  },

  /**
   * GET /products/:id
   * Returns a single product by its MongoDB ObjectId.
   */
  async getById(id: string): Promise<ProductResponse> {
    const { data } = await api.get<ProductResponse>(`/products/${id}`)
    return data
  },

  /**
   * GET /products/statistics
   * Returns aggregate statistics: total, low-stock, out-of-stock, inventory value.
   */
  async getStatistics(): Promise<ProductStatisticsResponse> {
    const { data } = await api.get<ProductStatisticsResponse>("/products/statistics")
    return data
  },

  /**
   * GET /products/low-stock
   * Returns all products whose quantity is <= minQuantity.
   */
  async getLowStock(): Promise<ProductListResponse> {
    const { data } = await api.get<ProductListResponse>("/products/low-stock")
    return data
  },

  /**
   * POST /products
   * Creates a new product.
   */
  async create(payload: CreateProductPayload): Promise<ProductResponse> {
    const { data } = await api.post<ProductResponse>("/products", payload)
    return data
  },

  /**
   * PUT /products/:id
   * Fully updates an existing product by id.
   */
  async update(id: string, payload: UpdateProductPayload): Promise<ProductResponse> {
    const { data } = await api.put<ProductResponse>(`/products/${id}`, payload)
    return data
  },

  /**
   * PATCH /products/:id/quantity
   * Sets or adjusts the quantity of a product.
   * Pass { quantity } to set an exact value, or { adjustment } for a delta.
   */
  async updateQuantity(id: string, payload: UpdateQuantityPayload): Promise<ProductResponse> {
    const { data } = await api.patch<ProductResponse>(`/products/${id}/quantity`, payload)
    return data
  },

  /**
   * PATCH /products/:id/deactivate
   * Soft-deletes a product (sets isActive = false).
   */
  async deactivate(id: string): Promise<ProductResponse> {
    const { data } = await api.patch<ProductResponse>(`/products/${id}/deactivate`)
    return data
  },

  /**
   * DELETE /products/:id
   * Permanently deletes a product by id.
   */
  async delete(id: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/products/${id}`)
    return data
  },
}
