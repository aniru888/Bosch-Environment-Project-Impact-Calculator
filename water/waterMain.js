import * as utils from '../utils.js';
import * as domUtils from '../domUtils.js';
import * as waterCalcs from './waterCalcs.js';
import * as waterIO from './waterIO.js';
import * as waterEnhanced from './waterEnhanced.js';

class WaterCalculatorManager {
    constructor() {
        this.form = document.getElementById('water-form');
        this.resultsContainer = document.getElementById('water-results');
        this.exportBtn = document.getElementById('water-export-btn');
        this.lastCalculatedResults = null;
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.exportBtn.addEventListener('click', this.handleExport.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.form);
        const inputValues = this.parseFormData(formData);
        const results = this.calculateResults(inputValues);
        this.displayResults(results);
        this.lastCalculatedResults = results;
    }

    parseFormData(formData) {
        const inputValues = {};
        formData.forEach((value, key) => {
            inputValues[key] = parseFloat(value);
        });
        return inputValues;
    }

    calculateResults(inputValues) {
        const annualWaterCaptured = waterCalcs.calculateAnnualWaterCaptured(inputValues);
        const cumulativeWater = waterCalcs.calculateCumulativeWater(annualWaterCaptured);
        const annualEnergySaved = waterCalcs.calculateAnnualEnergySaved(inputValues);
        const annualEmissionsReduction = waterCalcs.calculateAnnualEmissionsReduction(annualEnergySaved);
        const cumulativeEmissions = waterCalcs.calculateCumulativeEmissions(annualEmissionsReduction);

        return {
            annualWaterCaptured,
            cumulativeWater,
            annualEnergySaved,
            annualEmissionsReduction,
            cumulativeEmissions
        };
    }

    displayResults(results) {
        this.resultsContainer.innerHTML = `
            <p>Annual Water Captured: ${results.annualWaterCaptured} KL</p>
            <p>Cumulative Water: ${results.cumulativeWater} KL</p>
            <p>Annual Energy Saved: ${results.annualEnergySaved} kWh</p>
            <p>Annual Emissions Reduction: ${results.annualEmissionsReduction} tonnes CO2e</p>
            <p>Cumulative Emissions: ${results.cumulativeEmissions} tonnes CO2e</p>
        `;
    }

    handleExport() {
        if (!this.lastCalculatedResults) {
            alert('No results to export.');
            return;
        }

        let csvContent = "Year,Annual Water Captured (KL),Cumulative Water (KL),Annual Energy Saved (kWh),Annual Emissions Reduction (tonnes CO2e),Cumulative Emissions (tonnes CO2e)\n";
        this.lastCalculatedResults.yearly.forEach(result => {
            csvContent += `${result.year},${result.annualWaterCaptured},${result.cumulativeWater},${result.annualEnergySaved},${result.annualEmissionsReduction},${result.cumulativeEmissions}\n`;
        });

        utils.downloadCSV("water_capture_results.csv", csvContent);
    }
}

function initWaterCalculator() {
    const calculator = new WaterCalculatorManager();
    calculator.init();
    return calculator;
}

window.initWaterCalculator = initWaterCalculator;
