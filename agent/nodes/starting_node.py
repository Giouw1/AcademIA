import pathlib
from typing import Dict, Any
import os
from agent.state import AgentState
from agent.tools.agent_tools import read_file
from agent.prompt import prompt
def consume_global_context(state:dict)-> Dict[str,any]:
    """
    Ingests static project documentation to ground the agent's behavior.
    This typically runs once at the beginning of the workflow.
    """
    WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    global_context_root = os.path.join(WORKSPACE_ROOT, r'docs\global_context' )
    paths = {
    "projectBrief_path":os.path.join(global_context_root,r"\projectBrief.md"),
    "systemPatterns_path":os.path.join(global_context_root,r"\systemPatterns.md"),
    "techContext_path":os.path.join(global_context_root,r"\techContext.md")
    }
    contexts = {}
    for key, path in paths:
        if path.exists(): #Checks it here, avoid including errors
            contexts[key] = read_file(path)
        else:
            contexts[key] = f"No {key.replace('_', ' ')} provided."
    agent_rules = prompt
    compiled_global_context = (
        f"=== AGENT RULES ===\n{agent_rules}\n\n"
        f"=== PROJECT BRIEF ===\n{contexts['project_brief']}\n\n"
        f"=== TECH STACK ===\n{contexts['tech_stack']}\n\n"
        f"=== CODING GUIDELINES ===\n{contexts['coding_guidelines']}"
    )
    return {"global_context": compiled_global_context}





