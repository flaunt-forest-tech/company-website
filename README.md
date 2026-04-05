This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Security Setup

The server routes now require explicit security configuration.

### Required environment variables

For Google OAuth and Gmail API:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `GCP_PUBSUB_TOPIC`

For webhook/auth hardening:

- `WEBHOOK_SECRET` (required in production for `POST /webhooks/gmail/push`)
- `INTERNAL_API_SECRET` (required in production for `POST /api/gmail/watch`)

For Redis (optional):

- `REDIS_URL` or `REDIS_HOST` + `REDIS_PORT`
- `REDIS_TLS_INSECURE_SKIP_VERIFY` (optional, default secure behavior is certificate verification on)

For the private analytics dashboard:

- `ADMIN_DASHBOARD_USERNAME` (optional, defaults to `admin`)
- `ADMIN_DASHBOARD_PASSWORD` (required to sign in)
- `ADMIN_DASHBOARD_SECRET` (optional extra salt for the session cookie)

### Required request headers

- `POST /webhooks/gmail/push` must include header `x-webhook-secret: <WEBHOOK_SECRET>` when secret is configured.
- `POST /api/gmail/watch` must include header `x-internal-api-secret: <INTERNAL_API_SECRET>` when secret is configured.

### OAuth security notes

- `GET /api/auth/google/start` issues an `oauth_state` cookie and sends OAuth `state`.
- `GET /api/auth/google/callback` validates `state` against the cookie before exchanging tokens.

### Production recommendation

- Keep `NODE_ENV=production` in production so strict secret requirements are enforced.
- Do not set `REDIS_TLS_INSECURE_SKIP_VERIFY=true` unless you explicitly accept insecure TLS verification.
- Use `REDIS_URL` in production if you want analytics data to persist across redeploys.
- Access the internal traffic dashboard at `/admin/login` after setting the admin credentials above.

## Vercel Production Checklist

Set these Environment Variables in Vercel (Project -> Settings -> Environment Variables):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`
- `GCP_PUBSUB_TOPIC`
- `WEBHOOK_SECRET`
- `INTERNAL_API_SECRET`

Optional (if Redis is used):

- `REDIS_URL` (recommended) or `REDIS_HOST` + `REDIS_PORT`
- `REDIS_TLS_INSECURE_SKIP_VERIFY` (keep unset or `false` in production)

Important values for production:

- `GOOGLE_REDIRECT_URI` should be your production callback URL:
  - `https://<your-domain>/api/auth/google/callback`
- Configure the same production redirect URL in Google Cloud OAuth credentials.
- If using Pub/Sub push to your production endpoint, set `x-webhook-secret` to match `WEBHOOK_SECRET`.
- Any internal caller of `POST /api/gmail/watch` must send `x-internal-api-secret` with `INTERNAL_API_SECRET`.

### GitHub Actions → Vercel auto deploy setup

This repo now includes `.github/workflows/vercel-deploy.yml` for both PR preview deploys and `main` production deploys.

You can re-enable auto deploy with **either** of these approaches:

**Option A — deploy hooks (simplest)**
Add these GitHub Actions secrets in `Settings > Secrets and variables > Actions`:

- `VERCEL_PREVIEW_DEPLOY_HOOK` — preview deploy hook URL for pull requests into `main`
- `VERCEL_DEPLOY_HOOK` — production deploy hook URL for pushes to `main`

**Option B — Vercel CLI deployment**
Add these GitHub Actions secrets instead:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If the native Vercel GitHub integration was disconnected, either option above will restore visible GitHub deploy checks and automatic preview/production deployments.

## Getting Started

First, run the development server:-

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design Template

HTML file: https://drive.google.com/drive/folders/1CaLnAshGxqds-S4MmjegXqhuR99MrN98

## Dev Server

Upon successful merge of the PR into the `main` branch, the build is deployed to the following development server:
https://company-website-one-phi.vercel.app/
