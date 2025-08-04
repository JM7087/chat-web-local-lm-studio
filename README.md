# Chat Web Local LM Studio

Este é um chat web desenvolvido para interagir com modelos de linguagem locais através do LM Studio. A aplicação permite conversas em tempo real com modelos de IA executados localmente, oferecendo uma interface moderna e responsiva que se adapta perfeitamente a dispositivos desktop e mobile.

## Funcionalidades

- Interface de chat moderna e intuitiva
- Conecta-se automaticamente ao LM Studio local
- Suporte a múltiplos modelos de linguagem
- Formatação de texto com suporte a **negrito**, *itálico* e `código`
- Indicador de status de conexão em tempo real
- Scroll automático para novas mensagens
- Interface responsiva para dispositivos móveis
- Animação de carregamento durante as respostas
- Configuração flexível de servidor e modelo

<h2 align="center">Capturas de Tela PC</h2>

<p align="center">
  <img src="https://blogger.googleusercontent.com/img/a/AVvXsEj4ajTvvwQ8WzX-uNYM7SHiwikE5Y2mcLZGTUv6nfLvj-WcIKlWBiwcApB8yrVgDxh6qBCtuDgQBZsW8WklUCpjgIMtiaClpRdgdCSx0bPHvxeZSt7Y-45TOmBql0Hkmp2hker6570OFR4zjOrSNvlzzdmQWoLUF1P4K3jsIAYJbZr2oUNdohenpmvN33MU" width="800" alt="Interface do Chat no Desktop">
</p>

<h2 align="center">Capturas de Tela Celular</h2>

<p align="center">
  <img src="https://blogger.googleusercontent.com/img/a/AVvXsEjNxMfG_d7jM1wwJPI6gkmZbP6iCcDZTaXEX6tKk5N-858uh4zHhMsIvtbTS038s8-n6mWugJIrTtDdO4nRvGcfpb4N592JzK75XRCQ9LL9VshWRtteeCH_T_rxSD8W76_vGuYGFa0CFbgVsTGnw8l9MET0rMcV-HheuRq0GBaa4IMFjgsHC-lVNX3Bcvah" alt="Interface do Chat no Mobile">
</p>

## Tecnologias Utilizadas

- **HTML**: Estrutura da aplicação
- **CSS**: Estilização moderna com gradientes e responsividade
- **JavaScript**: Lógica de chat e integração com API
- **LM Studio API**: Comunicação com modelos de linguagem locais
- **Fetch API**: Requisições HTTP assíncronas

## Como Usar

1. **Instale e configure o LM Studio**:
   - Baixe o [LM Studio](https://lmstudio.ai/)
   - Carregue um modelo de linguagem
   - Inicie o servidor local (geralmente na porta 1234)

2. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/chat-web-local-lm-studio.git
   cd chat-web-local-lm-studio
   ```

3. **Abra o arquivo**:
   - Abra o arquivo index.html no seu navegador
   - A aplicação tentará conectar automaticamente ao LM Studio

4. **Configure se necessário**:
   - Ajuste a URL do servidor na parte inferior da tela
   - O modelo será detectado automaticamente

## Recursos da Interface

### Área de Chat
- **Container de mensagens**: Exibe o histórico da conversa
- **Mensagens do usuário**: Aparecem em azul, alinhadas à direita
- **Mensagens do assistente**: Aparecem em cinza, com formatação Markdown
- **Mensagens de erro**: Aparecem em vermelho para indicar problemas

### Controles
- **Campo de entrada**: Suporte a múltiplas linhas com `Shift+Enter`
- **Botão Enviar**: Envia a mensagem (desabilitado durante carregamento)
- **Botão Limpar**: Remove todo o histórico da conversa
- **Indicador de status**: Mostra o status da conexão com o servidor

### Configurações
- **URL do Servidor**: Campo para configurar o endpoint do LM Studio
- **Modelo**: Seleção automática do modelo carregado no LM Studio

## Estrutura do Projeto

```plaintext
.
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── img/
│   └── icone.png
└── README.md
```

## Classe Principal

A aplicação é organizada através da classe `LMStudioChat` que gerencia:

- **Inicialização**: Configuração dos elementos DOM e eventos
- **Conexão**: Verificação automática da conectividade com o LM Studio
- **Mensagens**: Envio, recebimento e exibição de mensagens
- **Interface**: Controle de loading, scroll e responsividade

## Configuração Avançada

### Parâmetros da API
A aplicação utiliza os seguintes parâmetros por padrão:
- `temperature: 0.7` - Controla a criatividade das respostas
- `max_tokens: 1000` - Limite máximo de tokens por resposta
- `stream: false` - Desabilita streaming para simplicidade

### CORS
Se encontrar problemas de CORS, certifique-se de que o LM Studio está configurado para aceitar requisições da origem do seu arquivo HTML.

## Problemas Conhecidos

- Certifique-se de que o LM Studio está executando antes de usar a aplicação
- Alguns navegadores podem bloquear requisições localhost por questões de segurança
- Para melhor experiência, use em servidores HTTP locais ao invés de abrir diretamente o arquivo HTML

## Contribuição

Contribuições são bem-vindas! Se você encontrar algum problema ou tiver sugestões de melhoria, por favor:

1. Abra uma issue descrevendo o problema/sugestão
2. Fork o repositório
3. Crie uma branch para sua feature
4. Faça o commit das suas mudanças
5. Envie um pull request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## Créditos

- Desenvolvido por [João Marcos](https://grupo.jm7087.com)
- Interface inspirada em aplicações de chat modernas
- Compatível com LM Studio e APIs OpenAI-like