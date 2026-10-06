import pathlib
from typing import Dict, Any
import os
from agent.state import AgentState
from agent.tools.agent_tools import read_file
def consume_global_context(state:AgentState)-> Dict[str,any]:
    """
    Ingests static project documentation to ground the agent's behavior.
    This typically runs once at the beginning of the workflow.
    """
    WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    global_context_root = os.path.join(WORKSPACE_ROOT, r'docs\global_context' )
    projectBrief_path = os.path.join(global_context_root,r"\projectBrief.md")
    systemPatterns_path = os.path.join(global_context_root,r"\systemPatterns.md")
    techContext_path = os.path.join(global_context_root,r"\techContext.md")
    full_content = read_file(projectBrief_path).join(read_file(techContext_path))
    full_content.join(read_file(systemPatterns_path)) 
    state.global_context = full_content





