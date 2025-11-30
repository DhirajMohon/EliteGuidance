const Messages = {
    currentThread: null,

    renderMessagesPage(selectedUserId = null) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            window.location.hash = '#/login';
            return '';
        }
        
        const pairings = DataService.getActivePairings(currentUser.id);
        
        if (pairings.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h2 class="empty-state-title">No active conversations</h2>
                    <p class="empty-state-text">
                        ${currentUser.role === 'student' ? 
                            'Send a mentorship request to start chatting with mentors' : 
                            'Accept a student request to start mentoring'}
                    </p>
                    <a href="${currentUser.role === 'student' ? '#/browse' : '#/dashboard'}" class="btn btn-primary">
                        ${currentUser.role === 'student' ? 'Browse Mentors' : 'View Dashboard'}
                    </a>
                </div>
            `;
        }
        
        const activeUser = selectedUserId ? pairings.find(p => p.user.id === selectedUserId) : pairings[0];
        this.currentThread = activeUser;
        
        return `
            <div>
                <h1 class="section-title">Messages</h1>
                
                <div class="messages-container">
                    <div class="message-list">
                        <h3 style="margin-bottom: 1rem;">Conversations</h3>
                        ${pairings.map(pairing => {
                            const isActive = this.currentThread && pairing.user.id === this.currentThread.user.id;
                            const lastMsg = pairing.lastMessage;
                            return `
                                <a href="#/messages?user=${pairing.user.id}" 
                                   class="card" 
                                   style="display: block; margin-bottom: 0.5rem; text-decoration: none; 
                                          ${isActive ? 'border: 2px solid var(--primary-color);' : ''}">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <img src="${pairing.user.avatar}" alt="${pairing.user.name}"
                                             style="width: 48px; height: 48px; border-radius: 50%;">
                                        <div style="flex: 1; min-width: 0;">
                                            <h4 style="margin-bottom: 0.25rem; font-size: 1rem;">${pairing.user.name}</h4>
                                            ${lastMsg ? `
                                                <p style="color: var(--text-secondary); font-size: 0.875rem; 
                                                          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                    ${lastMsg.text.substring(0, 30)}${lastMsg.text.length > 30 ? '...' : ''}
                                                </p>
                                            ` : `
                                                <p style="color: var(--text-light); font-size: 0.875rem;">No messages yet</p>
                                            `}
                                        </div>
                                        ${lastMsg ? `
                                            <span style="font-size: 0.75rem; color: var(--text-light);">
                                                ${UI.formatTime(lastMsg.createdAt)}
                                            </span>
                                        ` : ''}
                                    </div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="message-thread">
                        <div class="thread-header">
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <img src="${this.currentThread.user.avatar}" alt="${this.currentThread.user.name}"
                                     style="width: 40px; height: 40px; border-radius: 50%;">
                                <div>
                                    <h3 style="margin-bottom: 0.25rem;">${this.currentThread.user.name}</h3>
                                    <p style="font-size: 0.875rem; color: var(--text-secondary); font-weight: normal;">
                                        ${this.currentThread.user.role === 'mentor' ? 
                                            this.currentThread.user.universities.join(', ') : 
                                            this.currentThread.user.targetUniversities?.join(', ') || 'Student'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div id="thread-messages" class="thread-messages">
                        </div>
                        
                        <form id="message-form" class="thread-input">
                            <input type="text" id="message-input" class="form-input" 
                                   placeholder="Type a message..." required style="margin-bottom: 0;">
                            <button type="submit" class="btn btn-primary">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    },

    renderMessages() {
        if (!this.currentThread) return;
        
        const currentUser = Auth.getCurrentUser();
        const messages = DataService.getMessagesByPairing(currentUser.id, this.currentThread.user.id);
        const container = document.getElementById('thread-messages');
        
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = messages.map(msg => {
            const isSent = msg.senderId === currentUser.id;
            return `
                <div class="message ${isSent ? 'message-sent' : 'message-received'}">
                    <div class="message-bubble">${msg.text}</div>
                    <div class="message-time">${UI.formatTime(msg.createdAt)}</div>
                </div>
            `;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    },

    initMessageForm() {
        const form = document.getElementById('message-form');
        const input = document.getElementById('message-input');
        
        if (form && this.currentThread) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const text = input.value.trim();
                if (!text) return;
                
                const currentUser = Auth.getCurrentUser();
                const message = {
                    id: UI.generateId(),
                    senderId: currentUser.id,
                    receiverId: this.currentThread.user.id,
                    text: text,
                    createdAt: new Date().toISOString()
                };
                
                DataService.addMessage(message);
                input.value = '';
                this.renderMessages();
            });
        }
    }
};
