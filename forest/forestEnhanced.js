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
    let riskBuffer = 20; // Default risk buffer percentage
    
    // Get DOM elements
    const greenCoverSection = document.getElementById('green-cover-section');
    const carbonCreditsSection = document.getElementById('carbon-credits-section');
    const riskBufferInput = document.getElementById('risk-buffer');
    
    // Add event listeners
    if (riskBufferInput) {
        riskBufferInput.addEventListener('input', function() {
            riskBuffer = parseFloat(this.value) || 20;
            // If results are already displayed, update the carbon credits
            const results = window.forestMain?.getLastResults();
            if (results) {
                updateCarbonCreditsCalculation(results);
            }
        });
    }
    
    /**
     * Update green cover metrics
     * @param {Object} inputs - Project inputs
     */
    function updateGreenCoverMetrics(inputs) {
        if (!greenCoverSection) return;
        
        // Show green cover section
        domUtils.showElement(greenCoverSection);
        
        // Calculate final green cover based on area and planting density
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
        domUtils.updateMetric('initial-green-cover', initialGreenCover, 1);
        domUtils.updateMetric('final-green-cover', finalGreenCover, 1);
        domUtils.updateMetric('green-cover-increase', greenCoverIncrease, 1);
    }
    
    /**
     * Update carbon credits calculation
     * @param {Object} results - Calculation results
     */
    function updateCarbonCreditsCalculation(results) {
        if (!carbonCreditsSection) return;
        
        // Show carbon credits section
        domUtils.showElement(carbonCreditsSection);
        
        // Get carbon price from form
        const carbonPriceInput = document.getElementById('forest-carbon-price');
        const carbonPrice = carbonPriceInput ? parseFloat(carbonPriceInput.value) || 5 : 5;
        
        // Calculate carbon credits after risk buffer
        const totalCO2e = results.summary.totalCO2e;
        const creditsAfterBuffer = totalCO2e * (1 - riskBuffer / 100);
        const revenue = creditsAfterBuffer * carbonPrice;
        
        // Update UI
        domUtils.updateMetric('carbon-credits', creditsAfterBuffer, 0);
        domUtils.updateMetric('carbon-revenue', revenue, 0);
        domUtils.updateMetric('risk-buffer', riskBuffer, 0);
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
 * Update all enhanced features in the UI
 * @param {Object} inputs - Project inputs
 * @param {Object} results - Calculation results
 * @param {Array} speciesData - Species data for multi-species mode
 */
function updateAllEnhancedFeatures(inputs, results, speciesData) {
    // Set up green cover and carbon credits
    const greenCoverAndCredits = setupGreenCoverAndCredits(speciesData);
    
    // Update green cover metrics
    greenCoverAndCredits.updateGreenCoverMetrics(inputs);
    
    // Update carbon credits calculation
    greenCoverAndCredits.updateCarbonCreditsCalculation(results);
    
    // Calculate and update biodiversity metrics
    const biodiversity = calculateBiodiversityEnhancement(inputs, speciesData);
    const biodiversitySection = document.getElementById('biodiversity-section');
    if (biodiversitySection) {
        domUtils.showElement(biodiversitySection);
        forestDOM.updateBiodiversity(biodiversity);
    }
    
    // Calculate and update beneficiaries metrics
    const beneficiaries = calculateBeneficiaries(inputs);
    const beneficiariesSection = document.getElementById('beneficiaries-section');
    if (beneficiariesSection) {
        domUtils.showElement(beneficiariesSection);
        forestDOM.updateBeneficiaries(beneficiaries);
    }
}

// Export functions
window.forestEnhanced = {
    setupGreenCoverAndCredits,
    calculateBiodiversityEnhancement,
    calculateBeneficiaries,
    updateAllEnhancedFeatures
};
