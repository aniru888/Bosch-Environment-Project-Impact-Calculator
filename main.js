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
        if (typeof window.initForestCalculator === 'function') {
            this.modules.forest = window.initForestCalculator();
        }
        
        // Initialize water calculator module
        if (typeof window.initWaterCalculator === 'function') {
            this.modules.water = window.initWaterCalculator();
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppMain();
    app.init();
});
