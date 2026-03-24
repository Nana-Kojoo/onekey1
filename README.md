# OneKey — Universal API Directory

A production-ready Next.js application for discovering, evaluating, and integrating APIs. Powered by Claude AI for real-time code generation.

## Features

- 🔍 **Search & Filter** — full-text search by name, npm package, or category
- ✦ **AI Code Generator** — Claude streams working code for any task in JS, Python, or cURL
- 📦 **12 real APIs** pre-loaded with metadata, SDKs, and community reviews
- 🔖 **Bookmarks** — save APIs to localStorage, persists across sessions
- ⭐ **Reviews** — star ratings and developer comments
- 📊 **Difficulty scores** — 1–10 scale with breakdown by docs, auth, and SDK quality
- 🗂️ **12 categories** — Payments, AI, Maps, Auth, Finance, Search, and more
- 🌐 **SEO ready** — Next.js App Router with proper metadata
- ⚡ **Edge streaming** — Anthropic API proxied through a Next.js Edge route

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Framework | Next.js 15 (App Router)             |
| Language  | TypeScript                          |
| Styling   | Custom CSS (no Tailwind dependency) |
| AI        | Anthropic Claude (streaming SSE)    |
| State     | React hooks + localStorage          |

## Project Structure

```
src/
├── app/
│   ├── globals.css           # All design tokens and utility classes
│   ├── layout.tsx            # Root layout + metadata
│   ├── page.tsx              # Home page
│   ├── directory/page.tsx    # Searchable API directory
│   ├── apis/[id]/page.tsx    # API detail + AI code gen
│   ├── categories/page.tsx   # Category browser
│   ├── submit/page.tsx       # Submit new API form
│   ├── bookmarks/page.tsx    # Saved APIs
│   └── api/generate/route.ts # Anthropic proxy (Edge runtime)
├── components/
│   ├── ui/                   # Stars, DiffBar, Badge, CodeBlock, Toast
│   ├── layout/               # Nav, Footer
│   └── api/                  # ApiCard, AICodePanel, DetailSidebar
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── data.ts               # All API + category data
│   └── utils.ts              # Filtering, sorting, syntax highlight
└── hooks/
    ├── useBookmarks.ts       # localStorage bookmark persistence
    └── useToast.ts           # Toast notification state
```

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/onekey.git
cd onekey
npm install
```

### 2. Set up environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm start
```

## Adding APIs

Edit `src/lib/data.ts` and add an entry to the `APIS` array. The `pkg` field is used by the AI code generator to produce accurate install commands:

```ts
{
  id: 'my-api',
  name: 'My API',
  pkg: { js: 'my-package', python: 'my-package', note: 'npm install my-package  /  pip install my-package' },
  // ...
}
```

Also add suggestion prompts to `AI_SUGGESTIONS` in the same file.

## Deployment

Works out of the box with **Vercel**:

```bash
npx vercel --prod
```

Add `ANTHROPIC_API_KEY` in your Vercel project environment variables.

The `api/generate` route uses the **Edge Runtime** for low-latency streaming worldwide.

## License

MIT
