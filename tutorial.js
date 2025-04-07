/**
 * DigDeep Game - Enhanced Tutorial System
 * Guides new players through the game mechanics with interactive steps
 */

const Tutorial = (function() {
    // Cache DOM elements
    const elements = {
        overlay: document.getElementById('tutorial-overlay'),
        steps: document.querySelectorAll('.tutorial-step'),
        nextButtons: document.querySelectorAll('.tutorial-next-button'),
        closeButton: document.querySelector('.tutorial-close-button'),
        diggingBackground: document.getElementById('digging-background'),
        digButton: document.getElementById('dig-button')
    };
    
    // Current step
    let currentStep = 1;
    let totalSteps = elements.steps.length;
    let tutorialActive = false;
    let clickHint = null;
    let tutorialPointer = null;
    
    // Initialize tutorial
    function init() {
        // Check if tutorial has been completed before
        const tutorialCompleted = localStorage.getItem('digdeep_tutorial_completed');
        
        if (!tutorialCompleted) {
            // Show tutorial after a short delay
            setTimeout(showTutorial, 1000);
        }
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Next buttons
        elements.nextButtons.forEach(button => {
            button.addEventListener('click', nextStep);
        });
        
        // Close button
        if (elements.closeButton) {
            elements.closeButton.addEventListener('click', closeTutorial);
        }
    }
    
    // Show tutorial
    function showTutorial() {
        tutorialActive = true;
        elements.overlay.classList.add('active');
        
        // Create progress indicator
        createProgressIndicator();
        
        // Show first step
        showStep(1);
        
        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
    }
    
    // Create progress indicator
    function createProgressIndicator() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'tutorial-progress';
        
        for (let i = 1; i <= totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = 'tutorial-progress-dot';
            if (i === 1) dot.classList.add('active');
            progressContainer.appendChild(dot);
        }
        
        elements.steps[0].parentNode.insertBefore(progressContainer, elements.steps[0]);
    }
    
    // Show specific step
    function showStep(step) {
        // Hide all steps
        elements.steps.forEach(stepElement => {
            stepElement.style.display = 'none';
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`.tutorial-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            
            // Update progress indicator
            updateProgressIndicator(step);
            
            // Add step-specific interactions
            addStepInteractions(step);
        }
    }
    
    // Update progress indicator
    function updateProgressIndicator(step) {
        const dots = document.querySelectorAll('.tutorial-progress-dot');
        dots.forEach((dot, index) => {
            if (index + 1 === step) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Add step-specific interactions
    function addStepInteractions(step) {
        // Remove any existing interactions
        removeStepInteractions();
        
        switch (step) {
            case 1:
                // Highlight digging area and show click hint
                highlightDiggingArea();
                break;
                
            case 2:
                // Highlight resource display
                highlightResourceDisplay();
                break;
                
            case 3:
                // Highlight upgrades panel
                highlightUpgradesPanel();
                break;
                
            case 4:
                // No specific interaction for hazards step
                break;
                
            case 5:
                // Final step, no specific interaction
                break;
        }
    }
    
    // Remove step interactions
    function removeStepInteractions() {
        // Remove highlights
        const highlights = document.querySelectorAll('.tutorial-highlight');
        highlights.forEach(element => {
            element.classList.remove('tutorial-highlight');
        });
        
        // Remove click hint
        if (clickHint && clickHint.parentNode) {
            clickHint.parentNode.removeChild(clickHint);
            clickHint = null;
        }
        
        // Remove tutorial pointer
        if (tutorialPointer && tutorialPointer.parentNode) {
            tutorialPointer.parentNode.removeChild(tutorialPointer);
            tutorialPointer = null;
        }
    }
    
    // Highlight digging area
    function highlightDiggingArea() {
        // Add highlight class to digging background
        elements.diggingBackground.classList.add('tutorial-highlight');
        
        // Create click hint in the center of digging area
        createClickHint();
        
        // Create tutorial pointer pointing to digging area
        createTutorialPointer(elements.diggingBackground);
    }
    
    // Create click hint animation
    function createClickHint() {
        // Remove existing click hint if any
        if (clickHint && clickHint.parentNode) {
            clickHint.parentNode.removeChild(clickHint);
        }
        
        // Create new click hint
        clickHint = document.createElement('div');
        clickHint.className = 'click-hint';
        
        // Position in center of digging area
        const rect = elements.diggingBackground.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        clickHint.style.left = `${centerX - 25}px`;
        clickHint.style.top = `${centerY - 25}px`;
        
        // Add to digging background
        elements.diggingBackground.appendChild(clickHint);
        
        // Create multiple hints with different delays
        for (let i = 1; i <= 2; i++) {
            setTimeout(() => {
                const additionalHint = document.createElement('div');
                additionalHint.className = 'click-hint';
                additionalHint.style.left = `${centerX - 25}px`;
                additionalHint.style.top = `${centerY - 25}px`;
                elements.diggingBackground.appendChild(additionalHint);
                
                // Remove after animation completes
                setTimeout(() => {
                    if (additionalHint.parentNode) {
                        additionalHint.parentNode.removeChild(additionalHint);
                    }
                }, 2000);
            }, i * 500);
        }
    }
    
    // Create tutorial pointer
    function createTutorialPointer(targetElement) {
        // Remove existing pointer if any
        if (tutorialPointer && tutorialPointer.parentNode) {
            tutorialPointer.parentNode.removeChild(tutorialPointer);
        }
        
        // Create new pointer
        tutorialPointer = document.createElement('div');
        tutorialPointer.className = 'tutorial-pointer';
        
        // Position near target element
        const rect = targetElement.getBoundingClientRect();
        const pointerX = rect.left + rect.width / 2 - 50;
        const pointerY = rect.top - 40;
        
        tutorialPointer.style.left = `${pointerX}px`;
        tutorialPointer.style.top = `${pointerY}px`;
        
        // Add to body
        document.body.appendChild(tutorialPointer);
    }
    
    // Highlight resource display
    function highlightResourceDisplay() {
        const resourceDisplay = document.getElementById('resource-display');
        if (resourceDisplay) {
            resourceDisplay.classList.add('tutorial-highlight');
            createTutorialPointer(resourceDisplay);
        }
    }
    
    // Highlight upgrades panel
    function highlightUpgradesPanel() {
        const upgradesPanel = document.getElementById('upgrades-panel');
        if (upgradesPanel) {
            upgradesPanel.classList.add('tutorial-highlight');
            createTutorialPointer(upgradesPanel);
        }
    }
    
    // Next step
    function nextStep() {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
        }
    }
    
    // Close tutorial
    function closeTutorial() {
        tutorialActive = false;
        
        // Add fade out animation
        elements.overlay.style.animation = 'tutorialFadeOut 0.3s ease forwards';
        
        // Remove after animation completes
        setTimeout(() => {
            elements.overlay.classList.remove('active');
            elements.overlay.style.animation = '';
            
            // Remove step interactions
            removeStepInteractions();
            
            // Allow scrolling on body again
            document.body.style.overflow = '';
            
            // Mark tutorial as completed
            localStorage.setItem('digdeep_tutorial_completed', 'true');
        }, 300);
    }
    
    // Check if tutorial is active
    function isActive() {
        return tutorialActive;
    }
    
    // Reset tutorial (for testing)
    function reset() {
        localStorage.removeItem('digdeep_tutorial_completed');
        currentStep = 1;
        tutorialActive = false;
    }
    
    // Return public methods
    return {
        init,
        showTutorial,
        closeTutorial,
        isActive,
        reset
    };
})();

// Initialize tutorial when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Tutorial.init();
});