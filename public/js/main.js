// Main application JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// DOM Elements
const languageSelector = document.getElementById('language-selector');
const ideaFeed = document.getElementById('idea-feed');
const mentorFeed = document.getElementById('mentor-feed');
const eventFeed = document.getElementById('event-feed');
const errorContainer = document.getElementById('error-container') || document.createElement('div');
errorContainer.id = 'error-container';
errorContainer.className = 'alert alert-danger d-none';
document.body.appendChild(errorContainer);

// Initialize Socket.IO
let socket = io('http://localhost:3001', {
    withCredentials: true
});

// Handle Socket.IO events
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('idea-updated', (idea) => {
    // Update idea feed
    fetchIdeas();
});

socket.on('mentor-updated', (mentor) => {
    // Update mentor feed
    fetchMentors();
});

socket.on('event-updated', (event) => {
    // Update event feed
    fetchEvents();
});

// Show error message to user
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('d-none');
    setTimeout(() => {
        errorContainer.classList.add('d-none');
    }, 5000);
}

// Language switching
function switchLanguage(lang) {
    // Update UI elements
    document.documentElement.lang = lang;
    // Update stored language preference
    localStorage.setItem('preferredLanguage', lang);
    // Update content
    updateContent(lang);
    // Update API calls with language preference
    updateFeeds(lang);
}

// Update content based on language
function updateContent(lang) {
    // Load translations
    fetch(`${API_BASE_URL}/translations/${lang}`)
        .then(response => response.json())
        .then(translation => {
            // Update all elements with data-i18n attributes
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                element.textContent = translation[key] || element.textContent;
            });
        });
}

// Initialize language
function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(savedLang);
}

// Fetch and display ideas
async function fetchIdeas() {
    try {
        const response = await fetch(`${API_BASE_URL}/ideas/latest`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const ideas = await response.json();
        displayIdeas(ideas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        // Show error message to user
        showError('Failed to fetch ideas. Please try again later.');
    }
}

// Display ideas in feed
function displayIdeas(ideas) {
    ideaFeed.innerHTML = '';
    ideas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card idea-card">
                <div class="card-header">
                    <h5 class="card-title">${idea.title}</h5>
                </div>
                <div class="card-body">
                    <p class="card-text">${idea.description}</p>
                    <div class="tags">
                        ${idea.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="feedback-stats">
                        <span class="rating">${idea.rating}</span>
                        <span class="votes">${idea.votes} votes</span>
                    </div>
                </div>
            </div>
        `;
        ideaFeed.appendChild(card);
    });
}

// Fetch and display mentors
async function fetchMentors() {
    try {
        const response = await fetch(`${API_BASE_URL}/mentors/featured`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const mentors = await response.json();
        displayMentors(mentors);
    } catch (error) {
        console.error('Error fetching mentors:', error);
        // Show error message to user
        showError('Failed to fetch mentors. Please try again later.');
    }
}

// Display mentors in feed
function displayMentors(mentors) {
    mentorFeed.innerHTML = '';
    mentors.forEach(mentor => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card mentor-card">
                <img src="${mentor.profilePicture}" class="card-img-top" alt="${mentor.name}">
                <div class="card-body">
                    <h5 class="card-title">${mentor.name}</h5>
                    <p class="card-text">${mentor.expertise.join(', ')}</p>
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span>${mentor.rating}</span>
                    </div>
                    <div class="badge-container">
                        ${mentor.badges.map(badge => `
                            <span class="badge-item ${badge.completed ? 'completed' : ''}">
                                <i class="fas ${badge.icon}"></i>
                                ${badge.name}
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        mentorFeed.appendChild(card);
    });
}

// Fetch and display events
async function fetchEvents() {
    try {
        const response = await fetch('/api/events/upcoming');
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Display events in feed
function displayEvents(events) {
    eventFeed.innerHTML = '';
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card event-card">
                <div class="event-type">${event.type}</div>
                <img src="${event.image}" class="card-img-top" alt="${event.title}">
                <div class="card-body">
                    <h5 class="card-title">${event.title}</h5>
                    <p class="card-text">${event.description}</p>
                    <div class="event-details">
                        <span><i class="fas fa-calendar"></i> ${event.date}</span>
                        <span><i class="fas fa-clock"></i> ${event.time}</span>
                    </div>
                </div>
            </div>
        `;
        eventFeed.appendChild(card);
    });
}

// Update all feeds with language preference
async function updateFeeds(lang) {
    await Promise.all([
        fetchIdeas(lang),
        fetchMentors(lang),
        fetchEvents(lang)
    ]);
}

// Event listeners
languageSelector.addEventListener('change', (e) => {
    switchLanguage(e.target.value);
});

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    updateFeeds();
});

// Idea pitching functionality
async function submitIdea(ideaData) {
    try {
        const response = await fetch('/api/ideas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(ideaData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Show success message
            showToast('Idea submitted successfully!', 'success');
            // Reset form
            document.getElementById('ideaForm').reset();
        } else {
            showToast(data.message || 'Error submitting idea', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error occurred', 'error');
    }
}

// Show toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    
    // Add event listeners
    loginBtn?.addEventListener('click', handleLogin);
    registerBtn?.addEventListener('click', handleRegister);
    ideaPitchBtn?.addEventListener('click', handleIdeaPitch);
});

// Form validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Handle file uploads
async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Upload error:', error);
        return null;
    }
}
