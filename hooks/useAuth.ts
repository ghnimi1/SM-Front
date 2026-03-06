"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthService } from "@/services/auth.service"
import { tokenStorage } from "@/lib/api"
import type {
  User,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/lib/types"

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const setUser = (user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }))
  }

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }))
  }

  /** Normalize the user object so `id` is always populated (backend returns `_id`). */
  const normalizeUser = (raw: User): User => ({
    ...raw,
    id: raw.id ?? raw._id ?? "",
  })

  // ─── Hydrate from token on mount ───────────────────────────────────────────

  useEffect(() => {
    const hydrate = async () => {
      const token = tokenStorage.getAccessToken()

      if (!token) {
        // Fall back to locally stored user (graceful offline support)
        const stored = localStorage.getItem("currentUser")
        if (stored) {
          try {
            setUser(JSON.parse(stored) as User)
          } catch {
            localStorage.removeItem("currentUser")
          }
        }
        setLoading(false)
        return
      }

      try {
        const { user } = await AuthService.getProfile()
        const normalized = normalizeUser(user)
        setUser(normalized)
        localStorage.setItem("currentUser", JSON.stringify(normalized))
      } catch {
        // Token might be expired — clear everything
        tokenStorage.clearAll()
      } finally {
        setLoading(false)
      }
    }

    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const payload: LoginPayload = { email, password }
        const response = await AuthService.login(payload)
        const normalized = normalizeUser(response.user)

        setUser(normalized)
        localStorage.setItem("currentUser", JSON.stringify(normalized))
        return true
      } catch (err: any) {
        const message =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Email ou mot de passe incorrect"
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ─── Register ──────────────────────────────────────────────────────────────

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const payload: RegisterPayload = { email, password, name }
        const response = await AuthService.register(payload)
        const normalized = normalizeUser(response.user)

        setUser(normalized)
        localStorage.setItem("currentUser", JSON.stringify(normalized))
        return true
      } catch (err: any) {
        const message =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Erreur lors de la création du compte"
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ─── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      await AuthService.logout()
    } catch {
      // Even if the request fails, we clear client-side state
    } finally {
      tokenStorage.clearAll()
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }, [])

  // ─── Get profile ───────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async (): Promise<User | null> => {
    setLoading(true)
    setError(null)

    try {
      const { user } = await AuthService.getProfile()
      const normalized = normalizeUser(user)
      setUser(normalized)
      localStorage.setItem("currentUser", JSON.stringify(normalized))
      return normalized
    } catch (err: any) {
      const message =
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        "Impossible de récupérer le profil"
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Update profile ────────────────────────────────────────────────────────

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const { user } = await AuthService.updateProfile(payload)
        const normalized = normalizeUser(user)
        setUser(normalized)
        localStorage.setItem("currentUser", JSON.stringify(normalized))
        return true
      } catch (err: any) {
        const message =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Erreur lors de la mise à jour du profil"
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ─── Change password ───────────────────────────────────────────────────────

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        await AuthService.changePassword(payload)
        return true
      } catch (err: any) {
        const message =
          err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Erreur lors du changement de mot de passe"
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ─── Clear error ───────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), [])

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    clearError,
  }
}
