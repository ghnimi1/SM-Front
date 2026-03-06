"use client";

import { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useNotification } from "@/contexts/notification-context";
import type {
  Product,
  Category,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/lib/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Pagination } from "./pagination";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  PackageIcon,
  FilterIcon,
  PackageSearchIcon,
  Loader2Icon,
  AlertTriangleIcon,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const UNITS = ["kg", "g", "L", "ml", "pièces", "sachets", "boîtes"] as const;

const EMPTY_FORM = {
  name: "",
  category: "",
  quantity: "",
  unit: "kg",
  minQuantity: "",
  unitPrice: "",
  shelfLifeAfterOpening: "",
  supplier: "",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ArticlesManagementProps {
  onNavigateToBatches?: (productId: string) => void;
}

// ─── Product Form Component (moved outside) ─────────────────────────────────

interface ProductFormProps {
  formData: typeof EMPTY_FORM;
  setField: (key: keyof typeof EMPTY_FORM) => (value: string) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  submitLabel: string;
  onCancel: () => void;
  categories: Category[];
  UNITS: readonly string[];
}

const ProductForm = ({
  formData,
  setField,
  isSubmitting,
  onSubmit,
  submitLabel,
  onCancel,
  categories,
  UNITS,
}: ProductFormProps) => (
  <div className="space-y-4">
    {/* Name */}
    <div className="space-y-2">
      <Label htmlFor="pf-name">
        Nom <span className="text-destructive">*</span>
      </Label>
      <Input
        id="pf-name"
        value={formData.name}
        onChange={(e) => setField("name")(e.target.value)}
        placeholder="Ex : Farine T65"
        disabled={isSubmitting}
      />
    </div>

    {/* Category */}
    <div className="space-y-2">
      <Label htmlFor="pf-category">
        Catégorie <span className="text-destructive">*</span>
      </Label>
      <Select
        value={formData.category}
        onValueChange={setField("category")}
        disabled={isSubmitting}
      >
        <SelectTrigger id="pf-category">
          <SelectValue placeholder="Sélectionner une catégorie" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c._id} value={c._id}>
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Quantity + Unit */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="pf-quantity">Quantité initiale</Label>
        <Input
          id="pf-quantity"
          type="number"
          min="0"
          step="0.01"
          value={formData.quantity}
          onChange={(e) => setField("quantity")(e.target.value)}
          placeholder="0"
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf-unit">
          Unité <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.unit}
          onValueChange={setField("unit")}
          disabled={isSubmitting}
        >
          <SelectTrigger id="pf-unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Min quantity + Unit price */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="pf-min-qty">
          Quantité min. <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pf-min-qty"
          type="number"
          min="0"
          step="0.01"
          value={formData.minQuantity}
          onChange={(e) => setField("minQuantity")(e.target.value)}
          placeholder="5"
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf-price">
          Prix unitaire (€) <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pf-price"
          type="number"
          min="0"
          step="0.01"
          value={formData.unitPrice}
          onChange={(e) => setField("unitPrice")(e.target.value)}
          placeholder="0.00"
          disabled={isSubmitting}
        />
      </div>
    </div>

    {/* Shelf life */}
    <div className="space-y-2">
      <Label htmlFor="pf-shelf-life">
        Conservation après ouverture (jours)
      </Label>
      <Input
        id="pf-shelf-life"
        type="number"
        min="0"
        value={formData.shelfLifeAfterOpening}
        onChange={(e) => setField("shelfLifeAfterOpening")(e.target.value)}
        placeholder="Ex : 7"
        disabled={isSubmitting}
      />
    </div>

    {/* Supplier */}
    <div className="space-y-2">
      <Label htmlFor="pf-supplier">Fournisseur</Label>
      <Input
        id="pf-supplier"
        value={formData.supplier}
        onChange={(e) => setField("supplier")(e.target.value)}
        placeholder="Ex : Fournisseur ABC"
        disabled={isSubmitting}
      />
    </div>

    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      <Button onClick={onSubmit} disabled={isSubmitting}>
        {isSubmitting && (
          <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
        )}
        {submitLabel}
      </Button>
    </DialogFooter>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

export function ArticlesManagement({
  onNavigateToBatches,
}: ArticlesManagementProps) {
  // ── Hooks ──────────────────────────────────────────────────────────────────
  const {
    products,
    isLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { addNotification } = useNotification();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Dialog state ───────────────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // ── Load data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getCategoryId = (cat: Category | string) =>
    typeof cat === "string" ? cat : cat._id;

  const getCategoryName = (cat: Category | string): string => {
    if (typeof cat !== "string") return cat.name;
    return categories.find((c) => c._id === cat)?.name || cat;
  };

  const getCategoryIcon = (cat: Category | string): string => {
    if (typeof cat !== "string") return cat.icon || "📦";
    return categories.find((c) => c._id === cat)?.icon || "📦";
  };

  const getStockStatus = (item: Product) => {
    if (item.quantity <= item.minQuantity) {
      return { label: "Stock bas", variant: "destructive" as const }
    }
    if (item.quantity <= item.minQuantity * 1.5) {
      return { label: "Attention", variant: "outline" as const }
    }
    return { label: "OK", variant: "secondary" as const }
  }

  // ── Filtering + FIFO sort ──────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return (
      products
        .filter((p) => {
          const matchesSearch =
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.supplier?.toLowerCase().includes(searchQuery.toLowerCase());

          const catId = getCategoryId(p.category);
          const matchesCategory =
            categoryFilter === "all" || catId === categoryFilter;

          let matchesStatus = true;
          if (statusFilter === "low")
            matchesStatus = p.quantity <= p.minQuantity;
          else if (statusFilter === "warning")
            matchesStatus =
              p.quantity > p.minQuantity && p.quantity <= p.minQuantity * 1.5;
          else if (statusFilter === "ok")
            matchesStatus = p.quantity > p.minQuantity * 1.5;

          return matchesSearch && matchesCategory && matchesStatus;
        })
        // FIFO: oldest created first
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
    );
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (value: string) => {
      setter(value);
      setCurrentPage(1);
    };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const setField = (key: keyof typeof EMPTY_FORM) => (value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setFormData({
      name: product.name,
      category: getCategoryId(product.category),
      quantity: String(product.quantity),
      unit: product.unit,
      minQuantity: String(product.minQuantity),
      unitPrice: String(product.unitPrice),
      shelfLifeAfterOpening: product.shelfLifeAfterOpening
        ? String(product.shelfLifeAfterOpening)
        : "",
      supplier: product.supplier || "",
    });
    setEditingProduct(product);
  };

  const validate = (): boolean => {
    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.minQuantity ||
      !formData.unitPrice
    ) {
      addNotification({
        type: "error",
        title: "Champs manquants",
        message:
          "Nom, catégorie, quantité minimale et prix unitaire sont obligatoires.",
      });
      return false;
    }
    return true;
  };

  const buildPayload = (): CreateProductPayload => ({
    name: formData.name.trim(),
    category: formData.category,
    quantity: formData.quantity ? Number(formData.quantity) : 0,
    unit: formData.unit,
    minQuantity: Number(formData.minQuantity),
    unitPrice: Number(formData.unitPrice),
    shelfLifeAfterOpening: formData.shelfLifeAfterOpening
      ? Number(formData.shelfLifeAfterOpening)
      : undefined,
    supplier: formData.supplier.trim() || undefined,
  });

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await createProduct(buildPayload());
      addNotification({
        type: "success",
        title: "Produit ajouté",
        message: `« ${formData.name} » a été ajouté avec succès.`,
      });
      resetForm();
      setIsAddOpen(false);
      await fetchProducts();
    } catch {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible d'ajouter le produit.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct || !validate()) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateProductPayload = buildPayload();
      await updateProduct(editingProduct._id, payload);
      addNotification({
        type: "success",
        title: "Produit modifié",
        message: `« ${formData.name} » a été mis à jour avec succès.`,
      });
      resetForm();
      await fetchProducts();
    } catch {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de modifier le produit.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer « ${product.name} » ?`))
      return;
    setIsSubmitting(true);
    try {
      await deleteProduct(product._id);
      addNotification({
        type: "success",
        title: "Produit supprimé",
        message: `« ${product.name} » a été supprimé avec succès.`,
      });
      await fetchProducts();
    } catch {
      addNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de supprimer le produit.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-balance text-2xl font-semibold text-foreground">
            Gestion des Produits — Système FIFO
          </h2>
          <p className="text-pretty text-sm text-muted-foreground">
            Gestion conforme aux normes sanitaires avec traçabilité complète
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Nouveau Produit
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FilterIcon className="h-4 w-4" />
            Filtres avancés
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher (nom, fournisseur)..."
                value={searchQuery}
                onChange={(e) =>
                  handleFilterChange(setSearchQuery)(e.target.value)
                }
                className="pl-9"
              />
            </div>

            {/* Category */}
            <Select
              value={categoryFilter}
              onValueChange={handleFilterChange(setCategoryFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={handleFilterChange(setStatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="low">Stock bas / Rupture</SelectItem>
                <SelectItem value="warning">Attention</SelectItem>
                <SelectItem value="ok">OK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total produits</p>
            <p className="text-2xl font-semibold text-foreground">
              {products.length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Produits filtrés</p>
            <p className="text-2xl font-semibold text-foreground">
              {filteredProducts.length}
            </p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Stock bas / Rupture</p>
            <p className="text-2xl font-semibold text-destructive">
              {products.filter((p) => p.quantity <= p.minQuantity).length}
            </p>
          </div>
        </Card>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2Icon className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">
              Chargement des produits…
            </p>
          </div>
        </Card>
      )}

      {/* ── Table ── */}
      {!isLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Produit
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Catégorie
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                    Quantité
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                    Valeur stock
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Conserv. après ouv.
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProducts.map((product) => {
                  const status = getStockStatus(product);
                  const totalValue = product.quantity * product.unitPrice;

                  return (
                    <tr key={product._id} className="hover:bg-muted/30">
                      {/* Product name + supplier */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">
                            {product.name}
                          </div>
                          {product.supplier && (
                            <div className="text-xs text-muted-foreground">
                              {product.supplier}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <Badge variant="outline" className="gap-1">
                          <span>{getCategoryIcon(product.category)}</span>
                          <span className="hidden sm:inline">
                            {getCategoryName(product.category)}
                          </span>
                        </Badge>
                      </td>

                      {/* Quantity */}
                      <td className="p-4 text-right">
                        <div className="font-medium text-foreground">
                          {product.quantity} {product.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min : {product.minQuantity}
                        </div>
                      </td>

                      {/* Stock value */}
                      <td className="p-4 text-right">
                        <div className="font-semibold text-foreground">
                          {totalValue.toFixed(2)} €
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.unitPrice.toFixed(2)} € / {product.unit}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <Badge variant={status.variant}>
                          {status.variant === "destructive" && (
                            <AlertTriangleIcon className="mr-1 h-3 w-3" />
                          )}
                          {status.label}
                        </Badge>
                      </td>

                      {/* Shelf life */}
                      <td className="p-4">
                        {product.shelfLifeAfterOpening ? (
                          <span className="text-sm text-foreground">
                            {product.shelfLifeAfterOpening} j
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Gérer les lots */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigateToBatches?.(product._id)}
                            title="Gérer les lots"
                          >
                            <PackageSearchIcon className="h-4 w-4" />
                          </Button>
            

                          {/* Modifier */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            title="Modifier"
                            disabled={isSubmitting}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>

                          {/* Supprimer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product)}
                            title="Supprimer"
                            disabled={isSubmitting}
                          >
                            <TrashIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {paginatedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <PackageIcon className="h-12 w-12 text-muted-foreground opacity-40" />
              <p className="mt-4 text-lg font-medium text-foreground">
                Aucun produit trouvé
              </p>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier votre recherche ou vos filtres
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="border-t border-border p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredProducts.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}
        </Card>
      )}

      {/* ── Add dialog ── */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setIsAddOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setField={setField}
            isSubmitting={isSubmitting}
            onSubmit={handleAdd}
            submitLabel="Ajouter"
            onCancel={() => {
              resetForm();
              setIsAddOpen(false);
            }}
            categories={categories}
            UNITS={UNITS}
          />
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier — {editingProduct?.name}</DialogTitle>
          </DialogHeader>
          <ProductForm
            formData={formData}
            setField={setField}
            isSubmitting={isSubmitting}
            onSubmit={handleEdit}
            submitLabel="Enregistrer"
            onCancel={resetForm}
            categories={categories}
            UNITS={UNITS}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}