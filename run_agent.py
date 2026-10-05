import sys
from langchain_core.messages import HumanMessage
from agent.graph import build_agent_graph

def run_agent_cli():
    print("=" * 60)
    print("   Iniciando Agente Autônomo (LangGraph Engine)")
    print("=" * 60)
    
    app = build_agent_graph()
    
    print("\nDigite sua instrução para o agente (ou 'sair' para encerrar):")
    while True:
        try:
            user_input = input("\n[Usuário] > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["sair", "exit", "quit"]:
                print("Encerrando agente.")
                break
                
            print("\n[Agente em execução...]")
            inputs = {"messages": [HumanMessage(content=user_input)]}
            
            for event in app.stream(inputs, stream_mode="values"):
                last_message = event["messages"][-1]
                
            print(f"\n[Resposta do Agente]:\n{last_message.content}")
            
        except KeyboardInterrupt:
            print("\nEncerrado pelo usuário.")
            break
        except Exception as e:
            print(f"\n[Erro]: {str(e)}")

if __name__ == "__main__":
    run_agent_cli()
