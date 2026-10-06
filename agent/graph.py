import os
from typing import Literal, Dict, Any
from dotenv import load_dotenv

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

from agent.state import AgentState
from agent.tools.agent_tools import ALL_AGENT_TOOLS
from agent.nodes.cascade_nodes import (
    check_active_context_node,
    check_specs_node,
    check_progress_node,
    compare_brief_node
)
from agent.nodes.generation_nodes import (
    populate_active_context_node,
    create_spec_node,
    update_progress_from_brief_node
)
from agent.nodes.tdd_nodes import execute_tdd_node
from agent.nodes.review_node import human_review_node

load_dotenv()

def get_llm():
    """Inicializa o modelo configurado no .env (Gemini, OpenAI ou Anthropic)."""
    if os.getenv("GEMINI_API_KEY"):
        from langchain_google_genai import ChatGoogleGenerativeAI
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.1
        )
    elif os.getenv("OPENAI_API_KEY"):
        from langchain_openai import ChatOpenAI
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o")
        return ChatOpenAI(
            model=model_name,
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.1
        )
    elif os.getenv("ANTHROPIC_API_KEY"):
        from langchain_anthropic import ChatAnthropic
        model_name = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
        return ChatAnthropic(
            model=model_name,
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            temperature=0.1
        )
    else:
        raise ValueError(
            "Nenhuma chave de API detectada no .env. Configure GEMINI_API_KEY, OPENAI_API_KEY ou ANTHROPIC_API_KEY."
        )

# Wrappers para injetar o LLM nos nós geradores
def call_tdd_node(state: AgentState):
    return execute_tdd_node(state, get_llm())

def call_populate_active_node(state: AgentState):
    return populate_active_context_node(state, get_llm())

def call_create_spec_node(state: AgentState):
    return create_spec_node(state, get_llm())

def call_update_progress_node(state: AgentState):
    return update_progress_from_brief_node(state, get_llm())

# Decisores condicionais da máquina de estados
def route_after_active_context(state: AgentState) -> Literal["execute_tdd", "check_specs"]:
    return "execute_tdd" if state.get("active_task") else "check_specs"

def route_after_specs(state: AgentState) -> Literal["populate_active", "check_progress"]:
    return "populate_active" if state.get("current_spec") else "check_progress"

def route_after_progress(state: AgentState) -> Literal["create_spec", "compare_brief"]:
    return "create_spec" if state.get("progress_task") else "compare_brief"

def route_after_brief(state: AgentState) -> Literal["update_progress", "human_review"]:
    return "update_progress" if state.get("brief_gap") else "human_review"

def route_after_tdd(state: AgentState) -> Literal["tools", "human_review"]:
    """Se o modelo pediu chamadas de ferramentas, direciona para o ToolNode."""
    last_msg = state["messages"][-1]
    if hasattr(last_msg, "tool_calls") and last_msg.tool_calls:
        return "tools"
    return "human_review"

def route_after_tools(state: AgentState) -> Literal["execute_tdd", "human_review"]:
    """
    Após o ToolNode executar as ferramentas:
    Verifica se a tool de finalização submit_task_report foi executada.
    Se sim, intercepta seus dados e encaminha para human_review.
    Caso contrário, volta para o execute_tdd continuar o loop.
    """
    messages = state.get("messages", [])
    # Procura a mensagem de tool mais recente
    for msg in reversed(messages):
        if hasattr(msg, "name") and msg.name == "submit_task_report":
            # Extrai os dados submetidos pelo modelo na chamada anterior
            for prev_msg in reversed(messages):
                if hasattr(prev_msg, "tool_calls") and prev_msg.tool_calls:
                    for tc in prev_msg.tool_calls:
                        if tc.get("name") == "submit_task_report":
                            state["report"] = tc.get("args", {})
                            return "human_review"
            return "human_review"
    return "execute_tdd"

def build_agent_graph():
    """Monta a máquina de estados completa desenhada pelo usuário."""
    workflow = StateGraph(AgentState)
    
    # 1. Nós da Cascata Hierárquica
    workflow.add_node("check_active_context", check_active_context_node)
    workflow.add_node("check_specs", check_specs_node)
    workflow.add_node("check_progress", check_progress_node)
    workflow.add_node("compare_brief", compare_brief_node)
    
    # 2. Nós de Expansão e Desdobramento
    workflow.add_node("update_progress", call_update_progress_node)
    workflow.add_node("create_spec", call_create_spec_node)
    workflow.add_node("populate_active", call_populate_active_node)
    
    # 3. Nós de Execução TDD & Tools
    workflow.add_node("execute_tdd", call_tdd_node)
    workflow.add_node("tools", ToolNode(ALL_AGENT_TOOLS))
    
    # 4. Nó de Human-in-the-Loop & Parada
    workflow.add_node("human_review", human_review_node)
    
    # --- Roteamento e Arestas ---
    workflow.add_edge(START, "check_active_context")
    
    # Nível 1: activeContext
    workflow.add_conditional_edges(
        "check_active_context",
        route_after_active_context,
        {"execute_tdd": "execute_tdd", "check_specs": "check_specs"}
    )
    
    # Nível 2: docs/specs/
    workflow.add_conditional_edges(
        "check_specs",
        route_after_specs,
        {"populate_active": "populate_active", "check_progress": "check_progress"}
    )
    workflow.add_edge("populate_active", "execute_tdd")
    
    # Nível 3: progress.md
    workflow.add_conditional_edges(
        "check_progress",
        route_after_progress,
        {"create_spec": "create_spec", "compare_brief": "compare_brief"}
    )
    workflow.add_edge("create_spec", "populate_active")
    
    # Nível 4: projectbrief.md
    workflow.add_conditional_edges(
        "compare_brief",
        route_after_brief,
        {"update_progress": "update_progress", "human_review": "human_review"}
    )
    workflow.add_edge("update_progress", "create_spec")
    
    # Loop TDD: LLM -> Tools -> Análise pós-tools
    workflow.add_conditional_edges(
        "execute_tdd",
        route_after_tdd,
        {"tools": "tools", "human_review": "human_review"}
    )
    workflow.add_conditional_edges(
        "tools",
        route_after_tools,
        {"execute_tdd": "execute_tdd", "human_review": "human_review"}
    )
    
    # Encerramento no Human Review
    workflow.add_edge("human_review", END)
    
    return workflow.compile()
