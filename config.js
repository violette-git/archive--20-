/**
 * Game Configuration
 * Contains all game parameters, upgrade definitions, and balance settings
 */
const GameConfig = (function() {
    'use strict';

    // Base game parameters
    const BASE_PARAMS = {
        // Click mechanics
        baseClickPower: 1,
        clickCooldown: 200, // ms
        clickFeedbackDuration: 300, // ms
        
        // Resource generation
        baseDirtChance: 0.8,
        baseStoneChance: 0.15,
        baseGemChance: 0.05,
        
        // Depth progression
        depthPerDig: 0.1, // meters per dig
        layerThickness: 100, // meters per layer
        
        // Auto-dig mechanics
        baseAutoDigInterval: 1000, // ms
        
        // Currency display
        currencyAnimationDuration: 500, // ms
        
        // Game loop
        tickInterval: 100, // ms
        saveInterval: 30000, // ms
        
        // Starting values
        startingDirt: 0,
        startingStone: 0,
        startingGems: 0
    };
    
    // Upgrade categories
    const UPGRADE_CATEGORIES = {
        TOOLS: 'tools',
        AUTOMATION: 'automation',
        SPECIAL: 'special'
    };
    
    // Upgrade definitions
    const UPGRADES = {
        // Active tools (improve manual clicking)
        shovel: {
            id: 'shovel',
            name: 'Better Shovel',
            description: 'Increases clicking power',
            category: UPGRADE_CATEGORIES.TOOLS,
            maxLevel: 10,
            baseCost: { dirt: 10 },
            costScaling: 1.5,
            effect: {
                clickPower: level => level + 1 // Level 1 = 2x power, Level 2 = 3x power, etc.
            },
            requirements: { depth: 0 }
        },
        pickaxe: {
            id: 'pickaxe',
            name: 'Pickaxe',
            description: 'Increases stone collection chance',
            category: UPGRADE_CATEGORIES.TOOLS,
            maxLevel: 5,
            baseCost: { dirt: 50, stone: 10 },
            costScaling: 1.8,
            effect: {
                stoneChance: level => 0.15 + (level * 0.05) // +5% per level
            },
            requirements: { depth: 10 }
        },
        gemDrill: {
            id: 'gemDrill',
            name: 'Gem Drill',
            description: 'Increases gem collection chance',
            category: UPGRADE_CATEGORIES.TOOLS,
            maxLevel: 3,
            baseCost: { dirt: 200, stone: 50 },
            costScaling: 2.0,
            effect: {
                gemChance: level => 0.05 + (level * 0.03) // +3% per level
            },
            requirements: { depth: 25 }
        },
        
        // Automation upgrades (passive income)
        autoDigger: {
            id: 'autoDigger',
            name: 'Auto-Digger',
            description: 'Automatically digs once per second',
            category: UPGRADE_CATEGORIES.AUTOMATION,
            maxLevel: 10,
            baseCost: { dirt: 100, stone: 20 },
            costScaling: 1.6,
            effect: {
                autoDigPower: level => level // Level = number of auto-digs per interval
            },
            requirements: { depth: 15 }
        },
        digSpeed: {
            id: 'digSpeed',
            name: 'Dig Speed',
            description: 'Increases auto-dig frequency',
            category: UPGRADE_CATEGORIES.AUTOMATION,
            maxLevel: 5,
            baseCost: { dirt: 300, stone: 75, gems: 5 },
            costScaling: 1.7,
            effect: {
                autoDigInterval: level => 1000 / (1 + (level * 0.2)) // Reduces interval by 20% per level
            },
            requirements: { 
                depth: 30,
                upgrades: { autoDigger: 1 }
            }
        },
        
        // Special upgrades
        depthScanner: {
            id: 'depthScanner',
            name: 'Depth Scanner',
            description: 'Shows hazards before they appear',
            category: UPGRADE_CATEGORIES.SPECIAL,
            maxLevel: 1,
            baseCost: { dirt: 500, stone: 100, gems: 10 },
            costScaling: 1.0,
            effect: {
                hazardWarning: level => level > 0 // Boolean effect
            },
            requirements: { depth: 50 }
        },
        reinforcedGear: {
            id: 'reinforcedGear',
            name: 'Reinforced Gear',
            description: 'Reduces hazard penalties by 50%',
            category: UPGRADE_CATEGORIES.SPECIAL,
            maxLevel: 1,
            baseCost: { dirt: 800, stone: 200, gems: 20 },
            costScaling: 1.0,
            effect: {
                hazardReduction: level => level > 0 ? 0.5 : 0 // 50% reduction when owned
            },
            requirements: { depth: 75 }
        }
    };
    
    // Hazard definitions
    const HAZARDS = {
        caveIn: {
            id: 'caveIn',
            name: 'Cave In',
            description: 'Loose rocks are falling!',
            minDepth: 20, // Minimum depth for this hazard to appear
            baseChance: 0.05, // Base chance per tick at minimum depth
            chanceIncrease: 0.0001, // Increase in chance per meter of depth
            penalty: {
                dirt: 0.1, // Lose 10% of dirt
                stone: 0.05 // Lose 5% of stone
            },
            duration: 10000, // ms until auto-resolved
            warningTime: 5000 // ms of warning before hazard activates
        },
        gasLeak: {
            id: 'gasLeak',
            name: 'Gas Leak',
            description: 'Toxic gas is leaking in!',
            minDepth: 50,
            baseChance: 0.03,
            chanceIncrease: 0.0002,
            penalty: {
                autoDigPower: 0.5 // Reduces auto-dig power by 50%
            },
            duration: 15000,
            warningTime: 7000
        },
        lavaFlow: {
            id: 'lavaFlow',
            name: 'Lava Flow',
            description: 'Molten lava is approaching!',
            minDepth: 100,
            baseChance: 0.02,
            chanceIncrease: 0.0003,
            penalty: {
                dirt: 0.2,
                stone: 0.1,
                gems: 0.05
            },
            duration: 20000,
            warningTime: 10000
        }
    };
    
    // Achievement definitions
    const ACHIEVEMENTS = {
        firstDig: {
            id: 'firstDig',
            name: 'First Dig',
            description: 'Make your first dig',
            criteria: { clicks: 1 }
        },
        digMaster: {
            id: 'digMaster',
            name: 'Dig Master',
            description: 'Reach 100 manual digs',
            criteria: { clicks: 100 }
        },
        dirtCollector: {
            id: 'dirtCollector',
            name: 'Dirt Collector',
            description: 'Collect 1,000 dirt',
            criteria: { dirt: 1000 }
        },
        stoneCollector: {
            id: 'stoneCollector',
            name: 'Stone Collector',
            description: 'Collect 500 stone',
            criteria: { stone: 500 }
        },
        gemCollector: {
            id: 'gemCollector',
            name: 'Gem Collector',
            description: 'Collect 100 gems',
            criteria: { gems: 100 }
        },
        depthExplorer10: {
            id: 'depthExplorer10',
            name: 'Surface Digger',
            description: 'Reach 10 meters depth',
            criteria: { depth: 10 }
        },
        depthExplorer50: {
            id: 'depthExplorer50',
            name: 'Cave Explorer',
            description: 'Reach 50 meters depth',
            criteria: { depth: 50 }
        },
        depthExplorer100: {
            id: 'depthExplorer100',
            name: 'Deep Diver',
            description: 'Reach 100 meters depth',
            criteria: { depth: 100 }
        }
    };
    
    // Layer definitions (different ground types as you dig deeper)
    const LAYERS = {
        surface: {
            name: 'Surface',
            depthStart: 0,
            depthEnd: 10,
            dirtMultiplier: 1.0,
            stoneMultiplier: 0.5,
            gemMultiplier: 0.2,
            color: '#8B4513' // Brown
        },
        topsoil: {
            name: 'Topsoil',
            depthStart: 10,
            depthEnd: 30,
            dirtMultiplier: 1.2,
            stoneMultiplier: 0.8,
            gemMultiplier: 0.3,
            color: '#654321' // Darker brown
        },
        clay: {
            name: 'Clay Layer',
            depthStart: 30,
            depthEnd: 60,
            dirtMultiplier: 1.5,
            stoneMultiplier: 1.0,
            gemMultiplier: 0.5,
            color: '#A0522D' // Sienna
        },
        limestone: {
            name: 'Limestone',
            depthStart: 60,
            depthEnd: 100,
            dirtMultiplier: 1.0,
            stoneMultiplier: 1.5,
            gemMultiplier: 0.8,
            color: '#D2B48C' // Tan
        },
        bedrock: {
            name: 'Bedrock',
            depthStart: 100,
            depthEnd: 150,
            dirtMultiplier: 0.8,
            stoneMultiplier: 2.0,
            gemMultiplier: 1.0,
            color: '#696969' // Dim gray
        },
        crystalCave: {
            name: 'Crystal Cave',
            depthStart: 150,
            depthEnd: 200,
            dirtMultiplier: 0.5,
            stoneMultiplier: 1.5,
            gemMultiplier: 2.0,
            color: '#4B0082' // Indigo
        }
    };
    
    // Public API
    return {
        BASE_PARAMS,
        UPGRADE_CATEGORIES,
        UPGRADES,
        HAZARDS,
        ACHIEVEMENTS,
        LAYERS,
        
        // Helper methods
        getUpgradesByCategory: function(category) {
            return Object.values(UPGRADES).filter(upgrade => upgrade.category === category);
        },
        
        getLayerAtDepth: function(depth) {
            return Object.values(LAYERS).find(layer => 
                depth >= layer.depthStart && depth < layer.depthEnd
            ) || LAYERS.surface; // Default to surface if no match
        },
        
        calculateUpgradeCost: function(upgradeId, currentLevel) {
            const upgrade = UPGRADES[upgradeId];
            if (!upgrade) return null;
            
            const costMultiplier = Math.pow(upgrade.costScaling, currentLevel);
            const costs = {};
            
            for (const [resource, baseCost] of Object.entries(upgrade.baseCost)) {
                costs[resource] = Math.floor(baseCost * costMultiplier);
            }
            
            return costs;
        },
        
        isHazardActive: function(depth, hazardId) {
            const hazard = HAZARDS[hazardId];
            if (!hazard || depth < hazard.minDepth) return false;
            
            const depthFactor = depth - hazard.minDepth;
            return hazard.baseChance + (depthFactor * hazard.chanceIncrease);
        }
    };
})();