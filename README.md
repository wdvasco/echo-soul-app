# 🎵 Echo Soul — AI Music Production Assistant

> An AI-powered content generation tool for DJs and music producers. Generates complete packages for **SUNO AI** and **YouTube** from a single configuration panel.

![Stack](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Stack](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite)
![Stack](https://img.shields.io/badge/Supabase-2-3ECF8E?style=flat&logo=supabase)
![Stack](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Components](#components)
- [Edge Function](#edge-function)
- [Database Schema](#database-schema)
- [Available Scripts](#available-scripts)

---

## Overview

Echo Soul is a web application that helps DJs and music producers generate complete content packages in seconds. By entering a theme, mood, BPM, genre, and instrumentation, the app uses **Groq's LLaMA 3.3 70B** model to generate:

- 🎵 **SUNO AI Package** — song title, structured lyrics, and style tags
- 🎨 **Visual Package** — image prompts for cover art, thumbnail, and video loop
- 📺 **YouTube Package** — video title, full description, hashtags, and pinned comment
- 📈 **SEO Upgrade** — optimized YouTube tag list

All outputs are saved to a personal history per user, accessible at any time.

---

## Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Email/password via Supabase Auth |
| ⚙️ Config Panel | BPM slider, genre selector, mood chips, instrument chips, vocal type |
| 🤖 AI Generation | Groq API (LLaMA 3.3 70B) via Supabase Edge Function |
| 📋 Per-field Copy | Individual copy button for each output field |
| 🕐 History | Paginated sidebar with all previous generations (10 per page) |
| 💾 Persistence | All outputs saved in PostgreSQL via Supabase |
| 🎨 Design | Dark/Gold cinematic UI with glassmorphism and animations |
| 🔔 Toast Notifications | Success and error feedback |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                           │
│  ┌─────────────┐    ┌──────────────┐   ┌─────────────┐  │
│  │ ConfigPanel │───▶│    App.jsx   │──▶│ OutputPanel │  │
│  └─────────────┘    │  (State Mgr) │   └─────────────┘  │
│  ┌─────────────┐    └──────┬───────┘   ┌─────────────┐  │
│  │ HistoryPanel│◀──────────┤           │  AuthPage   │  │
│  └─────────────┘           │           └─────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                             │ HTTPS
                    ┌────────▼────────┐
                    │   Supabase      │
                    │  ┌───────────┐  │
                    │  │   Auth    │  │
                    │  ├───────────┤  │
                    │  │PostgreSQL │  │
                    │  ├───────────┤  │
                    │  │   Edge    │  │──▶ Groq API
                    │  │ Function  │  │   (LLaMA 3.3 70B)
                    │  └───────────┘  │
                    └─────────────────┘
```

**Data flow:**
1. User configures parameters in the `ConfigPanel`
2. `App.jsx` calls the Supabase Edge Function with the JWT token
3. Edge Function validates the token, builds the prompt, and calls Groq
4. Groq returns a structured JSON with the 4 content blocks
5. Edge Function saves the output to PostgreSQL and returns it to the frontend
6. `OutputPanel` renders the output with per-field copy buttons

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Vanilla CSS | — | Styling (design system) |
| @supabase/supabase-js | 2 | Auth and database client |

### Backend
| Technology | Purpose |
|---|---|
| Supabase Auth | User authentication |
| Supabase PostgreSQL | Output history storage |
| Supabase Edge Functions | Serverless API (Deno/TypeScript) |
| Groq API | LLaMA 3.3 70B AI model |

---

## Project Structure

```
echo-soul-app/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── AuthPage.jsx       # Login/register screen with animated canvas
│   │   ├── AuthPage.css
│   │   ├── ConfigPanel.jsx    # Left sidebar: all input controls
│   │   ├── ConfigPanel.css
│   │   ├── OutputPanel.jsx    # Right area: 4 output blocks with copy buttons
│   │   ├── OutputPanel.css
│   │   ├── HistoryPanel.jsx   # Slide-in sidebar with generation history
│   │   └── HistoryPanel.css
│   ├── lib/
│   │   └── supabase.js        # Supabase client singleton
│   ├── App.jsx                # Root component: layout, auth state, generate handler
│   ├── App.css                # Main layout styles
│   ├── index.css              # Global design system (tokens, utilities)
│   └── main.jsx               # React entry point
├── supabase/
│   └── functions/
│       └── generate-output/
│           └── index.ts       # Edge Function (Deno/TypeScript)
├── .env                       # Local environment variables (not committed)
├── .env.example               # Environment variable template
├── .gitignore
├── index.html                 # HTML entry point
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key (free, no credit card required)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/wdvasco/echo-soul-app.git
cd echo-soul-app

# 2. Install dependencies
npm install

# 3. Copy environment variables template
cp .env.example .env

# 4. Fill in your credentials in .env (see below)

# 5. Start the development server
npm run dev
```

### Supabase Setup

**1. Create the `outputs` table** by running this migration in the Supabase SQL Editor:

```sql
create table public.outputs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  tema        text,
  modo        text,
  bpm         integer,
  genero      text,
  moods       text[],
  instrumentacao text[],
  tipo_vocal  text,
  style_tag_usuario text,
  output_json jsonb,
  created_at  timestamptz default now()
);

-- Enable Row Level Security
alter table public.outputs enable row level security;

-- Users can only see and create their own outputs
create policy "Users can view own outputs"
  on public.outputs for select
  using (auth.uid() = user_id);

create policy "Users can insert own outputs"
  on public.outputs for insert
  with check (auth.uid() = user_id);
```

**2. Configure Auth Settings** in the Supabase Dashboard:
- Go to **Authentication → Providers → Email**
- Ensure **"Enable Email provider"** is **ON**
- Set **"Confirm email"** to **OFF** (for frictionless signup)

**3. Deploy the Edge Function:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Add the Groq API key as a secret
supabase secrets set GROQ_API_KEY=gsk_your_key_here

# Deploy the function
supabase functions deploy generate-output
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ **Security:** Never expose your Groq API key in the frontend. It must be stored as a Supabase Edge Function secret (`supabase secrets set GROQ_API_KEY=...`).

### How to get these values:
| Variable | Where to find |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys → Create API Key |

---

## Components

### `App.jsx`
The root orchestrator. Manages:
- **Auth state** via `supabase.auth.onAuthStateChange`
- **Generate handler** (`handleGenerate`) — calls the Edge Function with the user's JWT
- **Toast notifications** system
- **Layout** — header, sidebar, output area, history panel

**Key props passed down:**
| Prop | Recipient | Description |
|---|---|---|
| `onGenerate` | `ConfigPanel` | Callback to trigger generation |
| `loading` | `ConfigPanel`, `OutputPanel` | Loading state flag |
| `output` | `OutputPanel` | Generated JSON data |
| `onSelect` | `HistoryPanel` | Loads a past output into view |

---

### `AuthPage.jsx`
Login and registration screen with:
- Animated particle canvas background
- Tab toggle between **Login** and **Register**
- Supabase Auth calls (`signInWithPassword`, `signUp`)
- Error display and loading state

---

### `ConfigPanel.jsx`
Left sidebar with all input controls:

| Field | Type | Description |
|---|---|---|
| Tema / Título | Select | Theme or title idea for the track |
| Modo | Toggle | `criacao` (AI architects style) or `execucao` (use exact keywords) |
| BPM | Range slider + number input | Track tempo (110–140 BPM) |
| Gênero | Select | Genre (Deep House, Tech House, etc.) |
| Moods | Chip multi-select | Mood/atmosphere tags |
| Instrumentação | Chip multi-select | Instrument tags |
| Tipo Vocal | Button group | Male Vocal / Female Vocal / Duet |
| Style Tag | Text (execução mode only) | Exact SUNO style keywords |

**Two generation buttons:**
| Button | `tipo_geracao` value | Output |
|---|---|---|
| Gerar Pacote Completo | `"completo"` | All 4 blocks (audio, visual, YouTube, SEO) |
| Apenas Prompt SUNO | `"suno"` | Only the SUNO prompt block |

---

### `OutputPanel.jsx`
Renders the 4 generated content blocks. Each block uses a `FieldSection` component that pairs a **gold label** with a **small copy button (⎘)**.

**Blocks:**
- `Bloco1` — 🎵 Pacote Suno (título, letras, style tag)
- `Bloco2` — 🎨 Pacote Visual (arte principal, thumbnail, vídeo loop)
- `Bloco3` — 📺 Pacote YouTube (título, descrição, hashtags, comentário fixado)
- `Bloco4` — 📈 Upgrade SEO (tags do YouTube)
- `PromptSuno` — rendered instead of the 4 blocks when `tipo_geracao = "suno"`

**Layout modes:**
- **Full package** — 3-column grid (`output-panel-3col`): Suno | YouTube+SEO | Visual
- **SUNO only** — single column with `PromptSuno` component

**States:**
- **Empty** — placeholder with call-to-action
- **Loading** — animated skeleton blocks
- **Populated** — full output with copy buttons

---

### `HistoryPanel.jsx`
Slide-in panel from the right that:
- Fetches past generations from `public.outputs` (ordered by `created_at desc`)
- Paginates results (**10 per page**, with "Carregar mais" button)
- On item click, loads that output into the `OutputPanel` and closes
- Shows tema, genre, BPM badge, and mode badge per history item

---

### `supabase.js`
```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```
Singleton client used throughout the app.

---

## Edge Function

**Endpoint:** `POST /functions/v1/generate-output`

**Authentication:** Requires `Authorization: Bearer <user_jwt>` header.

### Request Body

```json
{
  "tema": "Midnight Rain",
  "modo": "criacao",
  "bpm": 124,
  "genero": "Deep House",
  "moods": ["Late-Night", "Cinematic"],
  "instrumentacao": ["Rhodes", "Sub-Bass"],
  "tipo_vocal": "Male Vocal",
  "style_tag_usuario": ""
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `tema` | string | ✅ | Theme or title idea |
| `modo` | `"criacao"` \| `"execucao"` | ✅ | Generation mode |
| `bpm` | number | ✅ | Beats per minute |
| `genero` | string | ✅ | Musical genre |
| `moods` | string[] | ✅ | Mood/atmosphere tags |
| `instrumentacao` | string[] | ✅ | Instrument tags |
| `tipo_vocal` | string | ✅ | Vocal type |
| `style_tag_usuario` | string | ❌ | Required only when `modo = "execucao"` |

### Response Body

```json
{
  "success": true,
  "data": {
    "bloco1_audio": {
      "titulo": "Midnight Rain",
      "letras": "[Intro]\n...",
      "style_tag": "124 BPM, deep house, rhodes piano, male vocals..."
    },
    "bloco2_visual": {
      "arte_principal": "Dark urban cinematic scene...",
      "thumbnail": "High contrast thumbnail...",
      "video_loop": "Rain-soaked streets..."
    },
    "bloco3_youtube": {
      "titulo": "Midnight Rain | Hypnotic | Deep House Mix | 124 BPM",
      "descricao": "Echo Soul is a channel dedicated to...",
      "hashtags": ["#DeepHouse", "#LateNight", "..."],
      "comentario_fixado": "Where would you listen to this track?"
    },
    "bloco4_seo": {
      "tags_youtube": ["deep house 2025", "late night house music", "..."]
    }
  }
}
```

### Error Response

```json
{
  "error": "Error description here"
}
```

### Internal Flow

```
Request → Validate JWT → Build Prompt → Groq API → Parse JSON → Save to DB → Return
```

1. **Validate JWT** — uses `supabase.auth.getUser(token)` with service role key
2. **Build prompt** — constructs structured prompt from request parameters
3. **Call Groq** — `POST https://api.groq.com/openai/v1/chat/completions` with `response_format: { type: "json_object" }`
4. **Post-process** — ensures emoji footer is present in YouTube description
5. **Save to DB** — inserts into `public.outputs` with `user_id`
6. **Return** — sends `{ success: true, data: outputJson }`

---

## Database Schema

### `public.outputs`

```sql
Column              Type          Description
──────────────────────────────────────────────────────
id                  uuid          Primary key
user_id             uuid          References auth.users(id)
tema                text          Theme/title used for generation
modo                text          'criacao' or 'execucao'
bpm                 integer       BPM value
genero              text          Musical genre
moods               text[]        Array of mood tags
instrumentacao      text[]        Array of instrument tags
tipo_vocal          text          Vocal type
style_tag_usuario   text          Custom style tag (execução mode)
output_json         jsonb         Full generated output (all 4 blocks)
created_at          timestamptz   Timestamp of generation
```

**Row Level Security policies:**
- Users can only `SELECT` and `INSERT` rows where `user_id = auth.uid()`

---

## Available Scripts

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## Design System

The app uses a custom CSS design system defined in `src/index.css`:

| Token | Value | Usage |
|---|---|---|
| `--gold` | `#C9A84C` | Primary accent color |
| `--gold-light` | `#E8C96A` | Light gold variant |
| `--bg-primary` | `#0A0A0A` | Main background |
| `--bg-surface` | `#111111` | Card/panel background |
| `--bg-elevated` | `#1A1A1A` | Elevated elements |
| `--text-primary` | `#F0EDE8` | Primary text |
| `--text-secondary` | `#B8B4AE` | Secondary text |
| `--text-muted` | `#6B6760` | Muted text |
| `--border` | `rgba(255,255,255,0.06)` | Default border |
| `--font` | `'Outfit', sans-serif` | Primary typeface |

Key utility classes: `.glass` (glassmorphism card), `.gold-gradient` (gold text gradient), `.btn`, `.btn-copy`, `.animate-fade-up`, `.skeleton`.

---

## License

Private project — all rights reserved.

---

*Built with ❤️ using React, Supabase, and Groq.*
