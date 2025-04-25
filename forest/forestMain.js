import { calculateSequestration, calculateCost, calculateBiodiversity, calculateBeneficiaries } from './forestCalcs.js';
import { setupForm, validateForm, displayResults, handleError } from './forestDOM.js';
import { uploadSpeciesFile, parseData, exportResults } from './forestIO.js';

class ForestCalculatorManager {
    constructor() {
        this.form = document.getElementById('forest-form');
        this.resultsContainer = document.getElementById('forest-results');
        this.exportButton = document.getElementById('forest-export-btn');
        this.lastCalculatedResults = null;
    }

    init() {
        setupForm(this.form);
        this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        this.exportButton.addEventListener('click', () => this.handleExport());
    }

    handleFormSubmit(event) {
        event.preventDefault();
        if (validateForm(this.form)) {
            try {
                const data = parseData(this.form);
                this.lastCalculatedResults = this.calculateResults(data);
                displayResults(this.resultsContainer, this.lastCalculatedResults);
            } catch (error) {
                handleError(this.resultsContainer, error);
            }
        }
    }

    calculateResults(data) {
        const sequestration = calculateSequestration(data);
        const cost = calculateCost(data);
        const biodiversity = calculateBiodiversity(data);
        const beneficiaries = calculateBeneficiaries(data);
        return { sequestration, cost, biodiversity, beneficiaries };
    }

    handleExport() {
        if (this.lastCalculatedResults) {
            exportResults(this.lastCalculatedResults);
        } else {
            alert('No results to export.');
        }
    }
}

function initForestCalculator() {
    const calculator = new ForestCalculatorManager();
    calculator.init();
    return calculator;
}

window.initForestCalculator = initForestCalculator;
