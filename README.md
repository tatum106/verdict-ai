# Verdict.ai

An AI-powered debate judging application. Users submit two opposing sides of an argument, and an AI judge analyzes both positions to render an unbiased verdict.

## Features

- **User Authentication**: Sign up and log in with Clerk (email, Google, GitHub)
- **Debate Submission**: Submit a topic and both sides of an argument
- **AI Judge**: Claude evaluates arguments on logical coherence, evidence, clarity, and persuasiveness
- **Verdict Display**: Detailed analysis with scores, strengths, weaknesses, and reasoning
- **Dashboard**: View your debate history and statistics
- **Rate Limiting**: 50 debates/hour for authenticated users, 5/hour for anonymous

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Database**: PostgreSQL with Prisma
- **AI**: Anthropic Claude API

## Prerequisites

- Node.js 18+
- PostgreSQL database (free at [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- [Clerk](https://clerk.com) account
- [Anthropic](https://console.anthropic.com) API key

## Setup

1. **Clone and install**:
   ```bash
   cd verdict-ai
   npm install
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure `.env.local`**:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`: From [Clerk Dashboard](https://dashboard.clerk.com)
   - `ANTHROPIC_API_KEY`: From [Anthropic Console](https://console.anthropic.com)
   - `CLERK_WEBHOOK_SECRET`: For syncing users to your database (optional but recommended)

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Configure Clerk Webhook** (optional, for user sync):
   - In Clerk Dashboard → Webhooks, add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

6. **Run the app**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (judge, debates, user)
│   ├── dashboard/     # User dashboard
│   ├── debate/        # New debate form & verdict display
│   └── sign-in/       # Clerk auth pages
├── components/        # UI components
├── lib/               # Utilities, DB, rate limiting
└── types/             # TypeScript types
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret (for user sync) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## License

MIT
