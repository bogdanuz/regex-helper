/**
 * ============================================
 * ИСТОРИЯ КОНВЕРТАЦИЙ
 * ============================================
 * 
 * Управление историей конвертаций:
 * - Сохранение в localStorage (последние 10)
 * - Отображение списка
 * - Загрузка конвертации
 * - Удаление записей
 * 
 * Зависимости: utils.js, errors.js, converter.js
 */

// ============================================
// КОНСТАНТЫ
// ============================================

const HISTORY_CONFIG = {
    STORAGE_KEY: 'regexhelper_history',
    MAX_ITEMS: 10,
    DATE_FORMAT: 'ru-RU'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

/**
 * Инициализация модуля истории
 */
function initHistory() {
    try {
        // Проверка поддержки localStorage
        if (!window.localStorage) {
            console.warn('localStorage не поддерживается');
            return;
        }

        // Event listeners
        const historyBtn = document.getElementById('historyBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');

        if (historyBtn) {
            historyBtn.addEventListener('click', showHistoryModal);
        }

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', handleClearHistory);
        }

        console.log('✓ История инициализирована');
    } catch (error) {
        logError('initHistory', error);
    }
}

// ============================================
// РАБОТА С LOCALSTORAGE
// ============================================

/**
 * Загрузка истории из localStorage
 * @returns {Array} Массив записей истории
 */
function loadHistory() {
    try {
        const data = localStorage.getItem(HISTORY_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        logError('loadHistory', error);
        return [];
    }
}

/**
 * Сохранение истории в localStorage
 * @param {Array} history - Массив записей
 */
function saveHistoryToStorage(history) {
    try {
        localStorage.setItem(HISTORY_CONFIG.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        logError('saveHistoryToStorage', error);
        showToast('error', ERROR_MESSAGES.STORAGE_ERROR || 'Ошибка сохранения истории');
    }
}

/**
 * Сохранение конвертации в историю
 * @param {string} regex - Результат конвертации
 * @param {Array} triggers - Исходные триггеры
 * @param {Object} settings - Настройки оптимизаций
 * @param {Object} info - Дополнительная информация
 */
function saveToHistory(regex, triggers, settings, info) {
    try {
        if (!regex || !triggers || triggers.length === 0) {
            return;
        }

        const history = loadHistory();
        
        // Создание новой записи
        const entry = {
            id: Date.now(),
            date: formatDate(new Date()),
            regex: regex,
            triggers: triggers,
            triggerCount: triggers.length,
            regexLength: regex.length,
            settings: settings || {}
        };

        // Добавление в начало массива
        history.unshift(entry);

        // Ограничение количества записей
        if (history.length > HISTORY_CONFIG.MAX_ITEMS) {
            history.splice(HISTORY_CONFIG.MAX_ITEMS);
        }

        // Сохранение
        saveHistoryToStorage(history);

        console.log('✓ Конвертация сохранена в историю');
    } catch (error) {
        logError('saveToHistory', error);
    }
}

/**
 * Удаление записи из истории
 * @param {number} id - ID записи
 */
function deleteFromHistory(id) {
    try {
        let history = loadHistory();
        history = history.filter(item => item.id !== id);
        saveHistoryToStorage(history);
        
        // Обновление UI
        renderHistory();
        
        showToast('success', SUCCESS_MESSAGES.HISTORY_DELETED || 'Запись удалена');
    } catch (error) {
        logError('deleteFromHistory', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR || 'Ошибка удаления');
    }
}

/**
 * Очистка всей истории
 */
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_CONFIG.STORAGE_KEY);
        renderHistory();
        showToast('success', SUCCESS_MESSAGES.HISTORY_CLEARED || 'История очищена');
    } catch (error) {
        logError('clearHistory', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR || 'Ошибка очистки');
    }
}

// ============================================
// UI ФУНКЦИИ
// ============================================

/**
 * Показать модальное окно истории
 */
function showHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        renderHistory();
        modal.style.display = 'flex';
    }
}

/**
 * Отрисовка списка истории
 */
function renderHistory() {
    const historyList = document.getElementById('historyList');
    const historyEmpty = document.getElementById('historyEmpty');
    
    if (!historyList || !historyEmpty) return;

    const history = loadHistory();

    // Если история пуста
    if (history.length === 0) {
        historyList.innerHTML = '';
        historyList.style.display = 'none';
        historyEmpty.style.display = 'block';
        return;
    }

    // Отображение записей
    historyList.style.display = 'flex';
    historyEmpty.style.display = 'none';

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item-header">
                <span class="history-item-date">🕒 ${item.date}</span>
                <div class="history-item-actions">
                    <button 
                        class="btn-icon" 
                        onclick="loadFromHistory(${item.id})"
                        title="Загрузить конвертацию"
                    >
                        📥
                    </button>
                    <button 
                        class="btn-icon" 
                        onclick="deleteFromHistory(${item.id})"
                        title="Удалить запись"
                    >
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="history-item-regex" title="${escapeHTML(item.regex)}">
                ${escapeHTML(truncateRegex(item.regex, 80))}
            </div>
            
            <div class="history-item-meta">
                <span title="Количество триггеров">
                    📝 ${item.triggerCount} ${pluralize(item.triggerCount, ['триггер', 'триггера', 'триггеров'])}
                </span>
                <span title="Длина регулярного выражения">
                    📏 ${item.regexLength} символов
                </span>
            </div>
        </div>
    `).join('');
}

/**
 * Загрузка конвертации из истории
 * @param {number} id - ID записи
 */
function loadFromHistory(id) {
    try {
        const history = loadHistory();
        const entry = history.find(item => item.id === id);

        if (!entry) {
            showToast('error', ERROR_MESSAGES.HISTORY_NOT_FOUND || 'Запись не найдена');
            return;
        }

        // Закрытие модалки
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // Загрузка триггеров в textarea
        const simpleTextarea = document.getElementById('simpleTriggers');
        if (simpleTextarea) {
            simpleTextarea.value = entry.triggers.join('\n');
            // Обновление счетчика
            if (typeof updateSimpleTriggerCount === 'function') {
                updateSimpleTriggerCount();
            }
        }

        // Загрузка настроек оптимизаций
        if (entry.settings) {
            Object.keys(entry.settings).forEach(key => {
                const checkbox = document.getElementById(key);
                if (checkbox) {
                    checkbox.checked = entry.settings[key];
                }
            });
        }

        // Загрузка результата
        const resultTextarea = document.getElementById('result');
        if (resultTextarea) {
            resultTextarea.value = entry.regex;
        }

        // Обновление статистики
        if (typeof updateResultStats === 'function') {
            updateResultStats({
                triggerCount: entry.triggerCount,
                regexLength: entry.regexLength
            });
        }

        showToast('success', SUCCESS_MESSAGES.HISTORY_LOADED || 'Конвертация загружена');
    } catch (error) {
        logError('loadFromHistory', error);
        showToast('error', ERROR_MESSAGES.UNKNOWN_ERROR || 'Ошибка загрузки');
    }
}

/**
 * Обработчик очистки истории (с подтверждением)
 */
function handleClearHistory() {
    const history = loadHistory();
    
    if (history.length === 0) {
        showToast('info', INFO_MESSAGES.HISTORY_EMPTY || 'История уже пуста');
        return;
    }

    confirmAction(
        'Очистить всю историю?',
        'Это действие нельзя отменить',
        () => clearHistory()
    );
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Форматирование даты
 * @param {Date} date - Объект Date
 * @returns {string} Форматированная строка
 */
function formatDate(date) {
    return date.toLocaleString(HISTORY_CONFIG.DATE_FORMAT, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Обрезка regex для превью
 * @param {string} regex - Регулярное выражение
 * @param {number} maxLength - Максимальная длина
 * @returns {string} Обрезанная строка
 */
function truncateRegex(regex, maxLength = 80) {
    if (regex.length <= maxLength) {
        return regex;
    }
    return regex.substring(0, maxLength) + '...';
}

// ============================================
// ЭКСПОРТ (для использования в других модулях)
// ============================================

// Функции доступны глобально через window
window.initHistory = initHistory;
window.saveToHistory = saveToHistory;
window.loadFromHistory = loadFromHistory;
window.deleteFromHistory = deleteFromHistory;
window.clearHistory = clearHistory;

console.log('✓ Модуль history.js загружен');
