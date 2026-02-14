/**
 * ExportManager.js
 * Менеджер экспорта для RegexHelper v4.0
 * Экспорт результатов и истории в TXT/JSON/CSV
 */

import { getHistory, exportHistoryJSON, exportHistoryCSV } from '../utils/storage.js';

/**
 * Менеджер экспорта
 */
class ExportManager {
  constructor() {
    this.init();
  }

  /**
   * Инициализация
   */
  init() {
    this.attachEventListeners();
  }

  /**
   * Навешивание обработчиков
   */
  attachEventListeners() {
    // Кнопки экспорта результата
    const exportResultTXT = document.getElementById('export-result-txt');
    const exportResultJSON = document.getElementById('export-result-json');

    if (exportResultTXT) {
      exportResultTXT.addEventListener('click', () => this.exportResultToTXT());
    }

    if (exportResultJSON) {
      exportResultJSON.addEventListener('click', () => this.exportResultToJSON());
    }

    // Кнопки экспорта истории (в модале)
    document.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'export-history-txt') {
        this.exportHistoryToTXT();
      }
      if (e.target.dataset.action === 'export-history-json') {
        this.exportHistoryToJSON();
      }
      if (e.target.dataset.action === 'export-history-csv') {
        this.exportHistoryToCSV();
      }
    });
  }

  /**
   * Экспорт результата конвертации в TXT
   */
  exportResultToTXT() {
    const resultTextarea = document.getElementById('output-result');

    if (!resultTextarea) {
      console.error('Textarea результата не найден');
      return;
    }

    const result = resultTextarea.value.trim();

    if (!result) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('Нет результата для экспорта');
      }
      return;
    }

    // Генерация имени файла
    const filename = `regex_${this.getTimestamp()}.txt`;

    // Скачивание
    this.downloadFile(result, filename, 'text/plain');

    if (window.NotificationManager) {
      window.NotificationManager.success('Результат экспортирован в TXT');
    }
  }

  /**
   * Экспорт результата конвертации в JSON
   */
  exportResultToJSON() {
    const resultTextarea = document.getElementById('output-result');

    if (!resultTextarea) {
      console.error('Textarea результата не найден');
      return;
    }

    const result = resultTextarea.value.trim();

    if (!result) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('Нет результата для экспорта');
      }
      return;
    }

    // Формирование JSON
    const jsonData = {
      regex: result,
      timestamp: new Date().toISOString(),
      generator: 'RegexHelper v4.0'
    };

    const jsonString = JSON.stringify(jsonData, null, 2);

    // Генерация имени файла
    const filename = `regex_${this.getTimestamp()}.json`;

    // Скачивание
    this.downloadFile(jsonString, filename, 'application/json');

    if (window.NotificationManager) {
      window.NotificationManager.success('Результат экспортирован в JSON');
    }
  }

  /**
   * Экспорт истории в TXT
   */
  exportHistoryToTXT() {
    const history = getHistory();

    if (history.length === 0) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('История пуста');
      }
      return;
    }

    // Формирование TXT
    let content = '═══════════════════════════════════════════════════\n';
    content += '   REGEXHELPER v4.0 - ИСТОРИЯ КОНВЕРТАЦИЙ\n';
    content += `   Экспортировано: ${new Date().toLocaleString('ru-RU')}\n`;
    content += `   Записей: ${history.length}\n`;
    content += '═══════════════════════════════════════════════════\n\n';

    history.forEach((item, index) => {
      const date = new Date(item.date).toLocaleString('ru-RU');
      const type = item.type === 'simple' ? 'Простые триггеры' : 'Связанные триггеры';

      content += `\n[${index + 1}] ${date}\n`;
      content += `Тип: ${type}\n`;
      content += `Триггеры: ${item.triggers.join(', ')}\n`;

      // Параметры
      const params = Object.keys(item.params).filter(k => item.params[k]);
      if (params.length > 0) {
        content += `Параметры: ${params.join(', ')}\n`;
      }

      content += `Результат: ${item.result}\n`;
      content += '─────────────────────────────────────────────────\n';
    });

    // Генерация имени файла
    const filename = `regexhelper_history_${this.getTimestamp()}.txt`;

    // Скачивание
    this.downloadFile(content, filename, 'text/plain');

    if (window.NotificationManager) {
      window.NotificationManager.success('История экспортирована в TXT');
    }
  }

  /**
   * Экспорт истории в JSON
   */
  exportHistoryToJSON() {
    const jsonString = exportHistoryJSON();

    if (!jsonString || jsonString === '[]') {
      if (window.NotificationManager) {
        window.NotificationManager.warning('История пуста');
      }
      return;
    }

    // Генерация имени файла
    const filename = `regexhelper_history_${this.getTimestamp()}.json`;

    // Скачивание
    this.downloadFile(jsonString, filename, 'application/json');

    if (window.NotificationManager) {
      window.NotificationManager.success('История экспортирована в JSON');
    }
  }

  /**
   * Экспорт истории в CSV
   */
  exportHistoryToCSV() {
    const csvString = exportHistoryCSV();

    if (!csvString) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('История пуста');
      }
      return;
    }

    // Генерация имени файла
    const filename = `regexhelper_history_${this.getTimestamp()}.csv`;

    // Скачивание (с BOM для корректного отображения кириллицы в Excel)
    const bom = '\uFEFF';
    this.downloadFile(bom + csvString, filename, 'text/csv;charset=utf-8;');

    if (window.NotificationManager) {
      window.NotificationManager.success('История экспортирована в CSV');
    }
  }

  /**
   * Скачивание файла
   * @param {string} content - Содержимое файла
   * @param {string} filename - Имя файла
   * @param {string} mimeType - MIME тип
   */
  downloadFile(content, filename, mimeType) {
    try {
      // Создание Blob
      const blob = new Blob([content], { type: mimeType });

      // Создание ссылки для скачивания
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Клик по ссылке
      document.body.appendChild(link);
      link.click();

      // Очистка
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Ошибка скачивания файла:', error);

      if (window.NotificationManager) {
        window.NotificationManager.error('Ошибка экспорта');
      }
    }
  }

  /**
   * Генерация timestamp для имени файла
   * @returns {string} Timestamp в формате YYYYMMDD_HHMMSS
   */
  getTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Экспорт текущей структуры связанных триггеров в JSON
   * (для импорта/экспорта структуры между сессиями)
   */
  exportLinkedStructureJSON() {
    if (!window.LinkedTriggersManager) {
      console.error('LinkedTriggersManager не найден');
      return;
    }

    const structure = window.LinkedTriggersManager.getAllGroups();

    if (!structure || structure.length === 0) {
      if (window.NotificationManager) {
        window.NotificationManager.warning('Нет связанных триггеров для экспорта');
      }
      return;
    }

    const jsonData = {
      version: '4.0',
      exported: new Date().toISOString(),
      groups: structure
    };

    const jsonString = JSON.stringify(jsonData, null, 2);

    // Генерация имени файла
    const filename = `regexhelper_structure_${this.getTimestamp()}.json`;

    // Скачивание
    this.downloadFile(jsonString, filename, 'application/json');

    if (window.NotificationManager) {
      window.NotificationManager.success('Структура экспортирована в JSON');
    }
  }

  /**
   * Импорт структуры связанных триггеров из JSON
   * @param {File} file - Файл JSON
   */
  importLinkedStructureJSON(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        if (!jsonData.groups || !Array.isArray(jsonData.groups)) {
          throw new Error('Некорректный формат файла');
        }

        // Импортируем структуру
        if (window.LinkedTriggersManager) {
          window.LinkedTriggersManager.importStructure(jsonData.groups);

          if (window.NotificationManager) {
            window.NotificationManager.success('Структура импортирована');
          }
        }

      } catch (error) {
        console.error('Ошибка импорта:', error);

        if (window.NotificationManager) {
          window.NotificationManager.error('Ошибка импорта: некорректный файл');
        }
      }
    };

    reader.onerror = () => {
      if (window.NotificationManager) {
        window.NotificationManager.error('Ошибка чтения файла');
      }
    };

    reader.readAsText(file);
  }

  /**
   * Получение статистики экспорта
   * @returns {Object} Статистика
   */
  getExportStats() {
    const history = getHistory();

    return {
      historyCount: history.length,
      totalExports: 0, // TODO: можно добавить счётчик экспортов в localStorage
      lastExport: null // TODO: сохранять дату последнего экспорта
    };
  }
}

// Singleton
let instance = null;

/**
 * Получение экземпляра менеджера
 */
export function getExportManager() {
  if (!instance) {
    instance = new ExportManager();
  }
  return instance;
}

export default ExportManager;
