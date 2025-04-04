/**
 * Test Script for Dig Deep
 * Comprehensive testing of game mechanics, save system, and performance
 * 
 * Run this script in the browser console to test the game
 */

const GameTester = (function() {
    'use strict';
    
    // Test results
    const testResults = {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 0
    };
    
    // Test categories
    const TEST_CATEGORIES = {
        CORE: 'Core Mechanics',
        RESOURCES: 'Resource Management',
        UPGRADES: 'Upgrade System',
        PROGRESSION: 'Game Progression',
        HAZARDS: 'Hazard System',
        ACHIEVEMENTS: 'Achievement System',
        CONTENT: 'Content System',
        SAVE: 'Save System',
        PERFORMANCE: 'Performance'
    };
    
    /**
     * Runs all tests
     */
    function runAllTests() {
        console.log('=== Dig Deep Game Test Suite ===');
        console.log('Starting tests...');
        
        // Reset test results
        testResults.passed = 0;
        testResults.failed = 0;
        testResults.skipped = 0;
        testResults.total = 0;
        
        // Run tests by category
        testCoreMechanics();
        testResourceManagement();
        testUpgradeSystem();
        testGameProgression();
        testHazardSystem();
        testAchievementSystem();
        testContentSystem();
        testSaveSystem();
        testPerformance();
        
        // Print summary
        console.log('\n=== Test Summary ===');
        console.log(`Total Tests: ${testResults.total}`);
        console.log(`Passed: ${testResults.passed}`);
        console.log(`Failed: ${testResults.failed}`);
        console.log(`Skipped: ${testResults.skipped}`);
        console.log(`Success Rate: ${Math.round((testResults.passed / (testResults.total - testResults.skipped)) * 100)}%`);
        
        return testResults;
    }
    
    /**
     * Runs a single test
     * @param {string} name - Test name
     * @param {string} category - Test category
     * @param {Function} testFn - Test function
     */
    function runTest(name, category, testFn) {
        testResults.total++;
        
        try {
            console.log(`\n[${category}] Testing: ${name}`);
            const result = testFn();
            
            if (result === 'skip') {
                console.log(`[SKIP] ${name}`);
                testResults.skipped++;
            } else if (result) {
                console.log(`[PASS] ${name}`);
                testResults.passed++;
            } else {
                console.error(`[FAIL] ${name}`);
                testResults.failed++;
            }
        } catch (error) {
            console.error(`[ERROR] ${name}: ${error.message}`);
            testResults.failed++;
        }
    }
    
    /**
     * Tests core game mechanics
     */
    function testCoreMechanics() {
        console.log('\n=== Testing Core Mechanics ===');
        
        // Test game initialization
        runTest('Game Initialization', TEST_CATEGORIES.CORE, function() {
            return GameEngine && GameData && GameConfig;
        });
        
        // Test digging mechanic
        runTest('Digging Mechanic', TEST_CATEGORIES.CORE, function() {
            const initialDepth = GameData.getDepth();
            const result = GameEngine.dig();
            const newDepth = GameData.getDepth();
            
            return result.success && newDepth > initialDepth;
        });
        
        // Test click cooldown
        runTest('Click Cooldown', TEST_CATEGORIES.CORE, function() {
            // First dig should succeed
            const result1 = GameEngine.dig();
            
            // Immediate second dig should fail due to cooldown
            const result2 = GameEngine.dig();
            
            return result1.success && !result2.success;
        });
        
        // Test game loop
        runTest('Game Loop', TEST_CATEGORIES.CORE, function() {
            const initialTime = GameData.getStat('playTime');
            
            // Wait for a tick
            return new Promise(resolve => {
                setTimeout(() => {
                    const newTime = GameData.getStat('playTime');
                    resolve(newTime > initialTime);
                }, GameConfig.BASE_PARAMS.tickInterval * 2);
            });
        });
    }
    
    /**
     * Tests resource management
     */
    function testResourceManagement() {
        console.log('\n=== Testing Resource Management ===');
        
        // Test adding resources
        runTest('Add Resources', TEST_CATEGORIES.RESOURCES, function() {
            const initialDirt = GameData.getResource('dirt');
            GameData.addResource('dirt', 10);
            const newDirt = GameData.getResource('dirt');
            
            return newDirt === initialDirt + 10;
        });
        
        // Test subtracting resources
        runTest('Subtract Resources', TEST_CATEGORIES.RESOURCES, function() {
            const initialStone = GameData.getResource('stone');
            GameData.addResource('stone', 20);
            GameData.subtractResource('stone', 10);
            const newStone = GameData.getResource('stone');
            
            return newStone === initialStone + 10;
        });
        
        // Test resource multipliers
        runTest('Resource Multipliers', TEST_CATEGORIES.RESOURCES, function() {
            const initialMultiplier = GameData.getResourceMultiplier('dirt');
            GameData.setResourceMultiplier('dirt', initialMultiplier * 2);
            const newMultiplier = GameData.getResourceMultiplier('dirt');
            
            // Reset multiplier after test
            GameData.setResourceMultiplier('dirt', initialMultiplier);
            
            return newMultiplier === initialMultiplier * 2;
        });
        
        // Test temporary multipliers
        runTest('Temporary Multipliers', TEST_CATEGORIES.RESOURCES, function() {
            const initialMultiplier = GameData.getResourceMultiplier('gems');
            GameData.addTemporaryMultiplier('gems', 2, 1); // 1 second duration
            const newMultiplier = GameData.getResourceMultiplier('gems');
            
            return newMultiplier > initialMultiplier;
        });
    }
    
    /**
     * Tests upgrade system
     */
    function testUpgradeSystem() {
        console.log('\n=== Testing Upgrade System ===');
        
        // Test upgrade purchase
        runTest('Purchase Upgrade', TEST_CATEGORIES.UPGRADES, function() {
            // Ensure we have enough resources
            GameData.addResource('dirt', 1000);
            GameData.addResource('stone', 1000);
            GameData.addResource('gems', 100);
            
            // Get first available upgrade
            const upgrades = GameData.getUpgrades();
            if (upgrades.length === 0) return 'skip';
            
            const upgradeId = upgrades[0].id;
            const initialLevel = GameData.getUpgradeLevel(upgradeId);
            const result = GameEngine.purchaseUpgrade(upgradeId);
            const newLevel = GameData.getUpgradeLevel(upgradeId);
            
            return result.success && newLevel === initialLevel + 1;
        });
        
        // Test upgrade effects
        runTest('Upgrade Effects', TEST_CATEGORIES.UPGRADES, function() {
            // Find an upgrade that affects click power
            const upgrades = GameData.getUpgrades();
            const clickUpgrade = upgrades.find(u => 
                u.effect && u.effect.clickPower && u.level < u.maxLevel
            );
            
            if (!clickUpgrade) return 'skip';
            
            // Ensure we have enough resources
            GameData.addResource('dirt', 10000);
            GameData.addResource('stone', 10000);
            GameData.addResource('gems', 1000);
            
            const initialClickPower = GameData.getClickPowerMultiplier();
            GameEngine.purchaseUpgrade(clickUpgrade.id);
            const newClickPower = GameData.getClickPowerMultiplier();
            
            return newClickPower > initialClickPower;
        });
        
        // Test upgrade visibility based on depth
        runTest('Upgrade Visibility', TEST_CATEGORIES.UPGRADES, function() {
            const initialDepth = GameData.getDepth();
            const initialUpgrades = GameData.getUpgrades().filter(u => u.visible);
            
            // Set depth to a high value temporarily
            GameData.setDepth(200);
            const newUpgrades = GameData.getUpgrades().filter(u => u.visible);
            
            // Reset depth
            GameData.setDepth(initialDepth);
            
            return newUpgrades.length >= initialUpgrades.length;
        });
    }
    
    /**
     * Tests game progression
     */
    function testGameProgression() {
        console.log('\n=== Testing Game Progression ===');
        
        // Test depth increase
        runTest('Depth Increase', TEST_CATEGORIES.PROGRESSION, function() {
            const initialDepth = GameData.getDepth();
            GameData.increaseDepth(1);
            const newDepth = GameData.getDepth();
            
            return newDepth === initialDepth + 1;
        });
        
        // Test layer changes
        runTest('Layer Changes', TEST_CATEGORIES.PROGRESSION, function() {
            // Find two adjacent layers
            const layers = Object.values(GameConfig.LAYERS);
            if (layers.length < 2) return 'skip';
            
            const layer1 = layers[0];
            const layer2 = layers[1];
            
            // Set depth to first layer
            const initialDepth = (layer1.depthStart + layer1.depthEnd) / 2;
            GameData.setDepth(initialDepth);
            const initialLayer = GameData.getCurrentLayer();
            
            // Set depth to second layer
            const newDepth = (layer2.depthStart + layer2.depthEnd) / 2;
            GameData.setDepth(newDepth);
            const newLayer = GameData.getCurrentLayer();
            
            return initialLayer.name !== newLayer.name;
        });
        
        // Test auto-digging
        runTest('Auto-Digging', TEST_CATEGORIES.PROGRESSION, function() {
            const initialAutoDigRate = GameData.getAutoDigRate();
            GameData.setAutoDigRate(1);
            const newAutoDigRate = GameData.getAutoDigRate();
            
            // Reset auto-dig rate
            GameData.setAutoDigRate(initialAutoDigRate);
            
            return newAutoDigRate > initialAutoDigRate;
        });
    }
    
    /**
     * Tests hazard system
     */
    function testHazardSystem() {
        console.log('\n=== Testing Hazard System ===');
        
        // Test hazard triggering
        runTest('Hazard Triggering', TEST_CATEGORIES.HAZARDS, function() {
            const hazards = GameConfig.HAZARDS;
            const hazardIds = Object.keys(hazards);
            if (hazardIds.length === 0) return 'skip';
            
            const initialActiveHazards = GameData.getActiveHazards().length;
            GameEngine.triggerHazard(hazardIds[0]);
            const newActiveHazards = GameData.getActiveHazards().length;
            
            // Clean up - remove the hazard
            GameData.removeActiveHazard(hazardIds[0]);
            
            return newActiveHazards > initialActiveHazards;
        });
        
        // Test hazard prevention
        runTest('Hazard Prevention', TEST_CATEGORIES.HAZARDS, function() {
            const hazards = GameConfig.HAZARDS;
            const hazardIds = Object.keys(hazards);
            if (hazardIds.length === 0) return 'skip';
            
            // Trigger a hazard
            GameEngine.triggerHazard(hazardIds[0]);
            
            // Ensure we have enough resources to prevent it
            GameData.addResource('dirt', 10000);
            GameData.addResource('stone', 10000);
            GameData.addResource('gems', 1000);
            
            // Prevent the hazard
            const result = GameEngine.preventHazard(hazardIds[0]);
            const activeHazards = GameData.getActiveHazards();
            const hazardStillActive = activeHazards.some(h => h.type === hazardIds[0]);
            
            return result.success && !hazardStillActive;
        });
    }
    
    /**
     * Tests achievement system
     */
    function testAchievementSystem() {
        console.log('\n=== Testing Achievement System ===');
        
        // Test achievement unlocking
        runTest('Achievement Unlocking', TEST_CATEGORIES.ACHIEVEMENTS, function() {
            const achievements = GameConfig.ACHIEVEMENTS;
            const achievementIds = Object.keys(achievements);
            if (achievementIds.length === 0) return 'skip';
            
            const testAchievementId = achievementIds[0];
            const initiallyUnlocked = GameData.isAchievementUnlocked(testAchievementId);
            
            if (initiallyUnlocked) {
                // Find an achievement that's not unlocked
                const unlockedAchievement = achievementIds.find(id => !GameData.isAchievementUnlocked(id));
                if (!unlockedAchievement) return true; // All achievements already unlocked
                
                GameData.unlockAchievement(unlockedAchievement);
                return GameData.isAchievementUnlocked(unlockedAchievement);
            } else {
                GameData.unlockAchievement(testAchievementId);
                return GameData.isAchievementUnlocked(testAchievementId);
            }
        });
        
        // Test achievement criteria
        runTest('Achievement Criteria', TEST_CATEGORIES.ACHIEVEMENTS, function() {
            // Find an achievement with depth criteria
            const depthAchievement = Object.entries(GameConfig.ACHIEVEMENTS).find(([id, achievement]) => 
                achievement.criteria && achievement.criteria.depth && !GameData.isAchievementUnlocked(id)
            );
            
            if (!depthAchievement) return 'skip';
            
            const [achievementId, achievement] = depthAchievement;
            const requiredDepth = achievement.criteria.depth;
            
            // Save current depth
            const initialDepth = GameData.getDepth();
            
            // Set depth to meet criteria
            GameData.setDepth(requiredDepth + 1);
            
            // Check if achievement unlocked
            const unlocked = GameData.isAchievementUnlocked(achievementId);
            
            // Reset depth
            GameData.setDepth(initialDepth);
            
            return unlocked;
        });
    }
    
    /**
     * Tests content system
     */
    function testContentSystem() {
        console.log('\n=== Testing Content System ===');
        
        // Test flavor text
        runTest('Flavor Text', TEST_CATEGORIES.CONTENT, function() {
            const resourceFlavorText = GameContent.getResourceFlavorText('dirt');
            const hazardFlavorText = GameContent.getHazardFlavorText('caveIn');
            
            return resourceFlavorText && hazardFlavorText;
        });
        
        // Test special discoveries
        runTest('Special Discoveries', TEST_CATEGORIES.CONTENT, function() {
            const discoveries = GameContent.SPECIAL_DISCOVERIES;
            if (!discoveries || discoveries.length === 0) return 'skip';
            
            // Check if discoveries are defined correctly
            return discoveries.every(d => d.id && d.name && d.description && d.depth);
        });
    }
    
    /**
     * Tests save system
     */
    function testSaveSystem() {
        console.log('\n=== Testing Save System ===');
        
        // Test manual save
        runTest('Manual Save', TEST_CATEGORIES.SAVE, function() {
            // Make a change to the game state
            const initialDirt = GameData.getResource('dirt');
            GameData.addResource('dirt', 123);
            
            // Save the game
            const saveResult = SaveSystem.saveGame();
            
            // Reset the game state
            GameData.subtractResource('dirt', 123);
            
            return saveResult;
        });
        
        // Test manual load
        runTest('Manual Load', TEST_CATEGORIES.SAVE, function() {
            // Load the game
            const loadResult = SaveSystem.loadGame();
            
            // Check if the change was loaded
            const currentDirt = GameData.getResource('dirt');
            
            return loadResult && currentDirt >= 123;
        });
        
        // Test save data integrity
        runTest('Save Data Integrity', TEST_CATEGORIES.SAVE, function() {
            // Set specific values
            const testDepth = 42.5;
            const testDirt = 777;
            const testAchievementId = Object.keys(GameConfig.ACHIEVEMENTS)[0];
            
            GameData.setDepth(testDepth);
            GameData.addResource('dirt', testDirt - GameData.getResource('dirt'));
            GameData.unlockAchievement(testAchievementId);
            
            // Save the game
            SaveSystem.saveGame();
            
            // Change values
            GameData.setDepth(0);
            GameData.addResource('dirt', -testDirt);
            
            // Load the game
            SaveSystem.loadGame();
            
            // Check if values were restored
            const loadedDepth = GameData.getDepth();
            const loadedDirt = GameData.getResource('dirt');
            const loadedAchievement = GameData.isAchievementUnlocked(testAchievementId);
            
            return loadedDepth === testDepth && 
                   loadedDirt === testDirt && 
                   loadedAchievement === true;
        });
        
        // Test export/import functionality
        runTest('Export/Import', TEST_CATEGORIES.SAVE, function() {
            // This test can't be fully automated as it requires file download/upload
            // Instead, we'll check if the export function exists
            return typeof SaveSystem.exportSave === 'function';
        });
    }
    
    /**
     * Tests performance
     */
    function testPerformance() {
        console.log('\n=== Testing Performance ===');
        
        // Test rendering performance
        runTest('Rendering Performance', TEST_CATEGORIES.PERFORMANCE, function() {
            // Measure time to update UI
            const startTime = performance.now();
            
            updateResourceDisplay(GameData.getResources());
            updateDepthDisplay(GameData.getDepth());
            updateUpgradesDisplay(GameData.getUpgrades(), GameData.getResources());
            updateStatsDisplay(GameData.getStats());
            updateAchievementsDisplay();
            
            const endTime = performance.now();
            const renderTime = endTime - startTime;
            
            console.log(`Render time: ${renderTime.toFixed(2)}ms`);
            
            // Rendering should be under 100ms for good performance
            return renderTime < 100;
        });
        
        // Test game loop performance
        runTest('Game Loop Performance', TEST_CATEGORIES.PERFORMANCE, function() {
            // Simulate multiple ticks
            const tickCount = 10;
            const startTime = performance.now();
            
            for (let i = 0; i < tickCount; i++) {
                // Simulate a tick
                const deltaTime = GameConfig.BASE_PARAMS.tickInterval / 1000;
                GameData.updatePlayTime(deltaTime);
            }
            
            const endTime = performance.now();
            const avgTickTime = (endTime - startTime) / tickCount;
            
            console.log(`Average tick time: ${avgTickTime.toFixed(2)}ms`);
            
            // Each tick should be under 16ms (60fps)
            return avgTickTime < 16;
        });
        
        // Test save/load performance
        runTest('Save/Load Performance', TEST_CATEGORIES.PERFORMANCE, function() {
            // Measure save time
            const saveStartTime = performance.now();
            SaveSystem.saveGame();
            const saveEndTime = performance.now();
            const saveTime = saveEndTime - saveStartTime;
            
            // Measure load time
            const loadStartTime = performance.now();
            SaveSystem.loadGame();
            const loadEndTime = performance.now();
            const loadTime = loadEndTime - loadStartTime;
            
            console.log(`Save time: ${saveTime.toFixed(2)}ms, Load time: ${loadTime.toFixed(2)}ms`);
            
            // Save and load should each be under 50ms
            return saveTime < 50 && loadTime < 50;
        });
    }
    
    // Public API
    return {
        runAllTests,
        testResults
    };
})();

// Run tests when this script is executed
console.log('To run all tests, call GameTester.runAllTests()');