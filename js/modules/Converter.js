/**
 * ═══════════════════════════════════════════════════════════════════
 * REGEXHELPER v4.0 - Converter.js (FINAL VERSION)
 * Главный модуль конвертации триггеров в regex
 * ✅ ИСПРАВЛЕНО: getDistancePattern, escapeRegex, добавлена validateParamCompatibility
 * ═══════════════════════════════════════════════════════════════════
 */

import { applyLatinCyrillic } from '../params/LatinCyrillic.js';
import { applyCommonRoot } from '../params/CommonRoot.js';
import { applyDeclensions } from '../params/Declensions.js';
import { applyOptionalChars } from '../params/OptionalChars.js';
import { applyPrefixWildcard, applyPrefixExact, combineWithTrigger } from '../params/Prefix.js';

/**
 * @class Converter
 * @description Конвертирует триггеры в regex паттерны
 */
export class Converter {
    constructor() {
        this.linkedTriggersManager = null;
        this.simpleTriggers = null;
        this.distanceSelector = null;
    }

    /**
     * Установить зависимости
     * @param {Object} dependencies - Объект с менеджерами
     */
    setDependencies(dependencies) {
        this.linkedTriggersManager = dependencies.linkedTriggersManager;
        this.simpleTriggers = dependencies.simpleTriggers;
        this.distanceSelector = dependencies.distanceSelector;
    }

    // ═══════════════════════════════════════════════════════════════
    // КОНВЕРТАЦИЯ ПРОСТЫХ ТРИГГЕРОВ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Конвертировать простые триггеры
     * @param {Array<string>} triggers - Массив триггеров
     * @param {Object} params - Параметры {latinCyrillic, declensions, commonRoot, optionalChars, prefix}
     * @returns {string} Regex паттерн
     * 
     * @example
     * convertSimpleTriggers(['актёр', 'актриса'], {latinCyrillic: true}) 
     * → '(?:(a|а)(k|к)тёр|(a|а)(k|к)трис(a|а))'
     */
    convertSimpleTriggers(triggers, params = {}) {
        if (!Array.isArray(triggers) || triggers.length === 0) {
            throw new Error('Converter: triggers должен быть непустым массивом');
        }

        // ✅ НОВОЕ: Валидация совместимости параметров
        const validation = this.validateParamCompatibility(params, triggers);
        if (!validation.valid) {
            throw new Error(`Несовместимые параметры: ${validation.errors.join(', ')}`);
        }

        // Шаг 1: Применить параметры к каждому триггеру
        let processedTriggers = triggers.map(trigger => 
            this.applyParamsToTrigger(trigger, params)
        );

        // Шаг 2: Применить общий корень (если включён)
        if (params.commonRoot) {
            const rootPattern = applyCommonRoot(triggers);
            if (rootPattern) {
                // Применить остальные параметры к паттерну с корнем
                return this.applyParamsToPattern(rootPattern, params, ['commonRoot']);
            }
        }

        // Шаг 3: Создать альтернацию (?:триггер1|триггер2|...)
        const alternation = this.createAlternation(processedTriggers);

        // Шаг 4: Применить префикс (если включён)
        if (params.prefix) {
            return this.applyPrefixToPattern(alternation, params.prefix);
        }

        return alternation;
    }

    /**
     * ✅ НОВОЕ: Валидация совместимости параметров
     * @param {Object} params - Параметры
     * @param {Array<string>} triggers - Триггеры
     * @returns {Object} { valid: boolean, errors: Array<string> }
     */
    validateParamCompatibility(params, triggers = []) {
        const errors = [];

        // ❌ Склонения + Опциональные символы
        if (params.declensions && params.optionalChars) {
            errors.push('Параметры "Склонения" и "Опциональные символы" несовместимы');
        }

        // ❌ Склонения + Префикс
        if (params.declensions && params.prefix) {
            errors.push('Параметры "Склонения" и "Префикс" несовместимы');
        }

        // ❌ Общий корень требует минимум 2 триггера
        if (params.commonRoot && triggers.length < 2) {
            errors.push('Параметр "Общий корень" требует минимум 2 триггера');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Применить параметры к одному триггеру
     * @param {string} trigger - Триггер
     * @param {Object} params - Параметры
     * @returns {string} Обработанный триггер
     */
    applyParamsToTrigger(trigger, params) {
        let result = trigger;

        // 1. Латиница/Кириллица (Type 1)
        if (params.latinCyrillic) {
            result = applyLatinCyrillic(result);
        }

        // 2. Склонения (Type 4)
        if (params.declensions) {
            result = applyDeclensions(result);
        }

        // 3. Опциональные символы (Type 5)
        if (params.optionalChars && Array.isArray(params.optionalChars.indices)) {
            result = applyOptionalChars(result, params.optionalChars.indices);
        }

        return result;
    }

    /**
     * Применить параметры к паттерну (после commonRoot)
     * @param {string} pattern - Regex паттерн
     * @param {Object} params - Параметры
     * @param {Array} exclude - Исключить параметры
     * @returns {string} Обработанный паттерн
     */
    applyParamsToPattern(pattern, params, exclude = []) {
        let result = pattern;

        // Латиница/Кириллица (если не исключён)
        if (params.latinCyrillic && !exclude.includes('latinCyrillic')) {
            result = applyLatinCyrillic(result);
        }

        return result;
    }

    /**
     * Применить префикс к паттерну
     * @param {string} pattern - Regex паттерн
     * @param {Object} prefixConfig - Конфигурация префикса {mode, value, separator}
     * @returns {string} Паттерн с префиксом
     */
    applyPrefixToPattern(pattern, prefixConfig) {
        const { mode, value, separator = '-' } = prefixConfig;

        let prefixPattern;

        if (mode === 'wildcard') {
            prefixPattern = applyPrefixWildcard(value, separator);
        } else if (mode === 'exact') {
            prefixPattern = applyPrefixExact(
                Array.isArray(value) ? value : [value], 
                separator
            );
        } else {
            throw new Error(`Converter: неизвестный режим префикса "${mode}"`);
        }

        return combineWithTrigger(prefixPattern, pattern);
    }

    // ═══════════════════════════════════════════════════════════════
    // КОНВЕРТАЦИЯ СВЯЗАННЫХ ТРИГГЕРОВ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Конвертировать связанные триггеры
     * @param {Array<Object>} groups - Массив групп
     * @returns {string} Regex паттерн
     * 
     * @example
     * convertLinkedTriggers([
     *   {
     *     subgroups: [
     *       {triggers: ['актёр', 'актриса'], distanceToNext: null},
     *       {triggers: ['играл', 'снимался'], distanceToNext: '.{1,10}'}
     *     ]
     *   }
     * ]) → '(?:актёр|актриса).{1,10}(?:играл|снимался)'
     */
    convertLinkedTriggers(groups) {
        if (!Array.isArray(groups) || groups.length === 0) {
            throw new Error('Converter: groups должен быть непустым массивом');
        }

        const groupPatterns = groups.map(group => this.buildGroupPattern(group));

        // Объединить группы
        if (groupPatterns.length === 1) {
            return groupPatterns[0];
        }

        // Применить distance между группами
        return this.applyDistanceBetweenGroups(groups, groupPatterns);
    }

    /**
     * Построить паттерн для группы
     * @param {Object} group - Объект группы
     * @returns {string} Regex паттерн группы
     */
    buildGroupPattern(group) {
        const { subgroups, params } = group;

        if (!Array.isArray(subgroups) || subgroups.length === 0) {
            throw new Error('Converter: группа должна содержать подгруппы');
        }

        // Построить паттерны подгрупп
        const subgroupPatterns = subgroups.map(subgroup => 
            this.buildSubgroupPattern(subgroup)
        );

        // Применить distance между подгруппами
        let groupPattern = this.applyDistanceBetweenSubgroups(subgroups, subgroupPatterns);

        // Применить параметры группы (если есть)
        if (params) {
            groupPattern = this.applyParamsToPattern(groupPattern, params);
        }

        return groupPattern;
    }

    /**
     * Построить паттерн для подгруппы
     * @param {Object} subgroup - Объект подгруппы
     * @returns {string} Regex паттерн подгруппы
     */
    buildSubgroupPattern(subgroup) {
        const { triggers, params } = subgroup;

        if (!Array.isArray(triggers) || triggers.length === 0) {
            throw new Error('Converter: подгруппа должна содержать триггеры');
        }

        // Применить параметры к триггерам
        const processedTriggers = triggers.map(trigger => 
            this.applyParamsToTrigger(trigger, params || {})
        );

        // Применить общий корень (если включён)
        if (params && params.commonRoot) {
            const rootPattern = applyCommonRoot(triggers);
            if (rootPattern) {
                return this.applyParamsToPattern(rootPattern, params, ['commonRoot']);
            }
        }

        // Создать альтернацию
        return this.createAlternation(processedTriggers);
    }

    /**
     * Применить distance между подгруппами
     * @param {Array<Object>} subgroups - Массив подгрупп
     * @param {Array<string>} patterns - Массив паттернов подгрупп
     * @returns {string} Финальный паттерн
     */
    applyDistanceBetweenSubgroups(subgroups, patterns) {
        let result = patterns[0];

        for (let i = 1; i < patterns.length; i++) {
            const prevSubgroup = subgroups[i - 1];
            const distanceToNext = prevSubgroup.distanceToNext;

            // Получить distance паттерн
            const distancePattern = this.getDistancePattern(distanceToNext);

            if (distancePattern) {
                result += distancePattern;
            }

            result += patterns[i];
        }

        return result;
    }

    /**
     * Применить distance между группами
     * @param {Array<Object>} groups - Массив групп
     * @param {Array<string>} patterns - Массив паттернов групп
     * @returns {string} Финальный паттерн
     */
    applyDistanceBetweenGroups(groups, patterns) {
        let result = patterns[0];

        for (let i = 1; i < patterns.length; i++) {
            const prevGroup = groups[i - 1];
            const distanceToNextGroup = prevGroup.distanceToNextGroup;

            const distancePattern = this.getDistancePattern(distanceToNextGroup);

            if (distancePattern) {
                result += distancePattern;
            }

            result += patterns[i];
        }

        return result;
    }

    /**
     * ✅ ИСПРАВЛЕНО: Получить distance паттерн
     * @param {string|null} distance - Distance строка (например, '.{1,10}')
     * @returns {string} Distance паттерн или пустая строка
     */
    getDistancePattern(distance) {
        // null или 'alternation' - без distance (альтернация)
        if (!distance || distance === null || distance === 'alternation') {
            return '';
        }

        // ✅ ИСПРАВЛЕНИЕ: возвращаем distance как есть (он уже в формате regex)
        // Пример: ".{1,10}" → ".{1,10}"
        return distance;
    }

    // ═══════════════════════════════════════════════════════════════
    // УТИЛИТЫ
    // ═══════════════════════════════════════════════════════════════

    /**
     * Создать альтернацию из триггеров
     * @param {Array<string>} triggers - Массив триггеров
     * @returns {string} (?:триггер1|триггер2|...)
     */
    createAlternation(triggers) {
        if (triggers.length === 1) {
            return triggers[0];
        }

        return `(?:${triggers.join('|')})`;
    }

    /**
     * ✅ ИСПРАВЛЕНО: Экранировать спецсимволы regex
     * @param {string} text - Текст
     * @returns {string} Экранированный текст
     */
    escapeRegex(text) {
        // ✅ ИСПРАВЛЕНИЕ: правильное экранирование всех спецсимволов
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Оптимизировать regex паттерн
     * @param {string} pattern - Regex паттерн
     * @returns {string} Оптимизированный паттерн
     */
    optimizePattern(pattern) {
        // TODO: Реализовать оптимизации (упрощение групп, удаление дубликатов и т.д.)
        return pattern;
    }
}
