# AcademIA
AcademIA é um projeto para facilitar o registro de treinos da academia e um visão geral sobre progresso individual.
Todo o código do aplicativo vai ser gerado por agentes de IA.
**Disclaimer**
Na verdade, o escopo do projeto mudou. Inicialmente, era um projeto e tinha como objetivo desenvolver o meu spec-driven design. 

Quando comecei a me aventurar nesse padrão de desenvolvimento, fiquei um pouco cético em relação à capacidade do desenvolvimento usando os modelos de IA, apenas escrevendo os specs e o contexto global, achando que seria fácil o modelo se perder em relação ao que deveria fazer, o escopo das tasks sem bagunçar todo a estrutura de desenvolvimento. Não acreditei no desenvolvimento incremental pelo spec driven design.

Além disso, não sabia como entender o que cada iteração do modelo estaria fazendo.

Por isso, pesquisei formas de amarrar a minha interação de modelo para que cada etapa da interação fique mais definida, e fique claro o que esperar de cada uma delas. A falta de controle também me deixou assustado.

Descobri que muitas ferramentas de mercado já lidam com isso, e fazem toda essa gestão por baixo dos panos, mas, por curiosidade, resolvi desenvolver meu próprio fluxo, ou o formato de interação com o modelo de IA, usando **LangGraph** como o orquestrador de fluxo do agente que gera o código.

Portanto, estou no momento desenvolvendo o fluxo de iteração do modelo para permitir que o código seja gerado sem gastos excessivos de tokens por contexto, sem (com menos) alucinações, e de forma com que eu tenha controle (Human In The Loop) do que está sendo feito.
