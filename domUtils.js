/**
 * DOM manipulation utilities for the A/R Project Impact Calculator
 */

const domUtils = {
    /**
     * Clear all child elements from a DOM element
     * @param {HTMLElement} element - The element to clear
     */
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },
    
    /**
     * Show a DOM element by removing the hidden class
     * @param {HTMLElement} element - The element to show
     */
    showElement(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    /**
     * Hide a DOM element by adding the hidden class
     * @param {HTMLElement} element - The element to hide
     */
    hideElement(element) {
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    /**
     * Create a new DOM element with the specified attributes
     * @param {string} tag - The HTML tag name
     * @param {object} options - Options for the element (className, textContent, innerHTML, attributes)
     * @returns {HTMLElement} - The created DOM element
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.innerHTML) {
            element.innerHTML = options.innerHTML;
        }
        
        if (options.attributes) {
            for (const [attr, value] of Object.entries(options.attributes)) {
                element.setAttribute(attr, value);
            }
        }
        
        return element;
    },
    
    /**
     * Create a table row with the specified cells
     * @param {Array} cells - Array of cell values or objects with value and className
     * @returns {HTMLTableRowElement} - The created table row
     */
    createTableRow(cells) {
        const row = document.createElement('tr');
        
        cells.forEach(cell => {
            const td = document.createElement('td');
            if (typeof cell === 'object' && cell !== null) {
                if (cell.value !== undefined) {
                    td.textContent = cell.value;
                }
                if (cell.className) {
                    td.className = cell.className;
                }
            } else {
                td.textContent = cell;
            }
            row.appendChild(td);
        });
        
        return row;
    },
    
    /**
     * Update a metric value element with a formatted number
     * @param {string} elementId - The ID of the element to update
     * @param {number} value - The value to display
     * @param {number} decimals - The number of decimal places
     */
    updateMetric(elementId, value, decimals = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            // Log the value before formatting
            console.log(`[domUtils.updateMetric] Formatting value for #${elementId}:`, value);
            element.textContent = utils.formatNumber(value, decimals);
        } else {
            // Log if element not found, as this could lead to silent failures
            console.warn(`[domUtils.updateMetric] Element with ID "${elementId}" not found.`);
        }
    },
    
    /**
     * Show an error message
     * @param {string} message - The error message to display
     * @param {HTMLElement} element - The element to display the error in
     */
    showError(message, element) {
        if (element) {
            element.textContent = message;
            this.showElement(element);
        }
    },
    
    /**
     * Clear error messages
     * @param {HTMLElement} element - The error message element
     */
    clearError(element) {
        if (element) {
            element.textContent = '';
            this.hideElement(element);
        }
    },
    
    /**
     * Toggle display of a section
     * @param {HTMLElement} element - The element to toggle
     * @param {boolean} show - Whether to show or hide the element
     */
    toggleSection(element, show) {
        if (show) {
            this.showElement(element);
        } else {
            this.hideElement(element);
        }
    }
};

// Make domUtils available globally
window.domUtils = domUtils;
