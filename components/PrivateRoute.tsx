"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/types"
import { Loader2Icon, ShieldOffIcon } from "lucide-react"

interface PrivateRouteProps {
  children: ReactNode
  /**
   * Roles allowed to access this route.
   * If omitted → any authenticated user may access.
   */
  allowedRoles?: UserRole[]
  /**
   * Where to redirect when the user is NOT authenticated.
   * Defaults to "/login".
   */
  redirectTo?: string
}

// ─── Full-screen loading spinner ─────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2Icon className="h-12 w-12 animate-spin text-amber-600" />
      <p className="text-sm text-muted-foreground">Vérification de l'accès…</p>
    </div>
  )
}

// ─── Forbidden screen (authenticated but wrong role) ─────────────────────────

function ForbiddenScreen({ redirectLabel, onRedirect }: { redirectLabel: string; onRedirect: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldOffIcon className="h-10 w-10 text-destructive" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Accès refusé</h1>
        <p className="mt-2 text-muted-foreground">
          Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
        </p>
      </div>
      <button
        onClick={onRedirect}
        className="rounded-md bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        {redirectLabel}
      </button>
    </div>
  )
}

// ─── PrivateRoute ─────────────────────────────────────────────────────────────

/**
 * Wraps a page (or subtree) that requires authentication.
 *
 * Behaviour:
 *  - While the auth state is resolving  → shows a loading spinner.
 *  - Not authenticated                  → redirects to `redirectTo` (default "/login").
 *  - Authenticated, role not in `allowedRoles` → shows a Forbidden screen
 *    and redirects to the appropriate home for that role.
 *  - Authenticated + role OK            → renders children.
 *
 * Usage:
 * ```tsx
 * <PrivateRoute allowedRoles={["admin", "user"]}>
 *   <Dashboard />
 * </PrivateRoute>
 * ```
 */
export function PrivateRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // ── Resolve the "home" URL for the current role ───────────────────────────
  const roleHome = (): string => {
    if (!user) return redirectTo
    if (user.role === "client") return "/menu"
    return "/"
  }

  // ── Redirect unauthenticated users ────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace(redirectTo)
      return
    }

    // If role-gating is enabled and the current role is NOT allowed → redirect
    if (allowedRoles && !allowedRoles.includes(user!.role)) {
      router.replace(roleHome())
    }
  }, [isLoading, isAuthenticated, user, allowedRoles])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingScreen />
  }

  // ── Not authenticated → render nothing (redirect is in-flight) ───────────
  if (!isAuthenticated) {
    return <LoadingScreen />
  }

  // ── Wrong role → show Forbidden while redirect fires ─────────────────────
  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    const home = roleHome()
    const label =
      user!.role === "client" ? "Aller au menu" : "Tableau de bord"

    return (
      <ForbiddenScreen
        redirectLabel={label}
        onRedirect={() => router.replace(home)}
      />
    )
  }

  // ── Access granted ────────────────────────────────────────────────────────
  return <>{children}</>
}
