/**
 * ============================================
 * СИСТЕМА УВЕДОМЛЕНИЙ И ОШИБОК
 * ============================================
 * 
 * Управление Toast-уведомлениями, модальными окнами,
 * inline ошибками и диалогами подтверждения.
 * 
 * Зависимости: utils.js
 */

/* ============================================
   ПУЛ СООБЩЕНИЙ
   ============================================ */

const ERROR_MESSAGES = {
    // Лимиты
    TRIGGERS_LIMIT_SOFT: 'Внимание: более 200 триггеров может замедлить работу',
    TRIGGERS_LIMIT_HARD: 'Превышен лимит триггеров (максимум 200)',
    REGEX_LENGTH_LIMIT: 'Regex слишком длинный (максимум 10,000 символов)',
    LINKED_GROUP_LIMIT: 'Максимум 9 триггеров в связанной группе',
    
    // Валидация
    EMPTY_TRIGGERS: 'Введите хотя бы один триггер',
    EMPTY_LINKED_GROUP: 'Заполните все поля в связанной группе',
    INVALID_REGEX: 'Некорректное регулярное выражение',
    EMPTY_TEST_TEXT: 'Введите текст для тестирования',
    EMPTY_REGEX_INPUT: 'Введите регулярное выражение',
    
    // Библиотеки
    LIBRARY_LOAD_FAILED: 'Не удалось загрузить библиотеку',
    LIBRARY_CDN_FAILED: 'CDN недоступен, используется локальная копия',
    
    // Браузер
    BROWSER_NOT_SUPPORTED: 'Ваш браузер не поддерживается. Используйте Chrome 90+, Firefox 88+ или Safari 14+',
    CLIPBOARD_NOT_SUPPORTED: 'Ваш браузер не поддерживает копирование в буфер',
    
    // localStorage
    STORAGE_QUOTA_EXCEEDED: 'Превышен лимит хранилища браузера',
    STORAGE_NOT_AVAILABLE: 'localStorage недоступен',
    
    // История
    HISTORY_NOT_FOUND: 'Запись не найдена в истории',
    STORAGE_ERROR: 'Ошибка сохранения в localStorage',
    
    // Общие
    UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету'
};

const WARNING_MESSAGES = {
    // Дубликаты
    DUPLICATES_REMOVED: (count) => `Удалено дубликатов: ${count}`,
    
    // Перестановки
    PERMUTATIONS_WARNING: (count) => `Будет создано ${count} перестановок. Это может замедлить работу.`,
    PERMUTATIONS_TOO_MANY: 'Слишком много перестановок (более 720). Рекомендуем уменьшить количество триггеров.',
    
    // Оптимизация
    NO_OPTIMIZATIONS: 'Оптимизации не применены - выберите хотя бы один тип',
    
    // История
    HISTORY_CLEARED: 'История очищена',
    OLD_ENTRIES_REMOVED: (count) => `Удалено устаревших записей: ${count}`
};

const SUCCESS_MESSAGES = {
    // Копирование
    COPIED_TO_CLIPBOARD: 'Скопировано в буфер обмена',
    
    // Экспорт
    EXPORTED_TXT: 'Файл TXT успешно скачан',
    EXPORTED_JSON: 'Файл JSON успешно скачан',
    EXPORTED_CSV: 'Файл CSV успешно скачан',
    
    // Конвертация
    CONVERSION_SUCCESS: 'Regex успешно создан',
    
    // История
    LOADED_FROM_HISTORY: 'Загружено из истории',
    HISTORY_LOADED: 'Конвертация загружена из истории',
    HISTORY_DELETED: 'Запись удалена из истории',
    HISTORY_CLEARED: 'История очищена',
    
    // Визуализация
    VISUALIZATION_SUCCESS: 'Диаграмма успешно создана',
    
    // Тестирование
    TEST_COMPLETE: (count) => `Найдено совпадений: ${count}`,
    
    // Обратная конвертация
    REVERSE_SUCCESS: (count) => `Извлечено триггеров: ${count}`,
    
    // Сброс
    RESET_SUCCESS: 'Все данные очищены'
};

const INFO_MESSAGES = {
    LOADING: 'Загрузка...',
    PROCESSING: 'Обработка...',
    PLEASE_WAIT: 'Пожалуйста, подождите',
    HISTORY_EMPTY: 'История пуста'
};

/* ============================================
   TOAST-УВЕДОМЛЕНИЯ
   ============================================ */

let toastCounter = 0;

/**
 * Показать toast-уведомление
 * @param {string} type - Тип: 'success', 'error', 'warning', 'info'
 * @param {string} message - Текст сообщения
 * @param {number} duration - Длительность в мс (по умолчанию 4000)
 */
function showToast(type, message, duration = 4000) {
    // Удаляем предыдущий toast если есть
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Создаем новый toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${++toastCounter}`;

    // Иконки для разных типов
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="toast-message">${escapeHTML(message)}</span>
        <button class="toast-close" onclick="closeToast('${toast.id}')">×</button>
    `;

    document.body.appendChild(toast);

    // Автозакрытие
    const timeoutId = setTimeout(() => {
        closeToast(toast.id);
    }, duration);

    // Пауза при наведении
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });

    toast.addEventListener('mouseleave', () => {
        setTimeout(() => {
            closeToast(toast.id);
        }, 1000);
    });
}

// ============================================
// ДОБАВЛЕНО: Функция showMessage()
// ============================================

/**
 * Показать сообщение через Toast (обертка над showToast)
 * @param {string} type - Тип (success, error, warning, info)
 * @param {string} messageKey - Ключ из констант (SUCCESS_MESSAGES, ERROR_MESSAGES, etc.)
 * @param {...any} args - Аргументы для подстановки в плейсхолдеры {0}, {1}, etc.
 */
function showMessage(type, messageKey, ...args) {
    let message = '';
    
    // Поиск сообщения в константах
    if (type === 'success' && SUCCESS_MESSAGES[messageKey]) {
        message = SUCCESS_MESSAGES[messageKey];
    } else if (type === 'error' && ERROR_MESSAGES[messageKey]) {
        message = ERROR_MESSAGES[messageKey];
    } else if (type === 'warning' && WARNING_MESSAGES[messageKey]) {
        message = WARNING_MESSAGES[messageKey];
    } else if (type === 'info' && INFO_MESSAGES[messageKey]) {
        message = INFO_MESSAGES[messageKey];
    } else {
        // Fallback: использовать ключ как есть
        message = messageKey;
    }
    
    // Подстановка аргументов (если есть плейсхолдеры {0}, {1})
    if (args.length > 0) {
        message = message.replace(/\{(\d+)\}/g, (match, index) => {
            return args[index] !== undefined ? args[index] : match;
        });
    }
    
    showToast(type, message);
}

// ============================================
// ИСПРАВЛЕНО: Строка ~75
// ============================================

function hideToast(toastElement) {
    if (!toastElement) return;
    
    // ИСПРАВЛЕНО: slideOut → toastSlideOut
    toastElement.style.animation = 'toastSlideOut 0.3s ease forwards';
    
    setTimeout(() => {
        if (toastElement.parentNode) {
            toastElement.parentNode.removeChild(toastElement);
        }
    }, 300);
}


/* ============================================
   INLINE ОШИБКИ
   ============================================ */

/**
 * Показать inline ошибку под полем
 * @param {string} fieldId - ID поля ввода
 * @param {string|Array} messages - Сообщение или массив сообщений
 */
function showInlineError(fieldId, messages) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    clearInlineError(fieldId);

    field.classList.add('input-error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = `${fieldId}-error`;

    if (Array.isArray(messages)) {
        errorDiv.innerHTML = messages.map(msg => escapeHTML(msg)).join('<br>');
    } else {
        errorDiv.textContent = messages;
    }

    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Очистить inline ошибку
 * @param {string} fieldId - ID поля ввода
 */
function clearInlineError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('input-error');

    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Очистить все inline ошибки
 */
function clearAllInlineErrors() {
    document.querySelectorAll('.input-error').forEach(field => {
        field.classList.remove('input-error');
    });

    document.querySelectorAll('.error-message').forEach(msg => {
        msg.remove();
    });
}

/* ============================================
   МОДАЛЬНЫЕ ОКНА
   ============================================ */

/**
 * Показать модальное окно
 * @param {string} modalId - ID модального окна
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.onclick = () => closeModal(modalId);
    });

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal(modalId);
        }
    };

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
            document.removeEventListener('keydown', handleEscape);
        }
    };

    document.addEventListener('keydown', handleEscape);
}

/**
 * Закрыть модальное окно
 * @param {string} modalId - ID модального окна
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'none';
    document.body.style.overflow = '';
}

/* ============================================
   ДИАЛОГИ ПОДТВЕРЖДЕНИЯ
   ============================================ */

/**
 * Показать диалог подтверждения
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} onCancel - Callback при отмене
 */
function confirmAction(title, message, onConfirm, onCancel) {
    const modalId = 'confirmModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2 class="modal-title" id="confirmTitle"></h2>
                </div>
                <div class="modal-body">
                    <p id="confirmMessage"></p>
                </div>
                <div class="modal-footer" style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn btn-secondary" id="confirmCancel">Отмена</button>
                    <button class="btn btn-danger" id="confirmOk">Подтвердить</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;

    const closeConfirm = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    document.getElementById('confirmOk').onclick = () => {
        closeConfirm();
        if (onConfirm) onConfirm();
    };

    document.getElementById('confirmCancel').onclick = () => {
        closeConfirm();
        if (onCancel) onCancel();
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeConfirm();
            if (onCancel) onCancel();
        }
    };

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/* ============================================
   ЛОГИРОВАНИЕ ОШИБОК
   ============================================ */

/**
 * Логирование ошибки в консоль
 * @param {string} context - Контекст ошибки
 * @param {Error} error - Объект ошибки
 */
function logError(context, error) {
    console.error(`[${context}]`, error);
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

window.showToast = showToast;
window.closeToast = closeToast;
window.showInlineError = showInlineError;
window.clearInlineError = clearInlineError;
window.clearAllInlineErrors = clearAllInlineErrors;
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
window.logError = logError;

window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.WARNING_MESSAGES = WARNING_MESSAGES;
window.INFO_MESSAGES = INFO_MESSAGES;

console.log('✓ Модуль errors.js загружен');
