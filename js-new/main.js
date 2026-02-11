/**
 * RegexHelper v4.0 - Main Entry Point
 * Главный файл приложения
 * @version 1.0
 * @date 12.02.2026
 */

import { APPCONFIG } from './core/config.js';
import { escapeRegex, pluralize, copyToClipboard } from './core/utils.js';
import { showToast, clearAllInlineErrors, logError } from './core/errors.js';
import { parseSimpleTriggers, getTriggerStats, hasTriggersInText } from './converter/parser.js';
import { validateTriggers, validateRegexLength } from './converter/validator.js';
import { applyOptimizations } from './converter/optimizer.js';
import { showConfirm, openModal, closeModal } from './ui/modals.js';
import { initNavigation, initScrollTopBtn } from './ui/navigation.js';
import { initHeaderHideShow } from './ui/effects.js';
import { toggleAccordion } from './ui/panels.js';
import { initSimpleTriggers, getSimpleTriggers, clearSimpleTriggers } from './features/simple-triggers.js';
import { initLinkedTriggers, getLinkedGroups, convertLinkedGroups, getLinkMode } from './features/linked-triggers.js';
import { initSuggestions, getGlobalOptimizationStates } from './features/suggestions.js';
import { initHistory, saveConversionToHistory } from './features/history.js';
import { initExport } from './features/export.js';
import { initTester } from './features/tester.js';
import { visualizeRegex } from './features/visualizer.js';

/**
 * Инициализирует приложение
 * @example
 * initApp();
 */
function initApp() {
    console.log('═'.repeat(50));
    console.log(`RegexHelper v${APPCONFIG.VERSION} - Инициализация`);
    console.log('═'.repeat(50));
    
    try {
        initAllModules();
        setupEventListeners();
        setupGlobalEventListeners();
        logAppInfo();
        
        console.log('✅ Приложение инициализировано');
        console.log('═'.repeat(50));
    } catch (error) {
        logError('initApp', error);
        showToast('error', 'Ошибка инициализации приложения');
    }
}

/**
 * Инициализирует все модули
 * @example
 * initAllModules();
 */
function initAllModules() {
    initNavigation();
    initScrollTopBtn();
    initHeaderHideShow();
    initSimpleTriggers();
    initLinkedTriggers();
    initSuggestions();
    initHistory();
    initExport();
    initTester();
}

/**
 * Настраивает event listeners
 * @example
 * setupEventListeners();
 */
function setupEventListeners() {
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', handleConvert);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
    
    const copyBtn = document.getElementById('copyRegexBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', handleCopyRegex);
    }
    
    const visualizeBtn = document.getElementById('visualizeBtn');
    if (visualizeBtn) {
        visualizeBtn.addEventListener('click', () => {
            const regex = document.getElementById('regexResult')?.value;
            if (regex) {
                visualizeRegex(regex);
            }
        });
    }
}

/**
 * Настраивает глобальные event listeners (shortcuts)
 * @example
 * setupGlobalEventListeners();
 */
function setupGlobalEventListeners() {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    window.addEventListener('error', (e) => {
        logError('window.error', e.error);
    });
}

/**
 * Обработчик keyboard shortcuts
 * @param {KeyboardEvent} event - Событие клавиатуры
 * @example
 * handleKeyboardShortcuts(event);
 */
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                handleConvert();
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                showConfirm(
                    'Сбросить форму?',
                    'Все данные будут очищены',
                    handleReset
                );
                break;
            case 'c':
            case 'C':
                if (document.activeElement?.id === 'regexResult') {
                    return;
                }
                event.preventDefault();
                handleCopyRegex();
                break;
        }
    }
    
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

/**
 * Обработчик конвертации
 * @example
 * handleConvert();
 */
function handleConvert() {
    try {
        clearAllInlineErrors();
        
        const simpleTriggers = getSimpleTriggers();
        const linkedGroups = getLinkedGroups();
        
        const hasSimple = simpleTriggers.length > 0;
        const hasLinked = linkedGroups.length > 0;
        
        if (!hasSimple && !hasLinked) {
            showToast('error', 'Введите триггеры для конвертации');
            return;
        }
        
        let regex = '';
        let conversionType = '';
        
        if (hasSimple && !hasLinked) {
            const result = performConversionWithOptimizations(simpleTriggers);
            if (result.success) {
                regex = result.regex;
                conversionType = 'simple';
            }
        } else if (!hasSimple && hasLinked) {
            regex = convertLinkedGroups();
            conversionType = 'linked';
        } else {
            const simpleRegex = performConversionWithOptimizations(simpleTriggers).regex;
            const linkedRegex = convertLinkedGroups();
            regex = `${simpleRegex}|${linkedRegex}`;
            conversionType = 'mixed';
        }
        
        if (!regex) {
            showToast('error', 'Не удалось создать regex');
            return;
        }
        
        renderRegexResult(regex, {
            triggerCount: simpleTriggers.length,
            regexLength: regex.length
        });
        
        saveConversionToHistory(regex, conversionType);
        
        showToast('success', 'Regex создан!');
    } catch (error) {
        logError('handleConvert', error);
        showToast('error', 'Ошибка конвертации');
    }
}

/**
 * Выполняет конвертацию с оптимизациями
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {Object} - { success: boolean, regex: string }
 * @example
 * performConversionWithOptimizations(['test', 'testing']);
 */
function performConversionWithOptimizations(triggers) {
    if (!validateTriggers(triggers)) {
        return { success: false, regex: '' };
    }
    
    const types = getSelectedOptimizationTypes();
    
    let regex;
    if (types.length > 0) {
        regex = applyOptimizations(triggers, types);
    } else {
        regex = triggers.map(t => escapeRegex(t)).join('|');
    }
    
    if (!validateRegexLength(regex)) {
        return { success: false, regex: '' };
    }
    
    return { success: true, regex };
}

/**
 * Получает выбранные типы оптимизаций
 * @returns {Array<number>} - Массив номеров типов [1, 2, 4, 5, 6]
 * @example
 * const types = getSelectedOptimizationTypes(); // => [1, 2, 4]
 */
function getSelectedOptimizationTypes() {
    const states = getGlobalOptimizationStates();
    const types = [];
    
    if (states.type1) types.push(1);
    if (states.type2) types.push(2);
    if (states.type4) types.push(4);
    if (states.type5) types.push(5);
    if (states.type6) types.push(6);
    
    return types;
}

/**
 * Отрисовывает результат regex
 * @param {string} regex - Regex
 * @param {Object} stats - Статистика
 * @example
 * renderRegexResult('(test|testing)', { triggerCount: 2, regexLength: 15 });
 */
function renderRegexResult(regex, stats) {
    const textarea = document.getElementById('regexResult');
    
    if (!textarea) {
        return;
    }
    
    textarea.value = regex;
    
    updateRegexLengthCounter(stats.regexLength);
    
    const statsDiv = document.getElementById('resultStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="result-stats-content">
                <span>Триггеров: ${stats.triggerCount}</span>
                <span>Длина regex: ${stats.regexLength}</span>
            </div>
        `;
        statsDiv.style.display = 'block';
    }
}

/**
 * Обновляет счётчик длины regex
 * @param {number} length - Длина regex
 * @example
 * updateRegexLengthCounter(150);
 */
function updateRegexLengthCounter(length) {
    const counter = document.getElementById('regexLength');
    
    if (!counter) {
        return;
    }
    
    counter.textContent = `${length} ${pluralize(length, ['символ', 'символа', 'символов'])}`;
    
    if (length > 9000) {
        counter.style.color = '#F44336';
    } else if (length > 5000) {
        counter.style.color = '#FF9800';
    } else {
        counter.style.color = '#4CAF50';
    }
}

/**
 * Очищает результат regex
 * @example
 * clearRegexResult();
 */
function clearRegexResult() {
    const textarea = document.getElementById('regexResult');
    
    if (textarea) {
        textarea.value = '';
    }
    
    const statsDiv = document.getElementById('resultStats');
    if (statsDiv) {
        statsDiv.innerHTML = '';
        statsDiv.style.display = 'none';
    }
    
    updateRegexLengthCounter(0);
}

/**
 * Обработчик сброса формы
 * @example
 * handleReset();
 */
function handleReset() {
    clearSimpleTriggers();
    clearRegexResult();
    clearAllInlineErrors();
    showToast('success', 'Форма очищена');
}

/**
 * Обработчик копирования regex
 * @example
 * handleCopyRegex();
 */
async function handleCopyRegex() {
    const textarea = document.getElementById('regexResult');
    
    if (!textarea) {
        return;
    }
    
    const regex = textarea.value.trim();
    
    if (!regex) {
        showToast('warning', 'Нет regex для копирования');
        return;
    }
    
    try {
        const success = await copyToClipboard(regex);
        
        if (success) {
            showToast('success', 'Regex скопирован в буфер обмена');
            
            const copyBtn = document.getElementById('copyRegexBtn');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ Скопировано';
                copyBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('btn-success');
                }, 2000);
            }
        } else {
            showToast('error', 'Не удалось скопировать');
        }
    } catch (error) {
        logError('handleCopyRegex', error);
        showToast('error', 'Ошибка копирования');
    }
}

/**
 * Переключает режим (simple/linked)
 * @param {string} mode - Режим
 * @example
 * handleModeSwitch('linked');
 */
function handleModeSwitch(mode) {
    const simplePanel = document.getElementById('simpleTriggerPanel');
    const linkedPanel = document.getElementById('linkedTriggerPanel');
    
    if (mode === 'simple') {
        if (simplePanel) simplePanel.style.display = 'block';
        if (linkedPanel) linkedPanel.style.display = 'none';
    } else if (mode === 'linked') {
        if (simplePanel) simplePanel.style.display = 'none';
        if (linkedPanel) linkedPanel.style.display = 'block';
    }
}

/**
 * Логирует информацию о приложении
 * @example
 * logAppInfo();
 */
function logAppInfo() {
    console.log(`Версия: ${APPCONFIG.VERSION}`);
    console.log(`Название: ${APPCONFIG.APPNAME}`);
    console.log(`Максимальная длина regex: ${APPCONFIG.MAXREGEXLENGTH}`);
}

document.addEventListener('DOMContentLoaded', initApp);
