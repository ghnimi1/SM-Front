"use client"

import { useState, useEffect } from "react"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { AlertTriangleIcon, TrendingDownIcon, RefreshCwIcon } from "lucide-react"

export function LowStockProducts() {
  const { fetchLowStock, products } = useProducts()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadLowStock()
  }, [])

  const loadLowStock = async () => {
    setIsLoading(true)
    try {
      await fetchLowStock()
    } finally {
      setIsLoading(false)
    }
  }

  const lowStockProducts = products.filter(
    (p) => p.quantity <= p.minQuantity
  )

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c._id === categoryId)
    return category?.name || categoryId
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-6 w-6 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Produits en Stock Bas</h3>
              <p className="text-sm text-muted-foreground">
                {lowStockProducts.length} produit(s) nécessitent une réapprovisionnement
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLowStock}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Products List */}
        {lowStockProducts.length > 0 ? (
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryName(
                        typeof product.category === "string"
                          ? product.category
                          : product.category._id
                      )}
                    </Badge>
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <TrendingDownIcon className="h-3 w-3" />
                      {product.quantity} / {product.minQuantity} {product.unit}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{product.unitPrice.toFixed(2)} €</p>
                  {product.supplier && (
                    <p className="text-xs text-muted-foreground">{product.supplier}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Tous les produits disposent de stocks suffisants
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
