/**
 * Game Data
 * Manages game state, resources, upgrades, and persistence
 */
const GameData = (function() {
    'use strict';

    // Private game state
    let gameState = {
        // Resources
        resources: {
            dirt: 0,
            stone: 0,
            gems: 0
        },
        
        // Resource multipliers
        multipliers: {
            dirt: 1,
            stone: 1,
            gems: 1,
            depth: 1,
            clickPower: 1,
            autoDigSpeed: 1,
            gemChance: 1,
            hazardChance: 1,
            hazardDuration: 1
        },
        
        // Temporary multipliers with duration
        temporaryMultipliers: [],
        
        // Game statistics
        stats: {
            clicks: 0,
            totalDirt: 0,
            totalStone: 0,
            totalGems: 0,
            playTime: 0, // in seconds
            hazardsPrevented: 0,
            hazardDigs: 0
        },
        
        // Upgrades (id -> level mapping)
        upgrades: {},
        
        // Game progression
        depth: 0,
        layer: 'surface',
        
        // Auto-digging
        autoDigRate: 0,
        accumulatedDigs: 0,
        
        // Hazards
        activeHazards: [],
        
        // Achievements (id -> unlocked status)
        achievements: {},
        
        // Special discoveries
        discoveries: {},
        
        // Unlocked features
        unlockedFeatures: {},
        
        // Special stats for achievements and content
        specialStats: {},
        
        // Game version for save compatibility
        version: '1.0.0',
        
        // Last save timestamp
        lastSave: 0
    };
    
    // Time of last auto-save check
    let lastAutoSaveCheck = 0;
    
    // Private methods
    function checkAchievements() {
        const achievements = GameConfig.ACHIEVEMENTS;
        let newUnlocks = false;
        
        for (const [id, achievement] of Object.entries(achievements)) {
            // Skip if already unlocked
            if (gameState.achievements[id]) continue;
            
            // Check criteria
            let allCriteriaMet = true;
            for (const [criterion, requiredValue] of Object.entries(achievement.criteria)) {
                let actualValue;
                
                // Check different types of criteria
                if (criterion === 'depth') {
                    actualValue = gameState.depth;
                } else if (['dirt', 'stone', 'gems'].includes(criterion)) {
                    actualValue = gameState.resources[criterion];
                } else if (criterion === 'clicks') {
                    actualValue = gameState.stats.clicks;
                } else if (criterion === 'playTime') {
                    actualValue = gameState.stats.playTime;
                } else if (criterion.startsWith('total')) {
                    const resource = criterion.substring(5).toLowerCase();
                    actualValue = gameState.stats[criterion];
                } else if (criterion.startsWith('upgrade_')) {
                    const upgradeId = criterion.substring(8);
                    actualValue = gameState.upgrades[upgradeId] || 0;
                } else {
                    // Special stats
                    actualValue = gameState.specialStats[criterion] || 0;
                }
                
                // Check if criterion is met
                if (actualValue < requiredValue) {
                    allCriteriaMet = false;
                    break;
                }
            }
            
            // Unlock achievement if all criteria met
            if (allCriteriaMet) {
                gameState.achievements[id] = true;
                newUnlocks = true;
                
                // Dispatch event
                const event = new CustomEvent('achievementUnlocked', {
                    detail: { id: id, achievement: achievement }
                });
                document.dispatchEvent(event);
            }
        }
        
        return newUnlocks;
    }
    
    /**
     * Processes temporary multipliers
     * @param {number} deltaTime - Time since last update in seconds
     */
    function processTemporaryMultipliers(deltaTime) {
        if (gameState.temporaryMultipliers.length === 0) return;
        
        let changed = false;
        
        // Update remaining time and remove expired multipliers
        gameState.temporaryMultipliers = gameState.temporaryMultipliers.filter(multiplier => {
            if (multiplier.permanent) return true;
            
            multiplier.remainingTime -= deltaTime;
            
            if (multiplier.remainingTime <= 0) {
                // Remove effect
                if (multiplier.type === 'all') {
                    gameState.multipliers.dirt /= multiplier.value;
                    gameState.multipliers.stone /= multiplier.value;
                    gameState.multipliers.gems /= multiplier.value;
                } else {
                    gameState.multipliers[multiplier.type] /= multiplier.value;
                }
                
                changed = true;
                return false;
            }
            
            return true;
        });
        
        // Dispatch event if multipliers changed
        if (changed) {
            const event = new CustomEvent('multipliersUpdated', {
                detail: { multipliers: { ...gameState.multipliers } }
            });
            document.dispatchEvent(event);
        }
    }
    
    /**
     * Checks if it's time to auto-save
     * @returns {boolean} - Whether to save
     */
    function shouldAutoSave() {
        const now = Date.now();
        
        // Check if enough time has passed since last save
        if (now - gameState.lastSave >= GameConfig.BASE_PARAMS.saveInterval) {
            gameState.lastSave = now;
            return true;
        }
        
        return false;
    }
    
    // Public API
    return {
        init: function() {
            // Load saved game if available
            this.loadGame();
            
            // Initialize game state if new game
            if (gameState.depth === 0 && gameState.resources.dirt === 0) {
                // Set starting resources
                gameState.resources.dirt = GameConfig.BASE_PARAMS.startingDirt;
                gameState.resources.stone = GameConfig.BASE_PARAMS.startingStone;
                gameState.resources.gems = GameConfig.BASE_PARAMS.startingGems;
                
                // Set initial timestamp
                gameState.lastSave = Date.now();
            }
            
            console.log('Game data initialized');
        },
        
        // Resource management
        addResource: function(resource, amount) {
            if (!gameState.resources.hasOwnProperty(resource)) return;
            
            // Update resource amount
            gameState.resources[resource] += amount;
            
            // Ensure non-negative values
            if (gameState.resources[resource] < 0) {
                gameState.resources[resource] = 0;
            }
            
            // Update total stats for positive additions
            if (amount > 0) {
                const totalKey = 'total' + resource.charAt(0).toUpperCase() + resource.slice(1);
                if (gameState.stats.hasOwnProperty(totalKey)) {
                    gameState.stats[totalKey] += amount;
                }
            }
            
            // Check for achievements
            checkAchievements();
            
            // Dispatch event
            const event = new CustomEvent('resourceUpdated', {
                detail: { 
                    resource: resource, 
                    amount: amount, 
                    total: gameState.resources[resource],
                    resources: { ...gameState.resources }
                }
            });
            document.dispatchEvent(event);
        },
        
        addResources: function(resources) {
            for (const [resource, amount] of Object.entries(resources)) {
                this.addResource(resource, amount);
            }
        },
        
        subtractResource: function(resource, amount) {
            this.addResource(resource, -amount);
        },
        
        getResource: function(resource) {
            return gameState.resources[resource] || 0;
        },
        
        getResources: function() {
            return { ...gameState.resources };
        },
        
        // Multiplier management
        getResourceMultiplier: function(resource) {
            return gameState.multipliers[resource] || 1;
        },
        
        setResourceMultiplier: function(resource, value) {
            if (gameState.multipliers.hasOwnProperty(resource)) {
                gameState.multipliers[resource] = value;
                
                // Dispatch event
                const event = new CustomEvent('multiplierUpdated', {
                    detail: { 
                        type: resource, 
                        value: value,
                        multipliers: { ...gameState.multipliers }
                    }
                });
                document.dispatchEvent(event);
            }
        },
        
        addResourceMultiplier: function(resource, amount) {
            if (gameState.multipliers.hasOwnProperty(resource)) {
                gameState.multipliers[resource] += amount;
                
                // Dispatch event
                const event = new CustomEvent('multiplierUpdated', {
                    detail: { 
                        type: resource, 
                        value: gameState.multipliers[resource],
                        multipliers: { ...gameState.multipliers }
                    }
                });
                document.dispatchEvent(event);
            }
        },
        
        getDepthMultiplier: function() {
            return gameState.multipliers.depth || 1;
        },
        
        setDepthMultiplier: function(value) {
            gameState.multipliers.depth = value;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'depth', 
                    value: value,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        getClickPowerMultiplier: function() {
            return gameState.multipliers.clickPower || 1;
        },
        
        addClickPowerMultiplier: function(amount) {
            gameState.multipliers.clickPower += amount;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'clickPower', 
                    value: gameState.multipliers.clickPower,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        getAutoDigSpeedMultiplier: function() {
            return gameState.multipliers.autoDigSpeed || 1;
        },
        
        addAutoDigSpeedMultiplier: function(amount) {
            gameState.multipliers.autoDigSpeed += amount;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'autoDigSpeed', 
                    value: gameState.multipliers.autoDigSpeed,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        getGemChanceMultiplier: function() {
            return gameState.multipliers.gemChance || 1;
        },
        
        addGemChanceMultiplier: function(amount) {
            gameState.multipliers.gemChance += amount;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'gemChance', 
                    value: gameState.multipliers.gemChance,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        getHazardChanceMultiplier: function() {
            return gameState.multipliers.hazardChance || 1;
        },
        
        addHazardChanceMultiplier: function(amount) {
            gameState.multipliers.hazardChance += amount;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'hazardChance', 
                    value: gameState.multipliers.hazardChance,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        getHazardDurationMultiplier: function() {
            return gameState.multipliers.hazardDuration || 1;
        },
        
        addHazardDurationMultiplier: function(amount) {
            gameState.multipliers.hazardDuration += amount;
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: 'hazardDuration', 
                    value: gameState.multipliers.hazardDuration,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        addTemporaryMultiplier: function(type, value, duration, permanent = false) {
            // Apply multiplier
            if (type === 'all') {
                gameState.multipliers.dirt *= value;
                gameState.multipliers.stone *= value;
                gameState.multipliers.gems *= value;
            } else {
                gameState.multipliers[type] *= value;
            }
            
            // Add to temporary multipliers
            gameState.temporaryMultipliers.push({
                type: type,
                value: value,
                duration: duration,
                remainingTime: duration,
                permanent: permanent
            });
            
            // Dispatch event
            const event = new CustomEvent('multiplierUpdated', {
                detail: { 
                    type: type, 
                    value: type === 'all' ? value : gameState.multipliers[type],
                    temporary: true,
                    duration: duration,
                    multipliers: { ...gameState.multipliers }
                }
            });
            document.dispatchEvent(event);
        },
        
        // Upgrade management
        incrementUpgradeLevel: function(upgradeId) {
            // Initialize if not exists
            if (!gameState.upgrades[upgradeId]) {
                gameState.upgrades[upgradeId] = 0;
            }
            
            // Increment level
            gameState.upgrades[upgradeId]++;
            
            // Check for achievements
            checkAchievements();
            
            // Dispatch event
            const event = new CustomEvent('upgradeChanged', {
                detail: { 
                    id: upgradeId, 
                    level: gameState.upgrades[upgradeId] 
                }
            });
            document.dispatchEvent(event);
            
            return gameState.upgrades[upgradeId];
        },
        
        getUpgradeLevel: function(upgradeId) {
            return gameState.upgrades[upgradeId] || 0;
        },
        
        getUpgradeById: function(upgradeId) {
            const upgradeConfig = GameConfig.UPGRADES[upgradeId];
            if (!upgradeConfig) return null;
            
            return {
                ...upgradeConfig,
                level: gameState.upgrades[upgradeId] || 0
            };
        },
        
        getUpgrades: function() {
            const upgrades = [];
            
            // Convert upgrades object to array with full data
            for (const [id, level] of Object.entries(gameState.upgrades)) {
                const upgradeConfig = GameConfig.UPGRADES[id];
                if (upgradeConfig) {
                    upgrades.push({
                        ...upgradeConfig,
                        level: level
                    });
                }
            }
            
            // Add upgrades that aren't purchased yet but should be visible
            for (const [id, config] of Object.entries(GameConfig.UPGRADES)) {
                if (!gameState.upgrades[id]) {
                    // Check if upgrade should be visible based on depth
                    const visible = gameState.depth >= config.requirements.depth;
                    
                    // Check prerequisites
                    let prereqsMet = true;
                    if (config.requirements.upgrades) {
                        for (const [prereqId, prereqLevel] of Object.entries(config.requirements.upgrades)) {
                            if ((gameState.upgrades[prereqId] || 0) < prereqLevel) {
                                prereqsMet = false;
                                break;
                            }
                        }
                    }
                    
                    if (visible && prereqsMet) {
                        upgrades.push({
                            ...config,
                            level: 0,
                            visible: true
                        });
                    }
                }
            }
            
            return upgrades;
        },
        
        // Depth management
        increaseDepth: function(amount) {
            const oldDepth = gameState.depth;
            gameState.depth += amount;
            
            // Update layer if needed
            const newLayer = GameConfig.getLayerAtDepth(gameState.depth);
            if (newLayer.name !== gameState.layer) {
                gameState.layer = newLayer.name;
                
                // Dispatch layer change event
                const layerEvent = new CustomEvent('layerChanged', {
                    detail: { layer: newLayer }
                });
                document.dispatchEvent(layerEvent);
            }
            
            // Check for achievements
            checkAchievements();
            
            // Dispatch event
            const event = new CustomEvent('depthChanged', {
                detail: { 
                    depth: gameState.depth,
                    change: gameState.depth - oldDepth
                }
            });
            document.dispatchEvent(event);
        },
        
        setDepth: function(depth) {
            const oldDepth = gameState.depth;
            gameState.depth = depth;
            
            // Update layer
            const newLayer = GameConfig.getLayerAtDepth(gameState.depth);
            const oldLayer = gameState.layer;
            gameState.layer = newLayer.name;
            
            // Dispatch layer change event if layer changed
            if (oldLayer !== newLayer.name) {
                const layerEvent = new CustomEvent('layerChanged', {
                    detail: { layer: newLayer }
                });
                document.dispatchEvent(layerEvent);
            }
            
            // Check for achievements
            checkAchievements();
            
            // Dispatch event
            const event = new CustomEvent('depthChanged', {
                detail: { 
                    depth: gameState.depth,
                    change: gameState.depth - oldDepth
                }
            });
            document.dispatchEvent(event);
        },
        
        getDepth: function() {
            return gameState.depth;
        },
        
        getDepthIncrement: function() {
            return GameConfig.BASE_PARAMS.depthPerDig * gameState.multipliers.depth;
        },
        
        getCurrentLayer: function() {
            return GameConfig.getLayerAtDepth(gameState.depth);
        },
        
        // Auto-digging management
        getAutoDigRate: function() {
            return gameState.autoDigRate * gameState.multipliers.autoDigSpeed;
        },
        
        setAutoDigRate: function(rate) {
            gameState.autoDigRate = rate;
            
            // Dispatch event
            const event = new CustomEvent('autoDigRateChanged', {
                detail: { 
                    rate: gameState.autoDigRate,
                    effectiveRate: this.getAutoDigRate()
                }
            });
            document.dispatchEvent(event);
        },
        
        addAccumulatedDigs: function(amount) {
            gameState.accumulatedDigs += amount;
        },
        
        subtractAccumulatedDigs: function(amount) {
            gameState.accumulatedDigs -= amount;
            if (gameState.accumulatedDigs < 0) {
                gameState.accumulatedDigs = 0;
            }
        },
        
        getAccumulatedDigs: function() {
            return gameState.accumulatedDigs;
        },
        
        // Hazard management
        addActiveHazard: function(hazard) {
            gameState.activeHazards.push(hazard);
        },
        
        removeActiveHazard: function(hazardType) {
            gameState.activeHazards = gameState.activeHazards.filter(h => h.type !== hazardType);
        },
        
        getActiveHazards: function() {
            return [...gameState.activeHazards];
        },
        
        // Stats management
        incrementClicks: function() {
            gameState.stats.clicks++;
            
            // Check for achievements
            checkAchievements();
            
            // Dispatch event
            const event = new CustomEvent('statsUpdated', {
                detail: { stats: { ...gameState.stats } }
            });
            document.dispatchEvent(event);
        },
        
        updatePlayTime: function(seconds) {
            gameState.stats.playTime += seconds;
            
            // Process temporary multipliers
            processTemporaryMultipliers(seconds);
            
            // Check for auto-save
            if (shouldAutoSave()) {
                this.saveGame();
            }
        },
        
        incrementSpecialStat: function(stat) {
            if (!gameState.specialStats[stat]) {
                gameState.specialStats[stat] = 0;
            }
            
            gameState.specialStats[stat]++;
            
            // Check for achievements
            checkAchievements();
        },
        
        setSpecialStat: function(stat, value) {
            gameState.specialStats[stat] = value;
            
            // Check for achievements
            checkAchievements();
        },
        
        getSpecialStat: function(stat) {
            return gameState.specialStats[stat] || 0;
        },
        
        getStat: function(stat) {
            return gameState.stats[stat] || 0;
        },
        
        getStats: function() {
            return { ...gameState.stats };
        },
        
        // Achievement management
        unlockAchievement: function(achievementId) {
            gameState.achievements[achievementId] = true;
            
            // Dispatch event
            const achievement = GameConfig.ACHIEVEMENTS[achievementId];
            if (achievement) {
                const event = new CustomEvent('achievementUnlocked', {
                    detail: { achievement: achievement }
                });
                document.dispatchEvent(event);
            }
        },
        
        isAchievementUnlocked: function(achievementId) {
            return !!gameState.achievements[achievementId];
        },
        
        getAchievements: function() {
            return { ...gameState.achievements };
        },
        
        // Discovery management
        setDiscoveryFound: function(discoveryId) {
            gameState.discoveries[discoveryId] = true;
        },
        
        isDiscoveryFound: function(discoveryId) {
            return !!gameState.discoveries[discoveryId];
        },
        
        getDiscoveries: function() {
            return { ...gameState.discoveries };
        },
        
        // Feature management
        unlockFeature: function(featureId) {
            gameState.unlockedFeatures[featureId] = true;
            
            // Dispatch event
            const event = new CustomEvent('featureUnlocked', {
                detail: { feature: featureId }
            });
            document.dispatchEvent(event);
        },
        
        isFeatureUnlocked: function(featureId) {
            return !!gameState.unlockedFeatures[featureId];
        },
        
        // Game persistence
        shouldSave: function() {
            return shouldAutoSave();
        },
        
        saveGame: function() {
            try {
                // Update last save time
                gameState.lastSave = Date.now();
                
                localStorage.setItem('digDeepSave', JSON.stringify(gameState));
                
                // Dispatch event
                const event = new CustomEvent('gameSaved');
                document.dispatchEvent(event);
                
                return true;
            } catch (e) {
                console.error('Failed to save game:', e);
                return false;
            }
        },
        
        loadGame: function() {
            try {
                const savedGame = localStorage.getItem('digDeepSave');
                if (!savedGame) return false;
                
                const savedState = JSON.parse(savedGame);
                
                // Merge saved state with current state (to handle new properties in game updates)
                gameState = this.mergeGameStates(gameState, savedState);
                
                // Dispatch event
                const event = new CustomEvent('gameLoaded');
                document.dispatchEvent(event);
                
                return true;
            } catch (e) {
                console.error('Failed to load game:', e);
                return false;
            }
        },
        
        resetGame: function() {
            // Reset to initial state
            gameState = {
                resources: {
                    dirt: GameConfig.BASE_PARAMS.startingDirt,
                    stone: GameConfig.BASE_PARAMS.startingStone,
                    gems: GameConfig.BASE_PARAMS.startingGems
                },
                multipliers: {
                    dirt: 1,
                    stone: 1,
                    gems: 1,
                    depth: 1,
                    clickPower: 1,
                    autoDigSpeed: 1,
                    gemChance: 1,
                    hazardChance: 1,
                    hazardDuration: 1
                },
                temporaryMultipliers: [],
                stats: {
                    clicks: 0,
                    totalDirt: 0,
                    totalStone: 0,
                    totalGems: 0,
                    playTime: 0,
                    hazardsPrevented: 0,
                    hazardDigs: 0
                },
                upgrades: {},
                depth: 0,
                layer: 'surface',
                autoDigRate: 0,
                accumulatedDigs: 0,
                activeHazards: [],
                achievements: {},
                discoveries: {},
                unlockedFeatures: {},
                specialStats: {},
                version: gameState.version,
                lastSave: Date.now()
            };
            
            // Save the reset state
            this.saveGame();
            
            // Dispatch event
            const event = new CustomEvent('gameReset');
            document.dispatchEvent(event);
            
            return true;
        },
        
        // Helper method to merge game states (for handling version changes)
        mergeGameStates: function(currentState, savedState) {
            const merged = { ...currentState };
            
            // Merge resources
            for (const resource in merged.resources) {
                if (savedState.resources && savedState.resources[resource] !== undefined) {
                    merged.resources[resource] = savedState.resources[resource];
                }
            }
            
            // Merge multipliers
            for (const multiplier in merged.multipliers) {
                if (savedState.multipliers && savedState.multipliers[multiplier] !== undefined) {
                    merged.multipliers[multiplier] = savedState.multipliers[multiplier];
                }
            }
            
            // Copy temporary multipliers
            if (savedState.temporaryMultipliers) {
                merged.temporaryMultipliers = [...savedState.temporaryMultipliers];
            }
            
            // Merge stats
            for (const stat in merged.stats) {
                if (savedState.stats && savedState.stats[stat] !== undefined) {
                    merged.stats[stat] = savedState.stats[stat];
                }
            }
            
            // Copy upgrades
            if (savedState.upgrades) {
                merged.upgrades = { ...savedState.upgrades };
            }
            
            // Copy progression
            if (savedState.depth !== undefined) merged.depth = savedState.depth;
            if (savedState.layer !== undefined) merged.layer = savedState.layer;
            
            // Copy auto-digging
            if (savedState.autoDigRate !== undefined) merged.autoDigRate = savedState.autoDigRate;
            if (savedState.accumulatedDigs !== undefined) merged.accumulatedDigs = savedState.accumulatedDigs;
            
            // Copy hazards
            if (savedState.activeHazards) {
                merged.activeHazards = [...savedState.activeHazards];
            }
            
            // Copy achievements
            if (savedState.achievements) {
                merged.achievements = { ...savedState.achievements };
            }
            
            // Copy discoveries
            if (savedState.discoveries) {
                merged.discoveries = { ...savedState.discoveries };
            }
            
            // Copy unlocked features
            if (savedState.unlockedFeatures) {
                merged.unlockedFeatures = { ...savedState.unlockedFeatures };
            }
            
            // Copy special stats
            if (savedState.specialStats) {
                merged.specialStats = { ...savedState.specialStats };
            }
            
            // Keep current version
            merged.version = currentState.version;
            
            // Copy last save time
            if (savedState.lastSave) {
                merged.lastSave = savedState.lastSave;
            } else {
                merged.lastSave = Date.now();
            }
            
            return merged;
        },
        
        // Debug methods
        getGameState: function() {
            return { ...gameState };
        },
        
        setGameState: function(newState) {
            // Merge with current state to ensure all properties exist
            gameState = this.mergeGameStates(gameState, newState);
            
            // Update UI
            const resourceEvent = new CustomEvent('resourceUpdated', {
                detail: { resources: { ...gameState.resources } }
            });
            document.dispatchEvent(resourceEvent);
            
            const depthEvent = new CustomEvent('depthUpdated', {
                detail: { depth: gameState.depth }
            });
            document.dispatchEvent(depthEvent);
            
            const statsEvent = new CustomEvent('statsUpdated', {
                detail: { stats: { ...gameState.stats } }
            });
            document.dispatchEvent(statsEvent);
        }
    };
})();