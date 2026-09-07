# Lexical relationship validation reproduction

This fixture reproduces a Payload 3.87.0 bug where a function-based
`admin.hidden` on a relationship target makes an existing relationship inside
a Lexical `BlocksFeature` block fail validation.

## Steps

1. Install dependencies with `pnpm install`.
2. Start the fixture with `pnpm dev _community`.
3. Open the admin panel and use the configured auto-login user.
4. Open **Reproduction Posts** and edit **Saving this post fails**.
5. Click **Save** without changing anything.

The save fails with an `Invalid selections` validation error on `relatedItem`.
The logged-in user still has read access to `hidden-items`; the collection is
only hidden from the admin UI by `admin.hidden`.

Changing `hidden: ({ user }) => Boolean(user)` to `hidden: false` and restarting
allows the same post to save successfully.
