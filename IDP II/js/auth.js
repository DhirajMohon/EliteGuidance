const Auth = {
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    login(email, password) {
        const users = DataService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            return userWithoutPassword;
        }
        
        return null;
    },

    signup(userData) {
        const users = DataService.getUsers();
        
        if (users.find(u => u.email === userData.email)) {
            return { error: 'Email already exists' };
        }
        
        const newUser = {
            id: UI.generateId(),
            ...userData,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4F46E5&color=fff&size=200`
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        if (newUser.role === 'mentor') {
            const mentors = DataService.getMentors();
            mentors.push(newUser);
            localStorage.setItem('mentors', JSON.stringify(mentors));
        } else if (newUser.role === 'student') {
            const students = DataService.getStudents();
            students.push(newUser);
            localStorage.setItem('students', JSON.stringify(students));
        }
        
        const { password, ...userWithoutPassword } = newUser;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    },

    logout() {
        localStorage.removeItem('currentUser');
    },

    renderLoginPage() {
        return `
            <div class="auth-container">
                <div class="card">
                    <h1 class="section-title">Login</h1>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" id="email" class="form-input" required 
                                   placeholder="student@example.com">
                        </div>
                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" required
                                   placeholder="Enter your password">
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Login</button>
                    </form>
                    <p style="margin-top: 1rem; text-align: center; color: var(--text-secondary);">
                        Don't have an account? <a href="#/signup" style="color: var(--primary-color);">Sign up</a>
                    </p>
                    <div style="margin-top: 2rem; padding: 1rem; background-color: var(--bg-secondary); border-radius: var(--border-radius);">
                        <p style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Demo Credentials:</p>
                        <p style="font-size: 0.75rem; color: var(--text-secondary);">
                            Student: sarah.j@example.com / student123<br>
                            Mentor: asha.rahman@example.com / mentor123<br>
                            Admin: admin@eliteguidance.test / admin
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    renderSignupPage() {
        return `
            <div class="auth-container">
                <div class="card">
                    <h1 class="section-title">Sign Up</h1>
                    <form id="signup-form">
                        <div class="form-group">
                            <label for="name" class="form-label">Full Name</label>
                            <input type="text" id="name" class="form-input" required
                                   placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" id="email" class="form-input" required
                                   placeholder="john@example.com">
                        </div>
                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" id="password" class="form-input" required
                                   placeholder="Choose a secure password">
                        </div>
                        <div class="form-group">
                            <label for="role" class="form-label">I am a...</label>
                            <select id="role" class="form-select" required>
                                <option value="">Select your role</option>
                                <option value="student">Student</option>
                                <option value="mentor">Mentor</option>
                            </select>
                        </div>
                        <div id="student-fields" style="display: none;">
                            <div class="form-group">
                                <label for="targetUniversities" class="form-label">Target Universities (comma-separated)</label>
                                <input type="text" id="targetUniversities" class="form-input"
                                       placeholder="Harvard, Stanford, MIT">
                            </div>
                        </div>
                        <div id="mentor-fields" style="display: none;">
                            <div class="form-group">
                                <label for="universities" class="form-label">Universities (comma-separated)</label>
                                <input type="text" id="universities" class="form-input"
                                       placeholder="Harvard, MIT">
                            </div>
                            <div class="form-group">
                                <label for="expertise" class="form-label">Expertise (comma-separated)</label>
                                <input type="text" id="expertise" class="form-input"
                                       placeholder="Personal Statement, Interview Prep">
                            </div>
                            <div class="form-group">
                                <label for="bio" class="form-label">Short Bio</label>
                                <textarea id="bio" class="form-textarea" 
                                          placeholder="Tell students about your background..."></textarea>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Sign Up</button>
                    </form>
                    <p style="margin-top: 1rem; text-align: center; color: var(--text-secondary);">
                        Already have an account? <a href="#/login" style="color: var(--primary-color);">Login</a>
                    </p>
                </div>
            </div>
        `;
    },

    initLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                const user = this.login(email, password);
                if (user) {
                    UI.showToast('Login successful!', 'success');
                    UI.updateHeader(user);
                    window.location.hash = '#/dashboard';
                } else {
                    UI.showToast('Invalid email or password', 'error');
                }
            });
        }
    },

    initSignupForm() {
        const form = document.getElementById('signup-form');
        const roleSelect = document.getElementById('role');
        const studentFields = document.getElementById('student-fields');
        const mentorFields = document.getElementById('mentor-fields');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                if (e.target.value === 'student') {
                    studentFields.style.display = 'block';
                    mentorFields.style.display = 'none';
                } else if (e.target.value === 'mentor') {
                    studentFields.style.display = 'none';
                    mentorFields.style.display = 'block';
                } else {
                    studentFields.style.display = 'none';
                    mentorFields.style.display = 'none';
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const userData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value,
                    role: document.getElementById('role').value
                };
                
                if (userData.role === 'student') {
                    const universities = document.getElementById('targetUniversities').value;
                    userData.targetUniversities = universities ? universities.split(',').map(u => u.trim()) : [];
                } else if (userData.role === 'mentor') {
                    const universities = document.getElementById('universities').value;
                    const expertise = document.getElementById('expertise').value;
                    userData.universities = universities ? universities.split(',').map(u => u.trim()) : [];
                    userData.expertise = expertise ? expertise.split(',').map(e => e.trim()) : [];
                    userData.bio = document.getElementById('bio').value;
                    userData.rating = 0;
                    userData.reviewCount = 0;
                    userData.availability = 'Flexible';
                }
                
                const result = this.signup(userData);
                if (result.error) {
                    UI.showToast(result.error, 'error');
                } else {
                    UI.showToast('Account created successfully!', 'success');
                    UI.updateHeader(result);
                    window.location.hash = '#/dashboard';
                }
            });
        }
    }
};
