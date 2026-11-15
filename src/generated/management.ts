/**
 * GENERATED — do not edit. `pnpm generate:client` writes it from the
 * deployed management API document (https://api.kleora.io/api/v1/openapi.json).
 *
 * The management API's OpenAPI document, as TypeScript: every path, every
 * request body, every response envelope and the RFC 9457 problem document.
 * `src/management.ts` gives the pieces their names and adds auth, problem
 * parsing and the environment guard; nothing else imports this file.
 */

export interface paths {
    "/api/v1/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Service metadata */
        get: operations["service_info"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The calling principal's account
         * @description The Account the credential was issued for.
         *
         *     A console user who belongs to several Accounts reads the one their token was issued for. One of
         *     the two operations (with `GET /me`) still available while the Account is suspended.
         */
        get: operations["read_account"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Rename the account
         * @description Rename the Account. `slug`, `plan`, `status` and `tenant_id` cannot be changed.
         *
         *     Not available while the Account is suspended.
         */
        patch: operations["patch_account"];
        trace?: never;
    };
    "/api/v1/account/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The account's audit events
         * @description Every audit event of the Account, including account-level events, newest first.
         *
         *     `environment_id` and `tenant_id` narrow the list; an id from another Account matches nothing.
         *     Only available to console users: an API key or a tenant member's token is `403
         *     insufficient-scope`.
         */
        get: operations["list_account_audit_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account/billing": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Plan, limits, usage and subscription
         * @description The Account's plan, subscription and limits, as last recorded.
         *
         *     Served from Kleora's own copy of the billing state, so it answers even when the payment provider
         *     is unavailable; `subscription.as_of` says how current it is. Limits are reported per App, as the
         *     plan that applies to each App. Never includes a card number or a payment provider identifier.
         */
        get: operations["read_billing"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account/billing/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Start Stripe Checkout
         * @description A short-lived Stripe Checkout URL for a named plan.
         *
         *     Answers `200`: nothing is created until the Checkout is completed. The currency follows
         *     `billing_country` (or the address on record when none is given, and the default currency
         *     otherwise), never the caller's language, and is fixed for the life of the subscription. Taxes
         *     are calculated and tax ids collected during Checkout; every price is net.
         *
         *     `409 conflict` when the Account already has a live subscription; change it through the billing
         *     portal instead.
         */
        post: operations["start_checkout_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account/billing/portal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Open the Stripe Customer Portal
         * @description A billing portal session, created for this request and never reused.
         *
         *     The portal is where cards, invoices, receipts, tax ids and cancellation are managed. Takes no
         *     body and returns one URL.
         */
        post: operations["open_portal_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account/billing/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * MAU, App and Tenant usage for the current period
         * @description What the Account has used this calendar month, and against what allowance.
         *
         *     Every figure comes with the window it was measured over and the allowance it is measured
         *     against, from the same figures the invoice is built from. `over_allowance` is informational:
         *     exceeding an allowance never blocks sign-in.
         *
         *     Requires `billing:read`.
         */
        get: operations["read_billing_usage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/account/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Account usage
         * @description Users per App and per environment, and the App count against the plan's limit.
         *
         *     Sandbox environments are reported but never counted toward a limit. Not available while the
         *     Account is suspended.
         */
        get: operations["read_usage"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/accounts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create an account
         * @description Create an additional Account for the person holding a console token.
         *
         *     Only a console user's token may call this; an API key or a tenant member's token is refused. The
         *     person's email address must be verified, and the number of Accounts a person may hold is
         *     limited.
         *
         *     No `Location` header: `/account` always means the Account the token was issued for, and the new
         *     Account becomes reachable once the console signs in again for it.
         */
        post: operations["create_account_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/apps": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List apps
         * @description The Account's Apps, oldest first, optionally filtered to one slug or searched.
         *
         *     `slug` is an exact, case-sensitive match. A slug that belongs to another Account returns an
         *     empty page rather than `404`. `q` is a case-insensitive substring of `name` or `slug`. A cursor
         *     is only valid with the filters it was issued for.
         */
        get: operations["list_apps"];
        put?: never;
        /**
         * Create an app
         * @description Create an App with its production and sandbox environments and their default contents.
         *
         *     Either everything is created or nothing is. Accepts an `Idempotency-Key` header, which is
         *     recommended given how much one call provisions.
         */
        post: operations["create_app_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/apps/{app_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An app
         * @description The App, with the ids of both its environments.
         *
         *     An `app_id` that is not a UUID is answered `404`, like a missing App.
         */
        get: operations["read_app"];
        put?: never;
        post?: never;
        /**
         * Delete an app
         * @description Delete the App, both its environments and everything in them, in one transaction.
         *
         *     Refused for the platform's own `id` App. Repeating the `DELETE` answers `404`.
         */
        delete: operations["delete_app_operation"];
        options?: never;
        head?: never;
        /**
         * Rename an app
         * @description Rename it. The slug is not a property that can move; the schema says so.
         */
        patch: operations["patch_app"];
        trace?: never;
    };
    "/api/v1/apps/{app_id}/environments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An app's environments
         * @description The App's two environments, in the standard list envelope.
         *
         *     Not paginated: an App always has exactly two environments, so `next_cursor` is always `null`.
         */
        get: operations["list_app_environments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/apps/{app_id}/environments/{environment_id}/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Environment statistics
         * @description The environment's overview figures: current totals, a daily series over the range, and setup
         *     progress.
         *
         *     Cached for 60 seconds per environment and range; `computed_at` is when the figures were
         *     computed.
         */
        get: operations["read_environment_stats"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** An environment's settings */
        get: operations["read_environment"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Change an environment's settings
         * @description Update any subset of the environment's settings.
         *
         *     - `tenant_mode` and `no_tenant_behaviour` cannot be changed on the platform's own `id` App: `409
         *       platform-protected`.
         *     - `no_tenant_behaviour=create` needs a `tenant_creator_role`, which must name an app-scoped role
         *       of this environment; otherwise `422` naming the field.
         *     - Switching `tenant_mode` from `multi` to `single` is refused while another tenant exists (`409
         *       tenant-mode-switch-blocked`) or while an earlier switch is still being applied (`409
         *       tenant-mode-backfill-pending`).
         *
         *     The `PATCH` that switches to `single` answers `202`: the settings are saved, but the memberships
         *     the new mode needs are written in the background, and `backfill_status` reads `pending` until
         *     that is done.
         *
         *     `mfa_policy: required` is `402 payment-required` on a plan without MFA enforcement; `off` and
         *     `optional` are available on every plan.
         *
         *     `mfa_policy`, `password_min_length` and `password_breach_check` can only be changed by a console
         *     user. Any other credential sending one of them, whatever the value, gets `403
         *     insufficient-scope` naming the fields, and nothing in the request is applied.
         */
        patch: operations["patch_environment"];
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/api-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List API keys
         * @description The environment's API keys, newest first, optionally filtered by `status` or searched.
         *
         *     `status` is computed from the revocation and expiry times, evaluated once for the whole page.
         *     `q` is a case-insensitive substring of `name`. A cursor is only valid with the filters it was
         *     issued for.
         */
        get: operations["list_api_keys"];
        put?: never;
        /**
         * Create an API key
         * @description Create an API key. Its prefix follows the environment's kind.
         *
         *     The `201` carries the full key, once, and is never cached. Repeating the request with the same
         *     `Idempotency-Key` returns the same response, key included; without one, a second request creates
         *     a second key.
         *
         *     - A scope that is not allowed: `422 invalid-scope`, naming each.
         *     - An environment that already has 100 keys that are not revoked: `422 limit-exceeded`.
         *     - An `expires_at` less than 60 seconds ahead: `422 validation-error` on that field.
         */
        post: operations["create_api_key_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/api-keys/{api_key_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An API key
         * @description The key, without the credential — absent from this shape, not null.
         */
        get: operations["read_api_key"];
        put?: never;
        post?: never;
        /**
         * Delete an API key
         * @description Delete an API key, whether or not it was revoked first.
         *
         *     The key stops working immediately. The `api_key.deleted` audit event keeps the key's `name` and
         *     `prefix`.
         */
        delete: operations["delete_api_key_operation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/api-keys/{api_key_id}/revoke": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revoke an API key
         * @description Revoke an API key, keeping its record. Idempotent.
         *
         *     The key stops working immediately. Revoking a revoked key answers `200` with the same key, and
         *     records no second event. `404` when the key is deleted while the request is being processed.
         */
        post: operations["revoke_api_key_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/api-keys/{api_key_id}/rotate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate an API key
         * @description Issue a new secret for an API key, returned once. Takes no body.
         *
         *     The key keeps its id, name, scopes and audit history. The previous secret stops working
         *     immediately; there is no overlap. A revoked or expired key is `409 api-key-not-rotatable`;
         *     create a new key instead. `404` when the key is deleted while the request is being processed.
         */
        post: operations["rotate_api_key_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An environment's audit events
         * @description Every audit event recorded against this environment, newest first.
         *
         *     Account-level events, and events of Apps that have since been deleted, are not included; read
         *     them with `GET /account/audit-events`. `?tenant_id=` narrows the list further.
         */
        get: operations["list_environment_audit_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/branding": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An environment's branding record
         * @description The stored branding record, merged over the defaults so every key is present.
         */
        get: operations["read_branding"];
        /**
         * Replace an environment's branding record
         * @description Replace the environment's whole branding record. The record is validated and normalised, and
         *     the changed keys are audited.
         *
         *     Unknown keys anywhere in the record are rejected, as are members that do not apply (for example
         *     `background.angle` on a solid background).
         */
        put: operations["replace_branding"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/branding/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create a branding preview draft
         * @description Store a draft branding record for 600 seconds, and return a URL that renders it.
         *
         *     Nothing is saved to the environment; to save the draft, `PUT` the same body. An invalid draft is
         *     the same `422` a `PUT` of it would be. The response is never cached, since `preview_url` grants
         *     access to the draft.
         *
         *     The rate limit is checked before the draft is validated, so a rate-limited request is `429` even
         *     when its body is also invalid.
         */
        post: operations["preview_branding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/branding/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Restore the default branding record
         * @description `DEFAULT_BRANDING` back, in one call, with `branding.reset` recorded.
         */
        post: operations["reset_branding"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List clients
         * @description The environment's OAuth clients, oldest first, optionally filtered or searched.
         *
         *     `?is_default=true` returns the environment's default client, and `?is_default=false` the rest.
         *     `q` is a case-insensitive substring of `name` or `client_id`. A cursor is only valid with the
         *     filters it was issued for.
         */
        get: operations["list_clients"];
        put?: never;
        /**
         * Create a client
         * @description Create a `spa`, `web` or `native` OAuth client. The `client_id` is generated.
         *
         *     For `kind: "web"`, the `201` carries the client secret, once, and is never cached. Repeating the
         *     request with the same `Idempotency-Key` returns the same response, secret included.
         */
        post: operations["create_client_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/clients/{client_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A client
         * @description The client, without its secret — absent from this shape, not null.
         */
        get: operations["read_client"];
        put?: never;
        post?: never;
        /**
         * Delete a client
         * @description Delete an OAuth client, with its authorization codes, pending authorization requests and
         *     refresh tokens.
         *
         *     Browser sessions are not affected, since they are shared by the environment's clients; tokens
         *     issued through this client can no longer be refreshed. `409 client-default` for the
         *     environment's default client.
         */
        delete: operations["delete_client_operation"];
        options?: never;
        head?: never;
        /**
         * Change a client
         * @description Update an OAuth client (merge patch). The secret cannot be changed here.
         *
         *     - `{"is_default": false}` is `409 client-default`: an environment always has a default client;
         *       make another client the default instead.
         *     - `409 conflict` when a concurrent change prevents the update.
         *     - Changing `kind` away from `web` removes the secret, and the response has `has_secret: false`.
         */
        patch: operations["patch_client"];
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/clients/{client_id}/rotate-secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate a client secret
         * @description Issue a new secret for a `web` client, returned once. Takes no body.
         *
         *     The previous secret stops working at `/oauth/token` immediately; there is no overlap. A `spa` or
         *     `native` client has no secret: `409 client-not-confidential`.
         */
        post: operations["rotate_client_secret"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/email-templates": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List email templates
         * @description All of the environment's email templates, by kind, `en` before `pl`.
         *
         *     The list has a fixed size, so `next_cursor` is always `null`, and `limit` and `cursor` are
         *     accepted and ignored.
         */
        get: operations["list_email_templates"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/email-templates/variables": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The variables an email template may use
         * @description The variables an email template may use, with a description and a sample value for each.
         *
         *     Samples use the environment's own App name and issuer, in the environment's default language.
         */
        get: operations["read_email_template_variables"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/email-templates/{kind}/{locale}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An email template
         * @description One row, as stored: the source a customer edits, not a rendering of it.
         */
        get: operations["read_email_template"];
        /**
         * Replace an email template
         * @description Replace an email template: subject and body together.
         *
         *     The template stops being the default, so `reset` restores the shipped version. Everything the
         *     template language does not allow is a `422` naming each problem and the line it is on, all at
         *     once.
         */
        put: operations["put_email_template"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/email-templates/{kind}/{locale}/render": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Render an email template with sample values
         * @description Render the stored template, or a draft, with sample values. Nothing is sent or saved.
         *
         *     Requires only `email_templates:read`. Each field present in the body replaces that part of the
         *     stored template for this render only. A draft is validated as a write would be, so an invalid
         *     one is the `422` saving it would give.
         */
        post: operations["render_email_template"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/email-templates/{kind}/{locale}/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reset an email template to the shipped default
         * @description Restore the shipped default template, and set `is_default` to `true`.
         *
         *     The current shipped version is restored, which may have been improved since the App was created.
         */
        post: operations["reset_email_template"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/identity-providers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List identity providers
         * @description Every identity provider configured for the environment, by kind. Client secrets are never
         *     returned.
         *
         *     Disabled providers are listed too. Not paginated: `next_cursor` is always `null`.
         */
        get: operations["list_identity_providers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/identity-providers/{kind}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * An identity provider
         * @description One identity provider's configuration. The client secret is never returned.
         *
         *     `404` when this environment has not configured that kind. `client_secret_set` and
         *     `client_secret_updated_at` say whether a secret is stored and when it last changed.
         */
        get: operations["read_identity_provider"];
        /**
         * Configure an identity provider
         * @description Create or replace the environment's configuration for one identity provider kind.
         *
         *     `client_secret` is write-only, and optional: omitting it keeps the stored secret. On the first
         *     write for a kind it is required (`422 validation-error`). Sending a different value rotates it:
         *     the previous secret keeps working for token exchanges for 24 hours, and the rotation is audited
         *     as `identity_provider.secret_rotated`.
         */
        put: operations["put_identity_provider"];
        post?: never;
        /**
         * Delete an identity provider
         * @description Remove an identity provider's configuration. The identities it authenticated are kept.
         *
         *     `409 provider-in-use`, with the number of identities, while any identity of that provider exists
         *     in the environment; `?force=1` proceeds anyway. People whose only credential is that provider
         *     can no longer sign in once it is removed.
         */
        delete: operations["delete_identity_provider"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List permissions
         * @description The environment's permissions by name: the platform's reserved permissions and your own.
         *
         *     `?system=true` lists the reserved permissions and `?system=false` your own. `q` is a
         *     case-insensitive substring of `name`. A cursor is only valid with the filters it was issued for.
         */
        get: operations["list_permissions"];
        put?: never;
        /**
         * Create a permission
         * @description Create a permission.
         *
         *     A name whose resource part is one of the reserved resources (for example `users:export`) is `422
         *     reserved-permission`.
         */
        post: operations["create_permission_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/promote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Promote sandbox configuration to production
         * @description Copy the sandbox environment's configuration onto its production environment, in one
         *     transaction.
         *
         *     Copies settings, branding, permissions, app-scoped roles and the email templates. Users,
         *     tenants, clients, API keys and signing keys are never copied, so production keeps working with
         *     the credentials its callers already hold.
         *
         *     `{"dry_run": true}` computes the same diff and applies nothing. A real promotion records one
         *     `promotion.applied` audit event on the production environment, even when nothing has changed.
         *
         *     Requires `settings:write`, and also the write permission for every part of the diff that is not
         *     empty (`branding:write`, `email_templates:write`, `permissions:write`, `roles:write`); otherwise
         *     `403 insufficient-permission` naming each missing one, and nothing is written. A dry run is
         *     authorised the same way.
         *
         *     A diff that switches `tenant_mode` to `single` has the same preconditions as the settings
         *     `PATCH` (`409 tenant-mode-switch-blocked`, `409 tenant-mode-backfill-pending`), and a dry run
         *     reports them too.
         */
        post: operations["promote_environment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List app-scoped roles
         * @description The environment's app-scoped roles by slug.
         *
         *     Tenant-scoped roles are listed under the tenant that defines them, at `GET
         *     /tenants/{tenant_id}/roles`. `q` is a case-insensitive substring of the slug or the name.
         */
        get: operations["list_roles"];
        put?: never;
        /**
         * Create an app-scoped role
         * @description Create an app-scoped role, assignable in every tenant of the environment.
         *
         *     Role slugs are unique across the environment, including tenants' own roles: a slug a tenant
         *     already uses is `409 role-slug-conflict`.
         */
        post: operations["create_role_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/sessions/revoke-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revoke every session in the environment
         * @description Revoke every session and every refresh token in the environment.
         *
         *     For use after a signing key compromise, together with a signing key rotation that retires the
         *     old key immediately. Access tokens already issued remain valid until they expire, so keep
         *     `access_token_ttl` short if you need an immediate cut-off.
         */
        post: operations["revoke_all_environment_sessions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/settings/definitions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List setting definitions
         * @description The environment's user setting definitions by key. An environment holds at most 50.
         */
        get: operations["list_setting_definitions"];
        put?: never;
        /**
         * Create a setting definition
         * @description Create a user setting definition. `key` and `type` cannot be changed afterwards.
         *
         *     Constraints that do not fit the type, or a default that does not satisfy them, are `422
         *     validation-error` naming the field. A key the environment already defines is `409
         *     setting-exists`. The 51st definition is `422 limit-exceeded`.
         */
        post: operations["create_setting_definition"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/settings/definitions/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** A setting definition */
        get: operations["read_setting_definition"];
        put?: never;
        post?: never;
        /**
         * Delete a setting definition
         * @description Delete the definition and every value stored under it.
         *
         *     `value_count` on the definition says how many values will be deleted.
         */
        delete: operations["delete_setting_definition"];
        options?: never;
        head?: never;
        /**
         * Change a setting definition
         * @description Update a definition's constraints, default, access, label or description. `key` and `type`
         *     cannot be changed (`immutable`).
         *
         *     Narrowing a constraint does not re-validate stored values: they stay readable, and are validated
         *     at their next write. The definition's own default is validated now.
         */
        patch: operations["patch_setting_definition"];
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/settings/users/{user_id}/values": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * One user's settings
         * @description Every setting definition's value for this user, including hidden settings.
         *
         *     Each row carries the stored value or the default. At most 50 rows, so `next_cursor` is always
         *     `null`, and `limit` and `cursor` are accepted and ignored.
         */
        get: operations["list_user_settings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/settings/users/{user_id}/values/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Write one user's setting
         * @description Write one value for this user, validated against the setting's definition.
         *
         *     Settings of every access level can be written here, including `hidden` and `user_visible` ones.
         *     A value the constraints refuse, including one over the 1 KB size limit, is `422
         *     validation-error` naming `value`.
         */
        put: operations["put_user_setting"];
        post?: never;
        /**
         * Clear one user's setting
         * @description Remove the user's stored value, so the default applies again.
         *
         *     Requires `settings:write`. Idempotent: removing a value that was never stored is also `204`.
         */
        delete: operations["delete_user_setting"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/signing-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List signing keys
         * @description Every signing key of the environment, ordered `active`, `next`, `retired`.
         *
         *     Not paginated: there is one `active` key, at most one `next` key, and the retired keys still
         *     within their retention window. `next_cursor` is always `null`.
         */
        get: operations["list_signing_keys"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/signing-keys/rotate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate the signing keys
         * @description Rotate the environment's signing keys: `next` becomes `active`, the old `active` key is
         *     retired, and a new `next` key is announced.
         *
         *     Audited as one `signing_key.rotated` event naming the three key ids. The body is optional;
         *     `{"retire_immediately": true}` is for a key compromise, and deletes the previously active key
         *     rather than retiring it, so it leaves the JWKS at once and tokens it signed stop verifying as
         *     caches refresh.
         *
         *     The response is the keys' state after the rotation, as `GET .../signing-keys` and
         *     `/.well-known/jwks.json` report it.
         */
        post: operations["rotate_signing_keys_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/tenants": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List tenants
         * @description The environment's tenants, newest first, filtered by `q` and `status`.
         *
         *     In `single` tenant mode, the default tenant is not listed. `q` is a case-insensitive substring
         *     of the name or the slug. A cursor is only valid with the filters it was issued for.
         */
        get: operations["list_tenants"];
        put?: never;
        /**
         * Create a tenant
         * @description Create a tenant with no members.
         *
         *     - In `single` tenant mode: `409 tenant-mode-single`.
         *     - The slugs `default` and `kleora` are reserved: `409 slug-reserved`.
         *     - A slug another tenant holds: `409 slug-taken`.
         */
        post: operations["create_tenant_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List users
         * @description The environment's users, newest first, narrowed by up to six filters.
         *
         *     Erased users are excluded unless `status=erased` asks for them.
         *
         *     `session=active` selects users holding at least one live session. It counts users, not sessions,
         *     so it can differ from the overview's count of active sessions.
         *
         *     A cursor is only valid with the filters it was issued for, and a tenant member's cursor only
         *     within its own tenant.
         */
        get: operations["list_users"];
        put?: never;
        /**
         * Create a user
         * @description Create a user as an administrator.
         *
         *     An address already registered in the environment is `409 email-taken`. `password` is optional:
         *     without one the user has no password until a reset sets one, and `has_password` says so. The
         *     password is never returned.
         */
        post: operations["create_user_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user
         * @description The user, including an erased one — so an audit reference still resolves.
         */
        get: operations["read_user"];
        put?: never;
        post?: never;
        /**
         * Erase a user
         * @description Erase a user. The user's record is kept, with its identifying data overwritten.
         *
         *     `?erase=true` is accepted and changes nothing: every deletion is an erasure.
         *
         *     Irreversible. Credentials and memberships are deleted, and the audit trail keeps only the user's
         *     id. `409 last-owner` while the user is the last active owner of an Account's tenant.
         */
        delete: operations["delete_user_operation"];
        options?: never;
        head?: never;
        /**
         * Change a user
         * @description Update a user's profile (merge patch). The password and the status cannot be changed here.
         *
         *     Changing `email` requires the address to be free in this environment, marks it unverified, and
         *     emails a verification link, unless the same patch sets `email_verified: true`.
         */
        patch: operations["patch_user"];
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/block": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Block a user
         * @description Block the user from signing in, and end everything already signed in.
         *
         *     In one transaction: the status changes, and every live session and its refresh tokens are
         *     revoked. A blocked user's next sign-in is refused exactly as a wrong password is, and a refresh
         *     answers `invalid_grant`.
         *
         *     The body is optional and carries one field, `reason`: a note of up to 200 characters, stored
         *     with the block and included in the `user.blocked` event's `data.reason`.
         *
         *     Idempotent: blocking a blocked user answers `200` with no second event, and does not overwrite
         *     the reason first recorded. To change it, unblock and block again.
         */
        post: operations["block_user_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/device-authorizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user's device authorizations
         * @description What the user has authorized a device or agent to do on their behalf, newest first.
         *
         *     Each entry names the client, and says when it was approved, when it was last used and from
         *     where. Revoked and expired authorizations are listed too, marked as such.
         */
        get: operations["list_user_device_authorizations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/device-authorizations/{authorization_id}": {
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
         * Revoke a device authorization
         * @description Revoke a device authorization: the session it opened, and every refresh token of that
         *     session.
         *
         *     Access tokens already issued remain valid until they expire; the device can no longer renew
         *     them. Idempotent: revoking an authorization that has already ended is also `204`, with no second
         *     event. An id that is not this user's, or not a UUID, is `404`. `409 conflict` when the session
         *     is deleted while the request is being processed.
         */
        delete: operations["delete_user_device_authorization"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Export a user
         * @description Everything Kleora holds about one user, as one document.
         *
         *     The user record, identities without their secrets, MFA factors without their seeds, memberships,
         *     sessions, and the audit events where the user is actor or target, newest first. The audit events
         *     are capped, and `audit_events_truncated` says when the cap applied. The response is never
         *     cached.
         */
        get: operations["export_user"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/identities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user's linked accounts
         * @description The user's external provider identities, oldest first.
         *
         *     A password is not listed here; `has_password` on the user says whether there is one.
         *     `provider_email` is the address the provider reported, for display only, and is never used to
         *     decide who a person is; it is empty for an identity an administrator linked.
         *
         *     Not paginated, since a user holds at most one identity per provider: `next_cursor` is always
         *     `null`.
         */
        get: operations["list_user_identities"];
        put?: never;
        /**
         * Link a provider account to a user
         * @description Link an external provider account to this user, by the provider's subject identifier.
         *
         *     `provider_subject` is the provider's own permanent id for the person, never an email address.
         *
         *     - `201` with a `Location` header when the link is new.
         *     - `200` when that subject is already linked to this user, with no second audit event.
         *     - `409 provider-already-linked` when the subject is linked to another user of this environment.
         *       It is never moved; merge the two users instead.
         *
         *     The link records no provider email or verification status; they are filled in at the person's
         *     next sign-in through that provider.
         */
        post: operations["link_user_identity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/identities/{identity_id}": {
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
         * Unlink a provider account
         * @description Unlink one of the user's external provider accounts.
         *
         *     `409 last-credential` when the user would be left with no password, no other linked provider and
         *     no confirmed passkey: no way to start a sign-in. An authenticator app does not count, since it
         *     is a second factor. Nothing changes on a refusal.
         *
         *     The sessions that were authenticated through this provider are revoked, and no others.
         */
        delete: operations["unlink_user_identity"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/memberships": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user's memberships
         * @description Which tenants this user belongs to, and what it holds in each.
         *
         *     Oldest first, the surface's default: a membership list is a history of how
         *     somebody came to have the access they have, and it reads forwards.
         */
        get: operations["list_user_memberships"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/merge": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Merge another user into this one
         * @description Merge the user `source_id` into this user, and erase the source user. Irreversible.
         *
         *     The user in the path keeps its own `email`, `name`, `picture_url` and `locale`. The source user
         *     is erased as `DELETE .../users/{user_id}` erases, and records a `merged_into` pointer, so
         *     reading the old id shows where the person went.
         *
         *     In one transaction:
         *
         *     - the source's provider identities move, and its password only if this user has none;
         *     - its memberships move, and where both users are members of one tenant, the roles are combined;
         *     - its passkeys move, and its TOTP factor or recovery codes only if this user has none of that
         *       kind;
         *     - its setting values move for the keys this user has no value for;
         *     - `metadata` is merged, this user's keys winning;
         *     - every session of both users is revoked.
         *
         *     Audit history is never rewritten: the merge is recorded as `user.merged` on this user and
         *     `user.erased` on the source.
         *
         *     Refusals: `422 same-user`, `409 user-erased` for either user, and `409 last-owner` when the
         *     source is the last active owner of an Account's tenant. A `source_id` in another environment is
         *     `404`. Not available to a tenant member's token.
         */
        post: operations["merge_user_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/mfa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user's MFA factors
         * @description Every MFA factor of the user, confirmed or not.
         *
         *     Available on every plan, since resetting a user's MFA needs a factor id from this list. Not
         *     paginated: a user holds at most a few factors. Secrets and recovery code hashes are never
         *     returned.
         */
        get: operations["list_user_mfa_factors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/mfa/{factor_id}": {
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
         * Administrative MFA reset
         * @description Reset the user's MFA: remove their factors, and email them a notice.
         *
         *     Removing a TOTP factor or the recovery codes removes both, so the id only has to name one factor
         *     of this user. An id of another user's factor is `404`. Sessions are not revoked; if the
         *     environment requires MFA, the user enrols again at the next sign-in.
         *
         *     Available on every plan: this is how a user who has lost their device and their recovery codes
         *     gets back in.
         */
        delete: operations["delete_user_mfa_factor"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Set a user's password
         * @description Set a new password for the user, without the old one.
         *
         *     Answers `204`. Every session and refresh token of the user is revoked, and the user is emailed
         *     to say their password was changed. Not available to a tenant member's token: `403
         *     insufficient-scope`, even with `users:write`.
         */
        post: operations["set_user_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/send-password-reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a password reset email
         * @description Email the user a password reset link, the same one the hosted forgot-password page sends.
         *
         *     Earlier unused reset links stop working. A blocked user is sent nothing, but the request is
         *     still audited.
         */
        post: operations["send_password_reset_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/send-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a verification email
         * @description Email the user a link to verify their address, within the per-user email budget.
         *
         *     For an address that is already verified, nothing is sent and nothing is counted against the
         *     budget, and the answer is `{"sent": false}`. `{"sent": true}` means one message was sent.
         *
         *     The budget is shared by this operation, `send-password-reset` and the hosted pages' resend form.
         */
        post: operations["send_verification_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A user's sessions
         * @description The user's browser sessions, newest first; only live ones unless `include_expired` is set.
         *
         *     A live session is not revoked, has not expired, and has been used within the environment's
         *     `session_idle_ttl`. A cursor is only valid with the `include_expired` value it was issued for.
         */
        get: operations["list_user_sessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/sessions/revoke-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Revoke all of a user's sessions
         * @description Revoke every live session of the user, and their refresh tokens.
         *
         *     `revoked` counts the sessions that were live at the time, so a second call answers `{"revoked":
         *     0}`.
         */
        post: operations["revoke_all_user_sessions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/sessions/{session_id}": {
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
         * Revoke a session
         * @description Revoke the session and its refresh tokens. Idempotent.
         *
         *     A session id that is not this user's, or not a UUID, is `404`. Revoking a session that is
         *     already revoked is also `204`, with no second event. `409 conflict` when the session is deleted
         *     while the request is being processed.
         */
        delete: operations["delete_user_session"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/unblock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unblock a user
         * @description Let the user sign in again. The sessions blocking ended stay ended.
         *
         *     Idempotent: unblocking an active user is 200 with no second event.
         */
        post: operations["unblock_user_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/users/{user_id}/unlock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Clear a user's lockout
         * @description Reset the user's failed sign-in count and lift any lockout.
         *
         *     A lockout's expiry does not reset the failed sign-in count; only a successful sign-in, a
         *     password reset or this operation does. A block is a different state and is not affected.
         */
        post: operations["unlock_user_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-endpoints": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List webhook endpoints
         * @description The environment's webhook endpoints, newest first.
         *
         *     `?enabled=` narrows to endpoints in that state, and `?event_type=` to endpoints subscribed to
         *     that event type. A cursor is only valid with the filters it was issued for.
         */
        get: operations["list_webhook_endpoints"];
        put?: never;
        /**
         * Create a webhook endpoint
         * @description Create a webhook endpoint subscribed to `event_types`. The list is empty by default; there is
         *     no wildcard.
         *
         *     The `201` carries the signing secret in full, once, and is never cached.
         *
         *     - A URL that is not `https://`, does not resolve, or resolves to a private or reserved address:
         *       `422 webhook-url-rejected`, saying why.
         *     - An event type that is not in the published catalogue: `422 invalid-event-type`, naming each.
         *     - An environment that already has as many endpoints as the plan allows: `422 limit-exceeded`.
         *       Existing endpoints keep delivering after a downgrade.
         */
        post: operations["create_webhook_endpoint_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-endpoints/{webhook_endpoint_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A webhook endpoint
         * @description The endpoint, without its secret — absent from this shape, not null.
         */
        get: operations["read_webhook_endpoint"];
        put?: never;
        post?: never;
        /**
         * Delete a webhook endpoint
         * @description Remove the endpoint. Its delivery log survives (`WebhookDelivery.endpoint` is nullable).
         */
        delete: operations["delete_webhook_endpoint_operation"];
        options?: never;
        head?: never;
        /**
         * Change a webhook endpoint
         * @description Update a webhook endpoint (merge patch). The secret cannot be changed here.
         *
         *     `{"enabled": false}` disables the endpoint and is audited as `webhook_endpoint.disabled`.
         *     `{"enabled": true}` re-enables it, whether it was disabled by a person or automatically after
         *     repeated failures, and clears `disabled_at` and `disabled_reason`.
         */
        patch: operations["patch_webhook_endpoint"];
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-endpoints/{webhook_endpoint_id}/rotate-secret": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rotate a webhook endpoint's secret
         * @description Issue a new signing secret, returned once. The previous secret keeps verifying for 24 hours.
         *
         *     Both secrets sign deliveries until `previous_secret_expires_at`, which the response reports, so
         *     a handler can be updated without missing a delivery.
         */
        post: operations["rotate_webhook_endpoint_secret"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-endpoints/{webhook_endpoint_id}/test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Send a test event to a webhook endpoint
         * @description Send a representative `event_type` payload to the endpoint, marked `test: true` in the
         *     envelope.
         *
         *     Answers `202`: the event is recorded and its delivery scheduled. Whether it reaches the endpoint
         *     shows in the delivery log.
         */
        post: operations["test_webhook_endpoint"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List webhook events
         * @description The environment's webhook events, newest first: across every endpoint, or one endpoint's
         *     delivery log with `?endpoint_id=`.
         *
         *     Each event's `outcome` is the worst outcome among the endpoints it was delivered to, so a later
         *     success does not hide a failure; `succeeded_endpoints` and `total_endpoints` give the counts.
         *
         *     The `outcome` filter, by contrast, matches an event if any of its deliveries had that outcome,
         *     so an event that failed for one endpoint and succeeded for another is returned by both
         *     `?outcome=failed` and `?outcome=succeeded`. A cursor is only valid with the filters it was
         *     issued for.
         */
        get: operations["list_webhook_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-events/stream": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Tail an environment's webhook events
         * @description A live `text/event-stream` of this environment's webhook events as they are recorded, used by
         *     `kleora webhooks forward`.
         *
         *     Each message is the same envelope a delivery carries, with the event id as the SSE `id`; a
         *     comment is sent every fifteen seconds to keep the connection alive. `event_types` is repeatable
         *     and narrows the stream; without it, every event type is included.
         *
         *     To resume without losing events, pass the last event received as `after=<event id>` or in the
         *     `Last-Event-ID` header; either `evt_…` or the bare UUID is accepted. An id this environment does
         *     not hold, for example one past the retention window, is `400 invalid-cursor`.
         *
         *     Unlike the rest of this API, the response is a stream rather than JSON, so generated clients
         *     cannot consume it. Requires `webhooks:read`. The number of concurrent streams per credential is
         *     limited (`429 too-many-streams`), and a stream closes after a maximum lifetime, after which the
         *     client reconnects with its last event id. Starting and stopping a stream is audited.
         */
        get: operations["stream_webhook_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-events/{webhook_event_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A webhook event, with every delivery attempt
         * @description The event's envelope and every delivery attempt, to every endpoint, newest first.
         *
         *     `outcome`, `succeeded_endpoints` and `total_endpoints` summarise every delivery of the event, as
         *     in the list. `payload.data` is `{}` for an event about a user who has since been erased; the
         *     envelope and delivery outcomes are kept.
         */
        get: operations["read_webhook_event"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/environments/{environment_id}/webhook-events/{webhook_event_id}/replay": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Replay a webhook event to one of its endpoints
         * @description Deliver the event's original payload again, unchanged, to `endpoint_id`.
         *
         *     The same event id is sent, so a consumer's deduplication still works. Answers `202`: the
         *     delivery is scheduled. Audited as `webhook_event.replayed`. `409 webhook-endpoint-disabled` when
         *     the endpoint is disabled.
         */
        post: operations["replay_webhook_event_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The calling principal
         * @description Who the credential belongs to, what it may do, and where it may do it.
         *
         *     Available to every kind of credential, and one of the two operations (with `GET /account`) still
         *     available while the Account is suspended.
         */
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/device-authorizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The caller's own device authorizations
         * @description Every device or agent you have authorized, in the same shape as `GET
         *     .../users/{user_id}/device-authorizations`.
         */
        get: operations["list_my_device_authorizations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/device-authorizations/{authorization_id}": {
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
         * Revoke one of the caller's own device authorizations
         * @description Revoke one of your own device authorizations, as the administrative operation does.
         *     Idempotent.
         *
         *     Available whatever the Account's billing state. Audited with the reason `logout`.
         */
        delete: operations["delete_my_device_authorization"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/mfa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The caller's own MFA factors
         * @description Every MFA factor of yours, confirmed or not, in the same shape as `GET
         *     .../users/{user_id}/mfa`. Secrets and recovery code hashes are never returned.
         */
        get: operations["list_my_mfa_factors"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/mfa/recovery/regenerate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Replace the caller's own recovery-code set
         * @description `404` when the caller holds no confirmed factor to back — recovery
         *     codes back one up, and there is nothing here to regenerate a set for.
         */
        post: operations["regenerate_my_recovery_codes"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/mfa/totp/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm the caller's own TOTP enrolment
         * @description Verify `code`, confirm the pending TOTP factor, and return the ten recovery codes, once.
         */
        post: operations["confirm_my_totp_enrollment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/mfa/totp/enroll": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Begin the caller's own TOTP enrolment
         * @description Start enrolling a TOTP factor for yourself. Requires a recent re-authentication.
         *
         *     `409 mfa-already-enrolled` when you already hold a confirmed TOTP factor.
         */
        post: operations["start_my_totp_enrollment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/mfa/{factor_id}": {
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
         * Remove one of the caller's own factors
         * @description Remove one of your own MFA factors or passkeys, under the same rules as self-service.
         *
         *     Removing a TOTP factor also removes the recovery codes.
         */
        delete: operations["delete_my_mfa_factor"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/passkeys/register/finish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirm registering one of the caller's own passkeys
         * @description Finish registering a passkey for yourself.
         *
         *     Like `start`, refused on a plan without passkeys, even when the registration was started before
         *     a downgrade.
         */
        post: operations["finish_my_passkey_registration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/passkeys/register/start": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Begin registering one of the caller's own passkeys
         * @description Start registering a passkey for yourself.
         *
         *     `402` on a plan without passkeys. TOTP and recovery codes remain available on every plan and in
         *     every billing state.
         */
        post: operations["start_my_passkey_registration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Change the caller's own password
         * @description Change your own password. Requires the current password, and a recent re-authentication.
         *
         *     A wrong `current_password` is `401 invalid-credentials`, the same answer a blocked or locked
         *     account gets. A new password the environment's policy refuses is `422 password-policy` or `422
         *     password-breached`.
         *
         *     Every other session of yours is revoked; this one keeps working.
         */
        post: operations["change_my_password"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * The calling console user's own settings
         * @description Every `user_editable` and `user_visible` setting, with your value or the default.
         *
         *     Not paginated: an environment has at most 50 setting definitions.
         */
        get: operations["list_my_settings"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/me/settings/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Write one of the calling console user's own settings
         * @description Write your value for one setting, validated against its definition.
         *
         *     `404` for hidden and unknown keys alike. `403 setting-not-editable` for `user_visible` settings,
         *     which you can read but not write. `422 validation-error` when the value does not satisfy the
         *     constraints.
         */
        put: operations["put_my_setting"];
        post?: never;
        /**
         * Clear one of the calling console user's own settings
         * @description Remove your stored value, so the default applies again.
         *
         *     `404` for hidden and unknown keys alike, and `403` for `user_visible` settings. Idempotent:
         *     removing a value that was never stored is also `204`.
         */
        delete: operations["delete_my_setting"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/permissions/{permission_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** A permission */
        get: operations["read_permission"];
        put?: never;
        post?: never;
        /**
         * Delete a permission
         * @description Remove it from every Role that carried it. Reserved ones are 409 `system-permission`.
         */
        delete: operations["delete_permission_operation"];
        options?: never;
        head?: never;
        /**
         * Describe a permission
         * @description Update a permission's description. This is also the one change allowed on a reserved
         *     permission.
         */
        patch: operations["patch_permission"];
        trace?: never;
    };
    "/api/v1/roles/{role_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A role
         * @description One role.
         *
         *     A tenant member may read its own tenant's roles here and nothing else: an app-scoped role or
         *     another tenant's role is `403 insufficient-scope`. Use `GET /tenants/{tenant_id}/roles` to list
         *     the app-scoped roles a tenant member can assign.
         */
        get: operations["read_role"];
        put?: never;
        post?: never;
        /**
         * Delete a role
         * @description Delete a role, removing it from every member and open invitation that carries it.
         *
         *     The system roles `owner`, `admin`, `developer`, `billing` and `viewer` cannot be deleted: `409
         *     system-role`.
         */
        delete: operations["delete_role_operation"];
        options?: never;
        head?: never;
        /**
         * Change a role
         * @description Update a role's `name` and `description`. The slug cannot be changed.
         *
         *     Renaming a system role is `409 system-role`; changing its description is allowed.
         */
        patch: operations["patch_role"];
        trace?: never;
    };
    "/api/v1/roles/{role_id}/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Replace a role's permissions
         * @description Replace the role's whole permission set, atomically. Audited as `role.permissions_replaced`
         *     with the old and new sets.
         *
         *     Members holding the role get the new permissions in the next token issued for them: within
         *     `access_token_ttl` for a live access token, and at once on the next refresh. To apply a change
         *     immediately, revoke the members' sessions.
         */
        put: operations["put_role_permissions"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A tenant
         * @description The tenant, including the default one, which is addressable by id in both modes.
         */
        get: operations["read_tenant"];
        put?: never;
        post?: never;
        /**
         * Delete a tenant
         * @description Delete a tenant, its members, its own roles and its invitations, in one transaction.
         *
         *     Sessions bound to the tenant are revoked. The environment's default tenant cannot be deleted
         *     (`409 default-tenant`), nor can a tenant linked to an Account (`409 account-tenant`).
         */
        delete: operations["delete_tenant_operation"];
        options?: never;
        head?: never;
        /**
         * Change a tenant
         * @description Update a tenant's `name`, `slug` and `metadata`. `metadata` is replaced whole.
         *
         *     The `slug` of the default tenant cannot change (`422` with `code: "immutable"`), and neither can
         *     the `slug` of a tenant linked to an Account.
         */
        patch: operations["patch_tenant"];
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/audit-events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * A tenant's audit events
         * @description Every audit event recorded against this tenant, newest first.
         *
         *     Available to the tenant's own members. Another tenant's id is `404`.
         */
        get: operations["list_tenant_audit_events"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List invitations
         * @description The tenant's invitations in one state, newest first.
         *
         *     `status` defaults to `open`: the invitations still waiting for an answer. `q` is a
         *     case-insensitive substring of the invited email. A cursor is only valid with the filters it was
         *     issued for.
         */
        get: operations["list_invitations"];
        put?: never;
        /**
         * Invite an address
         * @description Create an invitation and email the link. The token is not returned.
         *
         *     The roles are validated as `POST /tenants/{tenant_id}/members` validates them: a tenant member
         *     may only offer roles within its own permissions, and `owner` in an Account's tenant may only be
         *     offered by a member who holds it.
         *
         *     With an `Idempotency-Key`, a repeated request returns the stored `201` and sends no second
         *     email.
         */
        post: operations["create_invitation_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/invitations/{invitation_id}": {
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
         * Revoke an invitation
         * @description Revoke an invitation, so its link stops working. Idempotent.
         *
         *     The invitation is kept, and listed under `?status=revoked`.
         */
        delete: operations["revoke_invitation_operation"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/invitations/{invitation_id}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Re-send an invitation
         * @description Issue a new invitation link, valid for seven days, and email it.
         *
         *     The previous link stops working immediately. Limited to one resend a minute and five an hour per
         *     invitation.
         */
        post: operations["resend_invitation_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List members
         * @description The tenant's members, newest first, with the user and the roles included.
         *
         *     `q` is a case-insensitive substring of the user's email or name, and `role` is a role slug. A
         *     cursor is only valid with the filters it was issued for.
         */
        get: operations["list_members"];
        put?: never;
        /**
         * Add a member
         * @description Add an existing user to the tenant, with the roles the body names.
         *
         *     Give exactly one of `user_id` and `email`; both or neither is `422`. The email is normalised
         *     before lookup, so its case does not matter. A user who is not in this environment, or has been
         *     erased, is `404 user-not-found`; this operation sends no invitation.
         */
        post: operations["add_member_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/members/{member_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** A member */
        get: operations["read_member"];
        put?: never;
        post?: never;
        /**
         * Remove a member
         * @description Remove the row and revoke that user's sessions bound to this tenant.
         *
         *     The one write a `tenant_member` may make against its own Member row: a
         *     person may always leave.
         */
        delete: operations["remove_member_operation"];
        options?: never;
        head?: never;
        /**
         * Change a member
         * @description Replace a member's roles, change their status, or both.
         *
         *     `roles` replaces the whole set and is audited as `member.roles_changed`; a status change is
         *     audited as `member.suspended` or `member.unsuspended`. `409 last-owner` when the change would
         *     leave an Account's tenant without an active owner.
         */
        patch: operations["patch_member"];
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Roles assignable in a tenant
         * @description Every role assignable in this tenant: the environment's app-scoped roles and the tenant's
         *     own.
         *
         *     This is how a tenant member sees app-scoped roles. `q` is a case-insensitive substring of the
         *     slug or the name.
         */
        get: operations["list_tenant_roles"];
        put?: never;
        /**
         * Create a tenant-scoped role
         * @description Create a role that this tenant defines for itself, assignable only to its own members.
         *
         *     The role is deleted with the tenant, and cannot be assigned in another tenant (`422
         *     role-not-assignable` there). A tenant member may create one, but only with permissions it holds
         *     itself: `403 privilege-escalation` otherwise.
         *
         *     A slug used by an app-scoped role of the environment is `409 role-slug-conflict`. Another tenant
         *     of the same environment may use the same slug for its own role.
         */
        post: operations["create_tenant_role_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/suspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Suspend a tenant
         * @description Stop the tenant from being selected at sign-in. Idempotent.
         *
         *     Nothing is revoked: access tokens already issued remain valid until they expire, and the next
         *     token issued for a session bound to this tenant carries no `tenant` claim. A tenant linked to an
         *     Account cannot be suspended: `409 account-tenant`.
         */
        post: operations["suspend_tenant_operation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/tenants/{tenant_id}/unsuspend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unsuspend a tenant
         * @description Put the tenant back in the candidate set. Idempotent.
         */
        post: operations["unsuspend_tenant_operation"];
        delete?: never;
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
         * AccountAuditFilters
         * @description The filters of the Account's audit event list, which also takes `environment_id`.
         *
         *     Without `environment_id`, every event of the Account is listed, account-level events included.
         */
        AccountAuditFilters: {
            /** Action */
            action?: string[] | null;
            /** Actor Id */
            actor_id?: string | null;
            /** Environment Id */
            environment_id?: string | null;
            /**
             * Format
             * @default json
             * @enum {string}
             */
            format: "json" | "ndjson";
            /** From */
            from?: string | null;
            /** Target Id */
            target_id?: string | null;
            /** Tenant Id */
            tenant_id?: string | null;
            /** To */
            to?: string | null;
        };
        /**
         * AccountIn
         * @description The body of `POST /api/v1/accounts`.
         *
         *     `slug` is optional and derived from `name` when absent or `null`.
         */
        AccountIn: {
            /** Name */
            name: string;
            /** Slug */
            slug?: string | null;
        };
        /**
         * AccountOut
         * @description An Account as `POST /accounts` reports it.
         */
        AccountOut: {
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
            /** Name */
            name: string;
            /** Plan */
            plan: string;
            /** Slug */
            slug: string;
            /** Status */
            status: string;
            /** Tenant Id */
            tenant_id: string | null;
        };
        /**
         * AccountPatch
         * @description The body of `PATCH /api/v1/account`.
         *
         *     `slug` cannot be changed: sending it is refused as immutable. `plan`, `status` and `tenant_id`
         *     are not fields of this resource and are refused as unknown.
         */
        AccountPatch: {
            /** Name */
            name?: string;
        };
        /**
         * AccountRead
         * @description An Account as `GET`/`PATCH /account` report it.
         */
        AccountRead: {
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
            /** Name */
            name: string;
            /** Plan */
            plan: string;
            /** Slug */
            slug: string;
            /** Status */
            status: string;
            /** Tenant Id */
            tenant_id: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * ApiKeyCreated
         * @description The `201` of creating an API key, and the `200` of rotating one: the key's details, plus the
         *     full key, once.
         *
         *     These are the only responses that ever include the key.
         */
        ApiKeyCreated: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by: string | null;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Expires At */
            expires_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Key */
            key: string;
            /** Last Used At */
            last_used_at: string | null;
            /** Name */
            name: string;
            /** Prefix */
            prefix: string;
            /** Revoked At */
            revoked_at: string | null;
            /** Scopes */
            scopes: string[];
            /**
             * Status
             * @enum {string}
             */
            status: "active" | "expired" | "revoked";
        };
        /**
         * ApiKeyIn
         * @description The body of `POST /api/v1/environments/{environment_id}/api-keys`.
         *
         *     `prefix`, `key`, `key_hash`, `status`, `environment_id` and `created_by` are refused as unknown
         *     fields. The prefix follows the environment's kind, so a `kl_test_` key can never be used in
         *     production. A scope that is not allowed for an API key is `422 invalid-scope`.
         */
        ApiKeyIn: {
            /** Expires At */
            expires_at?: string | null;
            /** Name */
            name: string;
            /** Scopes */
            scopes: string[];
        };
        /**
         * ApiKeyList
         * @description `GET …/api-keys`. A named schema, so a generated client has a type to name.
         */
        ApiKeyList: {
            /** Items */
            items: components["schemas"]["ApiKeyOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * ApiKeyOut
         * @description An API key.
         *
         *     The key itself is never returned after creation. `prefix` identifies the key, for example in
         *     logs. `status` is computed from `revoked_at` and `expires_at`.
         */
        ApiKeyOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Created By */
            created_by: string | null;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Expires At */
            expires_at: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Used At */
            last_used_at: string | null;
            /** Name */
            name: string;
            /** Prefix */
            prefix: string;
            /** Revoked At */
            revoked_at: string | null;
            /** Scopes */
            scopes: string[];
            /**
             * Status
             * @enum {string}
             */
            status: "active" | "expired" | "revoked";
        };
        /**
         * AppEnvironment
         * @description One of an App's two environments, as embedded in the App.
         *
         *     The environment's settings are at `GET /environments/{environment_id}`.
         */
        AppEnvironment: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Issuer */
            issuer: string;
            /** Kind */
            kind: string;
        };
        /**
         * AppIn
         * @description The body of `POST /api/v1/apps`.
         *
         *     `slug` is optional and derived from `name` when absent or `null`.
         */
        AppIn: {
            /** Name */
            name: string;
            /** Slug */
            slug?: string | null;
        };
        /**
         * AppList
         * @description `GET /apps`. A named schema, so a generated client has a type to name.
         */
        AppList: {
            /** Items */
            items: components["schemas"]["AppOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * AppMauOut
         * @description One App: the plan that applies to it, and its usage this period.
         *
         *     `mau` is the sum over the App's production environments, which is what a `pro` allowance is
         *     measured against. `plan` is the plan actually applied, so a `free` App of a `scale` Account
         *     reads `scale`.
         */
        AppMauOut: {
            /**
             * App Id
             * Format: uuid
             */
            app_id: string;
            /** Environments */
            environments: components["schemas"]["EnvironmentMauOut"][];
            /** Mau */
            mau: number;
            /** Plan */
            plan: string;
            /** Slug */
            slug: string;
            /** Tenant Limit */
            tenant_limit: number;
            /** Tenants */
            tenants: number;
        };
        /**
         * AppOut
         * @description An App.
         */
        AppOut: {
            /**
             * Account Id
             * Format: uuid
             */
            account_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Environments */
            environments: components["schemas"]["AppEnvironment"][];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Platform */
            is_platform: boolean;
            /** Name */
            name: string;
            /** Slug */
            slug: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * AppPatch
         * @description The body of `PATCH /api/v1/apps/{app_id}`: `name`, and nothing else.
         *
         *     `slug` cannot be changed, because both of the App's issuers are derived from it: sending it is
         *     refused as immutable. `is_platform`, `account_id` and `environments` are refused as unknown
         *     fields.
         */
        AppPatch: {
            /** Name */
            name?: string;
        };
        /**
         * AppPlanOut
         * @description One App, the plan that applies to it, and that plan's limits.
         *
         *     The plan is the one actually applied, which can differ from the App's own plan: an Account on
         *     `scale` holds every App to `scale`.
         */
        AppPlanOut: {
            /**
             * App Id
             * Format: uuid
             */
            app_id: string;
            limits: components["schemas"]["PlanLimitsOut"];
            /** Plan */
            plan: string;
            /** Slug */
            slug: string;
        };
        /**
         * AppUsageOut
         * @description One App of the Account, with the `active` User count of both its sides.
         */
        AppUsageOut: {
            /**
             * App Id
             * Format: uuid
             */
            app_id: string;
            production: components["schemas"]["EnvironmentUsage"];
            sandbox: components["schemas"]["EnvironmentUsage"];
            /** Slug */
            slug: string;
        };
        /**
         * AuditActor
         * @description Who acted: `{"kind": ..., "id": ...}`, with `id` `null` for `system` and `anonymous`.
         *
         *     `display` names a `user` actor, as they are now, and is absent for `api_key`, `system` and
         *     `anonymous`.
         */
        AuditActor: {
            display?: components["schemas"]["AuditDisplay"] | null;
            /** Id */
            id: string | null;
            /** Kind */
            kind: string;
        };
        /**
         * AuditDisplay
         * @description Who or what an `actor` or `target` id names, as it is now rather than when the event was
         *     recorded.
         *
         *     A name, the email, and the avatar. Fields appear only where they apply: a tenant has no `email`,
         *     `avatar_color` or `picture_url`, and when the id no longer resolves (for example a deleted
         *     tenant) only `removed` appears. Fields that do not apply are absent, not `null`.
         */
        AuditDisplay: {
            /** Avatar Color */
            avatar_color?: string | null;
            /** Email */
            email?: string | null;
            /** Name */
            name?: string | null;
            /** Picture Url */
            picture_url?: string | null;
            /** Removed */
            removed?: boolean | null;
        };
        /**
         * AuditEventList
         * @description `GET …/audit-events`, ordered `occurred_at desc, id desc`.
         */
        AuditEventList: {
            /** Items */
            items: components["schemas"]["AuditEventOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * AuditEventOut
         * @description One audit event.
         *
         *     `environment_id` and `tenant_id` may be `null`: an account-level event has no environment, and
         *     deleting an App clears the environment of the events recorded inside it, while the events
         *     themselves are kept.
         */
        AuditEventOut: {
            /**
             * Account Id
             * Format: uuid
             */
            account_id: string;
            /** Action */
            action: string;
            actor: components["schemas"]["AuditActor"];
            /** Data */
            data: {
                [key: string]: unknown;
            };
            /** Environment Id */
            environment_id: string | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Ip */
            ip: string | null;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            target: components["schemas"]["AuditTarget"] | null;
            /** Tenant Id */
            tenant_id: string | null;
            /** User Agent */
            user_agent: string | null;
        };
        /**
         * AuditFilters
         * @description The filters every audit event list takes.
         *
         *     `from` is inclusive and `to` exclusive, on `occurred_at`. Both must carry a UTC offset; a
         *     timestamp without one is `422 validation-error` naming the field.
         */
        AuditFilters: {
            /** Action */
            action?: string[] | null;
            /** Actor Id */
            actor_id?: string | null;
            /**
             * Format
             * @default json
             * @enum {string}
             */
            format: "json" | "ndjson";
            /** From */
            from?: string | null;
            /** Target Id */
            target_id?: string | null;
            /** To */
            to?: string | null;
        };
        /**
         * AuditTarget
         * @description What was acted on: the kind of resource and its id.
         *
         *     `target` is `null` when the action had no target. `display` names a `user` or `tenant` target,
         *     as `AuditActor`'s does, and is absent for every other kind.
         */
        AuditTarget: {
            display?: components["schemas"]["AuditDisplay"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Kind */
            kind: string;
        };
        /**
         * BillingOut
         * @description The body of `GET /api/v1/account/billing`.
         *
         *     Plan, limits, usage, status and period end. `subscription` is `null` for an Account that has
         *     never subscribed. `pro_apps` is the number of Apps the subscription's `quantity` should equal;
         *     they are reported separately so that any disagreement is visible.
         */
        BillingOut: {
            /** Account Plan */
            account_plan: string;
            /** Apps */
            apps: components["schemas"]["AppPlanOut"][];
            /** Pro Apps */
            pro_apps: number;
            subscription: components["schemas"]["SubscriptionOut"] | null;
            usage: components["schemas"]["UsageOut"];
        };
        /**
         * BillingSessionOut
         * @description A page hosted by the payment provider to send the customer to.
         *
         *     `url` grants access to the customer's payment details. It is returned only to the caller and is
         *     not recorded anywhere.
         */
        BillingSessionOut: {
            /** Expires At */
            expires_at: string | null;
            /** Url */
            url: string;
        };
        /**
         * BillingUsageOut
         * @description The body of `GET /api/v1/account/billing/usage`: monthly active users and App counts for the
         *     current period.
         *
         *     The period is the half-open window `[period_start, period_end)`, as RFC 3339 UTC timestamps, so
         *     the figures can be reconciled exactly.
         *
         *     `mau` is the Account total: the sum of its Apps' figures. A person active in two Apps counts in
         *     each, because users belong to an environment.
         */
        BillingUsageOut: {
            /** Allowances */
            allowances: components["schemas"]["MauAllowanceOut"][];
            /** Apps */
            apps: components["schemas"]["AppMauOut"][];
            /** Apps Used */
            apps_used: number;
            /**
             * As Of
             * Format: date-time
             */
            as_of: string;
            /** Mau */
            mau: number;
            /**
             * Period End
             * Format: date-time
             */
            period_end: string;
            /**
             * Period Start
             * Format: date-time
             */
            period_start: string;
            /** Tenants */
            tenants: number;
        };
        /**
         * BlockedBy
         * @description Who blocked the user: `{"kind": ..., "id": ...}`, and a display name.
         *
         *     `display` is `null`, not absent, when there is nobody to name: when an API key blocked the user,
         *     or the id no longer resolves.
         */
        BlockedBy: {
            display?: components["schemas"]["BlockedByDisplay"] | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "user" | "api_key";
        };
        /**
         * BlockedByDisplay
         * @description The name and email of whoever `blocked_by` names, as they are now.
         *
         *     Resolved when the user is read, so an operator who has since been erased shows as erased.
         */
        BlockedByDisplay: {
            /** Email */
            email: string;
            /** Name */
            name: string;
        };
        /**
         * BrandingBackground
         * @description The page background: one of three `kind`s.
         *
         *     Each `kind` allows only its own members; for example, `angle` on a `solid` background is `422`
         *     naming `background.angle` as an unknown field. `from` is a gradient's starting colour.
         */
        BrandingBackground: {
            /** Angle */
            angle?: number | null;
            /** From */
            from?: string | null;
            /** Image Url */
            image_url?: string | null;
            /** Kind */
            kind: string;
            /** Overlay */
            overlay?: string | null;
            /** Overlay Opacity */
            overlay_opacity?: number | null;
            /** To */
            to?: string | null;
        };
        /**
         * BrandingColors
         * @description The palette: seven required six-digit hex colours, and three optional ones.
         *
         *     `border` is the border colour of controls (inputs, secondary and quiet buttons, the password
         *     strength meter); when `null` or absent, `muted` is used. `on_background` and `success` are also
         *     optional and `null` by default, each falling back to another colour. `GET` always includes all
         *     three.
         */
        BrandingColors: {
            /** Background */
            background: string;
            /** Border */
            border?: string | null;
            /** Error */
            error: string;
            /** Muted */
            muted: string;
            /** On Background */
            on_background?: string | null;
            /** On Primary */
            on_primary: string;
            /** Primary */
            primary: string;
            /** Success */
            success?: string | null;
            /** Surface */
            surface: string;
            /** Text */
            text: string;
        };
        /**
         * BrandingIn
         * @description The body of `PUT /api/v1/environments/{environment_id}/branding` and `POST
         *     .../branding/preview`: the whole branding record.
         *
         *     Partial updates are not offered. A few recently added keys may be left out, and are stored as
         *     their defaults. Unknown keys are `422`.
         */
        BrandingIn: {
            background: components["schemas"]["BrandingBackground"];
            /**
             * Color Scheme
             * @description `light`, `dark` or `auto`; left out, `light`. `auto` follows the reader's `prefers-color-scheme` while the page is open.
             */
            color_scheme?: string;
            colors: components["schemas"]["BrandingColors"];
            /** @description The palette rendered when the page is dark: the same keys and rules as `colors`. Required when `color_scheme` is `dark` or `auto`; kept, not applied, under `light`. */
            colors_dark?: components["schemas"]["BrandingColors"] | null;
            /** @description `null` (the default) renders every page in its standard order. A document selects and orders the blocks of a covered region: v1 covers `/login`'s form region, whose blocks are `subtitle`, `credentials`, `actions` and `passkey`. `credentials`, `actions` and `passkey` appear exactly once and `credentials` comes before `actions`; `subtitle` is the one block that may be left out. */
            composition?: components["schemas"]["Composition"] | null;
            /** Custom Css */
            custom_css: string;
            /** Favicon Url */
            favicon_url: string | null;
            /** Font */
            font: string;
            /**
             * Icons
             * @description `enabled` (default true), `button` (an icon name or null) and `panel_features` (up to three names). Names come from the curated icon set. A non-empty `panel_features` needs a split layout with the brand panel.
             */
            icons?: {
                [key: string]: unknown;
            };
            layout: components["schemas"]["BrandingLayout"];
            links: components["schemas"]["BrandingLinks"];
            /** Logo Url */
            logo_url: string | null;
            /** Radius */
            radius: string;
            /**
             * Sandbox Marker
             * @description `none`, `rail` or `canvas`; left out, `none`. The sandbox's pages carry the console's hatch; a production environment never renders it, whatever this says.
             */
            sandbox_marker?: string;
            /** Show Powered By */
            show_powered_by: boolean;
            /** Texts */
            texts: {
                [key: string]: {
                    [key: string]: string;
                };
            };
        };
        /**
         * BrandingLayout
         * @description The page layout: one of two `kind`s.
         *
         *     Each `kind` allows only its own members; for example, `side` on a `centered` layout is `422`
         *     naming `layout.side` as an unknown field.
         */
        BrandingLayout: {
            /** Form */
            form?: string | null;
            /** Kind */
            kind: string;
            /** Panel */
            panel?: string | null;
            /** Side */
            side?: string | null;
        };
        /**
         * BrandingLinks
         * @description The three footer links. `null` means the link is not rendered.
         */
        BrandingLinks: {
            /** Privacy Url */
            privacy_url?: string | null;
            /** Support Url */
            support_url?: string | null;
            /** Terms Url */
            terms_url?: string | null;
        };
        /**
         * BrandingOut
         * @description The stored branding record, and when it last changed.
         *
         *     `updated_at` lets a client tell whether the copy it holds is the stored one. `background` and
         *     `layout` are returned exactly as stored, as objects carrying only the members their `kind` uses.
         */
        BrandingOut: {
            /** Background */
            background: {
                [key: string]: unknown;
            };
            /** Color Scheme */
            color_scheme: string;
            colors: components["schemas"]["BrandingColors"];
            colors_dark: components["schemas"]["BrandingColors"] | null;
            composition: components["schemas"]["Composition"] | null;
            /** Custom Css */
            custom_css: string;
            /** Favicon Url */
            favicon_url: string | null;
            /** Font */
            font: string;
            /** Icons */
            icons: {
                [key: string]: unknown;
            };
            /** Layout */
            layout: {
                [key: string]: unknown;
            };
            links: components["schemas"]["BrandingLinks"];
            /** Logo Url */
            logo_url: string | null;
            /** Radius */
            radius: string;
            /** Sandbox Marker */
            sandbox_marker: string;
            /** Show Powered By */
            show_powered_by: boolean;
            /** Texts */
            texts: {
                [key: string]: {
                    [key: string]: string;
                };
            };
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * BrandingPreviewOut
         * @description The `201` of `POST .../branding/preview`: where to preview the draft, and until when.
         */
        BrandingPreviewOut: {
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
            /** Preview Url */
            preview_url: string;
        };
        /**
         * CheckoutIn
         * @description The body of `POST /api/v1/account/billing/checkout`.
         *
         *     The plan, the billing interval and the billing country. There is no return URL, currency or
         *     price: the return URL is fixed, and the price and currency follow from the plan and the country.
         */
        CheckoutIn: {
            /**
             * Billing Country
             * @description ISO 3166-1 alpha-2 billing country. Chooses the currency; never a locale.
             */
            billing_country?: string | null;
            /**
             * Interval
             * @default month
             * @enum {string}
             */
            interval: "month" | "year";
            /**
             * Plan
             * @enum {string}
             */
            plan: "pro" | "scale";
        };
        ClientCreated: {
            [key: string]: unknown;
        };
        /**
         * ClientIn
         * @description The body of `POST /api/v1/environments/{environment_id}/clients`.
         *
         *     `client_id`, `client_secret`, `has_secret`, `environment_id` and `is_default` are refused as
         *     unknown fields; a new client is never the default.
         *
         *     Each URI array holds at most 32 entries. Whether each URI and scope is allowed depends on the
         *     environment (for example, `http://localhost` is only allowed in sandbox), and a refusal names
         *     the array index.
         */
        ClientIn: {
            /** Allowed Scopes */
            allowed_scopes?: string[];
            /**
             * Device Grant Enabled
             * @default false
             */
            device_grant_enabled: boolean;
            /** Initiate Login Uri */
            initiate_login_uri?: string | null;
            /**
             * Kind
             * @enum {string}
             */
            kind: "spa" | "web" | "native";
            /** Name */
            name: string;
            /** Post Logout Redirect Uris */
            post_logout_redirect_uris?: string[];
            /** Redirect Uris */
            redirect_uris?: string[];
        };
        /**
         * ClientList
         * @description `GET …/clients`. A named schema, so a generated client has a type to name.
         */
        ClientList: {
            /** Items */
            items: components["schemas"]["ClientOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * ClientOut
         * @description An OAuth client.
         *
         *     The client secret is never returned. `has_secret` says whether the client has one.
         */
        ClientOut: {
            /** Allowed Scopes */
            allowed_scopes: string[];
            /** Client Id */
            client_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Device Grant Enabled */
            device_grant_enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Has Secret */
            has_secret: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Initiate Login Uri */
            initiate_login_uri: string | null;
            /** Is Default */
            is_default: boolean;
            /** Kind */
            kind: string;
            /** Name */
            name: string;
            /** Post Logout Redirect Uris */
            post_logout_redirect_uris: string[];
            /** Redirect Uris */
            redirect_uris: string[];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * ClientPatch
         * @description The body of `PATCH /api/v1/environments/{environment_id}/clients/{client_id}`.
         *
         *     `initiate_login_uri` can be cleared with `null`; the hosted pages then show no link back. The
         *     URI arrays are replaced whole, and `[]` is valid, but `null` is not.
         *
         *     `is_default` can only be set to `true`: `null` is `422 field-not-nullable`, and `false` is `409
         *     client-default`.
         *
         *     `client_id`, `client_secret`, `has_secret` and `environment_id` are refused as unknown fields.
         */
        ClientPatch: {
            /** Allowed Scopes */
            allowed_scopes?: string[];
            /** Device Grant Enabled */
            device_grant_enabled?: boolean;
            /** Initiate Login Uri */
            initiate_login_uri?: string | null;
            /** Is Default */
            is_default?: boolean;
            /**
             * Kind
             * @enum {string}
             */
            kind?: "spa" | "web" | "native";
            /** Name */
            name?: string;
            /** Post Logout Redirect Uris */
            post_logout_redirect_uris?: string[];
            /** Redirect Uris */
            redirect_uris?: string[];
        };
        /**
         * ClientSecretOut
         * @description The `200` of `POST .../rotate-secret`: the client and its new secret.
         */
        ClientSecretOut: {
            /** Allowed Scopes */
            allowed_scopes: string[];
            /** Client Id */
            client_id: string;
            /** Client Secret */
            client_secret: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Device Grant Enabled */
            device_grant_enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Has Secret */
            has_secret: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Initiate Login Uri */
            initiate_login_uri: string | null;
            /** Is Default */
            is_default: boolean;
            /** Kind */
            kind: string;
            /** Name */
            name: string;
            /** Post Logout Redirect Uris */
            post_logout_redirect_uris: string[];
            /** Redirect Uris */
            redirect_uris: string[];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * Composition
         * @description `composition`: which blocks each region of each page shows, and in what order.
         *
         *     `pages` is a map keyed by page name.
         */
        Composition: {
            /** Pages */
            pages: {
                [key: string]: {
                    [key: string]: components["schemas"]["CompositionBlock"][];
                };
            };
            /** Version */
            version: number;
        };
        /**
         * CompositionBlock
         * @description One block of a composed region: the name of a block the page renders, and nothing else. Any
         *     other member is `422`.
         */
        CompositionBlock: {
            /** Block */
            block: string;
        };
        /**
         * DeviceAuthorizationList
         * @description `GET …/users/{user_id}/device-authorizations`, newest first.
         */
        DeviceAuthorizationList: {
            /** Items */
            items: components["schemas"]["DeviceAuthorizationOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * DeviceAuthorizationOut
         * @description One device authorization a user approved.
         *
         *     `client_name` is the client's configured name, and `client_id` its id. `last_used_at` is when a
         *     token was last refreshed under it; an authorization expires after 90 days without use. `ip` and
         *     `user_agent` are those of the browser that approved it.
         */
        DeviceAuthorizationOut: {
            /** Approved At */
            approved_at: string | null;
            /** Client Id */
            client_id: string;
            /** Client Name */
            client_name: string;
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
            /** Ip */
            ip: string;
            /** Last Used At */
            last_used_at: string | null;
            /** Scope */
            scope: string;
            /** Session Id */
            session_id: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "active" | "expired" | "revoked";
            /** User Agent */
            user_agent: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * EmailKindVariables
         * @description The variables one kind of email may use.
         */
        EmailKindVariables: {
            /**
             * Kind
             * @enum {string}
             */
            kind: "verify_email" | "reset_password" | "invitation" | "mfa_enrolled" | "mfa_removed" | "password_changed" | "email_change_requested" | "email_change_completed" | "account_deletion_requested" | "account_deletion_cancelled" | "account_deleted";
            /** Variables */
            variables: components["schemas"]["EmailVariable"][];
        };
        /**
         * EmailTemplateIn
         * @description The body of `PUT .../email-templates/{kind}/{locale}`: the whole template. Every field is
         *     required.
         */
        EmailTemplateIn: {
            /** Body Html */
            body_html: string;
            /** Body Text */
            body_text: string;
            /** Subject */
            subject: string;
        };
        /**
         * EmailTemplateList
         * @description The body of `GET .../email-templates`: every template of the environment.
         *
         *     The list has a fixed size, so `next_cursor` is always `null`, and `limit` and `cursor` are
         *     accepted and ignored.
         */
        EmailTemplateList: {
            /** Items */
            items: components["schemas"]["EmailTemplateOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * EmailTemplateOut
         * @description One email template, for one kind and locale, as source rather than rendered.
         *
         *     `is_default` is `true` while the template is identical to the shipped default, and `false` from
         *     the first edit.
         */
        EmailTemplateOut: {
            /** Body Html */
            body_html: string;
            /** Body Text */
            body_text: string;
            /** Is Default */
            is_default: boolean;
            /**
             * Kind
             * @enum {string}
             */
            kind: "verify_email" | "reset_password" | "invitation" | "mfa_enrolled" | "mfa_removed" | "password_changed" | "email_change_requested" | "email_change_completed" | "account_deletion_requested" | "account_deletion_cancelled" | "account_deleted";
            /**
             * Locale
             * @enum {string}
             */
            locale: "en" | "pl";
            /** Subject */
            subject: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * EmailTemplateRenderIn
         * @description The optional body of `POST .../email-templates/{kind}/{locale}/render`.
         *
         *     Every field is optional; each one present replaces that part of the stored template for this
         *     render only, so a draft can be previewed without saving it. With no body, the stored template is
         *     rendered.
         *
         *     `samples` is `all`, or `without_optional` to render with the optional variables empty.
         */
        EmailTemplateRenderIn: {
            /** Body Html */
            body_html?: string | null;
            /** Body Text */
            body_text?: string | null;
            /**
             * Samples
             * @default all
             * @enum {string}
             */
            samples: "all" | "without_optional";
            /** Subject */
            subject?: string | null;
        };
        /**
         * EmailTemplateRendered
         * @description A rendered message: its subject, text and HTML.
         */
        EmailTemplateRendered: {
            /** Html */
            html: string;
            /** Subject */
            subject: string;
            /** Text */
            text: string;
        };
        /**
         * EmailVariable
         * @description One variable an email template may use.
         *
         *     `sample` is the value a preview substitutes. `optional` marks the variables that are empty when
         *     the setting behind them is unset; a template should guard them with `{% if %}`.
         */
        EmailVariable: {
            /** Description */
            description: string;
            /** Name */
            name: string;
            /** Optional */
            optional: boolean;
            /** Sample */
            sample: string;
        };
        /**
         * EmailVariables
         * @description The body of `GET .../email-templates/variables`: the variables each kind of email may use.
         *
         *     Samples use the environment's own App name and issuer.
         */
        EmailVariables: {
            /** Kinds */
            kinds: components["schemas"]["EmailKindVariables"][];
        };
        /**
         * EnvironmentAuditFilters
         * @description The environment endpoint's filters: the shared set plus `tenant_id`.
         */
        EnvironmentAuditFilters: {
            /** Action */
            action?: string[] | null;
            /** Actor Id */
            actor_id?: string | null;
            /**
             * Format
             * @default json
             * @enum {string}
             */
            format: "json" | "ndjson";
            /** From */
            from?: string | null;
            /** Target Id */
            target_id?: string | null;
            /** Tenant Id */
            tenant_id?: string | null;
            /** To */
            to?: string | null;
        };
        /**
         * EnvironmentList
         * @description The body of `GET /apps/{app_id}/environments`: the App's two environments.
         *
         *     Not paginated, since an App always has exactly two environments: `next_cursor` is always `null`.
         */
        EnvironmentList: {
            /** Items */
            items: components["schemas"]["AppEnvironment"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * EnvironmentMauOut
         * @description One environment's figures for the period.
         *
         *     `mau` is always zero for a sandbox environment: sandbox usage is never counted. `tenants` is the
         *     count the tenant limit is applied to, per environment.
         */
        EnvironmentMauOut: {
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Kind */
            kind: string;
            /** Mau */
            mau: number;
            /** Tenants */
            tenants: number;
        };
        /**
         * EnvironmentOut
         * @description An Environment as `GET`/`PATCH /environments/{environment_id}` report it.
         */
        EnvironmentOut: {
            /** Access Token Ttl */
            access_token_ttl: number;
            /** Allow Browser Locale */
            allow_browser_locale: boolean;
            /** Api Audience */
            api_audience: string | null;
            /**
             * App Id
             * Format: uuid
             */
            app_id: string;
            /** Backfill Status */
            backfill_status: ("pending" | "running" | "failed") | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Default Locale */
            default_locale: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Issuer */
            issuer: string;
            /** Kind */
            kind: string;
            /** Mfa Policy */
            mfa_policy: string;
            /** No Tenant Behaviour */
            no_tenant_behaviour: string;
            /** Password Breach Check */
            password_breach_check: boolean;
            /** Password Min Length */
            password_min_length: number;
            /** Refresh Token Ttl */
            refresh_token_ttl: number;
            /** Self Deletion */
            self_deletion: boolean;
            /** Self Registration */
            self_registration: boolean;
            /** Session Idle Ttl */
            session_idle_ttl: number;
            /** Session Ttl */
            session_ttl: number;
            /** Tenant Creator Role */
            tenant_creator_role: string | null;
            /** Tenant Mode */
            tenant_mode: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * EnvironmentPatch
         * @description The body of `PATCH /api/v1/environments/{environment_id}`: the environment's settings.
         *
         *     Out-of-range values are `422` naming the field. `issuer`, `kind` and `backfill_status` cannot be
         *     changed and are refused as immutable.
         */
        EnvironmentPatch: {
            /** Access Token Ttl */
            access_token_ttl?: number;
            /** Allow Browser Locale */
            allow_browser_locale?: boolean;
            /** Api Audience */
            api_audience?: string | null;
            /**
             * Default Locale
             * @enum {string}
             */
            default_locale?: "en" | "pl";
            /**
             * Mfa Policy
             * @enum {string}
             */
            mfa_policy?: "off" | "optional" | "required";
            /**
             * No Tenant Behaviour
             * @enum {string}
             */
            no_tenant_behaviour?: "error" | "create";
            /** Password Breach Check */
            password_breach_check?: boolean;
            /** Password Min Length */
            password_min_length?: number;
            /** Refresh Token Ttl */
            refresh_token_ttl?: number;
            /** Self Deletion */
            self_deletion?: boolean;
            /** Self Registration */
            self_registration?: boolean;
            /** Session Idle Ttl */
            session_idle_ttl?: number;
            /** Session Ttl */
            session_ttl?: number;
            /** Tenant Creator Role */
            tenant_creator_role?: string | null;
            /**
             * Tenant Mode
             * @enum {string}
             */
            tenant_mode?: "single" | "multi";
        };
        /**
         * EnvironmentStats
         * @description The body of `GET /apps/{app_id}/environments/{environment_id}/stats`.
         *
         *     The figures are cached for 60 seconds; `computed_at` is when they were computed, not when they
         *     were requested.
         */
        EnvironmentStats: {
            /**
             * Computed At
             * Format: date-time
             */
            computed_at: string;
            /** Series */
            series: components["schemas"]["EnvironmentStatsDay"][];
            setup: components["schemas"]["EnvironmentStatsSetup"];
            totals: components["schemas"]["EnvironmentStatsTotals"];
        };
        /**
         * EnvironmentStatsDay
         * @description One UTC day of the range.
         *
         *     Every day appears, zeroed when nothing happened on it: a chart drawn from a
         *     sparse series would put Monday's bar where Wednesday's belongs.
         */
        EnvironmentStatsDay: {
            /**
             * Date
             * Format: date
             */
            date: string;
            /** Logins Failed */
            logins_failed: number;
            /** Logins Succeeded */
            logins_succeeded: number;
            /** Users Created */
            users_created: number;
        };
        /**
         * EnvironmentStatsSetup
         * @description The four "is this App set up" facts behind the overview's checklist.
         *
         *     Booleans rather than counts: the checklist asks whether a thing has ever
         *     happened, and it disappears when all four are true.
         */
        EnvironmentStatsSetup: {
            /** Callback Registered */
            callback_registered: boolean;
            /** Custom Branding */
            custom_branding: boolean;
            /** First Login */
            first_login: boolean;
            /** First User Created */
            first_user_created: boolean;
        };
        /**
         * EnvironmentStatsTotals
         * @description What the environment holds now: current counts, not counts over the requested range.
         *
         *     `users` excludes erased users, `api_keys` counts active keys, and `active_sessions` counts live
         *     sessions.
         */
        EnvironmentStatsTotals: {
            /** Active Sessions */
            active_sessions: number;
            /** Api Keys */
            api_keys: number;
            /** Clients */
            clients: number;
            /** Users */
            users: number;
        };
        /**
         * EnvironmentUsage
         * @description One environment's contribution to an App's row.
         */
        EnvironmentUsage: {
            /** Users */
            users: number;
        };
        /**
         * ExportAuditEvent
         * @description One audit event in a user export, in the same shape as the audit event API.
         */
        ExportAuditEvent: {
            /** Action */
            action: string;
            /** Actor Id */
            actor_id: string | null;
            /** Actor Kind */
            actor_kind: string;
            /** Data */
            data: {
                [key: string]: unknown;
            };
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Ip */
            ip: string | null;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /** Target Id */
            target_id: string | null;
            /** Target Kind */
            target_kind: string | null;
        };
        /**
         * ExportFactor
         * @description One MFA factor in the export: what kind it is and when it was used.
         */
        ExportFactor: {
            /** Confirmed At */
            confirmed_at: string | null;
            /** Kind */
            kind: string;
            /** Last Used At */
            last_used_at: string | null;
        };
        /**
         * ExportIdentity
         * @description One identity in a user export, without any secret.
         *
         *     Includes what the provider reported about the user and when the identity was linked and last
         *     used. For a `password` identity these provider fields are empty.
         */
        ExportIdentity: {
            /** Last Login At */
            last_login_at: string | null;
            /** Linked At */
            linked_at: string | null;
            /** Linked Via */
            linked_via: string;
            /** Provider */
            provider: string;
            /** Provider Email */
            provider_email: string;
            /** Provider Email Verified */
            provider_email_verified: boolean;
            /** Provider Name */
            provider_name: string;
            /** Provider Picture Url */
            provider_picture_url: string | null;
            /** Provider Subject */
            provider_subject: string | null;
            /**
             * Secret Updated At
             * Format: date-time
             */
            secret_updated_at: string;
        };
        /**
         * ExportMembership
         * @description One membership in the export (tenant identity, role slugs, status).
         */
        ExportMembership: {
            /** Roles */
            roles: string[];
            /** Status */
            status: string;
            /**
             * Tenant Id
             * Format: uuid
             */
            tenant_id: string;
            /** Tenant Name */
            tenant_name: string;
            /** Tenant Slug */
            tenant_slug: string;
        };
        /**
         * ExportSession
         * @description One Session in the export, with the clients it minted tokens for.
         */
        ExportSession: {
            /** Client Ids */
            client_ids: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
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
            ip: string;
            /**
             * Last Seen At
             * Format: date-time
             */
            last_seen_at: string;
            /** Revoked At */
            revoked_at: string | null;
            /** User Agent */
            user_agent: string;
        };
        /**
         * IdentityIn
         * @description The body of `POST .../users/{user_id}/identities`: an external provider account to link, by
         *     subject.
         *
         *     `provider_subject` is the provider's own permanent id for the person (Google's `sub`, GitHub's
         *     numeric `id`, Microsoft's `oid`, Facebook's app-scoped `id`), never an email address. Any other
         *     field, such as a provider email, token or secret, is refused as unknown.
         */
        IdentityIn: {
            /**
             * Provider
             * @enum {string}
             */
            provider: "google" | "microsoft" | "github" | "facebook";
            /** Provider Subject */
            provider_subject: string;
        };
        /**
         * IdentityList
         * @description The body of `GET .../users/{user_id}/identities`, oldest first.
         *
         *     Not paginated, since a user holds at most one identity per provider kind: `next_cursor` is
         *     always `null`.
         */
        IdentityList: {
            /** Items */
            items: components["schemas"]["IdentityOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * IdentityOut
         * @description One external provider identity of a user, and the `id` to remove it by.
         *
         *     `provider_email` and `provider_email_verified` are what the provider reported, for display only;
         *     they are empty and `false` for an identity an administrator linked. `provider` is never
         *     `password`: a user's password is reported by `UserOut.has_password`.
         */
        IdentityOut: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Login At */
            last_login_at: string | null;
            /** Linked At */
            linked_at: string | null;
            /** Linked Via */
            linked_via: string;
            /**
             * Provider
             * @enum {string}
             */
            provider: "google" | "microsoft" | "github" | "facebook";
            /** Provider Email */
            provider_email: string;
            /** Provider Email Verified */
            provider_email_verified: boolean;
            /** Provider Subject */
            provider_subject: string | null;
        };
        /**
         * IdentityProviderIn
         * @description The body of `PUT /environments/{environment_id}/identity-providers/{kind}`: create or
         *     replace.
         *
         *     `client_secret` is optional, and omitting it keeps the stored secret, so a configuration can be
         *     changed without sending the secret again. It is required on the first write for a kind (`422`).
         *     Sending a different value rotates it, and the previous secret keeps working for 24 hours. `null`
         *     is refused; to remove a provider, use `DELETE`.
         */
        IdentityProviderIn: {
            /** Allowed Email Domains */
            allowed_email_domains?: string[];
            /**
             * Button Label
             * @default
             */
            button_label: string;
            /** Client Id */
            client_id: string;
            /** Client Secret */
            client_secret?: string | null;
            /**
             * Enabled
             * @default false
             */
            enabled: boolean;
            /** Microsoft Tenant */
            microsoft_tenant?: string | null;
            /** Scopes */
            scopes?: string[];
        };
        /**
         * IdentityProviderList
         * @description The body of `GET /environments/{environment_id}/identity-providers`, ordered by `kind`.
         *
         *     Not paginated, since there is at most one configuration per provider kind: `next_cursor` is
         *     always `null`.
         */
        IdentityProviderList: {
            /** Items */
            items: components["schemas"]["IdentityProviderOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * IdentityProviderOut
         * @description One configured identity provider. Its client secret is never returned.
         *
         *     `callback_url` is the redirect URL to register with the provider. It differs between production
         *     and sandbox, and is computed from the environment's current issuer.
         *
         *     `scopes` is the extra scopes you added; `requested_scopes` is everything an authorization
         *     request asks for, including the provider's own minimum.
         */
        IdentityProviderOut: {
            /** Allowed Email Domains */
            allowed_email_domains: string[];
            /** Button Label */
            button_label: string;
            /** Callback Url */
            callback_url: string;
            /** Client Id */
            client_id: string;
            /** Client Secret Set */
            client_secret_set: boolean;
            /**
             * Client Secret Updated At
             * Format: date-time
             */
            client_secret_updated_at: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Enabled */
            enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Kind
             * @enum {string}
             */
            kind: "google" | "microsoft" | "github" | "facebook";
            /** Microsoft Tenant */
            microsoft_tenant: string | null;
            /** Previous Secret Expires At */
            previous_secret_expires_at: string | null;
            /** Requested Scopes */
            requested_scopes: string[];
            /** Scopes */
            scopes: string[];
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * InvitationIn
         * @description The body of `POST /api/v1/tenants/{tenant_id}/invitations`.
         *
         *     `email` is validated by the same rules as a user's address. `roles` is a list of role ids,
         *     validated as `POST /tenants/{tenant_id}/members` validates them, and empty by default.
         */
        InvitationIn: {
            /** Email */
            email: string;
            /** Roles */
            roles?: string[];
        };
        /**
         * InvitationInviter
         * @description Who sent the invitation, when that is a user of this environment.
         *
         *     `null` when it was sent by a console user administering the environment.
         */
        InvitationInviter: {
            /** Email */
            email: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
        };
        /**
         * InvitationList
         * @description `GET T/invitations`. A named schema, so a generated client has a type to name.
         */
        InvitationList: {
            /** Items */
            items: components["schemas"]["InvitationOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * InvitationOut
         * @description An Invitation as every read of it reports it.
         */
        InvitationOut: {
            /** Accepted At */
            accepted_at?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
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
            invited_by?: components["schemas"]["InvitationInviter"] | null;
            /** Revoked At */
            revoked_at?: string | null;
            /** Roles */
            roles: components["schemas"]["InvitationRole"][];
            /**
             * Status
             * @enum {string}
             */
            status: "open" | "accepted" | "revoked" | "expired";
            /**
             * Tenant Id
             * Format: uuid
             */
            tenant_id: string;
        };
        /**
         * InvitationRole
         * @description One of the roles an invitation offers.
         */
        InvitationRole: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Slug */
            slug: string;
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
         * MauAllowanceOut
         * @description One pool of monthly active users and the allowance it is measured against.
         *
         *     Allowances are pooled differently by plan: `free` pools every `free` App of the Account, `pro`
         *     counts each App separately, and `scale` pools the whole Account. `scope` is `account` for a pool
         *     and `app` for a single `pro` App, and `app_id` is set only for the latter.
         *
         *     `over_allowance` is informational: exceeding an allowance never blocks sign-in.
         */
        MauAllowanceOut: {
            /** Allowance */
            allowance: number;
            /** App Id */
            app_id: string | null;
            /** Mau */
            mau: number;
            /** Over Allowance */
            over_allowance: boolean;
            /** Plan */
            plan: string;
            /**
             * Scope
             * @enum {string}
             */
            scope: "account" | "app";
        };
        /** MeAccount */
        MeAccount: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Slug */
            slug: string;
            /** Status */
            status: string;
        };
        /** MeApp */
        MeApp: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Slug */
            slug: string;
        };
        /** MeEnrollConfirmBody */
        MeEnrollConfirmBody: {
            /**
             * Code
             * @default
             */
            code: string;
        };
        /**
         * MeEnrollStartOut
         * @description `POST /me/mfa/totp/enroll` — the secret and the QR link, once.
         */
        MeEnrollStartOut: {
            /** Otpauth Uri */
            otpauth_uri: string;
            /** Secret */
            secret: string;
        };
        /** MeEnvironment */
        MeEnvironment: {
            app: components["schemas"]["MeApp"];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Issuer */
            issuer: string;
            /** Kind */
            kind: string;
        };
        /**
         * MeMembership
         * @description One Account the console user may switch to.
         */
        MeMembership: {
            account: components["schemas"]["MeAccount"];
            /** Roles */
            roles: string[];
            /**
             * Tenant Id
             * Format: uuid
             */
            tenant_id: string;
        };
        /**
         * MeOut
         * @description Everything a caller can learn about its own credential.
         */
        MeOut: {
            account?: components["schemas"]["MeAccount"] | null;
            /** Account Tenant Permissions */
            account_tenant_permissions?: string[];
            environment?: components["schemas"]["MeEnvironment"] | null;
            /** Memberships */
            memberships?: components["schemas"]["MeMembership"][];
            /** Permissions */
            permissions: string[];
            principal: components["schemas"]["MePrincipal"];
            tenant?: components["schemas"]["MeTenant"] | null;
        };
        /**
         * MePasskeyOptionsOut
         * @description `POST /me/passkeys/register/start` — `PublicKeyCredentialCreationOptions`,
         *     ready for `navigator.credentials.create()`.
         */
        MePasskeyOptionsOut: {
            /** Options */
            options: {
                [key: string]: unknown;
            };
        };
        /**
         * MePasskeyOut
         * @description The one passkey `POST /me/passkeys/register/finish` just registered —
         *     the richer shape `GET /me/mfa` does not carry (see `MfaFactorOut`).
         */
        MePasskeyOut: {
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
            last_used_at?: string | null;
            /** Name */
            name: string;
            /** Transports */
            transports: string[];
            /** Verified */
            verified: boolean;
        };
        /** MePasskeyRegisterFinishBody */
        MePasskeyRegisterFinishBody: {
            /** Credential */
            credential?: {
                [key: string]: unknown;
            };
            /**
             * Name
             * @default
             */
            name: string;
        };
        /**
         * MePasskeyRegisterFinishOut
         * @description The registered passkey. `recovery_codes` is present, once, only the first time the user
         *     registers a second factor of any kind.
         */
        MePasskeyRegisterFinishOut: {
            passkey: components["schemas"]["MePasskeyOut"];
            /** Recovery Codes */
            recovery_codes?: string[] | null;
        };
        /**
         * MePasswordIn
         * @description The body of `POST /me/password`: the current password and the new one. Both are required.
         *
         *     Neither is ever returned; the response is `204` with no body.
         */
        MePasswordIn: {
            /** Current Password */
            current_password: string;
            /** New Password */
            new_password: string;
        };
        /** MePrincipal */
        MePrincipal: {
            /** Kind */
            kind: string;
            /**
             * Subject Id
             * Format: uuid
             */
            subject_id: string;
        };
        /**
         * MeRecoveryCodesOut
         * @description `POST /me/mfa/totp/confirm` and `.../recovery/regenerate` — the ten
         *     codes, once.
         */
        MeRecoveryCodesOut: {
            /** Recovery Codes */
            recovery_codes: string[];
        };
        /** MeTenant */
        MeTenant: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Slug */
            slug: string;
        };
        /**
         * MemberIn
         * @description The body of `POST /api/v1/tenants/{tenant_id}/members`.
         *
         *     Give exactly one of `user_id` and `email`; both or neither is `422`. `roles` is a list of role
         *     ids, empty by default.
         */
        MemberIn: {
            /** Email */
            email?: string | null;
            /** Roles */
            roles?: string[];
            /** User Id */
            user_id?: string | null;
        };
        /**
         * MemberList
         * @description `GET T/members`. A named schema, so a generated client has a type to name.
         */
        MemberList: {
            /** Items */
            items: components["schemas"]["MemberOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * MemberOut
         * @description A Member as every read of it reports it.
         */
        MemberOut: {
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
            /** Roles */
            roles: components["schemas"]["MemberRole"][];
            /** Status */
            status: string;
            /**
             * Tenant Id
             * Format: uuid
             */
            tenant_id: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            user: components["schemas"]["MemberUser"];
        };
        /**
         * MemberPatch
         * @description The body of `PATCH /api/v1/tenants/{tenant_id}/members/{member_id}`.
         *
         *     `roles` replaces the whole set; `[]` is valid, `null` is not. `user`, `tenant_id` and the
         *     timestamps are refused as unknown fields: to move a membership, remove it and add another.
         */
        MemberPatch: {
            /** Roles */
            roles?: string[];
            /**
             * Status
             * @enum {string}
             */
            status?: "active" | "suspended";
        };
        /**
         * MemberRole
         * @description One of a Member's roles, as the Member resource embeds it.
         */
        MemberRole: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Scope */
            scope: string;
            /** Slug */
            slug: string;
        };
        /**
         * MemberUser
         * @description The User a Member is of, as the Member resource embeds it.
         */
        MemberUser: {
            /** Email */
            email: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Status */
            status: string;
        };
        /**
         * MembershipList
         * @description `GET …/users/{user_id}/memberships`, cursor-paginated like every list.
         */
        MembershipList: {
            /** Items */
            items: components["schemas"]["MembershipOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * MembershipOut
         * @description One row of `GET …/users/{user_id}/memberships`.
         */
        MembershipOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Member Id
             * Format: uuid
             */
            member_id: string;
            /** Roles */
            roles: string[];
            /** Status */
            status: string;
            tenant: components["schemas"]["MembershipTenant"];
        };
        /**
         * MembershipTenant
         * @description The Tenant a membership is in, as the membership embeds it.
         */
        MembershipTenant: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Slug */
            slug: string;
            /** Status */
            status: string;
        };
        /**
         * MfaFactorList
         * @description The body of `GET .../users/{user_id}/mfa`: every MFA factor of the user, confirmed or not.
         *
         *     Not paginated, since a user holds at most a few factors: `next_cursor` is always `null`.
         */
        MfaFactorList: {
            /** Items */
            items: components["schemas"]["MfaFactorOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * MfaFactorOut
         * @description One MFA factor of a user.
         *
         *     Secrets and recovery code hashes are never returned. An unconfirmed factor has `confirmed_at:
         *     null`.
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
         * PermissionIn
         * @description The body of `POST /api/v1/environments/{environment_id}/permissions`.
         *
         *     `is_system` is not an input field. A name in the reserved namespace is `422
         *     reserved-permission`.
         */
        PermissionIn: {
            /**
             * Description
             * @default
             */
            description: string;
            /** Name */
            name: string;
        };
        /**
         * PermissionList
         * @description `GET E/permissions`. A named schema, so a client has a type to name.
         */
        PermissionList: {
            /** Items */
            items: components["schemas"]["PermissionOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * PermissionOut
         * @description A Permission as every read of it reports it.
         */
        PermissionOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is System */
            is_system: boolean;
            /** Name */
            name: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * PermissionPatch
         * @description The body of `PATCH /api/v1/permissions/{permission_id}`: the description, and nothing else.
         *
         *     `name` cannot be changed: sending it is refused as immutable.
         */
        PermissionPatch: {
            /** Description */
            description?: string;
        };
        /**
         * PlanLimitsOut
         * @description The limits a plan sets.
         *
         *     `tenant_limit` is the limit that applies to this App now, including any override.
         */
        PlanLimitsOut: {
            /** Audit Retention Days */
            audit_retention_days: number;
            /** Tenant Limit */
            tenant_limit: number;
            /** Webhook Retention Days */
            webhook_retention_days: number;
        };
        /**
         * Problem
         * @description An RFC 9457 problem details document: the error shape of this API.
         *
         *     Problem documents may carry extension members beyond the fields listed here.
         */
        Problem: {
            /** Detail */
            detail?: string | null;
            /** Errors */
            errors?: components["schemas"]["ProblemError"][] | null;
            /** Feature */
            feature?: string | null;
            /** Instance */
            instance?: string | null;
            /** Params */
            params?: {
                [key: string]: unknown;
            } | null;
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
         * ProblemError
         * @description One field-level failure inside a `validation-error` problem.
         *
         *     `field` is `null` for a failure that concerns the request as a whole rather than one field, such
         *     as a rule over two settings.
         */
        ProblemError: {
            /** Code */
            code: string;
            /** Construct */
            construct?: string | null;
            /** Field */
            field: string | null;
            /** Line */
            line?: number | null;
            /** Message */
            message: string;
            /** Offset */
            offset?: number | null;
            /** Slug */
            slug?: string | null;
            /** Tenant Id */
            tenant_id?: string | null;
        };
        /**
         * PromotionBranding
         * @description `{"changed": true}` when the branding record differs. The diff never includes the values
         *     themselves.
         */
        PromotionBranding: {
            /** Changed */
            changed: boolean;
        };
        /**
         * PromotionIdentityProviders
         * @description Which identity provider kinds each environment has configured.
         *
         *     Promotion never copies identity providers, because their credentials belong to one environment.
         *     `sandbox_only` names the providers configured in sandbox but not in production, and `promoted`
         *     is always `false`.
         */
        PromotionIdentityProviders: {
            /** Both */
            both: string[];
            /** Production Only */
            production_only: string[];
            /**
             * Promoted
             * @default false
             * @constant
             */
            promoted: false;
            /** Sandbox Only */
            sandbox_only: string[];
        };
        /**
         * PromotionIn
         * @description The body of `POST /api/v1/environments/{environment_id}/promote`.
         *
         *     `dry_run` defaults to `false`. Unknown fields are refused.
         */
        PromotionIn: {
            /**
             * Dry Run
             * @default false
             */
            dry_run: boolean;
        };
        /**
         * PromotionOut
         * @description A summary of what a promotion changed, or would change.
         *
         *     `applied` is `false` only for a dry run.
         */
        PromotionOut: {
            /** Applied */
            applied: boolean;
            branding: components["schemas"]["PromotionBranding"];
            /** Dry Run */
            dry_run: boolean;
            email_templates: components["schemas"]["PromotionResourceDiff"];
            identity_providers: components["schemas"]["PromotionIdentityProviders"];
            permissions: components["schemas"]["PromotionResourceDiff"];
            roles: components["schemas"]["PromotionResourceDiff"];
            setting_definitions: components["schemas"]["PromotionResourceDiff"];
            /** Settings */
            settings: components["schemas"]["PromotionSettingChange"][];
        };
        /**
         * PromotionResourceDiff
         * @description What a promotion did to one kind of resource, matched by key.
         *
         *     `created` and `updated` name the resources by their key: a permission by `name`, a role by
         *     `slug`, a template by `kind:locale`. `unchanged` counts the ones that matched and did not
         *     change. Resources that exist only in production are not listed: promotion never deletes.
         */
        PromotionResourceDiff: {
            /** Created */
            created: string[];
            /** Unchanged */
            unchanged: number;
            /** Updated */
            updated: string[];
        };
        /** PromotionSettingChange */
        PromotionSettingChange: {
            /** Field */
            field: string;
            /** From */
            from: boolean | number | string | null;
            /** To */
            to: boolean | number | string | null;
        };
        /**
         * RevokedOut
         * @description The `200` of a revoke-all operation: `{"revoked": <count>}`.
         */
        RevokedOut: {
            /** Revoked */
            revoked: number;
        };
        /**
         * RoleIn
         * @description The body of `POST /environments/{environment_id}/roles` and `POST
         *     /tenants/{tenant_id}/roles`.
         *
         *     A role's scope is decided by where it is created, and never changes: an environment's roles are
         *     app-scoped and assignable in every tenant, a tenant's roles only in that tenant.
         */
        RoleIn: {
            /**
             * Description
             * @default
             */
            description: string;
            /** Name */
            name: string;
            /** Permissions */
            permissions?: string[];
            /** Slug */
            slug: string;
        };
        /**
         * RoleList
         * @description `GET E/roles` and `GET T/roles`. A named schema, so a client can name it.
         */
        RoleList: {
            /** Items */
            items: components["schemas"]["RoleOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * RoleOut
         * @description A role.
         */
        RoleOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Description */
            description: string;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is System */
            is_system: boolean;
            /** Member Count */
            member_count: number;
            /** Name */
            name: string;
            /** Permissions */
            permissions: components["schemas"]["RolePermission"][];
            /** Scope */
            scope: string;
            /** Slug */
            slug: string;
            /** Tenant Id */
            tenant_id: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * RolePatch
         * @description The body of `PATCH /api/v1/roles/{role_id}`: `name` and `description`.
         *
         *     `slug` cannot be changed, since it is what tokens carry: sending it is refused as immutable.
         *     Permissions are replaced with `PUT /roles/{role_id}/permissions`. `scope`, `tenant_id`,
         *     `is_system` and `member_count` are refused as unknown fields.
         */
        RolePatch: {
            /** Description */
            description?: string;
            /** Name */
            name?: string;
        };
        /**
         * RolePermission
         * @description One of a Role's permissions, as the Role resource embeds it.
         */
        RolePermission: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
        };
        /**
         * RolePermissionsIn
         * @description The body of `PUT /api/v1/roles/{role_id}/permissions`: the role's whole permission set,
         *     replaced atomically.
         *
         *     The response is the resulting role.
         */
        RolePermissionsIn: {
            /** Permissions */
            permissions: string[];
        };
        /**
         * SentOut
         * @description Whether an email was sent: `{"sent": true | false}`.
         *
         *     `false` when there was nothing to send: a verification email for an address that is already
         *     verified. A send refused by rate limiting is a `429` instead.
         */
        SentOut: {
            /** Sent */
            sent: boolean;
        };
        /**
         * ServiceInfo
         * @description What `GET /api/v1/` answers: which surface this is, at which version.
         */
        ServiceInfo: {
            /** Name */
            name: string;
            /** Version */
            version: string;
        };
        /**
         * SessionFilters
         * @description The filter of the session list.
         *
         *     Only live sessions are listed by default; `include_expired=true` includes revoked and expired
         *     ones.
         */
        SessionFilters: {
            /**
             * Include Expired
             * @default false
             */
            include_expired: boolean;
        };
        /**
         * SessionList
         * @description `GET …/users/{user_id}/sessions`, newest first.
         */
        SessionList: {
            /** Items */
            items: components["schemas"]["SessionOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * SessionOut
         * @description One browser session.
         *
         *     `client_ids` lists the OAuth clients holding a live refresh token in the session.
         */
        SessionOut: {
            /** Amr */
            amr: string[];
            /** Client Ids */
            client_ids: string[];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
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
            ip: string;
            /**
             * Last Seen At
             * Format: date-time
             */
            last_seen_at: string;
            /** Revoked At */
            revoked_at: string | null;
            /** Tenant Id */
            tenant_id: string | null;
            /** User Agent */
            user_agent: string;
            /**
             * User Id
             * Format: uuid
             */
            user_id: string;
        };
        /**
         * SettingConstraints
         * @description The constraints of a setting definition, by `type`.
         *
         *     `choices` for `enum` (1 to 32 strings, each at most 64 characters), `max_length` for `string`
         *     (at most 1024, default 256), `min` and `max` for `number`, and nothing for `boolean`. A field
         *     that does not apply to the type is `422` naming it. Stored constraints are normalised, with
         *     defaults filled in.
         */
        SettingConstraints: {
            /** Choices */
            choices?: string[] | null;
            /** Max */
            max?: number | null;
            /** Max Length */
            max_length?: number | null;
            /** Min */
            min?: number | null;
        };
        /**
         * SettingDefinitionIn
         * @description The body of `POST .../settings/definitions`.
         *
         *     `key` and `type` cannot be changed afterwards. `constraints` may be omitted where the type needs
         *     none (a boolean) or has defaults (a string or number); an `enum` without `choices` is `422`.
         */
        SettingDefinitionIn: {
            /**
             * Access
             * @default user_editable
             * @enum {string}
             */
            access: "user_editable" | "user_visible" | "hidden";
            constraints?: components["schemas"]["SettingConstraints"] | null;
            /** Default */
            default?: boolean | number | string | null;
            /**
             * Description
             * @default
             */
            description: string;
            /** Key */
            key: string;
            /**
             * Label
             * @default
             */
            label: string;
            /**
             * Type
             * @enum {string}
             */
            type: "boolean" | "enum" | "string" | "number";
        };
        /**
         * SettingDefinitionList
         * @description `GET …/settings/definitions` — at most 50 rows, in the one list envelope.
         */
        SettingDefinitionList: {
            /** Items */
            items: components["schemas"]["SettingDefinitionOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * SettingDefinitionOut
         * @description One user setting definition.
         *
         *     `value_count` is how many users hold a stored value, which is how many values deleting the
         *     definition deletes.
         */
        SettingDefinitionOut: {
            /**
             * Access
             * @enum {string}
             */
            access: "user_editable" | "user_visible" | "hidden";
            constraints: components["schemas"]["SettingConstraints"];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Default */
            default: boolean | number | string | null;
            /** Description */
            description: string;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Key */
            key: string;
            /** Label */
            label: string;
            /**
             * Type
             * @enum {string}
             */
            type: "boolean" | "enum" | "string" | "number";
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Value Count */
            value_count: number;
        };
        /**
         * SettingDefinitionPatch
         * @description The body of `PATCH .../settings/definitions/{key}`.
         *
         *     `key` and `type` are refused as immutable. `constraints` replaces the whole object, and `null`
         *     resets it to the type's defaults. `default: null` removes the default.
         */
        SettingDefinitionPatch: {
            /**
             * Access
             * @enum {string}
             */
            access?: "user_editable" | "user_visible" | "hidden";
            constraints?: components["schemas"]["SettingConstraints"] | null;
            /** Default */
            default?: boolean | number | string | null;
            /** Description */
            description?: string | null;
            /** Label */
            label?: string | null;
        };
        /**
         * SigningKeyList
         * @description The body of `GET .../signing-keys`, ordered `active`, `next`, `retired`.
         *
         *     Not paginated: `next_cursor` is always `null`. There is one `active` key, at most one `next`
         *     key, and the retired keys still within their retention window.
         */
        SigningKeyList: {
            /** Items */
            items: components["schemas"]["SigningKeyOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * SigningKeyOut
         * @description One signing key.
         *
         *     `public_jwk` is the public key as an RFC 7517 JWK: `kty`, `crv`, `x`, `y`, `kid`, `alg` and
         *     `use`.
         */
        SigningKeyOut: {
            /** Activated At */
            activated_at: string | null;
            /** Algorithm */
            algorithm: string;
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
            /** Kid */
            kid: string;
            /** Public Jwk */
            public_jwk: {
                [key: string]: string;
            };
            /** Retired At */
            retired_at: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "active" | "next" | "retired";
        };
        /**
         * SigningKeyRotateIn
         * @description The optional body of `POST .../signing-keys/rotate`.
         *
         *     `retire_immediately` is for a key compromise: the previously active key is deleted rather than
         *     retired, so it leaves the JWKS at once. The default, `false`, is an ordinary rotation.
         */
        SigningKeyRotateIn: {
            /**
             * Retire Immediately
             * @default false
             */
            retire_immediately: boolean;
        };
        /**
         * SigningKeyRotated
         * @description The `200` of a signing key rotation: the keys' state afterwards.
         *
         *     `next` is always present. `retired` lists every retired key still within its retention window,
         *     and may be empty after a `retire_immediately` rotation.
         */
        SigningKeyRotated: {
            active: components["schemas"]["SigningKeyOut"];
            next: components["schemas"]["SigningKeyOut"];
            /** Retired */
            retired: components["schemas"]["SigningKeyOut"][];
        };
        /**
         * StatsFilters
         * @description The query parameter of `GET .../stats`.
         */
        StatsFilters: {
            /**
             * Range
             * @default 7d
             * @enum {string}
             */
            range: "7d" | "30d" | "90d";
        };
        /**
         * SubscriptionOut
         * @description The subscription, as last synchronised with the payment provider.
         *
         *     `as_of` is when it was last synchronised, so a client can show that the information may be
         *     stale.
         *
         *     `status` alone does not say whether the Account can currently make changes: an `unpaid` Account
         *     is first blocked from writing until the invoice is paid, and is later moved to the `free` plan,
         *     after which writes are allowed again. `writes_refused` and `downgraded_at` tell the two apart.
         */
        SubscriptionOut: {
            /** As Of */
            as_of: string | null;
            /** Billing Country */
            billing_country: string | null;
            /** Cancel At Period End */
            cancel_at_period_end: boolean;
            /** Currency */
            currency: string | null;
            /** Current Period End */
            current_period_end: string | null;
            /** Downgraded At */
            downgraded_at: string | null;
            /** Plan */
            plan: string | null;
            /** Quantity */
            quantity: number;
            /** Status */
            status: string;
            /** Writes Refused */
            writes_refused: boolean;
        };
        /**
         * TenantIn
         * @description The body of `POST /api/v1/environments/{environment_id}/tenants`.
         *
         *     `slug` is required: it is the value of the `tenant` authorization parameter.
         */
        TenantIn: {
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Name */
            name: string;
            /** Slug */
            slug: string;
        };
        /**
         * TenantList
         * @description `GET E/tenants`. A named schema, so a generated client has a type to name.
         */
        TenantList: {
            /** Items */
            items: components["schemas"]["TenantOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * TenantOut
         * @description A tenant.
         */
        TenantOut: {
            /** Belongs To Another Account */
            belongs_to_another_account: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Is Default */
            is_default: boolean;
            /** Member Count */
            member_count: number;
            /** Metadata */
            metadata: {
                [key: string]: unknown;
            };
            /** Name */
            name: string;
            /** Slug */
            slug: string;
            /** Status */
            status: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * TenantPatch
         * @description The body of `PATCH /api/v1/tenants/{tenant_id}`: `name`, `slug` and `metadata`.
         *
         *     `metadata` is replaced whole. `is_default`, `status`, `member_count` and `environment_id` are
         *     refused as unknown fields; use `suspend` and `unsuspend` to change the status. The default
         *     tenant's `slug` cannot be changed (`422` with `code: "immutable"`).
         */
        TenantPatch: {
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Name */
            name?: string;
            /** Slug */
            slug?: string;
        };
        /**
         * UsageOut
         * @description The body of `GET /api/v1/account/usage`.
         *
         *     `sandbox_users` is reported but never counted toward a limit. `mau` is the Account's monthly
         *     active users for the current calendar month, the same figure `GET /account/billing/usage`
         *     reports; it may be `null`.
         */
        UsageOut: {
            /** Apps */
            apps: components["schemas"]["AppUsageOut"][];
            /** Apps Used */
            apps_used: number;
            /**
             * As Of
             * Format: date-time
             */
            as_of: string;
            /** Mau */
            mau?: number | null;
            /** Production Users */
            production_users: number;
            /** Sandbox Users */
            sandbox_users: number;
        };
        /**
         * UserBlockIn
         * @description The optional body of `POST .../users/{user_id}/block`.
         *
         *     A `POST` with no body blocks the user without a reason.
         */
        UserBlockIn: {
            /**
             * Reason
             * @default
             */
            reason: string;
        };
        /**
         * UserExport
         * @description The body of `GET .../users/{user_id}/export`: everything held about one user, as one
         *     document.
         *
         *     The user record, identities without their secrets, MFA factors without their seeds, memberships,
         *     sessions, and the audit events where the user is actor or target, newest first. The audit events
         *     are capped, and `audit_events_truncated` says when the cap applied.
         */
        UserExport: {
            /** Audit Events */
            audit_events: components["schemas"]["ExportAuditEvent"][];
            /** Audit Events Truncated */
            audit_events_truncated: boolean;
            /**
             * Exported At
             * Format: date-time
             */
            exported_at: string;
            /** Identities */
            identities: components["schemas"]["ExportIdentity"][];
            /** Memberships */
            memberships: components["schemas"]["ExportMembership"][];
            /** Mfa Factors */
            mfa_factors: components["schemas"]["ExportFactor"][];
            /** Sessions */
            sessions: components["schemas"]["ExportSession"][];
            user: components["schemas"]["UserOut"];
        };
        /**
         * UserFilters
         * @description The six filters of `GET .../users`.
         *
         *     `tenant_id` narrows the list to members of one tenant of this environment.
         */
        UserFilters: {
            /** Email */
            email?: string | null;
            /** Mfa */
            mfa?: ("enrolled" | "none") | null;
            /** Q */
            q?: string | null;
            /** Session */
            session?: "active" | null;
            /** Status */
            status?: ("active" | "blocked" | "erased") | null;
            /** Tenant Id */
            tenant_id?: string | null;
        };
        /**
         * UserIn
         * @description The body of `POST /api/v1/environments/{environment_id}/users`.
         *
         *     `id`, `status`, `has_password`, `email_verified_at`, `last_login_at` and `locked_until` are
         *     refused as unknown fields. `email_verified` marks the address verified, and `send_verification`
         *     emails a verification link; neither is a field of the user.
         *
         *     `password` is optional, and is never returned.
         */
        UserIn: {
            /** Email */
            email: string;
            /**
             * Email Verified
             * @default false
             */
            email_verified: boolean;
            /** Locale */
            locale?: ("en" | "pl") | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /**
             * Name
             * @default
             */
            name: string;
            /** Password */
            password?: string | null;
            /**
             * Send Verification
             * @default false
             */
            send_verification: boolean;
        };
        /**
         * UserList
         * @description `GET …/users`. A named schema, so a generated client has a type to name.
         */
        UserList: {
            /** Items */
            items: components["schemas"]["UserOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * UserMergeIn
         * @description The body of `POST .../users/{user_id}/merge`: the user to merge into this one. That user is
         *     erased.
         *
         *     There are no options. A malformed id is `404`, like an id that names no user.
         */
        UserMergeIn: {
            /** Source Id */
            source_id: string;
        };
        /**
         * UserOut
         * @description A user.
         *
         *     `status` includes `erased`. `has_password` says whether the user has a password, and
         *     `mfa_enrolled` whether they hold a confirmed MFA factor.
         */
        UserOut: {
            /**
             * Avatar Color
             * @enum {string}
             */
            avatar_color: "amber" | "blue" | "cyan" | "emerald" | "fuchsia" | "green" | "indigo" | "lime" | "orange" | "pink" | "purple" | "red" | "rose" | "sky" | "teal" | "violet" | "yellow";
            /** Belongs To Another Account */
            belongs_to_another_account: boolean;
            /** Blocked At */
            blocked_at: string | null;
            blocked_by: components["schemas"]["BlockedBy"] | null;
            /** Blocked Reason */
            blocked_reason: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Email */
            email: string;
            /** Email Verified At */
            email_verified_at: string | null;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Has Password */
            has_password: boolean;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Last Login At */
            last_login_at: string | null;
            /** Locale */
            locale: ("en" | "pl") | null;
            /** Locked Until */
            locked_until: string | null;
            /** Merged Into */
            merged_into: string | null;
            /** Metadata */
            metadata: {
                [key: string]: unknown;
            };
            /** Mfa Enrolled */
            mfa_enrolled: boolean;
            /** Name */
            name: string;
            /** Picture Url */
            picture_url: string | null;
            /**
             * Status
             * @enum {string}
             */
            status: "active" | "blocked" | "erased";
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * UserPasswordIn
         * @description The body of `POST .../users/{user_id}/password`: the new password. No response body.
         */
        UserPasswordIn: {
            /** Password */
            password: string;
        };
        /**
         * UserPatch
         * @description The body of `PATCH /api/v1/environments/{environment_id}/users/{user_id}`.
         *
         *     `picture_url` and `locale` can be cleared with `null`; `email`, `name` and `metadata` cannot
         *     (use `""` for no name and `{}` for no metadata).
         *
         *     `email_verified: true` marks the address verified, and suppresses the verification email an
         *     address change would otherwise send; `false` marks it unverified. To set a password, use `POST
         *     .../users/{user_id}/password`. `status` cannot be changed here: sending it is refused as
         *     immutable; use `block` and `unblock`.
         */
        UserPatch: {
            /** Email */
            email?: string;
            /** Email Verified */
            email_verified?: boolean;
            /** Locale */
            locale?: ("en" | "pl") | null;
            /** Metadata */
            metadata?: {
                [key: string]: unknown;
            };
            /** Name */
            name?: string;
            /** Picture Url */
            picture_url?: string | null;
        };
        /**
         * UserSettingList
         * @description The body of `GET .../settings/users/{user_id}/values`: one row per setting definition.
         *
         *     At most 50 rows, so `next_cursor` is always `null`, and `limit` and `cursor` are accepted and
         *     ignored.
         */
        UserSettingList: {
            /** Items */
            items: components["schemas"]["UserSettingOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * UserSettingOut
         * @description One setting's value for one user.
         *
         *     `value` is the user's stored value where there is one, otherwise the setting's default,
         *     otherwise `null`.
         */
        UserSettingOut: {
            /**
             * Access
             * @enum {string}
             */
            access: "user_editable" | "user_visible" | "hidden";
            /** Key */
            key: string;
            /**
             * Type
             * @enum {string}
             */
            type: "boolean" | "enum" | "string" | "number";
            /** Value */
            value: boolean | number | string | null;
        };
        /**
         * UserSettingValueIn
         * @description The body of `PUT .../settings/users/{user_id}/values/{key}`: the whole value.
         *
         *     Never `null`. A value the setting's constraints refuse is `422`.
         */
        UserSettingValueIn: {
            /** Value */
            value: boolean | number | string;
        };
        /**
         * WebhookDeliveryOut
         * @description One delivery attempt, to one endpoint.
         *
         *     `endpoint_id` is `null` when the endpoint has since been deleted; the attempt is kept.
         *     `response_body` is truncated.
         */
        WebhookDeliveryOut: {
            /** Attempt */
            attempt: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Duration Ms */
            duration_ms: number | null;
            /** Endpoint Id */
            endpoint_id: string | null;
            /** Error */
            error: string;
            /** Http Status */
            http_status: number | null;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Next Attempt At */
            next_attempt_at: string | null;
            /**
             * Outcome
             * @enum {string}
             */
            outcome: "pending" | "succeeded" | "failed_http" | "failed_timeout" | "failed_ssrf" | "failed_connection";
            /** Response Body */
            response_body: string;
            /** Status */
            status: string;
        };
        /**
         * WebhookEndpointCreated
         * @description The `201` of creating a webhook endpoint: the endpoint, plus its signing secret.
         */
        WebhookEndpointCreated: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Disabled At */
            disabled_at: string | null;
            /** Disabled Reason */
            disabled_reason: string;
            /** Enabled */
            enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Event Types */
            event_types: string[];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Previous Secret Expires At */
            previous_secret_expires_at: string | null;
            /** Secret */
            secret: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Url */
            url: string;
        };
        /**
         * WebhookEndpointIn
         * @description The body of `POST /api/v1/environments/{environment_id}/webhook-endpoints`.
         *
         *     `event_types` is empty by default: a new endpoint receives nothing until it subscribes. There is
         *     no "all events" value; an event type outside the catalogue is `422 invalid-event-type`.
         *
         *     `id`, `secret`, `enabled`, `disabled_at`, `disabled_reason` and `environment_id` are refused as
         *     unknown fields. A new endpoint is always enabled.
         */
        WebhookEndpointIn: {
            /** Event Types */
            event_types?: string[];
            /** Name */
            name: string;
            /** Url */
            url: string;
        };
        /**
         * WebhookEndpointList
         * @description `GET …/webhook-endpoints`. A named schema, so a generated client has a type to name.
         */
        WebhookEndpointList: {
            /** Items */
            items: components["schemas"]["WebhookEndpointOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * WebhookEndpointOut
         * @description A webhook endpoint.
         *
         *     The signing secret is never returned after creation or rotation. `previous_secret_expires_at` is
         *     set for 24 hours after a rotation, while the previous secret still verifies.
         */
        WebhookEndpointOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Disabled At */
            disabled_at: string | null;
            /** Disabled Reason */
            disabled_reason: string;
            /** Enabled */
            enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Event Types */
            event_types: string[];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Previous Secret Expires At */
            previous_secret_expires_at: string | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Url */
            url: string;
        };
        /**
         * WebhookEndpointPatch
         * @description The body of `PATCH
         *     /api/v1/environments/{environment_id}/webhook-endpoints/{webhook_endpoint_id}`.
         *
         *     `event_types` is replaced whole; `[]` unsubscribes from everything, and `null` is not accepted.
         *
         *     `enabled: false` disables the endpoint and is audited as `webhook_endpoint.disabled`. `enabled:
         *     true` re-enables it, whether it was disabled by a person or automatically after repeated
         *     failures, and clears `disabled_at` and `disabled_reason`.
         */
        WebhookEndpointPatch: {
            /** Enabled */
            enabled?: boolean;
            /** Event Types */
            event_types?: string[];
            /** Name */
            name?: string;
            /** Url */
            url?: string;
        };
        /**
         * WebhookEndpointSecretOut
         * @description The `200` of `POST …/rotate-secret`: the resource and the new secret.
         */
        WebhookEndpointSecretOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Disabled At */
            disabled_at: string | null;
            /** Disabled Reason */
            disabled_reason: string;
            /** Enabled */
            enabled: boolean;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Event Types */
            event_types: string[];
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Previous Secret Expires At */
            previous_secret_expires_at: string | null;
            /** Secret */
            secret: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /** Url */
            url: string;
        };
        /**
         * WebhookEventDetailOut
         * @description The body of `GET .../webhook-events/{webhook_event_id}`: the event's envelope and every
         *     delivery attempt.
         *
         *     `payload` is exactly the envelope every delivery sent; its `data` is `{}` for an event about a
         *     user who has since been erased. `deliveries` is every attempt, to every endpoint, newest first.
         */
        WebhookEventDetailOut: {
            /** Deliveries */
            deliveries: components["schemas"]["WebhookDeliveryOut"][];
            /** Dispatched At */
            dispatched_at: string | null;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Event Type */
            event_type: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /**
             * Outcome
             * @enum {string}
             */
            outcome: "pending" | "succeeded" | "failed";
            /** Payload */
            payload: {
                [key: string]: unknown;
            };
            /** Succeeded Endpoints */
            succeeded_endpoints: number;
            /** Test */
            test: boolean;
            /** Total Endpoints */
            total_endpoints: number;
        };
        /**
         * WebhookEventList
         * @description `GET …/webhook-events`. A named schema, so a generated client has a type to name.
         */
        WebhookEventList: {
            /** Items */
            items: components["schemas"]["WebhookEventOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * WebhookEventOut
         * @description One webhook event in a list, without its payload or delivery attempts (see
         *     `WebhookEventDetailOut`).
         *
         *     `outcome` is the worst outcome among the endpoints the event was delivered to (failed, then
         *     pending, then succeeded), not the latest attempt, so a later success does not hide a failure.
         *     `succeeded_endpoints` and `total_endpoints` count the endpoints that currently read `succeeded`,
         *     and all the endpoints the event was delivered to; both are `0` before the first delivery.
         */
        WebhookEventOut: {
            /** Dispatched At */
            dispatched_at: string | null;
            /**
             * Environment Id
             * Format: uuid
             */
            environment_id: string;
            /** Event Type */
            event_type: string;
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Occurred At
             * Format: date-time
             */
            occurred_at: string;
            /**
             * Outcome
             * @enum {string}
             */
            outcome: "pending" | "succeeded" | "failed";
            /** Succeeded Endpoints */
            succeeded_endpoints: number;
            /** Test */
            test: boolean;
            /** Total Endpoints */
            total_endpoints: number;
        };
        /**
         * WebhookEventReplayIn
         * @description The body of `POST .../webhook-events/{webhook_event_id}/replay`.
         *
         *     `endpoint_id` is required, because an event may have been delivered to more than one endpoint.
         */
        WebhookEventReplayIn: {
            /**
             * Endpoint Id
             * Format: uuid
             */
            endpoint_id: string;
        };
        /**
         * WebhookEventReplayOut
         * @description The `202` of a replay: which event, to which endpoint, and when it was scheduled.
         */
        WebhookEventReplayOut: {
            /**
             * Endpoint Id
             * Format: uuid
             */
            endpoint_id: string;
            /**
             * Event Id
             * Format: uuid
             */
            event_id: string;
            /**
             * Replayed At
             * Format: date-time
             */
            replayed_at: string;
        };
        /**
         * WebhookTestIn
         * @description `POST …/webhook-endpoints/{id}/test` — the one event type to send.
         */
        WebhookTestIn: {
            /** Event Type */
            event_type: string;
        };
        /**
         * WebhookTestOut
         * @description The `202` of a test send: the `WebhookEvent` it wrote, not the endpoint.
         */
        WebhookTestOut: {
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Event Id
             * Format: uuid
             */
            event_id: string;
            /** Event Type */
            event_type: string;
            /** Test */
            test: boolean;
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
    service_info: {
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
                    "application/json": components["schemas"]["ServiceInfo"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_account: {
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
                    "application/json": components["schemas"]["AccountRead"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_account: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountRead"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_account_audit_events: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                action?: string[] | null;
                actor_id?: string | null;
                target_id?: string | null;
                from?: string | null;
                to?: string | null;
                format?: "json" | "ndjson";
                tenant_id?: string | null;
                environment_id?: string | null;
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
                    "application/json": components["schemas"]["AuditEventList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_billing: {
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
                    "application/json": components["schemas"]["BillingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_checkout_operation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BillingSessionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    open_portal_operation: {
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
                    "application/json": components["schemas"]["BillingSessionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_billing_usage: {
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
                    "application/json": components["schemas"]["BillingUsageOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_usage: {
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
                    "application/json": components["schemas"]["UsageOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_account_operation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AccountIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AccountOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_apps: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                slug?: string | null;
                q?: string | null;
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
                    "application/json": components["schemas"]["AppList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_app_operation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_app: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                app_id: string;
            };
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
                    "application/json": components["schemas"]["AppOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_app_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                app_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_app: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                app_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AppOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_app_environments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                app_id: string;
            };
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
                    "application/json": components["schemas"]["EnvironmentList"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_environment_stats: {
        parameters: {
            query?: {
                range?: "7d" | "30d" | "90d";
            };
            header?: never;
            path: {
                app_id: string;
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["EnvironmentStats"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_environment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["EnvironmentOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_environment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnvironmentPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnvironmentOut"];
                };
            };
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnvironmentOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_api_keys: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                status?: ("active" | "expired" | "revoked") | null;
                q?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["ApiKeyList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_api_key_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ApiKeyIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiKeyCreated"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_api_key: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                api_key_id: string;
            };
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
                    "application/json": components["schemas"]["ApiKeyOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_api_key_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                api_key_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_api_key_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                api_key_id: string;
            };
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
                    "application/json": components["schemas"]["ApiKeyOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    rotate_api_key_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                api_key_id: string;
            };
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
                    "application/json": components["schemas"]["ApiKeyCreated"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_environment_audit_events: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                action?: string[] | null;
                actor_id?: string | null;
                target_id?: string | null;
                from?: string | null;
                to?: string | null;
                format?: "json" | "ndjson";
                tenant_id?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["AuditEventList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_branding: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["BrandingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    replace_branding: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrandingIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    preview_branding: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BrandingIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BrandingPreviewOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Service Unavailable */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    reset_branding: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["BrandingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_clients: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                is_default?: boolean | null;
                q?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["ClientList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_client_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClientIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClientCreated"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_client: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                client_id: string;
            };
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
                    "application/json": components["schemas"]["ClientOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_client_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                client_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_client: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                client_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ClientPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ClientOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    rotate_client_secret: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                client_id: string;
            };
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
                    "application/json": components["schemas"]["ClientSecretOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_email_templates: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["EmailTemplateList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_email_template_variables: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["EmailVariables"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_email_template: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: string;
                locale: string;
            };
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
                    "application/json": components["schemas"]["EmailTemplateOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    put_email_template: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: string;
                locale: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EmailTemplateIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailTemplateOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    render_email_template: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: string;
                locale: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["EmailTemplateRenderIn"] | null;
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EmailTemplateRendered"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    reset_email_template: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: string;
                locale: string;
            };
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
                    "application/json": components["schemas"]["EmailTemplateOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_identity_providers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["IdentityProviderList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_identity_provider: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: "google" | "microsoft" | "github" | "facebook";
            };
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
                    "application/json": components["schemas"]["IdentityProviderOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    put_identity_provider: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                kind: "google" | "microsoft" | "github" | "facebook";
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IdentityProviderIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IdentityProviderOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_identity_provider: {
        parameters: {
            query?: {
                force?: boolean;
            };
            header?: never;
            path: {
                environment_id: string;
                kind: "google" | "microsoft" | "github" | "facebook";
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_permissions: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                q?: string | null;
                system?: boolean | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["PermissionList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_permission_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PermissionIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PermissionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    promote_environment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PromotionIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PromotionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_roles: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                q?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["RoleList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_role_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_all_environment_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_setting_definitions: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["SettingDefinitionList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_setting_definition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingDefinitionIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SettingDefinitionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_setting_definition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                key: string;
            };
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
                    "application/json": components["schemas"]["SettingDefinitionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_setting_definition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_setting_definition: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SettingDefinitionPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SettingDefinitionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_settings: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["UserSettingList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    put_user_setting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
                key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserSettingValueIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserSettingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_user_setting: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_signing_keys: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["SigningKeyList"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    rotate_signing_keys_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["SigningKeyRotateIn"] | null;
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SigningKeyRotated"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_tenants: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                q?: string | null;
                status?: ("active" | "suspended") | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["TenantList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_tenant_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TenantIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TenantOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_users: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                email?: string | null;
                q?: string | null;
                status?: ("active" | "blocked" | "erased") | null;
                tenant_id?: string | null;
                mfa?: ("enrolled" | "none") | null;
                session?: "active" | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["UserList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_user_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_user: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_user_operation: {
        parameters: {
            query?: {
                erase?: boolean;
            };
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_user: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    block_user_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["UserBlockIn"] | null;
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_device_authorizations: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["DeviceAuthorizationList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_user_device_authorization: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
                authorization_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    export_user: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["UserExport"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_identities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["IdentityList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    link_user_identity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IdentityIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IdentityOut"];
                };
            };
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IdentityOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    unlink_user_identity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_memberships: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["MembershipList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    merge_user_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserMergeIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_mfa_factors: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["MfaFactorList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_user_mfa_factor: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    set_user_password: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserPasswordIn"];
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    send_password_reset_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["SentOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    send_verification_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["SentOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_user_sessions: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                include_expired?: boolean;
            };
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["SessionList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_all_user_sessions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_user_session: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    unblock_user_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
            };
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
                    "application/json": components["schemas"]["UserOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    unlock_user_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                user_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_webhook_endpoints: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                enabled?: boolean | null;
                event_type?: string | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["WebhookEndpointList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_webhook_endpoint_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WebhookEndpointIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookEndpointCreated"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_webhook_endpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_endpoint_id: string;
            };
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
                    "application/json": components["schemas"]["WebhookEndpointOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_webhook_endpoint_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_endpoint_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_webhook_endpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_endpoint_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WebhookEndpointPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookEndpointOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    rotate_webhook_endpoint_secret: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_endpoint_id: string;
            };
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
                    "application/json": components["schemas"]["WebhookEndpointSecretOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    test_webhook_endpoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_endpoint_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WebhookTestIn"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookTestOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_webhook_events: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                event_type?: string | null;
                endpoint_id?: string | null;
                outcome?: ("pending" | "succeeded" | "failed") | null;
            };
            header?: never;
            path: {
                environment_id: string;
            };
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
                    "application/json": components["schemas"]["WebhookEventList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    stream_webhook_events: {
        parameters: {
            query?: {
                event_types?: string[] | null;
                after?: string | null;
            };
            header?: {
                "Last-Event-ID"?: string | null;
            };
            path: {
                environment_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description An open event stream. Each message is a webhook envelope as `data:` with the event's id as the SSE `id:`, plus a comment keepalive every 15 seconds. Not consumable by a generated client. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/event-stream": string;
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_webhook_event: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_event_id: string;
            };
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
                    "application/json": components["schemas"]["WebhookEventDetailOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    replay_webhook_event_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                environment_id: string;
                webhook_event_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WebhookEventReplayIn"];
            };
        };
        responses: {
            /** @description Accepted */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookEventReplayOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    me: {
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
                    "application/json": components["schemas"]["MeOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_my_device_authorizations: {
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
                    "application/json": components["schemas"]["DeviceAuthorizationList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_my_device_authorization: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                authorization_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_my_mfa_factors: {
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
                    "application/json": components["schemas"]["MfaFactorList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    regenerate_my_recovery_codes: {
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
                    "application/json": components["schemas"]["MeRecoveryCodesOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    confirm_my_totp_enrollment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MeEnrollConfirmBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeRecoveryCodesOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_my_totp_enrollment: {
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
                    "application/json": components["schemas"]["MeEnrollStartOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_my_mfa_factor: {
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    finish_my_passkey_registration: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MePasskeyRegisterFinishBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MePasskeyRegisterFinishOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    start_my_passkey_registration: {
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
                    "application/json": components["schemas"]["MePasskeyOptionsOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    change_my_password: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MePasswordIn"];
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_my_settings: {
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
                    "application/json": components["schemas"]["UserSettingList"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    put_my_setting: {
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
                "application/json": components["schemas"]["UserSettingValueIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserSettingOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_my_setting: {
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_permission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                permission_id: string;
            };
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
                    "application/json": components["schemas"]["PermissionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_permission_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                permission_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_permission: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                permission_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PermissionPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PermissionOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_role: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                role_id: string;
            };
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
                    "application/json": components["schemas"]["RoleOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_role_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                role_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_role: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                role_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RolePatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    put_role_permissions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                role_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RolePermissionsIn"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_tenant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["TenantOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    delete_tenant_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_tenant: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TenantPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TenantOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_tenant_audit_events: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                action?: string[] | null;
                actor_id?: string | null;
                target_id?: string | null;
                from?: string | null;
                to?: string | null;
                format?: "json" | "ndjson";
            };
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["AuditEventList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_invitations: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                status?: "open" | "accepted" | "revoked" | "expired";
                q?: string | null;
            };
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["InvitationList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_invitation_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InvitationIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitationOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    revoke_invitation_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
                invitation_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    resend_invitation_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
                invitation_id: string;
            };
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
                    "application/json": components["schemas"]["InvitationOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_members: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                q?: string | null;
                role?: string | null;
                status?: ("active" | "suspended") | null;
            };
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["MemberList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    add_member_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    read_member: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
                member_id: string;
            };
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
                    "application/json": components["schemas"]["MemberOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    remove_member_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
                member_id: string;
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
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    patch_member: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
                member_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MemberPatch"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MemberOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    list_tenant_roles: {
        parameters: {
            query?: {
                limit?: number;
                cursor?: string | null;
                q?: string | null;
                scope?: ("app" | "tenant") | null;
            };
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["RoleList"];
                };
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    create_tenant_role_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RoleIn"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RoleOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    suspend_tenant_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["TenantOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
    unsuspend_tenant_operation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tenant_id: string;
            };
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
                    "application/json": components["schemas"]["TenantOut"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Payment Required */
            402: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Not Found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Conflict */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Unprocessable Content */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
            /** @description Too Many Requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Problem"];
                };
            };
        };
    };
}
