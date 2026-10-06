# Systems and architectural patterns (System Patterns)
## Overall Architecture
Fullstack app **Next.js (App Router)**:
- **Frontend**: React components with TypeScript and Tailwind CSS, othimized for mobile use.
- **Backend**: **Route Handlers** in `app/api/**/route.ts` for requisitions processing, endpoints REST and business rules.
- **Banco de Dados**: Supabase (PostgreSQL) acessed via framework SDK (`@supabase/supabase-js` / `@supabase/ssr`), minimum conections and row level security.

## Code Patterns
- **Style and format**: TypeScript strict, ESLint and Prettier.
- **Answer build**: JSON operation answers consistently, in the route handlers (`{ success: true, data: ... }` ou `{ success: false, error: ... }`).
- **Data validation**: Validate data on the route handlers.
- **Error handling**: Every domain handles the errors happening in its own layer and the layers beneath, adding semanthics to it.
- **Clean Code**: SOLID patterns.

## Expected folder structure
```text
projetoacad/
├── app/
│   ├── api/                   # Route Handlers (endpoints REST)
│   ├── (auth)/                # Login/register screens
│   ├── workouts/              # Management/train execution screens
│   └── layout.tsx / page.tsx
├── components/                # (UI)
├── lib/
│   └── supabase/              # Supabase clients -- communication interface
├── agent/                     # LangGraph motor
├── docs/                      # Context and specs
└── tests/                     # Tests
```
