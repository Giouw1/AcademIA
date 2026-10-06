from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from agent.state import AgentState
from agent.graph import get_llm # Assuming you moved get_llm to a shared/tools module

"""Structure for the LLM to follow when creating an answer, so that we can interpret it"""
class TaskSelection(BaseModel):
    task_found: bool = Field(
        description="True if an actionable, uncompleted task was found in the tasks list. False if the tasks list is empty or all tasks are complete."
    )
    active_task: Optional[str] = Field(
        default=None, 
        description="The exact, verbatim text name of the next uncompleted task."
    )
    working_macro_task: Optional[str] = Field(
        default=None,
        description="The exact, verbatim text name of the active task's parent macro task."
    )
    working_spec: Optional[str] = Field(
        default=None,
        description="The exact, verbatim text name of the active task's parent macro task's spec."
    )
    reasoning: str = Field(
        description="Briefly explain why you chose this task, or why you concluded no tasks are available."
    )
def discover_next_task_node(state: AgentState, llm) -> Dict[str, Any]:
    """
    Parses the current state to determine the next actionable task.
    If a task is found, it feeds the active_task, working_macro_task, and working_spec.
    """
    llm = get_llm()
    structured_llm = llm.with_structured_output(TaskSelection)


    prompt = """You are a Tech Lead orchestrating a software engineering agent.\n"
            "Your job is to read the current project specs, macro-tasks, and granular tasks, "
            "and determine the very next granular task that needs to be executed.\n\n"
            "RULES:\n"
            "1. Look at the TASKS list. Find the first uncompleted task (e.g., an unchecked box or pending item).\n"
            "2. If you find one, set task_found=True. Extract the task EXACTLY as written into 'active_task'.\n"
            "3. Identify which MACRO TASK it belongs to, and extract that into 'working_macro_task'.\n"
            "4. Identify the relevant rules/requirements from the SPECS, and put them in 'working_spec'.\n"
            "5. If there are NO pending tasks, set task_found=False and leave the task fields null. This will trigger the planning workflow."""
    specs = f"=== SPECS ===\n{state[specs]}\n\n"
    macro_tasks = f"=== MACRO TASKS ===\n{state[macro_tasks]}\n\n"
    tasks = f"=== TASKS ===\n{state[tasks]}\n"


    #Invoking the llm to select the task and retrieve relevant data for the development of the task
    selection: TaskSelection = structured_llm.invoke(input=prompt+specs+macro_tasks+tasks)  

    if selection.task_found and selection.active_task:
        return {"active_task":selection.active_task,
                "working_spec":selection.working_spec,
                "working_macro_task": selection.working_macro_task,
                }
    else:
        return {
            "active_task": None,
            "working_macro_task": None,
            "working_spec": None
        }
  
