const Mentor = {
    currentFilters: {
        university: '',
        expertise: '',
        sort: 'rating'
    },

    renderBrowsePage() {
        const mentors = DataService.getMentors();
        const universities = [...new Set(mentors.flatMap(m => m.universities))].sort();
        const allExpertise = [...new Set(mentors.flatMap(m => m.expertise))].sort();
        
        return `
            <div>
                <h1 class="section-title">Browse Mentors</h1>
                <p class="section-subtitle">Find the perfect mentor to guide you through your college application journey</p>
                
                <div class="filter-section">
                    <div class="filter-controls">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="university-filter" class="form-label">Filter by University</label>
                            <select id="university-filter" class="form-select">
                                <option value="">All Universities</option>
                                ${universities.map(u => `<option value="${u}">${u}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="expertise-filter" class="form-label">Filter by Expertise</label>
                            <input type="text" id="expertise-filter" class="form-input" 
                                   placeholder="Search expertise..." list="expertise-list">
                            <datalist id="expertise-list">
                                ${allExpertise.map(e => `<option value="${e}">`).join('')}
                            </datalist>
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="sort-filter" class="form-label">Sort By</label>
                            <select id="sort-filter" class="form-select">
                                <option value="rating">Highest Rating</option>
                                <option value="reviews">Most Reviews</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="mentors-grid" class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3">
                </div>
            </div>
        `;
    },

    filterAndSortMentors(mentors) {
        let filtered = [...mentors];
        
        if (this.currentFilters.university) {
            filtered = filtered.filter(m => 
                m.universities.includes(this.currentFilters.university)
            );
        }
        
        if (this.currentFilters.expertise) {
            const searchTerm = this.currentFilters.expertise.toLowerCase();
            filtered = filtered.filter(m => 
                m.expertise.some(e => e.toLowerCase().includes(searchTerm))
            );
        }
        
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'rating':
                    return b.rating - a.rating;
                case 'reviews':
                    return b.reviewCount - a.reviewCount;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
        
        return filtered;
    },

    renderMentorCards() {
        const mentors = DataService.getMentors();
        const filtered = this.filterAndSortMentors(mentors);
        const grid = document.getElementById('mentors-grid');
        
        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🔍</div>
                    <h3 class="empty-state-title">No mentors found</h3>
                    <p class="empty-state-text">Try adjusting your filters to see more results</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = filtered.map(mentor => `
            <div class="card mentor-card">
                <div class="mentor-card-header">
                    <img src="${mentor.avatar}" alt="${mentor.name}" class="mentor-avatar">
                    <div class="mentor-info">
                        <h3>${mentor.name}</h3>
                        <p class="mentor-universities">${mentor.universities.join(', ')}</p>
                        <div class="mentor-rating">
                            <span class="rating-stars">${UI.renderStars(mentor.rating)}</span>
                            <span>${mentor.rating} (${mentor.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
                <div class="mentor-expertise">
                    ${mentor.expertise.map(e => `<span class="badge badge-primary">${e}</span>`).join('')}
                </div>
                <p class="mentor-bio">${mentor.bio}</p>
                <a href="#/mentor/${mentor.id}" class="btn btn-primary btn-block">View Profile</a>
            </div>
        `).join('');
    },

    initFilters() {
        const universityFilter = document.getElementById('university-filter');
        const expertiseFilter = document.getElementById('expertise-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (universityFilter) {
            universityFilter.addEventListener('change', (e) => {
                this.currentFilters.university = e.target.value;
                this.renderMentorCards();
            });
        }
        
        if (expertiseFilter) {
            expertiseFilter.addEventListener('input', (e) => {
                this.currentFilters.expertise = e.target.value;
                this.renderMentorCards();
            });
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.renderMentorCards();
            });
        }
    },

    renderMentorDetail(mentorId) {
        const mentor = DataService.getMentorById(mentorId);
        const currentUser = Auth.getCurrentUser();
        
        if (!mentor) {
            return `
                <div class="empty-state">
                    <h2>Mentor not found</h2>
                    <a href="#/browse" class="btn btn-primary">Browse Mentors</a>
                </div>
            `;
        }
        
        const canRequest = currentUser && currentUser.role === 'student';
        const existingRequest = canRequest ? 
            DataService.getRequestsByStudent(currentUser.id).find(r => r.mentorId === mentorId) : null;
        
        return `
            <div>
                <a href="#/browse" class="btn btn-secondary" style="margin-bottom: 1rem;">&larr; Back to Browse</a>
                
                <div class="card">
                    <div class="mentor-card-header" style="margin-bottom: 2rem;">
                        <img src="${mentor.avatar}" alt="${mentor.name}" class="mentor-avatar" 
                             style="width: 120px; height: 120px;">
                        <div class="mentor-info">
                            <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">${mentor.name}</h1>
                            <p class="mentor-universities" style="font-size: 1.125rem;">${mentor.universities.join(', ')}</p>
                            <div class="mentor-rating" style="font-size: 1rem; margin-top: 0.5rem;">
                                <span class="rating-stars">${UI.renderStars(mentor.rating)}</span>
                                <span>${mentor.rating} (${mentor.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem;">Expertise</h3>
                        <div class="mentor-expertise">
                            ${mentor.expertise.map(e => `<span class="badge badge-primary">${e}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem;">About</h3>
                        <p style="white-space: pre-line; line-height: 1.8;">${mentor.fullBio || mentor.bio}</p>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h3 style="margin-bottom: 1rem;">Availability</h3>
                        <p>${mentor.availability}</p>
                    </div>
                    
                    ${canRequest ? `
                        ${existingRequest ? `
                            <div class="alert" style="padding: 1rem; background-color: var(--bg-secondary); border-radius: var(--border-radius); margin-bottom: 1rem;">
                                <p>You have already sent a request to this mentor. 
                                Status: <span class="status-badge status-${existingRequest.status}">${existingRequest.status}</span></p>
                            </div>
                        ` : ''}
                        <button id="request-btn" class="btn btn-primary btn-lg btn-block" 
                                ${existingRequest ? 'disabled' : ''}>
                            ${existingRequest ? 'Request Already Sent' : 'Request Mentorship'}
                        </button>
                    ` : `
                        ${!currentUser ? `
                            <p style="text-align: center; color: var(--text-secondary);">
                                Please <a href="#/login" style="color: var(--primary-color);">login</a> as a student to request mentorship.
                            </p>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
    },

    initRequestButton(mentorId) {
        const btn = document.getElementById('request-btn');
        if (btn && !btn.disabled) {
            btn.addEventListener('click', () => {
                this.showRequestModal(mentorId);
            });
        }
    },

    showRequestModal(mentorId) {
        const mentor = DataService.getMentorById(mentorId);
        const content = `
            <form id="request-form">
                <div class="form-group">
                    <label for="pitch" class="form-label">Why do you want ${mentor.name} as your mentor?</label>
                    <textarea id="pitch" class="form-textarea" maxlength="600" required
                              placeholder="Tell the mentor why you'd like their guidance..." style="min-height: 150px;"></textarea>
                    <small style="color: var(--text-secondary);">
                        <span id="pitch-count">0</span> / 600 characters
                    </small>
                </div>
                <div class="form-group">
                    <label for="topics" class="form-label">Topics you need help with</label>
                    <input type="text" id="topics" class="form-input" required
                           placeholder="e.g., Personal Statement, Interview Prep">
                </div>
                <div class="form-group">
                    <label for="preferred-time" class="form-label">Preferred Time (optional)</label>
                    <input type="text" id="preferred-time" class="form-input"
                           placeholder="e.g., Weekday evenings">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="button" id="cancel-request" class="btn btn-secondary" style="flex: 1;">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="flex: 1;">Send Request</button>
                </div>
            </form>
        `;
        
        UI.showModal('Request Mentorship', content);
        
        setTimeout(() => {
            const form = document.getElementById('request-form');
            const pitch = document.getElementById('pitch');
            const pitchCount = document.getElementById('pitch-count');
            
            pitch.addEventListener('input', () => {
                pitchCount.textContent = pitch.value.length;
            });
            
            document.getElementById('cancel-request').onclick = () => UI.hideModal();
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const currentUser = Auth.getCurrentUser();
                const request = {
                    id: UI.generateId(),
                    studentId: currentUser.id,
                    mentorId: mentorId,
                    pitch: document.getElementById('pitch').value,
                    topics: document.getElementById('topics').value,
                    preferredTime: document.getElementById('preferred-time').value,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                DataService.addRequest(request);
                UI.hideModal();
                UI.showToast('Request sent successfully!', 'success');
                
                window.location.hash = `#/mentor/${mentorId}`;
                setTimeout(() => window.location.reload(), 500);
            });
        }, 0);
    }
};
