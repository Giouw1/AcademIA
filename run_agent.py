import sys
from langchain_core.messages import HumanMessage
from agent.graph import build_agent_graph

def run_agent_cli():
    print("=" * 65)
    print("   MOTOR AGENTIC LANGGRAPH: EXECUÇÃO EM CASCATA DETERMINÍSTICA")
    print("=" * 65)
    print("Regras ativas: AGENT_RULES.md (Human-in-the-Loop & Stop-and-Report)")
    
    app = build_agent_graph()
    
    print("\n[Pressione ENTER para rodar o próximo ciclo do agente (ou digite 'sair')]:")
    while True:
        try:
            user_input = input("\n[Usuário] > ").strip()
            if user_input.lower() in ["sair", "exit", "quit"]:
                print("Encerrando motor do agente.")
                break
                
            prompt_text = user_input if user_input else "Execute o próximo passo da cascata de contexto."
            print("\n[Agente analisando cascata: activeContext -> specs -> progress -> brief...]")
            
            inputs = {
                "messages": [HumanMessage(content=prompt_text)],
                "active_task": None,
                "current_spec": None,
                "progress_task": None,
                "brief_gap": None,
                "report": None,
                "status": "IN_PROGRESS"
            }
            
            # Limite de segurança de 30 passos por ciclo para proteger a API key de loops infinitos
            config = {"recursion_limit": 30}
            for event in app.stream(inputs, config=config, stream_mode="values"):
                pass
                
        except KeyboardInterrupt:
            print("\nEncerrado pelo usuário.")
            break
        except Exception as e:
            if "recursion_limit" in str(e).lower() or "GraphRecursionError" in str(e):
                print("\n[Alerta de Proteção]: Limite de passos por ciclo atingido (30 passos).")
                print("O agente foi pausado preventivamente para evitar consumo excessivo da sua API key.")
            else:
                print(f"\n[Erro na execução do ciclo]: {str(e)}")

if __name__ == "__main__":
    run_agent_cli()
