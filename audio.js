/**
 * DigDeep Game - Audio System
 * Handles sound effects and background music for the game
 */

const AudioSystem = {
    // Audio context
    context: null,
    
    // Sound effect buffers
    soundBuffers: {
        dig: null,
        collect: null,
        purchase: null,
        click: null
    },
    
    // Music buffers
    musicBuffers: {
        miningAdventure: null,
        caveAmbience: null
    },
    
    // Currently playing music
    currentMusic: null,
    
    // Volume settings
    volume: {
        master: 1.0,
        sfx: 0.8,
        music: 0.5
    },
    
    // Mute state
    muted: false,
    
    // Initialization state
    initialized: false,
    
    /**
     * Initialize the audio system
     * @returns {Promise} Promise that resolves when audio is loaded
     */
    init: async function() {
        if (this.initialized) return Promise.resolve();
        
        console.log("Initializing audio system...");
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Load sound effects
            await this.loadSoundEffects();
            
            // Load music
            await this.loadMusic();
            
            // Load saved volume settings
            this.loadVolumeSettings();
            
            this.initialized = true;
            console.log("Audio system initialized successfully!");
            
            return Promise.resolve();
        } catch (error) {
            console.error("Failed to initialize audio system:", error);
            return Promise.reject(error);
        }
    },
    
    /**
     * Load all sound effects
     * @returns {Promise} Promise that resolves when all sound effects are loaded
     */
    loadSoundEffects: async function() {
        const soundFiles = {
            dig: 'audio/sfx/dig.wav',
            collect: 'audio/sfx/collect.wav',
            purchase: 'audio/sfx/purchase.wav',
            click: 'audio/sfx/click.wav'
        };
        
        const loadPromises = [];
        
        for (const [name, path] of Object.entries(soundFiles)) {
            loadPromises.push(
                this.loadSound(path)
                    .then(buffer => {
                        this.soundBuffers[name] = buffer;
                        console.log(`Loaded sound effect: ${name}`);
                    })
                    .catch(error => {
                        console.error(`Failed to load sound effect ${name}:`, error);
                    })
            );
        }
        
        return Promise.all(loadPromises);
    },
    
    /**
     * Load all music tracks
     * @returns {Promise} Promise that resolves when all music is loaded
     */
    loadMusic: async function() {
        const musicFiles = {
            miningAdventure: 'audio/music/mining_adventure.wav',
            caveAmbience: 'audio/music/cave_ambience.wav'
        };
        
        const loadPromises = [];
        
        for (const [name, path] of Object.entries(musicFiles)) {
            loadPromises.push(
                this.loadSound(path)
                    .then(buffer => {
                        this.musicBuffers[name] = buffer;
                        console.log(`Loaded music track: ${name}`);
                    })
                    .catch(error => {
                        console.error(`Failed to load music track ${name}:`, error);
                    })
            );
        }
        
        return Promise.all(loadPromises);
    },
    
    /**
     * Load a sound file
     * @param {string} url - URL of the sound file
     * @returns {Promise<AudioBuffer>} Promise that resolves with the audio buffer
     */
    loadSound: function(url) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer));
    },
    
    /**
     * Play a sound effect
     * @param {string} name - Name of the sound effect to play
     * @param {number} [volume=1.0] - Volume of the sound effect (0.0 to 1.0)
     */
    playSound: function(name, volume = 1.0) {
        if (!this.initialized || this.muted) return;
        
        const buffer = this.soundBuffers[name];
        if (!buffer) {
            console.warn(`Sound effect "${name}" not found`);
            return;
        }
        
        // Create source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        
        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume * this.volume.sfx * this.volume.master;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        // Play sound
        source.start(0);
    },
    
    /**
     * Play background music
     * @param {string} name - Name of the music track to play
     * @param {boolean} [loop=true] - Whether to loop the music
     */
    playMusic: function(name, loop = true) {
        if (!this.initialized) return;
        
        // Stop current music if playing
        this.stopMusic();
        
        const buffer = this.musicBuffers[name];
        if (!buffer) {
            console.warn(`Music track "${name}" not found`);
            return;
        }
        
        // Create source
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        
        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = this.muted ? 0 : this.volume.music * this.volume.master;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        // Play music
        source.start(0);
        
        // Store reference to current music
        this.currentMusic = {
            source: source,
            gainNode: gainNode,
            name: name
        };
    },
    
    /**
     * Stop currently playing music
     */
    stopMusic: function() {
        if (this.currentMusic && this.currentMusic.source) {
            try {
                this.currentMusic.source.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }
            this.currentMusic = null;
        }
    },
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMasterVolume: function(volume) {
        this.volume.master = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
        this.saveVolumeSettings();
    },
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setSfxVolume: function(volume) {
        this.volume.sfx = Math.max(0, Math.min(1, volume));
        this.saveVolumeSettings();
    },
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setMusicVolume: function(volume) {
        this.volume.music = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
        this.saveVolumeSettings();
    },
    
    /**
     * Update the volume of currently playing music
     */
    updateMusicVolume: function() {
        if (this.currentMusic && this.currentMusic.gainNode) {
            this.currentMusic.gainNode.gain.value = this.muted ? 0 : this.volume.music * this.volume.master;
        }
    },
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute: function() {
        this.muted = !this.muted;
        this.updateMusicVolume();
        this.saveVolumeSettings();
        return this.muted;
    },
    
    /**
     * Set mute state
     * @param {boolean} muted - Whether audio should be muted
     */
    setMute: function(muted) {
        this.muted = muted;
        this.updateMusicVolume();
        this.saveVolumeSettings();
    },
    
    /**
     * Save volume settings to local storage
     */
    saveVolumeSettings: function() {
        const settings = {
            master: this.volume.master,
            sfx: this.volume.sfx,
            music: this.volume.music,
            muted: this.muted
        };
        
        localStorage.setItem('digdeep_audio_settings', JSON.stringify(settings));
    },
    
    /**
     * Load volume settings from local storage
     */
    loadVolumeSettings: function() {
        const savedSettings = localStorage.getItem('digdeep_audio_settings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                this.volume.master = settings.master !== undefined ? settings.master : this.volume.master;
                this.volume.sfx = settings.sfx !== undefined ? settings.sfx : this.volume.sfx;
                this.volume.music = settings.music !== undefined ? settings.music : this.volume.music;
                this.muted = settings.muted !== undefined ? settings.muted : this.muted;
                
                console.log("Loaded audio settings from local storage");
            } catch (error) {
                console.error("Failed to parse saved audio settings:", error);
            }
        }
    }
};