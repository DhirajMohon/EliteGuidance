const UI = {
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<div class="toast-message">${message}</div>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showModal(title, content, onClose = null) {
        const overlay = document.getElementById('modal-overlay');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <h2 id="modal-title" class="section-title">${title}</h2>
            ${content}
        `;
        
        overlay.style.display = 'flex';
        
        const closeBtn = overlay.querySelector('.modal-close');
        const closeModal = () => {
            overlay.style.display = 'none';
            if (onClose) onClose();
        };
        
        closeBtn.onclick = closeModal;
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };
        
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });
    },

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.style.display = 'none';
    },

    confirm(message, onConfirm) {
        const content = `
            <p style="margin-bottom: 1.5rem;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="cancel-btn" class="btn btn-secondary">Cancel</button>
                <button id="confirm-btn" class="btn btn-primary">Confirm</button>
            </div>
        `;
        
        this.showModal('Confirm Action', content);
        
        setTimeout(() => {
            document.getElementById('confirm-btn').onclick = () => {
                this.hideModal();
                onConfirm();
            };
            document.getElementById('cancel-btn').onclick = () => {
                this.hideModal();
            };
        }, 0);
    },

    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }
        if (hasHalfStar) {
            stars += '☆';
        }
        
        return stars;
    },

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateHeader(user) {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userName = document.getElementById('user-name');
        const navDashboard = document.getElementById('nav-dashboard');
        const navMessages = document.getElementById('nav-messages');
        const navAdmin = document.getElementById('nav-admin');
        
        if (user) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            userName.textContent = user.name;
            
            navDashboard.style.display = 'block';
            navMessages.style.display = 'block';
            
            if (user.role === 'admin') {
                navAdmin.style.display = 'block';
            } else {
                navAdmin.style.display = 'none';
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
            navDashboard.style.display = 'none';
            navMessages.style.display = 'none';
            navAdmin.style.display = 'none';
        }
    },

    initMobileMenu() {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('nav-menu');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                const isOpen = menu.classList.contains('active');
                toggle.setAttribute('aria-expanded', isOpen);
            });
            
            const links = menu.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                });
            });
        }
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
