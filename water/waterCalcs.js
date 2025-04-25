/**
 * Water calculation logic for the Water module
 */

/**
 * Function to calculate annual water captured
 * @param {Object} inputValues - The input values from the form
 * @returns {number} - The annual water captured in kiloliters (KL)
 */
function calculateAnnualWaterCaptured(inputValues) {
    const { rainfall, catchmentArea, efficiency } = inputValues;
    return rainfall * catchmentArea * efficiency;
}

/**
 * Function to calculate cumulative water captured
 * @param {number} annualWaterCaptured - The annual water captured in kiloliters (KL)
 * @returns {number} - The cumulative water captured in kiloliters (KL)
 */
function calculateCumulativeWater(annualWaterCaptured) {
    // Assuming a project duration of 10 years for cumulative calculation
    const projectDuration = 10;
    return annualWaterCaptured * projectDuration;
}

/**
 * Function to calculate annual energy saved
 * @param {Object} inputValues - The input values from the form
 * @returns {number} - The annual energy saved in kilowatt-hours (kWh)
 */
function calculateAnnualEnergySaved(inputValues) {
    const { waterPumped, energyEfficiency } = inputValues;
    return waterPumped * energyEfficiency;
}

/**
 * Function to calculate annual emissions reduction
 * @param {number} annualEnergySaved - The annual energy saved in kilowatt-hours (kWh)
 * @returns {number} - The annual emissions reduction in tonnes of CO2 equivalent (tonnes CO2e)
 */
function calculateAnnualEmissionsReduction(annualEnergySaved) {
    const emissionsFactor = 0.000233; // Emissions factor in tonnes CO2e per kWh
    return annualEnergySaved * emissionsFactor;
}

/**
 * Function to calculate cumulative emissions reduction
 * @param {number} annualEmissionsReduction - The annual emissions reduction in tonnes of CO2 equivalent (tonnes CO2e)
 * @returns {number} - The cumulative emissions reduction in tonnes of CO2 equivalent (tonnes CO2e)
 */
function calculateCumulativeEmissions(annualEmissionsReduction) {
    // Assuming a project duration of 10 years for cumulative calculation
    const projectDuration = 10;
    return annualEmissionsReduction * projectDuration;
}

export {
    calculateAnnualWaterCaptured,
    calculateCumulativeWater,
    calculateAnnualEnergySaved,
    calculateAnnualEmissionsReduction,
    calculateCumulativeEmissions
};
