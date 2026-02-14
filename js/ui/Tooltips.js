/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Tooltips.js
 * Tooltips для distance dropdown (примеры regex)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class Tooltips
 * @description Управляет tooltips для distance селектора
 */
export class Tooltips {
    constructor() {
        this.currentTooltip = null;
        this.tooltipData = this.initTooltipData();

        this.init();
    }

    /**
     * Инициализация
     */
    init() {
        // Найти все distance dropdowns
        const dropdowns = document.querySelectorAll('.distance-dropdown');

        dropdowns.forEach(dropdown => {
            this.attachTooltip(dropdown);
        });
    }

    /**
     * Инициализация данных tooltips
     * @returns {Object} Данные tooltips для каждого типа distance
     */
    initTooltipData() {
        return {
            'alternation': {
                title: 'Альтернация (|)',
                description: 'Триггеры будут объединены через оператор "или" (|)',
                example: 'актёр|актриса',
                result: 'Найдёт либо "актёр", либо "актриса"'
            },
            'custom': {
                title: 'Настраиваемое расстояние (.{min,max})',
                description: 'Укажите минимальное и максимальное количество символов между триггерами',
                example: 'актёр.{1,10}играл',
                result: 'Найдёт "актёр" и "играл" с расстоянием 1-10 символов'
            },
            'any': {
                title: 'Любое расстояние (.*)',
                description: 'Между триггерами может быть любое количество символов',
                example: 'актёр.*играл',
                result: 'Найдёт "актёр" и "играл" с любым расстоянием'
            },
            'paragraph': {
                title: 'Конец абзаца (.)',
                description: 'Триггеры должны быть в одном абзаце (до точки)',
                example: 'актёр.играл',
                result: 'Найдёт "актёр" и "играл" в одном предложении'
            },
            'line': {
                title: 'Конец строки ($)',
                description: 'Триггеры должны быть на одной строке',
                example: 'актёр$играл',
                result: 'Найдёт "актёр" и "играл" на одной строке'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // ПРИВЯЗКА TOOLTIPS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Привязать tooltip к dropdown
     * @param {HTMLElement} dropdown - Distance dropdown элемент
     */
    attachTooltip(dropdown) {
        // Показать tooltip при наведении на option
        dropdown.addEventListener('mouseover', (e) => {
            if (e.target.tagName === 'OPTION') {
                const distanceType = e.target.dataset.mode || e.target.value;
                this.showTooltip(dropdown, distanceType);
            }
        });

        // Скрыть tooltip при уходе
        dropdown.addEventListener('mouseout', () => {
            this.hideTooltip();
        });

        // Скрыть tooltip при изменении dropdown
        dropdown.addEventListener('change', () => {
            this.hideTooltip();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ПОКАЗ/СКРЫТИЕ TOOLTIP
    // ═══════════════════════════════════════════════════════════════

    /**
     * Показать tooltip
     * @param {HTMLElement} element - Элемент, рядом с которым показать tooltip
     * @param {string} distanceType - Тип distance
     */
    showTooltip(element, distanceType) {
        // Получить данные tooltip
        const data = this.tooltipData[distanceType];

        if (!data) {
            console.warn(`Tooltips: нет данных для типа "${distanceType}"`);
            return;
        }

        // Если уже есть открытый tooltip, закрыть его
        if (this.currentTooltip) {
            this.hideTooltip();
        }

        // Создать tooltip элемент
        const tooltip = this.createTooltipElement(data);

        // Позиционировать tooltip
        this.positionTooltip(tooltip, element);

        // Добавить в DOM
        document.body.appendChild(tooltip);

        // Сохранить текущий tooltip
        this.currentTooltip = tooltip;

        // Анимация появления
        setTimeout(() => tooltip.classList.add('show'), 10);
    }

    /**
     * Создать tooltip элемент
     * @param {Object} data - Данные tooltip
     * @returns {HTMLElement} Tooltip элемент
     */
    createTooltipElement(data) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>${data.title}</strong>
            </div>
            <p class="tooltip-description">${data.description}</p>
            <div class="tooltip-example">
                <span class="example-label">Пример:</span>
                <code class="example-code">${data.example}</code>
            </div>
            <p class="tooltip-result">${data.result}</p>
        `;

        return tooltip;
    }

    /**
     * Позиционировать tooltip относительно элемента
     * @param {HTMLElement} tooltip - Tooltip элемент
     * @param {HTMLElement} element - Элемент, рядом с которым позиционировать
     */
    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();

        // Позиция: справа от элемента
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${rect.right + 12}px`;
        tooltip.style.top = `${rect.top}px`;

        // Проверить, не выходит ли tooltip за пределы экрана
        setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();

            // Если выходит за правый край, показать слева
            if (tooltipRect.right > window.innerWidth) {
                tooltip.style.left = `${rect.left - tooltipRect.width - 12}px`;
            }

            // Если выходит за нижний край, поднять вверх
            if (tooltipRect.bottom > window.innerHeight) {
                tooltip.style.top = `${rect.bottom - tooltipRect.height}px`;
            }
        }, 10);
    }

    /**
     * Скрыть tooltip
     */
    hideTooltip() {
        if (!this.currentTooltip) return;

        // Анимация исчезновения
        this.currentTooltip.classList.remove('show');

        setTimeout(() => {
            if (this.currentTooltip && this.currentTooltip.parentNode) {
                this.currentTooltip.remove();
            }
            this.currentTooltip = null;
        }, 200); // Длительность анимации
    }

    // ═══════════════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Обновить данные tooltip
     * @param {string} distanceType - Тип distance
     * @param {Object} data - Новые данные
     */
    updateTooltipData(distanceType, data) {
        this.tooltipData[distanceType] = data;
    }

    /**
     * Добавить новый тип distance с tooltip
     * @param {string} distanceType - Тип distance
     * @param {Object} data - Данные tooltip
     */
    addTooltipType(distanceType, data) {
        this.tooltipData[distanceType] = data;
    }

    /**
     * Повторно инициализировать tooltips (для динамических элементов)
     */
    reinit() {
        this.init();
    }
}
