"use client"

import { useState, useMemo, useEffect } from "react"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useNotification } from "@/contexts/notification-context"
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/lib/types"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, Loader2Icon, AlertTriangleIcon } from "lucide-react"
import { Badge } from "./ui/badge"
import { Pagination } from "./pagination"

export function ProductsManagement() {
  const { products, isLoading, fetchProducts, createProduct, updateProduct: updateProductApi, deleteProduct: deleteProductApi } = useProducts()
  const { categories } = useCategories()
  const { addNotification } = useNotification()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    minQuantity: "",
    unitPrice: "",
    shelfLifeAfterOpening: "",
    supplier: "",
  })

  // Load products on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || 
        (typeof product.category === "string" ? product.category === categoryFilter : product.category._id === categoryFilter)
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, categoryFilter])

  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredProducts.slice(startIndex, startIndex + pageSize)
  }, [filteredProducts, currentPage, pageSize])

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "kg",
      minQuantity: "",
      unitPrice: "",
      shelfLifeAfterOpening: "",
      supplier: "",
    })
    setEditingProduct(null)
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.category || !formData.minQuantity || !formData.unitPrice) {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Les champs obligatoires doivent être remplis",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateProductPayload = {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity ? Number(formData.quantity) : 0,
        unit: formData.unit,
        minQuantity: Number(formData.minQuantity),
        unitPrice: Number(formData.unitPrice),
        shelfLifeAfterOpening: formData.shelfLifeAfterOpening ? Number(formData.shelfLifeAfterOpening) : undefined,
        supplier: formData.supplier || undefined,
      }
      
      await createProduct(payload)

      addNotification({
        type: "success",
        title: "Produit ajouté",
        message: `${formData.name} a été ajouté avec succès`,
      })

      resetForm()
      setIsAddDialogOpen(false)
      await fetchProducts()
    } catch (err) {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible d'ajouter le produit",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editingProduct || !formData.name || !formData.category || !formData.minQuantity || !formData.unitPrice) {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Les champs obligatoires doivent être remplis",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload: UpdateProductPayload = {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity ? Number(formData.quantity) : 0,
        unit: formData.unit,
        minQuantity: Number(formData.minQuantity),
        unitPrice: Number(formData.unitPrice),
        shelfLifeAfterOpening: formData.shelfLifeAfterOpening ? Number(formData.shelfLifeAfterOpening) : undefined,
        supplier: formData.supplier || undefined,
      }
      
      await updateProductApi(editingProduct._id, payload)

      addNotification({
        type: "success",
        title: "Produit modifié",
        message: `${formData.name} a été modifié avec succès`,
      })

      resetForm()
      setEditingProduct(null)
      setIsAddDialogOpen(false)
      await fetchProducts()
    } catch (err) {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de modifier le produit",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, productName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      setIsSubmitting(true)
      try {
        await deleteProductApi(id)
        addNotification({
          type: "success",
          title: "Produit supprimé",
          message: `${productName} a été supprimée avec succès`,
        })
        await fetchProducts()
      } catch (err) {
        addNotification({
          type: "error",
          title: "Erreur",
          message: "Impossible de supprimer le produit",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      category: typeof product.category === "string" ? product.category : product.category._id,
      quantity: String(product.quantity),
      unit: product.unit,
      minQuantity: String(product.minQuantity),
      unitPrice: String(product.unitPrice),
      shelfLifeAfterOpening: product.shelfLifeAfterOpening ? String(product.shelfLifeAfterOpening) : "",
      supplier: product.supplier || "",
    })
    setEditingProduct(product)
    setIsAddDialogOpen(true)
  }

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((c) => c._id === categoryId)
    return category?.name || categoryId
  }

  const getStockStatus = (product: Product): { label: string; variant: "default" | "destructive" | "secondary" | "outline" } => {
    if (product.quantity === 0) {
      return { label: "Rupture", variant: "destructive" }
    }
    if (product.quantity <= product.minQuantity) {
      return { label: "Stock bas", variant: "destructive" }
    }
    if (product.quantity <= product.minQuantity * 1.5) {
      return { label: "Attention", variant: "outline" }
    }
    return { label: "OK", variant: "secondary" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Produits</h2>
          <p className="text-sm text-muted-foreground">Créer, modifier ou supprimer des produits</p>
        </div>

        <Dialog open={isAddDialogOpen && !editingProduct} onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouveau Produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Produit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Nom *</Label>
                <Input
                  id="product-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Farine T65"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="product-category" disabled={isSubmitting}>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-quantity">Quantité</Label>
                  <Input
                    id="product-quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-unit">Unité *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger id="product-unit" disabled={isSubmitting}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="sachets">sachets</SelectItem>
                      <SelectItem value="boites">boites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-min-quantity">Quantité Min *</Label>
                  <Input
                    id="product-min-quantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    placeholder="5"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Prix Unitaire *</Label>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-shelf-life">Durée de conservation (jours)</Label>
                <Input
                  id="product-shelf-life"
                  type="number"
                  value={formData.shelfLifeAfterOpening}
                  onChange={(e) => setFormData({ ...formData, shelfLifeAfterOpening: e.target.value })}
                  placeholder="Ex: 7"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-supplier">Fournisseur</Label>
                <Input
                  id="product-supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Ex: Fournisseur ABC"
                  disabled={isSubmitting}
                />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>
          <div>
            <Label htmlFor="filter-category">Filtrer par catégorie</Label>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger id="filter-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">Chargement des produits...</p>
          </div>
        </Card>
      )}

      {/* Products Table */}
      {!isLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Catégorie</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Quantité</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Prix Unit.</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProducts.map((product) => {
                  const status = getStockStatus(product)
                  return (
                    <tr key={product._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          {product.supplier && <p className="text-xs text-muted-foreground">{product.supplier}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{getCategoryName(typeof product.category === "string" ? product.category : product.category._id)}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">
                          {product.quantity} {product.unit}
                        </span>
                        <span className="block text-xs text-muted-foreground">Min: {product.minQuantity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>
                          {status.variant === "destructive" && product.quantity === 0 ? (
                            <>
                              <AlertTriangleIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </>
                          ) : (
                            status.label
                          )}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-foreground">{product.unitPrice.toFixed(2)} €</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(product)}
                            disabled={isSubmitting}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(product._id, product.name)}
                            disabled={isSubmitting}
                          >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {!isLoading && paginatedProducts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">Aucun produit trouvé</p>
            </div>
          )}
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && filteredProducts.length > 0 && (
        <Card className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
          />
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isAddDialogOpen && !!editingProduct} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le Produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-name">Nom *</Label>
              <Input
                id="edit-product-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="edit-product-category" disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-quantity">Quantité</Label>
                <Input
                  id="edit-product-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-unit">Unité *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="edit-product-unit" disabled={isSubmitting}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pieces">pieces</SelectItem>
                    <SelectItem value="sachets">sachets</SelectItem>
                    <SelectItem value="boites">boites</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-product-min-quantity">Quantité Min *</Label>
                <Input
                  id="edit-product-min-quantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-price">Prix Unitaire *</Label>
                <Input
                  id="edit-product-price"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-shelf-life">Durée de conservation (jours)</Label>
              <Input
                id="edit-product-shelf-life"
                type="number"
                value={formData.shelfLifeAfterOpening}
                onChange={(e) => setFormData({ ...formData, shelfLifeAfterOpening: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-supplier">Fournisseur</Label>
              <Input
                id="edit-product-supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <Button onClick={handleEdit} className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
