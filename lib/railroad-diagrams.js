/**
 * ============================================================================
 * WRAPPER ДЛЯ RAILROAD.JS (GITHUB VERSION)
 * Конвертирует ES6 modules в global scope
 * ============================================================================
 */

(function() {
    'use strict';
    
    // Эмулируем ES6 export
    const exports = {};
    const module = { exports: exports };
    
    // ВСТАВЬТЕ СЮДА ВЕСЬ КОД ИЗ railroad.js (github версия)
    // Начиная со строки 1 до конца файла
    
    // === НАЧАЛО КОДА RAILROAD.JS ===
    
    // ТУТ ДОЛЖЕН БЫТЬ ВЕСЬ КОД ИЗ:
    // https://raw.githubusercontent.com/tabatkins/railroad-diagrams/refs/heads/gh-pages/railroad.js
    
    // === КОНЕЦ КОДА RAILROAD.JS ===
    
    // Экспортируем в глобальную область
    // Функция, которую экспортирует railroad.js
    const railroadExports = module.exports.default || module.exports;
    
    // Делаем доступными все функции глобально
    if (typeof railroadExports === 'function') {
        // Если это функция-генератор
        const funcs = railroadExports;
        
        // Извлекаем все функции
        window.Diagram = funcs.Diagram || funcs;
        window.Sequence = funcs.Sequence;
        window.Stack = funcs.Stack;
        window.OptionalSequence = funcs.OptionalSequence;
        window.AlternatingSequence = funcs.AlternatingSequence;
        window.Choice = funcs.Choice;
        window.MultipleChoice = funcs.MultipleChoice;
        window.Optional = funcs.Optional;
        window.OneOrMore = funcs.OneOrMore;
        window.ZeroOrMore = funcs.ZeroOrMore;
        window.Terminal = funcs.Terminal;
        window.NonTerminal = funcs.NonTerminal;
        window.Comment = funcs.Comment;
        window.Skip = funcs.Skip;
        window.Block = funcs.Block;
    } else {
        // Если экспортированы отдельные функции
        Object.assign(window, railroadExports);
    }
    
})();
