from dotenv import load_dotenv
#Node imports
from agent.nodes.starting_node import global_consumer_node

from agent.state import AgentState
from langgraph.graph import StateGraph, MessagesState, START, END
load_dotenv()

def get_llm():
    






def build_graph()->StateGraph:
    llm = get_llm()
    graph = StateGraph(AgentState)
    graph.add_node("global_context",global_consumer_node)