/**
 * RegexHelper v4.0 - Features Export
 * Экспорт regex в TXT, JSON, CSV
 * @version 1.0
 * @date 12.02.2026
 */

import { downloadFile, formatDate, getCurrentTimestamp } from '../core/utils.js';
import { showToast } from '../core/errors.js';
import { openModal, closeModal } from '../ui/modals.js';

/**
 * Инициализирует модуль экспорта
 * @example
 * initExport();
 */
export function initExport() {
    const exportBtn = document.getElementById('exportBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', openExportModal);
    }
    
    const txtBtn = document.getElementById('exportTxtBtn');
    const jsonBtn = document.getElementById('exportJsonBtn');
    const csvBtn = document.getElementById('exportCsvBtn');
    
    if (txtBtn) txtBtn.addEventListener('click', () => quickExport('txt'));
    if (jsonBtn) jsonBtn.addEventListener('click', () => quickExport('json'));
    if (csvBtn) csvBtn.addEventListener('click', () => quickExport('csv'));
}

/**
 * Экспортирует в TXT формат
 * @param {string} regex - Regex
 * @param {Array} triggers - Массив триггеров
 * @param {string} mode - Режим конвертации
 * @example
 * exportTXT('(test|testing)', ['test', 'testing'], 'simple');
 */
export function exportTXT(regex, triggers, mode) {
    const date = formatDate(new Date());
    
    let content = `RegexHelper v4.0 - Экспорт\n`;
    content += `Дата: ${date}\n`;
    content += `Режим: ${mode}\n`;
    content += `\n`;
    content += `Regex:\n${regex}\n`;
    content += `\n`;
    
    if (triggers && triggers.length > 0) {
        content += `Триггеры (${triggers.length}):\n`;
        content += triggers.map((t, i) => `${i + 1}. ${t}`).join('\n');
    }
    
    downloadFile(content, `regex-${Date.now()}.txt`, 'text/plain');
    showToast('success', 'Экспорт TXT завершён');
}

/**
 * Экспортирует в JSON формат
 * @param {string} regex - Regex
 * @param {Array} triggers - Массив триггеров
 * @param {string} mode - Режим конвертации
 * @param {Object} settings - Настройки
 * @example
 * exportJSON('(test|testing)', ['test', 'testing'], 'simple', { types: [1, 2] });
 */
export function exportJSON(regex, triggers, mode, settings) {
    const data = {
        regex,
        triggers,
        mode,
        settings: settings || {},
        meta: {
            date: getCurrentTimestamp(),
            version: '4.0.0',
            conversionType: mode
        }
    };
    
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `regex-${Date.now()}.json`, 'application/json');
    showToast('success', 'Экспорт JSON завершён');
}

/**
 * Экспортирует в CSV формат
 * @param {string} regex - Regex
 * @param {Array} triggers - Массив триггеров
 * @example
 * exportCSV('(test|testing)', ['test', 'testing']);
 */
export function exportCSV(regex, triggers) {
    const date = formatDate(new Date());
    const triggerCount = triggers ? triggers.length : 0;
    
    let csv = 'Regex,Trigger Count,Date\n';
    csv += `"${regex.replace(/"/g, '""')}",${triggerCount},${date}\n`;
    
    downloadFile(csv, `regex-${Date.now()}.csv`, 'text/csv');
    showToast('success', 'Экспорт CSV завершён');
}

/**
 * Открывает модальное окно экспорта
 * @example
 * openExportModal();
 */
export function openExportModal() {
    openModal('exportModal');
}

/**
 * Закрывает модальное окно экспорта
 * @example
 * closeExportModal();
 */
export function closeExportModal() {
    closeModal('exportModal');
}

/**
 * Быстрый экспорт в указанном формате
 * @param {string} format - 'txt', 'json' или 'csv'
 * @example
 * quickExport('json');
 */
export function quickExport(format) {
    const regexTextarea = document.getElementById('regexResult');
    
    if (!regexTextarea) {
        showToast('error', 'Нет regex для экспорта');
        return;
    }
    
    const regex = regexTextarea.value.trim();
    
    if (!regex) {
        showToast('error', 'Нет regex для экспорта');
        return;
    }
    
    const simpleTextarea = document.getElementById('simpleTriggers');
    const triggers = simpleTextarea ? simpleTextarea.value.split('\n').filter(t => t.trim()) : [];
    
    switch (format) {
        case 'txt':
            exportTXT(regex, triggers, 'simple');
            break;
        case 'json':
            exportJSON(regex, triggers, 'simple', {});
            break;
        case 'csv':
            exportCSV(regex, triggers);
            break;
        default:
            showToast('error', 'Неизвестный формат экспорта');
    }
    
    closeExportModal();
}
