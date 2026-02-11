/**
 * RegexHelper v4.0 - Features History
 * История конвертаций с localStorage
 * @version 1.0
 * @date 12.02.2026
 */

import { setLocalStorage, getLocalStorage, formatDate, truncateText, generateId } from '../core/utils.js';
import { showToast } from '../core/errors.js';
import { showConfirm } from '../ui/modals.js';
import { HISTORYCONFIG } from '../core/config.js';

let historyEntries = [];

/**
 * Инициализирует историю
 * @example
 * initHistory();
 */
export function initHistory() {
    loadHistoryFromStorage();
    renderHistory();
    
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            showConfirm(
                'Очистить историю?',
                'Все записи будут удалены безвозвратно',
                clearHistory
            );
        });
    }
}

/**
 * Сохраняет запись в историю
 * @param {Object} entry - Запись истории
 * @returns {string} - ID записи
 * @example
 * saveToHistory({ regex: '...', triggers: [...] });
 */
export function saveToHistory(entry) {
    const id = generateId();
    const timestamp = Date.now();
    
    const historyEntry = {
        id,
        timestamp,
        date: formatDate(new Date(timestamp)),
        ...entry
    };
    
    historyEntries.unshift(historyEntry);
    
    if (historyEntries.length > HISTORYCONFIG.MAXENTRIES) {
        historyEntries = historyEntries.slice(0, HISTORYCONFIG.MAXENTRIES);
    }
    
    saveHistoryToStorage();
    renderHistory();
    
    return id;
}

/**
 * Загружает запись из истории
 * @param {string} entryId - ID записи
 * @example
 * loadFromHistory('entry-123');
 */
export function loadFromHistory(entryId) {
    const entry = historyEntries.find(e => e.id === entryId);
    
    if (!entry) {
        showToast('error', 'Запись не найдена');
        return;
    }
    
    if (entry.conversionType === 'simple') {
        loadSimpleTriggersFromHistory(entry);
    } else if (entry.conversionType === 'linked') {
        loadLinkedTriggersFromHistory(entry);
    }
    
    showToast('success', 'Запись загружена');
}

/**
 * Сохраняет конвертацию в историю
 * @param {string} regex - Regex
 * @param {string} conversionType - 'simple' или 'linked'
 * @example
 * saveConversionToHistory('(test|testing)', 'simple');
 */
export function saveConversionToHistory(regex, conversionType) {
    const entry = {
        regex,
        conversionType,
        regexLength: regex.length
    };
    
    saveToHistory(entry);
}

/**
 * Удаляет запись из истории
 * @param {string} entryId - ID записи
 * @example
 * deleteFromHistory('entry-123');
 */
export function deleteFromHistory(entryId) {
    const index = historyEntries.findIndex(e => e.id === entryId);
    
    if (index === -1) {
        return;
    }
    
    historyEntries.splice(index, 1);
    saveHistoryToStorage();
    renderHistory();
    
    showToast('info', 'Запись удалена');
}

/**
 * Очищает всю историю
 * @example
 * clearHistory();
 */
export function clearHistory() {
    historyEntries = [];
    saveHistoryToStorage();
    renderHistory();
    showToast('info', 'История очищена');
}

/**
 * Отрисовывает список истории
 * @example
 * renderHistory();
 */
export function renderHistory() {
    const container = document.getElementById('historyList');
    
    if (!container) {
        return;
    }
    
    if (historyEntries.length === 0) {
        container.innerHTML = '<p class="text-muted">История пуста</p>';
        return;
    }
    
    const html = historyEntries.map(entry => `
        <div class="history-item" data-id="${entry.id}">
            <div class="history-header">
                <span class="history-date">${entry.date}</span>
                <span class="history-type">${entry.conversionType}</span>
            </div>
            <div class="history-regex">${truncateText(entry.regex, 100)}</div>
            <div class="history-actions">
                <button class="btn-small" onclick="window.loadHistoryEntry('${entry.id}')">Загрузить</button>
                <button class="btn-small" onclick="window.deleteHistoryEntry('${entry.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
    updateHistoryCounter(historyEntries.length);
}

/**
 * Показывает детали записи
 * @param {string} entryId - ID записи
 * @example
 * showHistoryDetails('entry-123');
 */
export function showHistoryDetails(entryId) {
    const entry = historyEntries.find(e => e.id === entryId);
    
    if (!entry) {
        return;
    }
    
    showToast('info', `Regex: ${entry.regex}`);
}

/**
 * Экспортирует запись из истории
 * @param {string} entryId - ID записи
 * @example
 * exportFromHistory('entry-123');
 */
export function exportFromHistory(entryId) {
    const entry = historyEntries.find(e => e.id === entryId);
    
    if (!entry) {
        showToast('error', 'Запись не найдена');
        return;
    }
    
    showToast('success', 'Экспорт записи');
}

/**
 * Получает все записи истории
 * @returns {Array} - Массив записей
 * @example
 * const entries = getHistoryEntries();
 */
export function getHistoryEntries() {
    return [...historyEntries];
}

/**
 * Сортирует историю
 * @param {string} sortBy - 'date', 'regex' или 'triggers'
 * @example
 * sortHistory('date');
 */
export function sortHistory(sortBy) {
    switch (sortBy) {
        case 'date':
            historyEntries.sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'regex':
            historyEntries.sort((a, b) => a.regex.localeCompare(b.regex));
            break;
        default:
            break;
    }
    
    renderHistory();
}

/**
 * Фильтрует историю
 * @param {string} filterType - 'simple', 'linked' или 'all'
 * @example
 * filterHistory('simple');
 */
export function filterHistory(filterType) {
    const container = document.getElementById('historyList');
    
    if (!container) {
        return;
    }
    
    const items = container.querySelectorAll('.history-item');
    
    items.forEach(item => {
        const entry = historyEntries.find(e => e.id === item.dataset.id);
        
        if (!entry) {
            return;
        }
        
        if (filterType === 'all' || entry.conversionType === filterType) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Переключает панель истории
 * @example
 * toggleHistoryPanel();
 */
export function toggleHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    
    if (!panel) {
        return;
    }
    
    panel.classList.toggle('collapsed');
}

/**
 * Получает статистику истории
 * @returns {Object} - Статистика
 * @example
 * const stats = getHistoryStats(); // => { total: 10, simple: 7, linked: 3 }
 */
export function getHistoryStats() {
    const total = historyEntries.length;
    const simple = historyEntries.filter(e => e.conversionType === 'simple').length;
    const linked = historyEntries.filter(e => e.conversionType === 'linked').length;
    
    return { total, simple, linked };
}

function loadSimpleTriggersFromHistory(entry) {
    const textarea = document.getElementById('simpleTriggers');
    
    if (!textarea) {
        return;
    }
    
    if (entry.triggers) {
        textarea.value = entry.triggers.join('\n');
    }
}

function loadLinkedTriggersFromHistory(entry) {
    showToast('info', 'Загрузка linked triggers из истории');
}

function updateHistoryCounter(count) {
    const counter = document.getElementById('historyCount');
    
    if (!counter) {
        return;
    }
    
    counter.textContent = count;
}

function saveHistoryToStorage() {
    setLocalStorage(HISTORYCONFIG.STORAGEKEY, historyEntries);
}

function loadHistoryFromStorage() {
    const data = getLocalStorage(HISTORYCONFIG.STORAGEKEY);
    
    if (Array.isArray(data)) {
        historyEntries = data;
    }
}

if (typeof window !== 'undefined') {
    window.loadHistoryEntry = loadFromHistory;
    window.deleteHistoryEntry = deleteFromHistory;
}
