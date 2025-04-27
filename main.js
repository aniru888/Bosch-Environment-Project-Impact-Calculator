// Main application class
class AppMain {
    constructor() {
        this.modules = {};
        this.activeModule = 'forest';
        this.initialized = false;
    }
    
    init() {
        console.log('AppMain.init() called...');
        
        // Check for required globals (redundant check, but safe)
        if (!window.appGlobals) {
            console.error('AppMain.init: Global namespace not initialized.');
            return;
        }
        
        // Analytics and Event Systems are now initialized in globals.js before this
        // console.log('Analytics initialized'); // Removed
        // console.log('Event systems initialized'); // Removed
        
        // Initialize modules (registering them)
        if (!this._registerModules()) {
            console.error('AppMain.init: Failed to register modules');
            return; // Stop if registration fails
        }
        
        // Setup UI elements like tab navigation
        this._setupTabNavigation();
        
        this.initialized = true;
        console.log('AppMain initialization complete');
        
        // Show the initial active tab
        this._showActiveTab();
    }
    
    _setupTabNavigation() {
        const forestTab = document.getElementById('forest-tab');
        const waterTab = document.getElementById('water-tab');
        const forestSection = document.getElementById('forest-section');
        const waterSection = document.getElementById('water-section');

        if (!forestTab || !waterTab || !forestSection || !waterSection) {
            console.error('Required tab elements not found');
            return;
        }

        // Initialize with forest module active
        this._showActiveTab();
        
        forestTab.addEventListener('click', () => {
            this.activeModule = 'forest';
            this._showActiveTab();
        });
        
        waterTab.addEventListener('click', () => {
            this.activeModule = 'water';
            this._showActiveTab();
        });
    }
    
    _showActiveTab() {
        const forestTab = document.getElementById('forest-tab');
        const waterTab = document.getElementById('water-tab');
        const forestSection = document.getElementById('forest-section');
        const waterSection = document.getElementById('water-section');
        
        if (this.activeModule === 'forest') {
            forestSection.style.display = 'block';
            waterSection.style.display = 'none';
            forestTab.classList.add('active');
            waterTab.classList.remove('active');
        } else {
            forestSection.style.display = 'none';
            waterSection.style.display = 'block';
            waterTab.classList.add('active');
            forestTab.classList.remove('active');
        }
    }
    
    _registerModules() {
        try {
            console.log('Registering modules...');
            
            // Initialize forest calculator module
            if (window.forestMain && typeof window.forestMain.init === 'function') {
                this.modules.forest = window.forestMain.init();
                if (!this.modules.forest) {
                    throw new Error('Forest module initialization failed');
                }
                console.log('Forest module registered successfully');
            } else {
                console.error('Forest calculator module not found or initialization function missing');
                return false; // Stop if a critical module fails
            }
            
            // Initialize water calculator module
            if (window.waterMain && typeof window.waterMain.init === 'function') {
                this.modules.water = window.waterMain.init();
                if (!this.modules.water) {
                    throw new Error('Water module initialization failed');
                }
                console.log('Water module registered successfully');
            } else {
                console.error('Water calculator module not found or initialization function missing');
                return false; // Stop if a critical module fails
            }

            // Add tab change handlers to reset forms when switching tabs
            const forestTab = document.getElementById('forest-tab');
            const waterTab = document.getElementById('water-tab');
            
            if (forestTab) {
                forestTab.addEventListener('click', () => {
                    if (this.activeModule === 'water') {
                        this.modules.water?.reset();
                    }
                });
            }
            
            if (waterTab) {
                waterTab.addEventListener('click', () => {
                    if (this.activeModule === 'forest') {
                        this.modules.forest?.reset();
                    }
                });
            }

            // All modules initialized successfully
            window.appGlobals.modulesInitialized = true; // Set flag here
            console.log('All modules registered successfully.');
            return true;

        } catch (error) {
            console.error('Error during module registration:', error);
            window.appGlobals.modulesInitialized = false; // Ensure flag is false on error
            return false;
        }
    }
}
