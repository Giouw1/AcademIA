# Contexto Ativo (Active Context)

## Foco Atual
- Criação da primeira especificação incremental em `docs/specs/01_mvp_schema_and_workouts.md` (modelo de dados para treinos, exercícios, séries e histórico no Supabase).
- Inicialização da aplicação frontend para suportar a interface dos treinos.

## Decisões Recentes
- Definido o produto: **App de registro de performance de musculação (gym workout tracker)** focado em progressão de sobrecarga.
- Definida a stack: **Supabase (PostgreSQL)** para banco/auth + **LangGraph** para futuros agentes inteligentes (personal/nutrição).
- Definido fluxo incremental: criar o schema e core funcional do MVP antes de integrar os agentes autônomos.

## Próximos Passos
1. Detalhar o schema relacional mínimo em `docs/specs/01_mvp_schema_and_workouts.md`.
2. Preparar script SQL de criação de tabelas para aplicar no Supabase.
3. Configurar a estrutura da aplicação frontend (Next.js/React).
