class LMStudioChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
        this.checkConnection();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearButton');
        this.statusElement = document.getElementById('status');
        this.serverUrlInput = document.getElementById('serverUrl');
        this.modelNameInput = document.getElementById('modelName');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.clearButton.addEventListener('click', () => this.clearChat());

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.serverUrlInput.addEventListener('change', () => this.checkConnection());
    }

    getBaseUrl() {
        const url = this.serverUrlInput.value;
        // Se a URL já contém o endpoint completo, extrai apenas a base
        if (url.includes('/v1/chat/completions')) {
            return url.replace('/v1/chat/completions', '');
        }
        return url;
    }

    async checkConnection() {
        try {
            const baseUrl = this.getBaseUrl();
            const modelsUrl = `${baseUrl}/v1/models`;

            console.log('Testando conexão com:', modelsUrl);

            const response = await fetch(modelsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Modelos disponíveis:', data);
                this.updateStatus('Conectado', true);

                // Atualiza o campo de modelo com o primeiro modelo disponível
                if (data.data && data.data.length > 0) {
                    this.modelNameInput.value = data.data[0].id;
                }
            } else {
                console.error('Erro na resposta:', response.status, response.statusText);
                this.updateStatus('Erro de conexão', false);
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            this.updateStatus('Desconectado - Verifique CORS', false);
        }
    }

    updateStatus(text, connected) {
        this.statusElement.textContent = text;
        this.statusElement.className = `status ${connected ? 'connected' : ''}`;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.setLoading(true);

        try {
            const response = await this.callLMStudio(message);
            this.addMessage(response, 'assistant');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            this.addMessage(`Erro: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async callLMStudio(message) {
        this.messages.push({ role: 'user', content: message });

        const baseUrl = this.getBaseUrl();
        const chatUrl = `${baseUrl}/v1/chat/completions`;

        console.log('Enviando para:', chatUrl);
        console.log('Payload:', {
            model: this.modelNameInput.value,
            messages: this.messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
        });

        const response = await fetch(chatUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.modelNameInput.value,
                messages: this.messages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            })
        });

        console.log('Status da resposta:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        console.log('Resposta recebida:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const assistantMessage = data.choices[0].message.content;
            this.messages.push({ role: 'assistant', content: assistantMessage });
            return assistantMessage;
        } else {
            throw new Error('Resposta inválida do servidor: ' + JSON.stringify(data));
        }
    }

    // Função de scroll suave (DENTRO da classe)
    smoothScrollToBottom() {
        this.messagesContainer.scrollTo({
            top: this.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        if (role === 'assistant') {
            content = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        messageDiv.innerHTML = content;
        this.messagesContainer.appendChild(messageDiv);

        // Garante que o último elemento fique visível de forma suave e confiável
        // Usa scrollIntoView no elemento recém-adicionado (mais robusto que manipular scrollTop diretamente).
        // Se quiser comportamento instantâneo, troque 'smooth' por 'auto'.
        try {
            // Pequeno timeout para garantir que o layout foi atualizado antes do scroll
            setTimeout(() => {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
            }, 10);
        } catch (e) {
            // fallback: scroll imediato caso scrollIntoView falhe
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;

        if (loading) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message assistant';
            loadingDiv.innerHTML = '<div class="loading"></div> Pensando...';
            loadingDiv.id = 'loading-message';
            this.messagesContainer.appendChild(loadingDiv);

            // Scroll para o loading de forma suave
            setTimeout(() => {
                loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 50);
        } else {
            const loadingMessage = document.getElementById('loading-message');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
    }

    clearChat() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
    }
}

// Inicializar a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new LMStudioChat();
});