import os
import subprocess
from typing import List, Optional
from langchain_core.tools import tool

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def resolve_safe_path(file_path:str):
    """Checks if it is in the project scope"""
    target = os.path.abspath(os.path.join(WORKSPACE_ROOT,file_path))
    """If the file_path is absolute, join will discard workspace root, in that case, 
        the check belows is important"""
    if not target.startswith(WORKSPACE_ROOT):
        raise PermissionError(f"The path falls out of the project root: {WORKSPACE_ROOT}")
    return target
@tool
def read_file(file_path: str):
    """Fetches the file data for the agent"""
    try:
        path = resolve_safe_path(file_path)
        if not os.path.exists(path):
            return f"Error: there is no such file at path: {path}."
        with open(file=path, mode="r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error: {str(e)}"
@tool
def write_file(file_path:str, content:str)->str:
    """Allows agents to overwrite files or write new files"""
    try:
        path = resolve_safe_path(file_path=file_path)
        os.makedirs(name = path, exist_ok=True)
        with open(file=path, mode='r', encoding="utf-8") as f:
            f.write(content)
            return f"File at path {path} written with success"
    except Exception as e:
        return f"Error: {str(e)}"
@tool
def list_files(folder_path:str)->str:
    """List the folder files to allow agent exploration"""
    try:
        path = resolve_safe_path(file_path=folder_path)
        if not os.path.exists(path):
            return f"Erro: Directory '{folder_path}' not found."
        entries = os.listdir(path)
        return "\n".join(entries) if entries else "Empty directory."
    except Exception as e:
        return f"Error: {str(e)}"


