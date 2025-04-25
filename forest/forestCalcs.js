/**
 * Forest calculations module for the A/R Project Impact Calculator
 * Contains the core logic for forest sequestration calculations
 */

// Constants for calculations
const CO2_FACTOR = 44/12; // Conversion factor from C to CO2

// Event system for forest module
const forestEventSystem = {
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
 * Calculate carbon sequestration for a forest project
 * @param {object} data - Project data including area, growth rate, etc.
 * @returns {object} - Sequestration results
 */
function calculateSequestration(data) {
    // Extract inputs
    const {
        area,
        projectDuration,
        plantingDensity,
        growthRate,
        mortalityRate,
        woodDensity,
        bef,
        rsr,
        carbonFraction
    } = data;
    
    const results = {
        yearly: [],
        summary: {
            totalCO2e: 0,
            avgAnnualCO2e: 0,
            finalCarbonStock: 0
        }
    };
    
    // Calculate initial number of trees
    const initialTrees = area * plantingDensity;
    
    // Calculate yearly values
    let cumulativeCO2e = 0;
    let previousCO2e = 0;
    
    for (let year = 1; year <= projectDuration; year++) {
        // Calculate surviving trees based on mortality rate
        const survivingTreesRatio = Math.pow(1 - mortalityRate / 100, year);
        const survivingTrees = initialTrees * survivingTreesRatio;
        
        // Calculate growing stock (volume of wood in m³)
        // Simplified model: area * growth rate * years * surviving trees ratio
        const growingStock = area * growthRate * year * survivingTreesRatio / plantingDensity;
        
        // Calculate above-ground biomass (tonnes)
        const aboveGroundBiomass = growingStock * woodDensity * bef;
        
        // Calculate below-ground biomass (tonnes)
        const belowGroundBiomass = aboveGroundBiomass * rsr;
        
        // Calculate total biomass (tonnes)
        const totalBiomass = aboveGroundBiomass + belowGroundBiomass;
        
        // Calculate carbon content (tonnes C)
        const carbonContent = totalBiomass * carbonFraction;
        
        // Calculate CO2 equivalent (tonnes CO2e)
        // CO2 factor: 44/12 is the ratio of molecular weight of CO2 to C
        const co2e = carbonContent * CO2_FACTOR;
        
        // Calculate annual increment
        const annualIncrement = year > 1 ? co2e - previousCO2e : co2e;
        previousCO2e = co2e;
        
        // Update cumulative CO2e
        cumulativeCO2e += annualIncrement;
        
        // Store yearly data
        results.yearly.push({
            year,
            survivingTrees: Math.round(survivingTrees),
            growingStock,
            aboveGroundBiomass,
            belowGroundBiomass,
            totalBiomass,
            carbonContent,
            co2e,
            annualIncrement,
            cumulativeCO2e
        });
    }
    
    // Calculate summary metrics
    const finalYear = results.yearly[results.yearly.length - 1];
    results.summary.totalCO2e = finalYear.cumulativeCO2e;
    results.summary.avgAnnualCO2e = finalYear.cumulativeCO2e / projectDuration;
    results.summary.finalCarbonStock = finalYear.carbonContent;
    
    return results;
}

/**
 * Calculate sequestration for multiple species
 * @param {object} data - Project data
 * @param {Array} speciesData - Array of species objects with proportions
 * @returns {object} - Sequestration results
 */
function calculateSequestrationMultiSpecies(data, speciesData) {
    // Initialize results structure
    const results = {
        yearly: [],
        summary: {
            totalCO2e: 0,
            avgAnnualCO2e: 0,
            finalCarbonStock: 0
        },
        species: []
    };
    
    // Calculate sequestration for each species
    for (const species of speciesData) {
        // Create species-specific data
        const speciesSpecificData = {
            ...data,
            area: data.area * species.proportion,
            growthRate: species.growthRate || data.growthRate,
            woodDensity: species.woodDensity || data.woodDensity,
            bef: species.bef || data.bef,
            rsr: species.rsr || data.rsr,
            carbonFraction: species.carbonFraction || data.carbonFraction
        };
        
        // Calculate sequestration for this species
        const speciesResults = calculateSequestration(speciesSpecificData);
        
        // Store species results
        results.species.push({
            name: species.name,
            proportion: species.proportion,
            co2e: speciesResults.summary.totalCO2e
        });
        
        // Add to total CO2e
        results.summary.totalCO2e += speciesResults.summary.totalCO2e;
        results.summary.finalCarbonStock += speciesResults.summary.finalCarbonStock;
        
        // Merge yearly data
        if (results.yearly.length === 0) {
            // First species, initialize yearly data
            results.yearly = speciesResults.yearly.map(year => ({
                ...year,
                co2e: year.co2e,
                annualIncrement: year.annualIncrement,
                cumulativeCO2e: year.cumulativeCO2e
            }));
        } else {
            // Add this species' data to existing yearly data
            for (let i = 0; i < results.yearly.length; i++) {
                results.yearly[i].co2e += speciesResults.yearly[i].co2e;
                results.yearly[i].annualIncrement += speciesResults.yearly[i].annualIncrement;
                results.yearly[i].cumulativeCO2e += speciesResults.yearly[i].cumulativeCO2e;
            }
        }
    }
    
    // Calculate average annual CO2e
    results.summary.avgAnnualCO2e = results.summary.totalCO2e / data.projectDuration;
    
    return results;
}

/**
 * Calculate cost analysis for a forest project
 * @param {number} projectCost - Total project cost (USD)
 * @param {number} area - Project area (hectares)
 * @param {object} results - Sequestration results
 * @returns {object} - Cost analysis
 */
function calculateForestCostAnalysis(projectCost, area, results) {
    // Calculate cost per tonne of CO2e
    const costPerTonne = projectCost / results.summary.totalCO2e;
    
    // Calculate cost per hectare
    const costPerHectare = projectCost / area;
    
    // Estimate cost breakdown (simplified model)
    // Establishment: 60%, Maintenance: 30%, Monitoring: 10%
    const establishmentCost = projectCost * 0.6;
    const maintenanceCost = projectCost * 0.3;
    const monitoringCost = projectCost * 0.1;
    
    return {
        costPerTonne,
        costPerHectare,
        establishmentCost,
        maintenanceCost,
        monitoringCost
    };
}

/**
 * Calculate biodiversity benefits
 * @param {object} data - Project data
 * @param {number} speciesCount - Number of tree species
 * @returns {number} - Biodiversity index
 */
function calculateBiodiversity(data, speciesCount = 1) {
    // Basic biodiversity index formula
    // Logarithmic scale based on species count and area
    const biodiversityFactor = Math.log(speciesCount + 1) / Math.log(10);
    const areaFactor = Math.log(data.area + 1) / Math.log(10);
    
    const biodiversityIndex = biodiversityFactor * areaFactor * 20;
    return Math.min(100, biodiversityIndex);
}

/**
 * Calculate beneficiaries of a forest project
 * @param {object} data - Project data
 * @returns {object} - Beneficiaries data
 */
function calculateBeneficiaries(data) {
    const { area, plantingDensity } = data;

    // Input validation
    if (typeof area !== 'number' || area < 0 || typeof plantingDensity !== 'number' || plantingDensity < 0) {
        console.warn('Invalid input for calculateBeneficiaries: area or plantingDensity is invalid.');
        return {
            directBeneficiaries: 0,
            indirectBeneficiaries: 0,
            totalBeneficiaries: 0,
            beneficiariesFactor: 0
        };
    }
    
    // Calculate number of trees planted
    const treesPlanted = area * plantingDensity;
    
    // Calculate direct beneficiaries
    // Simple model: 10 people per hectare
    const directBeneficiaries = Math.round(area * 10);
    
    // Calculate indirect beneficiaries
    // Simple model: 50 people per hectare
    const indirectBeneficiaries = Math.round(area * 50);
    
    // Calculate total beneficiaries
    const totalBeneficiaries = directBeneficiaries + indirectBeneficiaries;
    
    // Calculate beneficiaries factor (for future calculations)
    // Add check to prevent division by zero
    const beneficiariesFactor = treesPlanted > 0 ? totalBeneficiaries / treesPlanted : 0;
    
    return {
        directBeneficiaries,
        indirectBeneficiaries,
        totalBeneficiaries,
        beneficiariesFactor
    };
}

// Export functions via the window object
window.forestCalcs = {
    eventSystem: forestEventSystem,
    calculateSequestration,
    calculateSequestrationMultiSpecies,
    calculateForestCostAnalysis,
    calculateBiodiversity,
    calculateBeneficiaries,
    CO2_FACTOR
};
