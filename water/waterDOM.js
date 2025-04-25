import * as domUtils from '../domUtils.js';

class WaterDOMManager {
    constructor() {
        this.form = document.getElementById('water-form');
        this.resultsContainer = document.getElementById('water-results');
    }

    setupForm() {
        // Add form fields for Water Module
        const fields = [
            { label: 'Rainfall (mm)', name: 'rainfall', type: 'number' },
            { label: 'Catchment Area (m²)', name: 'catchmentArea', type: 'number' },
            { label: 'Efficiency (%)', name: 'efficiency', type: 'number' },
            { label: 'Water Pumped (KL)', name: 'waterPumped', type: 'number' },
            { label: 'Energy Efficiency (kWh/KL)', name: 'energyEfficiency', type: 'number' }
        ];

        fields.forEach(field => {
            const fieldElement = domUtils.createElement('div', { class: 'form-field' });
            const label = domUtils.createElement('label', { for: field.name }, field.label);
            const input = domUtils.createElement('input', { type: field.type, name: field.name, required: true });
            fieldElement.appendChild(label);
            fieldElement.appendChild(input);
            this.form.appendChild(fieldElement);
        });
    }

    validateForm() {
        // Add form validation logic
        const inputs = this.form.querySelectorAll('input');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    displayResults(results) {
        // Display results in the results container
        domUtils.clearElementContent(this.resultsContainer);

        const resultElements = [
            { label: 'Annual Water Captured (KL)', value: results.annualWaterCaptured },
            { label: 'Cumulative Water (KL)', value: results.cumulativeWater },
            { label: 'Annual Energy Saved (kWh)', value: results.annualEnergySaved },
            { label: 'Annual Emissions Reduction (tonnes CO2e)', value: results.annualEmissionsReduction },
            { label: 'Cumulative Emissions (tonnes CO2e)', value: results.cumulativeEmissions }
        ];

        resultElements.forEach(result => {
            const resultElement = domUtils.createElement('p', {}, `${result.label}: ${result.value}`);
            this.resultsContainer.appendChild(resultElement);
        });
    }

    showError(message) {
        // Display error message
        const errorElement = domUtils.createElement('p', { class: 'error-message' }, message);
        this.resultsContainer.appendChild(errorElement);
    }
}

export default WaterDOMManager;
