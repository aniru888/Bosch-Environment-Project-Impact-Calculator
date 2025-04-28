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
      if (!element) {
          console.error(`[domUtils.updateMetric] Element with ID "${elementId}" not found!`);
          return;
        }
        element.textContent = utils.formatNumber(value, decimals);
    },
    
    /**
     * Append multiple children to a parent element
     * @param {HTMLElement} parent - The parent element
     * @param {Array<HTMLElement>} children - Array of child elements to append
     */
    appendChildren(parent, children) {
        children.forEach(child => parent.appendChild(child));
    },

    /**
     * Get the value of an input element
     * @param {string} id - The ID of the input element
     * @returns {string} - The value of the input element
     */
    getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : '';
    },

    /**
     * Set the value of an input element
     * @param {string} id - The ID of the input element
     * @param {string} value - The value to set
     */
    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    },

    /**
     * Add an event listener to an element
     * @param {string} id - The ID of the element
     * @param {string} event - The event type (e.g., 'click')
     * @param {Function} handler - The event handler function
     */
    addEventListener(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }
};

// Make domUtils available globally
window.domUtils = domUtils;
