/**
 * Tutorial.js - Game tutorial and introduction system
 * Handles the tutorial overlay, steps, and user preferences
 */

const GameTutorial = (function() {
    'use strict';

    // Private variables
    let currentStep = 1;
    const totalSteps = 6;
    const TUTORIAL_SHOWN_KEY = 'digDeepTutorialShown';

    /**
     * Initializes the tutorial system
     */
    function init() {
        // Check if tutorial has been shown before
        const tutorialShown = localStorage.getItem(TUTORIAL_SHOWN_KEY);
        
        if (!tutorialShown) {
            // Show tutorial on first visit
            showTutorial();
        }
        
        // Set up event listeners
        setupEventListeners();
        
        console.log('Tutorial system initialized');
    }

    /**
     * Sets up event listeners for tutorial controls
     */
    function setupEventListeners() {
        // Tutorial navigation buttons
        const prevButton = document.getElementById('tutorial-prev');
        const nextButton = document.getElementById('tutorial-next');
        const startButton = document.getElementById('tutorial-start');
        const closeButton = document.getElementById('tutorial-close');
        const dontShowCheckbox = document.getElementById('tutorial-dont-show');
        
        // Navigation dots
        const dots = document.querySelectorAll('.tutorial-dot');
        
        // Previous button
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                if (currentStep > 1) {
                    showStep(currentStep - 1);
                }
            });
        }
        
        // Next button
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            });
        }
        
        // Start button
        if (startButton) {
            startButton.addEventListener('click', function() {
                closeTutorial();
                
                // Save preference if checkbox is checked
                if (dontShowCheckbox && dontShowCheckbox.checked) {
                    localStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
                }
            });
        }
        
        // Close button
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                closeTutorial();
                
                // Save preference if checkbox is checked
                if (dontShowCheckbox && dontShowCheckbox.checked) {
                    localStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
                }
            });
        }
        
        // Navigation dots
        dots.forEach(dot => {
            dot.addEventListener('click', function() {
                const step = parseInt(dot.dataset.step);
                if (!isNaN(step)) {
                    showStep(step);
                }
            });
        });
        
        // Help button in game UI
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            const helpButton = document.createElement('button');
            helpButton.className = 'help-button';
            helpButton.innerHTML = '<span class="help-icon">?</span>';
            helpButton.title = 'Show Tutorial';
            helpButton.addEventListener('click', showTutorial);
            
            gameHeader.appendChild(helpButton);
        }
    }

    /**
     * Shows the tutorial overlay
     */
    function showTutorial() {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        if (tutorialOverlay) {
            tutorialOverlay.classList.add('visible');
            showStep(1); // Start at first step
        }
    }

    /**
     * Closes the tutorial overlay
     */
    function closeTutorial() {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        if (tutorialOverlay) {
            tutorialOverlay.classList.remove('visible');
        }
    }

    /**
     * Shows a specific tutorial step
     * @param {number} step - Step number to show
     */
    function showStep(step) {
        // Validate step number
        if (step < 1 || step > totalSteps) return;
        
        // Update current step
        currentStep = step;
        
        // Hide all steps
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach(stepElement => {
            stepElement.style.display = 'none';
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`.tutorial-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }
        
        // Update navigation buttons
        const prevButton = document.getElementById('tutorial-prev');
        const nextButton = document.getElementById('tutorial-next');
        
        if (prevButton) {
            prevButton.disabled = (step === 1);
        }
        
        if (nextButton) {
            nextButton.disabled = (step === totalSteps);
        }
        
        // Update dots
        const dots = document.querySelectorAll('.tutorial-dot');
        dots.forEach(dot => {
            const dotStep = parseInt(dot.dataset.step);
            if (dotStep === step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    /**
     * Shows a specific tutorial tip during gameplay
     * @param {string} tipId - ID of the tip to show
     */
    function showGameplayTip(tipId) {
        // Implementation for contextual tips during gameplay
        // This would show smaller tips based on player actions
        
        const tips = {
            firstDig: {
                title: 'First Dig!',
                message: 'Great job! Keep digging to collect more resources.'
            },
            firstUpgrade: {
                title: 'First Upgrade!',
                message: 'Upgrades make digging faster and more efficient.'
            },
            firstHazard: {
                title: 'Hazard Warning!',
                message: 'Spend resources to prevent hazards before they activate.'
            },
            autoDigging: {
                title: 'Auto-Digging!',
                message: 'Your diggers will now work automatically, even when you\'re not clicking.'
            }
        };
        
        const tip = tips[tipId];
        if (tip) {
            showTip(tip.title, tip.message);
        }
    }

    /**
     * Shows a tip notification
     * @param {string} title - Tip title
     * @param {string} message - Tip message
     */
    function showTip(title, message) {
        // Create tip notification
        const tipNotification = document.createElement('div');
        tipNotification.className = 'notification notification-tip';
        
        // Add tip content
        tipNotification.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(tipNotification);
        
        // Animate in
        setTimeout(() => {
            tipNotification.classList.add('notification-visible');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            tipNotification.classList.remove('notification-visible');
            setTimeout(() => {
                tipNotification.remove();
            }, 300);
        }, 5000);
    }

    // Initialize tutorial when document is ready
    document.addEventListener('DOMContentLoaded', init);

    // Public API
    return {
        showTutorial,
        closeTutorial,
        showGameplayTip
    };
})();