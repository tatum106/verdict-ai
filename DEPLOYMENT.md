# Verdict.ai – Deployment Guide

## 1. Set Git identity (one-time)

```bash
git config --global user.email "your@email.com"
git config --global user.name "Your Name"
```

## 2. Create initial commit and push to GitHub

```bash
cd C:\Users\patri\verdict-ai

# Create commit (after git config above)
git commit -m "Initial commit: Verdict.ai - AI debate judge app"

# Create repo on GitHub: github.com → New repository → name it "verdict-ai" (or your choice)

# Add remote and push
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/verdict-ai.git
git push -u origin main
```

## 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub)
2. **Add New** → **Project** → Import your `verdict-ai` repo
3. **Configure Project** – leave defaults (Next.js detected)
4. **Environment Variables** – add these (use your production values):

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Supabase/Neon PostgreSQL connection string |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (use **production** key for prod) |
   | `CLERK_SECRET_KEY` | Clerk secret key (use **production** key for prod) |
   | `ANTHROPIC_API_KEY` | Your Anthropic API key |
   | `CLERK_WEBHOOK_SECRET` | (Optional) Clerk webhook signing secret |

5. Click **Deploy**

## 4. Post-deploy: Database & Clerk

1. **Database**: Schema is synced via `prisma generate` during build. Ensure your production `DATABASE_URL` points to your Supabase/Neon database. To push schema changes before deploy, run locally:
   ```bash
   DATABASE_URL="your-production-url" npx prisma db push
   ```

2. **Clerk**: In [Clerk Dashboard](https://dashboard.clerk.com):
   - Add your production domain (e.g. `verdict-ai.vercel.app`) under **Domains**
   - For webhooks: Add endpoint `https://your-app.vercel.app/api/webhooks/clerk` and subscribe to `user.created`, `user.updated`, `user.deleted`

3. **Optional custom domain**: In Vercel project → Settings → Domains, add your domain.
