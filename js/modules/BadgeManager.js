/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - BadgeManager.js
 * Управление badge system (5 типов параметров)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * @class BadgeManager
 * @description Управляет отображением и взаимодействием с badge параметров
 * 
 * 5 типов badge:
 * 1. latinCyrillic (Cyan #00D4FF) - Латиница/Кириллица
 * 2. declensions (Green #00FF88) - Склонения
 * 3. commonRoot (Orange #FF9500) - Общий корень
 * 4. optionalChars (Gold #FFD700) - Опциональные символы
 * 5. prefix (Purple #A78BFA) - Префикс
 */
export class BadgeManager {
    constructor() {
        // Конфигурация badge
        this.badgeConfig = {
            latinCyrillic: {
                type: 'latin-cyrillic',
                icon: '🔤',
                text: 'А/A',
                color: '#00D4FF',
                description: 'Латиница/Кириллица'
            },
            declensions: {
                type: 'declensions',
                icon: '📖',
                text: 'Склонения',
                color: '#00FF88',
                description: 'Склонения (12 форм)'
            },
            commonRoot: {
                type: 'common-root',
                icon: '🌿',
                text: 'Корень',
                color: '#FF9500',
                description: 'Общий корень'
            },
            optionalChars: {
                type: 'optional',
                icon: '❓',
                text: 'Опц. символы',
                color: '#FFD700',
                description: 'Опциональные символы'
            },
            prefix: {
                type: 'prefix',
                icon: '🎯',
                text: 'Префикс',
                color: '#A78BFA',
                description: 'Префикс (Wildcard/Exact)'
            }
        };
    }

    /**
     * Обновить badge для группы или подгруппы
     * @param {HTMLElement} container - Контейнер .badges-container
     * @param {Object} params - Объект параметров { latinCyrillic: true, ... }
     * @param {Function} onClick - Callback при клике на badge
     */
    updateBadges(container, params, onClick = null) {
        if (!container) {
            console.warn('BadgeManager: container не найден');
            return;
        }

        // Очистить контейнер
        container.innerHTML = '';

        // Отобразить активные badge
        Object.keys(params).forEach(paramKey => {
            if (params[paramKey] && this.badgeConfig[paramKey]) {
                const badge = this.createBadge(paramKey, onClick);
                container.appendChild(badge);
            }
        });
    }

    /**
     * Создать badge элемент
     * @param {string} paramKey - Ключ параметра (latinCyrillic, declensions, ...)
     * @param {Function} onClick - Callback при клике
     * @returns {HTMLElement} Badge элемент
     */
    createBadge(paramKey, onClick = null) {
        const config = this.badgeConfig[paramKey];
        if (!config) {
            console.warn(`BadgeManager: неизвестный параметр "${paramKey}"`);
            return document.createElement('span');
        }

        const badge = document.createElement('span');
        badge.className = `badge badge-${config.type}`;
        badge.dataset.param = paramKey;
        badge.title = config.description;

        badge.innerHTML = `
            <span class="badge-icon">${config.icon}</span>
            <span class="badge-text">${config.text}</span>
        `;

        // Добавить обработчик клика
        if (onClick && typeof onClick === 'function') {
            badge.style.cursor = 'pointer';
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick(paramKey);
            });
        }

        return badge;
    }

    /**
     * Автоопределение параметров из триггеров
     * @param {Array} triggers - Массив триггеров (строк)
     * @returns {Object} Объект параметров { latinCyrillic: boolean, ... }
     */
    autoDetectParams(triggers) {
        if (!Array.isArray(triggers) || triggers.length === 0) {
            return {
                latinCyrillic: false,
                declensions: false,
                commonRoot: false,
                optionalChars: false,
                prefix: false
            };
        }

        const params = {
            latinCyrillic: this.detectLatinCyrillic(triggers),
            declensions: false, // Пока false (логика склонений сложная)
            commonRoot: this.detectCommonRoot(triggers),
            optionalChars: false, // Определяется вручную через Inline Popup
            prefix: false // Определяется вручную через Inline Popup
        };

        return params;
    }

    /**
     * Определить наличие латиницы/кириллицы
     * @param {Array} triggers - Массив триггеров
     * @returns {boolean}
     */
    detectLatinCyrillic(triggers) {
        // Проверка: есть ли символы, которые встречаются в обеих раскладках
        // Например: a, c, e, o, p, x, y (lowercase)
        // A, B, C, E, H, K, M, O, P, T, X (uppercase)

        const latinCyrillicChars = ['a', 'c', 'e', 'o', 'p', 'x', 'y', 
                                     'A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X'];

        for (const trigger of triggers) {
            for (const char of latinCyrillicChars) {
                if (trigger.includes(char)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Определить наличие общего корня
     * @param {Array} triggers - Массив триггеров
     * @returns {boolean}
     */
    detectCommonRoot(triggers) {
        if (triggers.length < 2) return false;

        // Найти общий корень (минимум 3 символа)
        const sorted = [...triggers].sort();
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        let i = 0;
        while (i < first.length && first[i] === last[i]) {
            i++;
        }

        const root = first.substring(0, i);

        // Если общий корень >= 3 символов, возвращаем true
        return root.length >= 3;
    }

    /**
     * Добавить badge в контейнер
     * @param {HTMLElement} container - Контейнер .badges-container
     * @param {string} paramKey - Ключ параметра
     * @param {Function} onClick - Callback при клике
     */
    addBadge(container, paramKey, onClick = null) {
        if (!container) return;

        // Проверить, есть ли уже такой badge
        const existing = container.querySelector(`[data-param="${paramKey}"]`);
        if (existing) {
            console.warn(`BadgeManager: badge "${paramKey}" уже существует`);
            return;
        }

        const badge = this.createBadge(paramKey, onClick);
        container.appendChild(badge);
    }

    /**
     * Удалить badge из контейнера
     * @param {HTMLElement} container - Контейнер .badges-container
     * @param {string} paramKey - Ключ параметра
     */
    removeBadge(container, paramKey) {
        if (!container) return;

        const badge = container.querySelector(`[data-param="${paramKey}"]`);
        if (badge) {
            badge.classList.add('removing');
            setTimeout(() => badge.remove(), 200); // Анимация из badges.css
        }
    }

    /**
     * Переключить badge (добавить/удалить)
     * @param {HTMLElement} container - Контейнер .badges-container
     * @param {string} paramKey - Ключ параметра
     * @param {boolean} active - Активен ли параметр
     * @param {Function} onClick - Callback при клике
     */
    toggleBadge(container, paramKey, active, onClick = null) {
        if (active) {
            this.addBadge(container, paramKey, onClick);
        } else {
            this.removeBadge(container, paramKey);
        }
    }

    /**
     * Получить все активные параметры из контейнера
     * @param {HTMLElement} container - Контейнер .badges-container
     * @returns {Object} Объект параметров { latinCyrillic: true, ... }
     */
    getActiveParams(container) {
        if (!container) return {};

        const params = {
            latinCyrillic: false,
            declensions: false,
            commonRoot: false,
            optionalChars: false,
            prefix: false
        };

        const badges = container.querySelectorAll('.badge');
        badges.forEach(badge => {
            const paramKey = badge.dataset.param;
            if (paramKey && params.hasOwnProperty(paramKey)) {
                params[paramKey] = true;
            }
        });

        return params;
    }

    /**
     * Получить конфигурацию badge по ключу параметра
     * @param {string} paramKey - Ключ параметра
     * @returns {Object|null} Конфигурация badge
     */
    getBadgeConfig(paramKey) {
        return this.badgeConfig[paramKey] || null;
    }

    /**
     * Получить все доступные типы badge
     * @returns {Array} Массив ключей параметров
     */
    getAllBadgeTypes() {
        return Object.keys(this.badgeConfig);
    }
}

