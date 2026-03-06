"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { AuthService } from "@/services/auth.service";
import { tokenStorage } from "@/lib/api";
import { useNotification } from "./notification-context";
import type {
  User,
  UserRole,
  LoyaltyTier,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/lib/types";

// Re-export types for backward compatibility
export type { UserRole, LoyaltyTier, User };

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Core auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Profile actions
  fetchProfile: () => Promise<User | null>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;

  // Loyalty (client-side only)
  addLoyaltyPoints: (points: number, amount: number) => void;

  // Utility
  clearError: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise MongoDB _id → id so the rest of the app always reads `user.id`. */
function normalizeUser(raw: User): User {
  return { ...raw, id: raw.id ?? (raw as any)._id ?? "" };
}

/** Extract a human-readable error message from an Axios error. */
function extractError(err: any): string {
  return (
    err?.response?.data?.error ??
    err?.response?.data?.message ??
    (Array.isArray(err?.response?.data?.errors)
      ? err.response.data.errors.join(", ")
      : err?.response?.data?.error) ??
    "Une erreur est survenue"
  );
}

/** Compute loyalty tier from total spend. */
function computeTier(totalSpent: number): LoyaltyTier {
  if (totalSpent >= 1000) return "platinum";
  if (totalSpent >= 500) return "gold";
  if (totalSpent >= 200) return "silver";
  return "bronze";
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setErrorState] = useState<string | null>(null);
  const { addNotification } = useNotification();

  // ─── Internal setters ──────────────────────────────────────────────────────

  const applyUser = useCallback((u: User | null) => {
    if (u) {
      const normalized = normalizeUser(u);
      setUserState(normalized);
      localStorage.setItem("currentUser", JSON.stringify(normalized));
    } else {
      setUserState(null);
      tokenStorage.clearAll();
    }
  }, []);

  const setError = useCallback((msg: string | null) => setErrorState(msg), []);
  const clearError = useCallback(() => setErrorState(null), []);

  // ─── Hydrate on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    const hydrate = async () => {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        // No token — try to restore from localStorage (e.g. after hard refresh)
        const stored = localStorage.getItem("currentUser");
        if (stored) {
          try {
            setUserState(JSON.parse(stored) as User);
          } catch {
            localStorage.removeItem("currentUser");
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const { user: profileUser } = await AuthService.getProfile();
        applyUser(profileUser);
      } catch {
        // Token expired or invalid — wipe everything but don't redirect here
        tokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await AuthService.login({ email, password });
        applyUser(response.user);
        addNotification("Connexion réussie", "success");
        return true;
      } catch (err: any) {
        const message = extractError(err);
        setError(message);
        addNotification(message, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [applyUser, addNotification, setError],
  );

  // ─── Register ──────────────────────────────────────────────────────────────

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await AuthService.register({ email, password, name });
        applyUser(response.user);
        addNotification(
          "Compte créé avec succès! Bienvenue dans notre programme de fidélité",
          "success",
        );
        return true;
      } catch (err: any) {
        const message = extractError(err);
        setError(message);
        addNotification(message, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [applyUser, addNotification, setError],
  );

  // ─── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await AuthService.logout();
    } catch {
      // Even on failure we clear client state
    } finally {
      applyUser(null);
      setIsLoading(false);
      addNotification("Déconnexion réussie", "success");
    }
  }, [applyUser, addNotification]);

  // ─── Get profile ───────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { user: profileUser } = await AuthService.getProfile();
      applyUser(profileUser);
      return normalizeUser(profileUser);
    } catch (err: any) {
      const message = extractError(err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [applyUser, setError]);

  // ─── Update profile ────────────────────────────────────────────────────────

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const { user: updated } = await AuthService.updateProfile(payload);
        applyUser(updated);
        addNotification("Profil mis à jour avec succès", "success");
        return true;
      } catch (err: any) {
        const message = extractError(err);
        setError(message);
        addNotification(message, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [applyUser, addNotification, setError],
  );

  // ─── Change password ───────────────────────────────────────────────────────

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await AuthService.changePassword(payload);
        addNotification("Mot de passe changé avec succès", "success");
        return true;
      } catch (err: any) {
        const message = extractError(err);
        setError(message);
        addNotification(message, "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [addNotification, setError],
  );

  // ─── Update user (local override — for loyalty / client features) ──────────

  const updateUser = useCallback(
    (updatedUser: User) => {
      applyUser(updatedUser);
    },
    [applyUser],
  );

  // ─── Add loyalty points (client-side only feature) ─────────────────────────

  const addLoyaltyPoints = useCallback(
    (points: number, amount: number) => {
      if (!user || user.role !== "client") return;

      const newPoints = (user.loyaltyPoints ?? 0) + points;
      const newTotalSpent = (user.totalSpent ?? 0) + amount;
      const newTier = computeTier(newTotalSpent);

      const updatedUser: User = {
        ...user,
        loyaltyPoints: newPoints,
        loyaltyTier: newTier,
        totalSpent: newTotalSpent,
      };

      applyUser(updatedUser);

      if (newTier !== user.loyaltyTier) {
        addNotification(
          `Félicitations! Vous êtes passé au niveau ${newTier.toUpperCase()}!`,
          "success",
        );
      }
    },
    [user, applyUser, addNotification],
  );

  // ─── Context value ─────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        changePassword,
        updateUser,
        addLoyaltyPoints,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
