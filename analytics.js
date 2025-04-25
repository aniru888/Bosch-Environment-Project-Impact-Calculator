/**
 * Analytics tracking for the A/R Project Impact Calculator
 */

const analytics = {
    /**
     * Initialize analytics
     */
    init() {
        this.events = [];
        console.log('Analytics initialized');
    },
    
    /**
     * Track an event
     * @param {string} category - Event category (e.g., 'Forest', 'Water')
     * @param {string} action - Event action (e.g., 'Calculate', 'Export')
     * @param {object} data - Additional event data
     */
    trackEvent(category, action, data = {}) {
        const event = {
            category,
            action,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.events.push(event);
        console.log(`Analytics event tracked: ${category} - ${action}`, data);
        
        // In a real implementation, you might send this to a server or analytics service
    },
    
    /**
     * Track a calculation event
     * @param {string} module - Module name ('Forest' or 'Water')
     * @param {object} inputs - Calculation inputs
     * @param {object} results - Calculation results summary
     */
    trackCalculation(module, inputs, results) {
        this.trackEvent(module, 'Calculate', {
            inputs: this._sanitizeInputs(inputs),
            resultsSummary: this._sanitizeResults(results)
        });
    },
    
    /**
     * Track an export event
     * @param {string} module - Module name ('Forest' or 'Water')
     * @param {string} format - Export format ('CSV', 'PDF')
     */
    trackExport(module, format) {
        this.trackEvent(module, 'Export', { format });
    },
    
    /**
     * Remove sensitive data from inputs before tracking
     * @param {object} inputs - The input data
     * @returns {object} - Sanitized input data
     * @private
     */
    _sanitizeInputs(inputs) {
        // In a real implementation, you might remove or mask sensitive data
        // For this example, we'll just return basic project info
        const { projectName, area, projectDuration } = inputs;
        return { projectName, area, projectDuration };
    },
    
    /**
     * Simplify results for tracking
     * @param {object} results - The results data
     * @returns {object} - Simplified results data
     * @private
     */
    _sanitizeResults(results) {
        // Return only summary metrics for tracking
        if (!results || !results.summary) return {};
        return results.summary;
    }
};

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    analytics.init();
});

// Make analytics available globally
window.analytics = analytics;
