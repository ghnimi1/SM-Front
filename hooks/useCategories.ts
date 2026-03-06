"use client"

import { useState, useCallback } from "react"
import { CategoryService } from "@/services/category.service"
import type {
  Category,
  CategoryQueryParams,
  CategoryStatistics,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/lib/types"

// ─── State shape ──────────────────────────────────────────────────────────────

interface CategoriesState {
  categories: Category[]
  category: Category | null
  statistics: CategoryStatistics | null
  isLoading: boolean
  error: string | null
  // Pagination
  total: number
  page: number
  pages: number
  count: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    category: null,
    statistics: null,
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    pages: 1,
    count: 0,
  })

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const setLoading = (isLoading: boolean) =>
    setState((prev) => ({ ...prev, isLoading }))

  const setError = (error: string | null) =>
    setState((prev) => ({ ...prev, error, isLoading: false }))

  const clearError = useCallback(() => setError(null), [])

  /** Extract a human-readable message from an Axios error. */
  const extractError = (err: any): string =>
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    (Array.isArray(err?.response?.data?.errors)
      ? err.response.data.errors.join(", ")
      : null) ??
    "Une erreur est survenue"

  // ─── Fetch all categories ──────────────────────────────────────────────────

  const fetchCategories = useCallback(
    async (params?: CategoryQueryParams): Promise<Category[]> => {
      setLoading(true)
      setError(null)

      try {
        const response = await CategoryService.getAll(params)
        setState((prev) => ({
          ...prev,
          categories: response.data,
          total: response.total,
          page: response.page,
          pages: response.pages,
          count: response.count,
          isLoading: false,
          error: null,
        }))
        return response.data
      } catch (err: any) {
        setError(extractError(err))
        return []
      }
    },
    [],
  )

  // ─── Fetch single category by id ───────────────────────────────────────────

  const fetchCategory = useCallback(async (id: string): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await CategoryService.getById(id)
      setState((prev) => ({
        ...prev,
        category: response.data,
        isLoading: false,
        error: null,
      }))
      return response.data
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Fetch single category by slug ─────────────────────────────────────────

  const fetchCategoryBySlug = useCallback(
    async (slug: string): Promise<Category | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await CategoryService.getBySlug(slug)
        setState((prev) => ({
          ...prev,
          category: response.data,
          isLoading: false,
          error: null,
        }))
        return response.data
      } catch (err: any) {
        setError(extractError(err))
        return null
      }
    },
    [],
  )

  // ─── Fetch statistics ──────────────────────────────────────────────────────

  const fetchStatistics = useCallback(async (): Promise<CategoryStatistics | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await CategoryService.getStatistics()
      setState((prev) => ({
        ...prev,
        statistics: response.data,
        isLoading: false,
        error: null,
      }))
      return response.data
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Create category ───────────────────────────────────────────────────────

  const createCategory = useCallback(
    async (payload: CreateCategoryPayload): Promise<Category | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await CategoryService.create(payload)
        const created = response.data

        // Optimistically append to the local list
        setState((prev) => ({
          ...prev,
          categories: [...prev.categories, created],
          total: prev.total + 1,
          count: prev.count + 1,
          isLoading: false,
          error: null,
        }))

        return created
      } catch (err: any) {
        setError(extractError(err))
        return null
      }
    },
    [],
  )

  // ─── Update category ───────────────────────────────────────────────────────

  const updateCategory = useCallback(
    async (id: string, payload: UpdateCategoryPayload): Promise<Category | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await CategoryService.update(id, payload)
        const updated = response.data

        // Replace in local list
        setState((prev) => ({
          ...prev,
          categories: prev.categories.map((c) => (c._id === id ? updated : c)),
          category: prev.category?._id === id ? updated : prev.category,
          isLoading: false,
          error: null,
        }))

        return updated
      } catch (err: any) {
        setError(extractError(err))
        return null
      }
    },
    [],
  )

  // ─── Delete category ───────────────────────────────────────────────────────

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await CategoryService.delete(id)

      // Remove from local list
      setState((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c._id !== id),
        category: prev.category?._id === id ? null : prev.category,
        total: prev.total - 1,
        count: prev.count - 1,
        isLoading: false,
        error: null,
      }))

      return true
    } catch (err: any) {
      setError(extractError(err))
      return false
    }
  }, [])

  // ─── Deactivate category (soft delete) ─────────────────────────────────────

  const deactivateCategory = useCallback(async (id: string): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await CategoryService.deactivate(id)
      const updated = response.data

      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c._id === id ? updated : c)),
        category: prev.category?._id === id ? updated : prev.category,
        isLoading: false,
        error: null,
      }))

      return updated
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Activate category ─────────────────────────────────────────────────────

  const activateCategory = useCallback(async (id: string): Promise<Category | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await CategoryService.activate(id)
      const updated = response.data

      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c._id === id ? updated : c)),
        category: prev.category?._id === id ? updated : prev.category,
        isLoading: false,
        error: null,
      }))

      return updated
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Reset selected category ───────────────────────────────────────────────

  const resetCategory = useCallback(() => {
    setState((prev) => ({ ...prev, category: null }))
  }, [])

  return {
    // State
    categories: state.categories,
    category: state.category,
    statistics: state.statistics,
    isLoading: state.isLoading,
    error: state.error,
    total: state.total,
    page: state.page,
    pages: state.pages,
    count: state.count,

    // Actions
    fetchCategories,
    fetchCategory,
    fetchCategoryBySlug,
    fetchStatistics,
    createCategory,
    updateCategory,
    deleteCategory,
    deactivateCategory,
    activateCategory,
    resetCategory,
    clearError,
  }
}
