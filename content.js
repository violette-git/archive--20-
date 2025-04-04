/**
 * Content.js - Meta content and flavor text for Dig Deep
 * Contains humorous references, random events, and flavor text
 */

const GameContent = (function() {
    'use strict';

    // Private variables
    let contentInitialized = false;
    let lastRandomEventTime = 0;
    let discoveredItems = [];
    
    /**
     * Content categories
     */
    const CONTENT_CATEGORIES = {
        FLAVOR_TEXT: 'flavorText',
        RANDOM_EVENTS: 'randomEvents',
        DISCOVERIES: 'discoveries',
        META_REFERENCES: 'metaReferences'
    };
    
    /**
     * Flavor text for different game elements
     */
    const FLAVOR_TEXT = {
        // Upgrade flavor text
        upgrades: {
            shovel: [
                "It's not just a shovel, it's an earth displacement tool.",
                "Now with 20% more shoveling capacity!",
                "Ergonomically designed for the discerning digger.",
                "The handle is made of genuine artificial wood substitute.",
                "Guaranteed to increase your dirt-to-effort ratio."
            ],
            pickaxe: [
                "Pointy on one end, flat on the other. Revolutionary!",
                "Geologists hate this one weird tool!",
                "For when dirt just isn't hard enough.",
                "Not to be confused with an ice axe. Trust us on this one.",
                "60% of the time, it works every time."
            ],
            gemDrill: [
                "Diamonds are forever, but this drill warranty is only 30 days.",
                "Warning: May cause excessive gem hoarding.",
                "It's not the size of the drill, it's how you use it.",
                "Powered by hopes, dreams, and a surprisingly efficient motor.",
                "As seen on 'Extreme Gem Hoarders' Season 4!"
            ],
            autoDigger: [
                "It digs while you sleep! (Sleep not included)",
                "Set it and forget it! (Until it breaks)",
                "Now you can dig without actually digging!",
                "Automation: Because clicking is so last millennium.",
                "Contains at least 37 moving parts. We think."
            ],
            digSpeed: [
                "GOTTA DIG FAST!",
                "Now with 200% more RPM (Rocks Per Minute)!",
                "Warning: May cause time-space distortion in digging area.",
                "Powered by pure caffeinated digging energy.",
                "Legally distinct from any hedgehog-related speed references."
            ],
            depthScanner: [
                "It scans for depth! Or is it scanning deeply? We forget.",
                "Detects hazards using advanced technology (a very long stick).",
                "Comes with complementary 'I Survived The Deep' bumper sticker.",
                "Powered by the tears of previous diggers.",
                "60% more accurate than guessing!"
            ],
            reinforcedGear: [
                "Now with extra reinforcement in the reinforced areas!",
                "Tested against simulated cave-ins, lava, and angry moles.",
                "Safety third! Wait, that's not right...",
                "Includes emergency snack compartment.",
                "As worn by professional diggers in at least one alternate universe."
            ]
        },
        
        // Layer flavor text
        layers: {
            surface: [
                "Ah, the surface. Where people who fear the deep live.",
                "The least interesting part of your digging journey.",
                "Contains 74% less adventure than deeper layers.",
                "Home to such wonders as: grass, more grass, and dirt."
            ],
            topsoil: [
                "Rich in nutrients and disappointed earthworms.",
                "9 out of 10 gardeners recommend stopping here.",
                "Still getting cell reception? Not for long!",
                "Contains the remnants of countless picnics."
            ],
            clay: [
                "Perfect for pottery and clogging your equipment!",
                "Sticky, yet somehow also crumbly.",
                "Ancient civilizations used this to make pots. You're using it to make a mess.",
                "Warning: May cause sudden pottery hobby interest."
            ],
            limestone: [
                "Home to fossils and regrets of ancient creatures.",
                "Caution: May contain unexpected caves and existential dread.",
                "Formed over millions of years just so you could dig through it.",
                "Geologists describe this layer as 'pretty neat, I guess'."
            ],
            bedrock: [
                "The game developer thought you'd never get this far.",
                "Technically not the bottom. There's no bottom. Keep digging.",
                "Ancient miners called this 'the hard stuff'. Creative bunch.",
                "Warranty void if digging beyond this point."
            ],
            crystalCave: [
                "Ooh, shiny! Try not to get distracted.",
                "These crystals took millions of years to form. You'll break them in seconds.",
                "Geologists would be crying right now.",
                "Contains exactly 12% more magic than scientifically possible."
            ]
        },
        
        // Resource flavor text
        resources: {
            dirt: [
                "It's dirt. What did you expect?",
                "Technically, it's 'soil' if you're fancy.",
                "Contains millions of microorganisms. You monster.",
                "9 out of 10 earthworms recommend this dirt.",
                "Guaranteed to be at least 90% not rocks."
            ],
            stone: [
                "Like dirt but with commitment issues.",
                "Nature's way of saying 'stop digging here'.",
                "May contain traces of... more stone.",
                "Geologists get unreasonably excited about this stuff.",
                "Not to be confused with The Rock. Much less charismatic."
            ],
            gems: [
                "Shiny rocks that humans decided are valuable.",
                "Warning: May cause dragon attacks.",
                "Perfect for impressing people with more money than sense.",
                "Compressed carbon never looked so good!",
                "Statistically contains at least one atom from a dinosaur."
            ]
        },
        
        // Hazard flavor text
        hazards: {
            caveIn: [
                "The ground above you is having second thoughts.",
                "Gravity: 1, Your Tunnel: 0",
                "This is why we can't have nice underground things.",
                "Those support beams were just decorative, right?"
            ],
            gasLeak: [
                "That's not new dig energy you're smelling.",
                "Who said mining needed breathable air anyway?",
                "Reminds you of that bean burrito you had for lunch.",
                "Nature's way of saying 'ventilation is important'."
            ],
            lavaFlow: [
                "The floor is literally lava now.",
                "Spicy orange juice approaching!",
                "Earth's way of saying 'too deep, go back'.",
                "On the bright side, great for marshmallow roasting."
            ]
        }
    };
    
    /**
     * Random events that can occur while digging
     */
    const RANDOM_EVENTS = [
        {
            id: 'fossil',
            name: "Fossil Discovery",
            description: "You've discovered ancient remains of a prehistoric creature!",
            minDepth: 20,
            maxDepth: 100,
            probability: 0.05,
            variants: [
                {
                    name: "Trilobite Fossil",
                    description: "A perfectly preserved trilobite. It's giving you a judgmental look from 500 million years ago.",
                    reward: { resource: 'gems', amount: 5 }
                },
                {
                    name: "Dinosaur Tooth",
                    description: "A T-Rex tooth! Or possibly from your neighbor's overly aggressive chihuahua.",
                    reward: { resource: 'gems', amount: 10 }
                },
                {
                    name: "Mysterious Bone",
                    description: "Scientists would call this an important discovery. You call it a weird-looking stick.",
                    reward: { resource: 'stone', amount: 50 }
                }
            ]
        },
        {
            id: 'cavern',
            name: "Hidden Cavern",
            description: "You've broken through into a natural underground cavern!",
            minDepth: 40,
            maxDepth: 180,
            probability: 0.03,
            variants: [
                {
                    name: "Crystal Grotto",
                    description: "A small cavern lined with beautiful crystals. Instagram would love this.",
                    reward: { resource: 'gems', amount: 15 }
                },
                {
                    name: "Underground Lake",
                    description: "A serene underground lake. Probably not filled with blind cave monsters. Probably.",
                    reward: { resource: 'stone', amount: 100 }
                },
                {
                    name: "Fungal Garden",
                    description: "A cavern filled with bioluminescent fungi. Lick them and you might see through time! (Don't actually lick them)",
                    reward: { resource: 'dirt', amount: 200 }
                }
            ]
        },
        {
            id: 'artifact',
            name: "Ancient Artifact",
            description: "You've discovered something left behind by ancient civilizations!",
            minDepth: 30,
            maxDepth: 120,
            probability: 0.04,
            variants: [
                {
                    name: "Clay Tablet",
                    description: "Ancient writing that translates to 'Extended warranty: 5000 years or your money back'",
                    reward: { resource: 'dirt', amount: 150 }
                },
                {
                    name: "Golden Idol",
                    description: "Should you take it? Do you hear ominous boulder sounds?",
                    reward: { resource: 'gems', amount: 20 }
                },
                {
                    name: "Ancient Game Console",
                    description: "An ancient entertainment device. Still has 'Half-Life 3 Confirmed' scratched on the back.",
                    reward: { resource: 'stone', amount: 75 }
                }
            ]
        },
        {
            id: 'timeAnomaly',
            name: "Temporal Anomaly",
            description: "You've hit a strange pocket of distorted time!",
            minDepth: 100,
            maxDepth: 200,
            probability: 0.02,
            variants: [
                {
                    name: "Time Acceleration",
                    description: "Everything is moving faster! Your auto-diggers work at double speed for 30 seconds.",
                    effect: { type: 'autoDigSpeed', multiplier: 2, duration: 30 }
                },
                {
                    name: "Resource Echo",
                    description: "Resources from the future are echoing back to you! Double resources for the next 10 digs.",
                    effect: { type: 'resourceMultiplier', multiplier: 2, duration: 10 }
                },
                {
                    name: "Quantum Entanglement",
                    description: "Your shovel exists in multiple states simultaneously. Click power tripled for 20 seconds!",
                    effect: { type: 'clickPower', multiplier: 3, duration: 20 }
                }
            ]
        },
        {
            id: 'visitor',
            name: "Underground Visitor",
            description: "You're not alone down here!",
            minDepth: 50,
            maxDepth: 150,
            probability: 0.03,
            variants: [
                {
                    name: "Friendly Mole",
                    description: "A mole with tiny spectacles offers digging advice. How does he see down here anyway?",
                    reward: { resource: 'dirt', amount: 100 }
                },
                {
                    name: "Lost Miner",
                    description: "A miner from 1849 who took a REALLY wrong turn. He trades old-timey wisdom for a way out.",
                    reward: { resource: 'stone', amount: 50 }
                },
                {
                    name: "Subterranean Researcher",
                    description: "A scientist studying underground ecosystems. She's very excited to add 'human digger' to her observation notes.",
                    effect: { type: 'clickPower', multiplier: 1.5, duration: 60 }
                }
            ]
        }
    ];
    
    /**
     * Special discoveries that can be found at specific depths
     */
    const SPECIAL_DISCOVERIES = [
        {
            id: 'dinosaurSkeleton',
            name: "Complete Dinosaur Skeleton",
            description: "A perfectly preserved dinosaur skeleton! Scientists will be amazed... or would be, if you weren't going to sell it for resources.",
            depth: 85,
            depthRange: 5,
            reward: { gems: 50, stone: 200 },
            found: false
        },
        {
            id: 'undergroundCity',
            name: "Abandoned Underground City",
            description: "An entire city built underground! The architecture suggests it was built by a civilization with a serious fear of sunlight and a love of unnecessarily complex tunnel systems.",
            depth: 120,
            depthRange: 8,
            reward: { gems: 100, stone: 500, dirt: 300 },
            found: false
        },
        {
            id: 'alienArtifact',
            name: "Mysterious Alien Artifact",
            description: "A strange device of clearly non-human origin. It hums when you get close and displays incomprehensible symbols. Probably just a alien coffee maker.",
            depth: 175,
            depthRange: 10,
            reward: { gems: 200 },
            effect: { type: 'clickPower', multiplier: 2, permanent: true },
            found: false
        },
        {
            id: 'coreFragment',
            name: "Earth's Core Fragment",
            description: "A small piece of the Earth's core. It's warm to the touch and seems to bend reality around it slightly. Probably fine to keep in your pocket.",
            depth: 199,
            depthRange: 1,
            reward: { gems: 500 },
            effect: { type: 'allResourceMultiplier', multiplier: 2, permanent: true },
            found: false
        }
    ];
    
    /**
     * Meta references and fourth-wall breaking content
     */
    const META_REFERENCES = [
        {
            id: 'developerNote',
            name: "Developer's Note",
            description: "A crumpled note that reads: 'If you're reading this, we've been stuck in the game code for days. Send help and coffee.'",
            minDepth: 50,
            probability: 0.01
        },
        {
            id: 'gameCode',
            name: "Exposed Game Code",
            description: "You've dug so deep you've hit the game's source code! A comment reads: 'TODO: Fix this before players reach this depth'",
            minDepth: 150,
            probability: 0.01
        },
        {
            id: 'playerReference',
            name: "Player Reference",
            description: "A mirror showing your reflection. Wait, how did the game know what you look like? Are you being watched?",
            minDepth: 100,
            probability: 0.01
        },
        {
            id: 'incrementalJoke',
            name: "Incremental Game Joke",
            description: "You've found a sign that reads: 'In case of exponential resource growth, break glass'. The glass is already broken.",
            minDepth: 75,
            probability: 0.01
        },
        {
            id: 'fourthWall',
            name: "Fourth Wall Crack",
            description: "There's a crack in reality here. Through it, you can see someone staring at a screen, controlling your every move. They look just as confused as you are.",
            minDepth: 120,
            probability: 0.01
        }
    ];
    
    /**
     * Internet culture references
     */
    const INTERNET_REFERENCES = [
        {
            id: 'digDog',
            name: "Dig Dog",
            description: "You've found a dog digging alongside you. 'Much depth. Very dig. Wow.'",
            minDepth: 30,
            probability: 0.02
        },
        {
            id: 'rickroll',
            name: "Mysterious Music Box",
            description: "You've found an ancient music box. It starts playing: 'Never gonna dig you up, never gonna let you down...'",
            minDepth: 60,
            probability: 0.02
        },
        {
            id: 'allYourBase',
            name: "Strange Transmission",
            description: "Your depth scanner picks up a transmission: 'All your base are belong to us.' What could it mean?",
            minDepth: 90,
            probability: 0.02
        },
        {
            id: 'thisIsFine',
            name: "Calm Miner",
            description: "You find a miner calmly sipping coffee as lava approaches. 'This is fine,' he assures you.",
            minDepth: 120,
            probability: 0.02
        },
        {
            id: 'nyanCat',
            name: "Underground Rainbow",
            description: "A rainbow-trailing cat flies past you underground. Physics has questions.",
            minDepth: 150,
            probability: 0.02
        }
    ];

    /**
     * Initializes the content system
     */
    function init() {
        if (contentInitialized) return;
        
        // Set up event listeners
        setupEventListeners();
        
        contentInitialized = true;
        console.log('Game content system initialized');
    }
    
    /**
     * Sets up event listeners for content triggers
     */
    function setupEventListeners() {
        // Listen for dig events to trigger random content
        document.addEventListener('digCompleted', function(e) {
            const depth = e.detail.depth;
            checkForRandomEvent(depth);
            checkForSpecialDiscovery(depth);
        });
        
        // Listen for layer changes to show flavor text
        document.addEventListener('layerChanged', function(e) {
            const layer = e.detail.layer;
            showLayerFlavorText(layer);
        });
        
        // Listen for upgrade purchases to show flavor text
        document.addEventListener('upgradeChanged', function(e) {
            const upgradeId = e.detail.id;
            const level = e.detail.level;
            showUpgradeFlavorText(upgradeId, level);
        });
    }
    
    /**
     * Checks if a random event should trigger
     * @param {number} depth - Current depth
     */
    function checkForRandomEvent(depth) {
        // Limit how often random events can occur
        const now = Date.now();
        if (now - lastRandomEventTime < 30000) return; // 30 second cooldown
        
        // Check each random event
        for (const event of RANDOM_EVENTS) {
            // Check depth requirements
            if (depth < event.minDepth || depth > event.maxDepth) continue;
            
            // Check probability
            if (Math.random() > event.probability) continue;
            
            // Event triggered!
            triggerRandomEvent(event);
            lastRandomEventTime = now;
            return;
        }
        
        // Check for meta references (less common)
        if (Math.random() < 0.005) { // 0.5% chance
            const validReferences = META_REFERENCES.filter(ref => depth >= ref.minDepth);
            if (validReferences.length > 0) {
                const reference = validReferences[Math.floor(Math.random() * validReferences.length)];
                triggerMetaReference(reference);
                lastRandomEventTime = now;
                return;
            }
        }
        
        // Check for internet culture references (less common)
        if (Math.random() < 0.005) { // 0.5% chance
            const validReferences = INTERNET_REFERENCES.filter(ref => depth >= ref.minDepth);
            if (validReferences.length > 0) {
                const reference = validReferences[Math.floor(Math.random() * validReferences.length)];
                triggerInternetReference(reference);
                lastRandomEventTime = now;
                return;
            }
        }
    }
    
    /**
     * Checks if a special discovery should trigger
     * @param {number} depth - Current depth
     */
    function checkForSpecialDiscovery(depth) {
        for (const discovery of SPECIAL_DISCOVERIES) {
            // Skip if already found
            if (discovery.found) continue;
            
            // Check if within depth range
            if (Math.abs(depth - discovery.depth) <= discovery.depthRange) {
                // Discovery found!
                triggerSpecialDiscovery(discovery);
                discovery.found = true;
                return;
            }
        }
    }
    
    /**
     * Triggers a random event
     * @param {Object} event - Random event data
     */
    function triggerRandomEvent(event) {
        // Select a random variant
        const variant = event.variants[Math.floor(Math.random() * event.variants.length)];
        
        // Create event notification
        showEventNotification(event.name, variant.description, 'event');
        
        // Apply rewards or effects
        if (variant.reward) {
            for (const [resource, amount] of Object.entries(variant.reward)) {
                GameData.addResource(resource, amount);
            }
        }
        
        if (variant.effect) {
            applyEventEffect(variant.effect);
        }
        
        // Dispatch event
        const eventDetail = new CustomEvent('randomEventTriggered', {
            detail: { 
                event: event.id,
                variant: variant.name
            }
        });
        document.dispatchEvent(eventDetail);
    }
    
    /**
     * Triggers a special discovery
     * @param {Object} discovery - Special discovery data
     */
    function triggerSpecialDiscovery(discovery) {
        // Add to discovered items
        discoveredItems.push(discovery.id);
        
        // Create discovery notification
        showEventNotification(discovery.name, discovery.description, 'discovery');
        
        // Apply rewards
        if (discovery.reward) {
            for (const [resource, amount] of Object.entries(discovery.reward)) {
                GameData.addResource(resource, amount);
            }
        }
        
        // Apply effects
        if (discovery.effect) {
            applyEventEffect(discovery.effect);
        }
        
        // Dispatch event
        const eventDetail = new CustomEvent('specialDiscoveryFound', {
            detail: { discovery: discovery.id }
        });
        document.dispatchEvent(eventDetail);
    }
    
    /**
     * Triggers a meta reference
     * @param {Object} reference - Meta reference data
     */
    function triggerMetaReference(reference) {
        // Create meta notification
        showEventNotification(reference.name, reference.description, 'meta');
        
        // Dispatch event
        const eventDetail = new CustomEvent('metaReferenceFound', {
            detail: { reference: reference.id }
        });
        document.dispatchEvent(eventDetail);
    }
    
    /**
     * Triggers an internet culture reference
     * @param {Object} reference - Internet reference data
     */
    function triggerInternetReference(reference) {
        // Create internet culture notification
        showEventNotification(reference.name, reference.description, 'internet');
        
        // Dispatch event
        const eventDetail = new CustomEvent('internetReferenceFound', {
            detail: { reference: reference.id }
        });
        document.dispatchEvent(eventDetail);
    }
    
    /**
     * Shows layer flavor text when changing layers
     * @param {Object} layer - Layer data
     */
    function showLayerFlavorText(layer) {
        const layerName = layer.name.toLowerCase();
        let flavorTexts = [];
        
        // Find matching flavor texts
        for (const [key, texts] of Object.entries(FLAVOR_TEXT.layers)) {
            if (layerName.includes(key)) {
                flavorTexts = texts;
                break;
            }
        }
        
        // If no specific texts found, use generic ones
        if (flavorTexts.length === 0) {
            flavorTexts = [
                `You've reached the ${layer.name} layer. Keep digging!`,
                `${layer.name}: Where the digging gets interesting.`,
                `Welcome to ${layer.name}. Mind the gap.`,
                `${layer.name}: Not as tasty as cake layers.`
            ];
        }
        
        // Select a random flavor text
        const flavorText = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];
        
        // Add flavor text to layer notification
        const layerEvent = new CustomEvent('layerFlavorText', {
            detail: { 
                layer: layer.name,
                flavorText: flavorText
            }
        });
        document.dispatchEvent(layerEvent);
    }
    
    /**
     * Shows upgrade flavor text when purchasing upgrades
     * @param {string} upgradeId - ID of the upgrade
     * @param {number} level - New level of the upgrade
     */
    function showUpgradeFlavorText(upgradeId, level) {
        let flavorTexts = FLAVOR_TEXT.upgrades[upgradeId];
        
        // If no specific texts found, use generic ones
        if (!flavorTexts || flavorTexts.length === 0) {
            flavorTexts = [
                "This upgrade makes things better. Somehow.",
                "Guaranteed to improve something by some amount!",
                "The manufacturer disclaims all responsibility for side effects.",
                "As seen on late-night shopping channels!",
                "60% of the time, it works every time."
            ];
        }
        
        // Select a flavor text based on level (cycle through them)
        const flavorText = flavorTexts[(level - 1) % flavorTexts.length];
        
        // Dispatch flavor text event
        const flavorEvent = new CustomEvent('upgradeFlavorText', {
            detail: { 
                upgradeId: upgradeId,
                level: level,
                flavorText: flavorText
            }
        });
        document.dispatchEvent(flavorEvent);
    }
    
    /**
     * Shows an event notification
     * @param {string} title - Event title
     * @param {string} message - Event message
     * @param {string} type - Event type
     */
    function showEventNotification(title, message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Create icon based on type
        let icon;
        switch (type) {
            case 'event':
                icon = createEventIcon();
                break;
            case 'discovery':
                icon = createDiscoveryIcon();
                break;
            case 'meta':
                icon = createMetaIcon();
                break;
            case 'internet':
                icon = createInternetIcon();
                break;
            default:
                icon = document.createElement('div');
        }
        
        // Add notification content
        const content = document.createElement('div');
        content.className = 'notification-content';
        content.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        // Assemble notification
        const iconContainer = document.createElement('div');
        iconContainer.className = 'notification-icon';
        iconContainer.appendChild(icon);
        
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
        }, 8000); // Longer display time for events
    }
    
    /**
     * Creates an icon for random events
     * @returns {HTMLElement} - Event icon
     */
    function createEventIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("viewBox", "0 0 40 40");
        
        // Create exclamation mark icon
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "20");
        circle.setAttribute("cy", "20");
        circle.setAttribute("r", "18");
        circle.setAttribute("fill", "#FFD700");
        circle.setAttribute("stroke", "#000");
        circle.setAttribute("stroke-width", "2");
        
        const exclamation = document.createElementNS("http://www.w3.org/2000/svg", "path");
        exclamation.setAttribute("d", "M20,10 L20,25 M20,30 L20,32");
        exclamation.setAttribute("stroke", "#000");
        exclamation.setAttribute("stroke-width", "4");
        exclamation.setAttribute("stroke-linecap", "round");
        
        svg.appendChild(circle);
        svg.appendChild(exclamation);
        
        return svg;
    }
    
    /**
     * Creates an icon for special discoveries
     * @returns {HTMLElement} - Discovery icon
     */
    function createDiscoveryIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("viewBox", "0 0 40 40");
        
        // Create treasure chest icon
        const chest = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        chest.setAttribute("x", "8");
        chest.setAttribute("y", "15");
        chest.setAttribute("width", "24");
        chest.setAttribute("height", "15");
        chest.setAttribute("fill", "#8B4513");
        chest.setAttribute("stroke", "#000");
        chest.setAttribute("stroke-width", "2");
        
        const lid = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lid.setAttribute("d", "M5,15 L35,15 L32,8 L8,8 Z");
        lid.setAttribute("fill", "#A0522D");
        lid.setAttribute("stroke", "#000");
        lid.setAttribute("stroke-width", "2");
        
        const lock = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        lock.setAttribute("x", "18");
        lock.setAttribute("y", "13");
        lock.setAttribute("width", "4");
        lock.setAttribute("height", "6");
        lock.setAttribute("fill", "#FFD700");
        lock.setAttribute("stroke", "#000");
        lock.setAttribute("stroke-width", "1");
        
        svg.appendChild(chest);
        svg.appendChild(lid);
        svg.appendChild(lock);
        
        return svg;
    }
    
    /**
     * Creates an icon for meta references
     * @returns {HTMLElement} - Meta icon
     */
    function createMetaIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("viewBox", "0 0 40 40");
        
        // Create broken fourth wall icon
        const wall = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        wall.setAttribute("x", "5");
        wall.setAttribute("y", "5");
        wall.setAttribute("width", "30");
        wall.setAttribute("height", "30");
        wall.setAttribute("fill", "#CCCCCC");
        wall.setAttribute("stroke", "#000");
        wall.setAttribute("stroke-width", "2");
        
        const crack1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        crack1.setAttribute("d", "M20,5 L15,20 L25,25 L20,35");
        crack1.setAttribute("fill", "none");
        crack1.setAttribute("stroke", "#000");
        crack1.setAttribute("stroke-width", "2");
        
        const crack2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        crack2.setAttribute("d", "M15,20 L5,18 M25,25 L35,28");
        crack2.setAttribute("fill", "none");
        crack2.setAttribute("stroke", "#000");
        crack2.setAttribute("stroke-width", "2");
        
        svg.appendChild(wall);
        svg.appendChild(crack1);
        svg.appendChild(crack2);
        
        return svg;
    }
    
    /**
     * Creates an icon for internet culture references
     * @returns {HTMLElement} - Internet icon
     */
    function createInternetIcon() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "40");
        svg.setAttribute("viewBox", "0 0 40 40");
        
        // Create internet meme icon
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "20");
        circle.setAttribute("cy", "20");
        circle.setAttribute("r", "15");
        circle.setAttribute("fill", "#FFCC00");
        circle.setAttribute("stroke", "#000");
        circle.setAttribute("stroke-width", "2");
        
        const eye1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        eye1.setAttribute("cx", "14");
        eye1.setAttribute("cy", "15");
        eye1.setAttribute("r", "3");
        eye1.setAttribute("fill", "#FFF");
        eye1.setAttribute("stroke", "#000");
        eye1.setAttribute("stroke-width", "1");
        
        const eye2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        eye2.setAttribute("cx", "26");
        eye2.setAttribute("cy", "15");
        eye2.setAttribute("r", "3");
        eye2.setAttribute("fill", "#FFF");
        eye2.setAttribute("stroke", "#000");
        eye2.setAttribute("stroke-width", "1");
        
        const pupil1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pupil1.setAttribute("cx", "14");
        pupil1.setAttribute("cy", "15");
        pupil1.setAttribute("r", "1");
        pupil1.setAttribute("fill", "#000");
        
        const pupil2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pupil2.setAttribute("cx", "26");
        pupil2.setAttribute("cy", "15");
        pupil2.setAttribute("r", "1");
        pupil2.setAttribute("fill", "#000");
        
        const smile = document.createElementNS("http://www.w3.org/2000/svg", "path");
        smile.setAttribute("d", "M14,25 Q20,30 26,25");
        smile.setAttribute("fill", "none");
        smile.setAttribute("stroke", "#000");
        smile.setAttribute("stroke-width", "2");
        smile.setAttribute("stroke-linecap", "round");
        
        svg.appendChild(circle);
        svg.appendChild(eye1);
        svg.appendChild(eye2);
        svg.appendChild(pupil1);
        svg.appendChild(pupil2);
        svg.appendChild(smile);
        
        return svg;
    }
    
    /**
     * Applies an effect from an event
     * @param {Object} effect - Effect data
     */
    function applyEventEffect(effect) {
        // Apply different types of effects
        switch (effect.type) {
            case 'clickPower':
                GameData.addTemporaryMultiplier('clickPower', effect.multiplier, effect.duration || 30, effect.permanent);
                break;
                
            case 'autoDigSpeed':
                GameData.addTemporaryMultiplier('autoDigSpeed', effect.multiplier, effect.duration || 30, effect.permanent);
                break;
                
            case 'resourceMultiplier':
                GameData.addTemporaryMultiplier('resourceMultiplier', effect.multiplier, effect.duration || 30, effect.permanent);
                break;
                
            case 'allResourceMultiplier':
                GameData.addTemporaryMultiplier('dirt', effect.multiplier, effect.duration || 30, effect.permanent);
                GameData.addTemporaryMultiplier('stone', effect.multiplier, effect.duration || 30, effect.permanent);
                GameData.addTemporaryMultiplier('gems', effect.multiplier, effect.duration || 30, effect.permanent);
                break;
        }
    }
    
    /**
     * Gets a random flavor text for a resource
     * @param {string} resource - Resource type
     * @returns {string} - Random flavor text
     */
    function getResourceFlavorText(resource) {
        const texts = FLAVOR_TEXT.resources[resource];
        if (!texts || texts.length === 0) return '';
        
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    /**
     * Gets a random flavor text for a hazard
     * @param {string} hazardType - Hazard type
     * @returns {string} - Random flavor text
     */
    function getHazardFlavorText(hazardType) {
        const texts = FLAVOR_TEXT.hazards[hazardType];
        if (!texts || texts.length === 0) return '';
        
        return texts[Math.floor(Math.random() * texts.length)];
    }
    
    /**
     * Gets all discovered special items
     * @returns {Array} - Array of discovered item IDs
     */
    function getDiscoveredItems() {
        return [...discoveredItems];
    }

    // Public API
    return {
        init,
        FLAVOR_TEXT,
        RANDOM_EVENTS,
        SPECIAL_DISCOVERIES,
        META_REFERENCES,
        INTERNET_REFERENCES,
        getResourceFlavorText,
        getHazardFlavorText,
        getDiscoveredItems
    };
})();