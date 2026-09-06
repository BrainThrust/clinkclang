# Cloudflare hosting

Production hostname: `clinkclang.com`.

Static SvelteKit export, including documentation, blog and Chinese-language routes. No runtime secrets are required. Run from sites/docs after installing the pnpm workspace from the repository root.

Use Node 22.19.0 (see `.nvmrc`) and the repository lockfile. Build and deploy with:

```sh
pnpm run deploy:cloudflare
```

Shared provider credentials are supplied through CLOUDFLARE_API_TOKEN and
CLOUDFLARE_ACCOUNT_ID in the operator environment. Never commit values.
The owning Worker, assets, runtime bindings and custom domain are specified in
`wrangler.jsonc`. Production deployment is currently manual via the command
above; no Cloudflare Git build connection was created by this migration.

Migration source is retained on `codex/cloudflare-migration`. The previous
Vercel deployment remains a rollback snapshot. To roll back routing, detach the
Cloudflare custom domain and restore its recorded Vercel web DNS entry; preserve
mail, TXT and backend records. The operations hosting receipt records the exact
pre-migration records and Cloudflare version.
