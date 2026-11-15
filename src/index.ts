/**
 * `@kleora-io/node` — access-token verification and the management
 * client for a Node backend.
 *
 * ```ts
 * import { express as kleora, requirePermission } from '@kleora-io/node'
 *
 * app.use(kleora({ issuer: process.env.KLEORA_ISSUER!, audience: 'https://api.example.com' }))
 * app.get('/invoices', requirePermission('invoices:read'), (req, res) => {
 *   res.json({ tenant: req.kleora.tenant })
 * })
 * ```
 */

export {
  ApiError,
  EnvironmentMismatch,
  LoginRequired,
  KleoraError,
  TokenError,
  type ProblemDetails,
  type TokenErrorCode,
} from './errors.js'
export {
  classify,
  classifyKey,
  redactKey,
  KEY_PREFIXES,
  type EnvironmentKind,
} from './environment.js'
export {
  JwksCache,
  clearJwksCaches,
  jwksFor,
  DEFAULT_TIMEOUT_MS as DEFAULT_JWKS_TIMEOUT_MS,
  DEFAULT_TTL_SECONDS,
  MIN_REFETCH_SECONDS,
  STALE_MULTIPLIER,
  type JwksCacheOptions,
} from './jwks.js'
export {
  assertVerifyOptions,
  authenticate,
  verifyAccessToken,
  CLOCK_TOLERANCE_SECONDS,
} from './verify.js'
export {
  express,
  fastify,
  requirePermission,
  type FastifyPluginLike,
  type MiddlewareOptions,
  type KleoraRequest,
} from './middleware.js'
export {
  problem,
  sendProblem,
  PROBLEM_BASE,
  type ExpressLikeResponse,
  type FastifyLikeReply,
  type Problem,
  type ProblemResponse,
} from './problem.js'
export {
  ManagementClient,
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS as DEFAULT_MANAGEMENT_TIMEOUT_MS,
  type CallOptions,
  type KeyEnvironment,
  type ManagementClientOptions,
  type PathsWith,
} from './management.js'
export {
  AccountClient,
  DEFAULT_ACCOUNT_TIMEOUT_MS,
  type AccountClientOptions,
  type AccountDeletion,
  type AccountEmail,
  type AccountEmailSent,
  type AccountIdentities,
  type AccountMfa,
  type AccountPasskeys,
  type AccountPasswordPolicy,
  type AccountPortal,
  type AccountProfile,
  type AccountProfileChanges,
  type AccountReauthentication,
  type AccountRecoveryCodes,
  type AccountSession,
  type AccountSessionPage,
  type AccountSessionsRevoked,
  type AccountSetting,
  type AccountSettings,
  type AccountSettingValue,
  type AccountTotpEnrollment,
  type ChangePasswordOptions,
  type ListSessionsOptions,
} from './account.js'
export {
  ACCOUNT_PORTAL_SECTIONS,
  accountPortalUrl,
  type AccountPortalSection,
  type AccountPortalUrlOptions,
} from './portal.js'
export { USER_AGENT, VERSION } from './version.js'
export type {
  AuthenticatableRequest,
  Claims,
  JwksResolver,
  VerificationKey,
  VerifyOptions,
} from './types.js'
/**
 * The generated document, re-exported so a caller can name the schemas it
 * already receives — `components['schemas']['AppOut']` — without importing a
 * deep path into this package's build output.
 */
export type { components, operations, paths } from './generated/management.js'
/** The self-service document's types, under their own name. */
export type { components as AccountComponents } from './generated/account.js'
