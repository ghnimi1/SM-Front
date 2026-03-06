import api from "@/lib/api"
import type {
  CategoryListResponse,
  CategoryQueryParams,
  CategoryResponse,
  CategoryStatisticsResponse,
  CreateCategoryPayload,
  MessageResponse,
  UpdateCategoryPayload,
} from "@/lib/types"

export const CategoryService = {
  /**
   * GET /categories
   * Returns a paginated list of categories with optional filters.
   */
  async getAll(params?: CategoryQueryParams): Promise<CategoryListResponse> {
    const { data } = await api.get<CategoryListResponse>("/categories", { params })
    return data
  },

  /**
   * GET /categories/:id
   * Returns a single category by its MongoDB ObjectId.
   */
  async getById(id: string): Promise<CategoryResponse> {
    const { data } = await api.get<CategoryResponse>(`/categories/${id}`)
    return data
  },

  /**
   * GET /categories/slug/:slug
   * Returns a single category by its slug.
   */
  async getBySlug(slug: string): Promise<CategoryResponse> {
    const { data } = await api.get<CategoryResponse>(`/categories/slug/${slug}`)
    return data
  },

  /**
   * GET /categories/statistics
   * Returns aggregate statistics for all categories.
   */
  async getStatistics(): Promise<CategoryStatisticsResponse> {
    const { data } = await api.get<CategoryStatisticsResponse>("/categories/statistics")
    return data
  },

  /**
   * POST /categories
   * Creates a new category.
   */
  async create(payload: CreateCategoryPayload): Promise<CategoryResponse> {
    const { data } = await api.post<CategoryResponse>("/categories", payload)
    return data
  },

  /**
   * PUT /categories/:id
   * Updates an existing category by id.
   */
  async update(id: string, payload: UpdateCategoryPayload): Promise<CategoryResponse> {
    const { data } = await api.put<CategoryResponse>(`/categories/${id}`, payload)
    return data
  },

  /**
   * PATCH /categories/:id/deactivate
   * Soft-deletes a category (sets isActive = false).
   */
  async deactivate(id: string): Promise<CategoryResponse> {
    const { data } = await api.patch<CategoryResponse>(`/categories/${id}/deactivate`)
    return data
  },

  /**
   * PATCH /categories/:id/activate
   * Re-activates a previously deactivated category.
   */
  async activate(id: string): Promise<CategoryResponse> {
    const { data } = await api.patch<CategoryResponse>(`/categories/${id}/activate`)
    return data
  },

  /**
   * DELETE /categories/:id
   * Permanently deletes a category by id.
   */
  async delete(id: string): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>(`/categories/${id}`)
    return data
  },
}
