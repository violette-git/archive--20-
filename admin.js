/**
 * Admin.js - Development and content management interface for Dig Deep
 * Provides tools for game balancing, testing, and debugging
 */

const GameAdmin = (function() {
    'use strict';

    // Private variables
    let adminPanelVisible = false;
    let adminInitialized = false;
    let performanceMetrics = {
        fps: 0,
        memory: 0,
        tickTime: 0,
        renderTime: 0,
        lastUpdate: 0
    };
    let performanceHistory = [];
    let performanceMonitoringActive = false;
    let performanceMonitorInterval = null;
    
    // Admin panel sections
    const ADMIN_SECTIONS = {
        RESOURCES: 'resources',
        UPGRADES: 'upgrades',
        PROGRESSION: 'progression',
        TESTING: 'testing',
        PERFORMANCE: 'performance',
        CONTENT: 'content'
    };
    
    // Konami code for accessing admin panel
    const ADMIN_ACCESS_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    // Alternative access code (Ctrl+Shift+A)
    const ADMIN_ALT_ACCESS = (e) => e.ctrlKey && e.shiftKey && e.key === 'A';
    
    let accessCodeProgress = 0;
    
    /**
     * Initializes the admin interface
     */
    function init() {
        if (adminInitialized) return;
        
        // Set up event listeners for admin panel access
        setupAccessListeners();
        
        adminInitialized = true;
        console.log('Admin interface initialized');
    }
    
    /**
     * Sets up event listeners for accessing the admin panel
     */
    function setupAccessListeners() {
        // Listen for konami code
        document.addEventListener('keydown', function(e) {
            // Check for alternative access (Ctrl+Shift+A)
            if (ADMIN_ALT_ACCESS(e)) {
                e.preventDefault();
                toggleAdminPanel();
                return;
            }
            
            // Check for konami code sequence
            if (e.key === ADMIN_ACCESS_CODE[accessCodeProgress]) {
                accessCodeProgress++;
                
                // If complete sequence entered, show admin panel
                if (accessCodeProgress === ADMIN_ACCESS_CODE.length) {
                    toggleAdminPanel();
                    accessCodeProgress = 0;
                }
            } else {
                // Reset progress if wrong key
                accessCodeProgress = 0;
            }
        });
    }
    
    /**
     * Toggles the admin panel visibility
     */
    function toggleAdminPanel() {
        if (adminPanelVisible) {
            hideAdminPanel();
        } else {
            showAdminPanel();
        }
    }
    
    /**
     * Shows the admin panel
     */
    function showAdminPanel() {
        if (adminPanelVisible) return;
        
        // Create admin panel if it doesn't exist
        let adminPanel = document.getElementById('admin-panel');
        if (!adminPanel) {
            adminPanel = createAdminPanel();
            document.body.appendChild(adminPanel);
        }
        
        // Show panel
        adminPanel.classList.add('admin-panel-visible');
        adminPanelVisible = true;
        
        // Start performance monitoring
        startPerformanceMonitoring();
        
        console.log('Admin panel opened');
    }
    
    /**
     * Hides the admin panel
     */
    function hideAdminPanel() {
        if (!adminPanelVisible) return;
        
        // Hide panel
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.classList.remove('admin-panel-visible');
        }
        
        adminPanelVisible = false;
        
        // Stop performance monitoring
        stopPerformanceMonitoring();
        
        console.log('Admin panel closed');
    }
    
    /**
     * Creates the admin panel element
     * @returns {HTMLElement} - Admin panel element
     */
    function createAdminPanel() {
        // Create panel container
        const adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.className = 'admin-panel';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'admin-header';
        header.innerHTML = `
            <h2>Dig Deep Admin Panel</h2>
            <button id="admin-close" class="admin-close-button">&times;</button>
        `;
        
        // Create tabs
        const tabs = document.createElement('div');
        tabs.className = 'admin-tabs';
        
        // Add tab buttons
        for (const [id, label] of Object.entries(ADMIN_SECTIONS)) {
            const tabButton = document.createElement('button');
            tabButton.className = 'admin-tab-button';
            tabButton.dataset.tab = id;
            tabButton.textContent = formatSectionName(label);
            tabs.appendChild(tabButton);
        }
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'admin-content';
        
        // Create tab content sections
        for (const [id, label] of Object.entries(ADMIN_SECTIONS)) {
            const section = document.createElement('div');
            section.className = 'admin-section';
            section.id = `admin-section-${id}`;
            section.dataset.tab = id;
            
            // Add section content based on type
            switch (id) {
                case ADMIN_SECTIONS.RESOURCES:
                    section.appendChild(createResourcesSection());
                    break;
                case ADMIN_SECTIONS.UPGRADES:
                    section.appendChild(createUpgradesSection());
                    break;
                case ADMIN_SECTIONS.PROGRESSION:
                    section.appendChild(createProgressionSection());
                    break;
                case ADMIN_SECTIONS.TESTING:
                    section.appendChild(createTestingSection());
                    break;
                case ADMIN_SECTIONS.PERFORMANCE:
                    section.appendChild(createPerformanceSection());
                    break;
                case ADMIN_SECTIONS.CONTENT:
                    section.appendChild(createContentSection());
                    break;
            }
            
            content.appendChild(section);
        }
        
        // Create footer
        const footer = document.createElement('div');
        footer.className = 'admin-footer';
        footer.innerHTML = `
            <div class="admin-version">Game Version: ${GameData.getGameVersion()}</div>
            <button id="admin-save-changes" class="admin-button">Save Changes</button>
        `;
        
        // Assemble panel
        adminPanel.appendChild(header);
        adminPanel.appendChild(tabs);
        adminPanel.appendChild(content);
        adminPanel.appendChild(footer);
        
        // Add event listeners
        setupAdminEventListeners(adminPanel);
        
        return adminPanel;
    }
    
    /**
     * Sets up event listeners for the admin panel
     * @param {HTMLElement} panel - Admin panel element
     */
    function setupAdminEventListeners(panel) {
        // Close button
        const closeButton = panel.querySelector('#admin-close');
        if (closeButton) {
            closeButton.addEventListener('click', hideAdminPanel);
        }
        
        // Tab buttons
        const tabButtons = panel.querySelectorAll('.admin-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                switchAdminTab(tabId);
            });
        });
        
        // Save changes button
        const saveButton = panel.querySelector('#admin-save-changes');
        if (saveButton) {
            saveButton.addEventListener('click', saveAdminChanges);
        }
        
        // Resource modification buttons
        const addResourceButtons = panel.querySelectorAll('.admin-add-resource');
        addResourceButtons.forEach(button => {
            button.addEventListener('click', function() {
                const resource = this.dataset.resource;
                const amountInput = panel.querySelector(`#admin-${resource}-amount`);
                const amount = parseInt(amountInput.value, 10);
                
                if (!isNaN(amount)) {
                    GameData.addResource(resource, amount);
                    updateAdminResourceDisplay();
                }
            });
        });
        
        // Upgrade level buttons
        const upgradeButtons = panel.querySelectorAll('.admin-upgrade-button');
        upgradeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const upgradeId = this.dataset.upgrade;
                const action = this.dataset.action;
                
                if (action === 'increment') {
                    GameData.incrementUpgradeLevel(upgradeId);
                } else if (action === 'max') {
                    const upgrade = GameData.getUpgradeById(upgradeId);
                    if (upgrade) {
                        const levelsToAdd = upgrade.maxLevel - upgrade.level;
                        for (let i = 0; i < levelsToAdd; i++) {
                            GameData.incrementUpgradeLevel(upgradeId);
                        }
                    }
                }
                
                updateAdminUpgradesDisplay();
            });
        });
        
        // Depth modification button
        const setDepthButton = panel.querySelector('#admin-set-depth');
        if (setDepthButton) {
            setDepthButton.addEventListener('click', function() {
                const depthInput = panel.querySelector('#admin-depth-value');
                const depth = parseFloat(depthInput.value);
                
                if (!isNaN(depth)) {
                    GameData.setDepth(depth);
                    updateAdminProgressionDisplay();
                }
            });
        }
        
        // Test buttons
        const testButtons = panel.querySelectorAll('.admin-test-button');
        testButtons.forEach(button => {
            button.addEventListener('click', function() {
                const testType = this.dataset.test;
                runGameTest(testType);
            });
        });
        
        // Performance monitoring toggle
        const perfToggle = panel.querySelector('#admin-perf-toggle');
        if (perfToggle) {
            perfToggle.addEventListener('change', function() {
                if (this.checked) {
                    startPerformanceMonitoring();
                } else {
                    stopPerformanceMonitoring();
                }
            });
        }
        
        // Content management buttons
        const contentButtons = panel.querySelectorAll('.admin-content-button');
        contentButtons.forEach(button => {
            button.addEventListener('click', function() {
                const contentType = this.dataset.content;
                const action = this.dataset.action;
                
                handleContentAction(contentType, action);
            });
        });
    }
    
    /**
     * Switches the active tab in the admin panel
     * @param {string} tabId - ID of the tab to switch to
     */
    function switchAdminTab(tabId) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.admin-tab-button');
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabId) {
                button.classList.add('admin-tab-active');
            } else {
                button.classList.remove('admin-tab-active');
            }
        });
        
        // Update tab sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => {
            if (section.dataset.tab === tabId) {
                section.classList.add('admin-section-active');
                
                // Update section content if needed
                updateSectionContent(tabId);
            } else {
                section.classList.remove('admin-section-active');
            }
        });
    }
    
    /**
     * Updates the content of a section when it becomes active
     * @param {string} sectionId - ID of the section to update
     */
    function updateSectionContent(sectionId) {
        switch (sectionId) {
            case ADMIN_SECTIONS.RESOURCES:
                updateAdminResourceDisplay();
                break;
            case ADMIN_SECTIONS.UPGRADES:
                updateAdminUpgradesDisplay();
                break;
            case ADMIN_SECTIONS.PROGRESSION:
                updateAdminProgressionDisplay();
                break;
            case ADMIN_SECTIONS.PERFORMANCE:
                updatePerformanceDisplay();
                break;
            case ADMIN_SECTIONS.CONTENT:
                updateContentDisplay();
                break;
        }
    }
    
    /**
     * Creates the resources section of the admin panel
     * @returns {HTMLElement} - Resources section element
     */
    function createResourcesSection() {
        const section = document.createElement('div');
        section.className = 'admin-resources';
        
        section.innerHTML = `
            <h3>Resource Management</h3>
            <div class="admin-resource-controls">
                <div class="admin-resource-item">
                    <label>Dirt:</label>
                    <span id="admin-dirt-current">0</span>
                    <input type="number" id="admin-dirt-amount" value="100" min="1" max="10000">
                    <button class="admin-add-resource" data-resource="dirt">Add</button>
                </div>
                <div class="admin-resource-item">
                    <label>Stone:</label>
                    <span id="admin-stone-current">0</span>
                    <input type="number" id="admin-stone-amount" value="50" min="1" max="10000">
                    <button class="admin-add-resource" data-resource="stone">Add</button>
                </div>
                <div class="admin-resource-item">
                    <label>Gems:</label>
                    <span id="admin-gems-current">0</span>
                    <input type="number" id="admin-gems-amount" value="10" min="1" max="10000">
                    <button class="admin-add-resource" data-resource="gems">Add</button>
                </div>
            </div>
            
            <h3>Resource Multipliers</h3>
            <div class="admin-multiplier-controls">
                <div class="admin-multiplier-item">
                    <label>Dirt Multiplier:</label>
                    <input type="number" id="admin-dirt-multiplier" value="1" min="0.1" max="100" step="0.1">
                </div>
                <div class="admin-multiplier-item">
                    <label>Stone Multiplier:</label>
                    <input type="number" id="admin-stone-multiplier" value="1" min="0.1" max="100" step="0.1">
                </div>
                <div class="admin-multiplier-item">
                    <label>Gems Multiplier:</label>
                    <input type="number" id="admin-gems-multiplier" value="1" min="0.1" max="100" step="0.1">
                </div>
                <div class="admin-multiplier-item">
                    <label>Click Power:</label>
                    <input type="number" id="admin-click-power" value="1" min="0.1" max="100" step="0.1">
                </div>
                <button id="admin-apply-multipliers" class="admin-button">Apply Multipliers</button>
            </div>
        `;
        
        // Add event listener for applying multipliers
        const applyButton = section.querySelector('#admin-apply-multipliers');
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                const dirtMultiplier = parseFloat(section.querySelector('#admin-dirt-multiplier').value);
                const stoneMultiplier = parseFloat(section.querySelector('#admin-stone-multiplier').value);
                const gemsMultiplier = parseFloat(section.querySelector('#admin-gems-multiplier').value);
                const clickPower = parseFloat(section.querySelector('#admin-click-power').value);
                
                if (!isNaN(dirtMultiplier)) GameData.setResourceMultiplier('dirt', dirtMultiplier);
                if (!isNaN(stoneMultiplier)) GameData.setResourceMultiplier('stone', stoneMultiplier);
                if (!isNaN(gemsMultiplier)) GameData.setResourceMultiplier('gems', gemsMultiplier);
                if (!isNaN(clickPower)) GameData.setClickPower(clickPower);
                
                updateAdminResourceDisplay();
            });
        }
        
        return section;
    }
    
    /**
     * Creates the upgrades section of the admin panel
     * @returns {HTMLElement} - Upgrades section element
     */
    function createUpgradesSection() {
        const section = document.createElement('div');
        section.className = 'admin-upgrades';
        
        section.innerHTML = `
            <h3>Upgrade Management</h3>
            <div class="admin-upgrades-list" id="admin-upgrades-list">
                <!-- Upgrades will be dynamically inserted here -->
                <div class="admin-loading">Loading upgrades...</div>
            </div>
            
            <h3>Unlock All Upgrades</h3>
            <div class="admin-unlock-controls">
                <button id="admin-unlock-all" class="admin-button">Unlock All Upgrades</button>
                <button id="admin-reset-upgrades" class="admin-button admin-button-warning">Reset All Upgrades</button>
            </div>
        `;
        
        // Add event listeners for unlock buttons
        const unlockAllButton = section.querySelector('#admin-unlock-all');
        if (unlockAllButton) {
            unlockAllButton.addEventListener('click', function() {
                const upgrades = GameConfig.UPGRADES;
                for (const [id, upgrade] of Object.entries(upgrades)) {
                    const currentLevel = GameData.getUpgradeLevel(id);
                    const maxLevel = upgrade.maxLevel;
                    
                    if (currentLevel < maxLevel) {
                        for (let i = currentLevel; i < maxLevel; i++) {
                            GameData.incrementUpgradeLevel(id);
                        }
                    }
                }
                
                updateAdminUpgradesDisplay();
            });
        }
        
        const resetButton = section.querySelector('#admin-reset-upgrades');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset all upgrades?')) {
                    GameData.resetUpgrades();
                    updateAdminUpgradesDisplay();
                }
            });
        }
        
        return section;
    }
    
    /**
     * Creates the progression section of the admin panel
     * @returns {HTMLElement} - Progression section element
     */
    function createProgressionSection() {
        const section = document.createElement('div');
        section.className = 'admin-progression';
        
        section.innerHTML = `
            <h3>Depth Control</h3>
            <div class="admin-depth-controls">
                <div class="admin-depth-item">
                    <label>Current Depth:</label>
                    <span id="admin-current-depth">0</span> meters
                </div>
                <div class="admin-depth-item">
                    <label>Set Depth:</label>
                    <input type="number" id="admin-depth-value" value="0" min="0" max="1000" step="1">
                    <button id="admin-set-depth" class="admin-button">Set Depth</button>
                </div>
                <div class="admin-depth-item">
                    <label>Current Layer:</label>
                    <span id="admin-current-layer">Surface</span>
                </div>
            </div>
            
            <h3>Achievement Control</h3>
            <div class="admin-achievement-controls">
                <button id="admin-unlock-achievements" class="admin-button">Unlock All Achievements</button>
                <button id="admin-reset-achievements" class="admin-button admin-button-warning">Reset Achievements</button>
            </div>
            
            <h3>Game Progress</h3>
            <div class="admin-progress-controls">
                <button id="admin-reset-game" class="admin-button admin-button-danger">Reset Game</button>
                <label class="admin-checkbox-label">
                    <input type="checkbox" id="admin-confirm-reset"> Confirm Reset
                </label>
            </div>
        `;
        
        // Add event listeners for achievement buttons
        const unlockAchievementsButton = section.querySelector('#admin-unlock-achievements');
        if (unlockAchievementsButton) {
            unlockAchievementsButton.addEventListener('click', function() {
                const achievements = GameConfig.ACHIEVEMENTS;
                for (const [id, achievement] of Object.entries(achievements)) {
                    GameData.unlockAchievement(id);
                }
                
                updateAdminProgressionDisplay();
            });
        }
        
        const resetAchievementsButton = section.querySelector('#admin-reset-achievements');
        if (resetAchievementsButton) {
            resetAchievementsButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset all achievements?')) {
                    GameData.resetAchievements();
                    updateAdminProgressionDisplay();
                }
            });
        }
        
        // Add event listener for game reset
        const resetGameButton = section.querySelector('#admin-reset-game');
        if (resetGameButton) {
            resetGameButton.addEventListener('click', function() {
                const confirmCheckbox = section.querySelector('#admin-confirm-reset');
                
                if (confirmCheckbox && confirmCheckbox.checked) {
                    if (confirm('Are you sure you want to reset the entire game? This cannot be undone!')) {
                        GameData.resetGame();
                        updateAdminProgressionDisplay();
                        updateAdminResourceDisplay();
                        updateAdminUpgradesDisplay();
                    }
                } else {
                    alert('Please check the confirmation box to reset the game.');
                }
            });
        }
        
        return section;
    }
    
    /**
     * Creates the testing section of the admin panel
     * @returns {HTMLElement} - Testing section element
     */
    function createTestingSection() {
        const section = document.createElement('div');
        section.className = 'admin-testing';
        
        section.innerHTML = `
            <h3>Game Testing</h3>
            <div class="admin-test-controls">
                <button class="admin-test-button" data-test="autoClick">Auto-Click Test (100 clicks)</button>
                <button class="admin-test-button" data-test="hazard">Trigger Random Hazard</button>
                <button class="admin-test-button" data-test="randomEvent">Trigger Random Event</button>
                <button class="admin-test-button" data-test="achievement">Trigger Random Achievement</button>
            </div>
            
            <h3>Game Speed</h3>
            <div class="admin-speed-controls">
                <div class="admin-speed-item">
                    <label>Game Speed Multiplier:</label>
                    <input type="range" id="admin-game-speed" min="0.1" max="10" step="0.1" value="1">
                    <span id="admin-speed-value">1x</span>
                </div>
                <button id="admin-apply-speed" class="admin-button">Apply Speed</button>
                <button id="admin-reset-speed" class="admin-button">Reset Speed</button>
            </div>
            
            <h3>Test Results</h3>
            <div class="admin-test-results" id="admin-test-results">
                <div class="admin-test-result">No tests run yet</div>
            </div>
        `;
        
        // Add event listeners for speed controls
        const speedSlider = section.querySelector('#admin-game-speed');
        const speedValue = section.querySelector('#admin-speed-value');
        
        if (speedSlider && speedValue) {
            speedSlider.addEventListener('input', function() {
                speedValue.textContent = `${this.value}x`;
            });
        }
        
        const applySpeedButton = section.querySelector('#admin-apply-speed');
        if (applySpeedButton && speedSlider) {
            applySpeedButton.addEventListener('click', function() {
                const speed = parseFloat(speedSlider.value);
                if (!isNaN(speed)) {
                    GameEngine.setGameSpeed(speed);
                    addTestResult(`Game speed set to ${speed}x`);
                }
            });
        }
        
        const resetSpeedButton = section.querySelector('#admin-reset-speed');
        if (resetSpeedButton) {
            resetSpeedButton.addEventListener('click', function() {
                GameEngine.setGameSpeed(1);
                if (speedSlider) speedSlider.value = 1;
                if (speedValue) speedValue.textContent = '1x';
                addTestResult('Game speed reset to 1x');
            });
        }
        
        return section;
    }
    
    /**
     * Creates the performance section of the admin panel
     * @returns {HTMLElement} - Performance section element
     */
    function createPerformanceSection() {
        const section = document.createElement('div');
        section.className = 'admin-performance';
        
        section.innerHTML = `
            <h3>Performance Monitoring</h3>
            <div class="admin-perf-controls">
                <label class="admin-checkbox-label">
                    <input type="checkbox" id="admin-perf-toggle"> Enable Performance Monitoring
                </label>
            </div>
            
            <div class="admin-perf-metrics">
                <div class="admin-perf-item">
                    <label>FPS:</label>
                    <span id="admin-perf-fps">0</span>
                </div>
                <div class="admin-perf-item">
                    <label>Memory Usage:</label>
                    <span id="admin-perf-memory">0 MB</span>
                </div>
                <div class="admin-perf-item">
                    <label>Tick Time:</label>
                    <span id="admin-perf-tick">0 ms</span>
                </div>
                <div class="admin-perf-item">
                    <label>Render Time:</label>
                    <span id="admin-perf-render">0 ms</span>
                </div>
            </div>
            
            <div class="admin-perf-chart-container">
                <canvas id="admin-perf-chart" width="400" height="200"></canvas>
            </div>
            
            <h3>Debug Information</h3>
            <div class="admin-debug-info" id="admin-debug-info">
                <pre id="admin-debug-output">No debug information available</pre>
            </div>
            
            <button id="admin-refresh-debug" class="admin-button">Refresh Debug Info</button>
        `;
        
        // Add event listener for debug refresh
        const refreshButton = section.querySelector('#admin-refresh-debug');
        if (refreshButton) {
            refreshButton.addEventListener('click', function() {
                updateDebugInformation();
            });
        }
        
        return section;
    }
    
    /**
     * Creates the content section of the admin panel
     * @returns {HTMLElement} - Content section element
     */
    function createContentSection() {
        const section = document.createElement('div');
        section.className = 'admin-content-management';
        
        section.innerHTML = `
            <h3>Content Management</h3>
            <div class="admin-content-controls">
                <div class="admin-content-item">
                    <label>Random Events:</label>
                    <button class="admin-content-button" data-content="randomEvent" data-action="view">View</button>
                    <button class="admin-content-button" data-content="randomEvent" data-action="test">Test</button>
                </div>
                <div class="admin-content-item">
                    <label>Special Discoveries:</label>
                    <button class="admin-content-button" data-content="discovery" data-action="view">View</button>
                    <button class="admin-content-button" data-content="discovery" data-action="test">Test</button>
                </div>
                <div class="admin-content-item">
                    <label>Meta References:</label>
                    <button class="admin-content-button" data-content="metaReference" data-action="view">View</button>
                    <button class="admin-content-button" data-content="metaReference" data-action="test">Test</button>
                </div>
                <div class="admin-content-item">
                    <label>Internet References:</label>
                    <button class="admin-content-button" data-content="internetReference" data-action="view">View</button>
                    <button class="admin-content-button" data-content="internetReference" data-action="test">Test</button>
                </div>
            </div>
            
            <h3>Content Viewer</h3>
            <div class="admin-content-viewer" id="admin-content-viewer">
                <div class="admin-content-placeholder">Select content to view</div>
            </div>
        `;
        
        return section;
    }
    
    /**
     * Updates the resource display in the admin panel
     */
    function updateAdminResourceDisplay() {
        const resources = GameData.getResources();
        const multipliers = GameData.getResourceMultipliers();
        
        // Update current resource values
        const dirtCurrent = document.getElementById('admin-dirt-current');
        const stoneCurrent = document.getElementById('admin-stone-current');
        const gemsCurrent = document.getElementById('admin-gems-current');
        
        if (dirtCurrent) dirtCurrent.textContent = resources.dirt.toLocaleString();
        if (stoneCurrent) stoneCurrent.textContent = resources.stone.toLocaleString();
        if (gemsCurrent) gemsCurrent.textContent = resources.gems.toLocaleString();
        
        // Update multiplier inputs
        const dirtMultiplier = document.getElementById('admin-dirt-multiplier');
        const stoneMultiplier = document.getElementById('admin-stone-multiplier');
        const gemsMultiplier = document.getElementById('admin-gems-multiplier');
        const clickPower = document.getElementById('admin-click-power');
        
        if (dirtMultiplier) dirtMultiplier.value = multipliers.dirt.toFixed(1);
        if (stoneMultiplier) stoneMultiplier.value = multipliers.stone.toFixed(1);
        if (gemsMultiplier) gemsMultiplier.value = multipliers.gems.toFixed(1);
        if (clickPower) clickPower.value = GameData.getClickPower().toFixed(1);
    }
    
    /**
     * Updates the upgrades display in the admin panel
     */
    function updateAdminUpgradesDisplay() {
        const upgradesList = document.getElementById('admin-upgrades-list');
        if (!upgradesList) return;
        
        // Clear list
        upgradesList.innerHTML = '';
        
        // Get all upgrades
        const upgrades = GameConfig.UPGRADES;
        const currentLevels = GameData.getUpgrades();
        
        // Group upgrades by category
        const categories = {};
        for (const [id, upgrade] of Object.entries(upgrades)) {
            const category = upgrade.category || 'uncategorized';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push({
                id,
                ...upgrade,
                level: currentLevels[id] || 0
            });
        }
        
        // Create category sections
        for (const [category, categoryUpgrades] of Object.entries(categories)) {
            // Create category header
            const categoryHeader = document.createElement('h4');
            categoryHeader.className = 'admin-upgrade-category';
            categoryHeader.textContent = formatSectionName(category);
            upgradesList.appendChild(categoryHeader);
            
            // Create upgrades for this category
            categoryUpgrades.forEach(upgrade => {
                const upgradeItem = document.createElement('div');
                upgradeItem.className = 'admin-upgrade-item';
                
                upgradeItem.innerHTML = `
                    <div class="admin-upgrade-info">
                        <div class="admin-upgrade-name">${upgrade.name}</div>
                        <div class="admin-upgrade-level">Level: ${upgrade.level} / ${upgrade.maxLevel}</div>
                    </div>
                    <div class="admin-upgrade-actions">
                        <button class="admin-upgrade-button" data-upgrade="${upgrade.id}" data-action="increment">+1 Level</button>
                        <button class="admin-upgrade-button" data-upgrade="${upgrade.id}" data-action="max">Max Level</button>
                    </div>
                `;
                
                upgradesList.appendChild(upgradeItem);
            });
        }
    }
    
    /**
     * Updates the progression display in the admin panel
     */
    function updateAdminProgressionDisplay() {
        const currentDepth = document.getElementById('admin-current-depth');
        const currentLayer = document.getElementById('admin-current-layer');
        const depthInput = document.getElementById('admin-depth-value');
        
        if (currentDepth) currentDepth.textContent = GameData.getDepth().toFixed(1);
        if (currentLayer) currentLayer.textContent = GameData.getCurrentLayer().name;
        if (depthInput) depthInput.value = GameData.getDepth().toFixed(1);
    }
    
    /**
     * Updates the performance display in the admin panel
     */
    function updatePerformanceDisplay() {
        const fpsElement = document.getElementById('admin-perf-fps');
        const memoryElement = document.getElementById('admin-perf-memory');
        const tickElement = document.getElementById('admin-perf-tick');
        const renderElement = document.getElementById('admin-perf-render');
        
        if (fpsElement) fpsElement.textContent = performanceMetrics.fps.toFixed(1);
        if (memoryElement) memoryElement.textContent = `${performanceMetrics.memory.toFixed(2)} MB`;
        if (tickElement) tickElement.textContent = `${performanceMetrics.tickTime.toFixed(2)} ms`;
        if (renderElement) renderElement.textContent = `${performanceMetrics.renderTime.toFixed(2)} ms`;
        
        // Update chart if available
        updatePerformanceChart();
    }
    
    /**
     * Updates the content display in the admin panel
     */
    function updateContentDisplay() {
        // Nothing to update by default, content is shown when requested
    }
    
    /**
     * Updates the performance chart
     */
    function updatePerformanceChart() {
        const canvas = document.getElementById('admin-perf-chart');
        if (!canvas || !canvas.getContext) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw FPS line
        if (performanceHistory.length > 1) {
            const maxFps = 60;
            const maxHistory = 100;
            const historyToShow = performanceHistory.slice(-maxHistory);
            
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            historyToShow.forEach((metrics, i) => {
                const x = (width / (maxHistory - 1)) * i;
                const y = height - (metrics.fps / maxFps) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw tick time line
            const maxTickTime = 50; // ms
            ctx.strokeStyle = '#2196F3';
            ctx.beginPath();
            
            historyToShow.forEach((metrics, i) => {
                const x = (width / (maxHistory - 1)) * i;
                const y = height - (metrics.tickTime / maxTickTime) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw legend
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText('FPS (green)', 10, 15);
        ctx.fillText('Tick Time (blue)', 10, 30);
    }
    
    /**
     * Updates the debug information display
     */
    function updateDebugInformation() {
        const debugOutput = document.getElementById('admin-debug-output');
        if (!debugOutput) return;
        
        // Get game state for debugging
        const gameState = GameData.getGameState();
        
        // Format debug information
        const debugInfo = {
            version: gameState.version,
            resources: gameState.resources,
            stats: gameState.stats,
            upgrades: gameState.upgrades,
            depth: gameState.depth,
            layer: gameState.layer,
            achievements: Object.keys(gameState.achievements).filter(id => gameState.achievements[id]).length,
            performanceMetrics: {
                fps: performanceMetrics.fps.toFixed(1),
                memory: `${performanceMetrics.memory.toFixed(2)} MB`,
                tickTime: `${performanceMetrics.tickTime.toFixed(2)} ms`,
                renderTime: `${performanceMetrics.renderTime.toFixed(2)} ms`
            }
        };
        
        // Display debug information
        debugOutput.textContent = JSON.stringify(debugInfo, null, 2);
    }
    
    /**
     * Starts performance monitoring
     */
    function startPerformanceMonitoring() {
        if (performanceMonitoringActive) return;
        
        performanceMonitoringActive = true;
        
        // Update checkbox
        const perfToggle = document.getElementById('admin-perf-toggle');
        if (perfToggle) perfToggle.checked = true;
        
        // Start monitoring interval
        performanceMonitorInterval = setInterval(monitorPerformance, 1000);
        
        // Set up frame counting for FPS
        let frameCount = 0;
        let lastFrameTime = performance.now();
        
        function countFrame() {
            frameCount++;
            
            if (performanceMonitoringActive) {
                requestAnimationFrame(countFrame);
            }
        }
        
        requestAnimationFrame(countFrame);
        
        // Monitor performance metrics
        function monitorPerformance() {
            const now = performance.now();
            const elapsed = now - lastFrameTime;
            
            // Calculate FPS
            performanceMetrics.fps = frameCount / (elapsed / 1000);
            
            // Get memory usage if available
            if (window.performance && window.performance.memory) {
                performanceMetrics.memory = window.performance.memory.usedJSHeapSize / (1024 * 1024);
            }
            
            // Get tick and render times from GameEngine
            const engineMetrics = GameEngine.getPerformanceMetrics();
            if (engineMetrics) {
                performanceMetrics.tickTime = engineMetrics.tickTime;
                performanceMetrics.renderTime = engineMetrics.renderTime;
            }
            
            // Reset frame counter
            frameCount = 0;
            lastFrameTime = now;
            
            // Add to history
            performanceHistory.push({ ...performanceMetrics });
            
            // Limit history size
            if (performanceHistory.length > 200) {
                performanceHistory.shift();
            }
            
            // Update display if admin panel is visible
            if (adminPanelVisible) {
                updatePerformanceDisplay();
            }
        }
    }
    
    /**
     * Stops performance monitoring
     */
    function stopPerformanceMonitoring() {
        if (!performanceMonitoringActive) return;
        
        performanceMonitoringActive = false;
        
        // Update checkbox
        const perfToggle = document.getElementById('admin-perf-toggle');
        if (perfToggle) perfToggle.checked = false;
        
        // Stop monitoring interval
        if (performanceMonitorInterval) {
            clearInterval(performanceMonitorInterval);
            performanceMonitorInterval = null;
        }
    }
    
    /**
     * Runs a game test
     * @param {string} testType - Type of test to run
     */
    function runGameTest(testType) {
        switch (testType) {
            case 'autoClick':
                runAutoClickTest();
                break;
            case 'hazard':
                triggerRandomHazard();
                break;
            case 'randomEvent':
                triggerRandomContentEvent();
                break;
            case 'achievement':
                triggerRandomAchievement();
                break;
        }
    }
    
    /**
     * Runs an auto-click test
     */
    function runAutoClickTest() {
        const clickCount = 100;
        const clickInterval = 10; // ms
        let clicksDone = 0;
        
        addTestResult(`Starting auto-click test (${clickCount} clicks)...`);
        
        const startTime = performance.now();
        
        function doClick() {
            GameEngine.dig();
            clicksDone++;
            
            if (clicksDone < clickCount) {
                setTimeout(doClick, clickInterval);
            } else {
                const endTime = performance.now();
                const duration = endTime - startTime;
                addTestResult(`Auto-click test completed: ${clickCount} clicks in ${duration.toFixed(2)}ms`);
            }
        }
        
        doClick();
    }
    
    /**
     * Triggers a random hazard
     */
    function triggerRandomHazard() {
        const hazards = GameConfig.HAZARDS;
        const hazardIds = Object.keys(hazards);
        
        if (hazardIds.length > 0) {
            const randomId = hazardIds[Math.floor(Math.random() * hazardIds.length)];
            GameEngine.triggerHazard(randomId);
            addTestResult(`Triggered hazard: ${hazards[randomId].name}`);
        } else {
            addTestResult('No hazards available to trigger');
        }
    }
    
    /**
     * Triggers a random content event
     */
    function triggerRandomContentEvent() {
        const events = GameContent.RANDOM_EVENTS;
        
        if (events.length > 0) {
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            const randomVariant = randomEvent.variants[Math.floor(Math.random() * randomEvent.variants.length)];
            
            // Create custom event
            const eventDetail = new CustomEvent('randomEventTriggered', {
                detail: { 
                    event: randomEvent.id,
                    variant: randomVariant.name
                }
            });
            document.dispatchEvent(eventDetail);
            
            addTestResult(`Triggered random event: ${randomEvent.name} (${randomVariant.name})`);
        } else {
            addTestResult('No random events available to trigger');
        }
    }
    
    /**
     * Triggers a random achievement
     */
    function triggerRandomAchievement() {
        const achievements = GameConfig.ACHIEVEMENTS;
        const achievementIds = Object.keys(achievements);
        
        if (achievementIds.length > 0) {
            const randomId = achievementIds[Math.floor(Math.random() * achievementIds.length)];
            
            // Unlock the achievement
            GameData.unlockAchievement(randomId);
            
            addTestResult(`Triggered achievement: ${achievements[randomId].name}`);
        } else {
            addTestResult('No achievements available to trigger');
        }
    }
    
    /**
     * Adds a test result to the test results display
     * @param {string} result - Test result message
     */
    function addTestResult(result) {
        const resultsContainer = document.getElementById('admin-test-results');
        if (!resultsContainer) return;
        
        const resultElement = document.createElement('div');
        resultElement.className = 'admin-test-result';
        resultElement.textContent = result;
        
        resultsContainer.prepend(resultElement);
        
        // Limit number of results
        const results = resultsContainer.querySelectorAll('.admin-test-result');
        if (results.length > 10) {
            results[results.length - 1].remove();
        }
    }
    
    /**
     * Handles content management actions
     * @param {string} contentType - Type of content
     * @param {string} action - Action to perform
     */
    function handleContentAction(contentType, action) {
        const contentViewer = document.getElementById('admin-content-viewer');
        if (!contentViewer) return;
        
        switch (action) {
            case 'view':
                viewContent(contentType, contentViewer);
                break;
            case 'test':
                testContent(contentType);
                break;
        }
    }
    
    /**
     * Views content in the content viewer
     * @param {string} contentType - Type of content to view
     * @param {HTMLElement} viewer - Content viewer element
     */
    function viewContent(contentType, viewer) {
        let content;
        let title;
        
        switch (contentType) {
            case 'randomEvent':
                content = GameContent.RANDOM_EVENTS;
                title = 'Random Events';
                break;
            case 'discovery':
                content = GameContent.SPECIAL_DISCOVERIES;
                title = 'Special Discoveries';
                break;
            case 'metaReference':
                content = GameContent.META_REFERENCES;
                title = 'Meta References';
                break;
            case 'internetReference':
                content = GameContent.INTERNET_REFERENCES;
                title = 'Internet References';
                break;
            default:
                content = [];
                title = 'Unknown Content';
        }
        
        // Create content view
        viewer.innerHTML = `
            <h4>${title}</h4>
            <div class="admin-content-list">
                ${Array.isArray(content) ? content.map(item => `
                    <div class="admin-content-list-item">
                        <div class="admin-content-item-name">${item.name}</div>
                        <div class="admin-content-item-description">${item.description}</div>
                    </div>
                `).join('') : 'No content available'}
            </div>
        `;
    }
    
    /**
     * Tests content by triggering it
     * @param {string} contentType - Type of content to test
     */
    function testContent(contentType) {
        let content;
        
        switch (contentType) {
            case 'randomEvent':
                content = GameContent.RANDOM_EVENTS;
                if (content.length > 0) {
                    const randomEvent = content[Math.floor(Math.random() * content.length)];
                    const randomVariant = randomEvent.variants[Math.floor(Math.random() * randomEvent.variants.length)];
                    
                    // Create custom event
                    const eventDetail = new CustomEvent('randomEventTriggered', {
                        detail: { 
                            event: randomEvent.id,
                            variant: randomVariant.name
                        }
                    });
                    document.dispatchEvent(eventDetail);
                    
                    addTestResult(`Tested random event: ${randomEvent.name} (${randomVariant.name})`);
                }
                break;
            case 'discovery':
                content = GameContent.SPECIAL_DISCOVERIES;
                if (content.length > 0) {
                    const randomDiscovery = content[Math.floor(Math.random() * content.length)];
                    
                    // Create custom event
                    const eventDetail = new CustomEvent('specialDiscoveryFound', {
                        detail: { discovery: randomDiscovery.id }
                    });
                    document.dispatchEvent(eventDetail);
                    
                    addTestResult(`Tested special discovery: ${randomDiscovery.name}`);
                }
                break;
            case 'metaReference':
                content = GameContent.META_REFERENCES;
                if (content.length > 0) {
                    const randomReference = content[Math.floor(Math.random() * content.length)];
                    
                    // Create custom event
                    const eventDetail = new CustomEvent('metaReferenceFound', {
                        detail: { reference: randomReference.id }
                    });
                    document.dispatchEvent(eventDetail);
                    
                    addTestResult(`Tested meta reference: ${randomReference.name}`);
                }
                break;
            case 'internetReference':
                content = GameContent.INTERNET_REFERENCES;
                if (content.length > 0) {
                    const randomReference = content[Math.floor(Math.random() * content.length)];
                    
                    // Create custom event
                    const eventDetail = new CustomEvent('internetReferenceFound', {
                        detail: { reference: randomReference.id }
                    });
                    document.dispatchEvent(eventDetail);
                    
                    addTestResult(`Tested internet reference: ${randomReference.name}`);
                }
                break;
        }
    }
    
    /**
     * Saves changes made in the admin panel
     */
    function saveAdminChanges() {
        GameData.saveGame();
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.textContent = 'Changes saved successfully!';
        
        document.body.appendChild(notification);
        
        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    /**
     * Formats a section name for display
     * @param {string} name - Section name
     * @returns {string} - Formatted name
     */
    function formatSectionName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Public API
    return {
        init,
        toggleAdminPanel,
        showAdminPanel,
        hideAdminPanel,
        updatePerformanceDisplay,
        startPerformanceMonitoring,
        stopPerformanceMonitoring
    };
})();