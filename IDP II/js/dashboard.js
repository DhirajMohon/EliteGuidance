const Dashboard = {
    renderStudentDashboard(user) {
        const requests = DataService.getRequestsByStudent(user.id);
        const pairings = DataService.getActivePairings(user.id);
        
        const pendingCount = requests.filter(r => r.status === 'pending').length;
        const acceptedCount = requests.filter(r => r.status === 'accepted').length;
        const rejectedCount = requests.filter(r => r.status === 'rejected').length;
        
        return `
            <div>
                <h1 class="section-title">Student Dashboard</h1>
                <p class="section-subtitle">Welcome back, ${user.name}!</p>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">${requests.length}</div>
                        <div class="stat-label">Total Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${pendingCount}</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${acceptedCount}</div>
                        <div class="stat-label">Accepted</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${rejectedCount}</div>
                        <div class="stat-label">Rejected</div>
                    </div>
                </div>
                
                ${acceptedCount > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h2 style="margin-bottom: 1rem;">Active Mentors</h2>
                        <div class="grid grid-cols-1 grid-cols-md-2">
                            ${pairings.map(pairing => {
                                const lastMsg = pairing.lastMessage;
                                return `
                                    <div class="card">
                                        <div class="mentor-card-header">
                                            <img src="${pairing.user.avatar}" alt="${pairing.user.name}" class="mentor-avatar">
                                            <div class="mentor-info">
                                                <h3>${pairing.user.name}</h3>
                                                <p class="mentor-universities">${pairing.user.universities.join(', ')}</p>
                                            </div>
                                        </div>
                                        ${lastMsg ? `
                                            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                                                Last message: ${UI.formatTime(lastMsg.createdAt)}
                                            </p>
                                        ` : ''}
                                        <a href="#/messages?user=${pairing.user.id}" class="btn btn-primary btn-sm btn-block">
                                            Send Message
                                        </a>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div>
                    <h2 style="margin-bottom: 1rem;">My Requests</h2>
                    ${requests.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-state-icon">📝</div>
                            <h3 class="empty-state-title">No requests yet</h3>
                            <p class="empty-state-text">Start by browsing mentors and sending your first request</p>
                            <a href="#/browse" class="btn btn-primary">Browse Mentors</a>
                        </div>
                    ` : `
                        ${requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(request => {
                            const mentor = DataService.getMentorById(request.mentorId);
                            return `
                                <div class="request-card">
                                    <div class="request-header">
                                        <div>
                                            <h3 style="margin-bottom: 0.5rem;">${mentor.name}</h3>
                                            <p style="color: var(--text-secondary); font-size: 0.875rem;">
                                                Sent ${UI.formatTime(request.createdAt)}
                                            </p>
                                        </div>
                                        <span class="status-badge status-${request.status}">${request.status}</span>
                                    </div>
                                    <p style="margin-bottom: 0.5rem;"><strong>Topics:</strong> ${request.topics}</p>
                                    <p style="color: var(--text-secondary);">${request.pitch}</p>
                                    ${request.status === 'accepted' ? `
                                        <div style="margin-top: 1rem;">
                                            <a href="#/messages?user=${mentor.id}" class="btn btn-success btn-sm">
                                                Send Message
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }).join('')}
                    `}
                </div>
            </div>
        `;
    },

    renderMentorDashboard(user) {
        const requests = DataService.getRequestsByMentor(user.id);
        const pairings = DataService.getActivePairings(user.id);
        
        const pendingCount = requests.filter(r => r.status === 'pending').length;
        const acceptedCount = requests.filter(r => r.status === 'accepted').length;
        const rejectedCount = requests.filter(r => r.status === 'rejected').length;
        
        return `
            <div>
                <h1 class="section-title">Mentor Dashboard</h1>
                <p class="section-subtitle">Welcome back, ${user.name}!</p>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">${requests.length}</div>
                        <div class="stat-label">Total Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${pendingCount}</div>
                        <div class="stat-label">Pending</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${acceptedCount}</div>
                        <div class="stat-label">Active Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${user.rating || 0}</div>
                        <div class="stat-label">Rating</div>
                    </div>
                </div>
                
                ${pendingCount > 0 ? `
                    <div style="margin-bottom: 2rem;">
                        <h2 style="margin-bottom: 1rem;">Pending Requests (${pendingCount})</h2>
                        ${requests.filter(r => r.status === 'pending').map(request => {
                            const student = DataService.getUserById(request.studentId);
                            return `
                                <div class="request-card">
                                    <div class="request-header">
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <img src="${student.avatar}" alt="${student.name}" 
                                                 style="width: 48px; height: 48px; border-radius: 50%;">
                                            <div>
                                                <h3 style="margin-bottom: 0.25rem;">${student.name}</h3>
                                                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                                                    ${UI.formatTime(request.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="margin-bottom: 1rem;">
                                        <p style="margin-bottom: 0.5rem;"><strong>Topics:</strong> ${request.topics}</p>
                                        ${request.preferredTime ? `
                                            <p style="margin-bottom: 0.5rem;"><strong>Preferred Time:</strong> ${request.preferredTime}</p>
                                        ` : ''}
                                        <p style="color: var(--text-secondary); margin-top: 0.5rem;">${request.pitch}</p>
                                    </div>
                                    <div class="request-actions">
                                        <button class="btn btn-success accept-btn" data-request-id="${request.id}">
                                            Accept
                                        </button>
                                        <button class="btn btn-danger reject-btn" data-request-id="${request.id}">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                
                ${acceptedCount > 0 ? `
                    <div>
                        <h2 style="margin-bottom: 1rem;">Active Students (${acceptedCount})</h2>
                        <div class="grid grid-cols-1 grid-cols-md-2">
                            ${pairings.map(pairing => {
                                const lastMsg = pairing.lastMessage;
                                return `
                                    <div class="card">
                                        <div class="mentor-card-header">
                                            <img src="${pairing.user.avatar}" alt="${pairing.user.name}" class="mentor-avatar">
                                            <div class="mentor-info">
                                                <h3>${pairing.user.name}</h3>
                                                ${pairing.user.targetUniversities ? `
                                                    <p class="mentor-universities">${pairing.user.targetUniversities.join(', ')}</p>
                                                ` : ''}
                                            </div>
                                        </div>
                                        ${lastMsg ? `
                                            <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 0.5rem;">
                                                Last message: ${UI.formatTime(lastMsg.createdAt)}
                                            </p>
                                        ` : ''}
                                        <a href="#/messages?user=${pairing.user.id}" class="btn btn-primary btn-sm btn-block">
                                            Send Message
                                        </a>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">📬</div>
                        <h3 class="empty-state-title">No pending requests</h3>
                        <p class="empty-state-text">You're all caught up! New requests will appear here.</p>
                    </div>
                `}
            </div>
        `;
    },

    renderAdminDashboard() {
        const users = DataService.getUsers();
        const requests = DataService.getRequests();
        const messages = DataService.getMessages();
        const mentors = DataService.getMentors();
        const students = DataService.getStudents();
        
        return `
            <div>
                <h1 class="section-title">Admin Dashboard</h1>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">${users.length}</div>
                        <div class="stat-label">Total Users</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${mentors.length}</div>
                        <div class="stat-label">Mentors</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${students.length}</div>
                        <div class="stat-label">Students</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${requests.length}</div>
                        <div class="stat-label">Requests</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <button id="reset-demo-btn" class="btn btn-danger">Reset Demo Data</button>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h2 style="margin-bottom: 1rem;">Recent Requests</h2>
                    <div class="table">
                        <table style="width: 100%;">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Mentor</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${requests.slice(-10).reverse().map(request => {
                                    const student = DataService.getUserById(request.studentId);
                                    const mentor = DataService.getUserById(request.mentorId);
                                    return `
                                        <tr>
                                            <td>${student?.name || 'Unknown'}</td>
                                            <td>${mentor?.name || 'Unknown'}</td>
                                            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                            <td>${UI.formatDate(request.createdAt)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div>
                    <h2 style="margin-bottom: 1rem;">Message Activity</h2>
                    <div class="stat-card">
                        <div class="stat-value">${messages.length}</div>
                        <div class="stat-label">Total Messages Sent</div>
                    </div>
                </div>
            </div>
        `;
    },

    initRequestActions() {
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = e.target.dataset.requestId;
                DataService.updateRequest(requestId, { status: 'accepted' });
                UI.showToast('Request accepted!', 'success');
                window.location.reload();
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestId = e.target.dataset.requestId;
                UI.confirm('Are you sure you want to reject this request?', () => {
                    DataService.updateRequest(requestId, { status: 'rejected' });
                    UI.showToast('Request rejected', 'info');
                    window.location.reload();
                });
            });
        });
    },

    initResetButton() {
        const btn = document.getElementById('reset-demo-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                UI.confirm('Are you sure you want to reset all demo data? This will clear all users, requests, and messages.', async () => {
                    await DataService.resetDemoData();
                    UI.showToast('Demo data reset successfully!', 'success');
                    setTimeout(() => {
                        window.location.hash = '#/';
                        window.location.reload();
                    }, 1000);
                });
            });
        }
    }
};
