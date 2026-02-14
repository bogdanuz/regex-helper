/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - DistanceSelector.js
 * Управление Distance Dropdown (5 опций + custom с валидацией)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class DistanceSelector
 * @description Управляет dropdown distance между подгруппами
 * 
 * 5 опций distance:
 * 1. null - Нет distance (альтернация |)
 * 2. alternation - Рядом (|)
 * 3. custom - Точное расстояние .{мин,макс}
 * 4. any - Любое расстояние .?
 * 5. paragraph - Конец абзаца \.
 * 6. line - Конец строки $
 */
export class DistanceSelector {
    constructor() {
        this.selectedDistances = new Map(); // subgroupId -> {mode, min, max}
        this.init();
    }

    /**
     * Инициализация селектора
     */
    init() {
        // Делегирование событий для динамических dropdown
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('distance-dropdown')) {
                this.handleDistanceChange(e);
            }
        });

        // Обработка custom полей (min/max)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('distance-min') || 
                e.target.classList.contains('distance-max')) {
                this.handleCustomInput(e);
            }
        });
    }

    /**
     * Обработчик изменения distance dropdown
     * @param {Event} e - Событие change
     */
    handleDistanceChange(e) {
        const dropdown = e.target;
        const subgroupElement = dropdown.closest('[data-subgroup-id]');
        if (!subgroupElement) return;

        const subgroupId = subgroupElement.dataset.subgroupId;
        const selectedOption = dropdown.options[dropdown.selectedIndex];
        const mode = selectedOption.dataset.mode || dropdown.value;

        // Показать/скрыть custom поля
        this.toggleCustomFields(dropdown, mode);

        // Сохранить выбор
        if (mode === 'custom') {
            // Для custom сохраним после ввода min/max
            this.selectedDistances.set(subgroupId, { 
                mode, 
                min: 1, 
                max: 10 
            });
        } else {
            this.selectedDistances.set(subgroupId, { 
                mode, 
                min: null, 
                max: null 
            });
        }

        // Применить distance (обновить data-атрибут или вызвать callback)
        this.applyDistance(subgroupId, mode);
    }

    /**
     * Показать/скрыть custom поля
     * @param {HTMLElement} dropdown - Dropdown элемент
     * @param {string} mode - Режим distance
     */
    toggleCustomFields(dropdown, mode) {
        const customContainer = dropdown
            .closest('.distance-selector')
            ?.querySelector('.custom-distance');

        if (!customContainer) return;

        if (mode === 'custom') {
            customContainer.style.display = 'block';
        } else {
            customContainer.style.display = 'none';
        }
    }

    /**
     * Обработчик ввода в custom поля
     * @param {Event} e - Событие input
     */
    handleCustomInput(e) {
        const input = e.target;
        const subgroupElement = input.closest('[data-subgroup-id]');
        if (!subgroupElement) return;

        const subgroupId = subgroupElement.dataset.subgroupId;
        const isMin = input.classList.contains('distance-min');
        const isMax = input.classList.contains('distance-max');

        const customContainer = input.closest('.custom-distance');
        const minInput = customContainer.querySelector('.distance-min');
        const maxInput = customContainer.querySelector('.distance-max');

        const min = parseInt(minInput.value) || 1;
        const max = parseInt(maxInput.value) || 10;

        // Валидация
        const validation = this.validateCustomDistance(min, max);

        if (!validation.valid) {
            // Показать ошибку
            this.showCustomError(customContainer, validation.error);
            return;
        } else {
            // Скрыть ошибку
            this.hideCustomError(customContainer);
        }

        // Сохранить значения
        const current = this.selectedDistances.get(subgroupId) || { mode: 'custom' };
        this.selectedDistances.set(subgroupId, {
            mode: 'custom',
            min,
            max
        });

        // Обновить preview
        this.updateCustomPreview(customContainer, min, max);
    }

    /**
     * Валидация custom distance
     * @param {number} min - Минимум
     * @param {number} max - Максимум
     * @returns {Object} {valid: boolean, error: string}
     */
    validateCustomDistance(min, max) {
        // Правило 1: min >= 1
        if (min < 1) {
            return {
                valid: false,
                error: 'Минимум должен быть >= 1'
            };
        }

        // Правило 2: max >= min
        if (max < min) {
            return {
                valid: false,
                error: 'Максимум должен быть >= минимума'
            };
        }

        // Правило 3: min и max — целые числа
        if (!Number.isInteger(min) || !Number.isInteger(max)) {
            return {
                valid: false,
                error: 'Значения должны быть целыми числами'
            };
        }

        // Предупреждение: max > 1000 (не блокируем, но предупреждаем)
        if (max > 1000) {
            return {
                valid: true,
                warning: 'Большое значение (>1000) может замедлить regex'
            };
        }

        return { valid: true };
    }

    /**
     * Показать ошибку в custom полях
     * @param {HTMLElement} container - Контейнер .custom-distance
     * @param {string} errorMessage - Сообщение об ошибке
     */
    showCustomError(container, errorMessage) {
        let errorElement = container.querySelector('.custom-error');

        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'custom-error';
            container.appendChild(errorElement);
        }

        errorElement.textContent = `⚠️ ${errorMessage}`;
        errorElement.style.color = '#FF4444';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '8px';
    }

    /**
     * Скрыть ошибку в custom полях
     * @param {HTMLElement} container - Контейнер .custom-distance
     */
    hideCustomError(container) {
        const errorElement = container.querySelector('.custom-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Обновить preview для custom distance
     * @param {HTMLElement} container - Контейнер .custom-distance
     * @param {number} min - Минимум
     * @param {number} max - Максимум
     */
    updateCustomPreview(container, min, max) {
        let previewElement = container.querySelector('.custom-preview');

        if (!previewElement) {
            previewElement = document.createElement('p');
            previewElement.className = 'custom-preview';
            previewElement.style.fontSize = '12px';
            previewElement.style.color = '#00D4FF';
            previewElement.style.marginTop = '8px';
            previewElement.style.fontFamily = "'Fira Code', monospace";
            container.appendChild(previewElement);
        }

        previewElement.textContent = `Regex: .{${min},${max}}`;
    }

    /**
     * Применить distance к подгруппе
     * @param {string} subgroupId - ID подгруппы
     * @param {string} mode - Режим distance
     */
    applyDistance(subgroupId, mode) {
        const subgroupElement = document.querySelector(`[data-subgroup-id="${subgroupId}"]`);
        if (!subgroupElement) return;

        // Сохранить mode в data-атрибут для дальнейшего использования
        subgroupElement.dataset.distanceMode = mode;

        const distanceData = this.selectedDistances.get(subgroupId);
        if (distanceData && distanceData.mode === 'custom') {
            subgroupElement.dataset.distanceMin = distanceData.min;
            subgroupElement.dataset.distanceMax = distanceData.max;
        }
    }

    /**
     * Получить distance для подгруппы
     * @param {string} subgroupId - ID подгруппы
     * @returns {Object|null} {mode, min, max} или null
     */
    getDistance(subgroupId) {
        return this.selectedDistances.get(subgroupId) || null;
    }

    /**
     * Преобразовать distance в regex паттерн
     * @param {string} mode - Режим distance
     * @param {number} min - Минимум (для custom)
     * @param {number} max - Максимум (для custom)
     * @returns {string|null} Regex паттерн или null
     */
    toRegexPattern(mode, min = null, max = null) {
        switch (mode) {
            case 'null':
            case 'alternation':
                return null; // Альтернация (|), без distance

            case 'custom':
                if (min === null || max === null) {
                    console.warn('DistanceSelector: custom mode требует min и max');
                    return null;
                }
                return `.{${min},${max}}`;

            case 'any':
                return '.?';

            case 'paragraph':
                return '\\.'; // Экранированная точка

            case 'line':
                return '$';

            default:
                console.warn(`DistanceSelector: неизвестный mode "${mode}"`);
                return null;
        }
    }

    /**
     * Получить описание distance для tooltip
     * @param {string} mode - Режим distance
     * @returns {string} Описание
     */
    getDistanceDescription(mode) {
        const descriptions = {
            'null': 'Нет distance (альтернация |)',
            'alternation': 'Рядом (подгруппы через |)',
            'custom': 'Точное расстояние (.{мин,макс})',
            'any': 'Любое расстояние (.? — 0 или 1 символ)',
            'paragraph': 'Конец абзаца (\. — точка)',
            'line': 'Конец строки ($)'
        };

        return descriptions[mode] || 'Неизвестный режим';
    }

    /**
     * Рендер distance dropdown для подгруппы
     * @param {string} subgroupId - ID подгруппы
     * @param {string} currentMode - Текущий режим (опционально)
     * @returns {HTMLElement} Dropdown элемент
     */
    renderDropdown(subgroupId, currentMode = 'null') {
        const dropdown = document.createElement('select');
        dropdown.className = 'distance-dropdown';
        dropdown.dataset.subgroupId = subgroupId;

        const options = [
            { value: 'null', label: 'Нет distance', mode: 'alternation' },
            { value: 'alternation', label: 'Рядом (|)', mode: 'alternation' },
            { value: 'custom', label: 'Точное расстояние (.{мин,макс})', mode: 'custom' },
            { value: 'any', label: 'Любое расстояние (.?)', mode: 'any' },
            { value: 'paragraph', label: 'Конец абзаца (\\.)', mode: 'paragraph' },
            { value: 'line', label: 'Конец строки ($)', mode: 'line' }
        ];

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.dataset.mode = opt.mode;

            if (opt.value === currentMode) {
                option.selected = true;
            }

            dropdown.appendChild(option);
        });

        return dropdown;
    }

    /**
     * Рендер custom полей для точного расстояния
     * @param {string} subgroupId - ID подгруппы
     * @param {number} defaultMin - Минимум по умолчанию
     * @param {number} defaultMax - Максимум по умолчанию
     * @returns {HTMLElement} Custom container
     */
    renderCustomFields(subgroupId, defaultMin = 1, defaultMax = 10) {
        const container = document.createElement('div');
        container.className = 'custom-distance';
        container.style.display = 'none';
        container.dataset.subgroupId = subgroupId;

        container.innerHTML = `
            <label>
                <span>Минимум:</span>
                <input type="number" min="1" value="${defaultMin}" class="distance-min" />
            </label>
            <label>
                <span>Максимум:</span>
                <input type="number" min="1" value="${defaultMax}" class="distance-max" />
            </label>
            <p class="hint">
                💡 Укажите минимальное и максимальное расстояние между подгруппами
            </p>
        `;

        return container;
    }
}

