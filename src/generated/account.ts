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
         * @description Schedule this person's erasure for seven days' time, and mail them the undo.
         *
         *     **No body.** §API's row has none, and there is nothing a caller could usefully
         *     put in one: there is no user id on this surface, the grace period is ours, and a
         *     "reason" would be free text about a person we are about to erase. The
         *     re-authentication is the confirmation.
         *
         *     `202`, not `204` and not `200`: the thing asked for has not happened yet.
         *     `erase_after` is the moment it will, which is what lets a screen say "your account
         *     will be deleted on …" — §"What happens, and when" requires that the delay be
         *     "said on the page in plain words", and a page can only say it if the API does.
         *
         *     `409 last-owner` through the predicate `DELETE .../users/{id}` already applies
         *     (ADR 0013): the service asks `guard_erasure`, and this handler only translates.
         *     The `detail` is deliberately *not* the management surface's
         *     `LAST_OWNER_ERASURE_DETAIL` — that one is written for an operator erasing somebody
         *     else ("give another member 'owner' first" addressed to a third party) — but the
         *     slug is byte-identical, which is the half that is contract.
         *
         *     **An outstanding request answers the same `202` with the same date, and sends
         *     nothing.** `AlreadyRequested` is not a refusal here, for two reasons: it cannot be
         *     reached through this surface anyway — the first request revoked every session, so a
         *     second token is `401 session-revoked` at `AccountAuth` — and §"Failure modes" gives
         *     this route no slug for it, so answering one would mean a problem document nothing
         *     declares. Idempotent is the honest reading: the state the caller asked for holds,
         *     and `erase_after` is read off the row rather than recomputed as "now plus seven
         *     days", which would quietly *move* a deadline a person has already been told.
         */
        post: operations["api_public_v1_account_deletion_request_deletion"];
        /**
         * Cancel a deletion request with the token from the emailed link
         * @description Spend the mailed token and put the account back.
         *
         *     **The one route on this surface with no bearer token**, and the reason is
         *     structural rather than a convenience: the request that produced this token revoked
         *     every session of the person it belongs to, so there is no session to present. A
         *     route here that demanded one would make the cancellation link useless, and a
         *     cancellation link that does not work is a seven-day grace period that is not an
         *     undo.
         *
         *     It is on this surface rather than on `/flow/*` "so that the deletion resource has
         *     one home" (§"What happens, and when"), and it is keyed by IP because there is no
         *     `sid` to key on — 30 a minute, "the shared 30-per-IP-per-minute token row every
         *     other token endpoint takes".
         *
         *     The Environment comes from the host rather than from the credential, which is the
         *     one thing this handler does differently from every other on the surface:
         *     `HostResolutionMiddleware` has already resolved it, and it is what scopes the
         *     token lookup (ADR 0005). A token of another Environment is `400 invalid-token`
         *     for free, because `users.consume` never sees it.
         *
         *     `204` for a token that was spent and for a row with nothing outstanding alike:
         *     the state the caller asked for is the state that holds. A second click on the same
         *     link is `400 invalid-token`, because the first one spent it — one answer for
         *     unknown, spent and expired, which §"Failure modes" asks for in as many words.
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
         * @description `{email, email_verified, change_pending}`.
         *
         *     `change_pending` is read from the existence of an unspent `change_email`
         *     `ActionToken` — §"Changing an email address": "there is exactly one place the
         *     pending address is written and no second place for it to be wrong".
         *
         *     **It never names the pending address**, only that there is one. The address is on
         *     the token and the token was mailed to it; a `GET` that echoed it would hand a
         *     stolen session the one fact a person could otherwise notice from the mail in their
         *     own inbox, and §API asks for a bool.
         */
        get: operations["api_public_v1_account_profile_read_email"];
        put?: never;
        /**
         * Ask to change the signed-in person's own email address
         * @description Step 1 of two: mail a confirmation link to the **new** address.
         *
         *     Sensitive — §"The operations" marks it — so `@self_service` has already refused an
         *     un-re-authenticated caller before this body runs. That gate is the reason the
         *     operation can be so plain: it changes nothing, and everything it could change is
         *     behind a link that arrives somewhere the caller may not be able to read.
         *
         *     **`202 {"sent": true}` whatever happens**, which is §API's row and
         *     §"Failure modes"' "`POST /email` with an address already registered in this
         *     Environment | `202` | identical to success, and nothing is sent". `ResendOut` is
         *     reused rather than a `SentOut` of its own: it is `{"sent": bool}` and the bool is
         *     always `true` here, which is exactly the point — a generated client sees one shape
         *     for "a mail was asked for" across this surface, and a second schema with the same
         *     single member would be two names for one thing.
         *
         *     Why `true` and not the truth: the document is what a stranger reads. §API declares
         *     the literal and the no-enumeration rule requires it, so the one branch that sends
         *     nothing must be indistinguishable — including in the budget, which is why
         *     `mail_send` is spent here, ahead of the service's decision.
         *
         *     **The shared per-user mailed-link budget, not a bucket of its own.**
         *     §"Rate limits" gives this row as "*the shared per-user mailed-link budget*" — one
         *     window across verification, reset and this, counted for the person. So the
         *     `@self_service` limiter stays the catch-all row (there is no `account-email` bucket
         *     to declare) and `throttles.mail_send` is the real limit, exactly as
         *     `POST /email/resend` above spends it.
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
         * @description Step 2 of two: spend the mailed token and move the address.
         *
         *     The operation §API omits; the row is drafted in `U10-05`'s Log and three things
         *     about it are decisions rather than defaults:
         *
         *     * **Authenticated.** §API's note under the table calls `DELETE /deletion` "the one
         *       route on this surface that takes no bearer token", and one is one. It also means
         *       an attacker who can read the new mailbox but holds no token cannot move the
         *       address — the mailbox and the session are two credentials and this step wants
         *       both.
         *     * **Not sensitive.** §"Failure modes" gives this route `invalid-token` and
         *       `email-taken` and no `reauth-required`, and step 1 already took a
         *       re-authentication. A second password prompt in front of clicking a link we
         *       ourselves mailed would teach people to type their password at prompts that did
         *       not need it.
         *     * **The token must be the caller's own**, and a token that is somebody else's is
         *       `400 invalid-token` rather than a `403` — one document for every way a token
         *       cannot be spent, so a caller holding a guessed one learns nothing from which
         *       reason refused it.
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
         * @description `POST /flow/verify-email/resend`'s per-user budget, shared, not a second one.
         *
         *     §"The operations" says exactly that, so the spend goes through
         *     `apps.identity.throttles.mail_send` — one window across verification, reset
         *     and (later) the email change, counted for the person rather than for a
         *     surface. A second bucket here would mean a person who had just used the
         *     hosted resend form could send again from a customer's screen, which is the
         *     budget saying one thing and meaning another.
         *
         *     A person whose address is already verified gets `{"sent": false}` and nothing
         *     is sent (`users-and-credentials.md`), rather than a refusal: there is nothing
         *     wrong with asking, and the answer is simply that there was nothing to send.
         *
         *     **A `POST` that fails closed on Redis, including on the throttle.** The rate
         *     limiter above already answers `503 unavailable` when Redis cannot decide, and
         *     `mail_send` raising `RateLimitUnavailable` is the same outage one layer in, so
         *     it gets the same answer. That is `/flow/*`'s split — the management API chooses
         *     the other way and logs, because there it is an authenticated operator's own
         *     request and `management-api.md` §"Failure modes" prefers availability; here the
         *     budget is the only thing standing between one bearer token and a mailbox.
         *
         *     No `req`: this surface has no login chain, so there is no AuthRequest to put
         *     into the link and the tab that opens the mail lands on the hosted
         *     `/verify-email` page as a direct visit.
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
         * @description This person's links, every provider on offer, and whether they hold a password.
         *
         *     `has_password` is here for the same reason it is on `GET /flow/identities`: a
         *     screen deciding whether to offer Remove needs to know what else could begin a
         *     sign-in, and the alternative is a second call that could disagree with this
         *     one about the same person.
         *
         *     `providers` is `link_buttons`, which carries a same-origin `start_url` with no
         *     destination parameter in it — the navigation is top-level and the customer's
         *     screen does not get to choose where it lands.
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
         * @description `409 last-credential` when this is the last thing that could begin a sign-in.
         *
         *     The closed set is a usable password, another provider identity, or another
         *     confirmed passkey — **not** a TOTP factor and **not** recovery codes, which
         *     are second factors and cannot start one (`social-login.md` §Unlinking). The
         *     refusal is the API's: a screen shows the sentence, and would still be refused
         *     if it did not.
         *
         *     Removing a link revokes the sessions that provider authenticated and **no
         *     others**, which is why a caller whose own session came from a password keeps
         *     working and one whose session came from the provider it has just removed does
         *     not — and on this surface "does not" is immediate, because step 7 of
         *     authentication reads the session rather than trusting the token.
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
         * @description Every factor, confirmed or not, and the policy that governs removal.
         *
         *     `mfa.md` §API: "Unconfirmed factors included with `confirmed_at: null`. Never
         *     seeds or hashes." `policy` is here because a screen cannot render a Remove
         *     button honestly without it — under `required` the last factor cannot go, and
         *     finding that out from a `403` after the click is worse than not offering it.
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
         * @description Verify the code, confirm the factor, and return the ten codes once.
         *
         *     The one place on this surface a secret appears in a body, and it appears
         *     once — there is no operation that reads them back.
         *
         *     A wrong code is `401 invalid-code`, the same answer a spent recovery code and
         *     a locked account get, because which of the three it was is not something a
         *     caller who does not already know should learn here.
         *
         *     **`amr` is not extended.** `/flow/mfa/enroll/confirm` adds `otp` to the
         *     session because that session is mid-sign-in and the chain reads `amr` to
         *     decide whether the second factor is done; nothing here is mid-anything, and a
         *     self-service enrolment is not a sign-in that proved a second factor. The next
         *     sign-in will challenge and record it.
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
         * @description Seed a factor (or reuse the pending one) and return the secret once.
         *
         *     Sensitive, and §"The operations" marks the whole write column so. The reason
         *     is not procedural, and `api.public.v1.flow.mfa` argues it at length: a caller
         *     holding only a session — a stolen token, XSS — could otherwise plant a factor
         *     of *their own* on an account with none, which under `optional` policy starts
         *     challenging the legitimate owner at every login for a code only the attacker
         *     holds, with no self-service way back (removal is gated too) short of an
         *     administrative reset.
         *
         *     `409 mfa-already-enrolled` because "at most one confirmed TOTP factor"
         *     (`mfa.md` §TOTP): without it a signed-in caller could re-enrol and silently
         *     replace a confirmed factor outside the gated remove flow.
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
         * @description The ten codes, once, behind the same gate removal is behind.
         *
         *     `404` when the person holds no confirmed factor of either kind: recovery codes
         *     back one up, and there is nothing here to regenerate a set for.
         *     `also_qualifies` is what makes a confirmed passkey count as that factor, which
         *     is `passkeys.md`'s rule and is passed rather than re-derived.
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
         * @description `403 mfa-required` for the last factor under `required`; `404` otherwise.
         *
         *     A malformed id and somebody else's factor answer identically — `404`, never
         *     `403` — so an id reveals nothing about what exists for another person.
         *
         *     Removing either kind removes both, which is
         *     `apps.identity.services.mfa.remove_factors`' rule and is shared with the
         *     administrative reset: a person who removes their TOTP factor does not keep a
         *     recovery-code set that can no longer back anything up.
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
         * @description The credentials, and the hosted URL that can register another.
         *
         *     `fail_open` like every `GET` on the catch-all row: making a person's security
         *     list unreachable because Redis is unreachable is a worse outage than serving
         *     it unbounded for a few minutes.
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
         * @description Two refusals, from `passkeys.md`'s two rules — and this surface separates them.
         *
         *     `passkeys.md` §"Multiple credentials, and removing them" has two rules:
         *     refused unconditionally when removing it would leave the person **no way to
         *     sign in at all**, and refused under `mfa_policy: required` when it is their
         *     last *second factor* of any kind. `webauthn.removal_refused` answers both with
         *     one bool, which is all `DELETE /flow/passkeys/{id}` needs — that surface
         *     answers `403 mfa-required` either way.
         *
         *     **§API asks this surface for two answers**: `409 last-credential` and
         *     `403 mfa-required`, and §"Failure modes" gives them separate rows with
         *     separate closed sets. That is right for an API a customer programs against:
         *     "you would have no way in" and "this environment insists on a second factor"
         *     call for different screens, and a client that saw one slug for both would have
         *     to guess which it was.
         *
         *     So the split asks `identities.ways_to_sign_in` — the *same* predicate
         *     `removal_refused` asks for its first rule, with the same
         *     `excluding_passkey` — and only then asks `removal_refused` for what is left,
         *     which can then only be the policy rule. One rule, one predicate, two slugs:
         *     nothing here re-derives what a way in is, which is exactly the mistake `S9-08`
         *     found when the passkey rule knew about passwords and passkeys and nothing
         *     about provider identities.
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
         * @description `{has_password, min_length, breach_check}` — the form, before anybody types.
         *
         *     All three are the Environment's, so a customer's own screen shows the same
         *     rules the portal does and neither has to hard-code a number of ours.
         *     `has_password` is what decides whether to ask for a current password at all.
         */
        get: operations["api_public_v1_account_password_read_password_policy"];
        put?: never;
        /**
         * Change the signed-in person's own password
         * @description `current_password` **and** the re-auth mark, exactly as `/me/password` requires both.
         *
         *     The mark is the decorator's (`@self_service(sensitive=True)`), so by the time
         *     this runs the session has re-proved itself inside five minutes.
         *
         *     Two paths, decided by what the person *has* and never by what the caller
         *     sent:
         *
         *     * **They have a password** → `passwords.change_password`, which verifies
         *       `current_password`. A wrong one — or a missing one — is
         *       `401 invalid-credentials`, never a `422`, because "naming the missing field
         *       would distinguish 'you have a password' from 'you do not' to a caller
         *       holding somebody's token" (§"Failure modes"). Every *other* session is
         *       revoked and this one survives, so the screen the change was made on keeps
         *       working.
         *     * **They have none** → `passwords.set_password`, the §"The operations" row
         *       "Set a password (person has none)": there is no `current_password` to
         *       supply, "the re-auth gate is what stands in for it, and a person who can
         *       satisfy it holds a passkey or a provider identity". That service revokes
         *       **every** session including this one, which is its own rule for an
         *       administrative set — and is the right one here too: a person who had no
         *       password now has a credential that did not exist a moment ago, and the
         *       sessions opened before it should not outlive the change.
         *
         *     A new password the policy refuses is `422 password-policy` or
         *     `422 password-breached`, with `errors[].field = "password"`, which is the same
         *     pair every other password endpoint in this codebase answers with.
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
         * @description The portal's stable entry URL, and the sections this Environment offers.
         *
         *     **`danger` is here when `Environment.self_deletion` is on, and absent otherwise**
         *     — the seam `U10-03` left (`PortalSection` already declared the value, `ALWAYS` did
         *     not list it), closed by `U10-05` with the column it needs. §"The portal" gives the
         *     condition as "when the Environment offers it", and this is the only place on the
         *     surface that answers that question in a document rather than as a `404`: §API says
         *     so in as many words, "so a customer's own page renders the right links without
         *     hard-coding a path of ours or **guessing at `self_deletion`**".
         *
         *     It is still not the decision. The `/deletion` routes are `404` when the column is
         *     false whatever this list says, which is §"Failure modes"' "the API's `404` is what
         *     decides it" — a client-side route that hides itself is not a control.
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
         * @description Not sensitive, and §"The operations" says so by leaving the column empty.
         *
         *     Nothing here is a credential: a name, a language and a picture are how a
         *     person is addressed, and putting a password prompt in front of correcting the
         *     spelling of your own name would teach people to type their password at
         *     prompts that did not need it — which is the habit every phishing page relies
         *     on.
         *
         *     Only the members the caller actually sent are written, which is what makes
         *     "a key present and already equal to the stored value changed nothing" true:
         *     `Schema.dict(exclude_unset=True)` is the same `api.management.patching`
         *     distinction between "set this to null" and "do not touch this".
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
         * @description `{has_password, reauth_providers[], passkey_available, reauthenticated_until}`.
         *
         *     The same three facts `GET /flow/identities` already carries for the same
         *     reason, from the same two services — `identities.has_password` and
         *     `reauth_buttons`, which is the **intersection** of the providers this person
         *     holds and the providers this Environment still offers. A kind the person holds
         *     but the Environment has since disabled is left out, because a control that can
         *     only produce a refusal is worse than no control (`S9-12`).
         *
         *     `passkey_available` is "this person holds a confirmed passkey", which is a
         *     fact about them and not about what this API can accept — a customer's screen
         *     uses it to decide whether linking to the hosted `/account/reauth` is worth
         *     offering, since that page accepts an assertion and this endpoint cannot.
         *
         *     `reauthenticated_until` is `null` when there is no live mark, so a screen can
         *     skip the gate it does not need rather than discovering that from a `401`
         *     after somebody has filled a form in.
         */
        get: operations["api_public_v1_account_reauth_read_reauth"];
        put?: never;
        /**
         * Re-prove the signed-in person's own password
         * @description Verify the password against this session's own user, and mark the session.
         *
         *     **`sensitive=False`, and it has to be**: this is the operation that satisfies
         *     the gate, so gating it would be a cycle with no way in. That is not a
         *     weakening — it takes a password, which is a stronger proof than the mark it
         *     writes.
         *
         *     A wrong password is `401 invalid-credentials`, indistinguishable from every
         *     other credential refusal on this surface, and **counts toward the same
         *     progressive lockout** a wrong password anywhere else does — because the check
         *     goes through `authenticate_password` rather than through a hash comparison.
         *     §"Rate limits" says so in as many words: "A failed re-authentication and a
         *     wrong `current_password` both count toward progressive lockout".
         *
         *     Nothing about the session is disturbed. `amr` is unchanged and no new session
         *     is opened: `reauth.mark` writes a property *next to* the session, which is the
         *     whole of what `mfa.md` §Self-service asks for and the reason a person who has
         *     just re-authenticated is not suddenly treated as having passed a second factor.
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
         * @description Newest first, cursor paginated like every other list.
         *
         *     The cursor is `api.management.pagination`'s and not a second implementation:
         *     it is a *position* rather than an offset, it is HMAC-tagged so a client cannot
         *     mint one, and it names its own query so a cursor issued for one listing cannot
         *     seek in another. A person with two devices will never see the difference; a
         *     person with two hundred would, and writing a second cursor to find that out
         *     would be the mistake this codebase keeps a single `paginate` to avoid.
         *
         *     `ManagementProblem` is caught rather than raised: that module answers an
         *     unusable cursor with `400 invalid-cursor`, which is the right decision in the
         *     wrong surface's shape — this surface's problems carry a `code`. The slug is
         *     the same one, for the reason every shared slug here is shared.
         *     **`account-portal.md` declares no row for it**; the amendment is drafted in
         *     `U10-03`'s Log.
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
         * @description Every live session except this token's, and the count of what went.
         *
         *     Not sensitive, and not a `revoke-all`: see the module docstring for both. The
         *     count is what a screen puts in its confirmation — "3 other devices signed
         *     out" — and is the reason this is not a `204`.
         *
         *     `sessions.revoke_all_for_user` rather than a loop over `_live`, because that
         *     service is what also emits the `sessions.revoked_all` summary the taxonomy
         *     defines: "without it, revoking forty sessions is forty rows and no record of
         *     the single act that caused them". It is one transaction, it cascades to the
         *     refresh families, and `except_session` is exactly this token's own — the
         *     argument that function already exists to take.
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
         * @description Revoke one of this person's own live sessions, which may be this one.
         *
         *     `404 not-found` for a malformed id, for somebody else's session and for one
         *     that is already dead — one answer, so an id discloses nothing about what
         *     exists. The row is resolved inside `user=caller.user`, so there is no id a
         *     caller could supply that reaches another person's session.
         *
         *     Revocation cascades to the refresh families exactly as
         *     `sessions-and-tokens.md` §"Revocation semantics" says; nothing about that
         *     changes here, because `sessions.revoke_session` is the one thing that does it.
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
         * @description Every definition the person may see, each with their value or the default.
         *
         *     `value` is the written value where one exists, the definition's default where
         *     not, and `null` where there is neither — `user-settings.md` §Model calls that
         *     "what a user has before any write". `.get`'s fallback fires only on a missing
         *     key, so a written value — which a write can never make `None` — always
         *     outranks the default.
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
         * @description One value, validated against the definition by the shared validator.
         *
         *     `404 setting-not-found` for a key this environment does not define *and* for a
         *     `hidden` one — byte-identical but for `instance` and `request_id`, so probing
         *     writes cannot enumerate hidden keys. `403 setting-not-editable` for
         *     `user_visible`: readable in the listing, operator-writable only. `422` names
         *     `value` for anything the constraints refuse —
         *     `apps.settings.validation.validate_value` is the one validator every writer
         *     takes (`P5-02`), non-finite numbers included.
         */
        put: operations["api_public_v1_account_settings_put_setting"];
        post?: never;
        /**
         * Clear one of the signed-in person's own settings back to its default
         * @description Remove the stored value, so the default answers again.
         *
         *     The same access semantics as the write, and idempotent by the service's
         *     design: clearing a value that was never written is the same `204`, because
         *     "unset" is the state the caller asked for and it holds either way
         *     (`user-settings.md` §API).
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
         * @description `DELETE /deletion` with `{token}` — the one anonymous body on this surface.
         *
         *     The person holds no session by construction: the request that produced this token
         *     revoked every one of them. So the mailed token is the whole credential, and
         *     `TOKEN_MAX_LENGTH` is the same non-committal ceiling `EmailConfirmIn.token`
         *     carries, for the same reason — one `400 invalid-token` for every way a token can
         *     be wrong, and a length bound would make a second answer out of one of them.
         */
        DeletionCancelIn: {
            /** Token */
            token: string;
        };
        /**
         * DeletionOut
         * @description §API `POST /deletion`: `202 {"erase_after": "…"}`.
         *
         *     One member, and it is the only thing a caller needs and the only thing we can
         *     honestly promise: the moment the hourly sweep will erase this person unless the
         *     cancellation link is opened. RFC 3339 UTC like every other timestamp here.
         *
         *     **Not `{"deleted": true}` and not a `204`**, because neither would be true.
         *     §"What happens, and when" is a seven-day grace period, and "delete my account"
         *     not deleting immediately "has to be said on the page in plain words" — a screen
         *     can only say it if the API says when.
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
         * @description §"Changing an email address" step 1: `POST /email` with `{email}`.
         *
         *     **The member is `email`, which `authz.SUBJECT_NAMES` refuses**, so `POST /email`
         *     declares `writes_own={"email"}` — the one declared exception on this surface, and
         *     `api.public.v1.account.authz`'s module docstring argues it. The spec gives the
         *     body as `{email}` and the spec wins; what the declaration says is that this
         *     `email` is a value written onto the caller's own row rather than a way to name
         *     somebody else's.
         *
         *     `max_length` and nothing else. §"Failure modes" wants a malformed or over-length
         *     address to be `422 validation-error` with `field = "email"` — "the caller is a
         *     program here, not a login form, so there is no oracle to protect: it never saw an
         *     address it did not supply" — and the normalisation and the real validation are
         *     `users-and-credentials.md` §Email's, applied by the service through
         *     `normalise_email` and `validate_user_email`. A pydantic `EmailStr` here would be
         *     a *second* definition of a valid address, which is the thing `User.email` is a
         *     `CharField` rather than an `EmailField` to avoid.
         */
        EmailChangeIn: {
            /** Email */
            email: string;
        };
        /**
         * EmailConfirmIn
         * @description `POST /email/confirm` with `{token}` — the row drafted in `U10-05`'s Log.
         *
         *     The operation §API omits: §"Changing an email address" step 2 requires a route
         *     the mailed token is `POST`ed to ("only the `POST` spends it, so a mail scanner
         *     cannot") and §"Failure modes" declares its two refusals, but the table has no row.
         *
         *     No `max_length` bound below the column's: a token is 32 random bytes as URL-safe
         *     base64 and the only thing that matters about a wrong one is that it is wrong, so
         *     a length refusal would answer `422` where §"Failure modes" says `400
         *     invalid-token` — one answer for unknown, spent and expired, and a bound would
         *     make a fourth.
         */
        EmailConfirmIn: {
            /** Token */
            token: string;
        };
        /**
         * EmailOut
         * @description §API `GET /email`: `{email, email_verified, change_pending}`.
         *
         *     `change_pending` is read from the existence of an unspent `change_email`
         *     `ActionToken` and from nowhere else — §"Changing an email address": "A pending
         *     change lives only on the `ActionToken`, and there is no `pending_email`
         *     column", so there is exactly one place the pending address is written and no
         *     second place for it to be wrong.
         *
         *     It is declared here, and in this pull request it is always `false`: the
         *     operation that creates such a token (`POST /email`) is deferred with the rest
         *     of the email change — see `U10-03`'s Log. Declaring it now rather than adding
         *     it later keeps the member off the list of things that break a generated client.
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
         * @description The shared secret and the `otpauth://` URI, returned once.
         *
         *     TOTP enrolment is on this surface on purpose (§"Two ceremonies are
         *     origin-bound"): "it is a shared secret and a six-digit code, with no origin
         *     binding of any kind, so the one second factor a customer can offer inside
         *     their own product is the one every plan includes."
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
         *     `code` is the stable machine token the SPA's catalogue keys on; `params`
         *     holds the numbers its sentence needs (`{"minimum": 12, "maximum": 128}`).
         *     `message` is a fixed English developer-facing string and is never rendered
         *     to an end user — ADR 0011 puts every user-visible string in the SPA.
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
         * @description RFC 9457 problem details, plus the `code` every flow refusal carries.
         *
         *     A plain `BaseModel` for `api.management.v1.schemas.Problem`'s reason: a
         *     `Schema` validates through django-ninja's attribute getter, which would
         *     silently drop the extension members RFC 9457 exists to allow.
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
         * @description §API `GET /identities`: "links, `providers[]`, `has_password`".
         *
         *     `providers` carries each kind's `start_url`, which is the other origin-bound
         *     ceremony's hand-off: linking is a redirect round trip through
         *     `GET /oauth/social/{kind}/start?intent=link`, so the API lists and removes and
         *     the navigation is the customer's screen's to make, top-level.
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
         * @description The credentials, and where a person can add one.
         *
         *     `portal_url` is the second half of §"Two ceremonies are origin-bound"'s
         *     `Registering a passkey` row — "`GET`/`DELETE` on the list, and a **portal
         *     URL** the customer's screen links to, deep-linked at the security page". There
         *     is no `POST /passkeys/register/*` on this surface and there never will be: the
         *     ceremony's `rp_id` is the issuer host, so `navigator.credentials.create()` on
         *     a customer's origin is refused by the browser and not by us.
         */
        PasskeysOut: {
            /** Passkeys */
            passkeys: components["schemas"]["PasskeyOut"][];
            /** Portal Url */
            portal_url: string;
        };
        /**
         * PasswordIn
         * @description `current_password` and `new_password`, the second required.
         *
         *     `current_password` is optional **only** because a person who has none has none
         *     to send (§"The operations": "Set a password (person has none) … No
         *     `current_password` to supply"). It is not a way to skip the check: a person who
         *     *does* have a password and omits it gets `401 invalid-credentials` and not a
         *     `422`, because "naming the missing field would distinguish 'you have a
         *     password' from 'you do not' to a caller holding somebody's token"
         *     (§"Failure modes").
         *
         *     Neither field carries a `min_length`. The policy is the Environment's and its
         *     refusal is `422 password-policy` with `errors[].field = "password"`; a schema
         *     bound would answer first, in django-ninja's shape, for the one input whose
         *     refusal §"Failure modes" writes out.
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
         * @description §API `GET /password`: `{has_password, min_length, breach_check}`.
         *
         *     What a screen needs to render the form before anybody types: whether to ask
         *     for a current password at all, the minimum to say out loud, and whether a
         *     refusal can come back from the breach corpus. All three are the Environment's,
         *     so a customer's own screens show the same rules the portal does.
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
         * @description §API `GET /portal`: `{url, sections[]}`.
         *
         *     "One document naming the portal URL and which sections this Environment
         *     offers, so a customer's own page renders the right links without hard-coding a
         *     path of ours or guessing at `self_deletion`."
         *
         *     `url` is the portal's stable entry point, `{issuer}/account`. The `client_id`
         *     and `return_to` parameters §"Getting there and back" describes are the
         *     caller's to add — they are about where the *customer's* browser should come
         *     back to, which this endpoint cannot know and an SDK helper builds
         *     (`accountPortalUrl`, `U10-04`).
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
         * @description §"The operations", row 1, member for member — and no `metadata`.
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
         * @description Name, language and picture. Every member optional, and `None` clears it.
         *
         *     The address is **not** here: it is the login identity and cannot change on one
         *     request (§"Changing an email address"), so it has its own two-step operation
         *     and a `PATCH` that accepted it would be a way round the confirmation.
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
         * @description One provider a person could re-authenticate or link with.
         *
         *     `start_url` is a same-origin path on the issuer with no destination parameter
         *     in it, exactly as `/flow/identities` carries it — the navigation is top-level
         *     and the customer's screen does not get to choose where it lands.
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
         * @description A password and nothing else (§Re-authentication).
         *
         *     A passkey assertion cannot be accepted here — `rp_id` is the issuer host and a
         *     ceremony on the customer's origin is refused by the browser — and a provider
         *     round trip cannot, because it is a navigation. Both remain available on the
         *     hosted `/account/reauth`, which accepts all three; the asymmetry is the
         *     browser's and `GET /reauth` is how a caller finds out which it has.
         */
        ReauthIn: {
            /** Password */
            password: string;
        };
        /**
         * ReauthOut
         * @description §Re-authentication: "The API tells a caller what this person can answer with".
         *
         *     `Q3-126`'s lesson, applied before it could be repeated: that ticket's brief
         *     said the login page "already knows what the environment offers" and neither
         *     document it reads carried the field, so the fix became a new member on a public
         *     API that nobody had presented as a design decision. This is that member,
         *     designed up front — a claim that a page knows something is a claim about a
         *     schema, and this is the schema saying it.
         *
         *     `reauthenticated_until` is `null` when the mark is absent or has expired, so a
         *     screen can decide whether to show the gate at all rather than discovering it
         *     from a `401`.
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
         * @description §API `POST /email/resend`: `{"sent": bool}`.
         *
         *     `false` for a person whose address is already verified — the same document with
         *     nothing sent, which is `users-and-credentials.md`'s rule and the reason this is
         *     a bool rather than a `204`.
         */
        ResendOut: {
            /** Sent */
            sent: boolean;
        };
        /**
         * RevokedOut
         * @description §Sessions: `POST /sessions/revoke-others` answers `{"revoked": n}`.
         */
        RevokedOut: {
            /** Revoked */
            revoked: number;
        };
        /**
         * SessionOut
         * @description §Sessions, member for member. Not `tenant_id` and not `client_ids`.
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
         * @description One definition-with-value row (user-settings.md §API, public surface).
         *
         *     Explicit nulls: a `value` of `null` means "no stored value and no default",
         *     which is the answer rather than the absence of one. `value` is otherwise the
         *     user's written value where one exists and the definition's default where
         *     not — the same resolution the management surface serves an operator.
         *
         *     `constraints` is the stored, normalised record whose by-type shape
         *     user-settings.md §Model fixes: `choices` for `enum`, `max_length` for
         *     `string` (always present, the default made explicit), `min`/`max` for
         *     `number`, `{}` for `boolean`. The member list is the spec's — key, type,
         *     constraints, label, value — and carries no `access`: the listing only ever
         *     holds the two visible levels, and "read-only" is the `PUT`'s `403` to give.
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
         * @description `GET /account/v1/settings` — one row per definition the user may see.
         *
         *     At most 50 rows (the definitions cap), in key order. `hidden` definitions
         *     are absent — not present-but-masked — which is the enumeration property the
         *     404s rest on.
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
