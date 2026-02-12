/**
 * RegexHelper v4.0 - Drag and Drop
 * 
 * Модуль для реализации drag-and-drop функциональности.
 * Позволяет перетаскивать группы и подгруппы для изменения порядка.
 * Поддерживает touch events для мобильных устройств.
 * 
 * @version 1.0
 * @date 12.02.2026
 */

/**
 * Текущий перетаскиваемый элемент
 */
let draggedElement = null;

/**
 * Placeholder для визуализации места вставки
 */
let placeholder = null;

/**
 * Тип перетаскиваемого элемента ('group' или 'subgroup')
 */
let dragType = null;

/**
 * Инициализирует модуль drag-and-drop
 * @returns {void}
 * @example
 * initDragDrop(); // вызывается в main.js
 */
export function initDragDrop() {
  // Инициализация для существующих элементов
  initDraggableElements();

  // MutationObserver для динамически добавляемых элементов
  observeDraggableAdditions();

  console.log('[DragDrop] Initialized');
}

/**
 * Инициализирует drag-and-drop для всех элементов с .drag-handle
 * @returns {void}
 * @private
 */
function initDraggableElements() {
  const dragHandles = document.querySelectorAll('.drag-handle');
  
  dragHandles.forEach(handle => {
    const draggableElement = handle.closest('.linked-group, .linked-subgroup');
    if (draggableElement && !draggableElement.dataset.draggable) {
      makeDraggable(draggableElement);
    }
  });
}

/**
 * Делает элемент перетаскиваемым
 * @param {HTMLElement} element - DOM-элемент
 * @returns {void}
 * @example
 * makeDraggable(document.getElementById('group-123'));
 */
export function makeDraggable(element) {
  if (!element) return;
  
  // Помечаем элемент как draggable
  element.setAttribute('draggable', 'true');
  element.dataset.draggable = 'true';

  // Определяем тип элемента
  const isGroup = element.classList.contains('linked-group');
  const isSubgroup = element.classList.contains('linked-subgroup');

  // Event listeners для desktop
  element.addEventListener('dragstart', handleDragStart);
  element.addEventListener('dragend', handleDragEnd);
  element.addEventListener('dragover', handleDragOver);
  element.addEventListener('drop', handleDrop);
  element.addEventListener('dragenter', handleDragEnter);
  element.addEventListener('dragleave', handleDragLeave);

  // Touch events для мобильных (упрощенная версия)
  element.addEventListener('touchstart', handleTouchStart, { passive: false });
  element.addEventListener('touchmove', handleTouchMove, { passive: false });
  element.addEventListener('touchend', handleTouchEnd);
}

/**
 * Убирает возможность перетаскивания элемента
 * @param {HTMLElement} element - DOM-элемент
 * @returns {void}
 * @example
 * removeDraggable(document.getElementById('group-123'));
 */
export function removeDraggable(element) {
  if (!element) return;

  element.removeAttribute('draggable');
  delete element.dataset.draggable;

  // Удаляем event listeners
  element.removeEventListener('dragstart', handleDragStart);
  element.removeEventListener('dragend', handleDragEnd);
  element.removeEventListener('dragover', handleDragOver);
  element.removeEventListener('drop', handleDrop);
  element.removeEventListener('dragenter', handleDragEnter);
  element.removeEventListener('dragleave', handleDragLeave);

  element.removeEventListener('touchstart', handleTouchStart);
  element.removeEventListener('touchmove', handleTouchMove);
  element.removeEventListener('touchend', handleTouchEnd);
}

// ============================================================================
// DESKTOP DRAG HANDLERS
// ============================================================================

/**
 * Обработчик начала перетаскивания
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDragStart(event) {
  draggedElement = event.currentTarget;
  
  // Определяем тип
  if (draggedElement.classList.contains('linked-group')) {
    dragType = 'group';
  } else if (draggedElement.classList.contains('linked-subgroup')) {
    dragType = 'subgroup';
  }

  // Добавляем класс для визуализации
  draggedElement.classList.add('dragging');

  // Создаем placeholder
  createPlaceholder();

  // Устанавливаем данные для transfer
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', draggedElement.innerHTML);
}

/**
 * Обработчик окончания перетаскивания
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDragEnd(event) {
  if (draggedElement) {
    draggedElement.classList.remove('dragging');
  }

  // Удаляем placeholder
  removePlaceholder();

  // Убираем классы с других элементов
  const dragOverElements = document.querySelectorAll('.drag-over');
  dragOverElements.forEach(el => el.classList.remove('drag-over'));

  draggedElement = null;
  dragType = null;
}

/**
 * Обработчик перетаскивания над элементом
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const targetElement = event.currentTarget;
  
  // Проверяем, что перетаскиваем над элементом того же типа
  if (!canDrop(targetElement)) return;

  // Определяем позицию (верх или низ элемента)
  const rect = targetElement.getBoundingClientRect();
  const midpoint = rect.top + rect.height / 2;
  const insertBefore = event.clientY < midpoint;

  // Перемещаем placeholder
  movePlaceholder(targetElement, insertBefore);
}

/**
 * Обработчик drop (завершение перетаскивания)
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const targetElement = event.currentTarget;

  if (!draggedElement || !canDrop(targetElement)) return;

  // Определяем позицию
  const rect = targetElement.getBoundingClientRect();
  const midpoint = rect.top + rect.height / 2;
  const insertBefore = event.clientY < midpoint;

  // Перемещаем элемент
  moveElement(draggedElement, targetElement, insertBefore);

  // Обновляем порядок в состоянии (через custom event)
  triggerOrderChangeEvent(dragType);
}

/**
 * Обработчик входа элемента в зону drop
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDragEnter(event) {
  const targetElement = event.currentTarget;
  if (canDrop(targetElement)) {
    targetElement.classList.add('drag-over');
  }
}

/**
 * Обработчик выхода элемента из зоны drop
 * @param {DragEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleDragLeave(event) {
  const targetElement = event.currentTarget;
  targetElement.classList.remove('drag-over');
}

// ============================================================================
// TOUCH HANDLERS (для мобильных)
// ============================================================================

let touchStartY = 0;
let touchCurrentY = 0;

/**
 * Обработчик начала touch
 * @param {TouchEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStartY = touch.clientY;
  
  draggedElement = event.currentTarget;
  
  if (draggedElement.classList.contains('linked-group')) {
    dragType = 'group';
  } else if (draggedElement.classList.contains('linked-subgroup')) {
    dragType = 'subgroup';
  }

  draggedElement.classList.add('dragging');
  createPlaceholder();
}

/**
 * Обработчик движения touch
 * @param {TouchEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleTouchMove(event) {
  event.preventDefault();
  
  if (!draggedElement) return;

  const touch = event.touches[0];
  touchCurrentY = touch.clientY;

  // Находим элемент под пальцем
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetElement = elementBelow?.closest('.linked-group, .linked-subgroup');

  if (targetElement && canDrop(targetElement)) {
    const rect = targetElement.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertBefore = touch.clientY < midpoint;

    movePlaceholder(targetElement, insertBefore);
  }
}

/**
 * Обработчик окончания touch
 * @param {TouchEvent} event - Event объект
 * @returns {void}
 * @private
 */
function handleTouchEnd(event) {
  if (!draggedElement) return;

  const touch = event.changedTouches[0];
  const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetElement = elementBelow?.closest('.linked-group, .linked-subgroup');

  if (targetElement && canDrop(targetElement)) {
    const rect = targetElement.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const insertBefore = touch.clientY < midpoint;

    moveElement(draggedElement, targetElement, insertBefore);
    triggerOrderChangeEvent(dragType);
  }

  draggedElement.classList.remove('dragging');
  removePlaceholder();

  draggedElement = null;
  dragType = null;
  touchStartY = 0;
  touchCurrentY = 0;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Проверяет, можно ли drop на целевой элемент
 * @param {HTMLElement} targetElement - Целевой элемент
 * @returns {boolean} - true, если можно
 * @private
 */
function canDrop(targetElement) {
  if (!draggedElement || !targetElement) return false;
  if (draggedElement === targetElement) return false;

  // Группы можно перетаскивать только среди групп
  if (dragType === 'group') {
    return targetElement.classList.contains('linked-group');
  }

  // Подгруппы можно перетаскивать только внутри одной группы
  if (dragType === 'subgroup') {
    if (!targetElement.classList.contains('linked-subgroup')) return false;

    const draggedGroupId = draggedElement.closest('.linked-group')?.dataset.groupId;
    const targetGroupId = targetElement.closest('.linked-group')?.dataset.groupId;

    return draggedGroupId === targetGroupId;
  }

  return false;
}

/**
 * Создает placeholder для визуализации места вставки
 * @returns {void}
 * @private
 */
function createPlaceholder() {
  placeholder = document.createElement('div');
  placeholder.className = `drag-placeholder ${dragType}-placeholder`;
  placeholder.style.height = draggedElement.offsetHeight + 'px';
  
  draggedElement.parentNode.insertBefore(placeholder, draggedElement.nextSibling);
}

/**
 * Удаляет placeholder
 * @returns {void}
 * @private
 */
function removePlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
  placeholder = null;
}

/**
 * Перемещает placeholder к целевому элементу
 * @param {HTMLElement} targetElement - Целевой элемент
 * @param {boolean} insertBefore - true = вставить перед, false = после
 * @returns {void}
 * @private
 */
function movePlaceholder(targetElement, insertBefore) {
  if (!placeholder) return;

  if (insertBefore) {
    targetElement.parentNode.insertBefore(placeholder, targetElement);
  } else {
    targetElement.parentNode.insertBefore(placeholder, targetElement.nextSibling);
  }
}

/**
 * Перемещает элемент в DOM
 * @param {HTMLElement} element - Перемещаемый элемент
 * @param {HTMLElement} target - Целевой элемент
 * @param {boolean} insertBefore - true = вставить перед, false = после
 * @returns {void}
 * @private
 */
function moveElement(element, target, insertBefore) {
  if (insertBefore) {
    target.parentNode.insertBefore(element, target);
  } else {
    target.parentNode.insertBefore(element, target.nextSibling);
  }
}

/**
 * Триггерит custom event при изменении порядка
 * @param {string} type - Тип элемента ('group' или 'subgroup')
 * @returns {void}
 * @private
 */
function triggerOrderChangeEvent(type) {
  const event = new CustomEvent('orderChanged', {
    detail: { type },
    bubbles: true
  });
  document.dispatchEvent(event);
}

/**
 * Наблюдает за добавлением новых draggable элементов
 * @returns {void}
 * @private
 */
function observeDraggableAdditions() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Если добавлен элемент с .drag-handle
          if (node.classList?.contains('linked-group') || node.classList?.contains('linked-subgroup')) {
            if (!node.dataset.draggable) {
              makeDraggable(node);
            }
          }

          // Если внутри добавленного элемента есть draggable
          const draggableElements = node.querySelectorAll?.('.linked-group, .linked-subgroup');
          draggableElements?.forEach(el => {
            if (!el.dataset.draggable) {
              makeDraggable(el);
            }
          });
        }
      });
    });
  });

  const linkedContainer = document.getElementById('linkedGroupsContainer');
  if (linkedContainer) {
    observer.observe(linkedContainer, {
      childList: true,
      subtree: true
    });
  }
}

/**
 * Возвращает порядок элементов в контейнере
 * @param {string} containerId - ID контейнера
 * @param {string} type - Тип элементов ('group' или 'subgroup')
 * @returns {string[]} - Массив ID элементов в порядке их расположения
 * @example
 * const order = getElementsOrder('linkedGroupsContainer', 'group');
 * // ['group-1', 'group-3', 'group-2']
 */
export function getElementsOrder(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const selector = type === 'group' ? '.linked-group' : '.linked-subgroup';
  const elements = container.querySelectorAll(selector);

  return Array.from(elements).map(el => {
    return el.dataset.groupId || el.dataset.subgroupId;
  }).filter(Boolean);
}

/**
 * Отключает drag-and-drop для всех элементов
 * @returns {void}
 * @example
 * disableAllDragDrop();
 */
export function disableAllDragDrop() {
  const draggableElements = document.querySelectorAll('[data-draggable="true"]');
  draggableElements.forEach(el => removeDraggable(el));
}

/**
 * Включает drag-and-drop для всех элементов
 * @returns {void}
 * @example
 * enableAllDragDrop();
 */
export function enableAllDragDrop() {
  initDraggableElements();
}
