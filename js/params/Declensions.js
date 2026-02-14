/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Declensions.js
 * Type 4: Склонения (12 форм через russian-nouns.min.js)
 * ═══════════════════════════════════════════════════════════════════
 */

/**
 * ВАЖНО: Этот модуль требует библиотеку russian-nouns.min.js
 * Подключение: <script src="js/lib/russian-nouns.min.js"></script>
 */

/**
 * Применить склонения к существительному
 * @param {string} text - Существительное в именительном падеже
 * @returns {string} Regex паттерн с 12 формами (?:форма1|форма2|...)
 * 
 * 12 ФОРМ:
 * Единственное число (6 падежей):
 * 1. Именительный (кто? что?)
 * 2. Родительный (кого? чего?)
 * 3. Дательный (кому? чему?)
 * 4. Винительный (кого? что?)
 * 5. Творительный (кем? чем?)
 * 6. Предложный (о ком? о чём?)
 * 
 * Множественное число (6 падежей):
 * 7-12. Те же падежи
 * 
 * @example
 * applyDeclensions('актёр') → '(?:актёр|актёра|актёру|актёром|актёре|актёры|актёров|актёрам|актёрами|актёрах)'
 * applyDeclensions('дом') → '(?:дом|дома|дому|домом|доме|дома|домов|домам|домами|домах)'
 */
export function applyDeclensions(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }

    // Проверить, доступна ли библиотека russian-nouns
    if (typeof RussianNouns === 'undefined') {
        console.error('Declensions: библиотека russian-nouns.min.js не загружена');
        return text;
    }

    try {
        // Создать объект существительного
        const noun = RussianNouns.createNoun(text);

        if (!noun) {
            console.warn(`Declensions: не удалось создать существительное для "${text}"`);
            return text;
        }

        // Set для уникальных форм
        const forms = new Set();

        // Добавить единственное число (6 падежей)
        forms.add(noun.nom);  // Именительный
        forms.add(noun.gen);  // Родительный
        forms.add(noun.dat);  // Дательный
        forms.add(noun.acc);  // Винительный
        forms.add(noun.ins);  // Творительный
        forms.add(noun.pre);  // Предложный

        // Добавить множественное число (6 падежей)
        try {
            const plural = noun.pluralize();
            if (plural) {
                forms.add(plural.nom);
                forms.add(plural.gen);
                forms.add(plural.dat);
                forms.add(plural.acc);
                forms.add(plural.ins);
                forms.add(plural.pre);
            }
        } catch (e) {
            console.warn(`Declensions: не удалось получить множественное число для "${text}"`);
        }

        // Отфильтровать null/undefined
        const uniqueForms = Array.from(forms).filter(f => f && f.trim().length > 0);

        // Сортировать по длине (от длинных к коротким)
        // Важно для regex, чтобы длинные формы проверялись первыми
        uniqueForms.sort((a, b) => b.length - a.length);

        // Если получилось меньше 2 форм, вернуть оригинал
        if (uniqueForms.length < 2) {
            return text;
        }

        // Вернуть regex паттерн
        return `(?:${uniqueForms.join('|')})`;

    } catch (error) {
        console.error(`Declensions: ошибка обработки "${text}":`, error);
        return text;
    }
}

/**
 * Получить все формы склонения
 * @param {string} text - Существительное
 * @returns {Object|null} Объект с формами или null
 * 
 * @example
 * getDeclensionForms('актёр') → {
 *   singular: {nom: 'актёр', gen: 'актёра', dat: 'актёру', ...},
 *   plural: {nom: 'актёры', gen: 'актёров', ...}
 * }
 */
export function getDeclensionForms(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }

    if (typeof RussianNouns === 'undefined') {
        console.error('Declensions: библиотека russian-nouns.min.js не загружена');
        return null;
    }

    try {
        const noun = RussianNouns.createNoun(text);

        if (!noun) {
            return null;
        }

        const result = {
            singular: {
                nom: noun.nom,  // Именительный
                gen: noun.gen,  // Родительный
                dat: noun.dat,  // Дательный
                acc: noun.acc,  // Винительный
                ins: noun.ins,  // Творительный
                pre: noun.pre   // Предложный
            },
            plural: null
        };

        try {
            const plural = noun.pluralize();
            if (plural) {
                result.plural = {
                    nom: plural.nom,
                    gen: plural.gen,
                    dat: plural.dat,
                    acc: plural.acc,
                    ins: plural.ins,
                    pre: plural.pre
                };
            }
        } catch (e) {
            // Множественное число недоступно
        }

        return result;

    } catch (error) {
        console.error(`Declensions: ошибка получения форм "${text}":`, error);
        return null;
    }
}

/**
 * Проверить, является ли слово существительным (может ли склоняться)
 * @param {string} text - Слово
 * @returns {boolean} true если можно просклонять
 */
export function canDeclension(text) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    if (typeof RussianNouns === 'undefined') {
        return false;
    }

    try {
        const noun = RussianNouns.createNoun(text);
        return noun !== null && noun !== undefined;
    } catch (e) {
        return false;
    }
}

/**
 * Получить количество уникальных форм склонения
 * @param {string} text - Существительное
 * @returns {number} Количество уникальных форм (0 если ошибка)
 */
export function getFormsCount(text) {
    const forms = getDeclensionForms(text);

    if (!forms) {
        return 0;
    }

    const uniqueForms = new Set();

    // Добавить единственное число
    Object.values(forms.singular).forEach(f => {
        if (f && f.trim().length > 0) {
            uniqueForms.add(f);
        }
    });

    // Добавить множественное число
    if (forms.plural) {
        Object.values(forms.plural).forEach(f => {
            if (f && f.trim().length > 0) {
                uniqueForms.add(f);
            }
        });
    }

    return uniqueForms.size;
}
