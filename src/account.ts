/**
 * The end-user self-service API, typed, for a Node backend.
 *
 * `/account/v1/*` on the issuer host, called with **the signed-in person's own
 * access token** — typically the bearer a request to your own API arrived with,
 * which `verifyAccessToken` has already checked. It is not an API key and
 * there is no administrative form of this client: the operator's surface is
 * `ManagementClient`.
 *
 * Two things have to be true, and neither is this package's to decide:
 *
 * 1. **The Client lists `self_service` in `allowed_scopes`** — the consent
 *    (there is no consent screen). A Client that has not opted in cannot be granted the scope.
 * 2. **The token carries `self_service`**, because the application asked for it
 *    when signing the person in. Without it every call answers
 *    `403 insufficient-scope`.
 *
 * Operations marked **sensitive** answer `401 reauth-required` unless the
 * person has re-authenticated in the last five minutes (`reauthenticate`).
 * Registering a passkey and linking a provider identity cannot be done from a
 * customer's origin at all; send the person to `accountPortalUrl` for those.
 *
 * ```ts
 * import { AccountClient } from '@kleora-io/node'
 * const account = new AccountClient({ issuer, accessToken: bearer })
 * const profile = await account.getProfile()
 * ```
 */

import { parseAbsolute } from './environment.js'
import { KleoraError } from './errors.js'
import type { components } from './generated/account.js'
import { toApiError } from './management.js'
import { USER_AGENT } from './version.js'

type Schemas = components['schemas']

export type AccountProfile = Schemas['ProfileOut']
export type AccountProfileChanges = Schemas['ProfilePatch']
export type AccountEmail = Schemas['EmailOut']
export type AccountEmailSent = Schemas['ResendOut']
export type AccountPasswordPolicy = Schemas['PasswordPolicyOut']
export type AccountReauthentication = Schemas['ReauthOut']
export type AccountSession = Schemas['SessionOut']
export type AccountSessionPage = Schemas['SessionPage']
export type AccountSessionsRevoked = Schemas['RevokedOut']
export type AccountMfa = Schemas['MfaOut']
export type AccountTotpEnrollment = Schemas['EnrollStartOut']
export type AccountRecoveryCodes = Schemas['RecoveryCodesOut']
export type AccountPasskeys = Schemas['PasskeysOut']
export type AccountIdentities = Schemas['IdentitiesOut']
export type AccountSettings = Schemas['UserSettingsDocument']
export type AccountSetting = Schemas['UserSettingDocument']
export type AccountSettingValue = Schemas['UserSettingValue']
export type AccountPortal = Schemas['PortalOut']
export type AccountDeletion = Schemas['DeletionOut']

/** A default a request is bounded by, as `ManagementClient`'s is. */
export const DEFAULT_ACCOUNT_TIMEOUT_MS = 10_000

export interface AccountClientOptions {
  /** The Environment's issuer, e.g. `https://acme.kleora.eu`. */
  issuer: string
  /**
   * The person's access token, or a function returning one (called per
   * request). Never logged, and shown by `toString`/`inspect` as nothing.
   */
  accessToken: string | (() => string | Promise<string>)
  /** Per-request deadline in milliseconds. Default 10 s. */
  timeout?: number
  /** A `fetch` of the caller's own — an agent, a proxy, a test double. */
  fetch?: typeof globalThis.fetch
}

export interface ListSessionsOptions {
  /** 1–200; the server's default is 50. */
  limit?: number
  /** `next_cursor` from the previous page. */
  cursor?: string
}

export interface ChangePasswordOptions {
  /** Required when the person has a password (`has_password`). */
  currentPassword?: string
  newPassword: string
}

interface Call {
  query?: Record<string, string | number | undefined>
  body?: unknown
  anonymous?: boolean
}

const id = (value: string): string => encodeURIComponent(value)

/** Every `/account/v1/*` operation, named for what it does. */
export class AccountClient {
  /** `{issuer}/account/v1`. */
  readonly baseUrl: string

  readonly #accessToken: AccountClientOptions['accessToken']
  readonly #fetch: typeof globalThis.fetch
  readonly #timeout: number

  constructor(options: AccountClientOptions) {
    const issuer = parseAbsolute('issuer', options.issuer)
    if (options.accessToken === '') {
      throw new KleoraError('invalid_configuration', 'accessToken must not be empty')
    }
    this.baseUrl = `${issuer.href.replace(/\/+$/, '')}/account/v1`
    this.#accessToken = options.accessToken
    this.#fetch = options.fetch ?? globalThis.fetch
    this.#timeout = options.timeout ?? DEFAULT_ACCOUNT_TIMEOUT_MS
  }

  /** `GET /profile`. */
  getProfile(): Promise<AccountProfile> {
    return this.#send('GET', '/profile')
  }

  /** `PATCH /profile` — name, locale, picture; `null` clears one. */
  updateProfile(changes: AccountProfileChanges): Promise<AccountProfile> {
    return this.#send('PATCH', '/profile', { body: changes })
  }

  /** `GET /email`. */
  getEmail(): Promise<AccountEmail> {
    return this.#send('GET', '/email')
  }

  /** `POST /email` — mails a confirmation link to the new address. **Sensitive.** */
  requestEmailChange(email: string): Promise<AccountEmailSent> {
    return this.#send('POST', '/email', { body: { email } })
  }

  /** `POST /email/confirm` — the token from that link. */
  confirmEmailChange(token: string): Promise<void> {
    return this.#send('POST', '/email/confirm', { body: { token } })
  }

  /** `POST /email/resend`. */
  resendVerificationEmail(): Promise<AccountEmailSent> {
    return this.#send('POST', '/email/resend')
  }

  /** `GET /password` — whether there is one, and the Environment's policy. */
  getPasswordPolicy(): Promise<AccountPasswordPolicy> {
    return this.#send('GET', '/password')
  }

  /** `POST /password` — change it, or set one for a person who has none. **Sensitive.** */
  changePassword(options: ChangePasswordOptions): Promise<void> {
    return this.#send('POST', '/password', {
      body: {
        new_password: options.newPassword,
        ...(options.currentPassword === undefined ? {} : { current_password: options.currentPassword }),
      },
    })
  }

  /** `GET /reauth` — what this person can re-authenticate with. */
  getReauthentication(): Promise<AccountReauthentication> {
    return this.#send('GET', '/reauth')
  }

  /** `POST /reauth` — a password; opens the five-minute window. */
  reauthenticate(password: string): Promise<void> {
    return this.#send('POST', '/reauth', { body: { password } })
  }

  /** `GET /sessions` — live sessions, newest first, one cursor page. */
  listSessions(options: ListSessionsOptions = {}): Promise<AccountSessionPage> {
    return this.#send('GET', '/sessions', { query: { limit: options.limit, cursor: options.cursor } })
  }

  /** `DELETE /sessions/{id}`. */
  revokeSession(sessionId: string): Promise<void> {
    return this.#send('DELETE', `/sessions/${id(sessionId)}`)
  }

  /** `POST /sessions/revoke-others` — every live session but this token's. */
  revokeOtherSessions(): Promise<AccountSessionsRevoked> {
    return this.#send('POST', '/sessions/revoke-others')
  }

  /** `GET /mfa`. */
  listMfaFactors(): Promise<AccountMfa> {
    return this.#send('GET', '/mfa')
  }

  /** `POST /mfa/enroll/start`. **Sensitive.** */
  startTotpEnrollment(): Promise<AccountTotpEnrollment> {
    return this.#send('POST', '/mfa/enroll/start')
  }

  /** `POST /mfa/enroll/confirm` — answers the recovery codes, once. **Sensitive.** */
  confirmTotpEnrollment(code: string): Promise<AccountRecoveryCodes> {
    return this.#send('POST', '/mfa/enroll/confirm', { body: { code } })
  }

  /** `DELETE /mfa/{id}`. **Sensitive.** */
  removeMfaFactor(factorId: string): Promise<void> {
    return this.#send('DELETE', `/mfa/${id(factorId)}`)
  }

  /** `POST /mfa/recovery/regenerate`. **Sensitive.** */
  regenerateRecoveryCodes(): Promise<AccountRecoveryCodes> {
    return this.#send('POST', '/mfa/recovery/regenerate')
  }

  /** `GET /passkeys`. */
  listPasskeys(): Promise<AccountPasskeys> {
    return this.#send('GET', '/passkeys')
  }

  /** `DELETE /passkeys/{id}`. **Sensitive.** */
  removePasskey(passkeyId: string): Promise<void> {
    return this.#send('DELETE', `/passkeys/${id(passkeyId)}`)
  }

  /** `GET /identities`. */
  listIdentities(): Promise<AccountIdentities> {
    return this.#send('GET', '/identities')
  }

  /** `DELETE /identities/{id}`. **Sensitive.** */
  unlinkIdentity(identityId: string): Promise<void> {
    return this.#send('DELETE', `/identities/${id(identityId)}`)
  }

  /** `GET /settings`. */
  listSettings(): Promise<AccountSettings> {
    return this.#send('GET', '/settings')
  }

  /** `PUT /settings/{key}`. */
  setSetting(key: string, value: AccountSettingValue): Promise<AccountSetting> {
    return this.#send('PUT', `/settings/${id(key)}`, { body: { value } })
  }

  /** `DELETE /settings/{key}` — back to the definition's default. */
  resetSetting(key: string): Promise<void> {
    return this.#send('DELETE', `/settings/${id(key)}`)
  }

  /** `GET /portal` — the hosted portal's entry URL and the sections offered. */
  getPortal(): Promise<AccountPortal> {
    return this.#send('GET', '/portal')
  }

  /** `POST /deletion` — deleted permanently after 7 days, cancellable until then. **Sensitive.** */
  requestDeletion(): Promise<AccountDeletion> {
    return this.#send('POST', '/deletion')
  }

  /** `DELETE /deletion` — the emailed cancellation token; the one anonymous operation. */
  cancelDeletion(token: string): Promise<void> {
    return this.#send('DELETE', '/deletion', { body: { token }, anonymous: true })
  }

  toString(): string {
    return `AccountClient(${this.baseUrl})`
  }

  toJSON(): { baseUrl: string } {
    return { baseUrl: this.baseUrl }
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString()
  }

  async #token(): Promise<string> {
    const token =
      typeof this.#accessToken === 'function' ? await this.#accessToken() : this.#accessToken
    if (token === '') throw new KleoraError('invalid_configuration', 'accessToken returned an empty token')
    return token
  }

  async #send<T>(method: string, path: string, call: Call = {}): Promise<T> {
    const url = new URL(this.baseUrl + path)
    for (const [name, value] of Object.entries(call.query ?? {})) {
      if (value !== undefined) url.searchParams.set(name, String(value))
    }
    const headers: Record<string, string> = {
      Accept: 'application/json, application/problem+json',
      'User-Agent': USER_AGENT,
    }
    if (call.anonymous !== true) headers['Authorization'] = `Bearer ${await this.#token()}`
    if (call.body !== undefined) headers['Content-Type'] = 'application/json'

    const response = await this.#fetch(url, {
      method,
      headers,
      ...(call.body === undefined ? {} : { body: JSON.stringify(call.body) }),
      signal: AbortSignal.timeout(this.#timeout),
    })
    if (!response.ok) throw await toApiError(response)
    if (response.status === 204) return undefined as T
    const text = await response.text()
    return (text === '' ? undefined : JSON.parse(text)) as T
  }
}
