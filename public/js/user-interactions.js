// User Interactions Handler

class UserInteractions {
    constructor() {
        this.initializeEventListeners();
        this.initializeSocket();
    }

    // Initialize Socket.IO
    initializeSocket() {
        this.socket = io('http://localhost:3001', {
            withCredentials: true
        });

        // Handle connection
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        // Handle real-time updates
        this.socket.on('idea-updated', this.handleIdeaUpdate.bind(this));
        this.socket.on('mentor-updated', this.handleMentorUpdate.bind(this));
        this.socket.on('event-updated', this.handleEventUpdate.bind(this));
    }

    // Event Listeners
    initializeEventListeners() {
        // Language selector
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', this.handleLanguageChange.bind(this));
        }

        // Idea feed interactions
        const ideaFeed = document.getElementById('idea-feed');
        if (ideaFeed) {
            ideaFeed.addEventListener('click', this.handleIdeaInteraction.bind(this));
        }

        // Mentor feed interactions
        const mentorFeed = document.getElementById('mentor-feed');
        if (mentorFeed) {
            mentorFeed.addEventListener('click', this.handleMentorInteraction.bind(this));
        }

        // Event feed interactions
        const eventFeed = document.getElementById('event-feed');
        if (eventFeed) {
            eventFeed.addEventListener('click', this.handleEventInteraction.bind(this));
        }
    }

    // Handle language change
    async handleLanguageChange(event) {
        const language = event.target.value;
        try {
            await fetch('/api/set-language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ language }),
            });
            location.reload();
        } catch (error) {
            console.error('Error changing language:', error);
        }
    }

    // Handle idea interactions
    handleIdeaInteraction(event) {
        const target = event.target;
        if (target.classList.contains('like-button')) {
            this.toggleIdeaLike(target.dataset.ideaId);
        } else if (target.classList.contains('comment-button')) {
            this.openIdeaComments(target.dataset.ideaId);
        }
    }

    // Handle mentor interactions
    handleMentorInteraction(event) {
        const target = event.target;
        if (target.classList.contains('follow-button')) {
            this.toggleMentorFollow(target.dataset.mentorId);
        } else if (target.classList.contains('message-button')) {
            this.openMentorChat(target.dataset.mentorId);
        }
    }

    // Handle event interactions
    handleEventInteraction(event) {
        const target = event.target;
        if (target.classList.contains('register-button')) {
            this.registerForEvent(target.dataset.eventId);
        } else if (target.classList.contains('bookmark-button')) {
            this.toggleEventBookmark(target.dataset.eventId);
        }
    }

    // API Handlers
    async toggleIdeaLike(ideaId) {
        try {
            await fetch(`/api/ideas/${ideaId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.socket.emit('idea-liked', { ideaId });
        } catch (error) {
            console.error('Error liking idea:', error);
        }
    }

    async toggleMentorFollow(mentorId) {
        try {
            await fetch(`/api/mentors/${mentorId}/follow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.socket.emit('mentor-followed', { mentorId });
        } catch (error) {
            console.error('Error following mentor:', error);
        }
    }

    async registerForEvent(eventId) {
        try {
            await fetch(`/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.socket.emit('event-registered', { eventId });
        } catch (error) {
            console.error('Error registering for event:', error);
        }
    }

    // Real-time update handlers
    handleIdeaUpdate(idea) {
        // Update the idea feed
        const ideaElement = document.getElementById(`idea-${idea._id}`);
        if (ideaElement) {
            // Update likes count
            const likesElement = ideaElement.querySelector('.likes-count');
            if (likesElement) {
                likesElement.textContent = idea.likes.length;
            }
        }
    }

    handleMentorUpdate(mentor) {
        // Update the mentor feed
        const mentorElement = document.getElementById(`mentor-${mentor._id}`);
        if (mentorElement) {
            // Update follower count
            const followersElement = mentorElement.querySelector('.followers-count');
            if (followersElement) {
                followersElement.textContent = mentor.followers.length;
            }
        }
    }

    handleEventUpdate(event) {
        // Update the event feed
        const eventElement = document.getElementById(`event-${event._id}`);
        if (eventElement) {
            // Update registration count
            const registrantsElement = eventElement.querySelector('.registrants-count');
            if (registrantsElement) {
                registrantsElement.textContent = event.registrants.length;
            }
        }
    }
}

// Initialize the user interactions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new UserInteractions();
});
