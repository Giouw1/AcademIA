from agent.state import AgentState
from langgraph.graph import StateGraph, MessagesState, START, END

def consume_global_context(state: AgentState)->None:
    