/**
 * Water calculations module for the A/R Project Impact Calculator
 * Contains the core logic for water body restoration calculations
 */

// Constants
const CO2_EMISSIONS_PER_KWH = 0.5; // kg CO2 per kWh (average global value)
const KWH_PER_KL_CONVENTIONAL = 2.5; // kWh per kiloliter for conventional water treatment

// Event system for water module
const waterEventSystem = {
    callbacks: {},
    initialized: false,
    
    /**
     * Initialize the event system
     */
    init() {
        this.callbacks = {
            error: [],
            results: [],
            reset: [],
            dataUpdated: []
        };
        this.initialized = true;
    },
    
    /**
     * Register a callback for an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.initialized) this.init();
        
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    },
    
    /**
     * Trigger an event with data
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    trigger(event, data) {
        if (!this.initialized) this.init();
        
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    },
    
    /**
     * Show an error
     * @param {string} message - Error message
     * @param {HTMLElement} element - Element to display error on
     */
    showError(message, element) {
        this.trigger('error', { message, element });
    },
    
    /**
     * Trigger results event
     * @param {object} results - Calculation results
     */
    onResults(results) {
        this.trigger('results', results);
    },
    
    /**
     * Trigger reset event
     */
    onReset() {
        this.trigger('reset');
    },
    
    /**
     * Trigger data updated event
     * @param {object} data - Updated data
     */
    dataUpdated(data) {
        this.trigger('dataUpdated', data);
    }
};

/**
 * Calculate water capture and benefits
 * @param {object} inputs - Calculation inputs
 * @returns {object} - Calculation results
 */
function calculateWaterCapture(inputs) {
    // Extract inputs
    const {
        waterArea,
        rainFall,
        runoffCoefficient,
        captureEfficiency,
        energySavings,
        projectDuration
    } = inputs;
    
    const results = {
        yearly: [],
        summary: {
            totalWaterCaptured: 0,
            annualWaterCaptured: 0,
            totalEnergySaved: 0,
            totalEmissionsReduction: 0,
            annualEmissionsReduction: 0
        }
    };
    
    // Calculate annual water capture in kiloliters (KL)
    // Formula: Area (m²) * Rainfall (mm) * Runoff Coefficient * Capture Efficiency / 1000
    const areaInSquareMeters = waterArea * 10000; // Convert hectares to square meters
    const annualWaterCaptured = (areaInSquareMeters * rainFall * runoffCoefficient * captureEfficiency) / 1000;
    
    // Calculate annual energy savings in kWh
    // Formula: Water captured (KL) * Energy savings per KL (kWh)
    const annualEnergySaved = annualWaterCaptured * energySavings;
    
    // Calculate annual emissions reduction in tonnes of CO2
    // Formula: Energy saved (kWh) * Emissions factor (kg CO2 per kWh) / 1000 to convert to tonnes
    const annualEmissionsReduction = (annualEnergySaved * CO2_EMISSIONS_PER_KWH) / 1000;
    
    // Calculate for each year of the project
    let cumulativeWater = 0;
    let cumulativeEnergy = 0;
    let cumulativeEmissions = 0;
    
    for (let year = 1; year <= projectDuration; year++) {
        // For simplicity, assume the same capture each year
        cumulativeWater += annualWaterCaptured;
        cumulativeEnergy += annualEnergySaved;
        cumulativeEmissions += annualEmissionsReduction;
        
        results.yearly.push({
            year,
            annualWaterCaptured,
            cumulativeWaterCaptured: cumulativeWater,
            annualEnergySaved,
            cumulativeEnergySaved: cumulativeEnergy,
            annualEmissionsReduction,
            cumulativeEmissionsReduction: cumulativeEmissions
        });
    }
    
    // Calculate summary statistics
    results.summary.totalWaterCaptured = cumulativeWater;
    results.summary.annualWaterCaptured = annualWaterCaptured;
    results.summary.totalEnergySaved = cumulativeEnergy;
    results.summary.totalEmissionsReduction = cumulativeEmissions;
    results.summary.annualEmissionsReduction = annualEmissionsReduction;
    
    return results;
}

/**
 * Calculate cost analysis for water project
 * @param {number} waterProjectCost - Total project cost
 * @param {number} waterValue - Value per KL of water
 * @param {object} results - Water capture results
 * @returns {object} - Cost analysis results
 */
function calculateWaterCostAnalysis(waterProjectCost, waterValue, results) {
    const totalWaterCaptured = results.summary.totalWaterCaptured;
    const annualWaterCaptured = results.summary.annualWaterCaptured;
    
    // Calculate cost per KL
    const costPerKL = waterProjectCost / totalWaterCaptured;
    
    // Calculate annual value
    const annualValue = annualWaterCaptured * waterValue;
    
    // Calculate payback period
    const paybackPeriod = waterProjectCost / annualValue;
    
    // Calculate ROI over project duration
    const projectDuration = results.yearly.length;
    const totalValue = totalWaterCaptured * waterValue;
    const roi = ((totalValue - waterProjectCost) / waterProjectCost) * 100;
    
    return {
        costPerKL,
        annualValue,
        paybackPeriod,
        roi
    };
}

/**
 * Calculate environmental benefits
 * @param {object} inputs - Project inputs
 * @param {object} results - Water capture results
 * @returns {object} - Environmental benefits
 */
function calculateEnvironmentalBenefits(inputs, results) {
    const { waterArea, projectDuration } = inputs;
    const { totalWaterCaptured, totalEmissionsReduction } = results.summary;
    
    // Calculate groundwater recharge (estimated as 30% of total water captured)
    const groundwaterRecharge = totalWaterCaptured * 0.3;
    
    // Calculate ecosystem restoration area (in square meters)
    const ecosystemRestoration = waterArea * 10000;
    
    // Calculate biodiversity impact (simplified metric from 0-100)
    // This is a simplistic model based on area and duration
    const biodiversityImpact = Math.min(100, (waterArea * projectDuration) / 2);
    
    return {
        groundwaterRecharge,
        ecosystemRestoration,
        biodiversityImpact,
        emissionsReduction: totalEmissionsReduction
    };
}

/**
 * Calculate beneficiaries of water project
 * @param {object} inputs - Project inputs
 * @param {object} results - Water capture results
 * @returns {object} - Beneficiaries metrics
 */
function calculateWaterBeneficiaries(inputs, results) {
    const { waterArea } = inputs;
    const { totalWaterCaptured } = results.summary;
    
    // Assume average per capita water use of 150L per day
    const dailyWaterUsePerPerson = 0.15; // KL per person per day
    const annualWaterUsePerPerson = dailyWaterUsePerPerson * 365; // KL per person per year
    
    // Number of people who could be supplied annually
    const peopleSupplied = Math.round(results.summary.annualWaterCaptured / annualWaterUsePerPerson);
    
    // Direct beneficiaries (simplified model based on area)
    const directBeneficiaries = Math.round(waterArea * 20); // 20 people per hectare
    
    // Indirect beneficiaries (people downstream who benefit from improved water quality)
    const indirectBeneficiaries = Math.round(peopleSupplied * 2); // 2x the number directly supplied
    
    return {
        peopleSupplied,
        directBeneficiaries,
        indirectBeneficiaries,
        totalBeneficiaries: directBeneficiaries + indirectBeneficiaries
    };
}

// Export functions to window object
window.waterCalcs = {
    eventSystem: waterEventSystem,
    calculateWaterCapture,
    calculateWaterCostAnalysis,
    calculateEnvironmentalBenefits,
    calculateWaterBeneficiaries,
    CO2_EMISSIONS_PER_KWH,
    KWH_PER_KL_CONVENTIONAL
};
