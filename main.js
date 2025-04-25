// Main application class
class AppMain {
    constructor() {
        this.modules = {};
        this.activeModule = 'forest';
    }
    
    init() {
        this._setupTabNavigation();
        this._registerModules();
    }
    
    _setupTabNavigation() {
        const forestTab = document.getElementById('forest-tab');
        const waterTab = document.getElementById('water-tab');
        const forestSection = document.getElementById('forest-section');
        const waterSection = document.getElementById('water-section');

        // Initialize with forest module active
        forestSection.style.display = 'block';
        waterSection.style.display = 'none';
        
        forestTab.addEventListener('click', () => {
            forestSection.style.display = 'block';
            waterSection.style.display = 'none';
            forestTab.classList.add('active');
            waterTab.classList.remove('active');
            this.activeModule = 'forest';
        });
        
        waterTab.addEventListener('click', () => {
            forestSection.style.display = 'none';
            waterSection.style.display = 'block';
            waterTab.classList.add('active');
            forestTab.classList.remove('active');
            this.activeModule = 'water';
        });
    }
    
    _registerModules() {
        // Initialize forest calculator module
        if (window.forestMain && typeof window.forestMain.init === 'function') {
            this.modules.forest = window.forestMain.init();
        } else {
            console.error('Forest calculator module not found or initialization function missing');
        }
        
        // Initialize water calculator module
        if (window.waterMain && typeof window.waterMain.init === 'function') {
            this.modules.water = window.waterMain.init();
        } else {
            console.error('Water calculator module not found or initialization function missing');
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppMain();
    app.init();
});
