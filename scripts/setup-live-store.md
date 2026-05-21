# Live admin — product save (Vercel)

Localhost uses `server/data/store.json`. On Vercel the disk resets — use **one** option below.

## Option A — Upstash Redis (fastest, ~2 min)

1. https://console.upstash.com → **Create Database** → **REST API**
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Vercel → project **trendkaari-clothing** → **Settings** → **Environment Variables** → add both → **Production**
4. **Redeploy** (no git push required if code is already deployed)

Check: `https://trendkaari-clothing.vercel.app/api/health`  
→ `"persistence":"upstash-redis"` and `"persistWrites":true`

## Option B — GitHub token (data in repo)

1. GitHub → **Settings** → **Developer settings** → **Fine-grained tokens** → generate  
   - Repository: `Trendkaari_clothing`  
   - Permissions: **Contents** read & write  
2. Vercel env: `GITHUB_TOKEN` = that token  
3. Redeploy  

Check health → `"persistence":"github"`

## Option C — Vercel Blob

Vercel → **Storage** → **Blob** → connect project → redeploy.
