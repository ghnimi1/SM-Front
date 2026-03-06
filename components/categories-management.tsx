"use client"

import { useState, useMemo, useEffect } from "react"
import { useCategories } from "@/hooks/useCategories"
import { useNotification } from "@/contexts/notification-context"
import type { Category } from "@/lib/types"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import { Badge } from "./ui/badge"
import { Pagination } from "./pagination"

export function CategoriesManagement() {
  const { categories, isLoading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories()
  const { addNotification } = useNotification()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    color: "#6b7280",
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [categories, searchQuery])

  const totalPages = Math.ceil(filteredCategories.length / pageSize)
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredCategories.slice(startIndex, startIndex + pageSize)
  }, [filteredCategories, currentPage, pageSize])

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      icon: "",
      color: "#6b7280",
    })
    setEditingCategory(null)
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.slug) {
      addNotification({
        type: "error",
        message: "Veuillez remplir tous les champs obligatoires",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
      })

      addNotification({
        type: "success",
        message: `${formData.name} a été ajoutée avec succès`,
      })

      resetForm()
      setIsAddDialogOpen(false)
      await fetchCategories()
    } catch (err: any) {
      addNotification({
        type: "error",
        message: err?.response?.data?.message || "Erreur lors de l'ajout",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editingCategory || !formData.name || !formData.slug) return

    setIsSubmitting(true)
    try {
      await updateCategory(editingCategory._id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
      })
      addNotification({
        type: "success",
        message: `${formData.name} a été modifiée avec succès`,
      })

      resetForm()
      setEditingCategory(null)
      setIsAddDialogOpen(false)
      await fetchCategories()
    } catch (err: any) {
      addNotification({
        type: "error",
        message: err?.response?.data?.message || "Erreur lors de la modification",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${categoryName}"?`)) return

    try {
      await deleteCategory(id)
      addNotification({
        type: "success",
        message: `${categoryName} a été supprimée avec succès`,
      })
      await fetchCategories()
    } catch (err: any) {
      addNotification({
        type: "error",
        message: err?.response?.data?.message || "Erreur lors de la suppression",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#6b7280",
    })
    setEditingCategory(category)
    setIsAddDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Catégories</h2>
          <p className="text-sm text-muted-foreground">Créer, modifier ou supprimer des catégories de produits</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Catégorie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une Catégorie</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Fruits Frais"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Identifiant (slug) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                  }
                  placeholder="Ex: fruits-frais"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icône (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Ex: 🍓"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-10 w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6b7280"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la catégorie..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedCategories.map((category) => (
          <Card key={category._id} className="p-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                </div>
                <div className="flex gap-1">
                  <Dialog
                    open={editingCategory?._id === category._id}
                    onOpenChange={(open) => !open && setEditingCategory(null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier la Catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Nom de la catégorie *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-slug">Identifiant (slug) *</Label>
                          <Input
                            id="edit-slug"
                            value={formData.slug}
                            onChange={(e) =>
                              setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-icon">Icône (emoji)</Label>
                          <Input
                            id="edit-icon"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-color">Couleur</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-color"
                              type="color"
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              className="h-10 w-20"
                            />
                            <Input
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleEdit} className="w-full">
                          Enregistrer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(category._id, category.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{category.name}</h3>
                {category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  {category.isActive ? (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                  )}
                  {category.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground">
                Créé le {new Date(category.createdAt).toLocaleDateString("fr-FR")}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 text-muted-foreground opacity-50 mb-4">📂</div>
            <p className="mt-4 text-lg font-medium text-foreground">Aucune catégorie trouvée</p>
            <p className="text-sm text-muted-foreground">Essayez de modifier votre recherche</p>
          </div>
        </Card>
      )}

      {filteredCategories.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
