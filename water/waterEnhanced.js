/**
 * Enhanced features for the Water module
 */

/**
 * Function to calculate water conservation metrics
 * @param {Object} inputValues - The input values from the form
 * @returns {Object} - The water conservation metrics
 */
function calculateWaterConservationMetrics(inputValues) {
    const { rainfall, catchmentArea, efficiency, waterPumped, energyEfficiency } = inputValues;
    const annualWaterCaptured = rainfall * catchmentArea * efficiency;
    const cumulativeWater = annualWaterCaptured * 10; // Assuming a project duration of 10 years
    const annualEnergySaved = waterPumped * energyEfficiency;
    const emissionsFactor = 0.000233; // Emissions factor in tonnes CO2e per kWh
    const annualEmissionsReduction = annualEnergySaved * emissionsFactor;
    const cumulativeEmissions = annualEmissionsReduction * 10; // Assuming a project duration of 10 years

    return {
        annualWaterCaptured,
        cumulativeWater,
        annualEnergySaved,
        annualEmissionsReduction,
        cumulativeEmissions
    };
}

export {
    calculateWaterConservationMetrics
};
