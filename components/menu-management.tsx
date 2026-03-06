"use client"

import { useState } from "react"
import { useStock } from "@/contexts/stock-context"
import { useNotification } from "@/contexts/notification-context"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, ExternalLinkIcon, ImageIcon, RefreshCwIcon } from "lucide-react"
import { Pagination } from "./pagination"

export function MenuManagement() {
  const { menuItems, menuCategories, addMenuItem, updateMenuItem, deleteMenuItem } = useStock()
  const { addNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    allergens: "",
    isAvailable: true,
  })

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
      allergens: "",
      isAvailable: true,
    })
    setEditingItem(null)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      addNotification("Veuillez remplir tous les champs obligatoires", "error")
      return
    }

    const allergensArray = formData.allergens
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a)

    if (editingItem) {
      updateMenuItem(editingItem, {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        image: formData.image || undefined,
        allergens: allergensArray,
        isAvailable: formData.isAvailable,
      })
      addNotification("Article du menu modifié avec succès", "success")
    } else {
      addMenuItem({
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        image: formData.image || undefined,
        allergens: allergensArray,
        isAvailable: formData.isAvailable,
      })
      addNotification("Article du menu ajouté avec succès", "success")
    }

    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: item.image || "",
      allergens: item.allergens.join(", "),
      isAvailable: item.isAvailable,
    })
    setEditingItem(item.id)
    setIsAddDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article du menu ?")) {
      deleteMenuItem(id)
      addNotification("Article du menu supprimé", "success")
    }
  }

  const handleViewPublicMenu = () => {
    window.open("/menu", "_blank")
  }

  const handleResetMenuData = () => {
    if (
      confirm(
        "Voulez-vous réinitialiser les données du menu avec les exemples par défaut ? Cette action est irréversible.",
      )
    ) {
      localStorage.removeItem("pastry-menu-items")
      localStorage.removeItem("pastry-menu-categories")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Menu Client</h1>
          <p className="text-muted-foreground">Gérez les articles visibles par vos clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleResetMenuData}>
            <RefreshCwIcon className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleViewPublicMenu}>
            <ExternalLinkIcon className="h-4 w-4" />
            Voir le menu public
          </Button>
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Ajouter un article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Modifier l'article" : "Ajouter un article"}</DialogTitle>
                <DialogDescription>
                  Ajoutez les détails de l'article du menu avec photo et description
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'article *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Croissant Artisanal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez l'article en détail..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (TND) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.1"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="4.50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuCategories
                          .filter((cat) => cat.isActive)
                          .sort((a, b) => a.order - b.order)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.icon} {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://exemple.com/image.jpg ou laissez vide"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Collez l'URL de l'image ou uploadez-la</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergens">Allergènes</Label>
                  <Input
                    id="allergens"
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    placeholder="Gluten, Lait, Oeufs (séparés par des virgules)"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="available" className="cursor-pointer">
                    Article disponible à la vente
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit}>{editingItem ? "Modifier" : "Ajouter"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {menuCategories
                .filter((cat) => cat.isActive)
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Articles</p>
          <p className="text-2xl font-semibold">{menuItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Disponibles</p>
          <p className="text-2xl font-semibold text-green-600">{menuItems.filter((item) => item.isAvailable).length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Résultats filtrés</p>
          <p className="text-2xl font-semibold">{filteredItems.length}</p>
        </Card>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedItems.map((item) => {
          const category = menuCategories.find((cat) => cat.slug === item.category)
          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square w-full overflow-hidden bg-muted">
                <img
                  src={item.image || "/placeholder.svg?height=200&width=200&query=food"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                  <span className="shrink-0 font-semibold text-primary">{item.price.toFixed(2)} TND</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                {item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.allergens.map((allergen) => (
                      <span
                        key={allergen}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${item.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-xs text-muted-foreground">
                      {item.isAvailable ? "Disponible" : "Indisponible"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}>
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredItems.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value)
            setCurrentPage(1)
          }}
        />
      )}

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucun article trouvé</p>
        </Card>
      )}
    </div>
  )
}
