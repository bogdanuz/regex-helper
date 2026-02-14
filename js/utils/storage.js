/**
 * storage.js
 * Модуль работы с localStorage для RegexHelper v4.0
 * Управление историей конвертаций (макс. 100 записей, FIFO)
 */

const STORAGE_KEYS = {
  HISTORY: 'regexhelper_history',
  SETTINGS: 'regexhelper_settings',
  SIMPLE_TRIGGERS: 'regexhelper_simple_triggers',
  LINKED_STRUCTURE: 'regexhelper_linked_structure'
};

const MAX_HISTORY_ITEMS = 100;

/**
 * Сохранение истории конвертации
 * FIFO: при превышении лимита удаляется самая старая запись
 * 
 * @param {Object} item - Запись истории
 * @param {string} item.id - Уникальный ID (timestamp)
 * @param {Date} item.date - Дата конвертации
 * @param {Array<string>} item.triggers - Триггеры (первые 10)
 * @param {Object} item.params - Применённые параметры
 * @param {string} item.result - Результат конвертации
 * @param {string} item.type - Тип ('simple' или 'linked')
 * @returns {boolean} true при успехе
 */
export function saveToHistory(item) {
  try {
    // Получаем текущую историю
    const history = getHistory();

    // Добавляем новую запись в начало
    history.unshift({
      id: item.id || Date.now().toString(),
      date: item.date || new Date().toISOString(),
      triggers: item.triggers || [],
      params: item.params || {},
      result: item.result || '',
      type: item.type || 'simple'
    });

    // FIFO: удаляем старые записи, если превышен лимит
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }

    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return true;

  } catch (error) {
    console.error('saveToHistory: ошибка сохранения', error);
    return false;
  }
}

/**
 * Получение истории конвертаций
 * @returns {Array<Object>} Массив записей истории (новые первыми)
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);

    if (!data) {
      return [];
    }

    const history = JSON.parse(data);

    // Проверка валидности
    if (!Array.isArray(history)) {
      console.warn('getHistory: некорректный формат данных');
      return [];
    }

    return history;

  } catch (error) {
    console.error('getHistory: ошибка чтения', error);
    return [];
  }
}

/**
 * Получение одной записи истории по ID
 * @param {string} id - ID записи
 * @returns {Object|null} Запись истории или null
 */
export function getHistoryItem(id) {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
}

/**
 * Удаление записи из истории
 * @param {string} id - ID записи для удаления
 * @returns {boolean} true при успехе
 */
export function deleteFromHistory(id) {
  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);

    if (filtered.length === history.length) {
      // Запись не найдена
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
    return true;

  } catch (error) {
    console.error('deleteFromHistory: ошибка удаления', error);
    return false;
  }
}

/**
 * Очистка всей истории
 * @returns {boolean} true при успехе
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (error) {
    console.error('clearHistory: ошибка очистки', error);
    return false;
  }
}

/**
 * Получение количества записей в истории
 * @returns {number} Количество записей
 */
export function getHistoryCount() {
  return getHistory().length;
}

/**
 * Получение последних N записей истории
 * @param {number} count - Количество записей (по умолчанию 10)
 * @returns {Array<Object>} Последние N записей
 */
export function getRecentHistory(count = 10) {
  const history = getHistory();
  return history.slice(0, count);
}

/**
 * Поиск в истории по триггерам
 * @param {string} query - Поисковый запрос
 * @returns {Array<Object>} Найденные записи
 */
export function searchHistory(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const history = getHistory();
  const lowerQuery = query.toLowerCase();

  return history.filter(item => {
    // Поиск в триггерах
    const triggersMatch = item.triggers.some(trigger => 
      trigger.toLowerCase().includes(lowerQuery)
    );

    // Поиск в результате
    const resultMatch = item.result.toLowerCase().includes(lowerQuery);

    return triggersMatch || resultMatch;
  });
}

/**
 * Экспорт истории в JSON
 * @returns {string} JSON строка с историей
 */
export function exportHistoryJSON() {
  const history = getHistory();
  return JSON.stringify(history, null, 2);
}

/**
 * Экспорт истории в CSV
 * @returns {string} CSV строка с историей
 */
export function exportHistoryCSV() {
  const history = getHistory();

  if (history.length === 0) {
    return '';
  }

  // Заголовки CSV
  const headers = ['ID', 'Дата', 'Тип', 'Триггеры', 'Параметры', 'Результат'];
  const rows = [headers];

  // Данные
  history.forEach(item => {
    rows.push([
      item.id,
      new Date(item.date).toLocaleString('ru-RU'),
      item.type === 'simple' ? 'Простые' : 'Связанные',
      item.triggers.join('; '),
      Object.keys(item.params).filter(k => item.params[k]).join(', '),
      item.result
    ]);
  });

  // Преобразование в CSV
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

/**
 * Импорт истории из JSON
 * @param {string} jsonString - JSON строка с историей
 * @returns {boolean} true при успехе
 */
export function importHistoryJSON(jsonString) {
  try {
    const imported = JSON.parse(jsonString);

    if (!Array.isArray(imported)) {
      throw new Error('Некорректный формат данных');
    }

    // Объединяем с текущей историей
    const currentHistory = getHistory();
    const merged = [...imported, ...currentHistory];

    // Удаляем дубликаты по ID
    const unique = merged.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    // Ограничиваем лимитом
    const limited = unique.slice(0, MAX_HISTORY_ITEMS);

    // Сохраняем
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limited));
    return true;

  } catch (error) {
    console.error('importHistoryJSON: ошибка импорта', error);
    return false;
  }
}

/**
 * Сохранение настроек приложения
 * @param {Object} settings - Объект настроек
 * @returns {boolean} true при успехе
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('saveSettings: ошибка сохранения', error);
    return false;
  }
}

/**
 * Получение настроек приложения
 * @returns {Object} Объект настроек
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('getSettings: ошибка чтения', error);
    return {};
  }
}

/**
 * Сохранение простых триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @returns {boolean} true при успехе
 */
export function saveSimpleTriggers(triggers) {
  try {
    localStorage.setItem(STORAGE_KEYS.SIMPLE_TRIGGERS, JSON.stringify(triggers));
    return true;
  } catch (error) {
    console.error('saveSimpleTriggers: ошибка сохранения', error);
    return false;
  }
}

/**
 * Получение простых триггеров
 * @returns {Array<string>} Массив триггеров
 */
export function getSimpleTriggers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SIMPLE_TRIGGERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getSimpleTriggers: ошибка чтения', error);
    return [];
  }
}

/**
 * Сохранение структуры связанных триггеров
 * @param {Object} structure - Структура групп/подгрупп/триггеров
 * @returns {boolean} true при успехе
 */
export function saveLinkedStructure(structure) {
  try {
    localStorage.setItem(STORAGE_KEYS.LINKED_STRUCTURE, JSON.stringify(structure));
    return true;
  } catch (error) {
    console.error('saveLinkedStructure: ошибка сохранения', error);
    return false;
  }
}

/**
 * Получение структуры связанных триггеров
 * @returns {Object} Структура групп/подгрупп/триггеров
 */
export function getLinkedStructure() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LINKED_STRUCTURE);
    return data ? JSON.parse(data) : { groups: [] };
  } catch (error) {
    console.error('getLinkedStructure: ошибка чтения', error);
    return { groups: [] };
  }
}

/**
 * Очистка всех данных localStorage
 * @returns {boolean} true при успехе
 */
export function clearAllStorage() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('clearAllStorage: ошибка очистки', error);
    return false;
  }
}

/**
 * Получение размера занятого localStorage (в KB)
 * @returns {number} Размер в KB
 */
export function getStorageSize() {
  try {
    let total = 0;

    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        total += data.length;
      }
    });

    return (total / 1024).toFixed(2);

  } catch (error) {
    console.error('getStorageSize: ошибка подсчёта', error);
    return 0;
  }
}

/**
 * Экспорт ключей для использования в других модулях
 */
export { STORAGE_KEYS, MAX_HISTORY_ITEMS };
