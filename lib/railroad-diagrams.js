/**
 * ============================================================================
 * WRAPPER ДЛЯ RAILROAD.JS (GITHUB GH-PAGES VERSION)
 * Конвертирует ES6 modules в global scope
 * Версия: 1.0
 * ============================================================================
 */

(async function() {
    'use strict';
    
    console.log('[Railroad Wrapper] Загрузка railroad-original.js...');
    
    try {
        // Загружаем ES6 module динамически
        const Railroad = await import('./railroad-original.js');
        
        console.log('[Railroad Wrapper] Модуль загружен:', Railroad);
        
        // Определяем структуру экспорта
        let funcs;
        
        if (Railroad.default) {
            // Если есть default export
            funcs = Railroad.default;
        } else {
            // Если named exports
            funcs = Railroad;
        }
        
        // Экспортируем все функции в глобальную область
        if (typeof funcs === 'function') {
            // Если это функция-фабрика
            window.Diagram = funcs.Diagram || funcs;
        } else if (typeof funcs === 'object') {
            // Если это объект с функциями
            window.Diagram = funcs.Diagram;
        }
        
        // Экспортируем все остальные функции
        window.Sequence = funcs.Sequence || Railroad.Sequence;
        window.Stack = funcs.Stack || Railroad.Stack;
        window.OptionalSequence = funcs.OptionalSequence || Railroad.OptionalSequence;
        window.AlternatingSequence = funcs.AlternatingSequence || Railroad.AlternatingSequence;
        window.Choice = funcs.Choice || Railroad.Choice;
        window.MultipleChoice = funcs.MultipleChoice || Railroad.MultipleChoice;
        window.Optional = funcs.Optional || Railroad.Optional;
        window.OneOrMore = funcs.OneOrMore || Railroad.OneOrMore;
        window.ZeroOrMore = funcs.ZeroOrMore || Railroad.ZeroOrMore;
        window.Terminal = funcs.Terminal || Railroad.Terminal;
        window.NonTerminal = funcs.NonTerminal || Railroad.NonTerminal;
        window.Comment = funcs.Comment || Railroad.Comment;
        window.Skip = funcs.Skip || Railroad.Skip;
        window.Block = funcs.Block || Railroad.Block;
        
        console.log('[Railroad Wrapper] ✅ Все функции экспортированы в window');
        console.log('[Railroad Wrapper] Проверка:', {
            Diagram: typeof window.Diagram,
            Terminal: typeof window.Terminal,
            Sequence: typeof window.Sequence
        });
        
    } catch (error) {
        console.error('[Railroad Wrapper] ❌ Ошибка загрузки:', error);
    }
    
})();
