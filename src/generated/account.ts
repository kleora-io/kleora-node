/**
 * GENERATED — do not edit. `pnpm generate:client` writes it from the
 * deployed account API document (https://id.kleora.eu/account/v1/openapi.json).
 *
 * The end-user self-service API's OpenAPI document, as TypeScript.
 * `src/account.ts` gives the pieces their names and adds the bearer token and
 * problem parsing; nothing else imports this file.
 */

export interface paths {
    "/account/v1/deletion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ask for the signed-in person's own account to be deleted
         * @description Schedule the deletion of the signed-in person's account in seven days, and email them a link
         *     that cancels it.
         *
         *     Takes no body; the re-authentication is the confirmation. Answers `202` because the account has
         *     not been deleted yet: `erase_after` is the moment it will be, so a screen can tell the person
         *     when.
         *
         *     Every session of the person is revoked. If a deletion is already scheduled, the answer is the
         *     same `202` with the same `erase_after`, and nothing is sent. `409 last-owner` when the person is
         *     the last active owner of a tenant that must always have one.
         */
        post: operations["api_public_v1_account_deletion_request_deletion"];
        /**
         * Cancel a deletion request with the token from the emailed link
         * @description Cancel a scheduled account deletion with the token from the emailed link.
         *
         *     The only operation on this API that takes no bearer token: requesting the deletion revoked every
         *     session, so the person has none to present. Rate limited per IP address.
         *
         *     Answers `204` when the deletion is cancelled, and also when there was nothing outstanding to
         *     cancel. An unknown, already used or expired token, or a token of another environment, is `400
         *     invalid-token`.
         */
        delete: operations["api_public_v1_account_deletion_cancel_deletion"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/email": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own address, and whether a change is outstanding
         * @description The person's email address, whether it is verified, and whether a change of address is
         *     waiting for confirmation.
         *
         *     The pending new address itself is never returned, only that there is one.
         */
        get: operations["api_public_v1_account_profile_read_email"];
        put?: never;
        /**
         * Ask to change the signed-in person's own email address
         * @description Step 1 of changing the email address: email a confirmation link to the new address.
         *
         *     Requires a recent re-authentication. Nothing changes until the link is confirmed with `POST
         *     /email/confirm`.
         *
         *     Always answers `202 {"sent": true}`, including when the address is already registered in this
         *     environment (in which case nothing is sent), so the answer does not reveal which addresses
         *     exist. Counts toward the person's shared budget for emailed links, along with verification and
         *     password reset mail.
         */
        post: operations["api_public_v1_account_profile_request_email_change"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/email/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm a new email address with the token from the emailed link
         * @description Step 2 of changing the email address: spend the emailed token and move the address.
         *
         *     Requires the person's bearer token as well as the emailed token, but no further
         *     re-authentication. A token that is unknown, already used, expired or issued to somebody else is
         *     `400 invalid-token`. `409 email-taken` when the new address has since been registered in this
         *     environment.
         */
        post: operations["api_public_v1_account_profile_confirm_email_change"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/email/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send another verification link to the signed-in person's own address
         * @description Send the person's address verification email again.
         *
         *     Counts toward the person's shared budget for emailed links, the same budget the hosted pages'
         *     resend uses. When the address is already verified, the answer is `{"sent": false}` and nothing
         *     is sent. Answers `503 unavailable` when the rate limit cannot be checked.
         */
        post: operations["api_public_v1_account_profile_resend_verification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/identities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own provider links, and what can be linked
         * @description The person's linked provider identities, every provider the environment offers, and whether
         *     the person has a password.
         *
         *     `has_password` helps a screen decide whether removing an identity is possible. Each provider's
         *     `start_url` is a same-origin path with no destination parameter, to be opened as a top-level
         *     navigation.
         */
        get: operations["api_public_v1_account_identities_list_identities"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/identities/{identity_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove one of the signed-in person's own provider links
         * @description Unlink one of the person's external provider identities.
         *
         *     `409 last-credential` when it is the last thing the person could start a sign-in with: a usable
         *     password, another provider identity or another confirmed passkey. A TOTP factor and recovery
         *     codes are second factors and do not count.
         *
         *     Revokes the sessions that were authenticated through this provider, and no others. If the
         *     caller's own session came from that provider, its token stops working immediately.
         */
        delete: operations["api_public_v1_account_identities_delete_identity"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/mfa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own second factors
         * @description Every MFA factor the person holds, confirmed or not, and the environment's MFA policy.
         *
         *     An unconfirmed factor has `confirmed_at: null`. Secrets and recovery code hashes are never
         *     returned. `policy` lets a screen know in advance that, under `required`, the last factor cannot
         *     be removed.
         */
        get: operations["api_public_v1_account_mfa_list_mfa"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/mfa/enroll/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm TOTP enrolment, and receive the recovery codes once
         * @description Verify a TOTP code, confirm the factor, and return the ten recovery codes, once.
         *
         *     The codes cannot be read back later. A wrong code is `401 invalid-code`, the same answer as for
         *     a locked account. Confirming does not change the current session's authentication methods
         *     (`amr`); the next sign-in asks for the factor.
         */
        post: operations["api_public_v1_account_mfa_enroll_confirm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/mfa/enroll/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Begin TOTP enrolment
         * @description Start enrolling a TOTP factor: create one (or reuse the pending one) and return its secret,
         *     once.
         *
         *     Requires a recent re-authentication. `409 mfa-already-enrolled` when the person already holds a
         *     confirmed TOTP factor; at most one is allowed.
         */
        post: operations["api_public_v1_account_mfa_enroll_start"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/mfa/recovery/regenerate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Replace the signed-in person's own recovery-code set
         * @description Replace the person's recovery codes with ten new ones, returned once.
         *
         *     Requires a recent re-authentication. `404` when the person holds no confirmed second factor (a
         *     TOTP factor or a passkey), since recovery codes only back one up.
         */
        post: operations["api_public_v1_account_mfa_regenerate_recovery"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/mfa/{factor_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove the signed-in person's own second factor
         * @description Remove one of the person's MFA factors.
         *
         *     `403 mfa-required` for the last factor when the environment requires MFA. `404` for a malformed
         *     id and for another person's factor alike. Removing a TOTP factor also removes the recovery
         *     codes, and the other way round.
         */
        delete: operations["api_public_v1_account_mfa_delete_mfa"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/passkeys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own passkeys, and where one can be added
         * @description The person's passkeys, and the hosted page where they can register another.
         *
         *     Stays available when the rate-limit store is unavailable.
         */
        get: operations["api_public_v1_account_passkeys_list_passkeys"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/passkeys/{factor_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Remove one of the signed-in person's own passkeys
         * @description Remove one of the person's passkeys.
         *
         *     Two refusals, with different meanings:
         *
         *     - `409 last-credential` when removing it would leave the person no way to sign in at all (no
         *       usable password, provider identity or other confirmed passkey).
         *     - `403 mfa-required` when the environment requires MFA and this is the person's last second
         *       factor of any kind.
         */
        delete: operations["api_public_v1_account_passkeys_delete_passkey"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Whether the signed-in person has a password, and the rules for a new one
         * @description What a password form needs before anything is typed: whether the person has a password, the
         *     minimum length, and whether new passwords are checked against known breaches.
         *
         *     All three come from the environment's settings. `has_password` decides whether to ask for the
         *     current password.
         */
        get: operations["api_public_v1_account_password_read_password_policy"];
        put?: never;
        /**
         * Change the signed-in person's own password
         * @description Change the person's password, or set one if they have none.
         *
         *     Requires a recent re-authentication. What happens depends on whether the person already has a
         *     password, never on what the caller sent:
         *
         *     - **They have one:** `current_password` is verified. A wrong or missing one is `401
         *       invalid-credentials`. Every other session is revoked; this one keeps working.
         *     - **They have none:** no `current_password` is needed. Every session is revoked, including this
         *       one.
         *
         *     A new password the policy refuses is `422 password-policy` or `422 password-breached`, with
         *     `errors[].field = "password"`.
         */
        post: operations["api_public_v1_account_password_change_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Where the hosted account portal is, and which sections it offers
         * @description The hosted account portal's entry URL, and the sections this environment offers.
         *
         *     `danger` (account deletion) is listed only when the environment allows people to delete their
         *     own account. The list is for rendering links; the `/deletion` operations answer `404` whenever
         *     deletion is not offered, whatever a client shows.
         */
        get: operations["api_public_v1_account_portal_read_portal"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own profile
         * @description Name, address, language, picture and two computed facts. Never `metadata`.
         */
        get: operations["api_public_v1_account_profile_read_profile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change the signed-in person's own name, language or picture
         * @description Update the person's name, language or picture.
         *
         *     Does not require re-authentication. Only the members present in the body are written: a member
         *     set to `null` is cleared, and an absent one is left alone.
         */
        patch: operations["api_public_v1_account_profile_patch_profile"];
        trace?: never;
    };
    "/account/v1/reauth": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * What the signed-in person can re-authenticate with
         * @description What the person can re-authenticate with, and until when their current re-authentication
         *     lasts.
         *
         *     `reauth_providers` lists the providers the person has linked that the environment still offers.
         *     `passkey_available` says the person holds a confirmed passkey; passkeys can only be used on the
         *     hosted `/account/reauth` page, not through this API. `reauthenticated_until` is `null` when the
         *     session has no current re-authentication.
         */
        get: operations["api_public_v1_account_reauth_read_reauth"];
        put?: never;
        /**
         * Re-prove the signed-in person's own password
         * @description Re-authenticate the current session with the person's password.
         *
         *     Does not itself require re-authentication. A wrong password is `401 invalid-credentials` and
         *     counts toward the same progressive lockout as a failed sign-in. The session is otherwise
         *     unchanged: no new session is opened and its authentication methods (`amr`) stay the same.
         */
        post: operations["api_public_v1_account_reauth_reauthenticate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own live sessions
         * @description The person's live sessions, newest first, with cursor pagination.
         *
         *     An unusable cursor is `400 invalid-cursor`.
         */
        get: operations["api_public_v1_account_sessions_list_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/sessions/revoke-others": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sign every other device out
         * @description Revoke every live session of the person except the one this token belongs to, and return how
         *     many were revoked.
         *
         *     Does not require re-authentication. Revoking a session also revokes its refresh tokens.
         */
        post: operations["api_public_v1_account_sessions_revoke_other_sessions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/sessions/{session_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Sign one device out
         * @description Revoke one of the person's own live sessions, which may be the current one.
         *
         *     `404 not-found` for a malformed id, for another person's session and for a session that has
         *     already ended. Revoking a session also revokes the refresh tokens issued on it.
         */
        delete: operations["api_public_v1_account_sessions_revoke_session"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The signed-in person's own settings
         * @description Every setting the person may see, each with their value or the default.
         *
         *     `value` is the person's own value where one is stored, otherwise the setting's default,
         *     otherwise `null`.
         */
        get: operations["api_public_v1_account_settings_list_settings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/account/v1/settings/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Write one of the signed-in person's own settings
         * @description Write the person's value for one setting, validated against its definition.
         *
         *     `404 setting-not-found` for a key this environment does not define and for a hidden setting
         *     alike. `403 setting-not-editable` for a setting the person can read but only an administrator
         *     can write. `422` naming `value` when the value does not satisfy the setting's constraints,
         *     including non-finite numbers.
         */
        put: operations["api_public_v1_account_settings_put_setting"];
        post?: never;
        /**
         * Clear one of the signed-in person's own settings back to its default
         * @description Remove the person's stored value for one setting, so the default applies again.
         *
         *     Same access rules as `PUT`. Idempotent: removing a value that was never stored is also `204`.
         */
        delete: operations["api_public_v1_account_settings_delete_setting"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * DeletionCancelIn
         * @description The body of `DELETE /deletion`: the token from the emailed cancellation link.
         *
         *     An unknown, used or expired token is `400 invalid-token`.
         */
        DeletionCancelIn: {
            /** Token */
            token: string;
        };
        /**
         * DeletionOut
         * @description A scheduled account deletion.
         *
         *     `erase_after` is the moment the account will be erased unless the emailed cancellation link is
         *     used, as an RFC 3339 UTC timestamp.
         */
        DeletionOut: {
            /**
             * Erase After
             * Format: date-time
             */
            erase_after: string;
        };
        /**
         * EmailChangeIn
         * @description The body of `POST /email`: the new address.
         *
         *     A malformed or over-long address is `422 validation-error` with `field = "email"`.
         */
        EmailChangeIn: {
            /** Email */
            email: string;
        };
        /**
         * EmailConfirmIn
         * @description The body of `POST /email/confirm`: the token from the confirmation link.
         *
         *     Only the `POST` spends the token, so a mail scanner that follows the link cannot. A token that
         *     is unknown, already used or expired is `400 invalid-token`.
         */
        EmailConfirmIn: {
            /** Token */
            token: string;
        };
        /**
         * EmailOut
         * @description The person's email address, whether it is verified, and whether a change of address is
         *     waiting for confirmation.
         *
         *     `change_pending` is `true` while a confirmation link sent by `POST /email` is outstanding. The
         *     pending address itself is never returned.
         */
        EmailOut: {
            /** Change Pending */
            change_pending: boolean;
            /** Email */
            email: string;
            /** Email Verified */
            email_verified: boolean;
        };
        /**
         * EnrollConfirmIn
         * @description The six digits. No `req`: this surface has no login chain to be bound to.
         */
        EnrollConfirmIn: {
            /** Code */
            code: string;
        };
        /**
         * EnrollStartOut
         * @description The TOTP shared secret and its `otpauth://` URI, returned once.
         */
        EnrollStartOut: {
            /** Otpauth Uri */
            otpauth_uri: string;
            /** Secret */
            secret: string;
        };
        /**
         * FlowFieldError
         * @description One field-level failure inside a `validation-error` problem.
         *
         *     `code` is a stable machine token, and `params` holds the values a message needs (`{"minimum":
         *     12, "maximum": 128}`). `message` is a fixed English string for developers, not for display to
         *     end users.
         */
        FlowFieldError: {
            /** Code */
            code: string;
            /** Field */
            field: string;
            /** Message */
            message: string;
            /** Params */
            params?: {
                [key: string]: number | string;
            };
        };
        /**
         * FlowProblem
         * @description An RFC 9457 problem details document, with the `code` every refusal on this API carries.
         *
         *     Problem documents may carry extension members beyond the fields listed here.
         */
        FlowProblem: {
            /** Code */
            code: string;
            /** Detail */
            detail?: string | null;
            /** Errors */
            errors?: components["schemas"]["FlowFieldError"][] | null;
            /** Feature */
            feature?: string | null;
            /** Instance */
            instance?: string | null;
            /** Plan */
            plan?: string | null;
            /** Request Id */
            request_id?: string | null;
            /** Required Plans */
            required_plans?: string[] | null;
            /** Retry After */
            retry_after?: number | null;
            /** Status */
            status: number;
            /** Title */
            title: string;
            /** Type */
            type: string;
        } & {
            [key: string]: unknown;
        };
        /**
         * IdentitiesOut
         * @description The person's provider identities, the providers this environment offers, and whether the
         *     person has a password.
         *
         *     Each provider carries a `start_url`. Linking a provider is a browser redirect through `GET
         *     /oauth/social/{kind}/start?intent=link`, made top-level by the customer's screen.
         */
        IdentitiesOut: {
            /** Has Password */
            has_password: boolean;
            /** Identities */
            identities: components["schemas"]["IdentityOut"][];
            /** Providers */
            providers: components["schemas"]["ProviderOut"][];
        };
        /**
         * IdentityOut
         * @description One provider link. No `provider_subject` — it is the operator's projection.
         */
        IdentityOut: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Last Login At */
            last_login_at: string | null;
            /** Linked At */
            linked_at: string | null;
            /** Provider Email */
            provider_email: string | null;
        };
        /**
         * ListQuery
         * @description The two query parameters every list operation takes.
         *
         *     `limit` outside its bounds is `422`.
         */
        ListQuery: {
            /** Cursor */
            cursor?: string | null;
            /**
             * Limit
             * @default 50
             */
            limit: number;
        };
        /**
         * MfaFactorOut
         * @description One factor, in `GET /flow/mfa`'s own shape. Never a seed and never a hash.
         */
        MfaFactorOut: {
            /** Confirmed At */
            confirmed_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
            /** Last Used At */
            last_used_at: string | null;
            /** Recovery Codes Remaining */
            recovery_codes_remaining: number | null;
        };
        /**
         * MfaOut
         * @description The factors, and the policy that decides what may be removed.
         */
        MfaOut: {
            /** Factors */
            factors: components["schemas"]["MfaFactorOut"][];
            /** Policy */
            policy: string;
        };
        /**
         * PasskeyOut
         * @description One credential, as its owner may see it.
         */
        PasskeyOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Used At */
            last_used_at: string | null;
            /** Name */
            name: string | null;
            /** Transports */
            transports: string[];
            /** Verified */
            verified: boolean;
        };
        /**
         * PasskeysOut
         * @description The person's passkeys, and where they can add one.
         *
         *     Registering a passkey is not possible through this API: the passkey is bound to the issuer host,
         *     so browsers refuse to create it on another origin. `portal_url` is the hosted account portal's
         *     security page, which a customer's screen links to instead.
         */
        PasskeysOut: {
            /** Passkeys */
            passkeys: components["schemas"]["PasskeyOut"][];
            /** Portal Url */
            portal_url: string;
        };
        /**
         * PasswordIn
         * @description The body of `POST /password`.
         *
         *     `current_password` is required when the person has a password, and omitted when they have none;
         *     a missing or wrong one is `401 invalid-credentials`. Length is checked by the environment's
         *     password policy, which answers `422 password-policy` with `errors[].field = "password"`.
         */
        PasswordIn: {
            /**
             * Current Password
             * @default
             */
            current_password: string;
            /** New Password */
            new_password: string;
        };
        /**
         * PasswordPolicyOut
         * @description What a password form needs before anything is typed: whether the person has a password (and
         *     so must give the current one), the minimum length, and whether new passwords are checked
         *     against known breaches.
         */
        PasswordPolicyOut: {
            /** Breach Check */
            breach_check: boolean;
            /** Has Password */
            has_password: boolean;
            /** Min Length */
            min_length: number;
        };
        /**
         * PortalOut
         * @description The hosted account portal's entry URL and the sections this environment offers.
         *
         *     `url` is `{issuer}/account`. To have the portal send the person back to your application, add
         *     the `client_id` and `return_to` query parameters.
         */
        PortalOut: {
            /** Sections */
            sections: components["schemas"]["PortalSection"][];
            /** Url */
            url: string;
        };
        /** @enum {string} */
        PortalSection: "profile" | "password" | "security" | "sessions" | "danger";
        /**
         * ProfileOut
         * @description The person's profile. Custom `metadata` is never included.
         */
        ProfileOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Email Verified */
            email_verified: boolean;
            /** Has Password */
            has_password: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Locale */
            locale: string | null;
            /** Mfa Enrolled */
            mfa_enrolled: boolean;
            /** Name */
            name: string | null;
            /** Picture Url */
            picture_url: string | null;
        };
        /**
         * ProfilePatch
         * @description Name, language and picture. Every member is optional, and `null` clears it.
         *
         *     The email address cannot be changed here; use `POST /email` and `POST /email/confirm`.
         */
        ProfilePatch: {
            /** Locale */
            locale?: string | null;
            /** Name */
            name?: string | null;
            /** Picture Url */
            picture_url?: string | null;
        };
        /**
         * ProviderOut
         * @description One provider the person can link or re-authenticate with.
         *
         *     `start_url` is a same-origin path on the issuer with no destination parameter, to be opened as a
         *     top-level navigation.
         */
        ProviderOut: {
            /** Kind */
            kind: string;
            /** Label */
            label: string | null;
            /** Start Url */
            start_url: string;
        };
        /**
         * ReauthIn
         * @description The body of `POST /reauth`: the person's password.
         *
         *     Passkeys and provider sign-in cannot be used through this API, because both need the browser on
         *     the issuer's own origin. The hosted `/account/reauth` page accepts all three; `GET /reauth` says
         *     which the person has.
         */
        ReauthIn: {
            /** Password */
            password: string;
        };
        /**
         * ReauthOut
         * @description What the person can re-authenticate with.
         *
         *     `reauthenticated_until` is `null` when the session has no current re-authentication, so a screen
         *     can tell whether to ask for one before the person fills in a form.
         */
        ReauthOut: {
            /** Has Password */
            has_password: boolean;
            /** Passkey Available */
            passkey_available: boolean;
            /** Reauth Providers */
            reauth_providers: components["schemas"]["ProviderOut"][];
            /** Reauthenticated Until */
            reauthenticated_until: string | null;
        };
        /**
         * RecoveryCodesOut
         * @description The ten codes, shown once — the only place a secret appears in a body here.
         */
        RecoveryCodesOut: {
            /** Recovery Codes */
            recovery_codes: string[];
        };
        /**
         * ResendOut
         * @description Whether an email was sent.
         *
         *     `POST /email/resend` answers `false`, and sends nothing, when the address is already verified.
         */
        ResendOut: {
            /** Sent */
            sent: boolean;
        };
        /**
         * RevokedOut
         * @description The number of sessions revoked.
         */
        RevokedOut: {
            /** Revoked */
            revoked: number;
        };
        /**
         * SessionOut
         * @description One of the person's sessions.
         */
        SessionOut: {
            /** Amr */
            amr: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Current */
            current: boolean;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Ip */
            ip: string | null;
            /**
             * Last Seen At
             * Format: date-time
             */
            last_seen_at: string;
            /** User Agent */
            user_agent: string | null;
        };
        /**
         * SessionPage
         * @description One cursor page of sessions — the `{items, next_cursor}` every list has.
         */
        SessionPage: {
            /** Items */
            items: components["schemas"]["SessionOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * SettingIn
         * @description One value, of whatever shape the definition's constraints allow.
         */
        SettingIn: {
            /** Value */
            value?: unknown;
        };
        /**
         * UserSettingDocument
         * @description One setting, with the person's value.
         *
         *     `value` is the person's stored value where there is one, otherwise the setting's default,
         *     otherwise `null`.
         *
         *     `constraints` depends on `type`: `choices` for `enum`, `max_length` for `string` (always
         *     present), `min` and `max` for `number`, and `{}` for `boolean`.
         */
        UserSettingDocument: {
            /** Constraints */
            constraints: {
                [key: string]: unknown;
            };
            /** Key */
            key: string;
            /** Label */
            label: string;
            type: components["schemas"]["UserSettingType"];
            value?: components["schemas"]["UserSettingValue"];
        };
        /** @enum {string} */
        UserSettingType: "boolean" | "enum" | "string" | "number";
        UserSettingValue: boolean | number | string | null;
        /**
         * UserSettingsDocument
         * @description The body of `GET /account/v1/settings`: one row per setting the person may see, in key order.
         *
         *     At most 50 rows. Hidden settings are not included.
         */
        UserSettingsDocument: {
            /** Settings */
            settings: components["schemas"]["UserSettingDocument"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    api_public_v1_account_deletion_request_deletion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeletionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_deletion_cancel_deletion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeletionCancelIn"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_read_email: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_request_email_change: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailChangeIn"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResendOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_confirm_email_change: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailConfirmIn"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_resend_verification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResendOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_identities_list_identities: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IdentitiesOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_identities_delete_identity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                identity_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_mfa_list_mfa: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MfaOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_mfa_enroll_confirm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnrollConfirmIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecoveryCodesOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_mfa_enroll_start: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnrollStartOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_mfa_regenerate_recovery: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RecoveryCodesOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_mfa_delete_mfa: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                factor_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_passkeys_list_passkeys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasskeysOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_passkeys_delete_passkey: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                factor_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_password_read_password_policy: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordPolicyOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_password_change_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PasswordIn"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_portal_read_portal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PortalOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_read_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_profile_patch_profile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfilePatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_reauth_read_reauth: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReauthOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_reauth_reauthenticate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReauthIn"];
            };
        };
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_sessions_list_sessions: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionPage"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_sessions_revoke_other_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RevokedOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_sessions_revoke_session: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                session_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_settings_list_settings: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserSettingsDocument"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_settings_put_setting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserSettingDocument"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
    api_public_v1_account_settings_delete_setting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description No Content */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FlowProblem"];
                };
            };
        };
    };
}
