# GUIA DEFINITIVO: REGRAS DO AGENTE (AGENT_RULES.md)

> **ATENÇÃO: ESTE DOCUMENTO É A FONTE ÚNICA DA VERDADE (SINGLE SOURCE OF TRUTH).**
> Tanto o assistente desta IDE quanto o motor autônomo local (`run_agent.py` / LangGraph) operam estritamente sob estas regras.

---

## 1. Princípios Inegociáveis

1. **Context-First (Memória Persistente)**:
   - Antes de iniciar qualquer tarefa nova, consulte a pasta [docs/context/](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/).
   - Verifique sempre [activeContext.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/activeContext.md) para saber o foco atual.
   - Consulte [systemPatterns.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/systemPatterns.md) para respeitar padrões arquiteturais adotados.

2. **Desenvolvimento Orientado a Especificações (Spec-Driven)**:
   - Qualquer funcionalidade nova DEVE ter uma especificação correspondente em `docs/specs/<nome_da_feature>.md`.
   - O desenvolvimento é incremental: implementa-se apenas o escopo da especificação atual.

3. **Manutenção de Estado & Comunicação**:
   - Ao concluir uma alteração relevante ou antes de encerrar um ciclo de trabalho, atualize [activeContext.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/activeContext.md) e [progress.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/progress.md).
   - Nunca faça suposições silenciosas sobre regras de negócio não especificadas. Pergunte nesses casos.

4. **Qualidade & Consistência de Código**:
   - Mantenha testes e tipagem estrita sempre atualizados.
   - Evite misturar múltiplos objetivos em uma única alteração. Trabalhe em passos incrementais e verificáveis.
   - Após toda tarefa cumprida, **execute os testes com pytest**.

---

## 2. Ferramentas Disponíveis para o Agente LangGraph

O motor autônomo opera através das ferramentas em [agent/tools/agent_tools.py](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/agent/tools/agent_tools.py):
- `read_file`: Leitura de especificações, documentação e arquivos de código.
- `write_file`: Criação e edição de código e documentação.
- `list_files`: Mapeamento de diretórios do repositório.
- `run_pytest`: Execução de testes automatizados com relatório de erros.
- `run_git_command`: Controle de versão seguro (status, diff, add, commit, branch).

---

## 3. Workflow de Execução de Tarefas

1. **Planejamento / Especificação**:
   - Para novas features, crie ou valide a especificação em `docs/specs/<feature-name>.md` e crie uma branch de trabalho com git.
2. **Execução Incremental**:
   - Implemente o código seguindo as convenções de [systemPatterns.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/systemPatterns.md).
3. **Verificação**:
   - Rode testes com `pytest` (ou tool `run_pytest`). Se falhar, corrija até obter sucesso.
4. **Sincronização de Contexto**:
   - Registre o avanço em [progress.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/progress.md) e planeje os próximos passos em [activeContext.md](file:///c:/Users/nb1_l/Documents/Giovanni/projetos/projetoacad/docs/context/activeContext.md).
5. **Atualização do repositório de trabalho**:
   - Salve as atualizações usando comandos git no repositório.
