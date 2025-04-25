/**
 * Forest IO module
 * Handles input/output operations for the Forest calculator
 */

// Store species data
let loadedSpeciesData = null;

/**
 * Initialize the Forest IO module
 */
function initForestIO() {
    // Set up file upload handlers
    setupSpeciesUploadHandler();
    
    // Set up download template handler
    setupDownloadTemplateHandler();
    
    // Set up export results handler
    setupExportResultsHandler();
    
    // Set up PDF generation handler
    setupPDFGenerationHandler();
}

/**
 * Set up species upload handler
 */
function setupSpeciesUploadHandler() {
    const fileInput = document.getElementById('forest-species-file');
    if (fileInput) {
        fileInput.addEventListener('change', handleSpeciesFileUpload);
    }
}

/**
 * Set up download template handler
 */
function setupDownloadTemplateHandler() {
    const templateBtn = document.getElementById('download-template-btn');
    if (templateBtn) {
        templateBtn.addEventListener('click', downloadSpeciesTemplate);
    }
}

/**
 * Set up export results handler
 */
function setupExportResultsHandler() {
    const exportBtn = document.getElementById('forest-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportForestResults);
    }
}

/**
 * Set up PDF generation handler
 */
function setupPDFGenerationHandler() {
    const pdfBtn = document.getElementById('forest-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generateForestPDF);
    }
}

/**
 * Handle species file upload
 * @param {Event} event - Change event from file input
 */
function handleSpeciesFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        window.forestCalcs.eventSystem.showError('Please upload a valid CSV file', event.target);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csvData = e.target.result;
            const speciesData = parseSpeciesCSV(csvData);
            handleSpeciesData(speciesData);
        } catch (error) {
            window.forestCalcs.eventSystem.showError('Error parsing CSV: ' + error.message, event.target);
        }
    };
    
    reader.onerror = () => {
        window.forestCalcs.eventSystem.showError('Error reading file', event.target);
    };
    
    reader.readAsText(file);
}

/**
 * Parse CSV data into an array of species objects
 * @param {string} csvData - CSV content as string
 * @returns {Array} - Array of species objects
 */
function parseSpeciesCSV(csvData) {
    // Check if Papa Parse is available
    if (!window.Papa) {
        throw new Error('CSV parsing library not loaded');
    }
    
    const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
    });
    
    if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
    }
    
    // Validate required columns
    const requiredColumns = ['name', 'proportion'];
    const missingColumns = requiredColumns.filter(col => !result.meta.fields.includes(col));
    
    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Process data
    const speciesData = result.data.map(row => {
        return {
            name: row.name,
            proportion: row.proportion,
            growthRate: row.growthRate,
            woodDensity: row.woodDensity,
            bef: row.bef,
            rsr: row.rsr,
            carbonFraction: row.carbonFraction
        };
    });
    
    // Validate species data
    validateSpeciesData(speciesData);
    
    return speciesData;
}

/**
 * Validate species data
 * @param {Array} speciesData - Array of species objects
 */
function validateSpeciesData(speciesData) {
    // Check if array is empty
    if (!speciesData || speciesData.length === 0) {
        throw new Error('No species data found');
    }
    
    // Check if each species has a name and proportion
    for (let i = 0; i < speciesData.length; i++) {
        const species = speciesData[i];
        if (!species.name) {
            throw new Error(`Species at row ${i+1} is missing a name`);
        }
        if (typeof species.proportion !== 'number' || species.proportion <= 0 || species.proportion > 1) {
            throw new Error(`Species "${species.name}" has an invalid proportion (should be between 0 and 1)`);
        }
    }
    
    // Check if proportions sum to 1 (with some tolerance)
    const proportionSum = speciesData.reduce((sum, species) => sum + species.proportion, 0);
    if (Math.abs(proportionSum - 1) > 0.01) {
        throw new Error(`Species proportions should sum to 1 (current sum: ${proportionSum.toFixed(2)})`);
    }
}

/**
 * Handle processed species data
 * @param {Array} speciesData - Array of species objects
 */
function handleSpeciesData(speciesData) {
    // Store the data
    loadedSpeciesData = speciesData;
    
    // Update UI to show loaded species
    updateSpeciesUI(speciesData);
    
    // Notify through event system
    window.forestCalcs.eventSystem.dataUpdated({ speciesData });
}

/**
 * Update UI to show loaded species
 * @param {Array} speciesData - Array of species objects
 */
function updateSpeciesUI(speciesData) {
    const speciesFileInput = document.getElementById('forest-species-file');
    const label = speciesFileInput ? speciesFileInput.nextElementSibling : null;
    
    if (label) {
        label.textContent = `${speciesData.length} species loaded`;
    }
}

/**
 * Get loaded species data
 * @returns {Array|null} - Array of species objects or null if none loaded
 */
function getLoadedSpeciesData() {
    return loadedSpeciesData;
}

/**
 * Check if multiple species mode is active
 * @returns {boolean} - True if multiple species loaded
 */
function isMultiSpeciesMode() {
    return loadedSpeciesData && loadedSpeciesData.length > 0;
}

/**
 * Download species template as CSV
 */
function downloadSpeciesTemplate() {
    const templateHeaders = ['name', 'proportion', 'growthRate', 'woodDensity', 'bef', 'rsr', 'carbonFraction'];
    const templateData = [
        { name: 'Species 1', proportion: 0.4, growthRate: 15, woodDensity: 0.5, bef: 1.5, rsr: 0.25, carbonFraction: 0.47 },
        { name: 'Species 2', proportion: 0.3, growthRate: 12, woodDensity: 0.55, bef: 1.4, rsr: 0.24, carbonFraction: 0.47 },
        { name: 'Species 3', proportion: 0.3, growthRate: 18, woodDensity: 0.45, bef: 1.6, rsr: 0.26, carbonFraction: 0.47 }
    ];
    
    // Use Papa Parse to create CSV
    const csv = Papa.unparse({
        fields: templateHeaders,
        data: templateData
    });
    
    // Download the file
    utils.downloadCSV('species_template.csv', csv);
    
    // Track event
    if (window.analytics) {
        window.analytics.trackEvent('Forest', 'DownloadTemplate', {});
    }
}

/**
 * Export forest results to CSV
 */
function exportForestResults() {
    // Get the last calculated results from the ForestCalculator
    const results = window.forestMain?.getLastResults();
    
    if (!results || !results.yearly || results.yearly.length === 0) {
        window.forestCalcs.eventSystem.showError('No results to export', document.getElementById('forest-export-btn'));
        return;
    }
    
    // Create CSV headers
    const headers = [
        'Year', 
        'Surviving Trees', 
        'Growing Stock (m³)', 
        'Above-ground Biomass (t)', 
        'Below-ground Biomass (t)', 
        'Total Biomass (t)', 
        'Carbon Content (t C)', 
        'CO₂e (t)', 
        'Annual CO₂e (t/yr)', 
        'Cumulative CO₂e (t)'
    ];
    
    // Convert results to CSV rows
    const data = results.yearly.map(year => [
        year.year,
        year.survivingTrees,
        year.growingStock,
        year.aboveGroundBiomass,
        year.belowGroundBiomass,
        year.totalBiomass,
        year.carbonContent,
        year.co2e,
        year.annualIncrement,
        year.cumulativeCO2e
    ]);
    
    // Create CSV content
    const csv = Papa.unparse({
        fields: headers,
        data: data
    });
    
    // Generate filename with date
    const filename = `forest_sequestration_results_${utils.getCurrentDate()}.csv`;
    
    // Download CSV
    utils.downloadCSV(filename, csv);
    
    // Track export event
    if (window.analytics) {
        window.analytics.trackExport('Forest', 'CSV');
    }
}

/**
 * Generate PDF report of forest results
 */
function generateForestPDF() {
    // Check if jsPDF and html2canvas are available
    if (!window.jspdf || !window.html2canvas) {
        window.forestCalcs.eventSystem.showError('PDF generation libraries not loaded', document.getElementById('forest-pdf-btn'));
        return;
    }
    
    // Get the results section
    const resultsSection = document.getElementById('forest-results');
    
    if (!resultsSection || resultsSection.classList.contains('hidden')) {
        window.forestCalcs.eventSystem.showError('No results to export', document.getElementById('forest-pdf-btn'));
        return;
    }
    
    // Generate filename with date
    const filename = `forest_sequestration_report_${utils.getCurrentDate()}`;
    
    // Generate PDF
    utils.generatePDF(filename, resultsSection);
    
    // Track export event
    if (window.analytics) {
        window.analytics.trackExport('Forest', 'PDF');
    }
}

// Export functions
window.forestIO = {
    init: initForestIO,
    getLoadedSpeciesData,
    isMultiSpeciesMode,
    exportResults: exportForestResults,
    generatePDF: generateForestPDF
};
