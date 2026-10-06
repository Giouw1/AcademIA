from typing import Annotated, Sequence, Optional, Dict, Any, List
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """Estado persistente durante o ciclo da máquina de estados do LangGraph."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
    # Rastreamento da cascata hierárquica
    active_task: Optional[str]              # Tarefa imediata encontrada em activeContext.md
    current_spec: Optional[str]             # Nome/caminho da spec pendente
    progress_task: Optional[str]            # Próxima tarefa identificada em progress.md
    brief_gap: Optional[str]                # Funcionalidade identificada em projectbrief.md
    
    # Relatório final submetido para o human-in-the-loop
    report: Optional[Dict[str, Any]]
    status: Optional[str]                   # 'IN_PROGRESS', 'READY_FOR_REVIEW', 'ALL_COMPLETE'
