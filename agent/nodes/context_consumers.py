import pathlib
from typing import Dict, Any
import os
from agent.state import AgentState
from agent.tools.agent_tools import read_file, list_files
from agent.prompt import prompt
def global_consumer_node(state:dict)-> Dict[str,any]:
    """
    Ingests static project documentation to ground the agent's behavior.
    This typically runs once at the beginning of the workflow.
    """
    WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    global_context_root = os.path.join(WORKSPACE_ROOT, r'docs\global_context' )
    paths = {
    "project_brief":os.path.join(global_context_root,r"\projectBrief.md"),
    "system_patterns":os.path.join(global_context_root,r"\systemPatterns.md"),
    "tech_context":os.path.join(global_context_root,r"\techContext.md")
    }
    contexts = {}
    for key, path in paths.items():
        if os.path.exists(path): #Checks it here, avoid including errors
            contexts[key] = read_file(path)
        else:
            contexts[key] = f"No {key.replace('_', ' ')} provided."
    agent_rules = prompt
    compiled_global_context = (
        f"=== AGENT RULES ===\n{agent_rules}\n\n"
        f"=== PROJECT BRIEF ===\n{contexts['project_brief']}\n\n"
        f"=== TECH STACK ===\n{contexts['system_patterns']}\n\n"
        f"=== CODING GUIDELINES ===\n{contexts['tech_context']}"
    )
    return {"global_context": compiled_global_context}




def local_consumer_node(state: dict) -> Dict[str, Any]:
    """
    Ingests working project documentation to ground the agent's behavior.
    This typically runs every loop of the workflow, as the tasks are completed
    """
    WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    local_context_root = os.path.join(WORKSPACE_ROOT, 'docs', 'local_context')
    
    paths = {
        "tasks": os.path.join(local_context_root, "activeContext.md"),
        "macro_tasks": os.path.join(local_context_root, "progress.md"),
    }
    
    contexts = {}
    for key, path in paths.items(): 
        if os.path.exists(path):    
            contexts[key] = read_file(path)
        else:
            contexts[key] = f"No {key.replace('_', ' ')} provided."
            
    specs_path = os.path.join(local_context_root, "specs")
    
    # Check if directory exists before listing to avoid errors
    if os.path.exists(specs_path):
        specs_files = list_files(specs_path)
        loaded_specs = []
        for file_path in specs_files:
            loaded_specs.append(read_file(file_path)) 
        contexts["specs"] = "\n\n".join(loaded_specs) 
    else:
        contexts["specs"] = "No specs provided."

    return {
        "specs": contexts['specs'],
        "macro_tasks": contexts["macro_tasks"], 
        "tasks": contexts["tasks"]
    }