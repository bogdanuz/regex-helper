/* ============================================
   REGEXHELPER - ERRORS
   Обработка ошибок и валидация
   
   ВЕРСИЯ: 2.0
   ДАТА: 10.02.2026
   ИЗМЕНЕНИЯ:
   - Добавлены недостающие сообщения об ошибках
   - Улучшена функция confirmAction() (fallback на window.confirm)
   - Добавлены CSS анимации для toast
   ============================================ */

/* ============================================
   КОНСТАНТЫ СООБЩЕНИЙ
   ============================================ */

const ERROR_MESSAGES = {
    // Общие ошибки
    UNKNOWN_ERROR: 'Произошла неизвестная ошибка. Попробуйте перезагрузить страницу.',
    BROWSER_NOT_SUPPORTED: 'Ваш браузер не поддерживается. Используйте современный браузер (Chrome, Firefox, Edge).',
    
    // Ошибки триггеров
    NO_TRIGGERS: 'Введите хотя бы один триггер',
    EMPTY_TRIGGERS: 'Введите хотя бы один триггер',
    TRIGGERS_LIMIT_HARD: 'Превышен лимит триггеров (максимум 200)',
    TRIGGERS_LIMIT_SOFT: 'Приближение к лимиту (рекомендуется использовать до 150 триггеров)',
    TRIGGER_TOO_SHORT: 'Триггер слишком короткий (минимум 1 символ)',
    TRIGGER_TOO_LONG: 'Триггер слишком длинный (максимум 100 символов)',
    INVALID_CHARACTERS: 'Триггер содержит недопустимые символы',
    
    // Ошибки regex
    REGEX_TOO_LONG: 'Regex слишком длинный (максимум 10000 символов)',
    REGEX_LENGTH_LIMIT: 'Regex слишком длинный (максимум 10000 символов)',
    REGEX_INVALID: 'Неверный синтаксис regex',
    
    // Ошибки связанных триггеров
    LINKED_TRIGGERS_EMPTY: 'Оба поля связанных триггеров должны быть заполнены',
    LINKED_MIN_TRIGGERS: 'Минимум 2 триггера в группе',
    LINKED_DUPLICATES: 'В группе обнаружены одинаковые триггеры',
    LINKED_DISTANCE_INVALID: 'Некорректное значение расстояния',
    
    // Ошибки валидации
    VALIDATION_FAILED: 'Проверка не пройдена',
    
    // Ошибки буфера обмена
    CLIPBOARD_NOT_SUPPORTED: 'Копирование в буфер обмена не поддерживается вашим браузером',
    
    // Ошибки экспорта
    EXPORT_FAILED: 'Не удалось экспортировать данные',
    EXPORT_NO_DATA: 'Нет данных для экспорта',
    
    // Ошибки истории
    HISTORY_LOAD_FAILED: 'Не удалось загрузить историю',
    
    // Ошибки конвертации
    CONVERSION_FAILED: 'Не удалось выполнить конвертацию'
};

const WARNING_MESSAGES = {
    NO_OPTIMIZATIONS: 'Не выбрана ни одна оптимизация. Regex будет создан без оптимизаций.',
    DUPLICATES_FOUND: 'Найдены дубликаты триггеров. Они будут удалены автоматически.',
    DUPLICATES_REMOVED: 'Удалено дубликатов: {0}',
    REGEX_LENGTH_WARNING: 'Regex приближается к максимальной длине',
    PERMUTATIONS_TOO_MANY: 'Большое количество перестановок может замедлить работу приложения',
    TRIGGERS_LIMIT_SOFT: 'Приближение к лимиту (рекомендуется использовать до 150 триггеров)'
};

const SUCCESS_MESSAGES = {
    CONVERSION_SUCCESS: 'Regex успешно создан!',
    COPIED_TO_CLIPBOARD: 'Regex скопирован в буфер обмена',
    EXPORTED_SUCCESS: 'Данные успешно экспортированы',
    HISTORY_CLEARED: 'История очищена',
    SETTINGS_SAVED: 'Настройки сохранены',
    SETTINGS_RESET: 'Настройки сброшены'
};

/* ============================================
   INLINE ОШИБКИ
   ============================================ */

/**
 * Показать inline ошибку под полем
 * @param {string} fieldId - ID поля
 * @param {string} message - Текст ошибки
 */
function showInlineError(fieldId, message) {
    const field = document.getElementById(fieldId);
    
    if (!field) {
        console.error('[Errors] Поле не найдено:', fieldId);
        return;
    }
    
    // Удаляем старую ошибку если есть
    clearInlineError(fieldId);
    
    // Добавляем класс ошибки к полю
    field.classList.add('input-error');
    
    // Создаем элемент ошибки
    const errorEl = document.createElement('div');
    errorEl.className = 'inline-error';
    errorEl.id = `${fieldId}-error`;
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: #F44336;
        font-size: 13px;
        margin-top: 5px;
        padding: 8px 12px;
        background: #FFEBEE;
        border-left: 3px solid #F44336;
        border-radius: 4px;
        animation: slideDown 0.3s ease;
    `;
    
    // Вставляем после поля
    field.parentElement.insertBefore(errorEl, field.nextSibling);
    
    console.log('[Errors] Inline ошибка показана:', fieldId, message);
}

/**
 * Очистить inline ошибку
 * @param {string} fieldId - ID поля
 */
function clearInlineError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);
    
    if (field) {
        field.classList.remove('input-error');
    }
    
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Очистить все inline ошибки
 */
function clearAllInlineErrors() {
    const errorEls = document.querySelectorAll('.inline-error');
    const errorFields = document.querySelectorAll('.input-error');
    
    errorEls.forEach(el => el.remove());
    errorFields.forEach(field => field.classList.remove('input-error'));
}

/* ============================================
   TOAST УВЕДОМЛЕНИЯ
   ============================================ */

/**
 * Показать toast уведомление
 * @param {string} type - Тип: 'success', 'error', 'warning', 'info'
 * @param {string} message - Текст сообщения
 * @param {number} duration - Длительность показа (мс)
 */
function showToast(type, message, duration = 4000) {
    // Создаем контейнер для toast если его нет
    let container = document.getElementById('toastContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        
        // Добавляем CSS анимации (если их еще нет)
        addToastAnimations();
    }
    
    // Цвета для разных типов
    const colors = {
        success: { bg: '#4CAF50', icon: '✓' },
        error: { bg: '#F44336', icon: '✕' },
        warning: { bg: '#FF9800', icon: '⚠' },
        info: { bg: '#2196F3', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    // Создаем toast элемент
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        background: ${color.bg};
        color: white;
        padding: 14px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
        max-width: 500px;
        font-size: 14px;
        pointer-events: auto;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 18px; font-weight: bold;">${color.icon}</span>
        <span style="flex: 1;">${escapeHTML(message)}</span>
    `;
    
    // Клик для закрытия
    toast.onclick = () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    };
    
    container.appendChild(toast);
    
    // Автоматическое удаление
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
    
    console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
}

/**
 * Добавить CSS анимации для toast (если их еще нет)
 */
function addToastAnimations() {
    // Проверяем есть ли уже стили
    if (document.getElementById('toastAnimationsStyle')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'toastAnimationsStyle';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes slideDown {
            from {
                transform: translateY(-10px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Показать сообщение по ключу
 * @param {string} type - Тип: 'success', 'error', 'warning', 'info'
 * @param {string} messageKey - Ключ сообщения
 * @param {any} params - Параметры для подстановки
 */
function showMessage(type, messageKey, params = null) {
    let message = null;
    
    if (type === 'error') {
        message = ERROR_MESSAGES[messageKey];
    } else if (type === 'warning') {
        message = WARNING_MESSAGES[messageKey];
    } else if (type === 'success') {
        message = SUCCESS_MESSAGES[messageKey];
    }
    
    if (!message) {
        console.error('[Errors] Сообщение не найдено:', messageKey);
        return;
    }
    
    // Подстановка параметров
    if (params !== null) {
        message = message.replace('{0}', params);
    }
    
    showToast(type, message);
}

/* ============================================
   МОДАЛЬНЫЕ ОКНА ПОДТВЕРЖДЕНИЯ
   ============================================ */

/**
 * Универсальная функция подтверждения действия
 * 
 * ИСПРАВЛЕНО v2.0: Добавлен fallback на window.confirm()
 * 
 * @param {string} title - Заголовок
 * @param {string} message - Сообщение
 * @param {Function} onConfirm - Callback при подтверждении
 * @param {Function} onCancel - Callback при отмене (опционально)
 */
function confirmAction(title, message, onConfirm, onCancel) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmModalTitle');
    const textEl = document.getElementById('confirmModalText');
    const yesBtn = document.getElementById('confirmModalYes');
    const noBtn = document.getElementById('confirmModalNo');
    
    // ИСПРАВЛЕНИЕ: проверяем наличие всех элементов
    if (!modal || !titleEl || !textEl || !yesBtn || !noBtn) {
        console.warn('[confirmAction] Модальное окно не найдено, используем window.confirm()');
        
        // Fallback на стандартный confirm
        if (window.confirm(message)) {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
        return;
    }
    
    // Устанавливаем текст
    titleEl.textContent = title || 'Подтверждение';
    textEl.textContent = message || 'Вы уверены?';
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Удаляем старые обработчики (чтобы избежать дублирования)
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    
    // Обработчик кнопки "Да"
    newYesBtn.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    // Обработчик кнопки "Отмена"
    newNoBtn.onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // Закрытие по клику вне модалки
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };
}

/* ============================================
   МОДАЛЬНЫЕ ОКНА (ОБЩИЕ)
   ============================================ */

/**
 * Показать модальное окно
 * @param {string} modalId - ID модального окна
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (!modal) {
        console.error('[Errors] Модальное окно не найдено:', modalId);
        return;
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

/**
 * Закрыть модальное окно
 * @param {string} modalId - ID модального окна
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (!modal) {
        console.error('[Errors] Модальное окно не найдено:', modalId);
        return;
    }
    
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

/* ============================================
   ЛОГИРОВАНИЕ ОШИБОК
   ============================================ */

/**
 * Логирование ошибки с контекстом
 * @param {string} context - Контекст ошибки
 * @param {Error} error - Объект ошибки
 */
function logError(context, error) {
    console.error(`[Error] ${context}:`, error);
    
    // Можно добавить отправку на сервер логов
    // sendErrorToServer(context, error);
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

// Делаем функции глобальными
window.showModal = showModal;
window.closeModal = closeModal;

console.log('✓ Модуль errors.js загружен (v2.0)');
