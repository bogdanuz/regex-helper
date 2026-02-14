/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - CommonRoot.js
 * Type 3: Общий корень (минимум 3 символа)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * Найти общий корень среди триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @param {number} minLength - Минимальная длина корня (по умолчанию 3)
 * @returns {string|null} Общий корень или null
 * 
 * @example
 * findCommonRoot(['актёр', 'актриса', 'актёрский'], 3) → 'акт'
 * findCommonRoot(['дом', 'дорога'], 3) → 'до' (< 3, вернёт null)
 * findCommonRoot(['кот', 'пёс'], 3) → null
 */
export function findCommonRoot(triggers, minLength = 3) {
    if (!Array.isArray(triggers) || triggers.length < 2) {
        return null;
    }

    // Отфильтровать пустые триггеры
    const validTriggers = triggers.filter(t => t && t.trim().length > 0);

    if (validTriggers.length < 2) {
        return null;
    }

    // Сортировать триггеры (для быстрого сравнения первого и последнего)
    const sorted = validTriggers.sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Найти общий префикс
    let i = 0;
    while (i < first.length && i < last.length && first[i] === last[i]) {
        i++;
    }

    const root = first.substring(0, i);

    // Проверить минимальную длину
    if (root.length < minLength) {
        return null;
    }

    return root;
}

/**
 * Применить общий корень (создать regex с окончаниями)
 * @param {Array<string>} triggers - Массив триггеров
 * @param {number} minLength - Минимальная длина корня (по умолчанию 3)
 * @returns {string|null} Regex паттерн корень(?окончания) или null
 * 
 * @example
 * applyCommonRoot(['актёр', 'актриса', 'актёрский']) → 'акт(?:ёр|риса|ёрский)'
 * applyCommonRoot(['дом', 'домик', 'домище']) → 'дом(?:|ик|ище)'
 * applyCommonRoot(['кот', 'пёс']) → null
 */
export function applyCommonRoot(triggers, minLength = 3) {
    const root = findCommonRoot(triggers, minLength);

    if (!root) {
        // Если нет общего корня, вернуть альтернацию
        return `(?:${triggers.join('|')})`;
    }

    // Найти окончания (часть после корня)
    const endings = triggers.map(trigger => {
        if (trigger.startsWith(root)) {
            return trigger.substring(root.length);
        }
        return trigger; // На всякий случай (не должно произойти)
    });

    // Если все триггеры == корень, вернуть просто корень
    if (endings.every(e => e === '')) {
        return root;
    }

    // Собрать regex: корень(?:окончание1|окончание2|...)
    return `${root}(?:${endings.join('|')})`;
}

/**
 * Проверить, есть ли общий корень среди триггеров
 * @param {Array<string>} triggers - Массив триггеров
 * @param {number} minLength - Минимальная длина корня (по умолчанию 3)
 * @returns {boolean} true если есть общий корень >= minLength
 */
export function hasCommonRoot(triggers, minLength = 3) {
    const root = findCommonRoot(triggers, minLength);
    return root !== null && root.length >= minLength;
}

/**
 * Получить информацию о корне и окончаниях
 * @param {Array<string>} triggers - Массив триггеров
 * @param {number} minLength - Минимальная длина корня
 * @returns {Object|null} {root, endings} или null
 * 
 * @example
 * getRootInfo(['актёр', 'актриса']) → {
 *   root: 'акт',
 *   endings: ['ёр', 'риса']
 * }
 */
export function getRootInfo(triggers, minLength = 3) {
    const root = findCommonRoot(triggers, minLength);

    if (!root) {
        return null;
    }

    const endings = triggers.map(trigger => 
        trigger.startsWith(root) ? trigger.substring(root.length) : trigger
    );

    return {
        root,
        endings
    };
}
