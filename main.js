// Main application class
class AppMain {
    constructor() {
        this.modules = {};
        this.activeModule = 'forest';
        this.initialized = false;
    }
    
    init() {
        console.log('Initializing application...');
        
        // First check if required globals are available
        if (!window.appGlobals) {
            console.error('Global namespace not initialized. Please ensure globals.js is loaded first.');
            return;
        }
        
        // Initialize analytics first
        if (window.analytics) {
            window.analytics.init();
            console.log('Analytics initialized');
        }

        // Initialize event systems globally
        if (!window.initializeEventSystems()) {
            console.error('Failed to initialize event systems');
            return;
        }
        console.log('Event systems initialized');
        
        // Initialize modules in correct order
        if (!this._registerModules()) {
            console.error('Failed to register modules');
            return;
        }
        
        // Setup UI only after modules are ready
        this._setupTabNavigation();
        
        this.initialized = true;
        console.log('Application initialization complete');
        
        // Show initial tab
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
                window.appGlobals.modulesInitialized = true;
                console.log('Forest module registered successfully');
            } else {
                console.error('Forest calculator module not found or initialization function missing');
                return false;
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
                return false;
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
            
            return true;
        } catch (error) {
            console.error('Error during module registration:', error);
            return false;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new AppMain();
        app.init();
        
        // Store app instance globally for debugging
        window.app = app;
    } catch (error) {
        console.error('Fatal error during application initialization:', error);
    }
});
