# Dig Deep: Incremental Mining Adventure

![Dig Deep Logo](logo.png)

Dig Deep is an incremental clicker game where players dig deeper and deeper into the earth, collecting resources, discovering secrets, and upgrading their equipment along the way. How deep can you go?

## Table of Contents

- [Game Overview](#game-overview)
- [Features](#features)
- [Installation and Running](#installation-and-running)
- [How to Play](#how-to-play)
- [Code Architecture](#code-architecture)
- [Extending the Game](#extending-the-game)
  - [Adding New Upgrades](#adding-new-upgrades)
  - [Adding New Achievements](#adding-new-achievements)
  - [Adding New Content](#adding-new-content)
  - [Adding New Layers](#adding-new-layers)
- [Testing](#testing)
- [Future Improvements](#future-improvements)
- [Credits and Acknowledgments](#credits-and-acknowledgments)
- [License](#license)

## Game Overview

Dig Deep is a browser-based incremental clicker game with a mining theme. Players start at the surface and dig deeper by clicking the "DIG!" button. As they dig, they collect resources like dirt, stone, and gems, which can be used to purchase upgrades that make digging faster and more efficient.

The deeper you go, the more valuable resources you'll find, but also the more hazards you'll encounter. Manage your resources wisely to prevent hazards and continue your journey to the center of the earth!

## Features

- **Resource Collection**: Collect dirt, stone, and gems as you dig deeper
- **Upgrade System**: Purchase upgrades to improve your digging efficiency
- **Layer System**: Discover different layers of earth with unique properties
- **Hazard System**: Encounter and manage hazards that threaten your progress
- **Achievement System**: Unlock achievements for special bonuses
- **Random Events**: Experience random events and discoveries as you dig
- **Auto-Digging**: Unlock automation to dig without clicking
- **Save System**: Automatically save your progress with manual save/load options
- **Export/Import**: Back up your save data or transfer between devices

## Installation and Running

### Local Installation

1. Clone the repository or download the source code:
   ```
   git clone https://github.com/yourusername/dig-deep.git
   ```

2. Navigate to the game directory:
   ```
   cd dig-deep
   ```

3. Open `index.html` in your web browser:
   - Double-click the file in your file explorer, or
   - Use a local development server like Python's built-in server:
     ```
     python -m http.server
     ```
     Then open `http://localhost:8000` in your browser

### Playing Online

You can also play the game online at [digdeep.example.com](https://digdeep.example.com) (Note: This is a placeholder URL)

## How to Play

1. **Start Digging**: Click the "DIG!" button to start collecting resources
2. **Purchase Upgrades**: Spend your resources on upgrades to improve your digging efficiency
3. **Manage Hazards**: As you dig deeper, you'll encounter hazards that can slow your progress. Spend resources to prevent them
4. **Discover Secrets**: Find special discoveries and unlock achievements as you dig deeper
5. **Automate**: Purchase auto-diggers to continue progress even when you're not actively clicking

## Code Architecture

Dig Deep is built using vanilla JavaScript with a modular architecture. The game is organized into several key modules:

### Core Modules

- **game.js**: Main game initialization and UI event handling
- **engine.js**: Core game mechanics and logic
- **data.js**: Game state management and persistence
- **config.js**: Game parameters and balance settings

### Feature Modules

- **achievements.js**: Achievement system and rewards
- **content.js**: Meta content, flavor text, and special discoveries
- **save_system.js**: Enhanced save/load functionality with import/export
- **tutorial.js**: Tutorial and help system for new players

### UI and Assets

- **assets.js**: Visual elements and animations
- **style.css**: Main game styling
- **save_system.css**: Styling for save/load UI elements
- **tutorial.css**: Styling for tutorial system

### Data Flow

The game follows a unidirectional data flow:

1. User actions (clicks, purchases) are captured by event listeners in `game.js`
2. These actions are processed by `engine.js`, which updates the game state in `data.js`
3. State changes trigger events that update the UI
4. The save system periodically persists the game state to localStorage

## Extending the Game

Dig Deep is designed to be easily extensible. Here's how to add new content to the game:

### Adding New Upgrades

To add a new upgrade, open `config.js` and add a new entry to the `UPGRADES` object:

```javascript
newUpgrade: {
    id: 'newUpgrade',
    name: 'New Upgrade Name',
    description: 'Description of what this upgrade does',
    category: UPGRADE_CATEGORIES.TOOLS, // Choose an appropriate category
    maxLevel: 5, // Maximum level the upgrade can reach
    baseCost: { dirt: 100, stone: 20 }, // Base cost of the upgrade
    costScaling: 1.5, // How much the cost increases per level
    effect: {
        // Define the effect of this upgrade
        clickPower: level => level * 0.1 // Increases click power by 10% per level
    },
    requirements: { 
        depth: 50, // Minimum depth required to see this upgrade
        upgrades: { someOtherUpgrade: 2 } // Required upgrades and their levels
    }
}
```

### Adding New Achievements

To add a new achievement, open `achievements.js` and add a new entry to the `ACHIEVEMENTS` object:

```javascript
newAchievement: {
    id: 'newAchievement',
    name: 'Achievement Name',
    description: 'Description of the achievement',
    category: ACHIEVEMENT_CATEGORIES.PROGRESSION, // Choose an appropriate category
    criteria: { depth: 300 }, // Criteria for unlocking the achievement
    reward: {
        description: '+10% gem find chance',
        effect: { gemChance: 0.1 } // Effect applied when achievement is unlocked
    },
    visible: true // Whether the achievement is visible before being unlocked
}
```

### Adding New Content

To add new random events or discoveries, open `content.js` and add entries to the appropriate arrays:

For random events:
```javascript
{
    id: 'newEvent',
    name: "New Event Name",
    description: "Description of the event",
    minDepth: 100, // Minimum depth for this event to occur
    maxDepth: 200, // Maximum depth for this event to occur
    probability: 0.03, // Probability of the event occurring
    variants: [
        {
            name: "Event Variant",
            description: "Description of this variant",
            reward: { resource: 'gems', amount: 15 } // Reward for this variant
        }
    ]
}
```

For special discoveries:
```javascript
{
    id: 'newDiscovery',
    name: "New Discovery Name",
    description: "Description of the discovery",
    depth: 150, // Target depth for this discovery
    depthRange: 5, // Range around the target depth
    reward: { gems: 50, stone: 200 }, // Rewards for finding this discovery
    found: false // Initial state (always false)
}
```

### Adding New Layers

To add a new layer of earth, open `config.js` and add a new entry to the `LAYERS` object:

```javascript
newLayer: {
    name: 'New Layer Name',
    depthStart: 200, // Starting depth of this layer
    depthEnd: 250, // Ending depth of this layer
    dirtMultiplier: 0.5, // Multiplier for dirt found in this layer
    stoneMultiplier: 2.0, // Multiplier for stone found in this layer
    gemMultiplier: 1.5, // Multiplier for gems found in this layer
    color: '#A52A2A' // Color of this layer in the digging area
}
```

## Testing

The game has been thoroughly tested for functionality, performance, and balance:

- **Functionality Testing**: All game mechanics have been verified to work as expected
- **Performance Testing**: The game has been optimized to run smoothly even with many upgrades and long play sessions
- **Balance Testing**: Resource generation, upgrade costs, and progression have been balanced for an engaging experience
- **Save System Testing**: The save/load system has been tested to ensure all game state is properly preserved

## Future Improvements

Some potential areas for future development:

- **More Resources**: Add additional resource types for more complex upgrade paths
- **Prestige System**: Add a prestige mechanic for long-term replayability
- **Offline Progress**: Calculate resources gained while the game was closed
- **Mobile Optimization**: Improve the mobile experience with touch-friendly controls
- **Sound Effects**: Add audio feedback for digging, upgrades, and achievements
- **Cloud Saves**: Implement cloud save functionality for cross-device play

## Credits and Acknowledgments

- **Game Design & Development**: [Your Name]
- **Inspiration**: Inspired by incremental games like Cookie Clicker, Universal Paperclips, and Clicker Heroes
- **Font**: Russo One and Roboto from Google Fonts
- **Special Thanks**: To all the testers who provided valuable feedback during development

## License

This project is licensed under the MIT License - see the LICENSE file for details.