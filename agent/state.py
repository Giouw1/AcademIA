import operator
from typing import TypedDict, List, Optional, Annotated
from langchain_core.documents import Document
class AgentState(TypedDict):
    global_context: Annotated[List[Document], operator.add]
    local_context:Annotated[List[Document], operator.add]
    unfinished_specs:
    macro_tasks:
    active_tasks:
    work_summary: