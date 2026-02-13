/**
 * REGEXHELPER v4.0
 * LocalStorage Management
 * Module 7C: Data persistence
 */

import { APP_CONFIG } from './config.js';

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save
 * @returns {boolean} - Success status
 */
export function saveToStorage(key, data) {
    try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Loaded data or default
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) {
            return defaultValue;
        }
        return JSON.parse(serialized);
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
    }
}

/**
 * Clear all app data from localStorage
 * @returns {boolean} - Success status
 */
export function clearAllStorage() {
    try {
        Object.values(APP_CONFIG.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (error) {
        console.error('Failed to clear localStorage:', error);
        return false;
    }
}

/**
 * Get storage size in bytes
 * @returns {number} - Size in bytes
 */
export function getStorageSize() {
    let total = 0;
    for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length + key.length;
        }
    }
    return total;
}

/**
 * Check if localStorage is available
 * @returns {boolean} - Is available
 */
export function isStorageAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Save simple triggers
 * @param {string[]} triggers - Array of triggers
 * @returns {boolean} - Success status
 */
export function saveSimpleTriggers(triggers) {
    return saveToStorage(APP_CONFIG.STORAGE_KEYS.SIMPLE_TRIGGERS, triggers);
}

/**
 * Load simple triggers
 * @returns {string[]} - Array of triggers
 */
export function loadSimpleTriggers() {
    return loadFromStorage(APP_CONFIG.STORAGE_KEYS.SIMPLE_TRIGGERS, []);
}

/**
 * Save linked groups
 * @param {Object[]} groups - Array of groups
 * @returns {boolean} - Success status
 */
export function saveLinkedGroups(groups) {
    return saveToStorage(APP_CONFIG.STORAGE_KEYS.LINKED_GROUPS, groups);
}

/**
 * Load linked groups
 * @returns {Object[]} - Array of groups
 */
export function loadLinkedGroups() {
    return loadFromStorage(APP_CONFIG.STORAGE_KEYS.LINKED_GROUPS, []);
}

/**
 * Save history
 * @param {Object[]} history - Array of history items
 * @returns {boolean} - Success status
 */
export function saveHistory(history) {
    return saveToStorage(APP_CONFIG.STORAGE_KEYS.HISTORY, history);
}

/**
 * Load history
 * @returns {Object[]} - Array of history items
 */
export function loadHistory() {
    return loadFromStorage(APP_CONFIG.STORAGE_KEYS.HISTORY, []);
}

/**
 * Save settings
 * @param {Object} settings - Settings object
 * @returns {boolean} - Success status
 */
export function saveSettings(settings) {
    return saveToStorage(APP_CONFIG.STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Load settings
 * @returns {Object} - Settings object
 */
export function loadSettings() {
    return loadFromStorage(APP_CONFIG.STORAGE_KEYS.SETTINGS, {
        globalParams: [],
        connectionMode: APP_CONFIG.CONNECTION_MODES.INDIVIDUAL,
        commonDistance: APP_CONFIG.DISTANCE_PRESETS.MEDIUM.value
    });
}
