import api, { tokenStorage } from "@/lib/api"
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  MessageResponse,
  ProfileResponse,
  RefreshTokenResponse,
  RegisterPayload,
  UpdateProfilePayload,
} from "@/lib/types"

export const AuthService = {
  /**
   * POST /auth/login
   * Authenticates a user and stores the access token.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", payload)
    // Persist tokens
    tokenStorage.setAccessToken(data.accessToken)
    return data
  },

  /**
   * POST /auth/register
   * Registers a new user and stores the access token.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", payload)
    // Persist tokens
    tokenStorage.setAccessToken(data.accessToken)
    return data
  },

  /**
   * POST /auth/logout
   * Logs out the current user and clears stored tokens.
   */
  async logout(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/logout")
    tokenStorage.clearAll()
    return data
  },

  /**
   * POST /auth/refresh-token
   * Exchanges the refresh token (cookie or body) for a new access token.
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = tokenStorage.getRefreshToken()
    const { data } = await api.post<RefreshTokenResponse>("/auth/refresh-token", {
      refreshToken,
    })
    tokenStorage.setAccessToken(data.accessToken)
    return data
  },

  /**
   * GET /auth/profile
   * Returns the currently authenticated user's profile.
   */
  async getProfile(): Promise<ProfileResponse> {
    const { data } = await api.get<ProfileResponse>("/auth/profile")
    return data
  },

  /**
   * PUT /auth/profile
   * Updates the currently authenticated user's profile.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    const { data } = await api.put<ProfileResponse>("/auth/profile", payload)
    return data
  },

  /**
   * POST /auth/change-password
   * Changes the currently authenticated user's password.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/change-password", payload)
    return data
  },
}
