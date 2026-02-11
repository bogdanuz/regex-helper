/**
 * RegexHelper v4.0 - Features Suggestions
 * Настройки оптимизаций для триггеров
 * @version 1.0
 * @date 12.02.2026
 */

import { openModal, closeModal } from '../ui/modals.js';
import { showToast } from '../core/errors.js';
import { deepClone, setLocalStorage, getLocalStorage } from '../core/utils.js';

let triggerSettings = new Map();
let globalOptimizations = {
    type1: false,
    type2: false,
    type4: false,
    type5: false,
    type6: false
};

/**
 * Инициализирует систему настроек
 * @example
 * initSuggestions();
 */
export function initSuggestions() {
    loadSettingsFromStorage();
    
    const checkboxes = document.querySelectorAll('input[name="optimization"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateGlobalOptimizations();
        });
    });
    
    updateGlobalOptimizations();
}

/**
 * Получает настройки триггера
 * @param {string} triggerId - ID триггера
 * @returns {Object} - Настройки
 * @example
 * const settings = getTriggerSettings('trigger-123');
 */
export function getTriggerSettings(triggerId) {
    return triggerSettings.get(triggerId) || null;
}

/**
 * Устанавливает настройки триггера
 * @param {string} triggerId - ID триггера
 * @param {Object} settings - Настройки
 * @example
 * setTriggerSettings('trigger-123', { type1: true, type2: false });
 */
export function setTriggerSettings(triggerId, settings) {
    triggerSettings.set(triggerId, settings);
    saveSettingsToStorage();
}

/**
 * Получает эффективные настройки (триггер + глобальные)
 * @param {string} triggerId - ID триггера
 * @returns {Object} - Эффективные настройки
 * @example
 * const settings = getEffectiveSettings('trigger-123');
 */
export function getEffectiveSettings(triggerId) {
    const triggerSpecific = getTriggerSettings(triggerId);
    
    if (triggerSpecific) {
        return triggerSpecific;
    }
    
    return deepClone(globalOptimizations);
}

/**
 * Получает состояния глобальных оптимизаций
 * @returns {Object} - Объект с типами оптимизаций
 * @example
 * const states = getGlobalOptimizationStates(); // => { type1: true, type2: false, ... }
 */
export function getGlobalOptimizationStates() {
    updateGlobalOptimizations();
    return deepClone(globalOptimizations);
}

/**
 * Обновляет UI настроек триггера
 * @param {string} triggerId - ID триггера
 * @example
 * updateTriggerSettingsUI('trigger-123');
 */
export function updateTriggerSettingsUI(triggerId) {
    const settings = getEffectiveSettings(triggerId);
    
    Object.keys(settings).forEach(key => {
        const checkbox = document.querySelector(`input[name="${key}"][data-trigger="${triggerId}"]`);
        if (checkbox) {
            checkbox.checked = settings[key];
        }
    });
}

/**
 * Открывает модальное окно настроек триггера
 * @param {string} triggerId - ID триггера
 * @example
 * openTriggerSettingsModal('trigger-123');
 */
export function openTriggerSettingsModal(triggerId) {
    openModal('triggerSettingsModal');
    updateTriggerSettingsUI(triggerId);
}

/**
 * Закрывает модальное окно настроек
 * @example
 * closeTriggerSettingsModal();
 */
export function closeTriggerSettingsModal() {
    closeModal('triggerSettingsModal');
}

/**
 * Сохраняет настройки триггера
 * @param {string} triggerId - ID триггера
 * @example
 * saveTriggerSettings('trigger-123');
 */
export function saveTriggerSettings(triggerId) {
    const settings = {};
    const checkboxes = document.querySelectorAll(`input[data-trigger="${triggerId}"]`);
    
    checkboxes.forEach(checkbox => {
        settings[checkbox.name] = checkbox.checked;
    });
    
    setTriggerSettings(triggerId, settings);
    showToast('success', 'Настройки сохранены');
    closeTriggerSettingsModal();
}

/**
 * Сбрасывает настройки триггера
 * @param {string} triggerId - ID триггера
 * @example
 * resetTriggerSettings('trigger-123');
 */
export function resetTriggerSettings(triggerId) {
    triggerSettings.delete(triggerId);
    saveSettingsToStorage();
    updateTriggerSettingsUI(triggerId);
    showToast('info', 'Настройки сброшены');
}

/**
 * Применяет текущие настройки ко всем триггерам
 * @example
 * applySettingsToAll();
 */
export function applySettingsToAll() {
    updateGlobalOptimizations();
    showToast('success', 'Настройки применены ко всем триггерам');
}

/**
 * Экспортирует настройки в JSON
 * @returns {string} - JSON строка
 * @example
 * const json = exportSettings();
 */
export function exportSettings() {
    const data = {
        global: globalOptimizations,
        triggers: Array.from(triggerSettings.entries())
    };
    
    return JSON.stringify(data, null, 2);
}

/**
 * Импортирует настройки из JSON
 * @param {string} json - JSON строка
 * @example
 * importSettings(jsonString);
 */
export function importSettings(json) {
    try {
        const data = JSON.parse(json);
        
        if (data.global) {
            globalOptimizations = data.global;
        }
        
        if (data.triggers) {
            triggerSettings = new Map(data.triggers);
        }
        
        saveSettingsToStorage();
        showToast('success', 'Настройки импортированы');
    } catch (error) {
        showToast('error', 'Ошибка импорта настроек');
    }
}

function updateGlobalOptimizations() {
    const checkboxes = document.querySelectorAll('input[name="optimization"]');
    
    checkboxes.forEach(checkbox => {
        const type = checkbox.value;
        globalOptimizations[type] = checkbox.checked;
    });
    
    saveSettingsToStorage();
}

function saveSettingsToStorage() {
    const data = {
        global: globalOptimizations,
        triggers: Array.from(triggerSettings.entries())
    };
    
    setLocalStorage('regexhelper-settings', data);
}

function loadSettingsFromStorage() {
    const data = getLocalStorage('regexhelper-settings');
    
    if (!data) {
        return;
    }
    
    if (data.global) {
        globalOptimizations = data.global;
    }
    
    if (data.triggers) {
        triggerSettings = new Map(data.triggers);
    }
}
