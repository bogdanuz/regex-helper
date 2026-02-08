/* ============================================
   REGEXHELPER - ERROR HANDLING & NOTIFICATIONS
   Централизованная система обработки ошибок
   ============================================ */

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
    PLEASE_WAIT: 'Пожалуйста, подождите'
};

/* ============================================
   TOAST-УВЕДОМЛЕНИЯ
   ============================================ */

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
    
    // Создаем toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Иконки для разных типов
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    // Структура toast
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="toast-message">${escapeHTML(message)}</span>
        <button class="toast-close">&times;</button>
    `;
    
    document.body.appendChild(toast);
    
    // Кнопка закрытия
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Автоматическое скрытие
    const timeoutId = setTimeout(() => {
        hideToast(toast);
    }, duration);
    
    // Пауза при наведении
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    
    toast.addEventListener('mouseleave', () => {
        setTimeout(() => hideToast(toast), 1000);
    });
}

/**
 * Скрыть toast с анимацией
 * @param {HTMLElement} toast - Элемент toast
 */
function hideToast(toast) {
    if (!toast) return;
    
    toast.classList.add('toast-hiding');
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/* ============================================
   INLINE ОШИБКИ (под полями ввода)
   ============================================ */

/**
 * Показать inline ошибку под полем
 * @param {string} elementId - ID элемента (input/textarea)
 * @param {string} message - Текст ошибки
 */
function showInlineError(elementId, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Удаляем предыдущую ошибку если есть
    clearInlineError(elementId);
    
    // Добавляем класс ошибки к полю
    element.classList.add('error');
    
    // Создаем элемент ошибки
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = `${elementId}-error`;
    errorDiv.textContent = message;
    
    // Вставляем после элемента
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
    
    // Анимация shake
    element.classList.add('shake');
    setTimeout(() => {
        element.classList.remove('shake');
    }, 300);
}

/**
 * Очистить inline ошибку
 * @param {string} elementId - ID элемента
 */
function clearInlineError(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Убираем класс ошибки
    element.classList.remove('error');
    
    // Удаляем элемент ошибки
    const errorDiv = document.getElementById(`${elementId}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Очистить все inline ошибки на странице
 */
function clearAllInlineErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

/* ============================================
   МОДАЛЬНЫЕ ОКНА
   ============================================ */

/**
 * Показать модальное окно
 * @param {string} modalId - ID модалки (например 'helpModal')
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    
    // Закрытие по клику на overlay
    const overlay = modal;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(modalId);
        }
    });
    
    // Закрытие по Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/**
 * Закрыть модальное окно
 * @param {string} modalId - ID модалки
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Восстанавливаем скролл
}

/**
 * Закрыть все открытые модальные окна
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = '';
}

/* ============================================
   ДИАЛОГИ ПОДТВЕРЖДЕНИЯ
   ============================================ */

/**
 * Показать диалог подтверждения
 * @param {string} message - Текст вопроса
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} onCancel - Callback при отмене (опционально)
 */
function confirmAction(message, onConfirm, onCancel = null) {
    // Проверяем есть ли уже confirm-диалог
    let confirmModal = document.getElementById('confirmModal');
    
    // Если нет - создаем
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirmModal';
        confirmModal.className = 'modal-overlay';
        confirmModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Подтверждение</h3>
                </div>
                <div class="modal-body">
                    <div class="confirm-dialog">
                        <div class="confirm-dialog-icon warning">⚠️</div>
                        <p class="confirm-dialog-message" id="confirmMessage"></p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="confirmCancelBtn">Отмена</button>
                    <button class="btn-danger" id="confirmOkBtn">Подтвердить</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
    }
    
    // Устанавливаем текст
    document.getElementById('confirmMessage').textContent = message;
    
    // Показываем модалку
    confirmModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Обработчики кнопок
    const okBtn = document.getElementById('confirmOkBtn');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    
    // Удаляем старые обработчики
    const newOkBtn = okBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Новые обработчики
    newOkBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        document.body.style.overflow = '';
        if (onConfirm) onConfirm();
    });
    
    newCancelBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        document.body.style.overflow = '';
        if (onCancel) onCancel();
    });
    
    // Закрытие по Escape = отмена
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            confirmModal.style.display = 'none';
            document.body.style.overflow = '';
            if (onCancel) onCancel();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

/* ============================================
   СПИННЕРЫ ЗАГРУЗКИ
   ============================================ */

/**
 * Показать полноэкранный спиннер
 */
function showSpinner() {
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

/**
 * Скрыть полноэкранный спиннер
 */
function hideSpinner() {
    const spinner = document.getElementById('spinnerOverlay');
    if (spinner) {
        spinner.style.display = 'none';
    }
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
    console.error(`[RegexHelper Error] ${context}:`, error);
    
    // В будущем можно добавить отправку на сервер аналитики
    // sendErrorToAnalytics(context, error);
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * Показать сообщение из пула
 * @param {string} type - Тип toast
 * @param {string} key - Ключ сообщения
 * @param {*} params - Параметры для функции-сообщения
 */
function showMessage(type, key, params = null) {
    let message;
    
    if (type === 'error') {
        message = ERROR_MESSAGES[key];
    } else if (type === 'warning') {
        message = WARNING_MESSAGES[key];
    } else if (type === 'success') {
        message = SUCCESS_MESSAGES[key];
    } else if (type === 'info') {
        message = INFO_MESSAGES[key];
    }
    
    // Если сообщение - функция, вызываем с параметрами
    if (typeof message === 'function') {
        message = message(params);
    }
    
    if (message) {
        showToast(type, message);
    }
}

// Экспортируем функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Пулы сообщений
        ERROR_MESSAGES,
        WARNING_MESSAGES,
        SUCCESS_MESSAGES,
        INFO_MESSAGES,
        
        // Toast
        showToast,
        hideToast,
        
        // Inline ошибки
        showInlineError,
        clearInlineError,
        clearAllInlineErrors,
        
        // Модалки
        showModal,
        closeModal,
        closeAllModals,
        
        // Подтверждения
        confirmAction,
        
        // Спиннеры
        showSpinner,
        hideSpinner,
        
        // Логирование
        logError,
        
        // Вспомогательные
        showMessage
    };
}
