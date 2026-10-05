import os
from typing import Literal
from dotenv import load_dotenv

from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

from agent.state import AgentState
from agent.prompts import AGENT_SYSTEM_PROMPT
from agent.tools.agent_tools import ALL_AGENT_TOOLS

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

def call_model(state: AgentState):
    """Nó principal que consulta o LLM vinculado às ferramentas."""
    llm = get_llm().bind_tools(ALL_AGENT_TOOLS)
    messages = state["messages"]
    
    # Injeta o prompt do sistema caso seja a primeira iteração
    if not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=AGENT_SYSTEM_PROMPT)] + list(messages)
        
    response = llm.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> Literal["tools", END]:
    """Decide se deve chamar ferramentas ou encerrar o ciclo."""
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

def build_agent_graph():
    """Monta e compila o grafo do agente com loop de feedback de ferramentas."""
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(ALL_AGENT_TOOLS))
    
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges("agent", should_continue, ["tools", END])
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()
