/**
 * Common utility functions for the application
 */

/**
 * Function to download CSV file
 * @param {string} filename - The name of the file to be downloaded
 * @param {string} content - The content of the file
 */
function downloadCSV(filename, content) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Function to format numbers with commas
 * @param {number} number - The number to be formatted
 * @returns {string} - The formatted number
 */
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Function to calculate the sum of an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} - The sum of the numbers
 */
function calculateSum(numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
}

/**
 * Function to calculate the average of an array of numbers
 * @param {number[]} numbers - The array of numbers
 * @returns {number} - The average of the numbers
 */
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return calculateSum(numbers) / numbers.length;
}

/**
 * Function to round a number to a specified number of decimal places
 * @param {number} number - The number to be rounded
 * @param {number} decimalPlaces - The number of decimal places
 * @returns {number} - The rounded number
 */
function roundToDecimalPlaces(number, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
}

/**
 * Function to convert a date to a formatted string
 * @param {Date} date - The date to be formatted
 * @returns {string} - The formatted date string
 */
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Function to parse a CSV string into an array of objects
 * @param {string} csvString - The CSV string to be parsed
 * @returns {Object[]} - The array of objects
 */
function parseCSV(csvString) {
    const lines = csvString.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
}

export {
    downloadCSV,
    formatNumberWithCommas,
    calculateSum,
    calculateAverage,
    roundToDecimalPlaces,
    formatDate,
    parseCSV
};
