# Vitest Worker Jose Import Error Reproduction

This repository demonstrates a critical issue with `@cloudflare/vitest-pool-workers` where packages like `jose` (used by `better-auth`) incorrectly import Node.js modules instead of browser/Worker builds.

## The Problem

When running Vitest tests for Cloudflare Workers that use `better-auth` (which depends on `jose`), the test fails with:

```
Error: No such module "node:https".
  imported from "node_modules/jose/dist/node/esm/runtime/fetch_jwks.js"
```

This happens because Vitest's module resolution uses Node.js conditions instead of Worker/browser conditions, causing `jose` to load its Node.js build instead of the browser build.

## Steps to Reproduce

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Run tests: `pnpm test`

You'll see the error:
```
Error: No such module "node:https".
  imported from "D:/DevDrive/Projects/vitest-worker-jose-repro/node_modules/.pnpm/jose@5.10.0/node_modules/jose/dist/node/esm/runtime/fetch_jwks.js"
```

## What Doesn't Work

### SSR Optimizer (vitest.config.ts)
Adding SSR optimizer with prebundling **does NOT fix the issue**:

```typescript
deps: {
  optimizer: {
    ssr: {
      enabled: true,
      include: ['better-auth'],
    },
  },
},
```

The error still occurs even with this configuration.

## The Only Working Solution

Build the Worker first, then test the built output:

1. Build: `pnpm build` (runs `wrangler deploy --dry-run --outdir dist`)
2. Update vitest.config.ts to use built output:
   ```typescript
   poolOptions: {
     workers: {
       main: "./dist/index.js", // Point to built Worker
       // ... rest of config
     }
   }
   ```
3. Run tests again: `pnpm test` ✅

## Environment

- Node.js: 22.x / 23.x
- OS: Windows 11
- Key packages:
  - @cloudflare/vitest-pool-workers: 0.8.60
  - vitest: 3.2.4
  - wrangler: 4.28.0
  - better-auth: 1.3.4
  - jose: 5.10.0 (transitive dependency)

## Root Cause

Vitest's SSR optimizer doesn't respect the `exports` field conditions in package.json. Jose has different exports for different environments:

```json
{
  "exports": {
    ".": {
      "browser": "./dist/browser/index.js",
      "worker": "./dist/browser/index.js", 
      "import": "./dist/node/esm/index.js",
      "require": "./dist/node/cjs/index.js"
    }
  }
}
```

But Vitest always picks the Node.js build (`import` condition) instead of the `worker` or `browser` build.

## Impact

This affects any Cloudflare Worker project using:
- Authentication libraries (better-auth, Auth.js, etc.)
- JWT libraries that use jose
- Any package with separate Node.js and browser builds

## Related Issues

- This is a known issue with Cloudflare's Vitest integration
- Affects module resolution for packages with conditional exports
- No fix available as of January 2025