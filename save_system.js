/**
 * Save System for Dig Deep
 * Handles saving, loading, auto-saving, and import/export functionality
 */

const SaveSystem = (function() {
    'use strict';

    // Private variables
    let autoSaveInterval = null;
    let lastAutoSave = 0;
    const AUTO_SAVE_INTERVAL = 60000; // 60 seconds
    const SAVE_VERSION = '1.0.0';
    const SAVE_KEY = 'digDeepSave';

    /**
     * Initializes the save system
     */
    function init() {
        // Set up auto-save
        startAutoSave();
        
        // Set up event listeners for manual save/load
        setupEventListeners();
        
        console.log('Save system initialized');
    }

    /**
     * Sets up event listeners for save system
     */
    function setupEventListeners() {
        // Listen for game state changes that should trigger a save
        document.addEventListener('resourceUpdated', checkAutoSave);
        document.addEventListener('depthUpdated', checkAutoSave);
        document.addEventListener('upgradeChanged', checkAutoSave);
        document.addEventListener('achievementUnlocked', checkAutoSave);
        document.addEventListener('specialDiscoveryFound', checkAutoSave);
        
        // Add save/load buttons to the UI
        addSaveLoadButtons();
    }

    /**
     * Adds save/load buttons to the game UI
     */
    function addSaveLoadButtons() {
        // Create save/load container
        const saveLoadContainer = document.createElement('div');
        saveLoadContainer.className = 'save-load-container';
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.className = 'save-button';
        saveButton.innerHTML = '<span class="save-icon">💾</span> Save Game';
        saveButton.addEventListener('click', function() {
            showSaveConfirmation();
        });
        
        // Create load button
        const loadButton = document.createElement('button');
        loadButton.className = 'load-button';
        loadButton.innerHTML = '<span class="load-icon">📂</span> Load Game';
        loadButton.addEventListener('click', function() {
            showLoadConfirmation();
        });
        
        // Create export button
        const exportButton = document.createElement('button');
        exportButton.className = 'export-button';
        exportButton.innerHTML = '<span class="export-icon">📤</span> Export Save';
        exportButton.addEventListener('click', function() {
            exportSave();
        });
        
        // Create import button
        const importButton = document.createElement('button');
        importButton.className = 'import-button';
        importButton.innerHTML = '<span class="import-icon">📥</span> Import Save';
        importButton.addEventListener('click', function() {
            showImportDialog();
        });
        
        // Add buttons to container
        saveLoadContainer.appendChild(saveButton);
        saveLoadContainer.appendChild(loadButton);
        saveLoadContainer.appendChild(exportButton);
        saveLoadContainer.appendChild(importButton);
        
        // Add container to the game header
        const gameHeader = document.querySelector('.game-header');
        if (gameHeader) {
            gameHeader.appendChild(saveLoadContainer);
        }
    }

    /**
     * Shows a confirmation dialog for saving the game
     */
    function showSaveConfirmation() {
        showConfirmationDialog(
            'Save Game',
            'Are you sure you want to save your game? This will overwrite any previous save.',
            'Save',
            'Cancel',
            function() {
                saveGame();
                showNotification('Game Saved', 'Your game has been saved successfully.', 'success');
            }
        );
    }

    /**
     * Shows a confirmation dialog for loading the game
     */
    function showLoadConfirmation() {
        showConfirmationDialog(
            'Load Game',
            'Are you sure you want to load your saved game? Any unsaved progress will be lost.',
            'Load',
            'Cancel',
            function() {
                if (loadGame()) {
                    showNotification('Game Loaded', 'Your saved game has been loaded successfully.', 'success');
                } else {
                    showNotification('Load Failed', 'No saved game found or the save file is corrupted.', 'error');
                }
            }
        );
    }

    /**
     * Shows a generic confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {string} confirmText - Text for confirm button
     * @param {string} cancelText - Text for cancel button
     * @param {Function} onConfirm - Function to call on confirmation
     */
    function showConfirmationDialog(title, message, confirmText, cancelText, onConfirm) {
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        
        // Create dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>${title}</h3>
            </div>
            <div class="dialog-content">
                <p>${message}</p>
            </div>
            <div class="dialog-buttons">
                <button class="dialog-button dialog-button-cancel">${cancelText}</button>
                <button class="dialog-button dialog-button-confirm">${confirmText}</button>
            </div>
        `;
        
        // Add event listeners
        const confirmButton = dialog.querySelector('.dialog-button-confirm');
        const cancelButton = dialog.querySelector('.dialog-button-cancel');
        
        confirmButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
            if (onConfirm) onConfirm();
        });
        
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // Add dialog to overlay
        overlay.appendChild(dialog);
        
        // Add overlay to body
        document.body.appendChild(overlay);
    }

    /**
     * Shows a notification message
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
     * Starts the auto-save system
     */
    function startAutoSave() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
        }
        
        autoSaveInterval = setInterval(function() {
            saveGame(true);
        }, AUTO_SAVE_INTERVAL);
        
        console.log('Auto-save started');
    }

    /**
     * Stops the auto-save system
     */
    function stopAutoSave() {
        if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            autoSaveInterval = null;
        }
        
        console.log('Auto-save stopped');
    }

    /**
     * Checks if auto-save should be triggered
     */
    function checkAutoSave() {
        const now = Date.now();
        
        // Only auto-save if enough time has passed since last save
        if (now - lastAutoSave > AUTO_SAVE_INTERVAL) {
            saveGame(true);
        }
    }

    /**
     * Saves the game
     * @param {boolean} isAutoSave - Whether this is an auto-save
     * @returns {boolean} - Whether the save was successful
     */
    function saveGame(isAutoSave = false) {
        try {
            // Get complete game state
            const gameState = getCompleteGameState();
            
            // Add save metadata
            gameState.saveMetadata = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                isAutoSave: isAutoSave
            };
            
            // Save to localStorage
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
            
            // Update last auto-save time
            lastAutoSave = Date.now();
            
            // Dispatch event
            const event = new CustomEvent('gameSaved', {
                detail: { isAutoSave: isAutoSave }
            });
            document.dispatchEvent(event);
            
            if (!isAutoSave) {
                console.log('Game saved manually');
            }
            
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            
            if (!isAutoSave) {
                showNotification('Save Failed', 'Failed to save the game. Please try again.', 'error');
            }
            
            return false;
        }
    }

    /**
     * Loads the game
     * @returns {boolean} - Whether the load was successful
     */
    function loadGame() {
        try {
            const savedGame = localStorage.getItem(SAVE_KEY);
            if (!savedGame) return false;
            
            const savedState = JSON.parse(savedGame);
            
            // Check save version compatibility
            if (!savedState.saveMetadata || !isVersionCompatible(savedState.saveMetadata.version)) {
                showNotification(
                    'Incompatible Save',
                    'The save file is from an incompatible version of the game.',
                    'error'
                );
                return false;
            }
            
            // Load the game state
            loadCompleteGameState(savedState);
            
            // Dispatch event
            const event = new CustomEvent('gameLoaded');
            document.dispatchEvent(event);
            
            console.log('Game loaded');
            return true;
        } catch (e) {
            console.error('Failed to load game:', e);
            showNotification('Load Failed', 'Failed to load the game. The save file may be corrupted.', 'error');
            return false;
        }
    }

    /**
     * Exports the current save as a file
     */
    function exportSave() {
        try {
            // Get complete game state
            const gameState = getCompleteGameState();
            
            // Add save metadata
            gameState.saveMetadata = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                isAutoSave: false,
                isExported: true
            };
            
            // Convert to JSON string
            const saveData = JSON.stringify(gameState);
            
            // Create blob and download link
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `dig_deep_save_${new Date().toISOString().slice(0, 10)}.json`;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            showNotification('Save Exported', 'Your save file has been exported successfully.', 'success');
            return true;
        } catch (e) {
            console.error('Failed to export save:', e);
            showNotification('Export Failed', 'Failed to export the save file. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Shows the import dialog
     */
    function showImportDialog() {
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'dialog';
        
        // Create dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>Import Save</h3>
            </div>
            <div class="dialog-content">
                <p>Select a save file to import. This will overwrite your current game progress.</p>
                <input type="file" id="save-file-input" accept=".json">
            </div>
            <div class="dialog-buttons">
                <button class="dialog-button dialog-button-cancel">Cancel</button>
                <button class="dialog-button dialog-button-confirm">Import</button>
            </div>
        `;
        
        // Add event listeners
        const confirmButton = dialog.querySelector('.dialog-button-confirm');
        const cancelButton = dialog.querySelector('.dialog-button-cancel');
        const fileInput = dialog.querySelector('#save-file-input');
        
        confirmButton.addEventListener('click', function() {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const saveData = JSON.parse(e.target.result);
                        
                        // Check save version compatibility
                        if (!saveData.saveMetadata || !isVersionCompatible(saveData.saveMetadata.version)) {
                            showNotification(
                                'Incompatible Save',
                                'The save file is from an incompatible version of the game.',
                                'error'
                            );
                            return;
                        }
                        
                        // Load the game state
                        loadCompleteGameState(saveData);
                        
                        // Dispatch event
                        const event = new CustomEvent('gameLoaded', {
                            detail: { isImported: true }
                        });
                        document.dispatchEvent(event);
                        
                        showNotification('Save Imported', 'Your save file has been imported successfully.', 'success');
                    } catch (e) {
                        console.error('Failed to import save:', e);
                        showNotification('Import Failed', 'Failed to import the save file. The file may be corrupted.', 'error');
                    }
                };
                
                reader.readAsText(file);
            }
            
            document.body.removeChild(overlay);
        });
        
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // Add dialog to overlay
        overlay.appendChild(dialog);
        
        // Add overlay to body
        document.body.appendChild(overlay);
    }

    /**
     * Gets the complete game state from all modules
     * @returns {Object} - Complete game state
     */
    function getCompleteGameState() {
        // Get base game state from GameData
        const baseState = GameData.getGameState();
        
        // Get discovered content items
        const contentState = {
            discoveredItems: GameContent.getDiscoveredItems()
        };
        
        // Get achievement rewards state
        const achievementState = {
            appliedRewards: getAppliedAchievementRewards()
        };
        
        // Combine all states
        return {
            ...baseState,
            content: contentState,
            achievements: achievementState
        };
    }

    /**
     * Gets the applied achievement rewards
     * @returns {Object} - Applied achievement rewards
     */
    function getAppliedAchievementRewards() {
        // This would need to be implemented in the GameAchievements module
        // For now, we'll return an empty object
        return {};
    }

    /**
     * Loads the complete game state into all modules
     * @param {Object} state - Complete game state
     */
    function loadCompleteGameState(state) {
        // Load base game state into GameData
        GameData.setGameState(state);
        
        // Update UI
        updateUI();
    }

    /**
     * Updates the UI after loading a game
     */
    function updateUI() {
        // Update resource display
        const event = new CustomEvent('resourceUpdated', {
            detail: { resources: GameData.getResources() }
        });
        document.dispatchEvent(event);
        
        // Update depth display
        const depthEvent = new CustomEvent('depthUpdated', {
            detail: { depth: GameData.getDepth() }
        });
        document.dispatchEvent(depthEvent);
        
        // Update upgrades display
        const upgradesEvent = new CustomEvent('upgradesUpdated', {
            detail: { 
                upgrades: GameData.getUpgrades(),
                resources: GameData.getResources()
            }
        });
        document.dispatchEvent(upgradesEvent);
        
        // Update stats display
        const statsEvent = new CustomEvent('statsUpdated', {
            detail: { stats: GameData.getStats() }
        });
        document.dispatchEvent(statsEvent);
        
        // Update achievements display
        const achievementsEvent = new CustomEvent('achievementsUpdated');
        document.dispatchEvent(achievementsEvent);
    }

    /**
     * Checks if a save version is compatible with the current game version
     * @param {string} saveVersion - Version of the save file
     * @returns {boolean} - Whether the version is compatible
     */
    function isVersionCompatible(saveVersion) {
        // For now, we'll accept any version
        // In a real game, you'd want to check major/minor versions
        return true;
    }

    // Public API
    return {
        init,
        saveGame,
        loadGame,
        exportSave,
        startAutoSave,
        stopAutoSave
    };
})();