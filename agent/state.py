import operator
from typing import TypedDict, List, Optional, Annotated
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages, ove

class AgentState(TypedDict):
    global_context: str #System prompt and context such as projectbrief, sustempartterns, techcontext, or agent rules
    local_context:str  #Context such as active context and progress
    specs: Optional[str]
    macro_tasks: Optional[List[str]] #Current macro tasks to be done (overwrite, because it can change)
    tasks: Optional[List[str]]
    working_spec: Optional[str] #Only the spec of the current task, for it to match the scope
    working_macro_task: Optional[str] #Only the macro task of the current task, for it to match the scope
    active_task: Optional[str]