"use client"

import { useState, useCallback } from "react"
import { ProductService } from "@/services/product.service"
import type {
  Product,
  ProductQueryParams,
  ProductStatistics,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateQuantityPayload,
} from "@/lib/types"

// ─── State shape ──────────────────────────────────────────────────────────────

interface ProductsState {
  products: Product[]
  product: Product | null
  lowStockProducts: Product[]
  statistics: ProductStatistics | null
  isLoading: boolean
  error: string | null
  count: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts() {
  const [state, setState] = useState<ProductsState>({
    products: [],
    product: null,
    lowStockProducts: [],
    statistics: null,
    isLoading: false,
    error: null,
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

  // ─── Fetch all products ────────────────────────────────────────────────────

  const fetchProducts = useCallback(
    async (params?: ProductQueryParams): Promise<Product[]> => {
      setLoading(true)
      setError(null)

      try {
        const response = await ProductService.getAll(params)
        setState((prev) => ({
          ...prev,
          products: response.data,
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

  // ─── Fetch single product by id ────────────────────────────────────────────

  const fetchProduct = useCallback(async (id: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await ProductService.getById(id)
      setState((prev) => ({
        ...prev,
        product: response.data,
        isLoading: false,
        error: null,
      }))
      return response.data
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Fetch statistics ──────────────────────────────────────────────────────

  const fetchStatistics = useCallback(async (): Promise<ProductStatistics | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await ProductService.getStatistics()
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

  // ─── Fetch low stock products ──────────────────────────────────────────────

  const fetchLowStock = useCallback(async (): Promise<Product[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await ProductService.getLowStock()
      setState((prev) => ({
        ...prev,
        lowStockProducts: response.data,
        isLoading: false,
        error: null,
      }))
      return response.data
    } catch (err: any) {
      setError(extractError(err))
      return []
    }
  }, [])

  // ─── Create product ────────────────────────────────────────────────────────

  const createProduct = useCallback(
    async (payload: CreateProductPayload): Promise<Product | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await ProductService.create(payload)
        const created = response.data

        // Optimistically append to the local list
        setState((prev) => ({
          ...prev,
          products: [...prev.products, created],
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

  // ─── Update product ────────────────────────────────────────────────────────

  const updateProduct = useCallback(
    async (id: string, payload: UpdateProductPayload): Promise<Product | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await ProductService.update(id, payload)
        const updated = response.data

        // Replace in local list
        setState((prev) => ({
          ...prev,
          products: prev.products.map((p) => (p._id === id ? updated : p)),
          product: prev.product?._id === id ? updated : prev.product,
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

  // ─── Update product quantity ───────────────────────────────────────────────

  const updateQuantity = useCallback(
    async (id: string, payload: UpdateQuantityPayload): Promise<Product | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await ProductService.updateQuantity(id, payload)
        const updated = response.data

        // Replace in both the main list and the low-stock list
        setState((prev) => ({
          ...prev,
          products: prev.products.map((p) => (p._id === id ? updated : p)),
          product: prev.product?._id === id ? updated : prev.product,
          lowStockProducts: prev.lowStockProducts.map((p) =>
            p._id === id ? updated : p,
          ),
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

  // ─── Deactivate product (soft delete) ──────────────────────────────────────

  const deactivateProduct = useCallback(async (id: string): Promise<Product | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await ProductService.deactivate(id)
      const updated = response.data

      setState((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p._id === id ? updated : p)),
        product: prev.product?._id === id ? updated : prev.product,
        isLoading: false,
        error: null,
      }))

      return updated
    } catch (err: any) {
      setError(extractError(err))
      return null
    }
  }, [])

  // ─── Delete product (permanent) ────────────────────────────────────────────

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await ProductService.delete(id)

      // Remove from all local lists
      setState((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p._id !== id),
        lowStockProducts: prev.lowStockProducts.filter((p) => p._id !== id),
        product: prev.product?._id === id ? null : prev.product,
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

  // ─── Reset selected product ────────────────────────────────────────────────

  const resetProduct = useCallback(() => {
    setState((prev) => ({ ...prev, product: null }))
  }, [])

  // ─── Derived helpers ───────────────────────────────────────────────────────

  /** Returns products filtered by category id (client-side shortcut). */
  const getProductsByCategory = useCallback(
    (categoryId: string): Product[] => {
      return state.products.filter((p) => {
        const cat = p.category
        if (typeof cat === "string") return cat === categoryId
        return cat._id === categoryId
      })
    },
    [state.products],
  )

  /** Returns true if a product quantity is at or below its minQuantity. */
  const isLowStock = useCallback((product: Product): boolean => {
    return product.quantity <= product.minQuantity
  }, [])

  /** Returns true if a product is out of stock. */
  const isOutOfStock = useCallback((product: Product): boolean => {
    return product.quantity === 0
  }, [])

  return {
    // State
    products: state.products,
    product: state.product,
    lowStockProducts: state.lowStockProducts,
    statistics: state.statistics,
    isLoading: state.isLoading,
    error: state.error,
    count: state.count,

    // Actions
    fetchProducts,
    fetchProduct,
    fetchStatistics,
    fetchLowStock,
    createProduct,
    updateProduct,
    updateQuantity,
    deactivateProduct,
    deleteProduct,
    resetProduct,
    clearError,

    // Derived helpers
    getProductsByCategory,
    isLowStock,
    isOutOfStock,
  }
}
