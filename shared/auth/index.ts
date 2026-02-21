// Export principal de l'authentification
export { useAuthStore, useUser, useIsAuthenticated, useAuthTokens } from "./store";
export {
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
  useSession,
  useUpdateProfile,
  useChangePassword,
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "./hooks";
export {
  withAuth,
  withRole,
  withTenant,
  useHasRole,
  useIsAdmin,
  useIsManager,
  Guard,
} from "./guards";
