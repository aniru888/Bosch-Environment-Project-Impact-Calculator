/**
 * DOM manipulation utilities for the application
 */

/**
 * Function to create an element with specified attributes and content
 * @param {string} tagName - The name of the tag to be created
 * @param {Object} attributes - The attributes to be added to the element
 * @param {string} content - The content to be added to the element
 * @returns {HTMLElement} - The created element
 */
function createElement(tagName, attributes = {}, content = '') {
    const element = document.createElement(tagName);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    element.innerHTML = content;
    return element;
}

/**
 * Function to clear the content of an element
 * @param {HTMLElement} element - The element to be cleared
 */
function clearElementContent(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Function to show an element
 * @param {HTMLElement} element - The element to be shown
 */
function showElement(element) {
    element.style.display = 'block';
}

/**
 * Function to hide an element
 * @param {HTMLElement} element - The element to be hidden
 */
function hideElement(element) {
    element.style.display = 'none';
}

/**
 * Function to toggle the visibility of an element
 * @param {HTMLElement} element - The element to be toggled
 */
function toggleElementVisibility(element) {
    if (element.style.display === 'none' || element.style.display === '') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}

/**
 * Function to add an event listener to an element
 * @param {HTMLElement} element - The element to add the event listener to
 * @param {string} eventType - The type of event to listen for
 * @param {Function} callback - The callback function to be executed when the event occurs
 */
function addEventListener(element, eventType, callback) {
    element.addEventListener(eventType, callback);
}

export {
    createElement,
    clearElementContent,
    showElement,
    hideElement,
    toggleElementVisibility,
    addEventListener
};
