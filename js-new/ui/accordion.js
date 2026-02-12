/**
 * RegexHelper v4.0 - UI Accordion
 * 
 * Модуль для управления аккордеонами (сворачивание/разворачивание панелей).
 * Поддерживает анимации, сохранение состояния в localStorage, keyboard navigation.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Инициализирует все аккордеоны на странице
 * @returns {void}
 * @example
 * initAccordions(); // вызывается в main.js
 */
export function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.panel-header-clickable, .accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', handleAccordionClick);
    
    // Добавляем ARIA-атрибуты
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'true');
    
    // Keyboard navigation (Enter/Space)
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAccordionClick.call(header, e);
      }
    });
  });

  // Загружаем сохраненное состояние
  loadAccordionState();

  console.log('[Accordion] Initialized');
}

/**
 * Обработчик клика по заголовку аккордеона
 * @param {Event} event - Event объект
 * @returns {void}
 * @private
 */
function handleAccordionClick(event) {
  const header = event.currentTarget;
  const panel = header.closest('.panel-accordion') || header.closest('.accordion-section');
  
  if (!panel) return;

  toggleAccordion(panel);
}

/**
 * Переключает состояние аккордеона (открыт/закрыт)
 * @param {HTMLElement|string} panelOrId - DOM-элемент панели или ID
 * @returns {void}
 * @example
 * toggleAccordion('linkedTriggersPanel');
 * toggleAccordion(document.getElementById('panel'));
 */
export function toggleAccordion(panelOrId) {
  let panel;
  
  if (typeof panelOrId === 'string') {
    panel = document.getElementById(panelOrId);
  } else {
    panel = panelOrId;
  }

  if (!panel) {
    console.warn('toggleAccordion: panel not found', panelOrId);
    return;
  }

  const isCollapsed = panel.classList.contains('collapsed');

  if (isCollapsed) {
    openAccordion(panel);
  } else {
    closeAccordion(panel);
  }

  // Сохраняем состояние
  saveAccordionState();
}

/**
 * Открывает аккордеон
 * @param {HTMLElement|string} panelOrId - DOM-элемент панели или ID
 * @returns {void}
 * @example
 * openAccordion('linkedTriggersPanel');
 */
export function openAccordion(panelOrId) {
  let panel;
  
  if (typeof panelOrId === 'string') {
    panel = document.getElementById(panelOrId);
  } else {
    panel = panelOrId;
  }

  if (!panel) return;

  panel.classList.remove('collapsed');

  // Обновляем ARIA-атрибут
  const header = panel.querySelector('.panel-header-clickable, .accordion-header');
  if (header) {
    header.setAttribute('aria-expanded', 'true');
  }

  // Анимация разворачивания
  const body = panel.querySelector('.panel-collapsible, .accordion-body');
  if (body) {
    body.style.maxHeight = body.scrollHeight + 'px';
    
    // Убираем inline-стиль после анимации
    setTimeout(() => {
      body.style.maxHeight = '';
    }, 400);
  }
}

/**
 * Закрывает аккордеон
 * @param {HTMLElement|string} panelOrId - DOM-элемент панели или ID
 * @returns {void}
 * @example
 * closeAccordion('linkedTriggersPanel');
 */
export function closeAccordion(panelOrId) {
  let panel;
  
  if (typeof panelOrId === 'string') {
    panel = document.getElementById(panelOrId);
  } else {
    panel = panelOrId;
  }

  if (!panel) return;

  panel.classList.add('collapsed');

  // Обновляем ARIA-атрибут
  const header = panel.querySelector('.panel-header-clickable, .accordion-header');
  if (header) {
    header.setAttribute('aria-expanded', 'false');
  }

  // Анимация сворачивания
  const body = panel.querySelector('.panel-collapsible, .accordion-body');
  if (body) {
    body.style.maxHeight = body.scrollHeight + 'px';
    
    requestAnimationFrame(() => {
      body.style.maxHeight = '0';
    });
  }
}

/**
 * Открывает все аккордеоны на странице
 * @returns {void}
 * @example
 * openAllAccordions();
 */
export function openAllAccordions() {
  const panels = document.querySelectorAll('.panel-accordion, .accordion-section');
  panels.forEach(panel => openAccordion(panel));
  saveAccordionState();
}

/**
 * Закрывает все аккордеоны на странице
 * @returns {void}
 * @example
 * closeAllAccordions();
 */
export function closeAllAccordions() {
  const panels = document.querySelectorAll('.panel-accordion, .accordion-section');
  panels.forEach(panel => closeAccordion(panel));
  saveAccordionState();
}

/**
 * Проверяет, открыт ли аккордеон
 * @param {HTMLElement|string} panelOrId - DOM-элемент панели или ID
 * @returns {boolean} - true, если открыт
 * @example
 * if (isAccordionOpen('linkedTriggersPanel')) { ... }
 */
export function isAccordionOpen(panelOrId) {
  let panel;
  
  if (typeof panelOrId === 'string') {
    panel = document.getElementById(panelOrId);
  } else {
    panel = panelOrId;
  }

  if (!panel) return false;

  return !panel.classList.contains('collapsed');
}

/**
 * Сохраняет состояние всех аккордеонов в localStorage
 * @returns {void}
 * @private
 */
function saveAccordionState() {
  const panels = document.querySelectorAll('.panel-accordion, .accordion-section');
  const state = {};

  panels.forEach(panel => {
    const id = panel.id;
    if (id) {
      state[id] = !panel.classList.contains('collapsed');
    }
  });

  try {
    localStorage.setItem('regexhelper-accordion-state', JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save accordion state:', error);
  }
}

/**
 * Загружает состояние всех аккордеонов из localStorage
 * @returns {void}
 * @private
 */
function loadAccordionState() {
  try {
    const stateJSON = localStorage.getItem('regexhelper-accordion-state');
    if (!stateJSON) return;

    const state = JSON.parse(stateJSON);

    Object.keys(state).forEach(panelId => {
      const isOpen = state[panelId];
      const panel = document.getElementById(panelId);

      if (panel) {
        if (isOpen) {
          openAccordion(panel);
        } else {
          closeAccordion(panel);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to load accordion state:', error);
  }
}

/**
 * Очищает сохраненное состояние аккордеонов
 * @returns {void}
 * @example
 * clearAccordionState();
 */
export function clearAccordionState() {
  try {
    localStorage.removeItem('regexhelper-accordion-state');
  } catch (error) {
    console.warn('Failed to clear accordion state:', error);
  }
}

/**
 * Устанавливает состояние аккордеона (открыт/закрыт)
 * @param {HTMLElement|string} panelOrId - DOM-элемент панели или ID
 * @param {boolean} isOpen - true = открыт, false = закрыт
 * @returns {void}
 * @example
 * setAccordionState('linkedTriggersPanel', false); // закрыть
 */
export function setAccordionState(panelOrId, isOpen) {
  if (isOpen) {
    openAccordion(panelOrId);
  } else {
    closeAccordion(panelOrId);
  }
}

/**
 * Возвращает все открытые аккордеоны
 * @returns {HTMLElement[]} - Массив открытых панелей
 * @example
 * const openPanels = getOpenAccordions();
 */
export function getOpenAccordions() {
  const panels = document.querySelectorAll('.panel-accordion, .accordion-section');
  return Array.from(panels).filter(panel => !panel.classList.contains('collapsed'));
}

/**
 * Возвращает все закрытые аккордеоны
 * @returns {HTMLElement[]} - Массив закрытых панелей
 * @example
 * const closedPanels = getClosedAccordions();
 */
export function getClosedAccordions() {
  const panels = document.querySelectorAll('.panel-accordion, .accordion-section');
  return Array.from(panels).filter(panel => panel.classList.contains('collapsed'));
}
