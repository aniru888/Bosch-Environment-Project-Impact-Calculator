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
    let finalGreenCover = 0; // Variable to store the calculated final green cover
    
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
        // Logic to calculate initial green cover (can be simple or complex)
        // For now, returning the default assumption
        return initialGreenCover;
    }
    
    /**
     * Update green cover metrics and return the calculated final green cover.
     * @param {Object} inputs - Project inputs (area, plantingDensity, mortalityRate, projectDuration)
     * @returns {number} - Calculated final green cover percentage.
     */
    function updateGreenCoverMetrics(inputs) {
        if (!greenCoverSection) return 0; // Return 0 if section is missing
        
        // Calculate final green cover based on area and planting density.
        // This is a simplified model assuming each mature tree covers ~25m²
        const { area, plantingDensity, mortalityRate, projectDuration } = inputs;
        
        // Add safety checks for input values
        const safeArea = parseFloat(area) || 0;
        const safePlantingDensity = parseFloat(plantingDensity) || 0;
        const safeMortalityRate = parseFloat(mortalityRate) || 0;
        const safeProjectDuration = parseFloat(projectDuration) || 0;
        
        if (safeArea <= 0 || safePlantingDensity <= 0) {
             finalGreenCover = initialGreenCover; // Default to initial if inputs are invalid
             console.warn('Invalid inputs for green cover calculation, defaulting to initial.');
        } else {
            const totalPlantedTrees = safeArea * safePlantingDensity;
            const survivingTreesRatio = Math.pow(1 - safeMortalityRate / 100, safeProjectDuration);
            const survivingTrees = totalPlantedTrees * survivingTreesRatio;
            
            // Each tree covers approximately 25m² at maturity (simplified model)
            const treeCoverageArea = 25; // m² per tree
            const totalCoverageArea = Math.min(survivingTrees * treeCoverageArea, safeArea * 10000); // Cannot exceed total area
            
            // Calculate green cover percentage
            finalGreenCover = Math.min(100, (totalCoverageArea / (safeArea * 10000)) * 100);
        }
        
        const currentInitialGreenCover = calculateInitialGreenCover();
        const greenCoverIncrease = finalGreenCover - currentInitialGreenCover;
        
        // Update UI
        domUtils.updateMetric('initial-green-cover', currentInitialGreenCover, 1);
        domUtils.updateMetric('final-green-cover', finalGreenCover, 1);
        domUtils.updateMetric('green-cover-increase', greenCoverIncrease, 1);
        
        // Return the calculated final green cover
        return finalGreenCover; 
    }
    
    /**
     * Update carbon credits calculation
     * @param {Object} results - Calculation results (specifically results.summary.totalCO2e)
     */
    function updateCarbonCreditsCalculation(results) {
        if (!carbonCreditsSection) return;
        if (!results || !results.summary) {
            console.error('Missing summary data for carbon credit calculation');
            return;
        }
        
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
        updateGreenCoverMetrics, // Returns finalGreenCover
        updateCarbonCreditsCalculation,
        calculateInitialGreenCover
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
    const biodiversityIndex = speciesCount > 0 ? (Math.log(speciesCount + 1) / Math.log(10) * 100) : 0;
    
    // Estimate habitat creation (in square meters)
    const habitatCreation = (parseFloat(area) || 0) * 10000;
    
    // Potential species supported (simple estimate)
    // Forest ecosystems can support roughly 5x the number of tree species in other flora/fauna
    const potentialSpeciesSupported = Math.round(speciesCount * 5);
    
    return {
        biodiversityIndex: Math.min(100, biodiversityIndex), // Cap at 100
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
    const { area } = inputs;
    const safeArea = parseFloat(area) || 0;
    
    // Calculate direct beneficiaries (people directly involved or benefiting from the project)
    // Simplified model: ~10 people per hectare directly benefiting (workers, landowners, etc.)
    const directBeneficiaries = Math.round(safeArea * 10);
    
    // Calculate indirect beneficiaries (people indirectly benefiting from ecosystem services)
    // Simplified model: ~50 people per hectare indirectly benefiting
    const indirectBeneficiaries = Math.round(safeArea * 50);
    
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
 * @returns {object} - Object containing all calculated enhanced features.
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

    // Check if multi-species mode is enabled using the correct function name
    const isMultiSpecies = window.forestIO && typeof window.forestIO.isMultiSpeciesMode === 'function' ? window.forestIO.isMultiSpeciesMode() : false;
    const speciesData = isMultiSpecies && window.forestIO.getLoadedSpeciesData ? window.forestIO.getLoadedSpeciesData() : [];

    // Setup green cover and carbon credits management
    const greenCoverAndCredits = setupGreenCoverAndCredits(speciesData);

    // Update green cover metrics AND CAPTURE the returned finalGreenCover
    const finalGreenCover = greenCoverAndCredits.updateGreenCoverMetrics(inputs);

    // Update carbon credits (now it uses summary.totalCO2e)
    greenCoverAndCredits.updateCarbonCreditsCalculation({ summary });

    // Calculate biodiversity enhancements
    const biodiversityResults = calculateBiodiversityEnhancement(inputs, speciesData);

    // Calculate beneficiaries
    const beneficiariesResults = calculateBeneficiaries(inputs);

    // Get initial green cover value
    const initialGreenCover = greenCoverAndCredits.calculateInitialGreenCover();
    const greenCoverIncrease = finalGreenCover - initialGreenCover;

    // Return calculated data in a structured object
    return {
        biodiversityIndex: biodiversityResults.biodiversityIndex,
        speciesCount: biodiversityResults.speciesCount,
        habitatCreation: biodiversityResults.habitatCreation,
        speciesSupported: biodiversityResults.potentialSpeciesSupported,
        initialGreenCover: initialGreenCover,
        finalGreenCover: finalGreenCover, // Use the captured value
        greenCoverIncrease: greenCoverIncrease,
        directBeneficiaries: beneficiariesResults.directBeneficiaries,
        indirectBeneficiaries: beneficiariesResults.indirectBeneficiaries,
        totalBeneficiaries: beneficiariesResults.totalBeneficiaries
    };
}

// Export functions
window.forestEnhanced = {
    // setupGreenCoverAndCredits is internal, only export calculateEnhancedFeatures if needed externally
    calculateEnhancedFeatures
};
