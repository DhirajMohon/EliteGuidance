const DataService = {
    async loadMockData() {
        try {
            const response = await fetch('data/mock-data.json');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error loading mock data:', error);
            return null;
        }
    },

    async initializeData() {
        if (localStorage.getItem('dataInitialized')) {
            return;
        }

        const mockData = await this.loadMockData();
        if (!mockData) return;

        const users = [...mockData.mentors, ...mockData.students, mockData.admin];
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('mentors', JSON.stringify(mockData.mentors));
        localStorage.setItem('students', JSON.stringify(mockData.students));
        localStorage.setItem('requests', JSON.stringify([]));
        localStorage.setItem('messages', JSON.stringify([]));
        localStorage.setItem('dataInitialized', 'true');
        
        console.log('Mock data initialized successfully');
    },

    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    },

    getMentors() {
        const mentors = localStorage.getItem('mentors');
        return mentors ? JSON.parse(mentors) : [];
    },

    getStudents() {
        const students = localStorage.getItem('students');
        return students ? JSON.parse(students) : [];
    },

    getMentorById(id) {
        const mentors = this.getMentors();
        return mentors.find(m => m.id === id);
    },

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    },

    getRequests() {
        const requests = localStorage.getItem('requests');
        return requests ? JSON.parse(requests) : [];
    },

    addRequest(request) {
        const requests = this.getRequests();
        requests.push(request);
        localStorage.setItem('requests', JSON.stringify(requests));
    },

    updateRequest(requestId, updates) {
        const requests = this.getRequests();
        const index = requests.findIndex(r => r.id === requestId);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...updates };
            localStorage.setItem('requests', JSON.stringify(requests));
        }
    },

    getRequestsByStudent(studentId) {
        const requests = this.getRequests();
        return requests.filter(r => r.studentId === studentId);
    },

    getRequestsByMentor(mentorId) {
        const requests = this.getRequests();
        return requests.filter(r => r.mentorId === mentorId);
    },

    getMessages() {
        const messages = localStorage.getItem('messages');
        return messages ? JSON.parse(messages) : [];
    },

    addMessage(message) {
        const messages = this.getMessages();
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    },

    getMessagesByPairing(studentId, mentorId) {
        const messages = this.getMessages();
        return messages.filter(m => 
            (m.senderId === studentId && m.receiverId === mentorId) ||
            (m.senderId === mentorId && m.receiverId === studentId)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },

    getActivePairings(userId) {
        const requests = this.getRequests().filter(r => r.status === 'accepted');
        const pairings = [];
        
        requests.forEach(request => {
            const isStudent = request.studentId === userId;
            const otherId = isStudent ? request.mentorId : request.studentId;
            const otherUser = this.getUserById(otherId);
            
            if (otherUser) {
                pairings.push({
                    id: request.id,
                    user: otherUser,
                    isStudent: isStudent,
                    lastMessage: this.getLastMessage(userId, otherId)
                });
            }
        });
        
        return pairings;
    },

    getLastMessage(userId, otherId) {
        const messages = this.getMessagesByPairing(userId, otherId);
        return messages.length > 0 ? messages[messages.length - 1] : null;
    },

    async resetDemoData() {
        localStorage.removeItem('dataInitialized');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('users');
        localStorage.removeItem('mentors');
        localStorage.removeItem('students');
        localStorage.removeItem('requests');
        localStorage.removeItem('messages');
        
        await this.initializeData();
        console.log('Demo data reset successfully');
    }
};
