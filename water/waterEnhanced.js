/**
 * Enhanced Water Module
 * Provides advanced water impact calculation features
 */

/**
 * Initialize the enhanced water module
 */
function initWaterEnhanced() {
    // Register enhanced calculation methods
    registerEnhancedMethods();
    
    // Set up enhanced UI elements
    setupEnhancedWaterUI();
}

/**
 * Register enhanced calculation methods
 */
function registerEnhancedMethods() {
    // Extend the waterCalcs module with enhanced calculations
    if (window.waterCalcs) {
        // Add enhanced calculation methods
        window.waterCalcs.calculateSeasonalWaterCapture = calculateSeasonalWaterCapture;
        window.waterCalcs.calculateWaterQualityImprovement = calculateWaterQualityImprovement;
        window.waterCalcs.calculateFloodMitigation = calculateFloodMitigation;
        window.waterCalcs.calculateBiodiversityImpact = calculateBiodiversityImpact;
    }
}

/**
 * Set up enhanced UI elements
 */
function setupEnhancedWaterUI() {
    // Add event listeners to any enhanced UI controls
    const seasonalCheckbox = document.getElementById('seasonal-variation');
    if (seasonalCheckbox) {
        seasonalCheckbox.addEventListener('change', toggleSeasonalInputs);
    }
    
    const advancedToggle = document.getElementById('water-advanced-toggle');
    if (advancedToggle) {
        advancedToggle.addEventListener('click', toggleAdvancedOptions);
    }
}

/**
 * Toggle seasonal input visibility
 * @param {Event} event - Change event
 */
function toggleSeasonalInputs(event) {
    const seasonalInputs = document.getElementById('seasonal-inputs');
    if (seasonalInputs) {
        seasonalInputs.style.display = event.target.checked ? 'block' : 'none';
    }
}

/**
 * Toggle advanced options visibility
 */
function toggleAdvancedOptions() {
    const advancedSection = document.getElementById('water-advanced-options');
    if (advancedSection) {
        if (advancedSection.classList.contains('hidden')) {
            advancedSection.classList.remove('hidden');
        } else {
            advancedSection.classList.add('hidden');
        }
    }
}

/**
 * Calculate water capture with seasonal variations
 * @param {object} inputs - Basic inputs
 * @param {object} seasonalData - Seasonal rainfall data
 * @returns {object} - Enhanced calculation results
 */
function calculateSeasonalWaterCapture(inputs, seasonalData) {
    // Get base calculation first
    const baseResults = window.waterCalcs.calculateWaterCapture(inputs);
    
    // Default seasonal data if not provided
    if (!seasonalData || !seasonalData.quarters) {
        seasonalData = {
            quarters: [
                { name: 'Q1', rainFallPct: 0.1 }, // 10%
                { name: 'Q2', rainFallPct: 0.4 }, // 40%
                { name: 'Q3', rainFallPct: 0.4 }, // 40%
                { name: 'Q4', rainFallPct: 0.1 }  // 10%
            ]
        };
    }
    
    // Calculate per-quarter water capture
    const annualWaterCaptured = baseResults.summary.annualWaterCaptured;
    const annualEnergySaved = baseResults.summary.annualEnergySaved;
    const annualEmissionsReduction = baseResults.summary.annualEmissionsReduction;
    
    // Calculate quarterly results
    const quarterlyResults = seasonalData.quarters.map(quarter => {
        const quarterlyWaterCaptured = annualWaterCaptured * quarter.rainFallPct;
        const quarterlyEnergySaved = annualEnergySaved * quarter.rainFallPct;
        const quarterlyEmissionsReduction = annualEmissionsReduction * quarter.rainFallPct;
        
        return {
            name: quarter.name,
            rainFallPct: quarter.rainFallPct,
            waterCaptured: quarterlyWaterCaptured,
            energySaved: quarterlyEnergySaved,
            emissionsReduction: quarterlyEmissionsReduction
        };
    });
    
    // Add quarterly data to results
    return {
        ...baseResults,
        quarterly: quarterlyResults,
        enhanced: true
    };
}

/**
 * Calculate water quality improvement
 * @param {object} inputs - Water project inputs
 * @param {string} initialQuality - Initial water quality category
 * @param {string} targetQuality - Target water quality category
 * @returns {object} - Water quality improvement metrics
 */
function calculateWaterQualityImprovement(inputs, initialQuality = 'poor', targetQuality = 'good') {
    // Water quality categories and their index values (0-100)
    const qualityIndex = {
        'very-poor': 10,
        'poor': 30,
        'moderate': 50,
        'good': 70,
        'excellent': 90
    };
    
    // Get index values or default to moderate if not found
    const initialIndex = qualityIndex[initialQuality] || qualityIndex.moderate;
    const targetIndex = qualityIndex[targetQuality] || qualityIndex.good;
    
    // Calculate quality improvement (percentage points)
    const qualityImprovement = targetIndex - initialIndex;
    
    // Calculate water treatment cost savings based on quality improvement
    // Assumption: Better water quality reduces treatment costs
    // Using a simple model: 10 quality points improvement = 5% cost reduction
    const treatmentCostReduction = (qualityImprovement / 10) * 0.05;
    const annualTreatmentSavings = inputs.waterProjectCost * treatmentCostReduction;
    
    // Calculate ecosystem service value improvement
    // Assuming base ecosystem value of $1000 per hectare for moderate quality
    const baseEcosystemValue = 1000; // $ per hectare per year
    const ecosystemValueMultiplier = 1 + (qualityImprovement / 100);
    const enhancedEcosystemValue = baseEcosystemValue * ecosystemValueMultiplier;
    const totalEcosystemValue = enhancedEcosystemValue * inputs.waterArea;
    
    // Pollutant removal approximation based on quality improvement
    // Assuming each 10 points improvement represents 5% pollutant reduction
    const pollutantRemovalPct = (qualityImprovement / 10) * 0.05;
    
    // Add in human health benefits
    // Assuming health benefit value of $5 per person per year per water quality point
    const healthBenefitPerPerson = qualityImprovement * 5; // $ per person per year
    
    return {
        initialQuality,
        targetQuality,
        initialIndex,
        targetIndex,
        qualityImprovement,
        treatmentCostReduction,
        annualTreatmentSavings,
        enhancedEcosystemValue,
        totalEcosystemValue,
        pollutantRemovalPct,
        healthBenefitPerPerson
    };
}

/**
 * Calculate flood mitigation benefits
 * @param {object} inputs - Water project inputs
 * @returns {object} - Flood mitigation metrics
 */
function calculateFloodMitigation(inputs) {
    // Basic inputs
    const { waterArea, rainFall, runoffCoefficient, captureEfficiency } = inputs;
    
    // Calculate peak flow reduction
    // Assumption: Water projects can reduce peak flows by reducing runoff
    // Formula based on simple hydrological model
    const peakFlowReductionPct = captureEfficiency * 0.6; // 60% of capture efficiency
    
    // Calculate flood risk reduction
    // Assume areal extent of 5x the water body size
    const areaProtected = waterArea * 5; // hectares
    
    // Calculate flood damage prevention value
    // Assume average damage of $10,000 per hectare per flood event
    const avgFloodDamage = 10000; // $ per hectare
    const annualFloodProbability = 0.1; // 10% chance of flood per year
    const annualDamagePrevention = areaProtected * avgFloodDamage * annualFloodProbability * peakFlowReductionPct;
    
    // Calculate stormwater management savings
    // Assume stormwater management costs of $5,000 per hectare
    const stormwaterManagementCost = 5000; // $ per hectare
    const stormwaterSavings = areaProtected * stormwaterManagementCost * peakFlowReductionPct * 0.2; // 20% of potential savings
    
    // Calculate resilience improvement (index from 0-100)
    const resilienceImprovementIndex = peakFlowReductionPct * 100;
    
    return {
        peakFlowReductionPct,
        areaProtected,
        annualDamagePrevention,
        stormwaterSavings,
        resilienceImprovementIndex
    };
}

/**
 * Calculate detailed biodiversity impact
 * @param {object} inputs - Water project inputs
 * @param {string} waterBodyType - Type of water body
 * @param {string} habitatCondition - Condition of habitat before project
 * @returns {object} - Biodiversity impact metrics
 */
function calculateBiodiversityImpact(inputs, waterBodyType = 'lake', habitatCondition = 'degraded') {
    // Biodiversity score modifiers based on water body type
    const typeModifiers = {
        'lake': 1.0,
        'river': 1.2,
        'wetland': 1.5,
        'coastal': 1.3,
        'reservoir': 0.8
    };
    
    // Habitat condition modifiers
    const conditionModifiers = {
        'pristine': 0.1,    // little room for improvement
        'good': 0.3,
        'moderate': 0.6,
        'degraded': 0.8,
        'severely-degraded': 1.0
    };
    
    // Get modifiers or use defaults
    const typeModifier = typeModifiers[waterBodyType] || 1.0;
    const conditionModifier = conditionModifiers[habitatCondition] || 0.6;
    
    // Calculate base biodiversity improvement
    // Formula: Area × Type Modifier × Condition Modifier × Duration Factor
    const durationFactor = Math.min(inputs.projectDuration / 20, 1); // max out at 20 years
    const baseBiodiversityImprovement = inputs.waterArea * typeModifier * conditionModifier * durationFactor;
    
    // Calculate biodiversity index (0-100 scale)
    const biodiversityIndex = Math.min(baseBiodiversityImprovement * 5, 100);
    
    // Estimate species benefited
    // Rough model: 5 species per hectare for fully restored habitats
    const speciesDensity = 5; // species per hectare
    const potentialSpeciesSupported = Math.round(inputs.waterArea * speciesDensity * typeModifier * conditionModifier);
    
    // Calculate ecosystem service value
    // Using benefit transfer method with baseline of $5,000 per hectare per year for fully restored habitat
    const baselineEcosystemValue = 5000; // $ per hectare per year
    const ecosystemServiceValue = inputs.waterArea * baselineEcosystemValue * typeModifier * conditionModifier;
    
    // Calculate habitat connectivity improvement
    // Simple proxy based on area and water body type
    const connectivityImprovement = Math.min((inputs.waterArea / 10) * typeModifier, 1); // 0-1 scale
    
    return {
        waterBodyType,
        habitatCondition,
        biodiversityIndex,
        potentialSpeciesSupported,
        ecosystemServiceValue,
        connectivityImprovement
    };
}

// Export enhanced water module functions
window.waterEnhanced = {
    init: initWaterEnhanced,
    calculateSeasonalWaterCapture,
    calculateWaterQualityImprovement,
    calculateFloodMitigation,
    calculateBiodiversityImpact
};
