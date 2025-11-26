class LMStudioChat {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.speechEnabled = false;
        this.voices = [];
        this.selectedVoice = null;
        this.initializeElements();
        this.bindEvents();
        this.loadVoices();
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
        this.toggleSpeechButton = document.getElementById('toggleSpeech');
        this.voiceSelect = document.getElementById('voiceSelect');
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
        this.toggleSpeechButton.addEventListener('click', () => this.toggleSpeech());
        this.voiceSelect.addEventListener('change', () => this.updateSelectedVoice());
    }

    loadVoices() {
        const setVoices = () => {
            this.voices = window.speechSynthesis.getVoices().filter(v => 
                v.lang.startsWith('pt') || v.lang.includes('BR') || v.lang.includes('PT')
            );
            console.log('Vozes em português disponíveis:', this.voices.map(v => v.name));
            this.updateSelectedVoice();
        };
        
        window.speechSynthesis.onvoiceschanged = setVoices;
        setVoices();
    }

    updateSelectedVoice() {
        if (!this.voices.length) {
            console.log('Nenhuma voz em português encontrada');
            return;
        }

        const type = this.voiceSelect.value;

        const nomesFemininos = ['maria', 'vitoria', 'luciana', 'camila', 'francisca', 'fem', 'female', 'feminina', 'raquel', 'helena'];
        const nomesMasculinos = ['daniel', 'ricardo', 'antonio', 'carlos', 'male', 'masculina', 'masc', 'pedro', 'jorge'];

        let voz = null;

        if (type === 'feminina') {
            voz = this.voices.find(v =>
                nomesFemininos.some(nome => v.name.toLowerCase().includes(nome))
            );
            if (!voz) voz = this.voices[0];
        } else {
            voz = this.voices.find(v =>
                nomesMasculinos.some(nome => v.name.toLowerCase().includes(nome))
            );
            if (!voz) voz = this.voices[this.voices.length - 1] || this.voices[0];
        }

        this.selectedVoice = voz;
        console.log('Voz selecionada:', voz?.name || 'Nenhuma');
    }

    toggleSpeech() {
        this.speechEnabled = !this.speechEnabled;
        this.toggleSpeechButton.textContent = this.speechEnabled ? '🔇 Desativar Fala' : '🔈 Ativar Fala';
        
        if (this.speechEnabled) {
            this.speak('Sistema de fala ativado');
        } else {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('Sistema de fala desativado');
            utterance.lang = 'pt-BR';
            if (this.selectedVoice) utterance.voice = this.selectedVoice;
            window.speechSynthesis.speak(utterance);
        }
    }

    speak(text) {
        if (!this.speechEnabled) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
    }

    getBaseUrl() {
        const url = this.serverUrlInput.value;
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const assistantMessage = data.choices[0].message.content;
            this.messages.push({ role: 'assistant', content: assistantMessage });
            return assistantMessage;
        } else {
            throw new Error('Resposta inválida do servidor: ' + JSON.stringify(data));
        }
    }

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
            content = this.parseCodeBlocks(content);
            content = this.parseInlineMarkdown(content);
        }

        messageDiv.innerHTML = content;
        this.messagesContainer.appendChild(messageDiv);

        messageDiv.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyCode(btn));
        });

        try {
            setTimeout(() => {
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
            }, 10);
        } catch (e) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        if (role === 'assistant') {
            const textToSpeak = messageDiv.textContent || messageDiv.innerText || '';
            this.speak(textToSpeak);
        }
    }

    parseCodeBlocks(content) {
        const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
        
        return content.replace(codeBlockRegex, (match, language, code) => {
            const lang = language || 'code';
            const originalCode = code.trim();
            const escapedCode = this.escapeHtml(originalCode);
            const base64Code = btoa(unescape(encodeURIComponent(originalCode)));
            
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="language">${lang}</span>
                        <button class="copy-btn" data-code-base64="${base64Code}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            Copiar
                        </button>
                    </div>
                    <pre><code>${escapedCode}</code></pre>
                </div>
            `;
        });
    }

    parseInlineMarkdown(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyCode(button) {
        const base64Code = button.getAttribute('data-code-base64');
        const code = decodeURIComponent(escape(atob(base64Code)));

        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.innerHTML;
            button.classList.add('copied');
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Copiado!
            `;
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar:', err);
        });
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

document.addEventListener('DOMContentLoaded', () => {
    new LMStudioChat();
});