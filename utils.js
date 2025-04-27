/**
 * Common utility functions for the A/R Project Impact Calculator
 */

const utils = {
    /**
     * Format a number with thousand separators and the specified number of decimal places
     * @param {number} number - The number to format
     * @param {number} decimals - The number of decimal places
     * @returns {string} - The formatted number as a string
     */
    formatNumber(number, decimals = 0) {
        // Handle undefined, null, or NaN values
        if (number === undefined || number === null || isNaN(number)) {
            console.warn('formatNumber received invalid value:', number);
            return '0';
        }
        
        // Convert to number if it's not already
        const num = typeof number === 'number' ? number : Number(number);
        
        // Handle NaN after conversion
        if (isNaN(num)) {
            console.warn('formatNumber could not convert value to number:', number);
            return '0';
        }
        
        try {
            // Format with the specified number of decimal places
            return num.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        } catch (err) {
            console.error('Error in formatNumber:', err);
            return '0';
        }
    },
    
    /**
     * Download data as a CSV file
     * @param {string} filename - The name of the file to download
     * @param {string} csvContent - The CSV content as a string
     */
    downloadCSV(filename, csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * Generate a PDF report from an HTML element
     * @param {string} filename - The name of the PDF file
     * @param {HTMLElement} element - The HTML element to convert to PDF
     */
    generatePDF(filename, element) {
        if (!window.html2canvas || !window.jspdf) {
            console.error('PDF generation libraries not loaded');
            return;
        }
        
        html2canvas(element, { scale: 1 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`${filename}.pdf`);
        });
    },
    
    /**
     * Check if a value is numeric
     * @param {*} value - The value to check
     * @returns {boolean} - True if numeric, false otherwise
     */
    isNumeric(value) {
        if (typeof value === 'number') return true;
        if (typeof value !== 'string') return false;
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    /**
     * Create a date string in format YYYY-MM-DD
     * @returns {string} - The current date as a string
     */
    getCurrentDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
};
