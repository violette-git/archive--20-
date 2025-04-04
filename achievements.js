/**
 * Achievements.js - Achievement system for Dig Deep
 * Defines achievements, tracking, notifications, and rewards
 */

const GameAchievements = (function() {
    'use strict';

    // Private variables
    let achievementsInitialized = false;
    let achievementRewards = {};

    /**
     * Achievement categories
     */
    const ACHIEVEMENT_CATEGORIES = {
        PROGRESSION: 'progression',
        COLLECTION: 'collection',
        MILESTONES: 'milestones',
        SPECIAL: 'special'
    };

    /**
     * Achievement definitions with rewards
     */
    const ACHIEVEMENTS = {
        // Progression achievements
        firstDig: {
            id: 'firstDig',
            name: 'First Step',
            description: 'Dig for the first time',
            category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
            criteria: { clicks: 1 },
            reward: {
                description: 'Bonus starting dirt',
                effect: { resource: 'dirt', amount: 5 }
            },
            visible: true
        },
        depth10: {
            id: 'depth10',
            name: 'Getting Deeper',
            description: 'Reach 10 meters depth',
            category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
            criteria: { depth: 10 },
            reward: {
                description: '+5% dirt per dig',
                effect: { multiplier: 'dirt', amount: 0.05 }
            },
            visible: true
        },
        depth50: {
            id: 'depth50',
            name: 'Serious Digger',
            description: 'Reach 50 meters depth',
            category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
            criteria: { depth: 50 },
            reward: {
                description: '+5% stone per dig',
                effect: { multiplier: 'stone', amount: 0.05 }
            },
            visible: true
        },
        depth100: {
            id: 'depth100',
            name: 'Professional Excavator',
            description: 'Reach 100 meters depth',
            category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
            criteria: { depth: 100 },
            reward: {
                description: '+5% gems per dig',
                effect: { multiplier: 'gems', amount: 0.05 }
            },
            visible: true
        },
        depth200: {
            id: 'depth200',
            name: 'To The Core',
            description: 'Reach 200 meters depth',
            category: ACHIEVEMENT_CATEGORIES.PROGRESSION,
            criteria: { depth: 200 },
            reward: {
                description: '+10% all resources',
                effect: { multiplier: 'all', amount: 0.1 }
            },
            visible: true
        },

        // Collection achievements
        dirt100: {
            id: 'dirt100',
            name: 'Dirt Collector',
            description: 'Collect 100 dirt',
            category: ACHIEVEMENT_CATEGORIES.COLLECTION,
            criteria: { dirt: 100 },
            reward: {
                description: '+5% click power',
                effect: { clickPower: 0.05 }
            },
            visible: true
        },
        dirt1000: {
            id: 'dirt1000',
            name: 'Dirt Hoarder',
            description: 'Collect 1,000 dirt',
            category: ACHIEVEMENT_CATEGORIES.COLLECTION,
            criteria: { dirt: 1000 },
            reward: {
                description: '+10% click power',
                effect: { clickPower: 0.1 }
            },
            visible: true
        },
        stone100: {
            id: 'stone100',
            name: 'Stone Collector',
            description: 'Collect 100 stone',
            category: ACHIEVEMENT_CATEGORIES.COLLECTION,
            criteria: { stone: 100 },
            reward: {
                description: '+5% auto-dig speed',
                effect: { autoDigSpeed: 0.05 }
            },
            visible: true
        },
        gems10: {
            id: 'gems10',
            name: 'Gem Finder',
            description: 'Collect 10 gems',
            category: ACHIEVEMENT_CATEGORIES.COLLECTION,
            criteria: { gems: 10 },
            reward: {
                description: '+5% gem find chance',
                effect: { gemChance: 0.05 }
            },
            visible: true
        },
        gems100: {
            id: 'gems100',
            name: 'Gem Connoisseur',
            description: 'Collect 100 gems',
            category: ACHIEVEMENT_CATEGORIES.COLLECTION,
            criteria: { gems: 100 },
            reward: {
                description: '+10% gem find chance',
                effect: { gemChance: 0.1 }
            },
            visible: true
        },

        // Milestone achievements
        clicks100: {
            id: 'clicks100',
            name: 'Click Enthusiast',
            description: 'Click 100 times',
            category: ACHIEVEMENT_CATEGORIES.MILESTONES,
            criteria: { clicks: 100 },
            reward: {
                description: '+5% click power',
                effect: { clickPower: 0.05 }
            },
            visible: true
        },
        clicks1000: {
            id: 'clicks1000',
            name: 'Click Master',
            description: 'Click 1,000 times',
            category: ACHIEVEMENT_CATEGORIES.MILESTONES,
            criteria: { clicks: 1000 },
            reward: {
                description: '+10% click power',
                effect: { clickPower: 0.1 }
            },
            visible: true
        },
        playTime1Hour: {
            id: 'playTime1Hour',
            name: 'Dedicated Digger',
            description: 'Play for 1 hour',
            category: ACHIEVEMENT_CATEGORIES.MILESTONES,
            criteria: { playTime: 3600 }, // 3600 seconds = 1 hour
            reward: {
                description: '+5% all resource gains',
                effect: { multiplier: 'all', amount: 0.05 }
            },
            visible: true
        },

        // Special achievements
        allToolUpgrades: {
            id: 'allToolUpgrades',
            name: 'Tool Collector',
            description: 'Purchase all tool upgrades',
            category: ACHIEVEMENT_CATEGORIES.SPECIAL,
            criteria: { 
                upgrade_shovel: 10,
                upgrade_pickaxe: 5,
                upgrade_gemDrill: 3
            },
            reward: {
                description: '+15% all resource gains',
                effect: { multiplier: 'all', amount: 0.15 }
            },
            visible: true
        },
        allAutoUpgrades: {
            id: 'allAutoUpgrades',
            name: 'Automation Expert',
            description: 'Purchase all automation upgrades',
            category: ACHIEVEMENT_CATEGORIES.SPECIAL,
            criteria: {
                upgrade_autoDigger: 10,
                upgrade_digSpeed: 5
            },
            reward: {
                description: '+20% auto-dig speed',
                effect: { autoDigSpeed: 0.2 }
            },
            visible: true
        },
        preventHazard: {
            id: 'preventHazard',
            name: 'Safety First',
            description: 'Prevent a hazard before it activates',
            category: ACHIEVEMENT_CATEGORIES.SPECIAL,
            criteria: { preventedHazards: 1 },
            reward: {
                description: '-10% hazard chance',
                effect: { hazardChance: -0.1 }
            },
            visible: true
        },
        digWhileHazard: {
            id: 'digWhileHazard',
            name: 'Living Dangerously',
            description: 'Dig 10 times during an active hazard',
            category: ACHIEVEMENT_CATEGORIES.SPECIAL,
            criteria: { hazardDigs: 10 },
            reward: {
                description: '-15% hazard duration',
                effect: { hazardDuration: -0.15 }
            },
            visible: false
        },
        secretAchievement: {
            id: 'secretAchievement',
            name: 'Meta Digger',
            description: 'Find the secret in the game code',
            category: ACHIEVEMENT_CATEGORIES.SPECIAL,
            criteria: { secretFound: true },
            reward: {
                description: 'Unlocks the "Meta" tab',
                effect: { unlockFeature: 'metaTab' }
            },
            visible: false
        }
    };

    /**
     * Initializes the achievement system
     */
    function init() {
        if (achievementsInitialized) return;

        // Register achievements with GameData
        registerAchievements();

        // Set up event listeners for achievement tracking
        setupEventListeners();

        achievementsInitialized = true;
        console.log('Achievement system initialized');
    }

    /**
     * Registers achievements with the game data system
     */
    function registerAchievements() {
        // Add achievements to GameConfig
        GameConfig.ACHIEVEMENTS = ACHIEVEMENTS;

        // Initialize achievement rewards tracking
        for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (achievement.reward) {
                achievementRewards[id] = {
                    applied: false,
                    ...achievement.reward
                };
            }
        }
    }

    /**
     * Sets up event listeners for achievement tracking
     */
    function setupEventListeners() {
        // Listen for achievement unlocks
        document.addEventListener('achievementUnlocked', function(e) {
            const achievement = e.detail.achievement;
            
            // Apply achievement reward
            applyAchievementReward(achievement.id);
            
            // Show achievement notification with reward info
            showAchievementNotification(achievement);
        });

        // Track special achievement criteria
        document.addEventListener('hazardPrevented', function(e) {
            GameData.incrementSpecialStat('preventedHazards');
        });

        document.addEventListener('digDuringHazard', function(e) {
            GameData.incrementSpecialStat('hazardDigs');
        });

        // Secret achievement trigger - listen for konami code
        let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        
        document.addEventListener('keydown', function(e) {
            // Check if the key matches the next key in the konami code
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                
                // If the full code is entered, unlock the secret achievement
                if (konamiIndex === konamiCode.length) {
                    GameData.setSpecialStat('secretFound', true);
                    konamiIndex = 0;
                }
            } else {
                // Reset if wrong key
                konamiIndex = 0;
            }
        });
    }

    /**
     * Applies the reward for an achievement
     * @param {string} achievementId - ID of the achievement
     */
    function applyAchievementReward(achievementId) {
        const reward = achievementRewards[achievementId];
        if (!reward || reward.applied) return;

        // Apply different types of rewards
        if (reward.effect) {
            if (reward.effect.resource) {
                // Add resources
                GameData.addResource(reward.effect.resource, reward.effect.amount);
            }
            
            if (reward.effect.multiplier) {
                // Add multiplier
                if (reward.effect.multiplier === 'all') {
                    GameData.addResourceMultiplier('dirt', reward.effect.amount);
                    GameData.addResourceMultiplier('stone', reward.effect.amount);
                    GameData.addResourceMultiplier('gems', reward.effect.amount);
                } else {
                    GameData.addResourceMultiplier(reward.effect.multiplier, reward.effect.amount);
                }
            }
            
            if (reward.effect.clickPower) {
                // Increase click power
                GameData.addClickPowerMultiplier(reward.effect.clickPower);
            }
            
            if (reward.effect.autoDigSpeed) {
                // Increase auto-dig speed
                GameData.addAutoDigSpeedMultiplier(reward.effect.autoDigSpeed);
            }
            
            if (reward.effect.gemChance) {
                // Increase gem find chance
                GameData.addGemChanceMultiplier(reward.effect.gemChance);
            }
            
            if (reward.effect.hazardChance) {
                // Modify hazard chance
                GameData.addHazardChanceMultiplier(reward.effect.hazardChance);
            }
            
            if (reward.effect.hazardDuration) {
                // Modify hazard duration
                GameData.addHazardDurationMultiplier(reward.effect.hazardDuration);
            }
            
            if (reward.effect.unlockFeature) {
                // Unlock special features
                GameData.unlockFeature(reward.effect.unlockFeature);
            }
        }

        // Mark reward as applied
        reward.applied = true;
    }

    /**
     * Shows an achievement notification with reward info
     * @param {Object} achievement - Achievement data
     */
    function showAchievementNotification(achievement) {
        const reward = achievementRewards[achievement.id];
        let rewardText = '';
        
        if (reward && reward.description) {
            rewardText = `<div class="notification-reward">Reward: ${reward.description}</div>`;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification-achievement';
        
        // Determine achievement type for icon
        let achievementType = achievement.category || 'progression';
        
        // Create achievement icon
        const achievementIcon = GameAssets.createAchievementIcon(achievementType, true, 40);
        
        // Add notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `
            <div class="notification-title">Achievement Unlocked!</div>
            <div class="notification-message">${achievement.name}</div>
            <div class="notification-description">${achievement.description}</div>
            ${rewardText}
        `;
        
        // Assemble notification
        const iconContainer = document.createElement('div');
        iconContainer.className = 'notification-icon';
        iconContainer.appendChild(achievementIcon);
        
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
        }, 6000); // Longer display time for achievements
    }

    /**
     * Gets all achievements, organized by category
     * @returns {Object} - Achievements organized by category
     */
    function getAchievementsByCategory() {
        const categories = {};
        
        for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
            const category = achievement.category || 'uncategorized';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                id,
                ...achievement,
                unlocked: GameData.isAchievementUnlocked(id)
            });
        }
        
        return categories;
    }

    /**
     * Gets achievement progress for a specific achievement
     * @param {string} achievementId - ID of the achievement
     * @returns {Object} - Progress data with current and target values
     */
    function getAchievementProgress(achievementId) {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return null;
        
        const progress = {};
        
        for (const [criterion, requiredValue] of Object.entries(achievement.criteria)) {
            let currentValue;
            
            // Check different types of criteria
            if (criterion === 'depth') {
                currentValue = GameData.getDepth();
            } else if (['dirt', 'stone', 'gems'].includes(criterion)) {
                currentValue = GameData.getResource(criterion);
            } else if (criterion === 'clicks') {
                currentValue = GameData.getStat('clicks');
            } else if (criterion === 'playTime') {
                currentValue = GameData.getStat('playTime');
            } else if (criterion.startsWith('upgrade_')) {
                const upgradeId = criterion.substring(8);
                currentValue = GameData.getUpgradeLevel(upgradeId);
            } else {
                // Special stats
                currentValue = GameData.getSpecialStat(criterion) || 0;
            }
            
            progress[criterion] = {
                current: currentValue,
                target: requiredValue,
                percentage: Math.min(100, Math.floor((currentValue / requiredValue) * 100))
            };
        }
        
        return progress;
    }

    /**
     * Renders the achievements panel with progress bars
     * @param {HTMLElement} container - Container element for achievements
     */
    function renderAchievementsPanel(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Get achievements by category
        const achievementsByCategory = getAchievementsByCategory();
        
        // Create category sections
        for (const [category, achievements] of Object.entries(achievementsByCategory)) {
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.className = 'achievement-category';
            categoryHeader.textContent = formatCategoryName(category);
            container.appendChild(categoryHeader);
            
            // Create achievements list
            const achievementsList = document.createElement('div');
            achievementsList.className = 'achievements-list';
            
            // Add each achievement
            achievements.forEach(achievement => {
                // Skip if not visible and not unlocked
                if (!achievement.visible && !achievement.unlocked) return;
                
                // Create achievement item
                const achievementItem = document.createElement('div');
                achievementItem.className = `achievement-item ${achievement.unlocked ? 'achievement-unlocked' : ''}`;
                achievementItem.dataset.id = achievement.id;
                
                // Get progress data
                const progress = achievement.unlocked ? null : getAchievementProgress(achievement.id);
                
                // Create achievement content
                let progressHTML = '';
                if (progress && Object.keys(progress).length > 0) {
                    // Show the first criterion's progress
                    const firstCriterion = Object.keys(progress)[0];
                    const criterionProgress = progress[firstCriterion];
                    
                    progressHTML = `
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${criterionProgress.percentage}%"></div>
                            </div>
                            <div class="progress-text">
                                ${criterionProgress.current.toLocaleString()} / ${criterionProgress.target.toLocaleString()}
                            </div>
                        </div>
                    `;
                }
                
                // Create achievement icon
                const achievementIcon = GameAssets.createAchievementIcon(
                    achievement.category || 'progression',
                    achievement.unlocked
                );
                
                // Assemble achievement item
                achievementItem.innerHTML = `
                    <div class="achievement-icon-container"></div>
                    <div class="achievement-details">
                        <div class="achievement-name">${achievement.unlocked ? achievement.name : '???'}</div>
                        <div class="achievement-description">
                            ${achievement.unlocked ? achievement.description : 'Locked achievement'}
                        </div>
                        ${progressHTML}
                        ${achievement.unlocked && achievement.reward ? 
                            `<div class="achievement-reward">Reward: ${achievement.reward.description}</div>` : ''}
                    </div>
                `;
                
                // Add icon to container
                const iconContainer = achievementItem.querySelector('.achievement-icon-container');
                iconContainer.appendChild(achievementIcon);
                
                // Add to list
                achievementsList.appendChild(achievementItem);
            });
            
            container.appendChild(achievementsList);
        }
    }

    /**
     * Formats a category name for display
     * @param {string} category - Category ID
     * @returns {string} - Formatted category name
     */
    function formatCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Public API
    return {
        init,
        ACHIEVEMENTS,
        ACHIEVEMENT_CATEGORIES,
        getAchievementsByCategory,
        getAchievementProgress,
        renderAchievementsPanel
    };
})();