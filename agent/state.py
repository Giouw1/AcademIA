from typing import Annotated, Sequence
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """Estado do agente mantido durante o ciclo de execução."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
