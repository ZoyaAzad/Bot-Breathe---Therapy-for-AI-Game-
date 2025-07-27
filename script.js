// Global state management
let currentSession = null;
let aiCharacters = [];
let sessionReportModal = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        // Initialize Bootstrap modal
        sessionReportModal = new bootstrap.Modal(document.getElementById('sessionReportModal'));
        
        // Load AI characters
        await loadAICharacters();
        
        // Setup event listeners
        setupEventListeners();
        
        // Show character selection by default
        showCharacterSelection();
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

function setupEventListeners() {
    // Send message on button click
    document.getElementById('sendButton').addEventListener('click', sendMessage);
    
    // Send message on Enter (but allow Shift+Enter for new lines)
    document.getElementById('messageInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Session control buttons
    document.getElementById('endSessionBtn').addEventListener('click', endSession);
    document.getElementById('newPatientBtn').addEventListener('click', showCharacterSelection);
    document.getElementById('startNewSessionBtn').addEventListener('click', () => {
        sessionReportModal.hide();
        showCharacterSelection();
    });
}

async function loadAICharacters() {
    const loadingIndicator = document.getElementById('loadingCharacters');
    const container = document.getElementById('charactersContainer');
    
    try {
        loadingIndicator.classList.remove('d-none');
        
        const response = await fetch('/ai-characters');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        aiCharacters = data.characters;
        
        // Clear container
        container.innerHTML = '';
        
        // Create character cards
        aiCharacters.forEach(character => {
            const characterCard = createCharacterCard(character);
            container.appendChild(characterCard);
        });
        
    } catch (error) {
        console.error('Error loading AI characters:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load AI characters. Please refresh the page and try again.
                </div>
            </div>
        `;
    } finally {
        loadingIndicator.classList.add('d-none');
    }
}
function getEmojiForCharacter(name) {
    const lower = name.toLowerCase();
    if (lower.includes('paranoid')) return '🕵️';
    if (lower.includes('jealous')) return '💔';
    if (lower.includes('depressed')) return '😔';
    if (lower.includes('anxious')) return '😰';
    if (lower.includes('narcissistic')) return '👑';
    return '🤖';
}

function createCharacterCard(character) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    // Determine icon based on character type
    let icon = 'fas fa-robot';
    if (character.name.toLowerCase().includes('paranoid')) {
        icon = 'fas fa-eye';
    } else if (character.name.toLowerCase().includes('jealous')) {
        icon = 'fas fa-heart-broken';
    } else if (character.name.toLowerCase().includes('depressed')) {
        icon = 'fas fa-cloud-rain';
    } else if (character.name.toLowerCase().includes('anxious')) {
        icon = 'fas fa-bolt';
    } else if (character.name.toLowerCase().includes('narcissistic')) {
        icon = 'fas fa-crown';
    }

    // Add emoji to character name
    let emoji = '🤖'; // Default
    if (character.name.toLowerCase().includes('paranoid')) {
        emoji = '🕵️';
    } else if (character.name.toLowerCase().includes('jealous')) {
        emoji = '💔';
    } else if (character.name.toLowerCase().includes('depressed')) {
        emoji = '😔';
    } else if (character.name.toLowerCase().includes('anxious')) {
        emoji = '😰';
    } else if (character.name.toLowerCase().includes('narcissistic')) {
        emoji = '👑';
    }


    col.innerHTML = `
        <div class="character-card" data-character-id="${character.id}">
            <div class="card-body d-flex flex-column justify-content-between h-100">
                <div class="text-center">
                    <div class="character-icon">
                        <i class="${icon}"></i>
                    </div>
                    <h5>${emoji} ${character.name}</h5>
                    <p>${character.description}</p>
                </div>
                <div class="text-center mt-auto">
                    <button class="btn btn-start-session btn-sm">Start Session</button>
                </div>
            </div>
        </div>
    `;

    // Add click event listener
    col.querySelector('.character-card').addEventListener('click', () => {
        startSession(character.id);
    });
    
    return col;
}

async function startSession(characterId) {
    try {
        showLoading('Initializing therapy session...');
        
        const response = await fetch('/start_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ai_character_id: characterId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sessionData = await response.json();
        currentSession = sessionData;
        
        // Setup therapy session UI
        setupTherapySession(sessionData);
        
        // Add initial AI message
        addMessage('ai', sessionData.initial_message, {
            mood_score: sessionData.initial_mood,
            mood_reflection: sessionData.mood_reflection
        });
        
        // Update mood display
        updateMoodDisplay(sessionData.initial_mood, sessionData.mood_reflection);
        
        showTherapySession();
        
    } catch (error) {
        console.error('Error starting session:', error);
        showError('Failed to start therapy session. Please try again.');
    } finally {
        hideLoading();
    }
}

function setupTherapySession(sessionData) {
    // Update patient info
    document.getElementById('patientName').textContent = sessionData.ai_character.name;
    document.getElementById('patientDescription').textContent = sessionData.ai_character.description;
    
    // Clear chat messages
    document.getElementById('chatMessages').innerHTML = '';
    
    // Enable input
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const message = messageInput.value.trim();
    
    if (!message || !currentSession) return;
    
    try {
        // Disable input while processing
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        // Show human message immediately
        addMessage('human', message);
        messageInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to backend
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: currentSession.session_id,
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        hideTypingIndicator();
        
        // Add AI response
        addMessage('ai', data.ai_response, {
            mood_score: data.mood_score,
            mood_reflection: data.mood_reflection
        });
        
        // Update mood display
        updateMoodDisplay(data.mood_score, data.mood_reflection);
        
    } catch (error) {
        console.error('Error sending message:', error);
        hideTypingIndicator();
        showError('Failed to send message. Please try again.');
    } finally {
        // Re-enable input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

function addMessage(sender, content, metadata = {}) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatarIcon = sender === 'human' ? 'fas fa-user-md' : 'fas fa-robot';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let moodDisplay = '';
    if (sender === 'ai' && metadata.mood_score) {
        const moodClass = getMoodClass(metadata.mood_score);
        moodDisplay = `
            <div class="mood-indicator">
                <span class="mood-badge ${moodClass}">${metadata.mood_score}/10</span>
                <i class="fas fa-brain"></i>
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            <p class="message-text">${escapeHtml(content)}</p>
            <div class="message-meta">
                <span class="message-time">${timestamp}</span>
                ${moodDisplay}
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add animation
    messageDiv.classList.add('slide-up');
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-animation">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add typing animation CSS if not already present
    if (!document.getElementById('typingAnimationCSS')) {
        const style = document.createElement('style');
        style.id = 'typingAnimationCSS';
        style.textContent = `
            .typing-animation {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 8px 0;
            }
            .typing-animation span {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: var(--primary-color);
                animation: typing 1.4s infinite ease-in-out;
            }
            .typing-animation span:nth-child(1) { animation-delay: -0.32s; }
            .typing-animation span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typing {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function updateMoodDisplay(moodScore, moodReflection) {
    const moodIndicator = document.getElementById('moodIndicator');
    const moodScoreElement = document.getElementById('moodScore');
    const moodReflectionElement = document.getElementById('moodReflection');
    
    // Update mood bar
    const percentage = (moodScore / 10) * 100;
    moodIndicator.style.width = `${percentage}%`;
    
    // Update mood score badge
    const moodClass = getMoodClass(moodScore);
    moodScoreElement.textContent = `${moodScore}/10`;
    moodScoreElement.className = `badge ${moodClass}`;
    
    // Update reflection
    moodReflectionElement.textContent = moodReflection || 'Analyzing emotional state...';
    
    // Add glow effect based on mood
    const sidebar = document.querySelector('.therapy-sidebar');
    sidebar.style.boxShadow = `0 0 20px ${getMoodColor(moodScore)}33`;
}

function getMoodClass(score) {
    if (score <= 2) return 'bg-danger';
    if (score <= 4) return 'bg-warning';
    if (score <= 6) return 'bg-secondary';
    if (score <= 8) return 'bg-success';
    return 'bg-success';
}

function getMoodColor(score) {
    if (score <= 2) return '#ef4444';
    if (score <= 4) return '#f97316';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#22c55e';
    return '#10b981';
}

async function endSession() {
    if (!currentSession) return;
    
    try {
        showLoading('Ending therapy session...');
        
        const response = await fetch('/end_session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: currentSession.session_id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Wait a moment to ensure backend processing completes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Hide loading overlay completely before showing modal
        hideLoading();
        
        // Force ensure loading is hidden with additional check
        setTimeout(() => {
            const loadingElement = document.getElementById('loadingOverlay');
            if (loadingElement && !loadingElement.classList.contains('d-none')) {
                loadingElement.classList.add('d-none');
            }
        }, 100);
        
        // Generate and show session report
        await showSessionReport(currentSession.session_id);
        
    } catch (error) {
        console.error('Error ending session:', error);
        hideLoading(); // Ensure loading is hidden on error
        showError('Failed to end session properly, but you can still start a new one.');
        showCharacterSelection();
    }
}

async function showSessionReport(sessionId) {
    try {
        // Show modal with loading
        const loadingHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Generating report...</span>
                </div>
                <p class="mt-2 text-muted">Analyzing session data and generating comprehensive report...</p>
            </div>
        `;
        
        const reportContent = document.getElementById('sessionReportContent');
        reportContent.innerHTML = loadingHTML;
        
        // Ensure modal is shown
        if (!sessionReportModal) {
            sessionReportModal = new bootstrap.Modal(document.getElementById('sessionReportModal'));
        }
        sessionReportModal.show();
        
        // Add timeout to prevent indefinite loading
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Report generation timeout')), 15000);
        });
        
        // Fetch report with timeout
        const fetchPromise = fetch(`/session_report/${sessionId}`);
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reportData = await response.json();
        
        // Validate report data
        if (!reportData || typeof reportData !== 'object') {
            throw new Error('Invalid report data received');
        }
        
        // Build report HTML
        const reportHTML = buildSessionReportHTML(reportData);
        reportContent.innerHTML = reportHTML;
        
    } catch (error) {
        console.error('Error generating session report:', error);
        
        // Ensure we have access to the content element
        const reportContent = document.getElementById('sessionReportContent');
        if (reportContent) {
            reportContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to generate session report. ${error.message || 'Please try again.'}
                    <div class="mt-3">
                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="showCharacterSelection(); sessionReportModal.hide();">
                            Start New Session
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Show error notification
        showError('Report generation failed. You can start a new session.');
    }
}

function buildSessionReportHTML(data) {
    // Ensure required data exists with fallbacks
    const initialMood = data.initial_mood_score || 3;
    const finalMood = data.final_mood_score || 5;
    const moodChange = finalMood - initialMood;
    const moodChangeIcon = moodChange > 0 ? 'fas fa-arrow-up text-success' : moodChange < 0 ? 'fas fa-arrow-down text-danger' : 'fas fa-minus text-secondary';
    const moodChangeText = moodChange > 0 ? 'Improved' : moodChange < 0 ? 'Declined' : 'Stable';
    
    return `
        <div class="report-header mb-4">
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-robot me-2"></i>Patient Information</h6>
                    <p><strong>Name:</strong> ${escapeHtml(data.patient_name || 'AI Patient')}</p>
                    <p><strong>Condition:</strong> ${escapeHtml(data.character_description || 'Various AI mental health concerns')}</p>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-clock me-2"></i>Session Details</h6>
                    <p><strong>Duration:</strong> ${data.duration_minutes || 0} minutes</p>
                    <p><strong>Messages:</strong> ${data.total_messages || 0} total</p>
                </div>
            </div>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-heart-pulse me-2"></i>Emotional Progress</h6>
            <div class="progress-comparison">
                <div class="mood-score-display">
                    <span>Initial:</span>
                    <span class="badge ${getMoodClass(initialMood)}">${initialMood}/10</span>
                </div>
                <i class="${moodChangeIcon} mood-arrow"></i>
                <div class="mood-score-display">
                    <span>Final:</span>
                    <span class="badge ${getMoodClass(finalMood)}">${finalMood}/10</span>
                </div>
                <span class="ms-2 small text-muted">(${moodChangeText})</span>
            </div>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-clipboard-list me-2"></i>Key Issues Addressed</h6>
            <ul class="mb-0">
                ${data.key_issues ? data.key_issues.map(issue => `<li>${escapeHtml(issue)}</li>`).join('') : '<li>No specific issues identified</li>'}
            </ul>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-user-md me-2"></i>Therapist Effectiveness</h6>
            <p class="mb-0">${escapeHtml(data.therapist_effectiveness || 'Analysis not available')}</p>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-chart-line me-2"></i>AI Progress Assessment</h6>
            <p class="mb-0">${escapeHtml(data.ai_progress || 'Progress analysis not available')}</p>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-lightbulb me-2"></i>Recommendations</h6>
            <ul class="mb-0">
                ${data.next_steps ? data.next_steps.map(step => `<li>${escapeHtml(step)}</li>`).join('') : '<li>Continue regular therapy sessions</li>'}
            </ul>
        </div>
        
        <div class="report-section">
            <h6><i class="fas fa-file-alt me-2"></i>Session Summary</h6>
            <p class="mb-0 fst-italic">${escapeHtml(data.session_summary || 'Summary not available')}</p>
        </div>
    `;
}

function showCharacterSelection() {
    currentSession = null;
    document.getElementById('characterSelection').classList.remove('d-none');
    document.getElementById('therapySession').classList.add('d-none');
}

function showTherapySession() {
    document.getElementById('characterSelection').classList.add('d-none');
    document.getElementById('therapySession').classList.remove('d-none');
}

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('d-none');
        // Force show by removing any inline display styling
        overlay.style.display = '';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('d-none');
        // Force hide by setting display none as backup
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    // Create toast notification
    const toastHTML = `
        <div class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Add to page
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Show toast
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1060';
    document.body.appendChild(container);
    return container;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Handle page refresh/close during active session
window.addEventListener('beforeunload', function(e) {
    if (currentSession) {
        e.preventDefault();
        e.returnValue = 'You have an active therapy session. Are you sure you want to leave?';
    }
});
