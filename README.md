# AI Career Builder — Developer Portfolio

A modern, animated developer portfolio showcasing full-stack and AI engineering skills. Built with React, TypeScript, Vite, and Supabase.

## ✨ Features

- **Single-page portfolio** — Hero, About, Projects, Skills, and Contact sections
- **4 Live AI Demo pages** — Code Reviewer, Content Studio, Sentiment Analyzer, Translation Hub
- **Streaming AI responses** — powered by Google Gemini via Supabase Edge Functions
- **Dark mode** with animated gradients, glassmorphism, and Framer Motion transitions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Supabase (database + Edge Functions)
- **AI**: Google Gemini via Supabase Edge Functions
- **Routing**: React Router DOM v6

## 🚀 Getting Started

```sh
# 1. Clone the repo
git clone <YOUR_GIT_URL>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080`

## ⚙️ Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## 📁 Project Structure

```
src/
├── components/       # UI sections and shared components
│   ├── HeroSection.tsx
│   ├── AboutSection.tsx
│   ├── ProjectsSection.tsx
│   ├── SkillsSection.tsx
│   ├── ContactSection.tsx
│   └── ui/           # shadcn/ui components
├── pages/            # Route-level pages
│   ├── Index.tsx
│   ├── CodeReviewDemo.tsx
│   ├── ContentStudioDemo.tsx
│   ├── SentimentDemo.tsx
│   └── TranslateDemo.tsx
├── lib/
│   └── ai-stream.ts  # Streaming AI utility
supabase/
└── functions/
    └── ai-demo/      # Edge Function for Gemini AI
```

## 🧪 Running Tests

```sh
npm test
```

## 📦 Build

```sh
npm run build
```
