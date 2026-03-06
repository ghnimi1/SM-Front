import api from "@/lib/api"

export interface Batch {
  id?: string
  _id?: string
  productId: string
  batchNumber: string
  quantity: number
  supplierId?: string
  receptionDate: string
  productionDate?: string
  expirationDate: string
  expirationAfterOpening?: string
  isOpened: boolean
  openingDate?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateBatchPayload {
  productId: string
  batchNumber: string
  quantity: number
  supplierId?: string
  receptionDate: string
  productionDate?: string
  expirationDate: string
  notes?: string
}

export interface UpdateBatchPayload {
  quantity?: number
  notes?: string
}

export interface OpenBatchPayload {
  openingDate: string
  expirationAfterOpening: string
}

class BatchService {
  /**
   * Get all batches with optional filters
   */
  async getAll(filters?: { productId?: string; isOpened?: boolean }) {
    try {
      const response = await api.get<Batch[]>("/batches", { params: filters })
      return response.data
    } catch (error) {
      console.error("Error fetching all batches:", error)
      throw error
    }
  }

  /**
   * Get batches for a specific product
   */
  async getByProduct(productId: string) {
    try {
      const response = await api.get<Batch[]>(`/batches/product/${productId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching batches for product ${productId}:`, error)
      throw error
    }
  }

  /**
   * Get a single batch by ID
   */
  async getById(batchId: string) {
    try {
      const response = await api.get<Batch>(`/batches/${batchId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching batch ${batchId}:`, error)
      throw error
    }
  }

  /**
   * Get expiring soon batches
   */
  async getExpiringSoon(days: number = 7) {
    try {
      const response = await api.get<Batch[]>("/batches/status/expiring-soon", {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching expiring soon batches:", error)
      throw error
    }
  }

  /**
   * Get expired batches
   */
  async getExpired() {
    try {
      const response = await api.get<Batch[]>("/batches/status/expired")
      return response.data
    } catch (error) {
      console.error("Error fetching expired batches:", error)
      throw error
    }
  }

  /**
   * Create a new batch
   */
  async create(payload: CreateBatchPayload) {
    try {
      const response = await api.post<Batch>("/batches", payload)
      return response.data
    } catch (error) {
      console.error("Error creating batch:", error)
      throw error
    }
  }

  /**
   * Update a batch
   */
  async update(batchId: string, payload: UpdateBatchPayload) {
    try {
      const response = await api.put<Batch>(`/batches/${batchId}`, payload)
      return response.data
    } catch (error) {
      console.error(`Error updating batch ${batchId}:`, error)
      throw error
    }
  }

  /**
   * Open a batch
   */
  async open(batchId: string, payload: OpenBatchPayload) {
    try {
      const response = await api.patch<Batch>(`/batches/${batchId}/open`, payload)
      return response.data
    } catch (error) {
      console.error(`Error opening batch ${batchId}:`, error)
      throw error
    }
  }

  /**
   * Delete a batch
   */
  async delete(batchId: string) {
    try {
      await api.delete(`/batches/${batchId}`)
    } catch (error) {
      console.error(`Error deleting batch ${batchId}:`, error)
      throw error
    }
  }
}

export default new BatchService()
