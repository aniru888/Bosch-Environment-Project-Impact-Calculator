/**
 * Analytics tracking for the A/R Project Impact Calculator
 */

const analytics = {
    /**
     * Initialize analytics
     */
    init() {
        console.log('Analytics system initialized');
    },
    
    /**
     * Track an event
     * @param {string} category - Event category (e.g., 'Forest', 'Water')
     * @param {string} action - Event action (e.g., 'Calculate', 'Export')
     * @param {object} data - Additional event data
     */
    trackEvent(category, action, data = {}) {
        // In a real implementation, this would send the event to an analytics service
        console.log(`[Analytics] Event tracked: ${category} - ${action}`);
        
        // Log data if present
        if (Object.keys(data).length > 0) {
            console.log('[Analytics] Event data:', data);
        }
    },
    
    /**
     * Track a calculation event
     * @param {string} module - Module name ('Forest' or 'Water')
     * @param {object} inputs - Calculation inputs
     * @param {object} results - Calculation results summary
     */
    trackCalculation(module, inputs, results) {
        // Simple safeguard to ensure results exist before sanitizing
        const sanitizedResults = results ? this._sanitizeResults(results) : {};
        
        this.trackEvent(module, 'Calculate', {
            inputs: this._sanitizeInputs(inputs),
            resultsSummary: sanitizedResults
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
        // Added safety check to handle both direct summary objects and objects containing summary property
        if (!results) return {};
        
        // If results is already a summary object (has totalCO2e, etc), return it directly
        if (results.totalCO2e !== undefined || results.annualWaterCaptured !== undefined) {
            return results;
        }
        
        // If results has a summary property, return that
        if (results.summary) {
            return results.summary;
        }
        
        // If we couldn't find summary data, return an empty object
        return {};
    }
};

// Register analytics globally
window.analytics = analytics;
