from dotenv import load_dotenv
import os
import functools
from langchain_google_genai import ChatGoogleGenerativeAI

#Node imports
from agent.nodes.context_consumers import global_consumer_node, local_consumer_node
from agent.nodes.task_selector import discover_next_task_node
from agent.state import AgentState
from langgraph.graph import StateGraph, MessagesState, START, END
load_dotenv()

def get_llm():
    """Inicializa o modelo configurado no .env (Gemini, OpenAI ou Anthropic)."""
    if os.getenv("GEMINI_API_KEY"):
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.1
        )

    

def build_graph()->StateGraph:
    llm = get_llm()
    graph = StateGraph(AgentState)

    #Adding nodes and edges according to the global flow.

    graph.add_node("global_context",global_consumer_node)

    graph.add_node("local_context",local_consumer_node)

    graph.add_edge(start_key=START,end_key="global_context")

    graph.add_edge(start_key="global_context",end_key="local_context")

    #The idea of this functools.partial is to avoid another llm instantiation inside of the node
    #It pre-fills the parameter LLM with llm, for every next call. Excellent!
    task_discovery_with_llm = functools.partial(discover_next_task_node, llm=llm)
    
    graph.add_node("discover_next_task", task_discovery_with_llm)
    graph.add_edge(start_key="local_context", end_key="global_context")
    
    return graph.compile()