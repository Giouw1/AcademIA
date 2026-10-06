from typing import Dict, Any
from agent.state import AgentState

def human_review_node(state: AgentState) -> Dict[str, Any]:
    """
    Exibe o relatório de entrega detalhado e aguarda a revisão do usuário.
    """
    report = state.get("report") or {}
    
    print("\n" + "=" * 65)
    print("   [HUMAN-IN-THE-LOOP] RELATÓRIO DE CONCLUSÃO DO CICLO")
    print("=" * 65)
    
    if report:
        print(f"\n📌 Resumo da Entrega: {report.get('summary', 'Tarefa finalizada.')}")
        print(f"📁 Arquivos Alterados: {', '.join(report.get('files_changed', []))}")
        print(f"🧪 Status dos Testes: {report.get('test_status', 'N/A')}")
        if report.get('docs_updated'):
            print(f"📝 Documentação Atualizada: {', '.join(report.get('docs_updated'))}")
        print(f"➡️ Próximo Passo Sugerido: {report.get('next_step', 'Aguardando definição')}")
    else:
        # Se veio por finalização direta
        last_msg = state["messages"][-1].content if state.get("messages") else "Ciclo concluído."
        print(f"\n{last_msg}")
        
    print("=" * 65)
    print("O agente está pausado aguardando sua revisão.")
    print("Para aprovar e disparar a próxima tarefa, basta responder ao agente.")
    
    return {"status": "READY_FOR_REVIEW"}
