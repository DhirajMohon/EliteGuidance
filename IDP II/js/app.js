const App = {
    async init() {
        await DataService.initializeData();
        this.initRouter();
        this.initEventListeners();
        UI.initMobileMenu();
        
        const currentUser = Auth.getCurrentUser();
        UI.updateHeader(currentUser);
        
        this.handleRoute();
    },

    initRouter() {
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
        
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    },

    initEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                UI.updateHeader(null);
                UI.showToast('Logged out successfully', 'info');
                window.location.hash = '#/';
            });
        }
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');
        const params = new URLSearchParams(queryString);
        
        UI.scrollToTop();
        
        const currentUser = Auth.getCurrentUser();
        const mainContent = document.getElementById('main-content');
        
        const routes = {
            '/': () => this.renderHome(),
            '/login': () => {
                mainContent.innerHTML = Auth.renderLoginPage();
                Auth.initLoginForm();
            },
            '/signup': () => {
                mainContent.innerHTML = Auth.renderSignupPage();
                Auth.initSignupForm();
            },
            '/browse': () => {
                mainContent.innerHTML = Mentor.renderBrowsePage();
                Mentor.renderMentorCards();
                Mentor.initFilters();
            },
            '/dashboard': () => {
                if (!currentUser) {
                    window.location.hash = '#/login';
                    return;
                }
                
                if (currentUser.role === 'student') {
                    mainContent.innerHTML = Dashboard.renderStudentDashboard(currentUser);
                } else if (currentUser.role === 'mentor') {
                    mainContent.innerHTML = Dashboard.renderMentorDashboard(currentUser);
                } else if (currentUser.role === 'admin') {
                    mainContent.innerHTML = Dashboard.renderAdminDashboard();
                    Dashboard.initResetButton();
                }
                
                Dashboard.initRequestActions();
            },
            '/messages': () => {
                if (!currentUser) {
                    window.location.hash = '#/login';
                    return;
                }
                
                const selectedUserId = params.get('user');
                mainContent.innerHTML = Messages.renderMessagesPage(selectedUserId);
                Messages.renderMessages();
                Messages.initMessageForm();
            },
            '/admin': () => {
                if (!currentUser || currentUser.role !== 'admin') {
                    window.location.hash = '#/';
                    UI.showToast('Access denied', 'error');
                    return;
                }
                
                mainContent.innerHTML = Dashboard.renderAdminDashboard();
                Dashboard.initResetButton();
            }
        };
        
        if (path.startsWith('/mentor/')) {
            const mentorId = path.split('/')[2];
            mainContent.innerHTML = Mentor.renderMentorDetail(mentorId);
            Mentor.initRequestButton(mentorId);
        } else if (routes[path]) {
            routes[path]();
        } else {
            mainContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">404</div>
                    <h2 class="empty-state-title">Page Not Found</h2>
                    <p class="empty-state-text">The page you're looking for doesn't exist.</p>
                    <a href="#/" class="btn btn-primary">Go Home</a>
                </div>
            `;
        }
    },

    renderHome() {
        const currentUser = Auth.getCurrentUser();
        const mentors = DataService.getMentors();
        const topMentors = mentors.sort((a, b) => b.rating - a.rating).slice(0, 3);
        
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="hero">
                <h1>Welcome to EliteGuidance</h1>
                <p>Connect with top university mentors who can guide you through your college application journey</p>
                ${!currentUser ? `
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="#/signup" class="btn btn-primary btn-lg">Get Started</a>
                        <a href="#/browse" class="btn btn-secondary btn-lg">Browse Mentors</a>
                    </div>
                ` : `
                    <a href="#/dashboard" class="btn btn-primary btn-lg">Go to Dashboard</a>
                `}
            </div>
            
            <div style="margin-bottom: 3rem;">
                <h2 class="section-title" style="text-align: center;">How It Works</h2>
                <div class="grid grid-cols-1 grid-cols-md-3" style="margin-top: 2rem;">
                    <div class="card" style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                        <h3 style="margin-bottom: 0.5rem;">Browse Mentors</h3>
                        <p style="color: var(--text-secondary);">
                            Explore profiles of mentors from Harvard, Stanford, Princeton, and more
                        </p>
                    </div>
                    <div class="card" style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                        <h3 style="margin-bottom: 0.5rem;">Send Requests</h3>
                        <p style="color: var(--text-secondary);">
                            Submit personalized requests explaining why you need guidance
                        </p>
                    </div>
                    <div class="card" style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">💬</div>
                        <h3 style="margin-bottom: 0.5rem;">Get Mentored</h3>
                        <p style="color: var(--text-secondary);">
                            Chat with your mentor and receive expert guidance on your applications
                        </p>
                    </div>
                </div>
            </div>
            
            <div>
                <h2 class="section-title" style="text-align: center;">Top Rated Mentors</h2>
                <div class="grid grid-cols-1 grid-cols-md-3" style="margin-top: 2rem;">
                    ${topMentors.map(mentor => `
                        <div class="card mentor-card">
                            <div class="mentor-card-header">
                                <img src="${mentor.avatar}" alt="${mentor.name}" class="mentor-avatar">
                                <div class="mentor-info">
                                    <h3>${mentor.name}</h3>
                                    <p class="mentor-universities">${mentor.universities.join(', ')}</p>
                                    <div class="mentor-rating">
                                        <span class="rating-stars">${UI.renderStars(mentor.rating)}</span>
                                        <span>${mentor.rating}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mentor-expertise">
                                ${mentor.expertise.slice(0, 3).map(e => `<span class="badge badge-primary">${e}</span>`).join('')}
                            </div>
                            <p class="mentor-bio">${mentor.bio}</p>
                            <a href="#/mentor/${mentor.id}" class="btn btn-primary btn-block">View Profile</a>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="#/browse" class="btn btn-primary btn-lg">View All Mentors</a>
                </div>
            </div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
