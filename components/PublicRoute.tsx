"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2Icon } from "lucide-react"

interface PublicRouteProps {
  children: ReactNode
  /**
   * Where to redirect admin / staff users if they are already authenticated.
   * Defaults to "/".
   */
  redirectAdminTo?: string
  /**
   * Where to redirect client users if they are already authenticated.
   * Defaults to "/menu".
   */
  redirectClientTo?: string
}

// ─── Full-screen loading spinner ─────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2Icon className="h-12 w-12 animate-spin text-amber-600" />
      <p className="text-sm text-muted-foreground">Chargement…</p>
    </div>
  )
}

// ─── PublicRoute ──────────────────────────────────────────────────────────────

/**
 * Wraps a page that should only be accessible to NON-authenticated users
 * (e.g. login, register).
 *
 * Behaviour:
 *  - While the auth state is resolving → shows a loading spinner.
 *  - Authenticated as admin / user     → redirects to `redirectAdminTo` (default "/").
 *  - Authenticated as client           → redirects to `redirectClientTo` (default "/menu").
 *  - Not authenticated                 → renders children normally.
 *
 * Usage:
 * ```tsx
 * <PublicRoute>
 *   <LoginForm />
 * </PublicRoute>
 * ```
 */
export function PublicRoute({
  children,
  redirectAdminTo = "/",
  redirectClientTo = "/menu",
}: PublicRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // ── Redirect authenticated users away from public pages ───────────────────
  useEffect(() => {
    if (isLoading || !isAuthenticated) return

    if (user?.role === "client") {
      router.replace(redirectClientTo)
    } else {
      // admin or user
      router.replace(redirectAdminTo)
    }
  }, [isLoading, isAuthenticated, user, redirectAdminTo, redirectClientTo])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingScreen />
  }

  // ── Already authenticated → render nothing (redirect is in-flight) ────────
  if (isAuthenticated) {
    return <LoadingScreen />
  }

  // ── Not authenticated → show the public page ──────────────────────────────
  return <>{children}</>
}
