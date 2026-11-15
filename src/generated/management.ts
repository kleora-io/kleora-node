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
         * @description The caller's own Account — resolved from the token, never from a path.
         *
         *     `@requires` has already made `request.target.account` the principal's own
         *     Account, so a `console_user` who belongs to two Accounts reads each one's
         *     own row depending on which `tenant=` context authorised the token: never
         *     another Account's data, and never a 404.
         *
         *     One of the two operations a suspended Account still gets, so the console can
         *     say why everything else is 403.
         */
        get: operations["read_account"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Rename the account
         * @description Rename it. `slug`, `plan`, `status` and `tenant_id` are not.
         *
         *     Not `allow_suspended`: reading an Account while it is suspended is how the
         *     console explains the suspension, writing to it is not.
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
         * @description Every event of the principal's Account, account-level ones included.
         *
         *     `account` is set on every event and is the column this reads, which is what
         *     makes a customer's own membership changes — physically rows of the `id`
         *     App's production environment — show up here rather than under Kleora's
         *     Account (audit-log.md §Recording).
         *
         *     `environment_id` and `tenant_id` are filters on top of that scope rather
         *     than lookups — `_audit_filtered` applies them like every other filter, so
         *     they narrow rows this Account already owns and an id from another Account
         *     simply matches nothing. There is no oracle in that: the answer is the same
         *     empty page an id that does not exist gets.
         *
         *     `console_user` only, by scope level: an `api_key` and a `tenant_member`
         *     cannot hold `account`, so both are 403 `insufficient-scope` without this
         *     handler saying anything.
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
         * @description Everything about what this Account is on, and none of it from Stripe.
         *
         *     **This operation never calls Stripe.** billing.md §"Failure modes": when
         *     Stripe is down "the page renders from our mirror, marked possibly stale.
         *     Billing is on no critical path." An endpoint that reached out to Stripe to
         *     render a plan would put a third party on the path of the console's own
         *     settings page, and `subscription.as_of` is how the console says how old the
         *     answer is instead.
         *
         *     The limits come from `apps.accounts.plan_limits`, which is P6-11's single
         *     authority for billing.md §Plans — read per App and through
         *     `effective_plan`, so a `scale` Account's `free` App reports `scale`'s
         *     numbers rather than its own column's.
         *
         *     Never a card number and never a Stripe secret; never a Stripe id either.
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
         *     `200`, not `201`: nothing of ours was created. The Stripe objects a
         *     completed Checkout produces reach this codebase through the webhook, which
         *     is the only writer of the mirror.
         *
         *     **The currency follows `billing_country`** and never the caller's locale
         *     (billing.md §"Currency follows the customer, never the page language"); the
         *     country the buyer states wins, the address on their Stripe record answers
         *     when they state none, and the default currency applies when neither does.
         *     It is fixed for the life of the subscription, because Stripe will not switch
         *     a live one's currency.
         *
         *     Stripe Tax is enabled on the session and tax ids are collected there
         *     (`apps.billing.services.start_checkout`), so VAT and sales tax are Stripe's
         *     arithmetic — every Price is net in both currencies. A second Checkout for an
         *     Account that already has a live subscription is `409 conflict` pointing at
         *     the Portal — the door half of
         *     billing.md's "the second is a no-op, not a second subscription"; the
         *     one-to-one mirror is the other half.
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
         * @description A Customer Portal session — minted per request, and never shared.
         *
         *     The Portal is where cards, invoices, receipts, tax ids and cancellation
         *     live. That is the whole reason this endpoint takes no body and returns one
         *     URL: every screen behind it is one this codebase does not contain.
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
         * @description What this Account has used this calendar month, and against what.
         *
         *     billing.md §API: "so a customer can check our arithmetic". That phrase is
         *     the whole design of the response — every figure comes with the window it was
         *     measured over and the allowance it is measured against, because a usage
         *     number a customer cannot reconcile is a number they will dispute, and one
         *     that disagrees with their invoice is worse than none at all. It is served
         *     from the same roll-up the invoice will be built from
         *     (`apps.billing.metering`), never from a second count of its own.
         *
         *     **Nothing here refuses anything, and nothing downstream of it may.**
         *     `over_allowance` is a fact about a number. billing.md §"Limits, and how they
         *     are enforced" is explicit that MAU "never blocks authentication" and that
         *     `free` — which has no card and therefore no overage — is told and keeps
         *     working: "Refusing a sign-in because the customer grew is precisely the
         *     failure this spec is arranged to avoid."
         *
         *     `billing:read`, like `GET /account/billing`: usage is a billing figure, so
         *     it is behind the billing permission rather than `account:read`. An `admin`
         *     holds `billing:read` and not `billing:write`, so it reads this and cannot
         *     reach Checkout or the Portal (rbac.md §Permissions).
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
         * @description Users per App and per environment, and the App count against the limit.
         *
         *     Sandbox is reported and never counted toward anything (environments.md
         *     §Sandbox). Unlike `GET /account` this is not `allow_suspended`: usage is not
         *     what the console needs in order to explain a suspension.
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
         * @description An additional Account for the person already holding a console token.
         *
         *     `scope="none"` because it *creates* the Account a scope would be resolved
         *     against: there is no target and nothing to contain. The restriction that
         *     matters here is a different one — only a `console_user` may call it, since
         *     an `api_key` or a `tenant_member` creating an Account would be a credential
         *     minting authority outside the environment it was issued for — and it is
         *     declared as `kinds`, not written below (ADR 0009).
         *
         *     The two rules that could be mistaken for the endpoint's are the service's:
         *     `create_account` requires a verified address and refuses an eleventh
         *     Account, so the hosted "create your workspace" form cannot hold to one set
         *     of rules while this holds to another.
         *
         *     No `Location`: there is no URL that names this Account. `/account` is
         *     whichever Account the *token* resolves to, and this one becomes reachable
         *     only after the console re-authorises with `tenant={slug}`.
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
         *     `?slug=` is an exact, case-sensitive match — not a prefix and not a search —
         *     because it exists for one thing: the console resolving the slug in its URL
         *     to the App the page is about. It is filtered *inside* the Account, so
         *     another Account's slug returns an empty page rather than a 404: a filter
         *     that matched nothing, not a row that was hidden (apps.md §`GET /apps`).
         *
         *     `q` is management-api.md §Conventions' own contract: a case-insensitive
         *     substring of `name` or `slug`, for the console's Apps table (Q3-59).
         *
         *     Both filters are named to `paginate` as well as applied, so they are part
         *     of the cursor's fingerprint and a cursor issued for one cannot be presented
         *     against the unfiltered listing.
         */
        get: operations["list_apps"];
        put?: never;
        /**
         * Create an app
         * @description An App, both its Environments, and everything the two contain.
         *
         *     Every rule here is `create_app`'s, which is what makes this endpoint and the
         *     console agree — there is no App-count ceiling on any plan (billing.md
         *     §Plans: "Apps: unlimited"), so the only thing that can fail past validation
         *     is a slug race, and a failure anywhere leaves no App, no Environment and no
         *     `app.created`.
         *
         *     Worth an `Idempotency-Key` more than anything else on this surface, given
         *     how much a single call provisions — and it takes one for free, from
         *     `ManagementApiMiddleware`.
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
         * @description The App, with both environment ids embedded.
         *
         *     `app_id` is a `str` and never parsed here: `@requires` resolved the row and
         *     a value that is not a UUID is the same 404 a missing row gets
         *     (management-api.md §"Resource map").
         */
        get: operations["read_app"];
        put?: never;
        post?: never;
        /**
         * Delete an app
         * @description The App, both Environments and every row below them, in one transaction.
         *
         *     Refused for the `id` App: it holds every Account's own tenant (ADR 0010), so
         *     deleting it would delete the customer records of every other Account on the
         *     platform. A repeated `DELETE` is 404 — the correct report of the end state,
         *     and not something idempotency replays (apps.md §`DELETE /apps/{app_id}`).
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
         * @description The same two objects `GET /apps/{app_id}` embeds, in the list envelope.
         *
         *     Not paginated — an App has exactly two Environments, always, and they are
         *     created and destroyed with it (environments.md §"What an environment
         *     contains") — so `next_cursor` is always null. It is present because
         *     management-api.md §OpenAPI admits no inline object here: one envelope for
         *     every list of the surface is one type in every generated client, and
         *     `SigningKeyList` settled the same question for the same reason.
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
         * @description The overview's numbers: totals now, a daily series, and four setup facts.
         *
         *     One request rather than five, because the overview draws all of it at once
         *     and five round trips would be five chances for the cards to disagree about
         *     which environment they are describing.
         *
         *     Cached for 60 seconds per environment and range
         *     (`apps.accounts.services.stats`), so the range switcher's three answers cost
         *     one computation each however often somebody clicks between them —
         *     `computed_at` is the moment of that computation, not of this request.
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
         * @description Any subset of the settings columns, validated against domain-model.md.
         *
         *     Refusals that are not the schema's. `tenant_mode` and `no_tenant_behaviour`
         *     on the `id` App's environments are 409 `platform-protected`: they decide how
         *     the console's own users are grouped, and a customer switching them would be
         *     changing the shape of every Account's membership (platform-bootstrap.md
         *     §Invariants). `no_tenant_behaviour=create` needs a `tenant_creator_role`,
         *     and a `tenant_creator_role` has to name an app-scoped role of this
         *     environment — both are the model's rules, arriving as a `ValidationError`
         *     and leaving as a 422 naming the field. And `multi` → `single` is refused
         *     while another Tenant exists (409 `tenant-mode-switch-blocked`) or while an
         *     earlier switch's backfill is still in flight (409
         *     `tenant-mode-backfill-pending`).
         *
         *     **202, not 200**, for the `PATCH` that starts that backfill: the settings
         *     are applied and durable, but the memberships `single` mode owes are written
         *     by a Celery task, and the body reports `backfill_status: "pending"` until it
         *     is done (environments.md §API, tenants-and-membership.md §"Tenant modes").
         *
         *     And `mfa_policy: required` is 402 `payment-required` on a plan that does
         *     not carry MFA enforcement (billing.md §Plans; mfa.md §"What a plan gates").
         *     Only that value: `off` and `optional` are on every plan, and a downgrade
         *     writes a stored `required` **down** to `optional` rather than leaving the
         *     column saying one thing while the login flow does another
         *     (`apps.billing.dunning.relax_mfa_policy`).
         *
         *     **The authentication policy is a person's to change.** `mfa_policy`,
         *     `password_min_length` and `password_breach_check` are accepted only from a
         *     `console_user`. Any other credential that sends one of them, whatever the
         *     value — an API key holding `settings:write` among them — gets 403
         *     `insufficient-scope` naming the fields, and nothing in the request is
         *     applied (environments.md §API).
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
         * @description The environment's keys, newest first, optionally filtered by `status` or searched.
         *
         *     Newest first because that is the order the console reads them in: the key
         *     somebody just made is the one they are looking for, and a key list is a
         *     thing people scroll rather than page through. It is the second descending
         *     listing in the surface, after audit events.
         *
         *     `status` is derived rather than stored, so the filter is three predicates
         *     over `revoked_at` and `expires_at` rather than an equality — and the clock
         *     is read once for the whole page, so a key cannot be `active` in the filter
         *     and `expired` in the body of the same response.
         *
         *     `q` is a case-insensitive substring of `name` — the credential itself is
         *     never a searchable field, only ever shown once (management-api.md
         *     §Conventions "Search"; Q3-59).
         *
         *     Every filter is named to `paginate` as well as applied, so it is part of
         *     the cursor's fingerprint: a cursor issued for `?status=revoked` cannot be
         *     presented against the unfiltered listing and seek at a position that means
         *     something else there.
         */
        get: operations["list_api_keys"];
        put?: never;
        /**
         * Create an API key
         * @description A key for this environment, with a prefix that follows the environment.
         *
         *     The 201 carries the full key, once, under the shown-once rules — `no_store`
         *     on the response and nothing that could show it again. A replay under the
         *     same `Idempotency-Key` returns the stored body including the key, because
         *     that is the same response and the store holds it under the same guarantees;
         *     a second `POST` without one mints a second key, which is what a second
         *     creation means.
         *
         *     Three refusals are the resource's rather than the schema's: a scope outside
         *     the allowed set is 422 `invalid-scope` naming every offending entry, an
         *     environment already holding 100 non-revoked keys is 422 `limit-exceeded`,
         *     and an `expires_at` less than 60 s ahead is 422 `validation-error` on that
         *     field.
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
         * @description Remove the row. Allowed whether or not the key was revoked first.
         *
         *     The key stops authenticating immediately, for the same reason a revoked one
         *     does: nothing caches validity, and the resolver finds no row. What is lost
         *     is the listing — which is why `api_key.deleted` keeps the `name` and the
         *     `prefix`, so the log can still answer "what was that key".
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
         * @description Stop the key authenticating, keeping the row. Idempotent.
         *
         *     The very next request with that key is 401, and revoking an already revoked
         *     key answers 200 with the same row rather than a conflict: the end state the
         *     caller asked for is the end state. Only the first one writes the event.
         *
         *     404 when a `DELETE` commits between this operation's own lookup and the
         *     service's — the row is gone, and 200 with a `status` read off an instance
         *     that no longer has a row behind it would be a worse answer than the one the
         *     second `DELETE` gets.
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
         * @description A new secret for the key, returned once. No body, no overlap window.
         *
         *     The row keeps its id, name, scopes and audit history; only the credential
         *     moves. The previous secret stops authenticating immediately — the same
         *     "nothing caches key validity" rule a revocation relies on. A `revoked` or
         *     `expired` key is 409 `api-key-not-rotatable`: rotating one would hand back
         *     a secret that looks live and is not, and the answer to a dead key is a new
         *     key, not a rotated one.
         *
         *     404 when a `DELETE` commits between this operation's own lookup and the
         *     service's, for the same reason `revoke_api_key_operation` is.
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
         * @description Every event recorded against this environment, newest first.
         *
         *     `environment = {id}` exactly, so the account-level events — and the events
         *     of an App that was deleted, whose `environment` the cascade nulled — are not
         *     here. They are the Account endpoint's, which is the one whose scope can
         *     hold them.
         *
         *     `?tenant_id=` narrows further, on top of that scope: audit-log.md §API
         *     offers it on this endpoint and the account one, and a tenant of another
         *     environment simply matches nothing — the rows are already this
         *     environment's.
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
         * @description The stored record, merged over the defaults so it is always whole.
         *
         *     An Environment created before a key existed has a record without it
         *     (`merged_branding`), and a console that had to defend against that would be
         *     a second place the default record is written down.
         */
        get: operations["read_branding"];
        /**
         * Replace an environment's branding record
         * @description The whole record, validated and normalised, with the changed keys audited.
         *
         *     `exclude_unset` is what carries "unknown keys anywhere are rejected" past
         *     the schema and into the validator: a `background` of `{"kind": "solid"}`
         *     reaches it as that and not as `solid` plus six nulls, so
         *     `background.angle` on a solid background is the 422 branding.md asks for
         *     rather than a null the validator would have to guess about.
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
         * @description A draft in Redis for 600 s, and the URL that renders it.
         *
         *     Nothing is written to the environment: the console saves by calling `PUT`
         *     with the same body. An invalid draft is the same 422 a `PUT` of it would be
         *     and nothing reaches Redis, because validation happens first.
         *
         *     `no_store` on the answer: the `preview_url` carries a token that reads a
         *     draft, and a shared cache holding it would hand the next caller somebody
         *     else's unsaved work.
         *
         *     **The budget is spent before the draft is parsed.** Validation tokenizes up
         *     to 8 KiB of customer CSS, and an over-budget caller that still paid for
         *     that parse would have a cheap way to buy work at thirty-one requests a
         *     minute. The precedence this fixes is 429-over-422, which is the right way
         *     round: "you are sending too many" is true of a request whether or not its
         *     body is also wrong, and a client that is being told to slow down does not
         *     need its body reviewed first. Authorisation still comes first — `@requires`
         *     is outside this — so a caller with no permission never spends a budget.
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
         * @description The environment's clients, oldest first, optionally filtered by the flag or searched.
         *
         *     `?is_default=true` returns exactly one client for a provisioned
         *     environment — which is how the console overview reads the quickstart's
         *     `client_id` in one call — and `?is_default=false` returns the rest.
         *
         *     `q` is a case-insensitive substring of `name` or `client_id`
         *     (management-api.md §Conventions "Search"; Q3-59).
         *
         *     Both filters are named to `paginate` as well as applied, so they are part
         *     of the cursor's fingerprint: a cursor issued for one cannot be presented
         *     against the unfiltered listing and seek at a position that means something
         *     else there.
         */
        get: operations["list_clients"];
        put?: never;
        /**
         * Create a client
         * @description A `spa`, `web` or `native` client, with a `client_id` we mint.
         *
         *     For `kind: "web"` the 201 carries the secret, once, under the shown-once
         *     rules — `no_store` on the response and nothing that could show it again. A
         *     replay under the same `Idempotency-Key` returns the stored body including
         *     the secret, because that is the same response and the store holds it under
         *     the same guarantees.
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
         * @description The client, its authorization codes, its auth requests and its refresh tokens.
         *
         *     Sessions are untouched: a Session has no client and is shared across the
         *     environment's clients, so the person stays signed in at the hosted pages
         *     while nothing minted through this client can be refreshed again.
         *
         *     409 `client-default` for the environment's default client, which the console
         *     renders as a disabled delete action rather than as a failed request.
         */
        delete: operations["delete_client_operation"];
        options?: never;
        head?: never;
        /**
         * Change a client
         * @description A merge patch over the client's own properties. Never a secret.
         *
         *     Three answers that are the resource's rather than the schema's.
         *     `{"is_default": false}` is 409 `client-default`: an environment always has
         *     one default, and the way to stop being it is for another client to become
         *     it. A write the partial unique index refuses is 409 `conflict` rather than a
         *     500 — the backstop for a swap interleaved with a delete. And a `kind` change
         *     away from `web` clears the secret, which is 200 with `has_secret: false`.
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
         * @description A new secret for a `web` client, returned once. No body, no overlap window.
         *
         *     The previous secret stops authenticating at `/oauth/token` immediately. On a
         *     `spa` or `native` client it is 409 `client-not-confidential` and nothing is
         *     minted — a public client has no secret to lose.
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
         * @description All twelve rows of the environment, kind by kind, `en` before `pl`.
         *
         *     A list of fixed size is still a list (management-api.md §OpenAPI): the
         *     envelope is the same `{items, next_cursor}` every other listing here
         *     answers, `next_cursor` is null on the only page there will ever be, and
         *     `limit` and `cursor` are accepted and ignored — a generated client that had
         *     to special-case one listing of the surface would be worse off than one
         *     reading a null it expects.
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
         * @description email.md §Variables, machine-readable, for the editor to render.
         *
         *     A singleton document rather than a list: there is nothing to seek and
         *     nothing to page, and an `items`/`next_cursor` envelope around a description
         *     of a table would be pagination with no pagination in it (management-api.md
         *     §OpenAPI).
         *
         *     Environment-scoped because two of the samples are the environment's own —
         *     `app_name` is its App's name and `link` is built on its issuer — and served
         *     from `apps.email.engine`'s own table, the one the validator walks and the
         *     renderer binds, so the console never holds a second copy of the spec's
         *     table. Samples are the `all` set, written in the environment's default
         *     locale: the editor shows what a variable stands for, and `POST …/render`
         *     is where the two sample sets are chosen between.
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
         * @description The whole template, validated by the engine that renders it.
         *
         *     A `PUT` rather than a merge patch because a subject and the body it belongs
         *     to are one edit: a message half-written by one request and half by another
         *     is one nobody composed. The row stops being a default, which is what makes
         *     `reset` meaningful and what promotion (`environments.md`) keys off.
         *
         *     Everything email.md §"Template language" refuses is a `422` naming the
         *     construct and the line it sits on — the console renders it in the editor at
         *     that line — and all of the problems at once, so fixing a template is not one
         *     round trip per mistake.
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
         * @description The stored row — or a draft — rendered with the sample values. Nothing is sent.
         *
         *     `email_templates:read` alone, so a `viewer` keeps a working preview of a
         *     template they may not edit. Nothing is written and no message is enqueued:
         *     this is `apps.email.engine.render_source`, the same function a send goes
         *     through, with the sample context in place of a recipient's.
         *
         *     A field present in the body replaces that column for this render only, so a
         *     console that has edited the HTML previews it against the saved subject
         *     without echoing back what it did not touch. The draft is validated exactly
         *     as a write would validate it — the preview of an invalid template is the
         *     `422` that explains why it cannot be saved — and validation renders *every*
         *     sample set, so which one this request asked for cannot make the preview and
         *     the validator disagree.
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
         * @description The shipped file back, and `is_default` true again.
         *
         *     The shipped copy, not the copy this environment started with: a default
         *     that has been improved since the App was created is the one a reset
         *     restores, which is the same rule the data migration that rewrites unedited
         *     rows follows (email.md §"Kinds, locales and defaults").
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
         * @description Every provider configured for this environment, by kind. Never a client secret.
         *
         *     Configured, not enabled: a provider switched off still appears, because the
         *     credentials are still there and "off" is a state a person chose rather than
         *     the absence of a row. Not paginated — there are four possible rows and no
         *     fifth — so `next_cursor` is always null, the arrangement `GET …/signing-keys`
         *     already has.
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
         * @description One provider's configuration, without its client secret — absent from this shape, not null.
         *
         *     404 when this environment has not configured that kind. `client_secret_set`
         *     and `client_secret_updated_at` are everything this API will ever say about
         *     the value, including immediately after the `PUT` that wrote it.
         */
        get: operations["read_identity_provider"];
        /**
         * Configure an identity provider
         * @description Create or replace this environment's configuration for `kind`.
         *
         *     `client_secret` is write-only and **optional: omitting it keeps the stored
         *     one**. That is not a shortcut, it is the only workable shape — the value is
         *     never readable, so a client flipping `enabled` cannot send it back, and
         *     demanding it would make a customer mint a fresh secret at their provider in
         *     order to turn a button off. Omitted on the *first* write for a kind it is 422
         *     `validation-error` on `client_secret`. Sent with a value different from the
         *     stored one it **rotates**: the previous secret keeps completing token
         *     exchanges for 24 hours, and `identity_provider.secret_rotated` is audited
         *     beside the `.updated`.
         */
        put: operations["put_identity_provider"];
        post?: never;
        /**
         * Delete an identity provider
         * @description Remove the configuration. The identities it authenticated are **kept**.
         *
         *     409 `provider-in-use` while any identity of that provider exists in the
         *     environment, naming how many; `?force=1` proceeds. This one asks because the
         *     consequence is not ours to absorb: a person whose only credential was that
         *     provider stops being able to sign in the moment the button disappears, and
         *     `social-login.md` §"Management API" says so. Nothing about the identities
         *     changes either way — `S9-05`'s unlink is how an identity goes away on purpose,
         *     and it is the operation that enforces "never leave a User unable to sign in".
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
         * @description The environment's permissions by name — the platform's 31 and the customer's.
         *
         *     `?system=true` is the reserved set and `?system=false` the customer's own.
         *     `q` is a case-insensitive substring of `name` (management-api.md
         *     §Conventions "Search"; Q3-59). Every filter is named to `paginate` as well
         *     as applied.
         */
        get: operations["list_permissions"];
        put?: never;
        /**
         * Create a permission
         * @description A customer permission. The reserved namespace is refused, not shared.
         *
         *     A name whose resource half is one of the eighteen reserved resources is 422
         *     `reserved-permission` — `users:export` as much as `users:read` — so nothing
         *     a customer writes can ever mean what a management permission means
         *     (rbac.md §Permissions).
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
         * @description Copy the sandbox's configuration onto its production sibling, in one transaction.
         *
         *     Settings, branding, permissions, app-scoped roles and the twelve email
         *     templates — never a User, a Tenant, a Client, an ApiKey or a SigningKey,
         *     which is what lets a promoted App keep working with the credentials its
         *     callers already hold (environments.md §Promotion).
         *
         *     `{"dry_run": true}` computes the identical diff, applies nothing and emits
         *     no audit event; the real call writes exactly one `promotion.applied` on the
         *     **production** environment, including when the diff is empty because
         *     nothing has changed since the last promotion.
         *
         *     Authorised twice. `settings:write` at account scope opens the endpoint;
         *     then every section of the computed diff that is not empty must be one the
         *     caller could have written directly — `branding:write`,
         *     `email_templates:write`, `permissions:write`, `roles:write` — or the answer
         *     is 403 `insufficient-permission` naming all of the ones lacking, with
         *     nothing written and no audit event. A dry run is authorised identically, so
         *     it reports the refusal an apply would have given rather than a diff the
         *     caller could not have had.
         *
         *     One column is more than a value. A diff moving `tenant_mode` to `single`
         *     runs the preconditions the settings `PATCH` runs — 409
         *     `tenant-mode-switch-blocked` while production holds another Tenant, 409
         *     `tenant-mode-backfill-pending` while an earlier sweep is in flight — and
         *     queues the membership backfill when it is allowed. A dry run reports those
         *     refusals too, because a rehearsal that omitted them would be a rehearsal of
         *     a different request.
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
         * @description The environment's **app-scoped** roles by slug (rbac.md §API).
         *
         *     Tenant-scoped roles are listed under the tenant that defines them, at
         *     `GET T/roles`, because that is the only place they are assignable.
         *
         *     `q` is a case-insensitive substring of the slug or the name
         *     (management-api.md §Conventions "Search"; Q3-59).
         */
        get: operations["list_roles"];
        put?: never;
        /**
         * Create an app-scoped role
         * @description A role assignable in every tenant of the environment.
         *
         *     The slug is unique across scopes, so a slug a tenant already defines is 409
         *     `role-slug-conflict` — a token's `roles` array names exactly one role, and
         *     two roles with one slug would make it mean two things.
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
         * @description Break glass: every session and every refresh token in the environment.
         *
         *     security-baseline.md §"Signing key compromise" pairs this with a
         *     `retire_immediately` rotation — the rotation stops the leaked key verifying,
         *     this stops everything it signed being refreshed into something new. Access
         *     tokens already issued run to `exp`, which is why customers who need an
         *     immediate cut-off keep `access_token_ttl` short.
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
         * @description The environment's definitions by key — at most 50 of them (§Limits).
         */
        get: operations["list_setting_definitions"];
        put?: never;
        /**
         * Create a setting definition
         * @description A new definition. `key` and `type` are fixed here, forever.
         *
         *     Constraints that do not fit the type, or a default that does not satisfy
         *     them, are 422 `validation-error` naming the field; a key the environment
         *     already defines is 409 `setting-exists`; the 51st definition is 422
         *     `limit-exceeded` (user-settings.md §Model, §Limits).
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
         * @description Remove the definition and every value written under it (§Model).
         *
         *     The value count the console's confirm dialog names is `value_count` on the
         *     `GET` before this — the delete itself is unconditional.
         */
        delete: operations["delete_setting_definition"];
        options?: never;
        head?: never;
        /**
         * Change a setting definition
         * @description Constraints, default, access, label, description — never key or type.
         *
         *     The immutable pair is refused as `immutable` by the schema. Narrowing a
         *     constraint re-validates nothing retroactively: values already written stay
         *     readable and fail their *next* write (user-settings.md §Model). The
         *     definition's own default is the one value checked now, because it is part
         *     of the row this request writes.
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
         * @description Every definition's answer for this user, `hidden` included.
         *
         *     The operator surface, so nothing is filtered by `access` — visibility
         *     levels bind what the *user* sees on the public surface, not what
         *     `settings:read` sees here (user-settings.md §API). One row per definition,
         *     each carrying the stored value or the default; at most 50 rows (the
         *     definitions cap), so `next_cursor` is present and always null, exactly as
         *     `EmailTemplateList` answers, and `limit` and `cursor` are accepted and
         *     ignored.
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
         * @description One value, validated against the definition at this write — every write is.
         *
         *     `hidden` and `user_visible` are as writable here as `user_editable`: the
         *     access level says what the user may do on the public surface, and the
         *     operator surface is the one place an operator-only setting can be written
         *     at all. A value the constraints refuse is 422 `validation-error` naming
         *     `value`, including a value over the 1 KB serialized cap (§Limits) and a
         *     value refused by constraints narrowed after it was first written.
         */
        put: operations["put_user_setting"];
        post?: never;
        /**
         * Clear one user's setting
         * @description Remove the stored value so the default answers again (user-settings.md §API).
         *
         *     Gated and scoped exactly as the `PUT`: `settings:write`, definition and
         *     user both resolved inside the path's environment. Clearing a value never
         *     written is the same 204 — "unset" holds either way.
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
         * @description Every key of the environment, ordered `active`, `next`, `retired`.
         *
         *     Not paginated: the ordering sessions-and-tokens.md §API fixes is by status
         *     rather than by a column a keyset seek could resume from, and the row count
         *     is bounded by one `active`, one `next` and the retired keys still inside
         *     their retention window — `signing_keys.prune` deletes the rest once a
         *     minute. `next_cursor` is returned all the same, and always `None`, because
         *     management-api.md §OpenAPI gives every list on this surface one shape.
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
         * @description Promote `next` to `active`, retire the old `active`, pre-announce a new `next`.
         *
         *     One transaction in the service, and one `signing_key.rotated` event carrying
         *     the three kids. The body is optional — a plain `POST` with no body is the
         *     ordinary rotation — and `{"retire_immediately": true}` is the compromise
         *     case: the previously active key is deleted rather than retired, so it leaves
         *     JWKS at once and everything it signed stops verifying as caches refresh.
         *
         *     The 200 is the three states *after* the rotation, read back from the
         *     database rather than assembled from the service's return value, so what a
         *     caller sees is what `GET …/signing-keys` and `/.well-known/jwks.json` will
         *     say the moment it asks.
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
         *     In `single` mode the default tenant is **excluded**: it is hidden there, it
         *     is never a selection step, and a console page listing it would offer a row
         *     the product says does not exist (tenants-and-membership.md §"Tenant modes").
         *     That exclusion is not a caller's filter and so is not in the cursor's
         *     fingerprint — the environment already is, through the resolved path.
         *
         *     `q` is a case-insensitive substring of the name or the slug
         *     (management-api.md §Conventions "Search"; Q3-59). Both filters are named
         *     to `paginate` as well as applied, so a cursor issued for `?status=suspended`
         *     cannot be presented against the unfiltered listing and seek at a position
         *     that means something else there.
         */
        get: operations["list_tenants"];
        put?: never;
        /**
         * Create a tenant
         * @description A tenant with no members.
         *
         *     An administrator creating a tenant is not joining it — "a tenant may have
         *     zero members" is the spec's own sentence — so unlike the hosted workspace
         *     form this writes one row and one event.
         *
         *     Three refusals are the resource's rather than the schema's: `single` mode is
         *     409 `tenant-mode-single`, `default` and `kleora` are 409 `slug-reserved`
         *     naming the field, and a slug someone else holds is 409 `slug-taken`.
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
         *     Newest first because that is the order a console reads them in: the person
         *     who just signed up is the one somebody is looking for.
         *
         *     `erased` users are absent unless `status=erased` asks for them
         *     (users-and-credentials.md §"Deletion and erasure"), which is why the
         *     default is not "no filter" but "every status but that one".
         *
         *     `session=active` is the people holding at least one live session — the same
         *     three predicates the overview's `totals.active_sessions` counts and the
         *     per-user session listing shows, because all three call
         *     `sessions.live_sessions` (C8-17). It selects **users**: somebody signed in on
         *     three devices is one row here and 3 in that count, so the two numbers may
         *     differ and neither is wrong.
         *
         *     Every filter is named to `paginate` as well as applied, so all six are in
         *     the cursor's fingerprint: a cursor issued for `?status=blocked` cannot be
         *     presented against the unfiltered listing and seek at a position that means
         *     something else there. The `tenant_id` in that fingerprint is the *effective*
         *     one, so a `tenant_member`'s cursor is bound to its own tenant as well.
         */
        get: operations["list_users"];
        put?: never;
        /**
         * Create a user
         * @description A user an administrator made, rather than one who signed up.
         *
         *     The difference from `/signup` is the one `security-baseline.md` §"No
         *     enumeration" draws: this surface is not the hosted one, the caller already
         *     holds `users:write` over the environment, and an address that is taken is
         *     answered as 409 `email-taken` rather than as a page that looks like a
         *     success.
         *
         *     `password` is optional — omitted, the user has no password identity until a
         *     reset creates one, and `has_password` says so. It is never echoed: the 201
         *     is the User resource and nothing else.
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
         * @description Always erasure; the row is never removed (users-and-credentials.md).
         *
         *     `?erase=true` is accepted and has no additional effect: every user has at
         *     least a `user.created` event, so a "hard delete when there is no history"
         *     branch is unreachable, and `Invitation.invited_by` and `ApiKey.created_by`
         *     are `PROTECT` references that would make it fail unpredictably.
         *
         *     Irreversible. The identifying columns are overwritten rather than copied
         *     aside, the credentials and memberships are deleted, and the audit trail —
         *     which still names the id — is the only thing left that says the person was
         *     ever here.
         *
         *     Refused with 409 `last-owner` while the user is the last active owner of an
         *     Account's tenant: erasure takes every membership with it, and that one must
         *     not go.
         */
        delete: operations["delete_user_operation"];
        options?: never;
        head?: never;
        /**
         * Change a user
         * @description A merge patch over the user's own profile. Never a password, never a status.
         *
         *     An `email` change is the one that does more than it says: the address has to
         *     be free in this environment, `email_verified_at` goes back to null, and a
         *     fresh verification link is mailed — all three suppressed by
         *     `email_verified: true` in the same patch, which is how an administrator says
         *     "I know this address is theirs".
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
         * @description Stop the user signing in, and cut off everything already signed in.
         *
         *     One transaction: the status, every live session, and every refresh token
         *     hanging off them (sessions-and-tokens.md §Revocation). A blocked user's next
         *     login answers exactly as a wrong password does, and a refresh with an
         *     outstanding token answers `invalid_grant`.
         *
         *     The body is optional and carries one field, `reason` (C8-42): a note of up
         *     to 200 characters saying why, stored on the row alongside `blocked_at` and
         *     the principal that asked, and repeated in `user.blocked`'s `data.reason` as
         *     it always was. A plain `POST` with no body is the ordinary block, so nothing
         *     that called this before has to change.
         *
         *     Idempotent: blocking a blocked user is 200 with no second event — and
         *     therefore does **not** overwrite the reason a first block recorded. To
         *     change it, unblock and block again; the audit trail then carries both.
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
         * @description What this user has approved a device or agent to do as them, newest first.
         *
         *     device-grant.md §"Living with the grant afterwards": "Every approval creates
         *     a named authorization the user can see: the client's name, when it was
         *     approved, when it was last used, and from where." A credential that runs
         *     where the person is not looking is acceptable only because of this list and
         *     the `DELETE` beside it.
         *
         *     Ended rows are **not** hidden. Somebody who did not approve a thing has to be
         *     able to discover that it happened, so an authorization that was revoked or
         *     that expired stays here saying which — what the list must not do is show one
         *     of those as live.
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
         * @description Revoke it: the Session it opened, and every refresh token of that Session.
         *
         *     device-grant.md §"Living with the grant afterwards": "Revoking it is one
         *     action." That action is `apps.identity.services.device.revoke`, which is
         *     `sessions.revoke_session` plus the `device.revoked` event naming the client —
         *     so this never disagrees with `DELETE …/sessions/{id}` about what a revoked
         *     Session is. Access tokens already minted run to `exp`
         *     (sessions-and-tokens.md §"Revocation semantics"); what stops immediately is
         *     the credential's ability to renew itself.
         *
         *     204, and idempotent: a second call finds the row already dead, writes no
         *     second event and answers the same. An id that is not this user's — or not a
         *     UUID — is the 404 a missing row gets, the same way the session routes answer.
         *
         *     409 `conflict` for the row deleted under the write, which is the same race
         *     `DELETE …/sessions/{id}` documents: `identity.sessions.prune` and user
         *     erasure both remove Session rows.
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
         * @description Everything Kleora holds about one person, as one document.
         *
         *     users-and-credentials.md §Export and security-baseline.md §"Data
         *     protection": the user record, the identities without their secrets, the
         *     factors without their seeds, the memberships, the sessions and the audit
         *     events where this user is actor or target — newest first, capped at
         *     `EXPORT_AUDIT_CAP` with `audit_events_truncated` saying so rather than the
         *     cap being applied silently.
         *
         *     `no_store` because this is a subject access request rendered as JSON: not a
         *     shown-once secret, but not a document any intermediary should be keeping a
         *     copy of either.
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
         * @description Which providers this user can sign in with, oldest link first.
         *
         *     The provider identities only. A password is not one of them — `has_password`
         *     on the user resource is that fact, and this resource holds exactly the rows
         *     the `DELETE` beside it can remove.
         *
         *     `provider_email` is what the provider claimed about the person, kept for
         *     display and for audit and **never** read as an authorisation input: no
         *     identity on this platform is ever attached to a user on the strength of an
         *     address, however verified a provider says it is. It is blank on a row an
         *     administrator linked, because in that case no provider claimed anything.
         *
         *     Not paginated in effect: a user holds at most one identity per provider, so
         *     `next_cursor` is always null.
         */
        get: operations["list_user_identities"];
        put?: never;
        /**
         * Link a provider account to a user
         * @description Attach a provider account to this user, **by subject**.
         *
         *     `provider_subject` is the provider's own immutable id for the person — never
         *     an email address. Nothing here resolves a user from a claimed address, which
         *     is the rule that keeps a provider account from walking into somebody else's
         *     account: the email a provider hands us says nothing about who owns the
         *     mailbox, and this platform never treats it as though it did.
         *
         *     201 with a `Location` when the link is new. **200 when that subject is already
         *     on this user**, with the row as it stands and no second audit event — a repeat
         *     of the same request is not a second link, so the log should not claim it was.
         *
         *     409 `provider-already-linked` when the subject belongs to **another** user of
         *     this environment. It is never moved: one provider account is one user's, per
         *     environment, and two records that turn out to be one person are a merge, which
         *     is a separate operation with its own consent.
         *
         *     The row records no claimed address and no verified flag — an administrator is
         *     not a provider and nothing here should read as though one had spoken. A later
         *     sign-in through that provider fills both in.
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
         * @description Remove one linked provider account. **Never the user's last way in.**
         *
         *     409 `last-credential` when, after the removal, the user would hold neither a
         *     password, nor another linked provider, nor a confirmed passkey. A passkey
         *     counts because it can start a sign-in; an authenticator app does **not** —
         *     a second factor cannot begin one, so a user left holding only that is locked
         *     out of their own account with a working authenticator in their hand. The
         *     remedy the refusal names is to set a password first, the same wording an
         *     administrative password set uses.
         *
         *     **The sessions that provider opened are ended, and no others.** Somebody
         *     tidying up a link they no longer use is not signed out of everything; somebody
         *     removing a link because that provider account was compromised has every
         *     session it authenticated cut off. A session's `amr` is what tells those two
         *     apart, which is why it records the provider rather than a generic value.
         *
         *     Refused with 409 `last-credential` before anything is written, so nothing about
         *     the user changes on the refusal.
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
         * @description Fold `source_id` into this user, and erase the source. **Irreversible.**
         *
         *     The user in the path is the **winner**: it keeps its own `email`, `name`,
         *     `picture_url` and `locale`, because merging repairs how somebody signs in and
         *     never decides who they are. The user named in the body is erased, exactly as
         *     `DELETE …/users/{id}` erases, with a `merged_into` pointer to the winner — so
         *     `GET` on the old id keeps answering and says where the person went, for ever.
         *     That is the deliberate price of the rule below.
         *
         *     In one transaction: the source's provider identities move (and its password
         *     only if the winner has none); its memberships move, and where both hold a
         *     membership of one tenant the roles become the union and the source's row is
         *     removed; its passkeys move, and a TOTP or a recovery set only onto a winner
         *     holding none of that kind; its per-user setting values move for the keys the
         *     winner has none; `metadata` is shallow-merged with the winner winning a
         *     collision; and **every session on both sides is revoked**, because a live token
         *     carries a `sub` that is about to stop being the right one.
         *
         *     **No audit event is ever rewritten.** The source's history keeps naming the
         *     source id — that is what an audit log is for — and the merge is recorded as
         *     `user.merged` on the winner, with a count per category, beside `user.erased`
         *     on the source.
         *
         *     Refusals: 422 `same-user`, 409 `user-erased` for either side, and 409
         *     `last-owner` when the source is the last active owner of an Account's tenant.
         *     A `tenant_member` never reaches it at all.
         *
         *     **A `source_id` in another environment is a 404**, like any id this caller
         *     cannot see, and deliberately not a refusal of its own: a distinct answer would
         *     confirm that the id exists somewhere they have no access to.
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
         * @description Every factor of the user's — confirmed and unconfirmed alike.
         *
         *     **Never plan-gated**, and for a reason that is not obvious from this
         *     operation alone: it is the **only** route on this surface that hands out
         *     another user's `MfaFactor` id, and `DELETE …/users/{uid}/mfa/{factor_id}`
         *     needs one. The user export carries a factor's kind and timestamps
         *     (`api.management.v1.schemas.ExportFactor`) and deliberately no id, so there
         *     is no second source. Gating this while leaving the reset open would make
         *     the reset unreachable — an ungated exit behind a locked door.
         *
         *     So the line P6-15 draws is: reading or resetting **one named user's**
         *     factors, which is what an operator does to get somebody back in, is on
         *     every plan; asking the fleet-wide question — `?mfa=` on the users
         *     listing — is `pro` and above. See `delete_user_mfa_factor` below for the
         *     whole argument.
         *
         *     Not paginated: this platform never holds more than two rows per user (one
         *     `totp`, one `recovery`), the same reason the signing-key list gives.
         *     "Never seeds or hashes" (`mfa.md` §API) — `_mfa_factor_body` is the only
         *     thing this endpoint reads a row through, and it has no seed or hash to
         *     leave off because it never asks for one.
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
         * @description Remove the user's factors and send the `mfa_removed` notice.
         *
         *     Removing either kind removes both (`mfa.md` §"Administrative reset"), so
         *     the id in the path only has to name *a* factor of this user's — the same
         *     404-not-403 shape `_target_session` gives a foreign id, so an id from
         *     another user or another environment reveals nothing. Existing sessions are
         *     not revoked by this action; under `required` the next login forces
         *     re-enrolment.
         *
         *     **Never plan-gated, on any plan.** billing.md §Plans, billing.md §"What is
         *     gated" and mfa.md §"What a plan gates" all put "fleet MFA management /
         *     administrative reset" behind `pro`, and P6-15 first implemented that. It
         *     was removed on review, and the reason belongs here rather than in a commit
         *     message, because the next person tidying gates will match on the resource
         *     name and re-add it.
         *
         *     mfa.md §"Failure modes" says, of a user whose recovery codes are exhausted
         *     and whose device is lost: "**Administrative reset is the only path**; the
         *     page says so." Gating this route therefore withholds nothing from *our*
         *     customer — it permanently locks out **their** end user, a person who never
         *     agreed to anything with us and cannot even find out why. That is the exact
         *     outcome billing.md §"The rule everything else bends around" exists to
         *     forbid, and it is the rule P6-11 established, P6-12 upheld in metering,
         *     P6-14 proved through a day-60 OAuth flow and P6-15 proves for passkeys. A
         *     lockout we cause, on a path the spec calls the only one, is a worse outcome
         *     than an ungated feature on a free plan.
         *
         *     The three documents are describing *fleet MFA management at scale* as a
         *     paid capability and sweeping this route up with it by resource name.
         *     Administering users' MFA at scale is reasonably paid — the `?mfa=` filter on
         *     the users listing still is. Being the sole exit from a lockout is not.
         *     `tests/test_plan_gates.py` pins this with a test whose whole job is to say
         *     so.
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
         * @description A new password without the old one, and everything it protected cut off.
         *
         *     204, deliberately: the password is not echoed, and there is nothing else
         *     this operation has to say that a `GET` does not already answer. Every
         *     session and refresh family of the user is revoked and a `password_changed`
         *     message is sent, because a password somebody else chose is a thing the
         *     person has to be told about.
         *
         *     Account or environment scope only — a `tenant_member` is 403
         *     `insufficient-scope` even holding `users:write`, which `@requires` decides
         *     before this runs.
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
         * @description Mail the same `reset_password` link the hosted `/forgot-password` sends.
         *
         *     Through `passwords.request_reset`, which is the point: the link, the token's
         *     lifetime, the invalidation of earlier unused ones and
         *     `password.reset_requested` are one implementation, so an administrator's
         *     send and a visitor's cannot drift apart. A blocked user gets the event and
         *     no message, for the reason that service gives — a blocked account is not
         *     helped by an invitation to try.
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
         * @description Mail the `verify_email` link, under the per-user send budget.
         *
         *     An address that is already verified is a no-op: `{"sent": false}`, no
         *     message, and no slot of the budget spent. users-and-credentials.md wants it
         *     to "still report success", which a 200 is; what it must not do is charge
         *     somebody's mailbox budget for a message nobody sent, because that is how
         *     five real sends become four.
         *
         *     One status and one shape, with `sent` carrying the difference —
         *     `{"sent": true}` means exactly "one went out", so a caller can tell the two
         *     apart without reading `email_verified_at` back, and a generated client has
         *     a single response type to unwrap. (Ruled in review of P2-10; the spec will
         *     say so.)
         *
         *     The budget is `apps.identity.throttles`, and it is **one** budget: this
         *     endpoint, `…/send-password-reset` and the hosted resend form all spend the
         *     same windows, because the rule protects somebody's mailbox from us and a
         *     mailbox does not care which endpoint asked.
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
         * @description The user's browser sessions, newest first, live ones only by default.
         *
         *     "Live" is the four conditions of sessions-and-tokens.md §"Browser session"
         *     read as a query: not revoked, before `expires_at`, and inside
         *     `session_idle_ttl` of `last_seen_at`. The fourth — the User is active — is
         *     fixed for this listing, and a blocked user has no live session left anyway,
         *     since blocking revokes them all. The three that are columns are
         *     `sessions.live_sessions`, shared with the overview's `active_sessions` count
         *     and with the Users list's `?session=active` so the three cannot drift apart.
         *
         *     `include_expired` is in the cursor's fingerprint, so a cursor issued for the
         *     live listing cannot be presented against the full one and seek at a position
         *     that means something else there.
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
         * @description End every live session of the user, and every refresh token with them.
         *
         *     The count is what was live at the moment of the call, so a second call
         *     answers `{"revoked": 0}` — the end state the caller asked for is the end
         *     state, and the log distinguishes the two through the `session.revoked`
         *     events the first one wrote.
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
         * @description Revoke the session and its refresh tokens. 204, and idempotent.
         *
         *     A session id that is not this user's — or not a UUID at all — is the same
         *     404 a missing row gets (sessions-and-tokens.md §"Failure modes"). A repeat
         *     on an already revoked session is 204 as well and writes no second event:
         *     the row is in the state the caller asked for.
         *
         *     409 `conflict` when the row is deleted between this handler's lookup and the
         *     service's write — `identity.sessions.prune` and user erasure both remove
         *     Session rows, so the PATCH-vs-DELETE race is a real one here.
         *     `sessions.revoke_session` writes through `save_or_conflict`, and the API's
         *     own `StaleRow` handler answers it; nothing is caught in this handler.
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
         * @description Zero `failed_login_count` and `locked_until` (security-baseline.md §API).
         *
         *     The only lever there is over progressive lockout: expiry of `locked_until`
         *     does not reset the count, so somebody nineteen failures in is one failure
         *     from an hour until a success, an unlock, or a completed reset says
         *     otherwise. Blocking is a different state and is untouched.
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
         * @description The environment's endpoints, newest first.
         *
         *     `?enabled=` narrows to endpoints in that state, and `?event_type=` to
         *     endpoints subscribed to that one type — the same `array-contains` lookup
         *     the model's GIN index exists for. Both are named to `paginate` as well as
         *     applied, so a cursor issued under one filter cannot be presented against a
         *     different one and seek at a position that means something else there.
         */
        get: operations["list_webhook_endpoints"];
        put?: never;
        /**
         * Create a webhook endpoint
         * @description An endpoint subscribed to `event_types` — empty by default, never a wildcard.
         *
         *     The `201` carries the full secret, once, under the shown-once rules —
         *     `no_store` on the response and nothing that could show it again. A URL
         *     that is not `https://`, does not resolve, or resolves to a private or
         *     reserved address is 422 `webhook-url-rejected`, naming why
         *     (webhooks.md §SSRF). An `event_types` entry outside the published
         *     catalogue is 422 `invalid-event-type`, naming every offending one. And an
         *     Environment already holding as many endpoints as the App's plan allows is
         *     422 `limit-exceeded` naming the number (billing.md §Plans) — a *creation*
         *     refusal only: endpoints already registered keep delivering after a
         *     downgrade, exactly as tenants over the limit keep serving.
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
         * @description A merge patch. Never the secret — there is no field here that could carry it.
         *
         *     `{"enabled": false}` disables the endpoint and audits
         *     `webhook_endpoint.disabled` rather than the generic `.updated`
         *     (webhooks.md §API); `{"enabled": true}` re-enables one, whether a person
         *     or the seven-day failure sweep (P6-08) turned it off, and clears
         *     `disabled_at`/`disabled_reason`.
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
         * @description A new secret, returned once. The previous one keeps verifying for 24 hours.
         *
         *     webhooks.md §Signature: rotating without an overlap breaks a customer's
         *     handler between our rotation and their deploy, so the row keeps both
         *     ciphertexts until `previous_secret_expires_at`, which this response
         *     reports.
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
         * @description A representative payload of `event_type`, marked `test: true` on the envelope.
         *
         *     So that wiring up a handler does not require provoking a real password
         *     reset to see one arrive (webhooks.md §"Trackable and debuggable"). `202`,
         *     not `200`: the event is written and its dispatch scheduled, but whether it
         *     reaches this endpoint's own HTTP handler is a fact of delivery
         *     (P6-08), not of this request.
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
         * @description The environment's webhook events, newest first — the feed across every
         *     endpoint, or one endpoint's own delivery log with `?endpoint_id=`.
         *
         *     Each row's `outcome` is the **worst** among the endpoints the event
         *     reached, not the most recent attempt (webhooks.md §"One event, several
         *     endpoints, one row" — a success arriving after a failure must not paint
         *     the row green and hide the failure behind it); `succeeded_endpoints`/
         *     `total_endpoints` are the counts the console renders beside it. See
         *     `_events_page_items` for how both are computed.
         *
         *     `outcome` as a **filter**, by contrast, matches **any** delivery of the
         *     event, never the row's own summary: an event that failed to one endpoint
         *     and succeeded to another is returned by `?outcome=failed` *and* by
         *     `?outcome=succeeded`, even though only one of those is what its row
         *     displays (webhooks.md: "filtering by outcome matches any delivery of
         *     that event, not the row's summary" — otherwise the filter would hide
         *     exactly what it was opened to find). `_events_with_latest_outcome` is
         *     that predicate. Every filter is named to `paginate` as well as applied,
         *     so a cursor issued under one cannot be presented against a different one
         *     and seek at a position that means something else there.
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
         * @description A `text/event-stream` tail of this environment's webhook events, as
         *     they are written — the transport behind `kleora webhooks forward`.
         *
         *     Each message is the frozen envelope every real delivery carries, with the
         *     event's `id` as the SSE `id`, and a comment keepalive every fifteen
         *     seconds. `event_types` is repeatable and narrows the tail; absent, the
         *     stream carries **every** type in the catalogue, which is the opposite
         *     default from a registered endpoint and deliberately so — a forwarding
         *     session is started by hand and watched by the person who started it.
         *
         *     **Resumption is by event id, and loses nothing.** `after=<event id>` on a
         *     fresh connection, or the `Last-Event-ID` request header a reconnecting
         *     client sends, names the last event already received; the tail resumes
         *     strictly after it, from the durable event log rather than from wherever a
         *     subscription happens to be. Either spelling of the id works — `evt_…` as
         *     the envelope carries it, or the bare UUID. An id this environment does not
         *     hold is `400 invalid-cursor`, because it may have passed out of the
         *     retention window and silently restarting from now would skip whatever
         *     survived it.
         *
         *     This is the one **deviation from management-api.md §Conventions** on the
         *     surface, and it says so rather than bending the convention quietly: the
         *     list surface beside it is cursor-paginated JSON, this is a stream, and the
         *     generated clients cannot consume it — so the CLI hand-writes this one call.
         *     Reading it is reading payloads about the environment's users, so it needs
         *     `webhooks:read` like every other read of this data and not a lower
         *     privilege because it happens to be a stream. Sessions per credential are
         *     capped (`429 too-many-streams`) and a session has a maximum lifetime, after
         *     which the stream closes and the client reconnects with its cursor.
         *
         *     Audited as `webhook_forwarding.started` and `.stopped`, naming who watched
         *     which environment and which types — never the local URL the CLI forwards
         *     to. Forwarding may target production, and this row is the reason that is a
         *     safe answer.
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
         * @description The frozen envelope and every attempt against it, to every endpoint it
         *     reached, newest first.
         *
         *     `outcome`/`succeeded_endpoints`/`total_endpoints` are the same worst-
         *     outcome summary the list computes (`_worst_outcome`, `_endpoint_counts`)
         *     — over every delivery this event ever made, never narrowed to one
         *     endpoint, since a detail page has no `?endpoint_id=` to narrow by. The
         *     `deliveries` array below is unaffected by any of this: it is still every
         *     attempt, to every endpoint, exactly as stored.
         *
         *     `payload.data` reads `{}` for an event about a user who has since been
         *     erased (`apps.webhooks.services.blank_erased_user_events`; webhooks.md
         *     §"Retention, and erasure": the envelope and every delivery outcome survive
         *     erasure, only `data` is blanked) — this returns the row exactly as stored,
         *     so there is nothing further to blank here.
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
         * @description Re-deliver the event's frozen payload, unchanged, to `body.endpoint_id`.
         *
         *     **The same event id is sent — never a new one** (webhooks.md
         *     §"Trackable and debuggable": "a replay that minted a new id would defeat
         *     the consumer's deduplication at exactly the moment they most need it").
         *     `202`, not `200`: this schedules the delivery, it is not the delivery
         *     itself — the same reason the test-send operation above answers `202`.
         *     Audited as `webhook_event.replayed`. A disabled endpoint is 409
         *     `webhook-endpoint-disabled`: scheduling the task anyway would have
         *     `deliver_webhook_event` silently drop it, which would read as nothing
         *     having happened rather than as a clear refusal.
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
         *     The one operation every principal kind reaches, and the only one — besides
         *     `GET /account` — that a suspended Account still gets, so the console can
         *     say why nothing else works (management-api.md §`GET /me`).
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
         * @description `GET /me/device-authorizations` — every agent the caller has approved.
         *
         *     The same `DeviceAuthorizationOut` rows `GET …/users/{uid}/device-authorizations`
         *     answers with, over `own_identity` rather than a path id.
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
         * @description Revoke it, exactly as the administrative route does. 204, idempotent.
         *
         *     `allow_unpaid`, like every other self-service write on this surface: a
         *     dunning block must not stand between somebody and revoking a credential of
         *     their own (billing.md §"When payment fails" gates what costs money, and this
         *     ends something rather than starting it).
         *
         *     `reason` is `logout` rather than `admin` — the person who authorised the
         *     thing is the one ending it (`sessions.Reason`, audit-log.md §Taxonomy).
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
         * @description `GET /me/mfa` — every factor of the caller's, confirmed or not, in the
         *     same `MfaFactorOut` shape `GET …/users/{uid}/mfa` answers with (never a
         *     seed, never a hash).
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
         * @description Verifies `code`, confirms the pending factor, and returns the ten
         *     recovery codes once — the one place on this surface a secret appears in a
         *     body, and it appears once (`mfa.md`'s "shown once" rule, unrelaxed here).
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
         * @description Reauth-gated — enrolment included (see this section's own comment).
         *
         *     `409 mfa-already-enrolled` guards the same thing `api.public.v1.flow.mfa.
         *     enroll_start`'s does: a caller who already holds a confirmed factor
         *     silently replacing it outside the reauth-gated remove flow.
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
         * @description One route for either kind — `management-api.md` §"/me/mfa": "Remove
         *     one, under the same rules self-service follows" — dispatching to
         *     `apps.identity.services.webauthn.remove_credential` for a passkey and to
         *     `apps.identity.services.mfa.remove_factors` (which removes TOTP and the
         *     shared recovery set together) for anything else, each behind its own kind's
         *     removal-refusal rule.
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
         * @description Gated like `start`, and for the reason its counterpart on the issuer
         *     gives: options minted a moment before a downgrade must not complete an
         *     enrolment the plan no longer allows.
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
         * @description `402` on a plan without passkeys — mfa.md §"What a plan gates" names
         *     this route beside `/flow/passkeys/register/start`.
         *
         *     `allow_unpaid=True` and a 402 are not in tension: the annotation exempts
         *     this route from billing.md's day-15 **write block**, which exists to
         *     collect a debt and must never reach somebody's second factor, while this
         *     refusal is the plan not carrying passkeys at all. TOTP and recovery codes
         *     on this surface stay reachable in every billing state and on every plan,
         *     which is the promise that made the exemption necessary in the first place.
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
         * @description `POST /me/password` — the current password, a new one, and no body back.
         *
         *     Reauth-gated like every `/me/mfa` mutation, then throttled, then handed to
         *     `passwords.change_password`. A wrong `current_password` is `401
         *     invalid-credentials` — the same answer a blocked or a locked account gets,
         *     because which of the three it was is not something a caller who does not
         *     already know should learn here — and a new password the environment's policy
         *     refuses is the `422 password-policy` / `password-breached` pair every other
         *     password endpoint answers with.
         *
         *     Every other session of the caller's is revoked and this one survives, so the
         *     console tab the change was made in keeps working (users-and-credentials.md
         *     §"Password change (user-initiated)").
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
         * @description Every `user_editable`/`user_visible` definition, with this user's value or the default.
         *
         *     The console-adoption counterpart of `GET /account/v1/settings` (user-settings.md
         *     §API): same filtering, same value resolution, no `next_cursor` paging
         *     because the definitions cap already bounds it (`UserSettingList` elsewhere
         *     on this surface answers the same way).
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
         * @description One value, validated exactly as `write_value` validates every write.
         *
         *     `404` for a `hidden` or unknown key — indistinguishable, so a write cannot
         *     enumerate hidden keys (the same reason `/account/v1/settings` answers this way);
         *     `403` `setting-not-editable` for `user_visible`, readable above but
         *     operator-written only; `422` `validation-error` for anything the
         *     constraints refuse.
         */
        put: operations["put_my_setting"];
        post?: never;
        /**
         * Clear one of the calling console user's own settings
         * @description Remove the stored value, so the default answers again.
         *
         *     The same access semantics as the `PUT` — `404` for hidden and unknown keys
         *     alike, `403` for `user_visible` — and idempotent: clearing a value never
         *     written is still `204` (user-settings.md §API).
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
         * @description The description, and nothing else — on a reserved permission too.
         *
         *     Re-describing ours is the one edit rbac.md allows a customer to make to the
         *     reserved set, and `ensure_reserved_permissions` is idempotent precisely so
         *     that a later App creation cannot undo it.
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
         * @description One role, at the scope level the role itself decides (rbac.md §API).
         *
         *     A `tenant_member` reads its own tenant's roles here and nothing else: an
         *     app-scoped role, another tenant's role and any permission are all rows of
         *     its environment, so they are 403 `insufficient-scope` rather than 404, and
         *     `GET T/roles` stays the listing that shows it the app-scoped ones.
         */
        get: operations["read_role"];
        put?: never;
        post?: never;
        /**
         * Delete a role
         * @description Remove it from every Member and open Invitation that carries it.
         *
         *     System roles are 409 `system-role`: `owner`, `admin`, `developer`, `billing`
         *     and `viewer` are what the console's own authority is made of, and
         *     `bootstrap_platform` is their only writer.
         */
        delete: operations["delete_role_operation"];
        options?: never;
        head?: never;
        /**
         * Change a role
         * @description `name` and `description`. The slug is refused by the schema as immutable.
         *
         *     Renaming a system role is 409 `system-role`; re-describing one is allowed,
         *     which is the same latitude a reserved permission gets.
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
         * @description The whole set, atomically, and `role.permissions_replaced` with both halves.
         *
         *     Members holding the role carry the new permissions in the next token issued
         *     for them — within `access_token_ttl` for a live token, immediately on the
         *     next refresh. There is no revocation list for access tokens (ADR 0008), so
         *     "immediately" is `sessions:write` (rbac.md §Propagation).
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
         * @description The tenant, its members, its own roles and its invitations, in one transaction.
         *
         *     Sessions bound to it are revoked and unbound rather than deleted. Two
         *     refusals: the environment's default tenant (409 `default-tenant`) and a
         *     tenant an Account is linked to, the Kleora Account's own included (409
         *     `account-tenant`). `platform-protected` is a different rule and does not
         *     reach here — it covers structural changes to the `id` App and its
         *     environments, not the tenants inside them.
         */
        delete: operations["delete_tenant_operation"];
        options?: never;
        head?: never;
        /**
         * Change a tenant
         * @description `name`, `slug` and `metadata`; the last replaced whole.
         *
         *     The default tenant's `slug` is 422 with `code: "immutable"` — it is the
         *     string `single` mode hides the tenant under and the one every other tenant
         *     is blocked from claiming (tenants-and-membership.md §Tenants). So is the
         *     `slug` of a tenant an Account is linked to: it is the Account's slug, which
         *     cannot change either (platform-bootstrap.md).
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
         * @description Every event recorded against this tenant — the `tenant_member`'s endpoint.
         *
         *     It takes no `tenant_id` filter because the path already is one, and no
         *     `environment_id` one because a Tenant belongs to exactly one environment.
         *     Another tenant's id is 404 by containment, whether or not the row exists.
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
         * @description The tenant's invitations in one derived state, newest first.
         *
         *     `status` defaults to `open` (tenants-and-membership.md §API) — the answer to
         *     "who is still waiting", which is what a console panel opens on — and it is
         *     named to `paginate` as well as applied, so a cursor is bound to the filter
         *     it was issued under and cannot be replayed against another one.
         *
         *     `q` is a case-insensitive substring of the invited `email` — the one field
         *     an invitation carries that a support operator would search by
         *     (management-api.md §Conventions "Search"; Q3-59).
         *
         *     The status filter is a query rather than a Python pass, because the status
         *     is derived from three timestamps and a page filtered after the fact is a
         *     page of whatever survived rather than a page.
         */
        get: operations["list_invitations"];
        put?: never;
        /**
         * Invite an address
         * @description Write the invitation and mail the link. The token is in neither answer.
         *
         *     The roles are validated exactly as `POST T/members` validates them — same
         *     resolver, same two failures — and the same two guards run over them: a
         *     `tenant_member` may only offer roles inside its own permission set, and
         *     `owner` in an Account's tenant may only be offered by a member who holds it.
         *     An invitation is a membership that has not happened yet, so a rule that
         *     applied to one and not the other would be a way round it.
         *
         *     Keyed with `Idempotency-Key` like every `POST` on this surface (P2-05), and
         *     the mail is enqueued inside the transaction that writes the row — so a
         *     replayed key replays the stored 201 and sends nothing a second time.
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
         * @description Stamp `revoked_at` so the link stops resolving. Idempotent, and 204.
         *
         *     The row stays and lists under `?status=revoked`: an invitation that was sent
         *     and withdrawn is a thing that happened, and a console that could not show it
         *     would have no answer to "why did that link stop working".
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
         * @description A new token, a fresh seven days, and another mail.
         *
         *     The previous link stops working the moment this returns: the row holds one
         *     token hash and this overwrites it. That is the point of re-sending rather
         *     than sending twice — an invitation that had two live links would be two
         *     invitations, and revoking it would only take one of them away.
         *
         *     Throttled per invitation, one a minute and five an hour
         *     (`apps.tenancy.throttles`), because the budget protects the mailbox of
         *     somebody who is not our user and cannot ask us to stop.
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
         * @description The tenant's members, newest first, with the user and the roles embedded.
         *
         *     `q` is a case-insensitive substring of the user's email or name
         *     (management-api.md §Conventions "Search"; Q3-59) and `role` is a role
         *     slug. All three filters are named to `paginate` as well as applied, so a
         *     cursor is bound to the filter set it was issued under.
         */
        get: operations["list_members"];
        put?: never;
        /**
         * Add a member
         * @description Link an existing User to this tenant, with the roles the body names.
         *
         *     Exactly one of `user_id` and `email`; both or neither is 422. The address is
         *     normalised the way `users-and-credentials.md` normalises one, so the caller
         *     does not have to know the casing the row was written with — and a user who
         *     is not in this environment, or is erased, is 404 `user-not-found` rather
         *     than an invitation this endpoint does not send (that is Phase 3).
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
         * @description Replace the role set, change the status, or both.
         *
         *     `roles` replaces the whole set and emits `member.roles_changed` with `from`
         *     and `to` as slugs; a status move emits `member.suspended` or
         *     `member.unsuspended`. Either can break the Account tenant's `owner`
         *     invariant, and both are refused with 409 `last-owner` when they would.
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
         * @description Every role assignable in this tenant: the app-scoped ones and its own.
         *
         *     The tenant-scoped read of the roles resource, and the only way a
         *     `tenant_member` sees an app-scoped role at all — `GET /roles/{role_id}` is
         *     environment scope (rbac.md §API).
         *
         *     `q` is a case-insensitive substring of the slug or the name
         *     (management-api.md §Conventions "Search"; Q3-59).
         */
        get: operations["list_tenant_roles"];
        put?: never;
        /**
         * Create a tenant-scoped role
         * @description A role this tenant defines for itself, assignable only to its own Members.
         *
         *     The other half of the resource `POST E/roles` writes, and the reason a role
         *     carries a `scope` at all: this one is deleted with the tenant, cannot be
         *     assigned in another tenant of the environment (422 `role-not-assignable`
         *     there), and is the only kind a `tenant_member` may create — under the
         *     escalation guard, which refuses a permission the caller does not itself
         *     hold (403 `privilege-escalation`, rbac.md §"Escalation guard for tenant
         *     members").
         *
         *     The slug is unique across scopes and across the whole environment, so an
         *     app-scoped role's slug is 409 `role-slug-conflict` here and this slug is a
         *     409 for a later `POST E/roles` — while another tenant of the same
         *     environment may define it freely, because a Member sees exactly one of the
         *     two (rbac.md §Roles).
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
         * @description Stop the tenant being selected at login. Idempotent, and only the first writes.
         *
         *     Nothing is revoked: an access token already minted lives out its `exp`
         *     (ADR 0008), and the next token for a session bound to this tenant carries no
         *     `tenant` claim (rbac.md §"Claims at token issuance"). A tenant an Account is
         *     linked to, the Kleora Account's own included, is refused (409
         *     `account-tenant`): suspending it would lock every member out of the Account.
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
         * @description The account endpoint's filters: `environment_id` as well.
         *
         *     Only here, because it is the only endpoint whose scope spans more than one
         *     environment — and omitting it is what asks for every event of the Account,
         *     account-level ones included.
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
         * @description `POST /api/v1/accounts`.
         *
         *     `slug` is optional and derived from `name` when it is absent
         *     (platform-bootstrap.md §"Deriving a slug from a name"). Absent and `null`
         *     mean the same thing here, which they may on a creation: there is no stored
         *     value for `null` to be different from.
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
         * @description `PATCH /api/v1/account` — one property, and one refusal worth explaining.
         *
         *     `slug` is not a field of this schema, so it cannot be written; it is named
         *     in `immutable_fields` so that sending it is answered as what it is rather
         *     than as an unknown key. It is also the Account's tenant slug and the value
         *     `tenant=` carries when the console re-authorises, so renaming it would
         *     invalidate every bookmarked switch URL and every token in flight
         *     (platform-bootstrap.md §"The Account resource").
         *
         *     `plan`, `status` and `tenant_id` are unknown fields on purpose:
         *     they are not properties a caller has any business addressing, and
         *     `extra="forbid"` says so.
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
         * @description The `201` of a creation, and the `200` of `POST …/rotate`: the resource,
         *     plus the full key, once.
         *
         *     Required rather than optional, unlike `ClientCreated`: both operations mint
         *     exactly one credential, so there is always one to carry. These are the only
         *     two responses in the surface that will ever hold it.
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
         * @description `POST /api/v1/environments/{environment_id}/api-keys`.
         *
         *     `extra="forbid"` is the whole of the "not an input field" rule: `prefix`,
         *     `key`, `key_hash`, `status`, `environment_id` and `created_by` are 422 as
         *     unknown fields. The prefix in particular is never a caller's choice — it
         *     follows the environment's kind, which is what makes a `kl_test_` key
         *     structurally unable to reach production (api-keys.md §Format).
         *
         *     The scope rules are not here. They are the resource's — the allowed set is
         *     the reserved permission table minus the account-level half — and they
         *     answer 422 `invalid-scope` rather than `validation-error`, which is a slug
         *     a schema cannot produce.
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
         * @description An API key as every read of it reports it (api-keys.md §API).
         *
         *     `key` is not a field here — absent, not null, in every list and detail
         *     response. `prefix` is what a read shows, and it is what a customer matches
         *     a log line against.
         *
         *     `status` is derived (`revoked_at`, then `expires_at`, then active) rather
         *     than stored: two timestamps already answer the question, and a column would
         *     be a second answer that could disagree with them.
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
         * @description One of an App's two Environments, as the App resource embeds it.
         *
         *     `{id, kind, issuer}` and nothing more — the settings resource is
         *     `GET /environments/{environment_id}` (environments.md §API).
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
         * @description `POST /api/v1/apps`.
         *
         *     `slug` is optional and derived from `name` when absent (apps.md §"The slug
         *     is the issuer"). Absent and `null` mean the same thing here, which they may
         *     on a creation: there is no stored value for `null` to be different from.
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
         * @description One App: the plan it is held to, and what it has used this period.
         *
         *     `mau` sums the App's production Environments — its own figure, which is what
         *     a `pro` allowance is measured against (billing.md §Plans). `plan` is
         *     `effective_plan`'s answer rather than the `plan` column, so a `scale`
         *     Account's `free` App reads `scale`.
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
         * @description An App as every operation on it reports it (apps.md §"App resource").
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
         * @description `PATCH /api/v1/apps/{app_id}` — `name`, and nothing else.
         *
         *     `slug` is not a field of this schema, so it cannot be written; it is named
         *     in `immutable_fields` so that sending it is answered as what it is rather
         *     than as a typo. Both of the App's issuers are derived from it and every
         *     token minted so far claims one of them as `iss`, so a rename would silently
         *     invalidate deployed integrations (apps.md §"The slug is the issuer").
         *
         *     `is_platform`, `account_id` and `environments` are unknown fields on
         *     purpose: the first two are ours and the third is a projection, not a
         *     property, and `extra="forbid"` says so.
         */
        AppPatch: {
            /** Name */
            name?: string;
        };
        /**
         * AppPlanOut
         * @description One App, the plan it is actually held to, and that plan's limits.
         *
         *     The plan is `effective_plan`'s answer, not the `plan` column: an Account on
         *     `scale` holds every one of its Apps to `scale` regardless of what its own
         *     row says (billing.md §"How this looks in the data"), and a response that
         *     reported the column would be telling half of it.
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
         * @description Who acted: `{"kind": …, "id": …}`, with `id` null for `system`/`anonymous`.
         *
         *     `display` names a `user` actor — resolved when the page is read
         *     (audit-log.md §"Naming the actor and the target") — and is absent, not
         *     null, for `api_key`, `system` and `anonymous`: none of them has a name.
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
         * @description Who or what an `actor`/`target` id names, resolved when the page is
         *     read — never captured when the event was written (audit-log.md
         *     §"Naming the actor and the target").
         *
         *     Bounded by `audit:read`, not `users:read`: a name, the email that tells
         *     two people sharing one apart, and the avatar — nothing else a User
         *     resource carries. Every field below is set only when it applies to what
         *     was resolved: `email`, `avatar_color` and `picture_url` never appear on a
         *     tenant's `display`, and nothing but `removed` appears when the id no
         *     longer resolves to any row (a hard-deleted Tenant, mainly — a User is
         *     only ever erased in place and always resolves). The three audit-events
         *     endpoints declare `exclude_unset=True` for exactly this: a field the
         *     resolver did not set is absent from the response, not `null`.
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
         * @description One event, in the shape audit-log.md §API prints it.
         *
         *     `environment_id` and `tenant_id` are nullable for two different reasons and
         *     both are normal: an account-level event (`account.*`, `app.*`) never had an
         *     environment, and deleting an App nulls the column on the events that
         *     described what happened inside it, so the record survives the rows it
         *     names.
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
         * @description The filters every audit endpoint takes (audit-log.md §API).
         *
         *     `from` is inclusive and `to` is exclusive on `occurred_at`, and both are
         *     `AwareDatetime`: an instant without a UTC offset is 422
         *     `validation-error` naming the field, not a value this surface guesses a
         *     zone for (management-api.md §Conventions, "Input timestamps").
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
         * @description What was acted on: the model label and the row's id, never a foreign key.
         *
         *     Present only when the action had a target — `target` is `null` on the
         *     response otherwise, rather than an object with two nulls in it.
         *
         *     `display` names a `user` or `tenant` target the same way `AuditActor`'s
         *     does, and is absent for every other target kind.
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
         * @description `GET /api/v1/account/billing` (billing.md §API).
         *
         *     Plan, limits, usage, status and period end — and `subscription` is `null`
         *     for an Account that has never bought anything, which is most of them.
         *     `pro_apps` is what `quantity` is supposed to equal; the two are reported
         *     separately on purpose, because a disagreement between what we would charge
         *     for and what Stripe is charging for is exactly the drift reconciliation
         *     exists to find, and hiding it behind one number would hide it from the
         *     customer too.
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
         * @description A Stripe-hosted page to send the customer to.
         *
         *     Named for its surface rather than for its shape: `SessionOut` in this
         *     module is a *browser* session (sessions-and-tokens.md), and two things
         *     called `SessionOut` in one generated SDK would be one thing called
         *     `SessionOut` and one called `SessionOut2`.
         *
         *     `url` is a bearer credential for somebody's payment details. It is returned
         *     to the caller that asked for it and is written nowhere else — not to the
         *     audit log, not to a log line, not to a row.
         */
        BillingSessionOut: {
            /** Expires At */
            expires_at: string | null;
            /** Url */
            url: string;
        };
        /**
         * BillingUsageOut
         * @description `GET /api/v1/account/billing/usage` (billing.md §API).
         *
         *     "MAU and App counts for the current period, so a customer can check our
         *     arithmetic" — which is why the period is published as two RFC 3339 UTC
         *     instants rather than as a month name: the window is half-open,
         *     `[period_start, period_end)`, and a customer reconciling against their own
         *     audit log needs the bounds we actually used, not a label they have to guess
         *     the edges of.
         *
         *     `mau` is the Account total, and it is the **sum** of its Apps' figures, not
         *     a distinct count across them. billing.md §Plans: "a person active in two of
         *     a customer's Apps is a user of each, because they are two products" — and a
         *     `User` is environment-scoped (ADR 0005), so the same human in two Apps is
         *     two rows with two ids and there is nothing to deduplicate that would not
         *     mean matching email addresses across Environments.
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
         * @description The principal that blocked a user: `{"kind": …, "id": …}` plus a display.
         *
         *     `display` is `null`, not absent, when there is nobody to name — an
         *     `api_key` blocker (a key is not a person and must not be given a
         *     placeholder name, audit-log.md's rule) or an id that no longer resolves.
         *     That is a deliberate divergence from `AuditActor`, which omits the key
         *     entirely: the audit endpoints can do that because they serialise with
         *     `exclude_unset=True`, and turning that on for `UserOut` would change how
         *     every *other* field of the busiest resource on this surface is serialised.
         *     A `null` here is readable and costs nothing, where that would.
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
         * @description Who `blocked_by` names, resolved when the user is read.
         *
         *     Read time, never write time — audit-log.md §"Naming the actor and the
         *     target" settles this for the audit surface and the reason is identical
         *     here: a name denormalised onto the blocked user's row at block time would
         *     **survive the erasure of the operator it names**. Resolution follows
         *     erasure automatically, so an erased operator shows as one.
         *
         *     Two fields and no more. `users:read` reaches this, and what it is allowed
         *     past is "what identifies a subject" — the name, and the email that tells
         *     two people sharing one apart. Not the avatar, not the picture: this is one
         *     line of prose on a detail page, not a second User resource.
         */
        BlockedByDisplay: {
            /** Email */
            email: string;
            /** Name */
            name: string;
        };
        /**
         * BrandingBackground
         * @description One of the three `background.kind` shapes.
         *
         *     Declared as one model with optional members rather than as a discriminated
         *     union, because the union would put three schemas in the document for a
         *     three-key object and generated clients would name them
         *     `BrandingBackgroundType0`. Which keys each `kind` may carry is a validation
         *     rule, enforced in `branding_validation` and stated in `branding.md`
         *     §Validation — a `solid` background carrying `angle` is a 422 naming
         *     `background.angle` as an unknown field, not a type error.
         *
         *     `from` is a Python keyword, so the field is `from_` with the alias the wire
         *     uses; `populate_by_name` keeps both readable from Python.
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
         * @description The palette: seven required six-digit hex entries, and three optional ones.
         *
         *     `border` is the colour of every control's border: inputs, secondary and
         *     quiet buttons, the strength meter's segments. `null`, or left out, borders
         *     them in `muted`, which is how every page rendered before the key existed
         *     (branding.md §Validation). It is optional because it was added after
         *     2026-09-18, and a key added since then never turns an existing client's
         *     unchanged `PUT` into a `422`. `GET` always carries it.
         *
         *     `on_background` and `success` are the same shape: each is `null` by
         *     default, each names the colour it falls back to, and a record that says
         *     nothing about either renders exactly as it did before that key existed.
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
         * @description `PUT /api/v1/environments/{id}/branding` and `POST …/branding/preview`.
         *
         *     Every top-level key that existed on 2026-09-18 is required — this is a
         *     whole-record replacement and branding.md says partial updates are not
         *     offered — and a key added since may be left out and is stored as its
         *     default. `extra="forbid"` is what makes an unknown key a 422 rather than a
         *     value silently dropped on the way to storage.
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
            /** @description `null` (the default) renders every page in the order hosted-login.md §Pages gives. A document selects and orders the blocks of a covered region: v1 covers `/login`'s form region, whose blocks are `subtitle`, `credentials`, `actions` and `passkey`. `credentials`, `actions` and `passkey` appear exactly once and `credentials` comes before `actions`; `subtitle` is the one block that may be left out. */
            composition?: components["schemas"]["Composition"] | null;
            /** Custom Css */
            custom_css: string;
            /** Favicon Url */
            favicon_url: string | null;
            /** Font */
            font: string;
            /**
             * Icons
             * @description `enabled` (default true), `button` (an icon name or null) and `panel_features` (up to three names). Names come from the curated set in branding.md §Icons. A non-empty `panel_features` needs a split layout with the brand panel.
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
         * @description One of the two `layout.kind` shapes.
         *
         *     Declared as one model with optional members, mirroring `BrandingBackground`
         *     for the same reason — the union would put two schemas in the document for
         *     a three-key object. Which keys each `kind` may carry is a validation rule,
         *     enforced in `branding_validation` and stated in `branding.md` §Validation:
         *     a `centered` layout carrying `side` is a 422 naming `layout.side` as an
         *     unknown field, not a type error.
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
         * @description The stored record, plus when it last changed.
         *
         *     `updated_at` is the Environment's, which is what the compiled-CSS cache key
         *     is built from (branding.md §Behaviour) — a console that has just saved can
         *     compare it and know whether the copy it is holding is the stored one.
         *
         *     `background` and `layout` widen to free-form objects on the way out, and
         *     only here. A stored `{"kind": "solid"}` has to read back as
         *     `{"kind": "solid"}`, and a stored `{"kind": "split"}` as `{"kind": "split"}`
         *     — branding.md test 1 asks for the default record byte for byte after
         *     normalisation, and a `PUT` of the members a typed model would emit beside
         *     them (`from: null`, `side: null`, …) is a 422. The alternative, a
         *     serialiser that drops them, collapses the whole schema to a bare object in
         *     the OpenAPI document (django-ninja generates the response schema from the
         *     serialiser's return type), which would lose the *input* declaration too.
         *     So the input is typed, where the per-`kind` key rule is enforced, and the
         *     output says "object".
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
         * @description The `201` of `POST …/branding/preview` — branding.md §Preview, item 3.
         *
         *     Two fields and no draft echoed back: the console already holds the record
         *     it sent, and the frame's URL is the whole interface (§Preview, rule 8).
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
         * @description `POST /api/v1/account/billing/checkout`.
         *
         *     Two closed sets and a country. In particular **no return URL**: one taken
         *     from the body would be an open redirect with a payment page in front of it,
         *     so it comes from this deployment's own configuration
         *     (`apps.billing.services._return_url`), and **no currency and no price**
         *     either — the caller says where the customer bills from and the server
         *     decides what that costs. A currency in the body would be a client choosing
         *     its own price list.
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
         * @description `POST /api/v1/environments/{environment_id}/clients`.
         *
         *     `extra="forbid"` is the whole of the "not an input field" rule: `client_id`,
         *     `client_secret`, `has_secret`, `environment_id` and `is_default` are 422 as
         *     unknown fields, and `is_default` in particular is settable only by `PATCH`
         *     and only to `true` — a new client is never silently the one the hosted pages
         *     fall back to (clients.md §`POST …/clients`).
         *
         *     The one rule about the arrays that does not depend on the environment is
         *     here: at most `MAX_URIS` entries each, so the bound reaches the OpenAPI
         *     document and a generated client refuses the thirty-third before we do.
         *
         *     The rest of the URI and scope rules are not here: they depend on the *environment*
         *     (`http://localhost` is a sandbox-only value), which a schema cannot see, so
         *     the router checks them against the resolved environment and names the array
         *     index the caller sent.
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
         * @description A Client as every read of it reports it (clients.md §"Client resource").
         *
         *     `client_secret` is not a field here — absent, not null, in every list and
         *     detail response. `has_secret` is the fact a caller actually wants, and it is
         *     derived (`client_secret_hash is not None`) rather than stored.
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
         * @description `PATCH /api/v1/environments/{environment_id}/clients/{client_id}`.
         *
         *     `initiate_login_uri` is the one clearable field: `null` means "this client
         *     names no landing", and the hosted pages then carry no link at all. The two
         *     URI arrays are replaced whole by a merge patch, and `[]` is a valid value
         *     distinct from the `null` neither of them accepts.
         *
         *     `is_default` is a plain `bool`, which is what makes `{"is_default": null}`
         *     answer 422 `field-not-nullable` rather than a type error: the field has no
         *     null state, and a merge patch's `null` would mean the same impossible thing
         *     `false` does. `false` itself passes the schema and is refused by the
         *     resource, as 409 `client-default`.
         *
         *     `client_id`, `client_secret`, `has_secret` and `environment_id` are unknown
         *     fields rather than immutable ones, because the spec answers them that way:
         *     the identifier is not a property a caller addresses at all
         *     (clients.md §"Failure modes").
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
         * @description The `200` of `POST …/rotate-secret`: the resource and the new secret.
         *
         *     Required rather than optional, unlike `ClientCreated`: rotation answers only
         *     for a `web` client, so there is always one to carry.
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
         * @description `composition`: the layout document a record may carry.
         *
         *     Typed rather than the free-form object `icons` is, because the block names
         *     *are* the vocabulary a customer writes against and the generated clients
         *     should name them (ADR 0003). `pages` is a map rather than a model per page
         *     so that a later phase's page arrives without a schema edit; which pages and
         *     regions exist is a validation rule, in `branding_validation` against
         *     `COMPOSITION_REGIONS`, exactly as `layout`'s per-`kind` keys are.
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
         * @description One block of a composed region (branding.md §Composition).
         *
         *     A block is a name Kleora renders and nothing else: no URL, no field name,
         *     no endpoint, no markup and no script. `extra="forbid"` is what makes that a
         *     422 rather than a key quietly stored, and it is the same boundary ADR 0012
         *     drew — a block that could carry markup is customer code wearing a costume.
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
         * @description One approved device authorization (device-grant.md §"Management surface").
         *
         *     `client_name` is the Client's configured name — device-grant.md is explicit
         *     that a person is shown "the client, by its configured name, not its id" —
         *     and `client_id` is beside it because an operator reading a list of them
         *     needs the id the tool actually presented.
         *
         *     `last_used_at` is the authorization's Session's `last_seen_at`: a token
         *     refresh moves it (`apps.identity.services.grants`), so it is the same figure
         *     the session list reports and the one the 90-day expiry measures. It is never
         *     null for a row this endpoint returns — every listed row has a Session — and
         *     is typed nullable only because the column it mirrors is reached through a
         *     nullable relation.
         *
         *     `ip` and `user_agent` are "from where": the address and agent of the browser
         *     that approved it, recorded on the Session the approval opened.
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
         * @description The variables one kind declares, in the order §Variables lists them.
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
         * @description `PUT …/email-templates/{kind}/{locale}` — the whole resource, at once.
         *
         *     Not a merge patch, which is why it is a plain `Schema`: a subject and the
         *     body it belongs to are one edit (email.md §API names all three fields
         *     required), and a template half-written by one request and half by another
         *     is a message no one composed.
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
         * @description `GET …/email-templates` — the twelve rows, in one envelope.
         *
         *     `next_cursor` is present and **always null**. Twelve is a fixed size, not
         *     an exemption: management-api.md §OpenAPI gives every list of this surface
         *     one named `{Resource}List` shape, and a generated client that had to
         *     special-case this one would be worse off than one reading a null it knows
         *     to expect. `limit` and `cursor` are accepted and ignored for the same
         *     reason — the client's list call is the same call here as everywhere.
         */
        EmailTemplateList: {
            /** Items */
            items: components["schemas"]["EmailTemplateOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * EmailTemplateOut
         * @description One `(kind, locale)` row, with its source rather than its rendering.
         *
         *     `is_default` is what the console's "reset" action keys off: true while the
         *     row is byte-for-byte the shipped file, false from the first edit.
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
         * @description The optional body of `POST …/email-templates/{kind}/{locale}/render`.
         *
         *     Every field is optional and each one that is present replaces that column
         *     of the stored row for this render alone: a console that has edited only the
         *     HTML previews its draft HTML against the saved subject without having to
         *     echo back what it did not touch, and a `POST` with no body at all previews
         *     the stored row.
         *
         *     `samples` picks the set email.md §Variables fixes — `all`, or
         *     `without_optional` with the two optional variables empty, which is the
         *     other rendering of a template whose only logic is `{% if support_url %}`.
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
         * @description What a render answers: the message, and nothing about sending it.
         *
         *     `text` and `html` rather than `body_text` and `body_html` — these are the
         *     parts of a rendered message, not the columns of a row (email.md §API).
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
         * @description One row of email.md §Variables, as the console's editor renders it.
         *
         *     `sample` is the value a render substitutes, so an editor can show the
         *     preview's own value beside the name; `optional` marks the ones that render
         *     empty when the setting behind them is unset, which are exactly the ones a
         *     template should guard with `{% if %}`.
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
         * @description `GET …/email-templates/variables` — a singleton document, not a list.
         *
         *     Named as such by management-api.md §OpenAPI: there is nothing to paginate
         *     and nothing to seek, so wrapping the description of a variable table in an
         *     `items`/`next_cursor` envelope would be a pagination shape with no
         *     pagination in it. Environment-scoped because two of the samples are the
         *     environment's own — `app_name` is its App's name and `link` is built on its
         *     issuer — and served from the same table the validator and the renderer
         *     read, never a copy (email.md §API).
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
         * @description `GET /apps/{app_id}/environments` — the same two objects `AppOut` embeds.
         *
         *     `next_cursor` is present and **always null**, exactly as `SigningKeyList`'s
         *     is. The listing is not paginated: an App has exactly two Environments,
         *     always, and they are created and destroyed with it (environments.md §"What
         *     an environment contains"), so a cursor has nothing to resume from. The
         *     envelope is here anyway because management-api.md §OpenAPI makes every list
         *     response a named `{Resource}List` with `items` and `next_cursor`, "never an
         *     inline object" — a bare array is an anonymous response type in every
         *     generated client, and giving this one list a cursor later would then be a
         *     breaking change to a published SDK rather than an additive one.
         *
         *     apps.md §API still describes this endpoint as returning "a bare list"; the
         *     general rule wins and the orchestrator amends the spec (P2-20 §Log).
         */
        EnvironmentList: {
            /** Items */
            items: components["schemas"]["AppEnvironment"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * EnvironmentMauOut
         * @description One Environment's figures for the period.
         *
         *     `mau` is zero for a sandbox Environment always and by construction: nothing
         *     is ever written there (billing.md §Plans, "Sandbox never counts — charging
         *     for testing teaches customers to test in production").
         *
         *     `tenants` is the count the Tenant ceiling is actually applied to. billing.md
         *     §Plans words the row "Tenants, per App" while the check
         *     (`apps.tenancy.services.tenants._check_tenant_limit`) counts per
         *     *Environment*; reporting the number the gate reads is the only way this page
         *     agrees with the `422` a customer would get. Flagged in the P6-12 task Log.
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
         * @description `PATCH /api/v1/environments/{environment_id}` — the settings columns.
         *
         *     The ranges are the model's and the document's at once: declared here, they
         *     reach `/api/v1/openapi.json`, so a generated client refuses an
         *     `access_token_ttl` of 30 before the request is made, and a hand-written
         *     caller that sends one gets 422 with the field in `errors[]` rather than a
         *     500 from the check constraint.
         *
         *     `issuer`, `kind` and `backfill_status` are named in `immutable_fields`
         *     rather than left off: the issuer is stored on this row because every token's
         *     `iss` and every cached JWKS entry names it, `kind` is what a `kl_test_` key
         *     is confined to, and `backfill_status` is a report on work in progress. All
         *     three are plainly properties of the resource, so refusing them as unknown
         *     keys would read as a typo (environments.md §API).
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
         * @description `GET /apps/{app_id}/environments/{environment_id}/stats`.
         *
         *     `computed_at` is when the figures were computed, not when they were asked
         *     for: the answer is cached for 60 seconds, and a console that shows a number
         *     has to be able to say how old it is.
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
         * @description What the environment holds now — current counts, not counts over the range.
         *
         *     `users` excludes erased users, `api_keys` counts active keys only, and
         *     `active_sessions` is the "live" of sessions-and-tokens.md §"Browser
         *     session": each figure is the set its own console page lists, so a number
         *     here and a list there never disagree.
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
         * @description One audit event in the export, in the shape `audit-log.md` reports it.
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
         * @description One Identity in the export — never a secret, only when it last changed.
         *
         *     S9-01a's provider columns join it, all seven, because every one of them is
         *     the person's own data: what a provider claimed about them and when the
         *     identity was linked and last used. A `password` row carries the blank/null
         *     form of each, which is the honest answer rather than an omission.
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
         * @description `POST …/users/{user_id}/identities` — an administrative link, by subject.
         *
         *     `provider_subject` is the provider's own immutable id for the person — Google's
         *     `sub`, GitHub's numeric `id`, Microsoft's `oid`, Facebook's app-scoped `id` —
         *     and **never an email address**. Nothing on this surface resolves a User from a
         *     claimed address.
         *
         *     `extra="forbid"`, which here is a security property rather than tidiness: it is
         *     what makes this endpoint unable to accept a `provider_email` a caller hoped
         *     would be trusted, or a provider token or client secret it hoped would be
         *     stored. A link is a statement about a person; a secret belongs to the
         *     environment's provider configuration and is written through
         *     `PUT …/identity-providers/{kind}` alone.
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
         * @description `GET …/users/{user_id}/identities`, oldest link first.
         *
         *     `next_cursor` is present and **always null**, for the reason
         *     `IdentityProviderList` and `SigningKeyList` give: a User can hold at most one
         *     identity per provider kind, so there are four possible rows and no fifth, and a
         *     generated client that had to special-case one list of this surface is a worse
         *     cost than a member that is always null (management-api.md §OpenAPI).
         */
        IdentityList: {
            /** Items */
            items: components["schemas"]["IdentityOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * IdentityOut
         * @description One provider identity of a User.
         *
         *     Exactly the seven facts social-login.md §"Management API" names, plus the `id`
         *     the `DELETE` addresses it by. `provider_email` and `provider_email_verified`
         *     are **claims**, stored and displayed and never read as authorisation inputs
         *     (§Linking) — a console rendering them is showing what a provider said, which is
         *     the only thing they are for. They are blank and `false` on a row an
         *     administrator created, because no provider said anything.
         *
         *     `provider` is the narrow `IdentityProviderKind` and never `password`: a
         *     password is `UserOut.has_password` and is managed by `POST …/users/{id}/password`,
         *     and this resource's every row is one the `DELETE` can remove.
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
         * @description `PUT E/identity-providers/{kind}` — create or replace.
         *
         *     `client_secret` is **optional, and omitting it keeps the stored one.** That is
         *     the one place this `PUT` is not a literal replacement, and it is deliberate:
         *     the secret is write-only, so a console flipping `enabled` has never been able
         *     to read the value it would have to send back, and requiring it would mean
         *     asking the customer to mint a new secret at their provider in order to turn a
         *     button off. Omitted on a *first* write it is 422 — a configuration with no
         *     secret is a button that cannot work. Sent with a different value it rotates,
         *     and the previous secret keeps working for 24 hours.
         *
         *     `null` is not the same as absent and is refused by the type: a caller who
         *     meant "clear the secret" is asking for a configuration that cannot complete a
         *     sign-in, and `DELETE` is how a provider goes away.
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
         * @description `GET E/identity-providers`, ordered by `kind`.
         *
         *     `next_cursor` is present and **always null**, for the reason
         *     `SigningKeyList` gives: there are four possible rows and no fifth, so a
         *     keyset seek would have nothing to resume, and a generated client that had to
         *     special-case one list of this surface is a worse cost than a member that is
         *     always null (management-api.md §OpenAPI).
         */
        IdentityProviderList: {
            /** Items */
            items: components["schemas"]["IdentityProviderOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * IdentityProviderOut
         * @description One configured provider. Never its client secret, in any shape.
         *
         *     `callback_url` is the whole reason a customer opens this resource: it is the
         *     one string they have to paste into Google Cloud Console or Entra, it differs
         *     between production and sandbox because the issuer does (ADR 0006), and it is
         *     **computed** from the environment's issuer rather than stored — so a stack
         *     whose ports moved answers with the URL that works now rather than the one
         *     that worked when the row was written.
         *
         *     `scopes` is the extras the customer added; `requested_scopes` is what an
         *     authorization request will actually ask for, the provider's own minimum
         *     included. Both, because "why is it asking for `openid`?" and "what did I
         *     add?" are different questions and one field cannot answer both.
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
         * @description `POST /api/v1/tenants/{tenant_id}/invitations`.
         *
         *     `email` is a plain string validated by the User model's own address rule at
         *     write time rather than by an `EmailStr` here, so an address this surface
         *     accepts is exactly an address the platform can hold — one schema-level
         *     definition of "an email" that disagreed with the model's would be a 422 for
         *     an address a member could have, or a 500 for one it could not.
         *
         *     `roles` is a list of Role ids, validated exactly as `POST T/members`
         *     validates them, and defaults to none.
         */
        InvitationIn: {
            /** Email */
            email: string;
            /** Roles */
            roles?: string[];
        };
        /**
         * InvitationInviter
         * @description Who sent it, when that is a User of this environment.
         *
         *     `null` for a console user administering a customer's environment: an
         *     Invitation's `invited_by` is a User of its own Environment and a console
         *     user is a User of the platform's `id` App (ADR 0010).
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
         *
         *     No `scope`, unlike `MemberRole`: an invitation is an offer of roles the
         *     tenant can assign, and whether a role happens to be app-scoped is a fact
         *     about the role rather than about the offer.
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
         * @description The two query parameters every list endpoint takes.
         *
         *     Declared once and reused, so `limit=201` is a 422 by schema rather than by a
         *     check each endpoint has to remember — and so the OpenAPI document says the
         *     bounds, which is what a generated client validates against.
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
         * @description One bucket of MAU and the allowance it is measured against.
         *
         *     **This is where billing.md §Plans' deliberate asymmetry is published rather
         *     than left to be inferred.** `free` is 10 000 pooled across every `free` App
         *     of the Account, `pro` is 25 000 *per App*, and `scale` is 250 000 pooled
         *     across the whole Account — so `scope` is `account` for a pool and `app` for
         *     a `pro` App's own number, and `app_id` is set for exactly the second kind.
         *     A client that read `allowance` without `scope` would measure a `free`
         *     Account's pool against one App at a time.
         *
         *     `over_allowance` is a **fact, never a refusal**. billing.md §"Limits, and
         *     how they are enforced": MAU "never blocks authentication", and on `free` —
         *     which has no card, and therefore no overage — being over it "is a notice and
         *     nothing else: repeated, clear, and never a refusal".
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
         * @description One Account the console user may switch to (ADR 0010).
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
         * @description Everything a caller can learn about itself (management-api.md §`GET /me`).
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
         * @description `recovery_codes` is present, once, only the first time this user
         *     registers a second factor of any kind (`mfa.md` §"Recovery codes").
         */
        MePasskeyRegisterFinishOut: {
            passkey: components["schemas"]["MePasskeyOut"];
            /** Recovery Codes */
            recovery_codes?: string[] | null;
        };
        /**
         * MePasswordIn
         * @description `POST /me/password` — the person's own password change (`Q3-151`).
         *
         *     Two fields, both required, and the current one is not optional on any path:
         *     users-and-credentials.md §"Password change (user-initiated)" asks for it, and
         *     it is what makes this a change rather than an administrator's set
         *     (`UserPasswordIn` above has no `current_password` precisely because an
         *     administrator does not know it).
         *
         *     `extra="forbid"` for the reason that schema gives. Neither value is ever
         *     echoed: the response is `204` with no body.
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
         * @description `POST /api/v1/tenants/{tenant_id}/members`.
         *
         *     Exactly one of `user_id` and `email`; both or neither is 422
         *     (tenants-and-membership.md §"Failure modes"). It is checked by the resource
         *     rather than declared here because JSON Schema cannot say "exactly one of",
         *     so a rule expressed only in the document would be one a generated client
         *     could not enforce and we would still have to make.
         *
         *     `roles` is a list of Role ids and defaults to none — a member with no roles
         *     is a member, and `roles: []` is what the token then carries.
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
         * @description `PATCH /api/v1/tenants/{tenant_id}/members/{member_id}`.
         *
         *     `roles` replaces the whole set — there is no add-one or remove-one
         *     operation on this surface — and `[]` is a valid value distinct from the
         *     `null` it does not accept. `user`, `tenant_id` and the timestamps are
         *     unknown fields: a membership is not moved from one user or tenant to
         *     another, it is removed and another is added.
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
         * @description `GET …/users/{uid}/mfa` — every factor of the user's, confirmed or not.
         *
         *     `items`/`next_cursor`, not `mfa.md` §API's literal `{factors: […]}`: every
         *     list envelope on this surface shares one shape for the generated clients
         *     (`SigningKeyList`'s own precedent — "It carries the field anyway so every
         *     list on the surface has one shape"), enforced by
         *     `tests/test_openapi_documents.py::test_every_list_envelope_is_a_named_schema`.
         *     `next_cursor` is always `null` — this platform never holds more than two
         *     rows per user (one `totp`, one `recovery`), the same reason the
         *     signing-key list gives. Noted in the P5-06 Log as a deviation from the
         *     spec's literal member name.
         */
        MfaFactorList: {
            /** Items */
            items: components["schemas"]["MfaFactorOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * MfaFactorOut
         * @description One factor of a user's (`mfa.md` §API): `GET …/users/{uid}/mfa`.
         *
         *     "Never seeds or hashes" — `secret_encrypted` and `recovery_hashes` have no
         *     reader here. Unconfirmed factors are included, with `confirmed_at: null`.
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
         * @description `POST /api/v1/environments/{environment_id}/permissions`.
         *
         *     `is_system` is not an input field: the reserved rows are the platform's and
         *     a customer claiming one is 422 `reserved-permission` on the name.
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
         * @description `PATCH /api/v1/permissions/{permission_id}` — the description, and nothing else.
         *
         *     `name` is named in `immutable_fields` rather than left off: it is plainly a
         *     property of the resource, and it is what every Role, API-key scope and token
         *     claim carries, so a rename would silently change what a deployed
         *     integration is asking for (rbac.md §API: "`name` present → 422").
         */
        PermissionPatch: {
            /** Description */
            description?: string;
        };
        /**
         * PlanLimitsOut
         * @description The numbers a plan is held to — `apps.accounts.plan_limits`, verbatim.
         *
         *     `AccountOut` deliberately carries no limits, so this is where a caller
         *     reads them (P6-13 scope). `tenant_limit` is the derived ceiling
         *     `effective_tenant_limit` returns, override included: what actually applies
         *     to this App right now, not what its plan implies.
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
         * @description RFC 9457 problem details — the error shape of this surface.
         *
         *     A plain `BaseModel` rather than a `ninja.Schema`, deliberately: a Schema
         *     validates through django-ninja's attribute getter, which reads only the
         *     fields it knows and would silently drop the extension members RFC 9457
         *     exists to allow. Nothing here is ever built from a Django model, so the
         *     getter buys nothing in exchange.
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
         *     `field` is `null` for the failures that belong to no single field — a rule
         *     over two settings, say. Django spells that `__all__` internally, which is
         *     its name for the absence of a field rather than a field any caller sent, so
         *     it never reaches the wire. A client reads `null` as "about the request, not
         *     about one property"; `errors[].field` is a string everywhere else.
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
         * @description `branding: {"changed": true}` — that the record moved, never what it says.
         *
         *     The values are a customer's stylesheet and their copy; the diff reports the
         *     fact and nothing else, for the reason `branding.updated` records key names
         *     rather than values (audit-log.md §Taxonomy).
         */
        PromotionBranding: {
            /** Changed */
            changed: boolean;
        };
        /**
         * PromotionIdentityProviders
         * @description Which provider kinds each side has configured. Promotion copies **none** of them.
         *
         *     D-7, and this shape is the second half of that decision: a promotion that
         *     silently left a difference behind would be a console that cannot explain why
         *     the production login page has no Google button. So the diff *names* the
         *     difference — `sandbox_only` is what the console turns into "sandbox has
         *     Google configured and production does not" — and `promoted` is flat `false`,
         *     stated rather than inferred from an empty list, because "nothing differed"
         *     and "nothing is ever copied" are different facts and only one of them is
         *     permanent.
         *
         *     Why nothing is copied: a copied client secret would point production at a
         *     sandbox OAuth application, and copying `enabled` without the secret would be
         *     worse — an enabled provider with no credentials is a button on the production
         *     login page that cannot work. Promotion copies no credential anywhere
         *     (environments.md §Promotion: not Clients, not API keys, not webhook
         *     endpoints), and this is the same category.
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
         * @description `POST /api/v1/environments/{environment_id}/promote`.
         *
         *     One field, defaulting to false, and `extra="forbid"` so a caller who
         *     mistyped it is told rather than silently promoted.
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
         * @description The diff summary environments.md §Promotion prints.
         *
         *     `applied` is false only for a dry run, and the two fields are both present
         *     because a client that stored a response needs to know which of the two it
         *     is holding without having kept the request.
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
         * @description What happened to one collection matched by key.
         *
         *     `created` and `updated` name the rows by the key they were matched on — a
         *     permission by `name`, a role by `slug`, a template by `kind:locale` — and
         *     `unchanged` counts the ones that matched and did not move. Rows that exist
         *     only on the target appear nowhere: promotion never deletes.
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
         * @description The `200` of every revoke-all: `{"revoked": <count>}`.
         *
         *     A schema rather than a bare integer, so the document names the property and
         *     a generated client reads `result.revoked` rather than a JSON scalar.
         */
        RevokedOut: {
            /** Revoked */
            revoked: number;
        };
        /**
         * RoleIn
         * @description `POST E/roles` and `POST T/roles` — one body for both scopes.
         *
         *     `tenant_id` is not an input field: a role's scope is decided by the endpoint
         *     it was created at and never changes (rbac.md §Roles). The environment path
         *     writes the app-scoped role, assignable in every tenant; the tenant path
         *     writes the one that tenant keeps to itself.
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
         * @description A Role as every read of it reports it (rbac.md §API).
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
         * @description `PATCH /api/v1/roles/{role_id}` — `name` and `description`.
         *
         *     `slug` is named in `immutable_fields`: it is what a token's `roles` array
         *     carries, so moving it would change what every deployed integration reads
         *     while the role's identity stayed the same (rbac.md §Roles). `permissions`
         *     has its own `PUT`, and `scope`, `tenant_id`, `is_system` and `member_count`
         *     are unknown fields — the first two are decided at creation, the third is
         *     ours, and the last is a projection.
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
         * @description `PUT /api/v1/roles/{role_id}/permissions` — the whole set, atomically.
         *
         *     A `PUT` rather than a `PATCH` because there is no add-one or remove-one
         *     operation: the body is the set the role will have, and the response is the
         *     Role that resulted.
         */
        RolePermissionsIn: {
            /** Permissions */
            permissions: string[];
        };
        /**
         * SentOut
         * @description The `200` of the two send actions: `{"sent": true | false}`.
         *
         *     `false` for the one case that succeeds without sending anything — a
         *     verification resend to an address that is already verified, which
         *     users-and-credentials.md §"Email verification" calls "a no-op that still
         *     reports success". A send the throttle refused is a 429 and never reaches
         *     this shape.
         *
         *     One status and one shape rather than a 200 and a bodiless 204, so a
         *     generated client has a single response type to unwrap and the difference
         *     lives in a field it can branch on. (Ruled in review of P2-10.)
         *
         *     Required rather than defaulted: a default would make `sent` optional in the
         *     generated document, and a client that read a missing key as `false` — or as
         *     `true` — would be guessing at the one thing this response exists to say.
         *     Both call sites construct it explicitly.
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
         * @description The one filter of the session list.
         *
         *     Valid sessions only by default (sessions-and-tokens.md §API): a console
         *     showing revoked and expired rows beside live ones invites revoking
         *     something that ended on its own. `include_expired=true` is the audit view,
         *     and it is in the cursor's fingerprint like every other filter.
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
         * @description One browser session (sessions-and-tokens.md §API, Session resource).
         *
         *     `client_ids` is the set of OAuth clients that hold a live refresh token in
         *     the session — what makes "which of our applications is this browser signed
         *     in to" answerable without exposing anything that could be replayed.
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
         * @description The by-type constraints of one definition (user-settings.md §Model).
         *
         *     One schema for all four types rather than a union, because which fields
         *     apply is decided by the sibling `type` field: `choices` for `enum` (1-32
         *     strings, each ≤ 64 chars), `max_length` for `string` (≤ 1024, default 256,
         *     always present on a stored definition), `min`/`max` for `number`, nothing
         *     for `boolean`. A field sent for another type is a 422 naming it; the
         *     server stores the constraints normalised, so a reader never has to know a
         *     default.
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
         * @description `POST …/settings/definitions`.
         *
         *     `key` and `type` are set here and never again (user-settings.md §Model).
         *     `constraints` may be omitted where the type needs none — a boolean always,
         *     a string or number falling back to its defaults — but an enum without
         *     `choices` is a 422, from the same validator every other write runs.
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
         * @description One definition, as `GET …/settings/definitions/{key}` answers it.
         *
         *     `value_count` is how many users hold a written value — what the console's
         *     confirmed delete names, since deleting the definition deletes exactly
         *     those rows (user-settings.md §Model).
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
         * @description `PATCH …/settings/definitions/{key}` — the mutable fields only.
         *
         *     `key` and `type` are refused as `immutable` rather than as unknown keys,
         *     because the resource plainly has them (user-settings.md §API: "never key
         *     or type"). `constraints` replaces the whole object — the constraints of a
         *     setting are one decision, and half of one merged with half of another
         *     would be a bound nobody chose; `null` resets them to the type's defaults.
         *     Clearing `default` (`null`) is a definition with no default again.
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
         * @description `GET …/signing-keys`, ordered `active`, `next`, `retired`.
         *
         *     `next_cursor` is present and **always null**. The listing is not paginated
         *     — the ordering sessions-and-tokens.md §API fixes is by *status*, which is
         *     not a column a keyset seek can resume from, and the row count is bounded by
         *     one `active`, one `next` and the retired keys still inside their retention
         *     window, which `signing_keys.prune` clears once a minute. The field is here
         *     anyway because management-api.md §OpenAPI makes every list response a named
         *     `{Resource}List` with `items` and `next_cursor`, and a generated client
         *     (P2-20) that has to special-case one list of the surface is a worse cost
         *     than a member that is always null.
         */
        SigningKeyList: {
            /** Items */
            items: components["schemas"]["SigningKeyOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * SigningKeyOut
         * @description One signing key as every read reports it (sessions-and-tokens.md §API).
         *
         *     `public_jwk` is RFC 7517's public JWK: `kty`, `crv`, `x`, `y`, `kid`, `alg`,
         *     `use`. Typed `dict[str, str]` rather than a model of its own because it is
         *     published verbatim and a JWK's membership is the RFC's to decide, not ours.
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
         * @description The optional body of `POST …/signing-keys/rotate`.
         *
         *     `retire_immediately` is the key-compromise case (security-baseline.md): the
         *     previously active key is deleted in the rotation's own transaction rather
         *     than retired, so it leaves JWKS at once. The default is `false`, which is
         *     the ordinary rotation every environment does on a schedule.
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
         * @description The `200` of a rotation: the three states, after the fact.
         *
         *     `next` is never null — App creation writes one and every rotation
         *     pre-announces the following one — so the field is required rather than
         *     optional. `retired` is a list because more than one key can still be inside
         *     its retention window, and it is empty after a `retire_immediately` rotation
         *     of an environment that had none before.
         */
        SigningKeyRotated: {
            active: components["schemas"]["SigningKeyOut"];
            next: components["schemas"]["SigningKeyOut"];
            /** Retired */
            retired: components["schemas"]["SigningKeyOut"][];
        };
        /**
         * StatsFilters
         * @description The one query parameter of `GET …/stats`.
         *
         *     A schema rather than a handler argument, so the parameter appears in the
         *     document under its own name and the default lives in one place.
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
         * @description The mirror of Stripe — and it says so.
         *
         *     `as_of` is when the mirror last agreed with Stripe, which is the whole
         *     reason it is here: billing.md §"Failure modes" says that when Stripe is
         *     down "the page renders from our mirror, marked possibly stale", and a
         *     console cannot mark staleness it has no way to measure.
         *
         *     **`status` alone cannot say whether this Account may currently write**, and
         *     that is why the two fields below it exist. billing.md §"When payment fails"
         *     makes the day-60 downgrade the moment the write refusal *ends* — "in code
         *     the condition is `status == unpaid AND downgraded_at IS NULL`, not `status
         *     == unpaid`" — so day 15-59 and day 60-onwards both read `unpaid` while
         *     meaning opposite things: pay the invoice and everything resumes, against
         *     you are on `free` now and nothing was deleted. A client holding only
         *     `status` has to say one of those two sentences to the reader who needs the
         *     other.
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
         * @description `POST /api/v1/environments/{environment_id}/tenants`.
         *
         *     `slug` is required, unlike an Account's or an App's: a tenant slug is the
         *     `tenant` authorization parameter and the customer chooses it deliberately,
         *     and there is no hosted form here to derive one from a name for.
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
         * @description A Tenant as every read of it reports it (tenants-and-membership.md §API).
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
         * @description `PATCH /api/v1/tenants/{tenant_id}` — `name`, `slug` and `metadata`.
         *
         *     `metadata` is replaced whole, which is what a merge patch does with an
         *     object unless a spec says it merges, and no spec says this one does.
         *
         *     `is_default`, `status`, `member_count` and `environment_id` are unknown
         *     fields on purpose: the first is what the environment's own tenant is, the
         *     second moves through `suspend`/`unsuspend`, and the last two are
         *     projections rather than properties. The default tenant's `slug` is refused
         *     by the resource rather than by the schema — 422 with `code: "immutable"` —
         *     because which tenant it is is a row this schema cannot see.
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
         * @description `GET /api/v1/account/usage` (environments.md §API).
         *
         *     `sandbox_users` is reported so the console can show it and is never counted
         *     toward anything. `mau` is the Account's monthly active users for the current
         *     calendar month, from the same roll-up `GET /account/billing/usage` reads
         *     (`apps.billing.metering`, P6-12) — it was declared as a `null` placeholder
         *     first so that filling it in would be additive for every generated client,
         *     and the type stays optional for exactly that reason. It is read from the
         *     roll-up rather than counted here, because two arithmetics for one figure is
         *     how a usage page and an invoice come to disagree.
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
         * @description `POST …/users/{user_id}/block`'s optional body (C8-42).
         *
         *     One field, and the body as a whole is optional: a plain `POST` with nothing
         *     in it is still the ordinary block, exactly as it was before this field
         *     existed, so no caller had to change.
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
         * @description `GET …/users/{user_id}/export` (users-and-credentials.md §Export).
         *
         *     One document, so that a subject access request is one call: the user
         *     record, the identities without their secrets, the MFA factors without their
         *     seeds, the memberships, the sessions, and the audit events where this user
         *     is actor or target — newest first, capped, with the cap reported rather
         *     than silently applied.
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
         * @description The six filters of `GET …/users` (users-and-credentials.md §API).
         *
         *     One schema rather than four handler arguments, for a reason that is
         *     structural: `tenant_id` is a `authz.TARGET_PARAMS` name, and
         *     `ManagementRouter` refuses a handler that takes one of those as a plain
         *     argument — because a target read out of the query string is a target the
         *     caller chose. Here it is a field of a query *schema*, which django-ninja
         *     hands the handler as one object, so `resolve_target` never sees a
         *     `tenant_id` key among the handler's arguments and containment is still
         *     resolved from `environment_id` in the path. It is a filter and nothing
         *     else: the row it names is looked up inside the environment `@requires`
         *     already resolved.
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
         * @description `POST /api/v1/environments/{environment_id}/users`.
         *
         *     `extra="forbid"` is the whole of the "not an input field" rule: `id`,
         *     `status`, `has_password`, `email_verified_at`, `last_login_at` and
         *     `locked_until` are 422 as unknown fields. `email_verified` and
         *     `send_verification` are *instructions* rather than properties — the first
         *     resolves into `email_verified_at`, the second sends a message — which is
         *     why neither appears in `UserOut`.
         *
         *     `password` is optional and, when given, never echoed anywhere: it is not a
         *     field of any response shape, and the audit event for the creation carries
         *     only whether the breach check ran.
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
         * @description `POST …/users/{user_id}/merge` — the User being folded in and erased.
         *
         *     One field, and `extra="forbid"` around it. There is deliberately nothing else
         *     to send: what a merge does is fixed by `social-login.md` §Merge, and an option
         *     (*"keep the source's authenticator"*, *"leave my own sessions alone"*) would be
         *     a caller choosing which half of a takeover-shaped operation to weaken. The
         *     winner is the path, so the row being **erased** is the one the caller had to
         *     name explicitly.
         *
         *     A `str` rather than a `uuid.UUID`, so a malformed id is the same 404 as an id
         *     that names nothing (`merge.find_source`) rather than a 422 among the shape
         *     errors — the answer a caller who mistyped an id should get either way, and one
         *     that says nothing about which ids exist.
         */
        UserMergeIn: {
            /** Source Id */
            source_id: string;
        };
        /**
         * UserOut
         * @description A User as every read of it reports it (users-and-credentials.md §API).
         *
         *     Three fields are derived rather than stored. `status` folds `erased_at` in,
         *     because `erased` is a state a caller has to be able to see and not a value
         *     the column holds; `has_password` is whether a `password` Identity exists,
         *     which is the only thing a read ever says about a credential; and
         *     `mfa_enrolled` is whether a confirmed factor exists.
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
         * @description `POST …/users/{user_id}/password` — one field, and no response body.
         *
         *     A schema of its own rather than a bare string, so the document names the
         *     property and a generated client sends `{"password": "…"}` rather than a
         *     JSON scalar.
         */
        UserPasswordIn: {
            /** Password */
            password: string;
        };
        /**
         * UserPatch
         * @description `PATCH /api/v1/environments/{environment_id}/users/{user_id}`.
         *
         *     `picture_url` and `locale` are the clearable fields: `null` means "no
         *     picture" and "no preference", and both are values a caller can go back to.
         *     `email`, `name` and `metadata` are not — an address is what identifies the
         *     row, a name has `""` for "none", and `metadata` has `{}`.
         *
         *     `email_verified` is an instruction, not a property: `true` stamps
         *     `email_verified_at` and suppresses the verification mail an address change
         *     would otherwise send, `false` clears it. `password` is deliberately absent —
         *     setting one is `POST …/users/{user_id}/password`, which revokes every
         *     session and mails the person, and folding that into a patch would make an
         *     account takeover look like a profile edit.
         *
         *     `status` is named in `immutable_fields` rather than left off, because it is
         *     plainly a property of the resource and the way to change it is
         *     `POST …/block` or `…/unblock`.
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
         * @description `GET …/settings/users/{user_id}/values` — one row per definition.
         *
         *     At most 50 rows (the definitions cap), so `next_cursor` is present and
         *     always null, for the reason `EmailTemplateList` gives: one envelope for
         *     every list of the surface, and `limit`/`cursor` accepted and ignored.
         */
        UserSettingList: {
            /** Items */
            items: components["schemas"]["UserSettingOut"][];
            /** Next Cursor */
            next_cursor?: string | null;
        };
        /**
         * UserSettingOut
         * @description One definition's answer for one user: the stored value, or the default.
         *
         *     `value` is what the user *has* — their written value where one exists, the
         *     definition's default otherwise, `null` where there is neither — which is
         *     the same resolution the public surface will serve the user themself
         *     (user-settings.md §API).
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
         * @description `PUT …/settings/users/{user_id}/values/{key}` — one value, whole.
         *
         *     Never `null`: a write writes a value, and the value's legality is the
         *     definition's business (`422` from the shared validator), not the schema's.
         */
        UserSettingValueIn: {
            /** Value */
            value: boolean | number | string;
        };
        /**
         * WebhookDeliveryOut
         * @description One `WebhookDelivery` row — one attempt, to one endpoint.
         *
         *     `endpoint_id` is nullable exactly as the column is: `SET_NULL` on the
         *     endpoint's own deletion means an attempt's log outlives the row it was
         *     aimed at (webhooks.md §"Failure modes": "the log survives its retention").
         *     `response_body` is already truncated, by `apps.webhooks.transport` at the
         *     point it was read — this reports it as stored, not a second truncation.
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
         * @description The `201` of creation: the resource, plus the secret — always, unlike
         *     `ClientCreated`'s optional one, because every `WebhookEndpoint` has a
         *     secret from the moment it exists.
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
         * @description `POST /api/v1/environments/{environment_id}/webhook-endpoints`.
         *
         *     `event_types` defaults to empty — webhooks.md §"Volume, and why
         *     subscription is explicit": "a new endpoint starts subscribed to nothing".
         *     There is no "all events" value this field accepts; every entry is checked
         *     against `apps.webhooks.catalogue.EVENT_TYPES` by the resource, which
         *     answers 422 `invalid-event-type` rather than `validation-error` for one
         *     that is not — a slug this schema cannot produce, the same reason
         *     `ApiKeyIn.scopes`'s catalogue check is not here either.
         *
         *     `extra="forbid"`: `id`, `secret`, `enabled`, `disabled_at`,
         *     `disabled_reason`, `environment_id` are 422 as unknown fields. A new
         *     endpoint is always `enabled: true`; there is no way to create one disabled.
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
         * @description A `WebhookEndpoint` as every read of it reports it (webhooks.md §Data).
         *
         *     No `secret` field here, in any form — absent, not null, exactly like
         *     `ClientOut.has_secret`'s pattern, except a webhook secret has no boolean
         *     "has one" to report: a `WebhookEndpoint` always holds one, minted at
         *     creation, so there is nothing a read needs to say about it beyond that it
         *     exists. `previous_secret_expires_at` is the one thing a read *does* say
         *     about rotation: non-null for the 24 hours webhooks.md §Signature keeps the
         *     previous secret verifying, so the console can show "rotation in progress"
         *     without ever seeing the old secret itself.
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
         * @description `PATCH /api/v1/environments/{environment_id}/webhook-endpoints/{id}`.
         *
         *     `event_types` is replaced whole by a merge patch, like `ClientPatch`'s URI
         *     arrays — `[]` unsubscribes from everything and is a valid value distinct
         *     from the `null` this field does not accept (it is not nullable: a
         *     subscription is always a list, possibly empty).
         *
         *     `enabled` is a plain `bool`: `false` disables — audited as
         *     `webhook_endpoint.disabled` rather than the generic `.updated`
         *     (webhooks.md §API) — and `true` re-enables an endpoint the seven-day
         *     failure sweep (P6-08) or a person turned off, clearing `disabled_at`/
         *     `disabled_reason` on the row.
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
         * @description `GET …/webhook-events/{id}`: the frozen envelope and every attempt.
         *
         *     `payload` is the exact envelope every delivery sent — `data` reads `{}`
         *     for an event about a user who has since been erased
         *     (`apps.webhooks.services.blank_erased_user_events`; webhooks.md
         *     §"Retention, and erasure": "the envelope and the delivery outcomes"
         *     survive erasure, `data` alone is blanked). `deliveries` is every attempt,
         *     to every endpoint that ever received this event, newest first — "every
         *     attempt is recorded, not just the last" (webhooks.md
         *     §"Trackable and debuggable").
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
         * @description One row of `GET …/webhook-events` — no payload, no attempts; see
         *     `WebhookEventDetailOut` for both.
         *
         *     `outcome` is the **worst** outcome among the endpoints this event
         *     reached — failed beats pending beats succeeded — not the most recently
         *     attempted one (webhooks.md §"Trackable and debuggable": "One event,
         *     several endpoints, one row" — a success arriving after a failure must
         *     not paint the row green and hide the failure behind it).
         *     `succeeded_endpoints`/`total_endpoints` are the counts the console
         *     renders beside it ("1 of 3 delivered"): how many of the endpoints this
         *     event reached currently read `succeeded`, out of how many it reached at
         *     all. Both are `0` for an event with no delivery yet.
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
         * @description `POST …/webhook-events/{id}/replay`.
         *
         *     `endpoint_id` is required rather than inferred: webhooks.md's own phrase
         *     is "re-deliver a past event to *its* endpoint", but a fan-out event can
         *     have reached more than one, and only the console — standing on one
         *     endpoint's own row of the attempts table — knows which one a person means
         *     to retry.
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
