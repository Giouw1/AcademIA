import os
import re
from typing import Dict, Any, Optional, List
from agent.state import AgentState

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def read_text_safe(rel_path: str) -> str:
    path = os.path.join(WORKSPACE_ROOT, rel_path)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def check_active_context_node(state: AgentState) -> Dict[str, Any]:
    """1. Analisa se há tarefa imediata pendente no activeContext.md."""
    content = read_text_safe("docs/context/activeContext.md")
    
    # Procura por itens pendentes [ ] na seção de Foco Atual ou Próximos Passos
    # ou texto explicito não marcado
    task_match = re.search(r"-\s*\[ \]\s*(.+)", content)
    if task_match:
        task = task_match.group(1).strip()
        return {"active_task": task}
    
    # Se não houver checkbox, verifica se há uma tarefa declarada em Foco Atual
    foco_match = re.search(r"## Foco Atual\s*\n+([^#\n]+)", content)
    if foco_match and "nenhuma tarefa" not in foco_match.group(1).lower() and "concluído" not in foco_match.group(1).lower():
        task = foco_match.group(1).strip().lstrip("-").strip()
        if task:
            return {"active_task": task}
            
    return {"active_task": None}

def check_specs_node(state: AgentState) -> Dict[str, Any]:
    """2. Verifica se há specs não finalizadas em docs/specs/."""
    specs_dir = os.path.join(WORKSPACE_ROOT, "docs", "specs")
    if not os.path.exists(specs_dir):
        return {"current_spec": None}
        
    spec_files = sorted([f for f in os.listdir(specs_dir) if f.endswith(".md") and not f.startswith("_")])
    for spec_file in spec_files:
        spec_content = read_text_safe(os.path.join("docs", "specs", spec_file))
        # Se contiver checkboxes pendentes [ ], ela não está finalizada
        if "- [ ]" in spec_content:
            return {"current_spec": f"docs/specs/{spec_file}"}
            
    return {"current_spec": None}

def check_progress_node(state: AgentState) -> Dict[str, Any]:
    """3. Verifica se o progress.md possui tarefas futuras a serem realizadas."""
    content = read_text_safe("docs/context/progress.md")
    
    # Procura tarefas não marcadas [ ] na seção O que falta fazer ou O que está em andamento
    pending_matches = re.findall(r"-\s*\[ \]\s*(.+)", content)
    if pending_matches:
        # Pega a primeira tarefa pendente
        return {"progress_task": pending_matches[0].strip()}
        
    return {"progress_task": None}

def compare_brief_node(state: AgentState) -> Dict[str, Any]:
    """4. Compara o escopo do projectbrief.md com o progress.md para encontrar lacunas."""
    brief = read_text_safe("docs/context/projectbrief.md")
    progress = read_text_safe("docs/context/progress.md")
    
    # Extrai escopo incluído no MVP do projectbrief
    mvp_section = re.search(r"## Escopo Inicial \(MVP\)(.*?)(##|$)", brief, re.DOTALL)
    if mvp_section:
        mvp_items = re.findall(r"-\s*(.+)", mvp_section.group(1))
        for item in mvp_items:
            clean_item = item.replace("[ ]", "").replace("[x]", "").strip()
            # Se o item do brief não estiver listado no progress.md
            if clean_item.lower() not in progress.lower():
                return {"brief_gap": clean_item}
                
    return {"brief_gap": None}
