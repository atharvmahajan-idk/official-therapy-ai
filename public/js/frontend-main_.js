/**
 * Therapy AI Main Application
 * 
 * This script handles the primary user interactions on the main page,
 * including theme switching, animations, and navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    const App = {
        // --- Properties ---
        elements: {},
        state: {
            isDarkTheme: true,
            isSplineInteracting: false,
            intervals: {
                welcome: null,
                mood: null,
            },
            focusTrapHandler: null,
        },
        // Collection of messages for dynamic display
        messages: {
            welcome: [
                "Hello there! How are you feeling today?",
                "Welcome back! Ready to talk?",
                "I'm here to listen...",
                "Share your thoughts with me.",
                "Your safe space for expression.",
            ],
            mood: [
                "How are you feeling today?",
                "Share your mood with me.",
                "Let's check in on your emotions.",
                "Express your feelings freely.",
            ],
        },

        // --- Initialization ---
        init() {
            this.cacheDOMElements();
            this.loadTheme();
            this.setupEventListeners();
            this.startMessageIntervals();
            // Defer spline setup until the component is defined
            customElements.whenDefined('spline-viewer').then(() => {
            this.setupSplineInteraction();
            });
        },

        /**
         * Queries and stores all necessary DOM elements.
         */
        cacheDOMElements() {
            this.elements = {
                body: document.body,
        toolbarMessage: document.querySelector('.toolbar-message'),
        settingsBtn: document.querySelector('.settings-btn'),
        themeToggle: document.querySelector('.theme-toggle'),
                themeToggleIcon: document.querySelector('.sun-and-moon'),
        splineViewer: document.querySelector('spline-viewer'),
        typingIndicator: document.querySelector('.typing-indicator'),
        moodIndicator: document.querySelector('.mood-indicator'),
        interactionHint: document.querySelector('.interaction-hint'),
        splineCircle: document.querySelector('.spline_center_circle'),
        notesBtn: document.querySelector('.notes-btn'),
                summaryBtn: document.querySelector('.summary-btn'),
                // AI Summary Modal Elements
                summaryModal: document.getElementById('summary-modal'),
                closeSummaryBtn: document.getElementById('close-summary-modal'),
                summaryPlaceholder: document.querySelector('.summary-placeholder'),
                summaryResult: document.querySelector('.summary-result'),
            };
        },
        
        // --- Event Handling ---
        setupEventListeners() {
            // Helper for keyboard accessibility
            const onKey = (e, callback) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    callback();
                }
            };

            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
            this.elements.themeToggle.addEventListener('keydown', (e) => onKey(e, () => this.toggleTheme()));
            
            this.elements.notesBtn.addEventListener('click', () => { window.location.href = 'notes.html'; });
            this.elements.notesBtn.addEventListener('keydown', (e) => onKey(e, () => { window.location.href = 'notes.html'; }));
            
            this.elements.settingsBtn.addEventListener('click', this.handleSettingsClick.bind(this));
            this.elements.settingsBtn.addEventListener('keydown', (e) => onKey(e, this.handleSettingsClick.bind(this)));
            
            this.elements.summaryBtn.addEventListener('click', this.handleSummaryClick.bind(this));
            this.elements.summaryBtn.addEventListener('keydown', (e) => onKey(e, this.handleSummaryClick.bind(this)));

            // Modal-specific listeners
            this.elements.closeSummaryBtn.addEventListener('click', () => this.closeSummaryModal());
            this.elements.summaryModal.addEventListener('click', (e) => {
                if (e.target === this.elements.summaryModal) {
                    this.closeSummaryModal();
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.elements.summaryModal.classList.contains('visible')) {
                    this.closeSummaryModal();
                }
            });

            window.addEventListener('unload', () => {
                clearInterval(this.state.intervals.welcome);
                clearInterval(this.state.intervals.mood);
            });
        },

        // --- Theme Management ---
        loadTheme() {
            const savedTheme = localStorage.getItem('therapyAiTheme');
            this.state.isDarkTheme = savedTheme ? JSON.parse(savedTheme) : true;
            this.applyTheme();
        },
        
        applyTheme() {
            this.elements.body.classList.toggle('light-theme', !this.state.isDarkTheme);
            const theme = this.state.isDarkTheme ? 'dark' : 'light';
            this.elements.body.dataset.theme = theme;
            
            const newLabel = `Switch to ${this.state.isDarkTheme ? 'light' : 'dark'} theme`;
            this.elements.themeToggle.setAttribute('aria-label', newLabel);

            this.elements.body.classList.add('theme-transitioning');
            setTimeout(() => {
                this.elements.body.classList.remove('theme-transitioning');
            }, 500);
        },
        
        toggleTheme() {
            this.state.isDarkTheme = !this.state.isDarkTheme;
            this.applyTheme();
            localStorage.setItem('therapyAiTheme', this.state.isDarkTheme);
        },

        // --- UI Logic & Animations ---
        
        /**
         * Displays a random message from a given array.
         * @param {HTMLElement} element - The element to update.
         * @param {string[]} messageArray - The array of messages to choose from.
         */
        updateRandomMessage(element, messageArray) {
            if (!element) return;
            const message = messageArray[Math.floor(Math.random() * messageArray.length)];
            element.style.opacity = '0';
            setTimeout(() => {
                element.textContent = message;
                element.style.opacity = '1';
            }, 500);
        },

        startMessageIntervals() {
            this.updateRandomMessage(this.elements.toolbarMessage, this.messages.welcome);
            this.updateRandomMessage(this.elements.moodIndicator, this.messages.mood);
            
            this.state.intervals.welcome = setInterval(() => this.updateRandomMessage(this.elements.toolbarMessage, this.messages.welcome), 8000);
            this.state.intervals.mood = setInterval(() => this.updateRandomMessage(this.elements.moodIndicator, this.messages.mood), 5000);
        },

        handleSettingsClick() {
            this.elements.settingsBtn.animate([
                { transform: 'rotate(0deg)' }, { transform: 'rotate(180deg)' }
            ], { duration: 500, easing: 'cubic-bezier(.68,-0.55,.27,1.55)' });
            setTimeout(() => {
                window.location.href = 'settings.html';
            }, 300);
        },
        
        // --- AI Summary Modal ---
        async handleSummaryClick() {
            this.openSummaryModal();

            // Reset modal to its loading state
            this.elements.summaryPlaceholder.style.display = 'flex';
            this.elements.summaryResult.style.display = 'none';
            this.elements.summaryResult.innerHTML = '';
            
            // Simulate analysis delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            this.populateSummary();
        },

        populateSummary() {
             this.elements.summaryPlaceholder.style.display = 'none';
             
             // Dummy summary content
             const summaryHTML = `
                <h4>Key Themes:</h4>
                <ul>
                    <li>Consistently journaling for the past <strong>5 days</strong>.</li>
                    <li>Recurring thoughts on <strong>work-related stress</strong>.</li>
                    <li>Expressions of <strong>pride in personal projects</strong>.</li>
                </ul>
                <h4>Suggestions:</h4>
                <p>Consider exploring mindfulness techniques before your workday. It might also be helpful to dedicate a journal entry to breaking down project tasks into smaller, more manageable steps.</p>
                <p>Keep up the fantastic work on self-reflection!</p>
             `;
             
             this.elements.summaryResult.innerHTML = summaryHTML;
             this.elements.summaryResult.style.display = 'block';
        },

        openSummaryModal() {
            this.elements.summaryModal.classList.remove('hidden');
            // Timeout ensures the 'display' property is set before the transition starts
            setTimeout(() => {
                this.elements.summaryModal.classList.add('visible');
                this.trapFocus(this.elements.summaryModal);
            }, 10);
        },

        closeSummaryModal() {
            if (this.state.focusTrapHandler) {
                document.removeEventListener('keydown', this.state.focusTrapHandler);
                this.state.focusTrapHandler = null;
            }

            this.elements.summaryModal.classList.remove('visible');
            
            // Wait for transition to end before hiding the element completely
            const onTransitionEnd = () => {
                this.elements.summaryModal.classList.add('hidden');
                this.elements.summaryModal.removeEventListener('transitionend', onTransitionEnd);
            };
            this.elements.summaryModal.addEventListener('transitionend', onTransitionEnd);
            
            this.elements.summaryBtn.focus(); // Return focus for accessibility
        },

        trapFocus(modalElement) {
            // Set initial focus on the first button (the close button)
            const initialFocusElement = modalElement.querySelector('button');
            if (initialFocusElement) {
                initialFocusElement.focus();
            }

            this.state.focusTrapHandler = (e) => {
                if (!this.elements.summaryModal.classList.contains('visible') || e.key !== 'Tab') {
                    return;
                }

                const focusableElements = modalElement.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length === 0) {
                    e.preventDefault(); // No focusable elements, so just trap focus
                    return;
                }
                const firstFocusable = focusableElements[0];

                if (e.shiftKey) { // Shift + Tab (backwards)
                    if (document.activeElement === firstFocusable) {
                        const lastFocusable = focusableElements[focusableElements.length - 1];
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else { // Tab (forwards)
                    if (document.activeElement === focusableElements[focusableElements.length - 1]) {
                        focusableElements[0].focus();
                        e.preventDefault();
                    }
                }
            };

            document.addEventListener('keydown', this.state.focusTrapHandler);
        },

        // --- Spline Interaction ---
        setupSplineInteraction() {
            const splineViewer = this.elements.splineViewer;
            if (!splineViewer) return;

            const onSplineLoad = () => {
                this.elements.splineCircle.classList.remove('loading');
            };

            splineViewer.addEventListener('load', onSplineLoad);

            const isLoaded = splineViewer.shadowRoot && splineViewer.shadowRoot.querySelector('canvas');
            if (isLoaded) {
                onSplineLoad();
            } else {
                this.elements.splineCircle.classList.add('loading');
            }

            splineViewer.addEventListener('error', (e) => {
                console.error('Spline error:', e);
                this.elements.splineCircle.classList.remove('loading');
                this.elements.splineCircle.innerHTML = '<div class="error-message">Could not load 3D scene.</div>';
            });
            
            splineViewer.addEventListener('mousedown', () => {
                this.state.isSplineInteracting = true;
                    this.elements.interactionHint.style.opacity = '0';
            });

            splineViewer.addEventListener('mouseup', () => {
                    this.state.isSplineInteracting = false;
            });

            splineViewer.addEventListener('mouseleave', () => {
                this.state.isSplineInteracting = false;
            });
        },
    };

    App.init();
}); 