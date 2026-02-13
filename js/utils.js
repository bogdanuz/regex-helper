/**
 * REGEXHELPER v4.0
 * Utility Functions
 * Module 7B: Helper functions
 */

import { REGEX_CONFIG } from './config.js';

/**
 * Escape special regex characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(REGEX_CONFIG.SPECIAL_CHARS, '\\$&');
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique ID
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Только что';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} ${pluralize(minutes, ['минуту', 'минуты', 'минут'])} назад`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} ${pluralize(hours, ['час', 'часа', 'часов'])} назад`;
    }
    
    // Format as date
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Pluralize Russian words
 * @param {number} count - Number
 * @param {string[]} forms - Forms [1, 2, 5]
 * @returns {string} - Correct form
 */
export function pluralize(count, forms) {
    const cases = [2, 0, 1, 1, 1, 2];
    return forms[
        (count % 100 > 4 && count % 100 < 20)
            ? 2
            : cases[Math.min(count % 10, 5)]
    ];
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} maxLength - Max length
 * @returns {string} - Truncated string
 */
export function truncate(str, maxLength = 50) {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        return success;
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * Download file
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Parse triggers from text
 * @param {string} text - Text with triggers
 * @returns {string[]} - Array of triggers
 */
export function parseTriggers(text) {
    if (typeof text !== 'string') return [];
    
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

/**
 * Find common prefix in strings
 * @param {string[]} strings - Array of strings
 * @returns {string} - Common prefix
 */
export function findCommonPrefix(strings) {
    if (!Array.isArray(strings) || strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    const sorted = [...strings].sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    
    let i = 0;
    while (i < first.length && first[i] === last[i]) {
        i++;
    }
    
    return first.substring(0, i);
}

/**
 * Check if string contains only Cyrillic
 * @param {string} str - String to check
 * @returns {boolean} - Is Cyrillic
 */
export function isCyrillic(str) {
    return /^[а-яёА-ЯЁ]+$/.test(str);
}

/**
 * Check if string contains only Latin
 * @param {string} str - String to check
 * @returns {boolean} - Is Latin
 */
export function isLatin(str) {
    return /^[a-zA-Z]+$/.test(str);
}

/**
 * Validate distance pattern
 * @param {string} pattern - Distance pattern
 * @returns {boolean} - Is valid
 */
export function isValidDistance(pattern) {
    if (typeof pattern !== 'string') return false;
    
    // Allow common patterns
    const validPatterns = [
        /^\.\{\d+,\d+\}$/,  // .{1,10}
        /^\.\*$/,            // .*
        /^\.\+$/,            // .+
        /^ $/,               // space
        /^$/                 // empty
    ];
    
    return validPatterns.some(regex => regex.test(pattern));
}

/**
 * Get element by ID safely
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} - Element or null
 */
export function getElement(id) {
    return document.getElementById(id);
}

/**
 * Show/hide element
 * @param {HTMLElement|string} elementOrId - Element or ID
 * @param {boolean} show - Show or hide
 */
export function toggleElement(elementOrId, show) {
    const element = typeof elementOrId === 'string' 
        ? getElement(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.style.display = show ? '' : 'none';
    }
}

/**
 * Add class to element
 * @param {HTMLElement|string} elementOrId - Element or ID
 * @param {string} className - Class name
 */
export function addClass(elementOrId, className) {
    const element = typeof elementOrId === 'string' 
        ? getElement(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Remove class from element
 * @param {HTMLElement|string} elementOrId - Element or ID
 * @param {string} className - Class name
 */
export function removeClass(elementOrId, className) {
    const element = typeof elementOrId === 'string' 
        ? getElement(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Toggle class on element
 * @param {HTMLElement|string} elementOrId - Element or ID
 * @param {string} className - Class name
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(elementOrId, className, force) {
    const element = typeof elementOrId === 'string' 
        ? getElement(elementOrId) 
        : elementOrId;
    
    if (element) {
        element.classList.toggle(className, force);
    }
}
