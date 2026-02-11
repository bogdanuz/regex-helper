/* ============================================
   REGEXHELPER - ERRORS
   Обработка ошибок и валидация
   
   ВЕРСИЯ: 3.0 FINAL
   ДАТА: 11.02.2026
   ИЗМЕНЕНИЯ v3.0:
   - Обновлены сообщения для новых функций (режимы связи, общий параметр)
   - Добавлены сообщения для модальных окон помощи
   - Улучшена функция showToast с новыми эмодзи-иконками
   - Добавлены сообщения для аккордеонов панелей
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
    EMPTY_TRIGGERS: 'Введите хотя бы один триггер для конвертации',
    TRIGGERS_LIMIT_HARD: 'Превышен лимит триггеров (максимум 200)',
    TRIGGERS_LIMIT_SOFT: 'Приближение к лимиту (рекомендуется использовать до 150 триггеров)',
    TRIGGER_TOO_SHORT: 'Триггер слишком короткий (минимум 1 символ)',
    TRIGGER_TOO_LONG: 'Триггер слишком длинный (максимум 100 символов)',
    INVALID_CHARACTERS: 'Триггер содержит недопустимые символы',
    
    // Ошибки regex
    REGEX_TOO_LONG: 'Regex слишком длинный (максимум 10000 символов)',
    REGEX_LENGTH_LIMIT: 'Regex слишком длинный (максимум 10000 символов)',
    REGEX_INVALID: 'Неверный синтаксис regex. Проверьте правильность выражения.',
    REGEX_EMPTY: 'Regex пустой. Выполните конвертацию триггеров.',
    
    // Ошибки связанных триггеров (ОБНОВЛЕНО v3.0)
    LINKED_TRIGGERS_EMPTY: 'Все поля связанных триггеров должны быть заполнены',
    LINKED_MIN_TRIGGERS: 'Минимум 2 триггера в группе',
    LINKED_MIN_SUBGROUPS: 'Минимум 2 подгруппы в группе для создания связи',
    LINKED_DUPLICATES: 'В группе обнаружены одинаковые триггеры',
    LINKED_DISTANCE_INVALID: 'Некорректное значение расстояния',
    LINKED_GROUP_EMPTY: 'Группа связанных триггеров пуста',
    LINKED_SUBGROUP_EMPTY: 'Подгруппа не может быть пустой',
    LINKED_MAX_GROUPS: 'Максимум 15 групп связанных триггеров',
    LINKED_MAX_SUBGROUPS: 'Максимум 15 подгрупп в одной группе',
    
    // Ошибки режимов связи (НОВОЕ v3.0)
    COMMON_PARAM_NOT_SELECTED: 'Выберите общий параметр связи',
    CUSTOM_PARAM_EMPTY: 'Введите пользовательский параметр связи',
    CUSTOM_PARAM_INVALID: 'Неверный формат пользовательского параметра',
    
    // Ошибки валидации
    VALIDATION_FAILED: 'Проверка не пройдена',
    FIELD_REQUIRED: 'Это поле обязательно для заполнения',
    
    // Ошибки буфера обмена
    CLIPBOARD_NOT_SUPPORTED: 'Копирование в буфер обмена не поддерживается вашим браузером',
    CLIPBOARD_ERROR: 'Не удалось скопировать в буфер обмена',
    
    // Ошибки экспорта
    EXPORT_FAILED: 'Не удалось экспортировать данные',
    EXPORT_NO_DATA: 'Нет данных для экспорта',
    EXPORT_FORMAT_ERROR: 'Ошибка формата экспорта',
    
    // Ошибки истории
    HISTORY_LOAD_FAILED: 'Не удалось загрузить историю',
    HISTORY_SAVE_FAILED: 'Не удалось сохранить в историю',
    HISTORY_DELETE_FAILED: 'Не удалось удалить элемент из истории',
    
    // Ошибки конвертации
    CONVERSION_FAILED: 'Не удалось выполнить конвертацию. Проверьте триггеры.',
    
    // Ошибки оптимизаций (НОВОЕ v3.0)
    OPTIMIZATION_ERROR: 'Ошибка применения оптимизации',
    DECLENSION_ERROR: 'Не удалось просклонять слово (только русские существительные)',
    
    // Ошибки настроек (НОВОЕ v3.0)
    SETTINGS_LOAD_FAILED: 'Не удалось загрузить настройки',
    SETTINGS_SAVE_FAILED: 'Не удалось сохранить настройки'
};

const WARNING_MESSAGES = {
    NO_OPTIMIZATIONS: 'Не выбрана ни одна оптимизация. Regex будет создан без оптимизаций.',
    DUPLICATES_FOUND: 'Найдены дубликаты триггеров. Они будут удалены автоматически.',
    DUPLICATES_REMOVED: 'Удалено дубликатов: {0}',
    REGEX_LENGTH_WARNING: 'Regex приближается к максимальной длине (более 8000 символов)',
    PERMUTATIONS_TOO_MANY: 'Большое количество перестановок может замедлить работу приложения',
    TRIGGERS_LIMIT_SOFT: 'Приближение к лимиту (рекомендуется использовать до 150 триггеров)',
    
    // Новые предупреждения v3.0
    LINKED_GROUPS_MANY: 'Большое количество групп может замедлить конвертацию',
    ANY_ORDER_WARNING: 'Режим "Любая последовательность" создает много вариантов',
    COMMON_PARAM_LARGE: 'Большое расстояние может снизить точность поиска',
    
    // Предупреждения об оптимизациях
    TYPE1_PARTIAL: 'Оптимизация "Вариации" применена частично (не все буквы имеют латинские аналоги)',
    TYPE4_NOT_RUSSIAN: 'Оптимизация "Склонения" работает только для русских существительных',
    TYPE5_NO_DOUBLES: 'Оптимизация "Опциональный символ" не применена (нет удвоенных букв)'
};

const SUCCESS_MESSAGES = {
    CONVERSION_SUCCESS: 'Regex успешно создан!',
    CONVERSION_SUCCESS_WITH_STATS: 'Regex успешно создан! Длина: {0} символов',
    COPIED_TO_CLIPBOARD: '✓ Regex скопирован в буфер обмена',
    EXPORTED_SUCCESS: '✓ Данные успешно экспортированы',
    EXPORTED_TXT: '✓ Экспорт в TXT завершен',
    EXPORTED_JSON: '✓ Экспорт в JSON завершен',
    EXPORTED_CSV: '✓ Экспорт в CSV завершен',
    HISTORY_CLEARED: '✓ История очищена',
    HISTORY_ITEM_DELETED: '✓ Элемент удален из истории',
    SETTINGS_SAVED: '✓ Настройки сохранены',
    SETTINGS_RESET: '✓ Настройки сброшены',
    
    // Новые успешные сообщения v3.0
    GROUP_ADDED: '✓ Группа добавлена',
    SUBGROUP_ADDED: '✓ Подгруппа добавлена',
    GROUP_DELETED: '✓ Группа удалена',
    SUBGROUP_DELETED: '✓ Подгруппа удалена',
    TRIGGER_ADDED: '✓ Триггер добавлен',
    OPTIMIZATIONS_APPLIED: '✓ Оптимизации применены'
};

const INFO_MESSAGES = {
    // Информационные сообщения v3.0
    PANEL_COLLAPSED: 'Панель свернута',
    PANEL_EXPANDED: 'Панель развернута',
    HELP_OPENED: 'Открыта справка',
    LOADING: 'Загрузка...',
    PROCESSING: 'Обработка...',
    
    // Информация о режимах
    MODE_INDIVIDUAL: 'Режим: Индивидуальные параметры',
    MODE_COMMON: 'Режим: Общий параметр',
    MODE_ALTERNATION: 'Режим: Альтернация'
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
    field.classList.add('input-error', 'error');
    
    // Создаем элемент ошибки
    const errorEl = document.createElement('div');
    errorEl.className = 'inline-error error-message';
    errorEl.id = `${fieldId}-error`;
    errorEl.textContent = message;
    errorEl.style.cssText = `
        color: #F44336;
        font-size: 13px;
        margin-top: 6px;
        padding: 8px 12px;
        background: #FFEBEE;
        border-left: 3px solid #F44336;
        border-radius: 4px;
        animation: slideDown 0.3s ease;
        display: flex;
        align-items: center;
        gap: 6px;
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
        field.classList.remove('input-error', 'error');
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
    errorFields.forEach(field => field.classList.remove('input-error', 'error'));
}

/* ============================================
   TOAST УВЕДОМЛЕНИЯ (ОБНОВЛЕНО v3.0)
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
            top: 80px;
            right: 20px;
            z-index: 15000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
        
        // Добавляем CSS анимации (если их еще нет)
        addToastAnimations();
    }
    
    // Цвета и иконки для разных типов (ОБНОВЛЕНО v3.0)
    const colors = {
        success: { bg: '#4CAF50', icon: '✓', emoji: '✅' },
        error: { bg: '#F44336', icon: '✕', emoji: '❌' },
        warning: { bg: '#FF9800', icon: '⚠', emoji: '⚠️' },
        info: { bg: '#24a7ef', icon: 'ℹ', emoji: 'ℹ️' }
    };
    
    const color = colors[type] || colors.info;
    
    // Создаем toast элемент
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: ${color.bg};
        color: white;
        padding: 14px 20px;
        border-radius: 8px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        font-size: 14px;
        pointer-events: auto;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    
    toast.innerHTML = `
        <span style="font-size: 20px; font-weight: bold; flex-shrink: 0;">${color.emoji}</span>
        <span style="flex: 1; line-height: 1.4;">${escapeHTML(message)}</span>
        <span style="font-size: 18px; opacity: 0.7; flex-shrink: 0;">×</span>
    `;
    
    // Hover эффект
    toast.onmouseenter = () => {
        toast.style.transform = 'translateX(-5px)';
        toast.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    };
    
    toast.onmouseleave = () => {
        toast.style.transform = 'translateX(0)';
        toast.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    };
    
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
        
        /* Адаптивность для toast */
        @media (max-width: 768px) {
            #toastContainer {
                top: 70px !important;
                right: 12px !important;
                left: 12px !important;
            }
            
            .toast {
                min-width: auto !important;
                max-width: none !important;
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
    } else if (type === 'info') {
        message = INFO_MESSAGES[messageKey];
    }
    
    if (!message) {
        console.error('[Errors] Сообщение не найдено:', messageKey);
        return;
    }
    
    // Подстановка параметров (поддержка нескольких параметров)
    if (params !== null) {
        if (Array.isArray(params)) {
            params.forEach((param, index) => {
                message = message.replace(`{${index}}`, param);
            });
        } else {
            message = message.replace('{0}', params);
        }
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
 * ОБНОВЛЕНО v3.0: Улучшена логика и обработка
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
        if (window.confirm(`${title}\n\n${message}`)) {
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
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    // Удаляем старые обработчики (чтобы избежать дублирования)
    const newYesBtn = yesBtn.cloneNode(true);
    const newNoBtn = noBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
    noBtn.parentNode.replaceChild(newNoBtn, noBtn);
    
    // Обработчик кнопки "Да"
    newYesBtn.onclick = () => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };
    
    // Обработчик кнопки "Отмена"
    newNoBtn.onclick = () => {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };
    
    // Закрытие по клику вне модалки
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };
    
    // Закрытие по ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            if (typeof onCancel === 'function') {
                onCancel();
            }
            document.removeEventListener('keydown', escHandler);
        }
    };
    
    document.addEventListener('keydown', escHandler);
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
    
    modal.style.display = 'flex';
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    console.log('[Modal] Открыто:', modalId);
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
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    
    console.log('[Modal] Закрыто:', modalId);
}

/* ============================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ============================================ */

/**
 * Экранирование HTML для безопасного вывода
 * @param {string} text - Текст для экранирования
 * @returns {string} - Экранированный текст
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

/**
 * Логирование предупреждения
 * @param {string} context - Контекст
 * @param {string} message - Сообщение
 */
function logWarning(context, message) {
    console.warn(`[Warning] ${context}:`, message);
}

/**
 * Логирование информации
 * @param {string} context - Контекст
 * @param {string} message - Сообщение
 */
function logInfo(context, message) {
    console.log(`[Info] ${context}:`, message);
}

/* ============================================
   ЭКСПОРТ
   ============================================ */

// Делаем функции глобальными
window.showModal = showModal;
window.closeModal = closeModal;
window.confirmAction = confirmAction;
window.showToast = showToast;
window.showMessage = showMessage;
window.showInlineError = showInlineError;
window.clearInlineError = clearInlineError;
window.clearAllInlineErrors = clearAllInlineErrors;
window.logError = logError;
window.logWarning = logWarning;
window.logInfo = logInfo;
window.escapeHTML = escapeHTML;

// Экспорт констант
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.WARNING_MESSAGES = WARNING_MESSAGES;
window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
window.INFO_MESSAGES = INFO_MESSAGES;

console.log('✅ Модуль errors.js загружен (v3.0 FINAL)');
