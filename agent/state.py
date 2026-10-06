import operator
from typing import TypedDict, List, Optional, Annotated
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages, ove

class AgentState(TypedDict):
    global_context: str #System prompt and context such as projectbrief, sustempartterns, techcontext, or agent rules
    local_context:str  #Context such as active context and progress
    
    working_spec: Optional[str] #Only the spec of the current task, for it to match the scope
    unfinished_specs: List[str]
    macro_tasks: List[str] #Current macro tasks to be done (overwrite, because it can change)
    active_task: Optional[str]