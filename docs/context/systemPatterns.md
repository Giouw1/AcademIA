# Padrões de Sistema & Arquitetura (System Patterns)

## Arquitetura Geral
Aplicação Fullstack com **Next.js (App Router)**:
- **Frontend**: Componentes React com TypeScript e Tailwind CSS, otimizados para usabilidade mobile (telas de celular durante o treino na academia).
- **Backend**: **Route Handlers** em `app/api/**/route.ts` para processamento de requisições, endpoints REST e regras de negócio.
- **Banco de Dados**: Supabase (PostgreSQL) acessado via SDK do framework (`@supabase/supabase-js` / `@supabase/ssr`), garantindo consumo mínimo de conexões e proteção via Row Level Security (RLS).

## Padrões de Código
- **Estilo & Formatação**: TypeScript estrito, ESLint e Prettier.
- **Tratamento de Erros**: Respostas JSON consistentes nos Route Handlers (`{ success: true, data: ... }` ou `{ success: false, error: ... }`).
- **Validação de Dados**: Schemas com validação (ex: Zod) na entrada dos Route Handlers.
- **Clean Code**: Código respeitando padrões SOLID.

## Estrutura de Pastas Esperada
```text
projetoacad/
├── app/
│   ├── api/                   # Route Handlers (endpoints REST)
│   ├── (auth)/                # Telas de login / cadastro
│   ├── workouts/              # Telas de gerenciamento e execução de treinos
│   └── layout.tsx / page.tsx
├── components/                # Componentes reutilizáveis (UI)
├── lib/
│   └── supabase/              # Clientes inicializados do Supabase (browser e server)
├── agent/                     # Motor autônomo LangGraph
├── docs/                      # Memory Bank e especificações
└── tests/                     # Testes automatizados
```
