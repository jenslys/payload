# Stale list-sort reproduction

This branch contains a reproduction only. It does not change Payload's implementation.

The Posts collection has a virtual `computedValue` field. The seed stores
`sort: "-computedValue"` in the development user's `collection-posts` preference.
This represents a sort saved before a schema change made that field virtual.
Seeding the preference avoids requiring two app builds and a database migration.

## Run

Use a disposable test database. The repository's test runner can clear it on startup.

```sh
pnpm install
PAYLOAD_DATABASE=sqlite SQLITE_URL=file:./stale-sort-reproduction.db pnpm dev _community
```

1. Open `/admin/collections/posts` on the printed localhost origin. The standard
   development user signs in automatically.
2. The seeded post exists, but the list query fails with
   `The following path cannot be queried: computedValue`.
3. Open `/admin/collections/posts?sort=title`. The same post becomes visible
   because this replaces the invalid saved sort.
4. Open `/admin/collections/posts` again. The repaired preference is reused.

Verified on upstream `3.x` at `2a1a9c83d9` (Payload 3.93.0, Next.js 16.4.1):
the valid-sort control passes and the stale-sort regression fails. The affected
list displays "No Results" for the existing post, with no explanation of the
invalid saved sort.

The original production report on Payload 3.90.0 showed a blank list area with
the sidebar still visible. That version derives error names from class names,
and the list renderer compares the name to the literal `"QueryError"`.
Production minification is a suspected contributor to the blank screen. Current
`3.x` explicitly sets the error name and reproduces the misleading empty list
instead. A standalone production build of this branch has not been tested.

Clearing browser storage does not repair the database-backed preference.

## Browser regression

```sh
PAYLOAD_DATABASE=sqlite SQLITE_URL=file:./stale-sort-reproduction.db \
  pnpm test:e2e _community --workers=1
```

The valid-sort control should pass. The stale-sort regression intentionally
asserts the expected recovery behavior and should fail on the affected code.
Each test restores the stale preference and deletes it afterward.
