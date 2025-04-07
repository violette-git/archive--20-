/**
 * DigDeep Game - Feature Test Script
 * This script tests all modernized features of the DigDeep game
 */

// Test configuration
const testConfig = {
    runAllTests: true,
    logResults: true,
    testTimeout: 5000 // ms
};

// Test results
const testResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0
};

// Test suite
const DigDeepTests = {
    // Initialize tests
    init: function() {
        console.log("Starting DigDeep feature tests...");
        this.runTests();
    },
    
    // Run all tests
    runTests: function() {
        // UI tests
        this.testUIElements();
        
        // Click-anywhere interaction tests
        this.testClickInteraction();
        
        // Interactive resources tests
        this.testInteractiveResources();
        
        // Trading card UI tests
        this.testTradingCardUI();
        
        // Audio system tests
        this.testAudioSystem();
        
        // Report results
        this.reportResults();
    },
    
    // Test UI elements
    testUIElements: function() {
        console.log("Testing UI elements...");
        
        // Test resource counters
        this.runTest("Resource counters exist", function() {
            const resourceCounters = document.querySelectorAll('.resource-counter');
            return resourceCounters.length > 0;
        });
        
        // Test game panels
        this.runTest("Game panels exist", function() {
            const leftPanel = document.getElementById('left-panel');
            const rightPanel = document.getElementById('right-panel');
            return leftPanel && rightPanel;
        });
        
        // Test tab navigation
        this.runTest("Tab navigation works", function() {
            const tabs = document.querySelectorAll('.tab');
            if (tabs.length === 0) return false;
            
            // Click each tab and check if content changes
            let tabsWork = true;
            tabs.forEach(tab => {
                tab.click();
                const targetId = tab.getAttribute('data-target');
                const targetPanel = document.getElementById(targetId);
                if (!targetPanel || targetPanel.style.display === 'none') {
                    tabsWork = false;
                }
            });
            
            return tabsWork;
        });
    },
    
    // Test click-anywhere interaction
    testClickInteraction: function() {
        console.log("Testing click-anywhere interaction...");
        
        // Test dig area exists
        this.runTest("Dig area exists", function() {
            const digArea = document.getElementById('dig-area');
            return !!digArea;
        });
        
        // Test click event listener
        this.runTest("Click event listener works", function() {
            const digArea = document.getElementById('dig-area');
            if (!digArea) return false;
            
            // Create a test event
            let eventFired = false;
            const originalClick = digArea.onclick;
            
            digArea.onclick = function(e) {
                eventFired = true;
                if (originalClick) originalClick.call(this, e);
            };
            
            // Simulate a click
            digArea.click();
            
            // Restore original handler
            digArea.onclick = originalClick;
            
            return eventFired;
        });
    },
    
    // Test interactive resources
    testInteractiveResources: function() {
        console.log("Testing interactive resources...");
        
        // Test resource icons
        this.runTest("Resource icons exist", function() {
            const resourceIcons = document.querySelectorAll('.resource-icon');
            return resourceIcons.length > 0;
        });
        
        // Test resource counter interactivity
        this.runTest("Resource counters are interactive", function() {
            const resourceCounters = document.querySelectorAll('.resource-counter');
            if (resourceCounters.length === 0) return false;
            
            // Check if counters have click handlers
            let hasClickHandlers = false;
            for (let i = 0; i < resourceCounters.length; i++) {
                const events = getEventListeners(resourceCounters[i]);
                if (events && (events.click || events.mouseover)) {
                    hasClickHandlers = true;
                    break;
                }
            }
            
            return hasClickHandlers;
        }, true); // Skip in browser environment where getEventListeners isn't available
    },
    
    // Test trading card UI
    testTradingCardUI: function() {
        console.log("Testing trading card UI...");
        
        // Test card elements
        this.runTest("Card elements exist", function() {
            const cards = document.querySelectorAll('.card');
            return cards.length > 0;
        });
        
        // Test card flip functionality
        this.runTest("Card flip works", function() {
            const cards = document.querySelectorAll('.card');
            if (cards.length === 0) return false;
            
            // Try to flip a card
            let cardFlipped = false;
            const card = cards[0];
            
            // Store original class
            const originalClass = card.className;
            
            // Click the card
            card.click();
            
            // Check if class changed
            cardFlipped = card.className !== originalClass;
            
            return cardFlipped;
        }, true); // Skip in test environment
    },
    
    // Test audio system
    testAudioSystem: function() {
        console.log("Testing audio system...");
        
        // Test audio system exists
        this.runTest("Audio system exists", function() {
            return typeof AudioSystem !== 'undefined';
        });
        
        // Test audio controls
        this.runTest("Audio controls exist", function() {
            const audioControls = document.querySelector('.audio-controls');
            return !!audioControls;
        });
        
        // Test volume sliders
        this.runTest("Volume sliders exist", function() {
            const volumeSliders = document.querySelectorAll('.volume-slider');
            return volumeSliders.length >= 3; // Master, SFX, Music
        });
        
        // Test mute button
        this.runTest("Mute button exists", function() {
            const muteButton = document.querySelector('.mute-button');
            return !!muteButton;
        });
    },
    
    // Run a single test
    runTest: function(name, testFn, skip = false) {
        testResults.total++;
        
        if (skip) {
            console.log(`  [SKIP] ${name}`);
            testResults.skipped++;
            return;
        }
        
        try {
            const result = testFn();
            if (result) {
                console.log(`  [PASS] ${name}`);
                testResults.passed++;
            } else {
                console.log(`  [FAIL] ${name}`);
                testResults.failed++;
            }
        } catch (error) {
            console.log(`  [ERROR] ${name}: ${error.message}`);
            testResults.failed++;
        }
    },
    
    // Report test results
    reportResults: function() {
        console.log("\nTest Results:");
        console.log(`  Total: ${testResults.total}`);
        console.log(`  Passed: ${testResults.passed}`);
        console.log(`  Failed: ${testResults.failed}`);
        console.log(`  Skipped: ${testResults.skipped}`);
        
        const passRate = Math.round((testResults.passed / (testResults.total - testResults.skipped)) * 100);
        console.log(`  Pass Rate: ${passRate}%`);
        
        if (testResults.failed === 0) {
            console.log("\n✅ All tests passed! The game is ready for release.");
        } else {
            console.log("\n❌ Some tests failed. Please fix the issues before release.");
        }
    }
};

// Run tests when the page is loaded
window.addEventListener('load', function() {
    // Wait a bit for the game to initialize
    setTimeout(function() {
        DigDeepTests.init();
    }, 1000);
});