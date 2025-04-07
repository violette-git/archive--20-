/**
 * DigDeep Game - Audio Controls
 * Handles the audio control UI and interactions
 */

const AudioControls = {
    // DOM elements
    elements: {
        container: null,
        masterSlider: null,
        sfxSlider: null,
        musicSlider: null,
        muteButton: null,
        toggleButton: null
    },
    
    /**
     * Initialize audio controls
     */
    init: function() {
        console.log("Initializing audio controls...");
        
        // Create audio controls UI
        this.createAudioControlsUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI with current settings
        this.updateUI();
        
        console.log("Audio controls initialized successfully!");
    },
    
    /**
     * Create audio controls UI
     */
    createAudioControlsUI: function() {
        // Create container
        const container = document.createElement('div');
        container.className = 'audio-controls';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'audio-controls-header';
        
        const title = document.createElement('h3');
        title.className = 'audio-controls-title';
        title.textContent = 'Audio Controls';
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'audio-controls-toggle';
        toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>';
        
        header.appendChild(title);
        header.appendChild(toggleButton);
        
        // Create content
        const content = document.createElement('div');
        content.className = 'audio-controls-content';
        
        // Master volume control
        const masterControl = this.createVolumeControl('Master', 'master');
        
        // SFX volume control
        const sfxControl = this.createVolumeControl('Sound Effects', 'sfx');
        
        // Music volume control
        const musicControl = this.createVolumeControl('Music', 'music');
        
        // Mute button
        const muteButton = document.createElement('button');
        muteButton.className = 'mute-button';
        muteButton.textContent = 'Mute All';
        
        // Add all elements to content
        content.appendChild(masterControl);
        content.appendChild(sfxControl);
        content.appendChild(musicControl);
        content.appendChild(muteButton);
        
        // Add header and content to container
        container.appendChild(header);
        container.appendChild(content);
        
        // Add container to document
        document.body.appendChild(container);
        
        // Store references to elements
        this.elements.container = container;
        this.elements.masterSlider = masterControl.querySelector('.volume-slider');
        this.elements.sfxSlider = sfxControl.querySelector('.volume-slider');
        this.elements.musicSlider = musicControl.querySelector('.volume-slider');
        this.elements.muteButton = muteButton;
        this.elements.toggleButton = toggleButton;
    },
    
    /**
     * Create a volume control element
     * @param {string} name - Name of the control
     * @param {string} id - ID for the control
     * @returns {HTMLElement} The volume control element
     */
    createVolumeControl: function(name, id) {
        const control = document.createElement('div');
        control.className = 'volume-control';
        
        const label = document.createElement('div');
        label.className = 'volume-control-label';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'volume-control-name';
        nameSpan.textContent = name;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'volume-control-value';
        valueSpan.textContent = '100%';
        valueSpan.id = `${id}-volume-value`;
        
        label.appendChild(nameSpan);
        label.appendChild(valueSpan);
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '100';
        slider.value = '100';
        slider.className = 'volume-slider';
        slider.id = `${id}-volume-slider`;
        
        control.appendChild(label);
        control.appendChild(slider);
        
        return control;
    },
    
    /**
     * Set up event listeners for audio controls
     */
    setupEventListeners: function() {
        // Master volume slider
        this.elements.masterSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            AudioSystem.setMasterVolume(volume);
            this.updateVolumeDisplay('master', volume);
        });
        
        // SFX volume slider
        this.elements.sfxSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            AudioSystem.setSfxVolume(volume);
            this.updateVolumeDisplay('sfx', volume);
        });
        
        // Music volume slider
        this.elements.musicSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            AudioSystem.setMusicVolume(volume);
            this.updateVolumeDisplay('music', volume);
        });
        
        // Mute button
        this.elements.muteButton.addEventListener('click', () => {
            const muted = AudioSystem.toggleMute();
            this.updateMuteButton(muted);
        });
        
        // Toggle button
        this.elements.toggleButton.addEventListener('click', () => {
            this.toggleControls();
        });
        
        // Header click to toggle
        this.elements.container.querySelector('.audio-controls-header').addEventListener('click', (e) => {
            if (e.target !== this.elements.toggleButton) {
                this.toggleControls();
            }
        });
    },
    
    /**
     * Update the UI with current audio settings
     */
    updateUI: function() {
        // Update volume sliders
        this.elements.masterSlider.value = AudioSystem.volume.master * 100;
        this.elements.sfxSlider.value = AudioSystem.volume.sfx * 100;
        this.elements.musicSlider.value = AudioSystem.volume.music * 100;
        
        // Update volume displays
        this.updateVolumeDisplay('master', AudioSystem.volume.master);
        this.updateVolumeDisplay('sfx', AudioSystem.volume.sfx);
        this.updateVolumeDisplay('music', AudioSystem.volume.music);
        
        // Update mute button
        this.updateMuteButton(AudioSystem.muted);
    },
    
    /**
     * Update volume display text
     * @param {string} type - Type of volume (master, sfx, music)
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    updateVolumeDisplay: function(type, volume) {
        const valueElement = document.getElementById(`${type}-volume-value`);
        if (valueElement) {
            valueElement.textContent = `${Math.round(volume * 100)}%`;
        }
    },
    
    /**
     * Update mute button state
     * @param {boolean} muted - Whether audio is muted
     */
    updateMuteButton: function(muted) {
        if (muted) {
            this.elements.muteButton.textContent = 'Unmute';
            this.elements.muteButton.classList.add('muted');
        } else {
            this.elements.muteButton.textContent = 'Mute All';
            this.elements.muteButton.classList.remove('muted');
        }
    },
    
    /**
     * Toggle audio controls visibility
     */
    toggleControls: function() {
        this.elements.container.classList.toggle('collapsed');
        
        // Update toggle button icon
        const isCollapsed = this.elements.container.classList.contains('collapsed');
        if (isCollapsed) {
            this.elements.toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"/></svg>';
        } else {
            this.elements.toggleButton.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>';
        }
    }
};