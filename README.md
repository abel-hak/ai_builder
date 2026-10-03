# Abel Erduno Hakenso — Developer Portfolio

A high-performance developer portfolio with live AI-powered demo tools, built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## ✨ Features

- **Single-page portfolio** — Hero, About, Projects (with Case Study modals), Skills, and Contact sections
- **Light / Dark mode** — System-aware theme toggle with `localStorage` persistence
- **4 Live AI Demo tools** — Code Reviewer, Content Studio, Sentiment Analyzer, Translation Hub
- **Streaming AI responses** — Powered by Groq (LLaMA 3.1) via Supabase Edge Functions
- **Markdown rendering** — AI responses rendered with `react-markdown` and syntax highlighting
- **History tracking** — Every AI generation is saved to Supabase and browsable from a sidebar
- **"Hire Me" AI Chatbot** — Floating widget trained on my resume that answers recruiter questions
- **3D Hero background** — Interactive particle field built with Three.js and `@react-three/fiber`
- **Anti-slop design** — Instrument Serif + Geist font pairing, warm amber-gold palette, editorial layout

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **AI Engine** | Groq API (`llama-3.1-8b-instant`) via Supabase Edge Functions |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **3D Graphics** | Three.js, @react-three/fiber v8 |
| **Routing** | React Router DOM v6 |

## 🚀 Getting Started

Requires **Node.js 20** and **npm**. Do not use bun or yarn — this repo ships a single `package-lock.json`.

```sh
# 1. Clone the repo
git clone https://github.com/abel-hak/ai_builder.git
cd ai_builder

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase credentials (see below)

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080`

```sh
# Run the unit tests (no credentials or network required)
npm test
```

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

The Supabase Edge Function (`ai-demo`) requires one secret set in the Supabase Dashboard:

```
GROQ_API_KEY=your-groq-api-key
```

## 🗄️ Database Schema

Run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL editor. It creates:

| Table | Columns | Purpose |
|-------|---------|---------|
| `generations` | `id`, `created_at`, `type`, `input_text`, `output_text` | Stores AI demo history |
| `chat_logs` | `id`, `created_at`, `user_message`, `ai_response` | Stores "Hire Me" chatbot conversations |
| `contact_messages` | `id`, `created_at`, `name`, `email`, `subject`, `message` | Stores contact form submissions |

`contact_messages` and `chat_logs` are insert-only for the `anon` role, so visitors
cannot read each other's submissions. Read them from the Supabase dashboard.

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx            # Navigation with theme toggle
│   ├── ThemeToggle.tsx       # Light/dark mode switcher
│   ├── HeroSection.tsx       # Left-aligned editorial hero
│   ├── HeroBackground.tsx    # Three.js 3D particle field
│   ├── AboutSection.tsx      # Bio with skill highlight cards
│   ├── ProjectsSection.tsx   # Case study modals + demo links
│   ├── SkillsSection.tsx     # Tech stack grid with stats
│   ├── ContactSection.tsx    # Contact form + info
│   ├── AIChatWidget.tsx      # Floating "Hire Me" AI chatbot
│   └── ui/                   # shadcn/ui primitives
├── pages/
│   ├── Index.tsx             # Main portfolio page
│   ├── CodeReviewDemo.tsx    # AI code review with syntax highlighting
│   ├── ContentStudioDemo.tsx # Blog/email/landing page generator
│   ├── SentimentDemo.tsx     # Emotion & tone analysis
│   └── TranslateDemo.tsx     # Multilingual translation
├── lib/
│   ├── ai-stream.ts          # Streaming AI response utility
│   └── supabase.ts           # Supabase client config
supabase/
└── functions/
    └── ai-demo/
        └── index.ts          # Edge Function (Groq API proxy)
```

## 📦 Build

```sh
npm run build
```

## 🚢 Deployment

### 1. Backend (Supabase)

```sh
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase secrets set GROQ_API_KEY=<your-groq-key>
npx supabase functions deploy ai-demo --no-verify-jwt
```

The project ref in `supabase/config.toml` must match the one in `VITE_SUPABASE_URL`.

### 2. Frontend (Vercel)

Import the GitHub repo in Vercel. The build is detected automatically
(`npm run build` → `dist`), and `vercel.json` rewrites all routes to
`index.html` so deep links like `/code-review` survive a refresh.

Set these environment variables in the Vercel project settings:

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## 👤 Author

**Abel Erduno Hakenso**
- Email: erddunoabel47@gmail.com
- Location: Addis Ababa, Ethiopia
- GitHub: [github.com/abel-hak](https://github.com/abel-hak)
