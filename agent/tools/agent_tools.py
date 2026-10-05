import os
import subprocess
from langchain_core.tools import tool

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def _resolve_safe_path(rel_or_abs_path: str) -> str:
    """Garante que os arquivos fiquem restritos ao diretório do projeto."""
    target = os.path.abspath(os.path.join(WORKSPACE_ROOT, rel_or_abs_path))
    if not target.startswith(WORKSPACE_ROOT):
        raise ValueError(f"Acesso negado: {rel_or_abs_path} está fora da raiz do projeto.")
    return target

@tool
def read_file(file_path: str) -> str:
    """Lê o conteúdo textual de um arquivo no repositório (ex.: arquivos .md de specs/contexto ou código)."""
    try:
        path = _resolve_safe_path(file_path)
        if not os.path.exists(path):
            return f"Erro: Arquivo '{file_path}' não encontrado."
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Erro ao ler arquivo: {str(e)}"

@tool
def write_file(file_path: str, content: str) -> str:
    """Cria ou sobrescreve um arquivo no projeto com o conteúdo fornecido."""
    try:
        path = _resolve_safe_path(file_path)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Arquivo '{file_path}' escrito com sucesso."
    except Exception as e:
        return f"Erro ao escrever arquivo: {str(e)}"

@tool
def list_files(directory: str = ".") -> str:
    """Lista arquivos em um diretório do projeto para exploração de contexto."""
    try:
        path = _resolve_safe_path(directory)
        if not os.path.exists(path):
            return f"Erro: Diretório '{directory}' não encontrado."
        entries = os.listdir(path)
        return "\n".join(entries) if entries else "Diretório vazio."
    except Exception as e:
        return f"Erro ao listar diretório: {str(e)}"

@tool
def run_pytest(test_path: str = "tests") -> str:
    """Executa os testes automatizados com pytest e retorna o resultado detalhado."""
    try:
        venv_pytest = os.path.join(WORKSPACE_ROOT, ".venv", "Scripts", "pytest.exe")
        pytest_cmd = venv_pytest if os.path.exists(venv_pytest) else "pytest"
        result = subprocess.run(
            [pytest_cmd, test_path, "-v"],
            cwd=WORKSPACE_ROOT,
            capture_output=True,
            text=True
        )
        output = result.stdout + ("\n" + result.stderr if result.stderr else "")
        status = "PASSED" if result.returncode == 0 else "FAILED"
        return f"Status: {status}\n\nSaída:\n{output.strip()}"
    except Exception as e:
        return f"Erro ao executar pytest: {str(e)}"

@tool
def run_git_command(command: str) -> str:
    """Executa comandos git seguros (status, diff, add, commit, init) dentro do repositório."""
    allowed_subcommands = ["status", "diff", "add", "commit", "branch", "log", "init"]
    parts = command.strip().split()
    if not parts or parts[0] != "git":
        return "Erro: O comando deve começar com 'git'."
    if len(parts) > 1 and parts[1] not in allowed_subcommands:
        return f"Erro: Subcomando '{parts[1]}' não permitido. Permitidos: {', '.join(allowed_subcommands)}"

    try:
        result = subprocess.run(
            command,
            cwd=WORKSPACE_ROOT,
            shell=True,
            capture_output=True,
            text=True
        )
        return result.stdout or result.stderr or "Comando executado sem saída."
    except Exception as e:
        return f"Erro ao executar git: {str(e)}"

ALL_AGENT_TOOLS = [read_file, write_file, list_files, run_pytest, run_git_command]
