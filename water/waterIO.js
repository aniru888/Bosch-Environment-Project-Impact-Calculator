/**
 * Water IO module
 * Handles input/output operations for the Water calculator
 */

/**
 * Initialize the Water IO module
 */
function initWaterIO() {
    // Set up export results handler
    setupExportResultsHandler();
    
    // Set up PDF generation handler
    setupPDFGenerationHandler();
}

/**
 * Set up export results handler
 */
function setupExportResultsHandler() {
    const exportBtn = document.getElementById('water-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportWaterResults);
    }
}

/**
 * Set up PDF generation handler
 */
function setupPDFGenerationHandler() {
    const pdfBtn = document.getElementById('water-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generateWaterPDF);
    }
}

/**
 * Export water results to CSV
 */
function exportWaterResults() {
    // Get the last calculated results from the WaterCalculator
    const results = window.waterMain?.getLastResults();
    
    if (!results || !results.yearly || results.yearly.length === 0) {
        console.error('No results to export');
        return;
    }
    
    // Create CSV headers
    const headers = [
        'Year', 
        'Annual Water Captured (KL)', 
        'Cumulative Water (KL)', 
        'Annual Energy Saved (kWh)', 
        'Annual Emissions Reduction (t CO₂e)', 
        'Cumulative Emissions (t CO₂e)'
    ];
    
    // Convert results to CSV rows
    const data = results.yearly.map(year => [
        year.year,
        year.annualWaterCaptured,
        year.cumulativeWater,
        year.annualEnergySaved,
        year.annualEmissionsReduction,
        year.cumulativeEmissions
    ]);
    
    // Create CSV content
    const csv = Papa.unparse({
        fields: headers,
        data: data
    });
    
    // Generate filename with date
    const filename = `water_capture_results_${utils.getCurrentDate()}.csv`;
    
    // Download CSV
    utils.downloadCSV(filename, csv);
    
    // Track export event
    if (window.analytics) {
        window.analytics.trackExport('Water', 'CSV');
    }
}

/**
 * Generate PDF report of water results
 */
function generateWaterPDF() {
    // Check if jsPDF and html2canvas are available
    if (!window.jspdf || !window.html2canvas) {
        console.error('PDF generation libraries not loaded');
        return;
    }
    
    // Get the results section
    const resultsSection = document.getElementById('water-results');
    
    if (!resultsSection || resultsSection.classList.contains('hidden')) {
        console.error('No results to export');
        return;
    }
    
    // Generate filename with date
    const filename = `water_capture_report_${utils.getCurrentDate()}`;
    
    // Generate PDF
    utils.generatePDF(filename, resultsSection);
    
    // Track export event
    if (window.analytics) {
        window.analytics.trackExport('Water', 'PDF');
    }
}

/**
 * Parse form data from a water form element
 * @param {HTMLFormElement} form - The form element
 * @returns {object} - Parsed form data
 */
function parseWaterFormData(form) {
    const formData = new FormData(form);
    const data = {
        rainfall: parseFloat(formData.get('rainFall')),
        waterArea: parseFloat(formData.get('waterArea')),
        runoffCoefficient: parseFloat(formData.get('runoffCoefficient')),
        captureEfficiency: parseFloat(formData.get('captureEfficiency')),
        energySavings: parseFloat(formData.get('energySavings')),
        waterProjectCost: parseFloat(formData.get('waterProjectCost')),
        waterValue: parseFloat(formData.get('waterValue')),
        projectDuration: parseInt(formData.get('projectDuration'))
    };
    return data;
}

// Export functions via window object
window.waterIO = {
    init: initWaterIO,
    exportResults: exportWaterResults,
    generatePDF: generateWaterPDF,
    parseFormData: parseWaterFormData
};
