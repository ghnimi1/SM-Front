"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StockProvider, useStock } from "@/contexts/stock-context";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChefHatIcon,
  PlusIcon,
  LogOutIcon,
  AwardIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import { LoyaltyBadge } from "@/components/loyalty-badge";
import { CartDialog } from "@/components/cart-dialog";

function MenuContent() {
  const { menuItems, menuCategories } = useStock();
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Array<{ item: any; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleLogin = () => {
    router.push("/client/login");
  };

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const activeCategories = menuCategories
    .filter((cat) => cat.isActive)
    .sort((a, b) => a.order - b.order);

  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item) => item.category === selectedCategory && item.isAvailable,
      )
    : menuItems.filter((item) => item.isAvailable);

  const cartTotal = cart.reduce((sum, { item, quantity }) => sum + quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-background">
      <header className="sticky top-0 z-10 border-b border-amber-200/50 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md">
              <ChefHatIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Notre Menu</h1>
              <p className="text-sm text-amber-700">Pâtisserie Artisanale</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCart(true)}
              className="relative gap-2 border-amber-200 text-amber-900 hover:bg-amber-50"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              {cartTotal > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                  {cartTotal}
                </span>
              )}
            </Button>

            {isAuthenticated && user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoyalty(true)}
                  className="relative gap-2 border-amber-200 text-amber-900 hover:bg-amber-50"
                >
                  <AwardIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user.loyaltyPoints || 0} pts
                  </span>
                </Button>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-amber-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-amber-700">{user.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 border-amber-200 text-amber-900 hover:bg-amber-50 bg-transparent"
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleLogin}
                className="gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              >
                <UserIcon className="h-4 w-4" />
                <span>Connexion</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-20 z-10 border-b border-amber-100 bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              className={
                selectedCategory === null
                  ? "shrink-0 gap-2 bg-gradient-to-r from-amber-600 to-amber-700 px-6 text-white hover:from-amber-700 hover:to-amber-800"
                  : "shrink-0 gap-2 border-amber-200 px-6 text-amber-900 hover:bg-amber-50"
              }
              onClick={() => setSelectedCategory(null)}
            >
              Tout voir
            </Button>
            {activeCategories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <Button
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  className={
                    isActive
                      ? "shrink-0 gap-2 bg-gradient-to-r from-amber-600 to-amber-700 px-6 text-white hover:from-amber-700 hover:to-amber-800"
                      : "shrink-0 gap-2 border-amber-200 px-6 text-amber-900 hover:bg-amber-50"
                  }
                  onClick={() =>
                    setSelectedCategory(isActive ? null : cat.slug)
                  }
                >
                  <span className="text-lg">{cat.icon}</span>
                  {cat.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredItems.map((item) => {
            return (
              <Card
                key={item.id}
                className="group overflow-hidden border-amber-100 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className="flex gap-4 p-5">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-amber-50 ring-1 ring-amber-100">
                    <img
                      src={
                        item.image ||
                        "/placeholder.svg?height=150&width=150&query=food"
                      }
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-amber-950">
                        {item.name}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-amber-800/80">
                        {item.description}
                      </p>

                      {item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.allergens.map((allergen) => (
                            <span
                              key={allergen}
                              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-2xl font-bold text-amber-900">
                        {item.price.toFixed(2)} TND
                      </span>
                      <Button
                        size="icon"
                        onClick={() => addToCart(item)}
                        className="h-11 w-11 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 shadow-md transition-all hover:from-amber-700 hover:to-amber-800 hover:shadow-lg"
                      >
                        <PlusIcon className="h-5 w-5 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <Card className="border-amber-100 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
              <ChefHatIcon className="h-10 w-10 text-amber-600" />
            </div>
            <p className="mt-4 text-lg font-medium text-amber-900">
              Aucun article disponible
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Veuillez sélectionner une autre catégorie
            </p>
          </Card>
        )}
      </main>

      <footer className="mt-16 border-t border-amber-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-amber-700">
            Pâtisserie Artisanale - Tous nos produits sont faits maison
          </p>
        </div>
      </footer>

      {isAuthenticated && user && (
        <LoyaltyBadge
          open={showLoyalty}
          onClose={() => setShowLoyalty(false)}
        />
      )}

      <CartDialog
        open={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <StockProvider>
      <MenuContent />
    </StockProvider>
  );
}
