# Padrões de Sistema & Arquitetura (System Patterns)

## Arquitetura Geral
Monorepo, com separação interna de frontend e backend

## Padrões de Código
- **Estilo & Formatação**: Linter e formatador consistentes (ESLint, Prettier, Black/Ruff se Python).
- **Tipagem**: TypeScript estrito (ou tipagem forte no backend com Pydantic / dataclasses).
- **Tratamento de Erros**: Estratégia unificada de respostas e logs.
- **Design Patterns** valorize o desacoplamento e a legibilidade do código, ao invés de um funcionalidades bloated.
## Convenções de Pastas
- `src/`: Código da aplicação.
- `docs/`: Documentação viva e especificações.
