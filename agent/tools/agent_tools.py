import os
import subprocess
from typing import List, Optional
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
    """Lê o conteúdo textual de um arquivo no repositório (ex.: .env, specs, docs de contexto ou código)."""
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
def run_tests(command: str = "auto") -> str:
    """Executa os testes automatizados do projeto (npm test para Next.js ou pytest para Python)."""
    try:
        if command == "auto":
            package_json = os.path.join(WORKSPACE_ROOT, "package.json")
            if os.path.exists(package_json):
                cmd = "npm test"
            else:
                venv_pytest = os.path.join(WORKSPACE_ROOT, ".venv", "Scripts", "pytest.exe")
                cmd = f"{venv_pytest} tests -v" if os.path.exists(venv_pytest) else "pytest tests -v"
        else:
            cmd = command

        result = subprocess.run(
            cmd,
            cwd=WORKSPACE_ROOT,
            shell=True,
            capture_output=True,
            text=True
        )
        output = result.stdout + ("\n" + result.stderr if result.stderr else "")
        status = "PASSED" if result.returncode == 0 else "FAILED"
        return f"Comando: {cmd}\nStatus: {status}\n\nSaída:\n{output.strip()}"
    except Exception as e:
        return f"Erro ao executar testes: {str(e)}"

@tool
def run_git_command(command: str) -> str:
    """Executa comandos git seguros (status, diff, add, commit, branch, checkout, log)."""
    allowed_subcommands = ["status", "diff", "add", "commit", "branch", "checkout", "log"]
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

@tool
def submit_task_report(
    summary: str,
    files_changed: List[str],
    test_status: str,
    next_step: str,
    docs_updated: Optional[List[str]] = None
) -> str:
    """
    Submete a conclusão formal de uma tarefa/ciclo para revisão humana.
    Deve ser chamada após o término da implementação, garantia de testes e atualização dos docs.
    Esta chamada aciona a parada e aguarda aprovação humana.
    """
    return (
        f"[RELATÓRIO ENVIADO PARA REVISÃO HUMANA]\n"
        f"Resumo: {summary}\n"
        f"Arquivos Alterados: {', '.join(files_changed)}\n"
        f"Status dos Testes: {test_status}\n"
        f"Docs Atualizados: {', '.join(docs_updated or [])}\n"
        f"Próximo Passo Sugerido: {next_step}"
    )

ALL_AGENT_TOOLS = [
    read_file,
    write_file,
    list_files,
    run_tests,
    run_git_command,
    submit_task_report
]
