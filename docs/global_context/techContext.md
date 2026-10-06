# Tech Context

## Tech Stack
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL)
- **Engine de Agentes de IA**: LangGraph + Python (`.venv/`)
- **Provedores de LLM**: Gemini / OpenAI / Anthropic (via API Keys)
- **Frontend / WebAPP**: Next.js / React (TypeScript) + Tailwind CSS
- **Testes**: Jest/Vitest
## For the future
- **PWA**
- **Vercel deploy**
## ENV variables necessary
Consult `.env`:
- `SUPABASE_URL`: Supabase instance URL
- `SUPABASE_ANON_KEY`: Public key to app client
- `SUPABASE_SERVICE_ROLE_KEY`: Service key for admin operations
- `GEMINI_API_KEY`: LLM model keys
