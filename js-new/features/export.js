/**
 * RegexHelper v4.0 - Export Module
 * 
 * Модуль для экспорта данных в различных форматах (TXT, CSV, JSON).
 * Поддерживает экспорт regex, триггеров, истории и полного состояния приложения.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

import { downloadFile, formatDate, escapeCSV } from '../core/utils.js';
import { openModal, closeModal } from './modals.js';
import { APPCONFIG } from '../core/config.js';

/**
 * Инициализирует модуль экспорта
 * @returns {void}
 * @example
 * initExport(); // вызывается в main.js
 */
export function initExport() {
  // Обработчик кнопки "Экспорт"
  const exportBtn = document.getElementById('btnExport');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => openModal('exportModal'));
  }

  // Обработчики кнопок форматов в модальном окне
  const exportTxtBtn = document.getElementById('btnExportTxt');
  const exportCsvBtn = document.getElementById('btnExportCsv');
  const exportJsonBtn = document.getElementById('btnExportJson');

  if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', () => exportRegexAsTxt());
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => exportRegexAsCsv());
  }

  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => exportRegexAsJson());
  }

  console.log('[Export] Initialized');
}

/**
 * Экспортирует regex в TXT файл
 * @param {string} [regex] - Regex для экспорта (если не указан - берется из resultOutput)
 * @param {string} [filename] - Имя файла (если не указано - генерируется автоматически)
 * @returns {void}
 * @example
 * exportRegexAsTxt('test|hello', 'my-regex.txt');
 */
export function exportRegexAsTxt(regex, filename) {
  const regexToExport = regex || getRegexFromOutput();
  
  if (!regexToExport) {
    showToast('warning', 'Нет regex для экспорта');
    return;
  }

  const finalFilename = filename || generateFilename('txt');
  const content = regexToExport;

  downloadFile(content, finalFilename, 'text/plain');
  
  closeModal('exportModal');
  showToast('success', `Файл ${finalFilename} загружен`);
}

/**
 * Экспортирует regex в CSV файл
 * @param {string} [regex] - Regex для экспорта
 * @param {string} [filename] - Имя файла
 * @returns {void}
 * @example
 * exportRegexAsCsv();
 */
export function exportRegexAsCsv(regex, filename) {
  const regexToExport = regex || getRegexFromOutput();
  
  if (!regexToExport) {
    showToast('warning', 'Нет regex для экспорта');
    return;
  }

  const finalFilename = filename || generateFilename('csv');
  
  // CSV формат: дата, regex, длина
  const csvHeader = 'Дата,Regex,Длина\n';
  const csvRow = `${formatDate(new Date())},${escapeCSV(regexToExport)},${regexToExport.length}\n`;
  const content = csvHeader + csvRow;

  downloadFile(content, finalFilename, 'text/csv');
  
  closeModal('exportModal');
  showToast('success', `Файл ${finalFilename} загружен`);
}

/**
 * Экспортирует regex в JSON файл
 * @param {Object} [data] - Данные для экспорта (если не указаны - берется regex + метаданные)
 * @param {string} [filename] - Имя файла
 * @returns {void}
 * @example
 * exportRegexAsJson();
 */
export function exportRegexAsJson(data, filename) {
  const regexToExport = getRegexFromOutput();
  
  if (!regexToExport && !data) {
    showToast('warning', 'Нет данных для экспорта');
    return;
  }

  const finalFilename = filename || generateFilename('json');
  
  const exportData = data || {
    version: APPCONFIG.VERSION,
    appName: APPCONFIG.APPNAME,
    date: new Date().toISOString(),
    regex: regexToExport,
    length: regexToExport?.length || 0
  };

  const content = JSON.stringify(exportData, null, 2);

  downloadFile(content, finalFilename, 'application/json');
  
  closeModal('exportModal');
  showToast('success', `Файл ${finalFilename} загружен`);
}

/**
 * Экспортирует простые триггеры в файл
 * @param {string[]} triggers - Массив триггеров
 * @param {string} format - Формат: 'txt', 'csv', 'json'
 * @returns {void}
 * @example
 * exportTriggers(['привет', 'мир'], 'txt');
 */
export function exportTriggers(triggers, format = 'txt') {
  if (!Array.isArray(triggers) || triggers.length === 0) {
    showToast('warning', 'Нет триггеров для экспорта');
    return;
  }

  const filename = generateFilename(format, 'triggers');

  switch (format) {
    case 'txt':
      const txtContent = triggers.join('\n');
      downloadFile(txtContent, filename, 'text/plain');
      break;

    case 'csv':
      const csvHeader = 'Триггер,Длина\n';
      const csvRows = triggers.map(t => `${escapeCSV(t)},${t.length}`).join('\n');
      const csvContent = csvHeader + csvRows + '\n';
      downloadFile(csvContent, filename, 'text/csv');
      break;

    case 'json':
      const jsonData = {
        version: APPCONFIG.VERSION,
        date: new Date().toISOString(),
        triggers: triggers,
        count: triggers.length
      };
      const jsonContent = JSON.stringify(jsonData, null, 2);
      downloadFile(jsonContent, filename, 'application/json');
      break;

    default:
      showToast('error', 'Неизвестный формат экспорта');
      return;
  }

  showToast('success', `Экспортировано ${triggers.length} триггеров`);
}

/**
 * Экспортирует историю в файл
 * @param {Array} history - Массив истории
 * @param {string} format - Формат: 'txt', 'csv', 'json'
 * @returns {void}
 * @example
 * exportHistory(historyArray, 'json');
 */
export function exportHistory(history, format = 'json') {
  if (!Array.isArray(history) || history.length === 0) {
    showToast('warning', 'История пуста');
    return;
  }

  const filename = generateFilename(format, 'history');

  switch (format) {
    case 'txt':
      const txtContent = history.map((item, index) => {
        return `${index + 1}. [${formatDate(item.date)}] ${item.regex}`;
      }).join('\n\n');
      downloadFile(txtContent, filename, 'text/plain');
      break;

    case 'csv':
      const csvHeader = 'Дата,Regex,Длина\n';
      const csvRows = history.map(item => {
        return `${formatDate(item.date)},${escapeCSV(item.regex)},${item.regex.length}`;
      }).join('\n');
      const csvContent = csvHeader + csvRows + '\n';
      downloadFile(csvContent, filename, 'text/csv');
      break;

    case 'json':
      const jsonContent = JSON.stringify({
        version: APPCONFIG.VERSION,
        date: new Date().toISOString(),
        historyCount: history.length,
        history: history
      }, null, 2);
      downloadFile(jsonContent, filename, 'application/json');
      break;

    default:
      showToast('error', 'Неизвестный формат экспорта');
      return;
  }

  showToast('success', `Экспортировано ${history.length} записей истории`);
}

/**
 * Экспортирует полное состояние приложения (для бэкапа)
 * @param {Object} appState - Состояние приложения
 * @returns {void}
 * @example
 * exportFullState({
 *   simpleTriggers: [...],
 *   linkedGroups: [...],
 *   history: [...],
 *   settings: {...}
 * });
 */
export function exportFullState(appState) {
  if (!appState || typeof appState !== 'object') {
    showToast('error', 'Некорректное состояние приложения');
    return;
  }

  const filename = generateFilename('json', 'full-backup');

  const backupData = {
    version: APPCONFIG.VERSION,
    appName: APPCONFIG.APPNAME,
    exportDate: new Date().toISOString(),
    ...appState
  };

  const content = JSON.stringify(backupData, null, 2);
  downloadFile(content, filename, 'application/json');

  showToast('success', 'Полный бэкап создан');
}

/**
 * Импортирует состояние приложения из JSON
 * @param {File} file - Файл для импорта
 * @returns {Promise<Object>} - Промис с данными
 * @example
 * const data = await importFullState(file);
 */
export async function importFullState(file) {
  if (!file) {
    throw new Error('Файл не указан');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Валидация версии
        if (!data.version || data.appName !== APPCONFIG.APPNAME) {
          reject(new Error('Некорректный формат файла'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Ошибка парсинга JSON'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };

    reader.readAsText(file);
  });
}

/**
 * Импортирует триггеры из файла
 * @param {File} file - Файл для импорта
 * @returns {Promise<string[]>} - Промис с массивом триггеров
 * @example
 * const triggers = await importTriggers(file);
 */
export async function importTriggers(file) {
  if (!file) {
    throw new Error('Файл не указан');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const ext = file.name.split('.').pop().toLowerCase();

        let triggers = [];

        if (ext === 'json') {
          const data = JSON.parse(content);
          triggers = data.triggers || [];
        } else if (ext === 'csv') {
          const lines = content.split('\n').slice(1); // пропускаем заголовок
          triggers = lines.map(line => {
            const match = line.match(/^"?([^",]+)"?,/);
            return match ? match[1] : line.split(',')[0];
          }).filter(t => t && t.trim().length > 0);
        } else {
          // txt или другой формат
          triggers = content.split('\n').map(t => t.trim()).filter(t => t.length > 0);
        }

        resolve(triggers);
      } catch (error) {
        reject(new Error('Ошибка парсинга файла'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };

    reader.readAsText(file);
  });
}

/**
 * Генерирует имя файла для экспорта
 * @param {string} extension - Расширение файла
 * @param {string} [prefix] - Префикс (по умолчанию 'regex')
 * @returns {string} - Имя файла
 * @example
 * generateFilename('json', 'backup') // 'regexhelper-backup-2026-02-12-232400.json'
 */
export function generateFilename(extension, prefix = 'regex') {
  const date = new Date();
  const timestamp = date.toISOString()
    .replace(/:/g, '')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  return `regexhelper-${prefix}-${timestamp}.${extension}`;
}

/**
 * Получает regex из output поля
 * @returns {string|null} - Regex или null
 * @private
 */
function getRegexFromOutput() {
  const output = document.getElementById('resultOutput');
  if (!output) return null;

  const regex = output.value.trim();
  return regex.length > 0 ? regex : null;
}

/**
 * Копирует regex в буфер обмена с уведомлением
 * @param {string} [regex] - Regex для копирования
 * @returns {void}
 * @example
 * copyRegexToClipboard('test|hello');
 */
export function copyRegexToClipboard(regex) {
  const regexToCopy = regex || getRegexFromOutput();
  
  if (!regexToCopy) {
    showToast('warning', 'Нет regex для копирования');
    return;
  }

  // Используем Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(regexToCopy)
      .then(() => {
        showToast('success', 'Regex скопирован в буфер обмена');
      })
      .catch(() => {
        fallbackCopyToClipboard(regexToCopy);
      });
  } else {
    fallbackCopyToClipboard(regexToCopy);
  }
}

/**
 * Fallback метод копирования (для старых браузеров)
 * @param {string} text - Текст для копирования
 * @returns {void}
 * @private
 */
function fallbackCopyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  
  textarea.select();
  
  try {
    document.execCommand('copy');
    showToast('success', 'Regex скопирован в буфер обмена');
  } catch (error) {
    showToast('error', 'Не удалось скопировать в буфер обмена');
  }
  
  document.body.removeChild(textarea);
}

/**
 * Показывает toast-уведомление (временная функция до подключения errors.js)
 * @param {string} type - Тип уведомления
 * @param {string} message - Сообщение
 * @returns {void}
 * @private
 */
function showToast(type, message) {
  // TODO: Заменить на import { showToast } from '../core/errors.js';
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Временная реализация
  if (typeof window.showToast === 'function') {
    window.showToast(type, message);
  }
}

/**
 * Экспортирует данные в форматах, поддерживаемых приложением
 * @param {string} dataType - Тип данных: 'regex', 'triggers', 'history', 'full'
 * @param {string} format - Формат: 'txt', 'csv', 'json'
 * @param {any} data - Данные для экспорта
 * @returns {void}
 * @example
 * exportData('triggers', 'json', ['привет', 'мир']);
 */
export function exportData(dataType, format, data) {
  switch (dataType) {
    case 'regex':
      if (format === 'txt') exportRegexAsTxt(data);
      else if (format === 'csv') exportRegexAsCsv(data);
      else if (format === 'json') exportRegexAsJson(data);
      break;

    case 'triggers':
      exportTriggers(data, format);
      break;

    case 'history':
      exportHistory(data, format);
      break;

    case 'full':
      exportFullState(data);
      break;

    default:
      showToast('error', 'Неизвестный тип данных');
  }
}
