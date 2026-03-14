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
  useForgotPassword,
  useResetPassword,
  useVerifyEmail,
  useResendVerification,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
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
