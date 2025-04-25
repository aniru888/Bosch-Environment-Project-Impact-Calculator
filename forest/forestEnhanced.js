import { calculateSequestration, calculateCost, calculateBiodiversity, calculateBeneficiaries } from './forestCalcs.js';
import { setupForm, validateForm, displayResults, handleError } from './forestDOM.js';
import { uploadSpeciesFile, parseData, exportResults } from './forestIO.js';

class ForestEnhancedManager {
    constructor() {
        this.form = document.getElementById('forest-enhanced-form');
        this.resultsContainer = document.getElementById('forest-enhanced-results');
        this.exportButton = document.getElementById('forest-enhanced-export-btn');
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

function initForestEnhancedCalculator() {
    const calculator = new ForestEnhancedManager();
    calculator.init();
    return calculator;
}

window.initForestEnhancedCalculator = initForestEnhancedCalculator;
