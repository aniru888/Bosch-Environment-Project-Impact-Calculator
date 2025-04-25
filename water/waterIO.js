import { downloadCSV } from '../utils.js';

function parseData(form) {
    const formData = new FormData(form);
    const data = {
        rainfall: parseFloat(formData.get('rainfall')),
        catchmentArea: parseFloat(formData.get('catchmentArea')),
        efficiency: parseFloat(formData.get('efficiency')),
        waterPumped: parseFloat(formData.get('waterPumped')),
        energyEfficiency: parseFloat(formData.get('energyEfficiency'))
    };
    return data;
}

function exportResults(results) {
    let csvContent = "Annual Water Captured (KL),Cumulative Water (KL),Annual Energy Saved (kWh),Annual Emissions Reduction (tonnes CO2e),Cumulative Emissions (tonnes CO2e)\n";
    csvContent += `${results.annualWaterCaptured},${results.cumulativeWater},${results.annualEnergySaved},${results.annualEmissionsReduction},${results.cumulativeEmissions}\n`;
    downloadCSV("water_results.csv", csvContent);
}

export {
    parseData,
    exportResults
};
