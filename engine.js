/**
 * Engine.js - Core game mechanics and logic
 * Handles resource generation, upgrades, hazards, and game progression
 */

// const GameEngine = (function() {
//     // Private variables
//     let gameInitialized = false;
//     let gameLoopInterval = null;
//     let lastTickTime = 0;
//     let clickCooldown = false;
    
//     /**
//      * Initializes the game engine
//      */
//     function init() {
//         if (gameInitialized) return;
        
//         // Initialize game data
//         GameData.init();
        
//         // Set up initial UI state
//         updateResourceDisplay();
//         updateDepthDisplay();
//         updateUpgradesDisplay();
//         updateStatsDisplay();
        
//         gameInitialized = true;
//         lastTickTime = Date.now();
        
//         console.log('Game engine initialized');
//     }
    
//     /**
//      * Starts the game loop
//      */
//     function startGameLoop() {
//         if (gameLoopInterval) return;
        
//         gameLoopInterval = setInterval(tick, GameConfig.tickInterval);
//         console.log('Game loop started');
//     }
    
//     /**
//      * Stops the game loop
//      */
//     function stopGameLoop() {
//         if (!gameLoopInterval) return;
        
//         clearInterval(gameLoopInterval);
//         gameLoopInterval = null;
//         console.log('Game loop stopped');
//     }
    
//     /**
//      * Main game tick function, called on each interval
//      */
//     function tick() {
//         const now = Date.now();
//         const deltaTime = (now - lastTickTime) / 1000; // Convert to seconds
//         lastTickTime = now;
        
//         // Update play time
//         GameData.updatePlayTime(deltaTime);
        
//         // Process auto-digging
//         processAutoDigging(deltaTime);
        
//         // Process hazards
//         processHazards(deltaTime);
        
//         // Update stats
//         updateStatsDisplay();
        
//         // Save game periodically
//         if (GameData.shouldSave()) {
//             saveGame();
//         }
//     }
    
//     /**
//      * Processes auto-digging mechanics
//      * @param {number} deltaTime - Time since last tick in seconds
//      */
//     function processAutoDigging(deltaTime) {
//         const autoDigRate = GameData.getAutoDigRate();
        
//         if (autoDigRate > 0) {
//             // Calculate digs this tick
//             const digsThistick = autoDigRate * deltaTime;
            
//             // Fractional digs accumulate until they reach 1
//             GameData.addAccumulatedDigs(digsThistick);
            
//             // Process whole number of digs
//             const wholeDigs = Math.floor(GameData.getAccumulatedDigs());
//             if (wholeDigs >= 1) {
//                 for (let i = 0; i < wholeDigs; i++) {
//                     performDig(true);
//                 }
//                 GameData.subtractAccumulatedDigs(wholeDigs);
//             }
//         }
//     }
    
//     /**
//      * Processes hazard mechanics
//      * @param {number} deltaTime - Time since last tick in seconds
//      */
//     function processHazards(deltaTime) {
//         const activeHazards = GameData.getActiveHazards();
        
//         // Process existing hazards
//         for (const hazard of activeHazards) {
//             // Update warning time
//             if (hazard.state === 'warning') {
//                 hazard.timeRemaining -= deltaTime;
                
//                 // Activate hazard if warning time is up
//                 if (hazard.timeRemaining <= 0) {
//                     activateHazard(hazard);
//                 }
//             } else if (hazard.state === 'active') {
//                 hazard.timeRemaining -= deltaTime;
                
//                 // Resolve hazard if active time is up
//                 if (hazard.timeRemaining <= 0) {
//                     resolveHazard(hazard);
//                 }
//             }
//         }
        
//         // Check for new hazards
//         const currentDepth = GameData.getDepth();
//         const hazardChance = GameConfig.hazardChancePerTick * deltaTime;
        
//         if (currentDepth >= GameConfig.hazardMinDepth && Math.random() < hazardChance) {
//             // Determine which hazard to trigger based on depth
//             const possibleHazards = GameConfig.hazards.filter(h => 
//                 currentDepth >= h.minDepth && 
//                 !activeHazards.some(ah => ah.type === h.type)
//             );
            
//             if (possibleHazards.length > 0) {
//                 const randomIndex = Math.floor(Math.random() * possibleHazards.length);
//                 const hazardConfig = possibleHazards[randomIndex];
                
//                 triggerHazard(hazardConfig.type);
//             }
//         }
//     }
    
//     /**
//      * Performs a digging action
//      * @param {boolean} isAuto - Whether this is an auto-dig
//      * @returns {Object} - Result of the dig action
//      */
//     function performDig(isAuto = false) {
//         // Get current depth and layer
//         const currentDepth = GameData.getDepth();
//         const currentLayer = GameData.getCurrentLayer();
        
//         // Calculate resources gained
//         const resourcesGained = calculateResourceGain(currentLayer);
        
//         // Add resources
//         GameData.addResources(resourcesGained);
        
//         // Increment depth
//         const depthIncrement = GameData.getDepthIncrement();
//         const newDepth = currentDepth + depthIncrement;
//         GameData.setDepth(newDepth);
        
//         // Check for layer change
//         const newLayer = GameData.getCurrentLayer();
//         if (newLayer !== currentLayer) {
//             // Dispatch layer changed event
//             const event = new CustomEvent('layerChanged', {
//                 detail: { layer: newLayer }
//             });
//             document.dispatchEvent(event);
//         }
        
//         // Update stats
//         if (!isAuto) {
//             GameData.incrementClicks();
//         }
        
//         // Check achievements
//         checkAchievements();
        
//         // Return dig results
//         return {
//             success: true,
//             resources: resourcesGained,
//             depth: newDepth,
//             layer: newLayer
//         };
//     }
    
//     /**
//      * Performs a manual dig action (with cooldown)
//      * @returns {Object} - Result of the dig action
//      */
//     function dig() {
//         // Check if on cooldown
//         if (clickCooldown) {
//             return { success: false, error: 'On cooldown' };
//         }
        
//         // Set cooldown
//         clickCooldown = true;
//         setTimeout(() => {
//             clickCooldown = false;
//         }, GameConfig.clickCooldown);
        
//         // Perform the dig
//         return performDig();
//     }
    
//     /**
//      * Calculates resources gained from a dig
//      * @param {Object} layer - Current layer data
//      * @returns {Object} - Resources gained
//      */
//     function calculateResourceGain(layer) {
//         const resources = {
//             dirt: 0,
//             stone: 0,
//             gems: 0
//         };
    
//         // Calculate dirt chance
//         const dirtChance = GameConfig.BASE_PARAMS.baseDirtChance * layer.dirtMultiplier;
//         if (Math.random() < dirtChance) {
//             resources.dirt += 1 * GameData.getResourceMultiplier('dirt');
//         }
    
//         // Calculate stone chance
//         const stoneChance = GameConfig.BASE_PARAMS.baseStoneChance * layer.stoneMultiplier;
//         if (Math.random() < stoneChance) {
//             resources.stone += 1 * GameData.getResourceMultiplier('stone');
//         }
    
//         // Calculate gem chance
//         const gemChance = GameConfig.BASE_PARAMS.baseGemChance * layer.gemMultiplier;
//         if (Math.random() < gemChance) {
//             resources.gems += 1 * GameData.getResourceMultiplier('gems');
//         }
    
//         return resources;
//     }
    
//     /**
//      * Purchases an upgrade
//      * @param {string} upgradeId - ID of the upgrade to purchase
//      * @returns {Object} - Result of the purchase
//      */
//     function purchaseUpgrade(upgradeId) {
//         // Get upgrade data
//         const upgrade = GameData.getUpgradeById(upgradeId);
//         if (!upgrade) {
//             return { success: false, error: 'Upgrade not found' };
//         }
        
//         // Check if already at max level
//         if (upgrade.level >= upgrade.maxLevel) {
//             return { success: false, error: 'Already at max level' };
//         }
        
//         // Check depth requirement
//         const currentDepth = GameData.getDepth();
//         if (upgrade.depthRequired > currentDepth) {
//             return { success: false, error: 'Depth requirement not met' };
//         }
        
//         // Check prerequisites
//         if (upgrade.prerequisites) {
//             for (const prereq of upgrade.prerequisites) {
//                 const prereqUpgrade = GameData.getUpgradeById(prereq.id);
//                 if (!prereqUpgrade || prereqUpgrade.level < prereq.level) {
//                     return { success: false, error: 'Prerequisites not met' };
//                 }
//             }
//         }
        
//         // Check if can afford
//         if (!canAffordUpgrade(upgradeId)) {
//             return { success: false, error: 'Cannot afford upgrade' };
//         }
        
//         // Deduct resources
//         const cost = calculateUpgradeCost(upgrade);
//         for (const [resource, amount] of Object.entries(cost)) {
//             GameData.subtractResource(resource, amount);
//         }
        
//         // Increment upgrade level
//         GameData.incrementUpgradeLevel(upgradeId);
        
//         // Apply upgrade effects
//         applyUpgradeEffects(upgrade);
        
//         // Update UI
//         updateResourceDisplay();
//         updateUpgradesDisplay();
        
//         // Check achievements
//         checkAchievements();
        
//         return { success: true, upgrade: upgrade };
//     }
    
//     /**
//      * Checks if player can afford an upgrade
//      * @param {string} upgradeId - ID of the upgrade
//      * @returns {boolean} - Whether the upgrade can be afforded
//      */
//     function canAffordUpgrade(upgradeId) {
//         const upgrade = GameData.getUpgradeById(upgradeId);
//         if (!upgrade) return false;
        
//         const cost = calculateUpgradeCost(upgrade);
//         const resources = GameData.getResources();
        
//         for (const [resource, amount] of Object.entries(cost)) {
//             if (!resources[resource] || resources[resource] < amount) {
//                 return false;
//             }
//         }
        
//         return true;
//     }
    
//     /**
//      * Calculates the cost of an upgrade
//      * @param {Object} upgrade - Upgrade data
//      * @returns {Object} - Cost of the upgrade
//      */
//     function calculateUpgradeCost(upgrade) {
//         const cost = {};
        
//         for (const [resource, baseAmount] of Object.entries(upgrade.baseCost)) {
//             cost[resource] = Math.floor(baseAmount * Math.pow(upgrade.costMultiplier, upgrade.level));
//         }
        
//         return cost;
//     }
    
//     /**
//      * Applies the effects of an upgrade
//      * @param {Object} upgrade - Upgrade data
//      */
//     function applyUpgradeEffects(upgrade) {
//         if (upgrade.effects) {
//             for (const effect of upgrade.effects) {
//                 switch (effect.type) {
//                     case 'resourceMultiplier':
//                         GameData.setResourceMultiplier(
//                             effect.resource,
//                             GameData.getResourceMultiplier(effect.resource) * effect.value
//                         );
//                         break;
//                     case 'depthMultiplier':
//                         GameData.setDepthMultiplier(
//                             GameData.getDepthMultiplier() * effect.value
//                         );
//                         break;
//                     case 'autoDigRate':
//                         GameData.setAutoDigRate(
//                             GameData.getAutoDigRate() + effect.value
//                         );
//                         break;
//                 }
//             }
//         }
//     }
    
//     /**
//      * Triggers a hazard
//      * @param {string} hazardType - Type of hazard to trigger
//      * @returns {Object} - Result of the hazard trigger
//      */
//     function triggerHazard(hazardType) {
//         // Get hazard config
//         const hazardConfig = GameConfig.hazards.find(h => h.type === hazardType);
//         if (!hazardConfig) {
//             return { success: false, error: 'Hazard type not found' };
//         }
        
//         // Check if hazard is already active
//         const activeHazards = GameData.getActiveHazards();
//         if (activeHazards.some(h => h.type === hazardType)) {
//             return { success: false, error: 'Hazard already active' };
//         }
        
//         // Create hazard instance
//         const hazard = {
//             type: hazardConfig.type,
//             name: hazardConfig.name,
//             state: 'warning',
//             timeRemaining: hazardConfig.warningTime,
//             warningMessage: hazardConfig.warningMessage,
//             activeMessage: hazardConfig.activeMessage,
//             effects: hazardConfig.effects,
//             preventionCost: hazardConfig.preventionCost
//         };
        
//         // Add to active hazards
//         GameData.addActiveHazard(hazard);
        
//         // Dispatch hazard warning event
//         const event = new CustomEvent('hazardWarning', {
//             detail: { hazard: hazard }
//         });
//         document.dispatchEvent(event);
        
//         return { success: true, hazard: hazard };
//     }
    
//     /**
//      * Activates a hazard
//      * @param {Object} hazard - Hazard to activate
//      */
//     function activateHazard(hazard) {
//         // Update hazard state
//         hazard.state = 'active';
//         hazard.timeRemaining = GameConfig.hazards.find(h => h.type === hazard.type).activeTime;
        
//         // Apply hazard effects
//         if (hazard.effects) {
//             for (const effect of hazard.effects) {
//                 switch (effect.type) {
//                     case 'resourcePenalty':
//                         GameData.setResourceMultiplier(
//                             effect.resource,
//                             GameData.getResourceMultiplier(effect.resource) * effect.value
//                         );
//                         break;
//                     case 'depthPenalty':
//                         GameData.setDepthMultiplier(
//                             GameData.getDepthMultiplier() * effect.value
//                         );
//                         break;
//                     case 'damageResources':
//                         for (const [resource, percentage] of Object.entries(effect.resources)) {
//                             const amount = Math.floor(GameData.getResource(resource) * percentage);
//                             if (amount > 0) {
//                                 GameData.subtractResource(resource, amount);
//                             }
//                         }
//                         break;
//                 }
//             }
//         }
        
//         // Update UI
//         updateResourceDisplay();
        
//         // Dispatch hazard activated event
//         const event = new CustomEvent('hazardActivated', {
//             detail: { hazard: hazard }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Resolves a hazard
//      * @param {Object} hazard - Hazard to resolve
//      */
//     function resolveHazard(hazard) {
//         // Remove hazard effects
//         if (hazard.effects) {
//             for (const effect of hazard.effects) {
//                 switch (effect.type) {
//                     case 'resourcePenalty':
//                         GameData.setResourceMultiplier(
//                             effect.resource,
//                             GameData.getResourceMultiplier(effect.resource) / effect.value
//                         );
//                         break;
//                     case 'depthPenalty':
//                         GameData.setDepthMultiplier(
//                             GameData.getDepthMultiplier() / effect.value
//                         );
//                         break;
//                 }
//             }
//         }
        
//         // Remove from active hazards
//         GameData.removeActiveHazard(hazard.type);
        
//         // Dispatch hazard resolved event
//         const event = new CustomEvent('hazardResolved', {
//             detail: { hazard: hazard }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Attempts to prevent a hazard
//      * @param {string} hazardType - Type of hazard to prevent
//      * @returns {Object} - Result of the prevention attempt
//      */
//     function preventHazard(hazardType) {
//         // Get hazard
//         const hazard = GameData.getActiveHazards().find(h => h.type === hazardType);
//         if (!hazard) {
//             return { success: false, error: 'Hazard not found' };
//         }
        
//         // Check if hazard is in warning state
//         if (hazard.state !== 'warning') {
//             return { success: false, error: 'Hazard cannot be prevented' };
//         }
        
//         // Check if can afford prevention
//         const resources = GameData.getResources();
//         for (const [resource, amount] of Object.entries(hazard.preventionCost)) {
//             if (!resources[resource] || resources[resource] < amount) {
//                 return { success: false, error: `Not enough ${resource}` };
//             }
//         }
        
//         // Deduct resources
//         for (const [resource, amount] of Object.entries(hazard.preventionCost)) {
//             GameData.subtractResource(resource, amount);
//         }
        
//         // Remove hazard
//         GameData.removeActiveHazard(hazardType);
        
//         // Update UI
//         updateResourceDisplay();
        
//         // Dispatch hazard resolved event
//         const event = new CustomEvent('hazardResolved', {
//             detail: { hazard: hazard, prevented: true }
//         });
//         document.dispatchEvent(event);
        
//         return { success: true, hazard: hazard };
//     }
    
//     /**
//      * Checks for achievements
//      */
//     function checkAchievements() {
//         const achievements = GameConfig.achievements;
//         const stats = GameData.getStats();
//         const resources = GameData.getResources();
//         const depth = GameData.getDepth();
//         const upgrades = GameData.getUpgrades();
        
//         for (const achievement of achievements) {
//             // Skip already unlocked achievements
//             if (GameData.isAchievementUnlocked(achievement.id)) continue;
            
//             let unlocked = false;
            
//             // Check achievement criteria
//             switch (achievement.type) {
//                 case 'depth':
//                     unlocked = depth >= achievement.requirement;
//                     break;
//                 case 'resources':
//                     unlocked = resources[achievement.resource] >= achievement.amount;
//                     break;
//                 case 'clicks':
//                     unlocked = stats.clicks >= achievement.amount;
//                     break;
//                 case 'upgrades':
//                     const upgradeCount = upgrades.filter(u => u.level > 0).length;
//                     unlocked = upgradeCount >= achievement.amount;
//                     break;
//                 case 'hazards':
//                     unlocked = stats.hazardsPrevented >= achievement.amount;
//                     break;
//             }
            
//             // Unlock achievement if criteria met
//             if (unlocked) {
//                 GameData.unlockAchievement(achievement.id);
                
//                 // Dispatch achievement unlocked event
//                 const event = new CustomEvent('achievementUnlocked', {
//                     detail: { achievement: achievement }
//                 });
//                 document.dispatchEvent(event);
//             }
//         }
//     }
    
//     /**
//      * Updates the resource display
//      */
//     function updateResourceDisplay() {
//         const resources = GameData.getResources();
        
//         // Dispatch resource updated event
//         const event = new CustomEvent('resourceUpdated', {
//             detail: { resources: resources }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Updates the depth display
//      */
//     function updateDepthDisplay() {
//         const depth = GameData.getDepth();
        
//         // Dispatch depth updated event
//         const event = new CustomEvent('depthUpdated', {
//             detail: { depth: depth }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Updates the upgrades display
//      */
//     function updateUpgradesDisplay() {
//         const upgrades = GameData.getUpgrades();
//         const resources = GameData.getResources();
        
//         // Dispatch upgrades updated event
//         const event = new CustomEvent('upgradesUpdated', {
//             detail: { upgrades: upgrades, resources: resources }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Updates the stats display
//      */
//     function updateStatsDisplay() {
//         const stats = GameData.getStats();
        
//         // Dispatch stats updated event
//         const event = new CustomEvent('statsUpdated', {
//             detail: { stats: stats }
//         });
//         document.dispatchEvent(event);
//     }
    
//     /**
//      * Saves the game
//      */
//     function saveGame() {
//         GameData.saveGame();
//     }
    
//     /**
//      * Loads the game
//      */
//     function loadGame() {
//         GameData.loadGame();
        
//         // Update UI
//         updateResourceDisplay();
//         updateDepthDisplay();
//         updateUpgradesDisplay();
//         updateStatsDisplay();
//     }
    
//     /**
//      * Development function to unlock all upgrades
//      */
//     function unlockAllUpgrades() {
//         if (!GameConfig.devMode) return;
        
//         const upgrades = GameData.getUpgrades();
//         for (const upgrade of upgrades) {
//             upgrade.visible = true;
//             upgrade.level = 1;
//         }
        
//         updateUpgradesDisplay();
//     }
    
//     // Public API
//     return {
//         init,
//         startGameLoop,
//         stopGameLoop,
//         dig,
//         purchaseUpgrade,
//         canAffordUpgrade,
//         triggerHazard,
//         preventHazard,
//         saveGame,
//         loadGame,
//         unlockAllUpgrades
//     };
// })();