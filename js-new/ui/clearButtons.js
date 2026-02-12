/**
 * RegexHelper v4.0 - Clear Buttons
 * 
 * Модуль для управления кнопками очистки (❌) в полях ввода.
 * Добавляет inline-кнопки для быстрой очистки textarea и input.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Инициализирует кнопки очистки для всех полей с атрибутом data-clearable
 * @returns {void}
 * @example
 * initClearButtons(); // вызывается в main.js
 */
export function initClearButtons() {
  // Находим все поля с data-clearable
  const clearableFields = document.querySelectorAll('[data-clearable="true"]');
  
  clearableFields.forEach(field => {
    addClearButtonToField(field);
  });

  // Также добавляем кнопки к textarea в подгруппах (динамически)
  observeTextareaAdditions();

  console.log('[ClearButtons] Initialized');
}

/**
 * Добавляет кнопку очистки к конкретному полю ввода
 * @param {HTMLElement|string} fieldOrId - DOM-элемент поля или ID
 * @returns {void}
 * @example
 * addClearButtonToField('simpleTriggersInput');
 * addClearButtonToField(document.getElementById('input'));
 */
export function addClearButtonToField(fieldOrId) {
  let field;
  
  if (typeof fieldOrId === 'string') {
    field = document.getElementById(fieldOrId);
  } else {
    field = fieldOrId;
  }

  if (!field) {
    console.warn('addClearButtonToField: field not found', fieldOrId);
    return;
  }

  // Проверяем, нет ли уже кнопки
  if (field.dataset.hasClearButton === 'true') return;

  // Создаем wrapper, если его нет
  let wrapper = field.parentElement;
  if (!wrapper.classList.contains('input-with-clear')) {
    wrapper = document.createElement('div');
    wrapper.className = 'input-with-clear';
    field.parentNode.insertBefore(wrapper, field);
    wrapper.appendChild(field);
  }

  // Создаем кнопку очистки
  const clearBtn = document.createElement('button');
  clearBtn.className = 'btn-clear-inline';
  clearBtn.innerHTML = '×';
  clearBtn.type = 'button';
  clearBtn.title = 'Очистить';
  clearBtn.setAttribute('aria-label', 'Очистить поле');

  // Обработчик клика
  clearBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearField(field);
  });

  // Добавляем кнопку в wrapper
  wrapper.appendChild(clearBtn);

  // Помечаем поле
  field.dataset.hasClearButton = 'true';

  // Показываем/скрываем кнопку в зависимости от содержимого
  updateClearButtonVisibility(field, clearBtn);

  // Следим за изменениями в поле
  field.addEventListener('input', () => {
    updateClearButtonVisibility(field, clearBtn);
  });
}

/**
 * Очищает поле ввода и вызывает событие input
 * @param {HTMLElement|string} fieldOrId - DOM-элемент поля или ID
 * @returns {void}
 * @example
 * clearField('simpleTriggersInput');
 */
export function clearField(fieldOrId) {
  let field;
  
  if (typeof fieldOrId === 'string') {
    field = document.getElementById(fieldOrId);
  } else {
    field = fieldOrId;
  }

  if (!field) return;

  // Очищаем значение
  field.value = '';

  // Триггерим событие input для обновления счетчиков и т.д.
  const inputEvent = new Event('input', { bubbles: true });
  field.dispatchEvent(inputEvent);

  // Фокус на поле
  field.focus();

  // Обновляем видимость кнопки
  const clearBtn = field.parentElement?.querySelector('.btn-clear-inline');
  if (clearBtn) {
    updateClearButtonVisibility(field, clearBtn);
  }
}

/**
 * Удаляет кнопку очистки с поля
 * @param {HTMLElement|string} fieldOrId - DOM-элемент поля или ID
 * @returns {void}
 * @example
 * removeClearButtonFromField('simpleTriggersInput');
 */
export function removeClearButtonFromField(fieldOrId) {
  let field;
  
  if (typeof fieldOrId === 'string') {
    field = document.getElementById(fieldOrId);
  } else {
    field = fieldOrId;
  }

  if (!field) return;

  const wrapper = field.parentElement;
  if (!wrapper || !wrapper.classList.contains('input-with-clear')) return;

  const clearBtn = wrapper.querySelector('.btn-clear-inline');
  if (clearBtn) {
    clearBtn.remove();
  }

  // Убираем wrapper
  wrapper.parentNode.insertBefore(field, wrapper);
  wrapper.remove();

  // Убираем метку
  delete field.dataset.hasClearButton;
}

/**
 * Обновляет видимость кнопки очистки (показывает только если поле не пустое)
 * @param {HTMLElement} field - DOM-элемент поля
 * @param {HTMLElement} clearBtn - DOM-элемент кнопки
 * @returns {void}
 * @private
 */
function updateClearButtonVisibility(field, clearBtn) {
  if (!field || !clearBtn) return;

  const hasValue = field.value.trim().length > 0;
  
  if (hasValue) {
    clearBtn.style.display = 'block';
    clearBtn.style.opacity = '1';
  } else {
    clearBtn.style.opacity = '0';
    setTimeout(() => {
      if (field.value.trim().length === 0) {
        clearBtn.style.display = 'none';
      }
    }, 200);
  }
}

/**
 * Проверяет, имеет ли поле кнопку очистки
 * @param {HTMLElement|string} fieldOrId - DOM-элемент поля или ID
 * @returns {boolean} - true, если кнопка есть
 * @example
 * if (hasFieldClearButton('simpleTriggersInput')) { ... }
 */
export function hasFieldClearButton(fieldOrId) {
  let field;
  
  if (typeof fieldOrId === 'string') {
    field = document.getElementById(fieldOrId);
  } else {
    field = fieldOrId;
  }

  if (!field) return false;

  return field.dataset.hasClearButton === 'true';
}

/**
 * Добавляет кнопки очистки ко всем textarea внутри контейнера
 * @param {HTMLElement|string} containerOrId - DOM-элемент контейнера или ID
 * @returns {void}
 * @example
 * addClearButtonsToContainer('linkedGroupsContainer');
 */
export function addClearButtonsToContainer(containerOrId) {
  let container;
  
  if (typeof containerOrId === 'string') {
    container = document.getElementById(containerOrId);
  } else {
    container = containerOrId;
  }

  if (!container) return;

  const textareas = container.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    if (!hasFieldClearButton(textarea)) {
      addClearButtonToField(textarea);
    }
  });
}

/**
 * Удаляет все кнопки очистки со страницы
 * @returns {void}
 * @example
 * removeAllClearButtons();
 */
export function removeAllClearButtons() {
  const clearButtons = document.querySelectorAll('.btn-clear-inline');
  clearButtons.forEach(btn => btn.remove());

  const wrappers = document.querySelectorAll('.input-with-clear');
  wrappers.forEach(wrapper => {
    const field = wrapper.querySelector('input, textarea');
    if (field) {
      wrapper.parentNode.insertBefore(field, wrapper);
      delete field.dataset.hasClearButton;
    }
    wrapper.remove();
  });
}

/**
 * Наблюдает за добавлением новых textarea в DOM (для динамических полей)
 * @returns {void}
 * @private
 */
function observeTextareaAdditions() {
  // MutationObserver для отслеживания добавления новых textarea
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Если добавлен сам textarea
          if (node.tagName === 'TEXTAREA' && !hasFieldClearButton(node)) {
            addClearButtonToField(node);
          }
          
          // Если добавлен контейнер с textarea
          const textareas = node.querySelectorAll?.('textarea');
          textareas?.forEach(textarea => {
            if (!hasFieldClearButton(textarea)) {
              addClearButtonToField(textarea);
            }
          });
        }
      });
    });
  });

  // Наблюдаем за контейнером связанных триггеров
  const linkedContainer = document.getElementById('linkedGroupsContainer');
  if (linkedContainer) {
    observer.observe(linkedContainer, {
      childList: true,
      subtree: true
    });
  }
}

/**
 * Очищает все поля с кнопками очистки на странице
 * @returns {void}
 * @example
 * clearAllFields();
 */
export function clearAllFields() {
  const fieldsWithClearButtons = document.querySelectorAll('[data-has-clear-button="true"]');
  
  fieldsWithClearButtons.forEach(field => {
    clearField(field);
  });
}

/**
 * Устанавливает callback для события очистки поля
 * @param {HTMLElement|string} fieldOrId - DOM-элемент поля или ID
 * @param {Function} callback - Функция callback
 * @returns {void}
 * @example
 * onFieldClear('simpleTriggersInput', () => {
 *   console.log('Field cleared!');
 * });
 */
export function onFieldClear(fieldOrId, callback) {
  let field;
  
  if (typeof fieldOrId === 'string') {
    field = document.getElementById(fieldOrId);
  } else {
    field = fieldOrId;
  }

  if (!field || typeof callback !== 'function') return;

  // Добавляем custom event listener
  field.addEventListener('fieldCleared', callback);
}

/**
 * Триггерит событие очистки поля
 * @param {HTMLElement} field - DOM-элемент поля
 * @returns {void}
 * @private
 */
function triggerFieldClearedEvent(field) {
  const event = new CustomEvent('fieldCleared', { bubbles: true });
  field.dispatchEvent(event);
}

/**
 * Обновляет все кнопки очистки (видимость)
 * @returns {void}
 * @example
 * updateAllClearButtons();
 */
export function updateAllClearButtons() {
  const fieldsWithClearButtons = document.querySelectorAll('[data-has-clear-button="true"]');
  
  fieldsWithClearButtons.forEach(field => {
    const clearBtn = field.parentElement?.querySelector('.btn-clear-inline');
    if (clearBtn) {
      updateClearButtonVisibility(field, clearBtn);
    }
  });
}
