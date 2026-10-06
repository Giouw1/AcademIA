import os
import re
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from agent.state import AgentState
from agent.nodes.cascade_nodes import read_text_safe, WORKSPACE_ROOT

def populate_active_context_node(state: AgentState, llm) -> Dict[str, Any]:
    """
    Pega a spec pendente (current_spec) e desdobra em tarefas de curto prazo
    atualizando docs/context/activeContext.md.
    """
    spec_path = state.get("current_spec")
    spec_content = read_text_safe(spec_path) if spec_path else ""
    
    prompt = (
        f"A seguinte especificação foi selecionada para desenvolvimento:\n"
        f"Arquivo: {spec_path}\n\n"
        f"Conteúdo da Spec:\n{spec_content}\n\n"
        f"INSTRUÇÃO:\n"
        f"Extraia o primeiro passo imediato e objetivo a ser implementado.\n"
        f"Responda APENAS com uma frase curta descrevendo a tarefa imediata."
    )
    
    res = llm.invoke([HumanMessage(content=prompt)])
    task_desc = res.content.strip()
    
    # Atualiza activeContext.md com a tarefa imediata
    active_path = os.path.join(WORKSPACE_ROOT, "docs", "context", "activeContext.md")
    new_active = (
        f"# Contexto Ativo (Active Context)\n\n"
        f"## Foco Atual\n"
        f"- [ ] {task_desc}\n\n"
        f"## Spec em Execução\n"
        f"- {spec_path}\n\n"
        f"## Próximos Passos\n"
        f"1. Implementar testes unitários para a tarefa.\n"
        f"2. Implementar código da funcionalidade.\n"
        f"3. Executar e validar com run_tests.\n"
    )
    with open(active_path, "w", encoding="utf-8") as f:
        f.write(new_active)
        
    return {"active_task": task_desc}

def create_spec_node(state: AgentState, llm) -> Dict[str, Any]:
    """
    Pega a próxima tarefa do progress.md e cria uma nova Spec em docs/specs/
    utilizando docs/specs/_template.md.
    """
    progress_task = state.get("progress_task") or "Nova Funcionalidade"
    template = read_text_safe("docs/specs/_template.md")
    tech = read_text_safe("docs/context/techContext.md")
    
    prompt = (
        f"Tarefa identificada no progress.md: '{progress_task}'\n\n"
        f"Stack tecnológica do projeto:\n{tech}\n\n"
        f"Template de especificação:\n{template}\n\n"
        f"Gere o conteúdo completo de uma especificação formal em Markdown (.md) "
        f"preenchendo todos os tópicos do template para esta tarefa."
    )
    
    res = llm.invoke([HumanMessage(content=prompt)])
    spec_content = res.content.strip()
    
    # Determina o nome do arquivo da spec
    clean_name = re.sub(r"[^a-zA-Z0-9_]+", "_", progress_task.lower()).strip("_")[:30]
    specs_dir = os.path.join(WORKSPACE_ROOT, "docs", "specs")
    os.makedirs(specs_dir, exist_ok=True)
    existing = [f for f in os.listdir(specs_dir) if f.endswith(".md") and not f.startswith("_")]
    next_idx = len(existing) + 1
    file_name = f"{next_idx:02d}_{clean_name}.md"
    target_path = os.path.join(specs_dir, file_name)
    
    with open(target_path, "w", encoding="utf-8") as f:
        f.write(spec_content)
        
    rel_path = f"docs/specs/{file_name}"
    return {"current_spec": rel_path}

def update_progress_from_brief_node(state: AgentState, llm) -> Dict[str, Any]:
    """
    Adiciona a funcionalidade faltante do projectbrief.md ao progress.md.
    """
    gap = state.get("brief_gap") or "Funcionalidade pendente do MVP"
    progress_path = os.path.join(WORKSPACE_ROOT, "docs", "context", "progress.md")
    current_progress = read_text_safe("docs/context/progress.md")
    
    # Insere na seção 'O que falta fazer'
    if "## O que falta fazer" in current_progress:
        updated = current_progress.replace(
            "## O que falta fazer",
            f"## O que falta fazer\n- [ ] {gap}"
        )
    else:
        updated = current_progress + f"\n\n## O que falta fazer\n- [ ] {gap}\n"
        
    with open(progress_path, "w", encoding="utf-8") as f:
        f.write(updated)
        
    return {"progress_task": gap}
