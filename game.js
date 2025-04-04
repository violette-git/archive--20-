/**
 * Game.js - Main game initialization and management
 * Handles UI setup, event listeners, and game flow
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize game components
    GameEngine.init();
    
    // Initialize content system
    GameContent.init();
    
    // Initialize achievement system
    GameAchievements.init();
    
    // Initialize save system
    SaveSystem.init();
    
    // Initialize admin interface
    GameAdmin.init();
    
    // Set up UI event listeners
    setupEventListeners();
    
    // Set up custom event handlers
    setupCustomEventHandlers();
    
    // Initialize visual elements
    initializeVisuals();
    
    // Development tools (if in dev mode)
    if (GameConfig.devMode) {
        setupDevTools();
    }
    
    // Start the game loop
    GameEngine.startGameLoop();
    
    // Show welcome message
    showNotification('Welcome to Dig Deep!', 'Start digging to uncover resources and upgrades.');
});

/**
 * Sets up all event listeners for user interactions
 */
function setupEventListeners() {
    // Dig button click
    const digButton = document.getElementById('dig-button');
    if (digButton) {
        digButton.addEventListener('click', function(e) {
            // Attempt to dig
            const result = GameEngine.dig();
            
            if (result.success) {
                // Create digging animation at click position
                const rect = digButton.getBoundingClientRect();
                const x = e.clientX || (rect.left + rect.width / 2);
                const y = e.clientY || (rect.top + rect.height / 2);
                
                // Get current tool type based on highest level upgrade
                let toolType = 'shovel';
                const upgrades = GameData.getUpgrades();
                if (upgrades.find(u => u.id === 'drill' && u.level > 0)) {
                    toolType = 'drill';
                } else if (upgrades.find(u => u.id === 'pickaxe' && u.level > 0)) {
                    toolType = 'pickaxe';
                }
                
                // Create digging animation
                const digAnim = GameAssets.createDiggingAnimation(x, y, toolType);
                document.body.appendChild(digAnim);
                
                // Animate resource gains
                if (result.resources) {
                    animateResourceGains(result.resources, x, y);
                }
                
                // Add button animation
                digButton.classList.add('dig-button-active');
                setTimeout(() => {
                    digButton.classList.remove('dig-button-active');
                }, 100);
                
                // Dispatch dig completed event for content system
                const digEvent = new CustomEvent('digCompleted', {
                    detail: { 
                        depth: result.depth,
                        resources: result.resources
                    }
                });
                document.dispatchEvent(digEvent);
                
                // Show first dig tip for new players
                if (GameData.getStat('clicks') === 1) {
                    GameTutorial.showGameplayTip('firstDig');
                }
            }
        });
    }
    
    // Upgrade click events - using event delegation
    const upgradesContainer = document.getElementById('upgrades-container');
    if (upgradesContainer) {
        upgradesContainer.addEventListener('click', function(e) {
            // Find closest upgrade item if clicked on a child element
            const upgradeItem = e.target.closest('.upgrade-item');
            if (upgradeItem) {
                const upgradeId = upgradeItem.dataset.id;
                if (upgradeId) {
                    const result = GameEngine.purchaseUpgrade(upgradeId);
                    
                    if (result.success) {
                        // Visual feedback for successful purchase
                        upgradeItem.classList.add('upgrade-purchased');
                        setTimeout(() => {
                            upgradeItem.classList.remove('upgrade-purchased');
                        }, 300);
                        
                        // Show notification with flavor text
                        const upgradeEvent = new CustomEvent('upgradeChanged', {
                            detail: { 
                                id: upgradeId,
                                level: result.upgrade.level
                            }
                        });
                        document.dispatchEvent(upgradeEvent);
                        
                        // Show notification
                        showNotification(
                            `Upgrade Purchased: ${result.upgrade.name}`,
                            result.upgrade.description
                        );
                        
                        // Show first upgrade tip for new players
                        if (GameData.getSpecialStat('firstUpgradePurchased') !== true) {
                            GameData.setSpecialStat('firstUpgradePurchased', true);
                            GameTutorial.showGameplayTip('firstUpgrade');
                        }
                        
                        // Show auto-digging tip when first auto-digger is purchased
                        if (upgradeId === 'autoDigger' && result.upgrade.level === 1) {
                            GameTutorial.showGameplayTip('autoDigging');
                        }
                    } else if (result.error) {
                        // Show error notification
                        showNotification(
                            'Cannot Purchase Upgrade',
                            result.error,
                            'error'
                        );
                    }
                }
            }
        });
    }
    
    // Hazard prevention button clicks - using event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('hazard-action-button')) {
            const hazardType = e.target.dataset.hazardType;
            if (hazardType) {
                const result = GameEngine.preventHazard(hazardType);
                
                if (result.success) {
                    // Visual feedback
                    const hazardContainer = e.target.closest('.hazard-container');
                    if (hazardContainer) {
                        hazardContainer.classList.add('hazard-prevented');
                        setTimeout(() => {
                            hazardContainer.remove();
                        }, 500);
                    }
                    
                    // Dispatch hazard prevented event
                    const hazardEvent = new CustomEvent('hazardPrevented', {
                        detail: { hazard: result.hazard }
                    });
                    document.dispatchEvent(hazardEvent);
                    
                    // Show notification
                    showNotification(
                        'Hazard Prevented',
                        `You successfully prevented the ${result.hazard.name}.`
                    );
                    
                    // Show first hazard tip for new players
                    if (GameData.getSpecialStat('firstHazardPrevented') !== true) {
                        GameData.setSpecialStat('firstHazardPrevented', true);
                        GameTutorial.showGameplayTip('firstHazard');
                    }
                } else if (result.error) {
                    // Show error notification
                    showNotification(
                        'Cannot Prevent Hazard',
                        result.error,
                        'error'
                    );
                }
            }
        }
    });
    
    // Achievement panel click events
    const achievementsContainer = document.getElementById('achievements-container');
    if (achievementsContainer) {
        achievementsContainer.addEventListener('click', function(e) {
            const achievementItem = e.target.closest('.achievement-item');
            if (achievementItem && achievementItem.classList.contains('achievement-unlocked')) {
                const achievementId = achievementItem.dataset.id;
                if (achievementId) {
                    // Show achievement details
                    const achievement = GameAchievements.ACHIEVEMENTS[achievementId];
                    if (achievement) {
                        showNotification(
                            achievement.name,
                            achievement.description,
                            'achievement'
                        );
                    }
                }
            }
        });
    }
}

/**
 * Sets up custom event handlers for game events
 */
function setupCustomEventHandlers() {
    // Resource updated event
    document.addEventListener('resourceUpdated', function(e) {
        updateResourceDisplay(e.detail.resources);
    });
    
    // Depth updated event
    document.addEventListener('depthUpdated', function(e) {
        updateDepthDisplay(e.detail.depth);
    });
    
    // Layer changed event
    document.addEventListener('layerChanged', function(e) {
        const layer = e.detail.layer;
        
        // Update digging area visualization
        updateDiggingAreaForLayer(layer);
        
        // Show notification for new layer discovery
        showLayerDiscoveryNotification(layer);
    });
    
    // Layer flavor text event
    document.addEventListener('layerFlavorText', function(e) {
        const flavorText = e.detail.flavorText;
        
        // Add flavor text to layer notification
        const layerNotifications = document.querySelectorAll('.notification-layer');
        if (layerNotifications.length > 0) {
            const latestNotification = layerNotifications[layerNotifications.length - 1];
            const descriptionElement = latestNotification.querySelector('.notification-description');
            
            if (descriptionElement) {
                descriptionElement.textContent = flavorText;
            } else {
                const contentElement = latestNotification.querySelector('.notification-content');
                if (contentElement) {
                    const flavorElement = document.createElement('div');
                    flavorElement.className = 'notification-description';
                    flavorElement.textContent = flavorText;
                    contentElement.appendChild(flavorElement);
                }
            }
        }
    });
    
    // Upgrades updated event
    document.addEventListener('upgradesUpdated', function(e) {
        updateUpgradesDisplay(e.detail.upgrades, e.detail.resources);
    });
    
    // Upgrade flavor text event
    document.addEventListener('upgradeFlavorText', function(e) {
        const flavorText = e.detail.flavorText;
        
        // Add flavor text to upgrade notification
        const upgradeNotifications = document.querySelectorAll('.notification');
        if (upgradeNotifications.length > 0) {
            const latestNotification = upgradeNotifications[upgradeNotifications.length - 1];
            const titleElement = latestNotification.querySelector('.notification-title');
            
            if (titleElement && titleElement.textContent.includes('Upgrade Purchased')) {
                const contentElement = latestNotification.querySelector('.notification-content');
                if (contentElement) {
                    const flavorElement = document.createElement('div');
                    flavorElement.className = 'notification-description';
                    flavorElement.textContent = flavorText;
                    contentElement.appendChild(flavorElement);
                }
            }
        }
    });
    
    // Stats updated event
    document.addEventListener('statsUpdated', function(e) {
        updateStatsDisplay(e.detail.stats);
    });
    
    // Achievement unlocked event
    document.addEventListener('achievementUnlocked', function(e) {
        const achievement = e.detail.achievement;
        
        // Update achievements display
        updateAchievementsDisplay();
        
        // Show notification handled by achievement system
    });
    
    // Random event triggered event
    document.addEventListener('randomEventTriggered', function(e) {
        // Event notification is handled by content system
    });
    
    // Special discovery found event
    document.addEventListener('specialDiscoveryFound', function(e) {
        // Discovery notification is handled by content system
    });
    
    // Meta reference found event
    document.addEventListener('metaReferenceFound', function(e) {
        // Meta reference notification is handled by content system
    });
    
    // Internet reference found event
    document.addEventListener('internetReferenceFound', function(e) {
        // Internet reference notification is handled by content system
    });
    
    // Hazard warning event
    document.addEventListener('hazardWarning', function(e) {
        const hazard = e.detail.hazard;
        showHazardWarning(hazard);
    });
    
    // Hazard activated event
    document.addEventListener('hazardActivated', function(e) {
        const hazard = e.detail.hazard;
        activateHazard(hazard);
    });
    
    // Hazard resolved event
    document.addEventListener('hazardResolved', function(e) {
        const hazard = e.detail.hazard;
        resolveHazard(hazard);
    });
    
    // Game saved event
    document.addEventListener('gameSaved', function(e) {
        // Show auto-save indicator if it was an auto-save
        if (e.detail && e.detail.isAutoSave) {
            showAutoSaveIndicator();
        }
    });
    
    // Game loaded event
    document.addEventListener('gameLoaded', function(e) {
        // Update all UI elements
        updateResourceDisplay(GameData.getResources());
        updateDepthDisplay(GameData.getDepth());
        updateUpgradesDisplay(GameData.getUpgrades(), GameData.getResources());
        updateStatsDisplay(GameData.getStats());
        updateAchievementsDisplay();
        
        // Update digging area for current layer
        updateDiggingAreaForLayer(GameData.getCurrentLayer());
        
        // Show notification if it was a manual load
        if (!e.detail || !e.detail.isAutoLoad) {
            showNotification('Game Loaded', 'Your saved game has been loaded successfully.', 'success');
        }
    });
}

/**
 * Initialize visual elements for the game
 */
function initializeVisuals() {
    // Initialize resource icons
    updateResourceDisplay(GameData.getResources());
    
    // Initialize digging area
    const diggingBackground = document.getElementById('digging-background');
    if (diggingBackground) {
        const currentLayer = GameData.getCurrentLayer();
        GameAssets.renderDiggingArea(
            {
                depth: GameData.getDepth(),
                currentLayer: currentLayer
            },
            diggingBackground
        );
    }
    
    // Initialize upgrades display
    updateUpgradesDisplay(GameData.getUpgrades(), GameData.getResources());
    
    // Initialize achievements display
    updateAchievementsDisplay();
    
    // Initialize stats display
    updateStatsDisplay(GameData.getStats());
}

/**
 * Updates the resource display with current values
 * @param {Object} resources - Current resource values
 */
function updateResourceDisplay(resources) {
    // Use GameAssets to render resource display
    const resourceDisplay = document.querySelector('.resource-display');
    if (resourceDisplay) {
        GameAssets.renderResourceDisplay(resources, resourceDisplay);
    }
}

/**
 * Updates the depth display with current value
 * @param {number} depth - Current depth
 */
function updateDepthDisplay(depth) {
    const depthValue = document.getElementById('depth-value');
    if (depthValue) {
        depthValue.textContent = depth;
    }
}

/**
 * Updates the digging area visualization for the current layer
 * @param {Object} layer - Current layer data
 */
function updateDiggingAreaForLayer(layer) {
    const diggingBackground = document.getElementById('digging-background');
    if (diggingBackground) {
        GameAssets.renderDiggingArea(
            {
                depth: GameData.getDepth(),
                currentLayer: layer
            },
            diggingBackground
        );
    }
}

/**
 * Updates the upgrades display with available upgrades
 * @param {Array} upgrades - Available upgrades
 * @param {Object} resources - Current resources
 */
function updateUpgradesDisplay(upgrades, resources) {
    const upgradesContainer = document.getElementById('upgrades-container');
    if (!upgradesContainer) return;
    
    // Clear existing upgrades
    upgradesContainer.innerHTML = '';
    
    // Group upgrades by category
    const categories = {};
    upgrades.forEach(upgrade => {
        if (!categories[upgrade.category]) {
            categories[upgrade.category] = [];
        }
        categories[upgrade.category].push(upgrade);
    });
    
    // Create category sections
    for (const [category, categoryUpgrades] of Object.entries(categories)) {
        // Create category header
        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'upgrade-category';
        categoryHeader.textContent = category;
        upgradesContainer.appendChild(categoryHeader);
        
        // Add upgrades for this category
        categoryUpgrades.forEach(upgrade => {
            // Check if upgrade should be visible
            if (upgrade.visible) {
                // Check if player can afford the upgrade
                const canAfford = GameEngine.canAffordUpgrade(upgrade.id);
                
                // Create upgrade item using GameAssets
                const upgradeItem = GameAssets.renderUpgradeItem(upgrade, canAfford);
                upgradesContainer.appendChild(upgradeItem);
            }
        });
    }
}

/**
 * Updates the stats display with current values
 * @param {Object} stats - Current stats
 */
function updateStatsDisplay(stats) {
    // Update clicks
    const clicksStat = document.getElementById('clicks-stat');
    if (clicksStat) {
        clicksStat.textContent = stats.clicks.toLocaleString();
    }
    
    // Update digs per second
    const dpsStat = document.getElementById('dps-stat');
    if (dpsStat) {
        dpsStat.textContent = stats.digsPerSecond ? stats.digsPerSecond.toFixed(1) : '0.0';
    }
    
    // Update play time
    const playtimeStat = document.getElementById('playtime-stat');
    if (playtimeStat) {
        playtimeStat.textContent = formatTime(stats.playTime);
    }
}

/**
 * Updates the achievements display
 */
function updateAchievementsDisplay() {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) return;
    
    // Use the achievement system to render achievements
    GameAchievements.renderAchievementsPanel(achievementsContainer);
}

/**
 * Shows a notification to the player
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (default, success, error)
 */
function showNotification(title, message, type = 'default') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add notification content
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('notification-visible');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Shows a layer discovery notification
 * @param {Object} layer - Layer data
 */
function showLayerDiscoveryNotification(layer) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification-layer';
    
    // Create layer icon - a small representation of the layer
    const layerIconSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layerIconSVG.setAttribute("width", "40");
    layerIconSVG.setAttribute("height", "40");
    layerIconSVG.setAttribute("viewBox", "0 0 40 40");
    
    // Create rectangle with layer color
    const layerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    layerRect.setAttribute("x", "5");
    layerRect.setAttribute("y", "5");
    layerRect.setAttribute("width", "30");
    layerRect.setAttribute("height", "30");
    layerRect.setAttribute("fill", layer.color || "#8B4513");
    layerRect.setAttribute("rx", "5");
    
    layerIconSVG.appendChild(layerRect);
    
    // Add texture based on layer type
    if (layer.name.toLowerCase().includes('dirt') || layer.name.toLowerCase().includes('soil')) {
        // Dirt texture - dots
        for (let i = 0; i < 8; i++) {
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", 10 + Math.random() * 20);
            dot.setAttribute("cy", 10 + Math.random() * 20);
            dot.setAttribute("r", 1 + Math.random() * 2);
            dot.setAttribute("fill", "#000");
            dot.setAttribute("opacity", "0.3");
            layerIconSVG.appendChild(dot);
        }
    } else if (layer.name.toLowerCase().includes('stone') || layer.name.toLowerCase().includes('rock')) {
        // Stone texture - lines
        for (let i = 0; i < 4; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 10 + Math.random() * 10);
            line.setAttribute("y1", 10 + Math.random() * 20);
            line.setAttribute("x2", 20 + Math.random() * 10);
            line.setAttribute("y2", 10 + Math.random() * 20);
            line.setAttribute("stroke", "#000");
            line.setAttribute("stroke-width", "1");
            line.setAttribute("opacity", "0.3");
            layerIconSVG.appendChild(line);
        }
    } else if (layer.name.toLowerCase().includes('gem') || layer.name.toLowerCase().includes('crystal')) {
        // Gem texture - sparkles
        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const x = 15 + Math.random() * 10;
            const y = 15 + Math.random() * 10;
            const size = 2 + Math.random() * 3;
            sparkle.setAttribute("points", `
                ${x},${y-size} ${x+size/4},${y-size/4} ${x+size},${y} 
                ${x+size/4},${y+size/4} ${x},${y+size} ${x-size/4},${y+size/4} 
                ${x-size},${y} ${x-size/4},${y-size/4}
            `);
            sparkle.setAttribute("fill", "#FFF");
            sparkle.setAttribute("opacity", "0.5");
            layerIconSVG.appendChild(sparkle);
        }
    }
    
    // Add notification content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `
        <div class="notification-title">New Layer Discovered!</div>
        <div class="notification-message">${layer.name}</div>
        <div class="notification-description">Depth: ${layer.startDepth}m - ${layer.endDepth}m</div>
    `;
    
    // Assemble notification
    const iconContainer = document.createElement('div');
    iconContainer.className = 'notification-icon';
    iconContainer.appendChild(layerIconSVG);
    
    notification.appendChild(iconContainer);
    notification.appendChild(content);
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('notification-visible');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Shows a hazard warning
 * @param {Object} hazard - Hazard data
 */
function showHazardWarning(hazard) {
    // Create hazard warning element using GameAssets
    const hazardWarning = GameAssets.renderHazardWarning(hazard, 'warning');
    
    // Add to digging area
    const diggingBackground = document.getElementById('digging-background');
    if (diggingBackground) {
        // Create container for hazard
        const hazardContainer = document.createElement('div');
        hazardContainer.className = 'hazard-warning-container';
        hazardContainer.appendChild(hazardWarning);
        diggingBackground.appendChild(hazardContainer);
        
        // Create warning animation
        const rect = diggingBackground.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const warningAnim = GameAssets.createHazardWarningAnimation(x, y, hazard.type);
        document.body.appendChild(warningAnim);
        
        // Get flavor text for hazard
        let warningMessage = hazard.warningMessage;
        const flavorText = GameContent.getHazardFlavorText(hazard.type);
        if (flavorText) {
            warningMessage += ` ${flavorText}`;
        }
        
        // Show notification
        showNotification(
            `Hazard Warning: ${hazard.name}`,
            warningMessage,
            'warning'
        );
    }
}

/**
 * Activates a hazard
 * @param {Object} hazard - Hazard data
 */
function activateHazard(hazard) {
    // Find and update existing hazard warning
    const hazardWarnings = document.querySelectorAll('.hazard-warning-container');
    hazardWarnings.forEach(container => {
        const hazardElement = container.querySelector(`[data-type="${hazard.type}"]`);
        if (hazardElement) {
            // Replace with active hazard
            container.innerHTML = '';
            const activeHazard = GameAssets.renderHazardWarning(hazard, 'active');
            container.appendChild(activeHazard);
            container.classList.add('hazard-active');
            
            // Add hazard effect to digging area
            const diggingBackground = document.getElementById('digging-background');
            if (diggingBackground) {
                diggingBackground.classList.add(`hazard-effect-${hazard.type}`);
            }
        }
    });
    
    // Show notification
    showNotification(
        `Hazard Activated: ${hazard.name}`,
        hazard.activeMessage,
        'error'
    );
}

/**
 * Resolves a hazard
 * @param {Object} hazard - Hazard data
 */
function resolveHazard(hazard) {
    // Find and remove hazard elements
    const hazardWarnings = document.querySelectorAll('.hazard-warning-container');
    hazardWarnings.forEach(container => {
        const hazardElement = container.querySelector(`[data-type="${hazard.type}"]`);
        if (hazardElement) {
            // Animate removal
            container.classList.add('hazard-resolved');
            setTimeout(() => {
                container.remove();
            }, 500);
        }
    });
    
    // Remove hazard effect from digging area
    const diggingBackground = document.getElementById('digging-background');
    if (diggingBackground) {
        diggingBackground.classList.remove(`hazard-effect-${hazard.type}`);
    }
    
    // Show notification
    showNotification(
        `Hazard Resolved: ${hazard.name}`,
        'The hazard has been resolved and it is safe to continue digging.',
        'success'
    );
}

/**
 * Animates resource gains
 * @param {Object} resources - Resources gained
 * @param {number} x - X coordinate for animation
 * @param {number} y - Y coordinate for animation
 */
function animateResourceGains(resources, x, y) {
    // Get resource counter elements
    const dirtCounter = document.getElementById('dirt-counter');
    const stoneCounter = document.getElementById('stone-counter');
    const gemsCounter = document.getElementById('gems-counter');
    
    // Animate each resource type
    for (const [resource, amount] of Object.entries(resources)) {
        if (amount > 0) {
            // Determine target element
            let targetElement;
            switch (resource) {
                case 'dirt':
                    targetElement = dirtCounter;
                    break;
                case 'stone':
                    targetElement = stoneCounter;
                    break;
                case 'gems':
                    targetElement = gemsCounter;
                    break;
            }
            
            // Create resource collection animation
            if (targetElement) {
                const anim = GameAssets.createResourceCollectionAnimation(
                    x, y, resource, amount, targetElement
                );
                document.body.appendChild(anim);
                
                // Occasionally show resource flavor text
                if (Math.random() < 0.1) { // 10% chance
                    const flavorText = GameContent.getResourceFlavorText(resource);
                    if (flavorText) {
                        const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
                        showNotification(
                            `${resourceName} Collected`,
                            flavorText,
                            'default'
                        );
                    }
                }
            }
        }
    }
}

/**
 * Shows the auto-save indicator
 */
function showAutoSaveIndicator() {
    const indicator = document.getElementById('auto-save-indicator');
    if (indicator) {
        // Show indicator
        indicator.classList.add('visible');
        
        // Hide after delay
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    }
}

/**
 * Formats time in seconds to HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

/**
 * Sets up development tools
 */
function setupDevTools() {
    // Create dev tools container
    const devTools = document.createElement('div');
    devTools.className = 'dev-tools';
    devTools.innerHTML = `
        <h3>Dev Tools</h3>
        <div class="dev-tool-buttons">
            <button id="dev-add-resources">Add Resources</button>
            <button id="dev-unlock-upgrades">Unlock Upgrades</button>
            <button id="dev-trigger-hazard">Trigger Hazard</button>
            <button id="dev-toggle-debug">Toggle Debug Info</button>
            <button id="dev-open-admin">Open Admin Panel</button>
        </div>
        <div id="dev-debug-info" class="dev-debug-info" style="display: none;"></div>
    `;
    
    document.body.appendChild(devTools);
    
    // Add event listeners
    document.getElementById('dev-add-resources').addEventListener('click', function() {
        GameData.addResource('dirt', 100);
        GameData.addResource('stone', 50);
        GameData.addResource('gems', 10);
    });
    
    document.getElementById('dev-unlock-upgrades').addEventListener('click', function() {
        const upgrades = GameConfig.UPGRADES;
        for (const id in upgrades) {
            GameData.incrementUpgradeLevel(id);
        }
    });
    
    document.getElementById('dev-trigger-hazard').addEventListener('click', function() {
        const hazards = GameConfig.HAZARDS;
        const hazardIds = Object.keys(hazards);
        if (hazardIds.length > 0) {
            const randomId = hazardIds[Math.floor(Math.random() * hazardIds.length)];
            GameEngine.triggerHazard(randomId);
        }
    });
    
    document.getElementById('dev-toggle-debug').addEventListener('click', function() {
        const debugInfo = document.getElementById('dev-debug-info');
        if (debugInfo.style.display === 'none') {
            debugInfo.style.display = 'block';
            updateDebugInfo();
        } else {
            debugInfo.style.display = 'none';
        }
    });
    
    document.getElementById('dev-open-admin').addEventListener('click', function() {
        GameAdmin.showAdminPanel();
    });
    
    // Update debug info periodically
    function updateDebugInfo() {
        const debugInfo = document.getElementById('dev-debug-info');
        if (debugInfo && debugInfo.style.display !== 'none') {
            const gameState = GameData.getGameState();
            debugInfo.innerHTML = `
                <p>Depth: ${gameState.depth.toFixed(1)}m</p>
                <p>Layer: ${gameState.layer}</p>
                <p>Resources: Dirt=${gameState.resources.dirt}, Stone=${gameState.resources.stone}, Gems=${gameState.resources.gems}</p>
                <p>Clicks: ${gameState.stats.clicks}</p>
                <p>Play Time: ${formatTime(gameState.stats.playTime)}</p>
                <p>Last Save: ${new Date(gameState.lastSave).toLocaleString()}</p>
            `;
            
            setTimeout(updateDebugInfo, 1000);
        }
    }
}