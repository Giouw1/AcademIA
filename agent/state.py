import operator
from typing import TypedDict, List, Optional, Annotated
from langchain_core.documents import Document
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages, ove

class AgentState(TypedDict):
    global_context: Annotated[List[BaseMessage], add_messages] #System prompt and context such as projectbrief, sustempartterns, techcontext, or agent rules
    local_context:Optional[Annotated[List[BaseMessage], add_messages]] #Context such as active context and progress
    working_spec: Optional[List[BaseMessage]] #Only the spec of the current task, for it to match the scope
    unfinished_specs: Optional[List[BaseMessage]]
    macro_tasks: Optional[List[BaseMessage]] #Current macro tasks to be done (overwrite, because it can change)
    active_task: Optional[BaseMessage]