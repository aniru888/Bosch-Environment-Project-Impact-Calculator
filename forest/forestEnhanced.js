/**
 * Forest Enhanced Features Module
 * Handles extended features like carbon credits, biodiversity, and beneficiaries
 */

/**
 * Set up green cover and carbon credits functionality
 * @param {Array} speciesData - Species data for multi-species mode
 * @returns {Object} - Methods to update metrics
 */
function setupGreenCoverAndCredits(speciesData) {
    // Set up variables
    let initialGreenCover = 10; // Default initial green cover percentage (assumption)
    let finalGreenCover = 0;
    // Get DOM elements
    const greenCoverSection = document.getElementById('green-cover-section');
    const carbonCreditsSection = document.getElementById('carbon-credits-section');
    const riskBufferInput = document.getElementById('risk-buffer-input');
    const riskBufferDisplay = document.getElementById('risk-buffer');
    
    // Add event listener to risk buffer input
    if (riskBufferInput) {
        riskBufferInput.addEventListener('input', function() {
            const riskBuffer = parseFloat(this.value) || 20;
            // Update display
            if (riskBufferDisplay) {
                riskBufferDisplay.textContent = riskBuffer;
            }
            // If results are already displayed, update the carbon credits
            const results = window.forestMain?.getLastResults();
            if (results && window.forestDOM) {
                const carbonPrice = parseFloat(document.getElementById('forest-carbon-price')?.value) || 5;
                window.forestDOM.updateCarbonCredits(results.summary.totalCO2e, carbonPrice, riskBuffer);
            }
        });
    }
    
    function calculateInitialGreenCover(){
        const results = window.forestMain?.getLastResults();
        if (!results){
            return initialGreenCover;
        }
        return initialGreenCover;
    }
    
    /**
     * Update green cover metrics
     * @param {Object} inputs - Project inputs
     */
    function updateGreenCoverMetrics(inputs) {
        if (!greenCoverSection) return;
        
        // Calculate final green cover based on area and planting density.
        // This is a simplified model assuming each mature tree covers ~25m²
        const { area, plantingDensity, mortalityRate, projectDuration } = inputs;
        const totalPlantedTrees = area * plantingDensity;
        const survivingTreesRatio = Math.pow(1 - mortalityRate / 100, projectDuration);
        const survivingTrees = totalPlantedTrees * survivingTreesRatio;
        
        // Each tree covers approximately 25m² at maturity (simplified model)
        const treeCoverageArea = 25; // m² per tree
        const totalCoverageArea = Math.min(survivingTrees * treeCoverageArea, area * 10000); // Cannot exceed total area
        
        // Calculate green cover percentage
        finalGreenCover = Math.min(100, (totalCoverageArea / (area * 10000)) * 100);
        const greenCoverIncrease = finalGreenCover - initialGreenCover;
        
        // Update UI
        domUtils.updateMetric('initial-green-cover', calculateInitialGreenCover(), 1);
        domUtils.updateMetric('final-green-cover', finalGreenCover, 1);
        domUtils.updateMetric('green-cover-increase', greenCoverIncrease, 1);
    }
    
    /**
     * Update carbon credits calculation
     * @param {Object} results - Calculation results
     */
    function updateCarbonCreditsCalculation(results) {
        if (!carbonCreditsSection) return;
        
        // Get carbon price and risk buffer from inputs
        const carbonPrice = parseFloat(document.getElementById('forest-carbon-price')?.value) || 5;
        const riskBuffer = parseFloat(riskBufferInput?.value) || 20;
        
        // Use the centralized DOM method to update carbon credits
        if (window.forestDOM) {
            window.forestDOM.updateCarbonCredits(results.summary.totalCO2e, carbonPrice, riskBuffer);
        }
    }
    
    // Return functions for external access
    return {
        updateGreenCoverMetrics,
        updateCarbonCreditsCalculation
    };
}

/**
 * Set up biodiversity enhancement features
 * @param {Object} inputs - Project inputs
 * @param {Array} speciesData - Species data for multi-species mode
 * @returns {Object} - Biodiversity metrics
 */
function calculateBiodiversityEnhancement(inputs, speciesData) {
    const { area } = inputs;
    
    // Basic biodiversity index based on number of species
    const speciesCount = speciesData && speciesData.length > 0 ? speciesData.length : 1;
    
    // Biodiversity index calculation (logarithmic scale from 0-100)
    // More species = higher biodiversity
    const biodiversityIndex = Math.log(speciesCount + 1) / Math.log(10) * 100;
    
    // Estimate habitat creation (in square meters)
    const habitatCreation = area * 10000;
    
    // Potential species supported (simple estimate)
    // Forest ecosystems can support roughly 5x the number of tree species in other flora/fauna
    const potentialSpeciesSupported = Math.round(speciesCount * 5);
    
    return {
        biodiversityIndex,
        speciesCount,
        habitatCreation,
        potentialSpeciesSupported
    };
}

/**
 * Set up beneficiaries calculation
 * @param {Object} inputs - Project inputs
 * @returns {Object} - Beneficiaries metrics
 */
function calculateBeneficiaries(inputs) {
    const { area, projectDuration } = inputs;
    
    // Calculate direct beneficiaries (people directly involved or benefiting from the project)
    // Simplified model: ~10 people per hectare directly benefiting (workers, landowners, etc.)
    const directBeneficiaries = Math.round(area * 10);
    
    // Calculate indirect beneficiaries (people indirectly benefiting from ecosystem services)
    // Simplified model: ~50 people per hectare indirectly benefiting
    const indirectBeneficiaries = Math.round(area * 50);
    
    // Total beneficiaries
    const totalBeneficiaries = directBeneficiaries + indirectBeneficiaries;
    
    return {
        directBeneficiaries,
        indirectBeneficiaries,
        totalBeneficiaries
    };
}

/**
 * Calculate all enhanced features
 * @param {Array} yearlyData - Yearly data for calculations
 * @param {Object} summary - Summary results for calculations
 * @param {Object} formData - Project inputs
 */
function calculateEnhancedFeatures(yearlyData, summary, formData) {
     // Extract inputs from formData
    const { area, plantingDensity, mortalityRate, projectDuration } = formData;

    // Ensure data integrity: use default if data is missing or invalid
    const inputs = {
        area: parseFloat(area) || 0,
        plantingDensity: parseFloat(plantingDensity) || 0,
        mortalityRate: parseFloat(mortalityRate) || 0,
        projectDuration: parseFloat(projectDuration) || 0,
    };

    // Check if multi-species mode is enabled
    const speciesData = window.forestIO.isMultiSpecies() ? window.forestIO.getSpeciesData() : [];

    // Setup green cover and carbon credits management
    const greenCoverAndCredits = setupGreenCoverAndCredits(speciesData);

    // Update green cover metrics (before updating carbon credits)
    greenCoverAndCredits.updateGreenCoverMetrics(inputs);

    // Update carbon credits (now it uses summary.totalCO2e)
    greenCoverAndCredits.updateCarbonCreditsCalculation({ summary });

    // Calculate biodiversity enhancements
    const { biodiversityIndex, speciesCount, habitatCreation, potentialSpeciesSupported } = calculateBiodiversityEnhancement(inputs, speciesData);

    // Calculate beneficiaries
    const { directBeneficiaries, indirectBeneficiaries, totalBeneficiaries } = calculateBeneficiaries(inputs);

    // Return calculated data
    return { biodiversityIndex, speciesCount, habitatCreation, speciesSupported: potentialSpeciesSupported, initialGreenCover: greenCoverAndCredits.calculateInitialGreenCover(), finalGreenCover, greenCoverIncrease: finalGreenCover - greenCoverAndCredits.calculateInitialGreenCover(), directBeneficiaries, indirectBeneficiaries, totalBeneficiaries };
}

// Export functions
window.forestEnhanced = {
    setupGreenCoverAndCredits,
    calculateEnhancedFeatures
};
