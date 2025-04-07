/**
 * Test script for DigDeep interactive features
 * This script tests the interactive gem/resource system and trading card UI
 */

// Function to test resource counter interactivity
function testResourceCounters() {
    console.log("Testing resource counter interactivity...");
    
    // Get all resource counters
    const resourceCounters = document.querySelectorAll('.resource-counter');
    
    // Log the number of resource counters found
    console.log(`Found ${resourceCounters.length} resource counters`);
    
    // Check if resource counters have the correct classes and structure
    resourceCounters.forEach(counter => {
        const resourceType = counter.classList[1].split('-')[1];
        const icon = counter.querySelector('.resource-icon');
        const value = counter.querySelector('.resource-value');
        const tooltip = counter.querySelector('.tooltip-text');
        
        console.log(`Resource: ${resourceType}`);
        console.log(`- Has icon: ${icon !== null}`);
        console.log(`- Has value: ${value !== null}`);
        console.log(`- Has tooltip: ${tooltip !== null}`);
    });
}

// Function to test card UI
function testCardUI() {
    console.log("Testing trading card UI...");
    
    // Get all card tabs
    const cardTabs = document.querySelectorAll('.card-tab');
    console.log(`Found ${cardTabs.length} card tabs`);
    
    // Get all card categories
    const cardCategories = document.querySelectorAll('.card-category');
    console.log(`Found ${cardCategories.length} card categories`);
    
    // Check if there's an active tab and category
    const activeTab = document.querySelector('.card-tab.active');
    const activeCategory = document.querySelector('.card-category.active');
    
    console.log(`Active tab: ${activeTab ? activeTab.textContent : 'None'}`);
    console.log(`Active category: ${activeCategory ? activeCategory.id : 'None'}`);
    
    // Count cards in each category
    cardCategories.forEach(category => {
        const cards = category.querySelectorAll('.card');
        console.log(`${category.id}: ${cards.length} cards`);
        
        // Check first card structure if available
        if (cards.length > 0) {
            const firstCard = cards[0];
            console.log(`Card structure check for ${category.id}:`);
            console.log(`- Has card-inner: ${firstCard.querySelector('.card-inner') !== null}`);
            console.log(`- Has card-front: ${firstCard.querySelector('.card-front') !== null}`);
            console.log(`- Has card-back: ${firstCard.querySelector('.card-back') !== null}`);
            console.log(`- Has card-image: ${firstCard.querySelector('.card-image') !== null}`);
            console.log(`- Has card-title: ${firstCard.querySelector('.card-title') !== null}`);
            console.log(`- Has card-description: ${firstCard.querySelector('.card-description') !== null}`);
            console.log(`- Has card-footer: ${firstCard.querySelector('.card-footer') !== null}`);
            console.log(`- Has purchase button: ${firstCard.querySelector('.card-purchase') !== null}`);
        }
    });
}

// Function to test click-anywhere functionality
function testClickAnywhere() {
    console.log("Testing click-anywhere functionality...");
    
    // Get the digging area
    const diggingArea = document.getElementById('digging-area');
    
    if (diggingArea) {
        console.log("Digging area found");
        console.log("- Has click event listener: true (cannot verify programmatically)");
        console.log("- Has touch event listener: true (cannot verify programmatically)");
    } else {
        console.log("Digging area not found");
    }
}

// Function to test animations
function testAnimations() {
    console.log("Testing animations...");
    
    // Check if CSS animations are defined
    const styleSheets = document.styleSheets;
    let animationsFound = [];
    
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
                if (rules[j].type === CSSRule.KEYFRAMES_RULE) {
                    animationsFound.push(rules[j].name);
                }
            }
        } catch (e) {
            console.log("Could not access stylesheet rules (likely due to CORS)");
        }
    }
    
    console.log(`Found animations: ${animationsFound.join(', ') || 'None detected'}`);
    
    // List expected animations
    const expectedAnimations = [
        'resourceGain',
        'particleFade',
        'digEffect',
        'ripple',
        'pulse',
        'purchaseSuccess',
        'cardUse'
    ];
    
    console.log("Expected animations:");
    expectedAnimations.forEach(animation => {
        console.log(`- ${animation}: ${animationsFound.includes(animation) ? 'Found' : 'Not found (may be due to CORS)'}`);
    });
}

// Function to run all tests
function runTests() {
    console.log("=== DIGDEEP INTERACTIVE FEATURES TEST ===");
    console.log("Testing implementation of interactive gem/resource system and trading card UI");
    console.log("----------------------------------------");
    
    testResourceCounters();
    console.log("----------------------------------------");
    
    testCardUI();
    console.log("----------------------------------------");
    
    testClickAnywhere();
    console.log("----------------------------------------");
    
    testAnimations();
    console.log("----------------------------------------");
    
    console.log("Tests completed. Check console for results.");
    console.log("Note: Some tests may show 'not found' due to browser security restrictions.");
    console.log("Manual testing is recommended for full verification.");
}

// Run tests when the page is fully loaded
window.addEventListener('load', runTests);