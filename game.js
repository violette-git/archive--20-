/**
 * DigDeep Game - Main Game Logic
 * Handles game initialization, resource management, and UI updates
 */

// Game state
const GameState = {
    resources: {
        dirt: 0,
        stone: 0,
        copper: 0,
        iron: 0,
        gold: 0,
        diamond: 0,
        emerald: 0,
        ruby: 0,
        sapphire: 0
    },
    upgrades: {
        shovel: { level: 1, cost: 10 },
        pickaxe: { level: 0, cost: 50 },
        drill: { level: 0, cost: 200 },
        excavator: { level: 0, cost: 1000 }
    },
    consumables: [],
    specialItems: [],
    currentLayer: 0,
    maxLayer: 0,
    digPower: 1,
    autoDigInterval: null,
    lastClickTime: 0,
    clickCooldown: 200, // ms between clicks
};

// Game engine instance
const GameEngine = {
    // Initialize the game
    init: function() {
        console.log("Initializing DigDeep game...");

        // Initialize audio system
        AudioSystem.init().then(() => {
            // Start background music once audio is initialized
            AudioSystem.playMusic('miningAdventure', true);

            // Initialize audio controls
            AudioControls.init();
        }).catch(error => {
            console.error("Failed to initialize audio system:", error);
        });

        // Initialize resource icons
        this.initResourceIcons();

        // Initialize trading card UI
        this.initTradingCardUI();

        // Set up event listeners
        this.setupEventListeners();

        // Update UI
        this.updateUI();

        console.log("Game initialized successfully!");
    },

    // Initialize resource icons using SVG from assets.js
    initResourceIcons: function() {
        document.getElementById('dirt-icon').innerHTML = Assets.getResourceIcon('dirt');
        document.getElementById('stone-icon').innerHTML = Assets.getResourceIcon('stone');
        document.getElementById('copper-icon').innerHTML = Assets.getResourceIcon('copper');
        document.getElementById('iron-icon').innerHTML = Assets.getResourceIcon('iron');
        document.getElementById('gold-icon').innerHTML = Assets.getResourceIcon('gold');
        document.getElementById('diamond-icon').innerHTML = Assets.getResourceIcon('diamond');
        document.getElementById('emerald-icon').innerHTML = Assets.getResourceIcon('emerald');
        document.getElementById('ruby-icon').innerHTML = Assets.getResourceIcon('ruby');
        document.getElementById('sapphire-icon').innerHTML = Assets.getResourceIcon('sapphire');
    },

    // Initialize trading card UI
    initTradingCardUI: function() {
        // Generate upgrade cards
        this.generateUpgradeCards();

        // Generate consumable cards
        this.generateConsumableCards();

        // Generate special item cards
        this.generateSpecialCards();

        // Initialize equipped items area (placeholder)
        this.initEquippedItemsUI();
    },

    // Initialize equipped items UI (placeholder)
    initEquippedItemsUI: function() {
        const equippedContainer = document.getElementById('equipped-items-container');
        if (equippedContainer) {
            equippedContainer.innerHTML = '<h3>Equipped Items</h3>'; // Placeholder title
            // In a more complete implementation, you would populate this area
            // based on which items the user has actively equipped.
        }
    },

    

    // Generate upgrade cards
    generateUpgradeCards: function() {
        const upgradesContainer = document.getElementById('upgrades-container');
        upgradesContainer.innerHTML = '';

        // Define upgrades
        const upgrades = [
            {
                id: 'shovel',
                name: 'Shovel',
                description: 'Increases dirt collection by 1 per dig',
                costType: 'dirt',
                icon: 'shovel'
            },
            {
                id: 'pickaxe',
                name: 'Pickaxe',
                description: 'Allows mining stone and increases dig power',
                costType: 'dirt',
                icon: 'pickaxe'
            },
            {
                id: 'drill',
                name: 'Drill',
                description: 'Allows mining copper and increases dig power',
                costType: 'stone',
                icon: 'drill'
            },
            {
                id: 'excavator',
                name: 'Excavator',
                description: 'Allows mining iron and increases dig power',
                costType: 'iron',
                icon: 'excavator'
            }
        ];

        // Create cards for each upgrade
        upgrades.forEach(upgrade => {
            const card = document.createElement('div');
            card.className = 'card upgrade-card';
            card.dataset.upgradeId = upgrade.id;

            const cost = GameState.upgrades[upgrade.id].cost;
            const level = GameState.upgrades[upgrade.id].level;

            card.innerHTML = `
                <div class="card-header">
                    <h3>${upgrade.name}</h3>
                    <span class="card-level">Level ${level}</span>
                </div>
                <div class="card-icon">${Assets.getToolIcon(upgrade.icon, GameState.upgrades[upgrade.id].level)}</div>
                <div class="card-description">${upgrade.description}</div>
                <div class="card-cost">
                    <span class="resource-icon small">${Assets.getResourceIcon(upgrade.costType)}</span>
                    <span class="cost-value">${cost}</span>
                </div>
                <button class="card-button">Upgrade</button>
            `;

            // Add click event
            card.querySelector('.card-button').addEventListener('click', () => {
                this.purchaseUpgrade(upgrade.id);
            });

            upgradesContainer.appendChild(card);
        });
    },

    // Generate consumable cards
    generateConsumableCards: function() {
        const consumablesContainer = document.getElementById('consumables-container');
        consumablesContainer.innerHTML = '';

        // Define consumables
        const consumables = [
            {
                id: 'dynamite',
                name: 'Dynamite',
                description: 'Instantly dig 10 times with double power',
                cost: 50,
                costType: 'stone',
                icon: 'dynamite'
            },
            {
                id: 'coffee',
                name: 'Coffee',
                description: 'Increases dig power by 50% for 30 seconds',
                cost: 100,
                costType: 'copper',
                icon: 'coffee'
            },
            {
                id: 'magnet',
                name: 'Magnet',
                description: 'Doubles resource collection for 1 minute',
                cost: 200,
                costType: 'iron',
                icon: 'magnet'
            },
            {
                id: 'treasure_map',
                name: 'Treasure Map',
                description: 'Reveals a random rare resource',
                cost: 300,
                costType: 'gold',
                icon: 'map'
            }
        ];

        // Create cards for each consumable
        consumables.forEach(consumable => {
            const card = document.createElement('div');
            card.className = 'card consumable-card';
            card.dataset.consumableId = consumable.id;

            const isOwned = GameState.consumables.includes(consumable.id);
            const ownershipStatus = isOwned ? '<span class="owned-indicator">Owned</span>' : '';

            card.innerHTML = `
                <div class="card-header">
                    <h3>${consumable.name}</h3>
                    ${ownershipStatus}
                </div>
                <div class="card-icon">${Assets.getConsumableIcon(consumable.icon)}</div>
                <div class="card-description">${consumable.description}</div>
                <div class="card-cost">
                    <span class="resource-icon small">${Assets.getResourceIcon(consumable.costType)}</span>
                    <span class="cost-value">${consumable.cost}</span>
                </div>
                ${isOwned ? '<button class="card-button use-button">Use</button>' : '<button class="card-button purchase-button">Purchase</button>'}
            `;

            // Add click event for purchase
            const purchaseButton = card.querySelector('.purchase-button');
            if (purchaseButton) {
                purchaseButton.addEventListener('click', () => {
                    this.purchaseConsumable(consumable.id);
                });
            }

            // Add click event for use
            const useButton = card.querySelector('.use-button');
            if (useButton) {
                useButton.addEventListener('click', () => {
                    this.useConsumable(consumable.id);
                });
            }

            consumablesContainer.appendChild(card);
        });
    },

    // Generate special item cards
    generateSpecialCards: function() {
        const specialContainer = document.getElementById('special-container');
        specialContainer.innerHTML = '';

        // Define special items
        const specialItems = [
            {
                id: 'auto_digger',
                name: 'Auto Digger',
                description: 'Automatically digs once every 5 seconds',
                cost: 500,
                costType: 'copper',
                icon: 'auto_digger'
            },
            {
                id: 'gem_detector',
                name: 'Gem Detector',
                description: 'Increases chance of finding rare gems by 25%',
                cost: 1000,
                costType: 'gold',
                icon: 'gem_detector'
            },
            {
                id: 'lucky_charm',
                name: 'Lucky Charm',
                description: 'Increases all resource collection by 10%',
                cost: 2000,
                costType: 'diamond',
                icon: 'lucky_charm'
            },
            {
                id: 'time_warp',
                name: 'Time Warp',
                description: 'Reduces cooldown between digs by 50%',
                cost: 5000,
                costType: 'emerald',
                icon: 'time_warp'
            }
        ];

        // Create cards for each special item
        specialItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card special-card';
            card.dataset.itemId = item.id;

            card.innerHTML = `
                <div class="card-header">
                    <h3>${item.name}</h3>
                </div>
                <div class="card-icon">${Assets.getSpecialIcon(item.icon)}</div>
                <div class="card-description">${item.description}</div>
                <div class="card-cost">
                    <span class="resource-icon small">${Assets.getResourceIcon(item.costType)}</span>
                    <span class="cost-value">${item.cost}</span>
                </div>
                <button class="card-button">Purchase</button>
            `;

            // Add click event
            card.querySelector('.card-button').addEventListener('click', () => {
                this.purchaseSpecialItem(item.id);
            });

            specialContainer.appendChild(card);
        });
    },

    // Set up event listeners
    setupEventListeners: function() {
        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                // Play click sound
                AudioSystem.playSound('click');

                // Get tab ID
                const tabId = button.dataset.tab;

                // Remove active class from all tabs and content
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                // Add active class to selected tab and content
                button.classList.add('active');
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });

        // Digging area click event for click-anywhere functionality
        document.getElementById('digging-area').addEventListener('click', (e) => {
            // Get click position relative to digging area
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check cooldown
            const now = Date.now();
            if (now - GameState.lastClickTime < GameState.clickCooldown) {
                return;
            }
            GameState.lastClickTime = now;

            // Perform dig at click position
            this.dig(x, y);

            // Create visual effect at click position
            this.createDigEffect(x, y);
        });

        // Dig button click event
        document.getElementById('dig-button').addEventListener('click', () => {
            // Check cooldown
            const now = Date.now();
            if (now - GameState.lastClickTime < GameState.clickCooldown) {
                return;
            }
            GameState.lastClickTime = now;

            // Get random position in digging area
            const diggingArea = document.getElementById('digging-area');
            const x = Math.random() * diggingArea.offsetWidth;
            const y = Math.random() * diggingArea.offsetHeight;

            // Perform dig
            this.dig(x, y);

            // Create visual effect
            this.createDigEffect(x, y);
        });

        // Tutorial next button
        document.getElementById('tutorial-next').addEventListener('click', () => {
            // Play click sound
            AudioSystem.playSound('click');

            document.getElementById('tutorial-overlay').style.display = 'none';
        });
    },

    // Dig function with coordinates for click-anywhere functionality
    dig: function(x, y) {
        console.log("Digging...");

        // Play digging sound
        AudioSystem.playSound('dig');

        // Calculate dig power based on upgrades
        let digPower = GameState.digPower;

        // Add resources based on current layer and dig power
        this.addResource('dirt', digPower);

        // Add stone if pickaxe is unlocked
        if (GameState.upgrades.pickaxe.level > 0) {
            this.addResource('stone', Math.floor(digPower * 0.5));
        }

        // Add copper if drill is unlocked
        if (GameState.upgrades.drill.level > 0) {
            this.addResource('copper', Math.floor(digPower * 0.2));
        }

        // Add iron if excavator is unlocked
        if (GameState.upgrades.excavator.level > 0) {
            this.addResource('iron', Math.floor(digPower * 0.1));
        }

        // Check for rare resources
        this.checkForRareResources(digPower);

        // Update UI
        this.updateUI();
    },

    // Create visual digging effect
    createDigEffect: function(x, y) {
        // Create dig mark
        const digMark = document.createElement('div');
        digMark.className = 'dig-mark';
        digMark.style.left = `${x}px`;
        digMark.style.top = `${y}px`;

        // Add to digging area
        document.getElementById('digging-area').appendChild(digMark);

        // Create particles
        this.createParticles(x, y);

        // Remove dig mark after animation
        setTimeout(() => {
            digMark.remove();
        }, 2000);
    },

    // Create particle effects
    createParticles: function(x, y) {
        const particleCount = 8;
        const diggingArea = document.getElementById('digging-area');

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position offset
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;

            // Set initial position
            particle.style.left = `${x + offsetX}px`;
            particle.style.top = `${y + offsetY}px`;

            // Random movement
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 30;
            const duration = 500 + Math.random() * 1000;

            const targetX = x + Math.cos(angle) * distance;
            const targetY = y + Math.sin(angle) * distance;

            // Add to digging area
            diggingArea.appendChild(particle);

            // Animate particle
            setTimeout(() => {
                particle.style.left = `${targetX}px`;
                particle.style.top = `${targetY}px`;
                particle.style.opacity = '0';
            }, 10);

            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, duration);
        }
    },

    // Add resources to inventory
    addResource: function(type, amount) {
        if (amount <= 0) return;

        GameState.resources[type] += amount;

        // Update counter
        document.getElementById(`${type}-counter`).textContent = GameState.resources[type];
    },

    // Collect resource at specific position (for click-anywhere functionality)
    collectResource: function(type, amount, x, y) {
        // Add small bonus for direct collection
        const bonusAmount = Math.max(1, Math.floor(amount * 0.1));
        GameState.resources[type] += bonusAmount;

        // Play collect sound
        AudioSystem.playSound('collect');

        // Update counter
        document.getElementById(`${type}-counter`).textContent = GameState.resources[type];

        // Create resource gain animation at click position
        const gainElement = document.createElement('div');
        gainElement.className = `resource-gain resource-${type}`;
        gainElement.textContent = `+${bonusAmount}`;
        gainElement.style.left = `${x}px`;
        gainElement.style.top = `${y}px`;

        document.body.appendChild(gainElement);

        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        document.body.appendChild(ripple);

        // Remove elements after animation
        setTimeout(() => {
            gainElement.remove();
            ripple.remove();
        }, 2000);
    },

    // Check for rare resources
    checkForRareResources: function(digPower) {
        // Gold has a 5% chance per dig power
        if (Math.random() < 0.05 * digPower) {
            this.addResource('gold', 1);

            // Play collect sound for rare resource
            AudioSystem.playSound('collect');
        }

        // Diamond has a 1% chance per dig power
        if (Math.random() < 0.01 * digPower) {
            this.addResource('diamond', 1);

            // Play collect sound for rare resource
            AudioSystem.playSound('collect');
        }
    },

    // Purchase upgrade
    purchaseUpgrade: function(upgradeId) {
        const upgrade = GameState.upgrades[upgradeId];

        // Check if player can afford the upgrade
        if (!this.canAffordUpgrade(upgradeId)) {
            console.log(`Cannot afford ${upgradeId} upgrade`);
            return;
        }

        // Play purchase sound
        AudioSystem.playSound('purchase');

        // Determine cost type based on upgrade
        let costType = 'dirt';
        if (upgradeId === 'drill') costType = 'stone';
        if (upgradeId === 'excavator') costType = 'iron';

        // Deduct resources
        GameState.resources[costType] -= upgrade.cost;

        // Increase upgrade level
        upgrade.level++;

        // Increase cost for next level
        upgrade.cost = Math.floor(upgrade.cost * 1.5);

        // Apply upgrade effects
        this.applyUpgradeEffects(upgradeId);

        // Update UI
        this.updateUI();

        console.log(`Purchased ${upgradeId} upgrade (Level ${upgrade.level})`);
    },

    // Check if player can afford upgrade
    canAffordUpgrade: function(upgradeId) {
        const upgrade = GameState.upgrades[upgradeId];
        let costType = 'dirt';

        if (upgradeId === 'drill') costType = 'stone';
        if (upgradeId === 'excavator') costType = 'iron';

        return GameState.resources[costType] >= upgrade.cost;
    },

    // Apply effects of upgrades
    applyUpgradeEffects: function(upgradeId) {
        const level = GameState.upgrades[upgradeId].level;

        switch (upgradeId) {
            case 'shovel':
                GameState.digPower = 1 + level;
                break;
            case 'pickaxe':
                // Pickaxe unlocks stone and increases dig power
                GameState.digPower += 1;
                break;
            case 'drill':
                // Drill unlocks copper and increases dig power
                GameState.digPower += 2;
                break;
            case 'excavator':
                // Excavator unlocks iron and increases dig power
                GameState.digPower += 3;
                break;
        }
    },

    // Purchase consumable
    purchaseConsumable: function(consumableId) {
        // Define consumable costs
        const consumableCosts = {
            'dynamite': { amount: 50, type: 'stone' },
            'coffee': { amount: 100, type: 'copper' },
            'magnet': { amount: 200, type: 'iron' },
            'treasure_map': { amount: 300, type: 'gold' }
        };

        const cost = consumableCosts[consumableId];

        // Check if player can afford the consumable
        if (GameState.resources[cost.type] < cost.amount) {
            console.log(`Cannot afford ${consumableId}`);
            return;
        }

        // Play purchase sound
        AudioSystem.playSound('purchase');

        // Deduct resources
        GameState.resources[cost.type] -= cost.amount;

        // Add consumable to inventory
        GameState.consumables.push(consumableId);

        // Update UI
        this.updateUI();

        console.log(`Purchased ${consumableId}`);

        // Optionally use the consumable immediately after purchase
        // this.useConsumable(consumableId);
        this.generateConsumableCards(); // Re-render to update button to "Use"
    },

    // Use consumable
    useConsumable: function(consumableId) {
        // Play click sound
        AudioSystem.playSound('click');

        // Apply consumable effects
        switch (consumableId) {
            case 'dynamite':
                // Dynamite: Instantly dig 10 times with double power
                for (let i = 0; i < 10; i++) {
                    const diggingArea = document.getElementById('digging-area');
                    const x = Math.random() * diggingArea.offsetWidth;
                    const y = Math.random() * diggingArea.offsetHeight;

                    // Double dig power temporarily
                    const originalDigPower = GameState.digPower;
                    GameState.digPower *= 2;

                    // Perform dig
                    this.dig(x, y);

                    // Create visual effect
                    this.createDigEffect(x, y);

                    // Restore original dig power
                    GameState.digPower = originalDigPower;
                }
                break;

            case 'coffee':
                // Coffee: Increases dig power by 50% for 30 seconds
                const originalDigPower = GameState.digPower;
                GameState.digPower = Math.floor(GameState.digPower * 1.5);

                // Create notification
                this.createNotification('Coffee boost active! Dig power increased by 50% for 30 seconds.');

                // Reset after 30 seconds
                setTimeout(() => {
                    GameState.digPower = originalDigPower;
                    this.createNotification('Coffee boost has worn off.');
                }, 30000);
                break;

            case 'magnet':
                // Magnet: Doubles resource collection for 1 minute
                // Implementation would require modifying the resource collection logic
                this.createNotification('Magnet active! Resource collection doubled for 1 minute.');

                // Reset after 1 minute
                setTimeout(() => {
                    this.createNotification('Magnet has worn off.');
                }, 60000);
                break;

            case 'treasure_map':
                // Treasure Map: Reveals a random rare resource
                const rareResources = ['gold', 'diamond', 'emerald', 'ruby', 'sapphire'];
                const randomResource = rareResources[Math.floor(Math.random() * rareResources.length)];
                const amount = Math.floor(Math.random() * 5) + 1;

                this.addResource(randomResource, amount);
                this.createNotification(`Treasure map revealed ${amount} ${randomResource}!`);
                break;
        }

        // Remove consumable from inventory after use
        const index = GameState.consumables.indexOf(consumableId);
        if (index !== -1) {
            GameState.consumables.splice(index, 1);
        }
        this.generateConsumableCards(); // Re-render to update button to "Purchase"
    },

    // Purchase special item
    purchaseSpecialItem: function(itemId) {
        // Define special item costs
        const specialItemCosts = {
            'auto_digger': { amount: 500, type: 'copper' },
            'gem_detector': { amount: 1000, type: 'gold' },
            'lucky_charm': { amount: 2000, type: 'diamond' },
            'time_warp': { amount: 5000, type: 'emerald' }
        };

        const cost = specialItemCosts[itemId];

        // Check if player can afford the special item
        if (GameState.resources[cost.type] < cost.amount) {
            console.log(`Cannot afford ${itemId}`);
            return;
        }

        // Check if player already has the special item
        if (GameState.specialItems.includes(itemId)) {
            console.log(`Already have ${itemId}`);
            return;
        }

        // Play purchase sound
        AudioSystem.playSound('purchase');

        // Deduct resources
        GameState.resources[cost.type] -= cost.amount;

        // Add special item to inventory
        GameState.specialItems.push(itemId);

        // Apply special item effect
        this.applySpecialItemEffect(itemId);

        // Update UI
        this.updateUI();

        console.log(`Purchased ${itemId}`);
    },

    // Apply special item effect
    applySpecialItemEffect: function(itemId) {
        switch (itemId) {
            case 'auto_digger':
                // Auto Digger: Automatically digs once every 5 seconds
                if (GameState.autoDigInterval) {
                    clearInterval(GameState.autoDigInterval);
                }

                GameState.autoDigInterval = setInterval(() => {
                    // Get random position in digging area
                    const diggingArea = document.getElementById('digging-area');
                    const x = Math.random() * diggingArea.offsetWidth;
                    const y = Math.random() * diggingArea.offsetHeight;

                    // Perform dig
                    this.dig(x, y);

                    // Create visual effect
                    this.createDigEffect(x, y);
                }, 5000);

                this.createNotification('Auto Digger activated! Automatically digging every 5 seconds.');
                break;

            case 'gem_detector':
                // Gem Detector: Increases chance of finding rare gems by 25%
                // This would require modifying the checkForRareResources function
                this.createNotification('Gem Detector activated! Increased chance of finding rare gems.');
                break;

            case 'lucky_charm':
                // Lucky Charm: Increases all resource collection by 10%
                // This would require modifying the resource collection logic
                this.createNotification('Lucky Charm activated! Resource collection increased by 10%.');
                break;

            case 'time_warp':
                // Time Warp: Reduces cooldown between digs by 50%
                GameState.clickCooldown = Math.floor(GameState.clickCooldown * 0.5);
                this.createNotification('Time Warp activated! Cooldown between digs reduced by 50%.');
                break;
        }
    },

    

    // Create notification
    createNotification: function(message) {
        const container = document.getElementById('notification-container');

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        container.appendChild(notification);

        // Play click sound for notification
        AudioSystem.playSound('click');

        // Remove notification after delay
        setTimeout(() => {
            notification.classList.add('fade-out');

            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    },

    updateHeaderConsumables: function() {
        const consumableSlots = document.getElementById('consumable-slots');
        consumableSlots.innerHTML = ''; // Clear existing content

        const ownedConsumables = GameState.consumables; // Adjust based on your data structure

        ownedConsumables.forEach(consumableId => {
            const consumableData = data.consumables.find(c => c.id === consumableId);
            if (consumableData) {
                const consumableItem = document.createElement('div');
                consumableItem.classList.add('consumable-item');

                const icon = document.createElement('div');
                icon.classList.add('consumable-icon-header');
                icon.style.backgroundImage = `url('${Assets.getConsumableIcon(consumableData.icon)}')`;
                consumableItem.appendChild(icon);

                const triggerButton = document.createElement('button');
                triggerButton.classList.add('consumable-trigger-button');
                triggerButton.textContent = 'Use';
                triggerButton.addEventListener('click', () => {
                    console.log(`Triggered consumable: ${consumableData.name}`);
                    // Implement logic to use the consumable (e.g., GameEngine.useConsumable(consumableId);)
                });
                consumableItem.appendChild(triggerButton);

                consumableSlots.appendChild(consumableItem);
            }
        });
    },

    updateHeaderUpgrades: function() {
        const upgradeLevelsHeader = document.getElementById('upgrade-levels-header');
        upgradeLevelsHeader.innerHTML = ''; // Clear previous content
    
        for (const upgradeId in GameState.upgrades) {
            const upgrade = GameState.upgrades[upgradeId];
            if (upgrade.level > 0) {
                const upgradeConfig = GameConfig.UPGRADES[upgradeId];
                if (upgradeConfig && upgradeConfig.category === GameConfig.UPGRADE_CATEGORIES.TOOLS) {
                    const upgradeItem = document.createElement('div');
                    upgradeItem.classList.add('upgrade-level-indicator');
    
                    const icon = document.createElement('img');
                    icon.classList.add('upgrade-icon');
                    const svgString = Assets.getToolIcon(upgradeConfig.id, upgrade.level); // Use Assets.getToolIcon here
                    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
                    icon.src = svgDataUrl;
                    upgradeItem.appendChild(icon);
    
                    const levelIndicator = document.createElement('span');
                    levelIndicator.classList.add('upgrade-level-indicator-header');
                    levelIndicator.textContent = `Lv. ${upgrade.level}`;
                    upgradeItem.appendChild(levelIndicator);
    
                    upgradeLevelsHeader.appendChild(upgradeItem);
    
                    console.log('Upgrade ID:', upgradeConfig.id);
                    console.log('SVG String:', svgString);
                    console.log('SVG Data URL:', svgDataUrl);
                }
            }
        }
    },

    

    // Update UI
    updateUI: function() {
        // Update resource counters
        for (const resource in GameState.resources) {
            const counter = document.getElementById(`${resource}-counter`);
            if (counter) {
                counter.textContent = GameState.resources[resource];
            }
        }

        // Update upgrade cards
        this.generateUpgradeCards();

        // Update layer indicator
        document.getElementById('layer-indicator').textContent = `Layer: ${GameState.currentLayer}`;
        this.updateHeaderConsumables();
        this.updateHeaderUpgrades();
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    GameEngine.init();
});