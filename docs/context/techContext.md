# Contexto Tecnológico (Tech Context)

## Stack Tecnológica
- **Banco de Dados & Autenticação**: Supabase (PostgreSQL)
- **Engine de Agentes de IA**: LangGraph + Python (`.venv/`)
- **Provedores de LLM**: Gemini / OpenAI / Anthropic (via API Keys configuradas)
- **Frontend / Aplicação Web**: Next.js / React (TypeScript) + Tailwind CSS (a inicializar)
- **Testes**: Jest/Vitest
## Futuramente
- **PWA**
- **Vercel**: deploy integrado com github.
## Variáveis de Ambiente Necessárias
Consulte `.env.example`:
- `SUPABASE_URL`: URL da instância do Supabase
- `SUPABASE_ANON_KEY`: Chave pública para o cliente do app
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço para operações administrativas
- `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: Chaves dos modelos de LLM
