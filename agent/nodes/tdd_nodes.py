import os
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from agent.state import AgentState
from agent.prompts import AGENT_SYSTEM_PROMPT
from agent.tools.agent_tools import ALL_AGENT_TOOLS
from agent.nodes.cascade_nodes import read_text_safe

def load_full_context_prompt() -> str:
    """Lê nativamente os arquivos de contexto para compor o System Prompt."""
    active = read_text_safe("docs/context/activeContext.md")
    tech = read_text_safe("docs/context/techContext.md")
    patterns = read_text_safe("docs/context/systemPatterns.md")
    
    return (
        f"{AGENT_SYSTEM_PROMPT}\n\n"
        f"--- CONTEXTO ATUAL DO PROJETO ---\n\n"
        f"### activeContext.md:\n{active}\n\n"
        f"### techContext.md:\n{tech}\n\n"
        f"### systemPatterns.md:\n{patterns}\n"
    )

def execute_tdd_node(state: AgentState, llm):
    """
    Nó que aciona o LLM com as ferramentas para implementar a tarefa:
    1. Cria os testes unitários
    2. Escreve a funcionalidade definida para momento (active_task)
    3. Roda run_tests
    4. Atualiza os arquivos de contexto
    5. Chama submit_task_report para concluir
    """
    system_prompt = load_full_context_prompt()
    task = state.get("active_task") or "Implementar a funcionalidade ativa"
    
    instruction = (
        f"TAREFA IMEDIATA PARA EXECUTAR:\n"
        f"'{task}'\n\n"
        f"DIRETRIZES TDD:\n"
        f"1. Crie os arquivos de teste correspondentes usando `write_file`.\n"
        f"2. Crie ou modifique a implementação do código para que o teste seja satisfeito.\n"
        f"3. Execute `run_tests` e certifique-se de que o status é PASSED. Se falhar, corrija em loop.\n"
        f"4. Atualize os arquivos de documentação (`activeContext.md`, `progress.md` e a spec se aplicável).\n"
        f"5. OBRIGATÓRIO: Chame a ferramenta `submit_task_report` fornecendo o resumo, arquivos alterados, "
        f"status dos testes e o próximo passo para parar o ciclo e submeter ao human-in-the-loop."
    )
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=instruction)
    ]
    
    if state.get("messages"):
        messages.extend(state["messages"])
        
    llm_with_tools = llm.bind_tools(ALL_AGENT_TOOLS)
    response = llm_with_tools.invoke(messages)
    
    return {"messages": [response]}
