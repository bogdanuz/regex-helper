/**
 * ============================================
 * TEST SUITE - RegexHelper v3.0 FINAL
 * ============================================
 * Комплексное тестирование всех функций
 * 
 * Содержит:
 * - Тесты простых триггеров
 * - Тесты связанных триггеров
 * - Тесты всех оптимизаций (Type 1, 2, 4, 5)
 * - Тесты индивидуальных настроек
 * - Тесты подгрупп (v3.0)
 * - Тесты режимов связи
 * - Тесты валидации
 * - Edge cases
 */

(function() {
    'use strict';
    
    if (typeof TestRunner === 'undefined') {
        console.error('❌ TestRunner not found! Load test-runner.js first.');
        return;
    }
    
    const runner = window.testRunner;
    
    // ============================================
    // SUITE 1: ПРОСТЫЕ ТРИГГЕРЫ
    // ============================================
    
    runner.registerSuite({
        name: '1. Простые триггеры',
        tests: [
            {
                name: 'Базовая конвертация (без оптимизаций)',
                fn: async function() {
                    const triggers = ['дрон', 'беспилотник', 'квадрокоптер'];
                    const options = {
                        type1: false,
                        type2: false,
                        type4: false,
                        type5: false
                    };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.truthy(result, 'Result should exist');
                    Assert.contains(result, 'дрон', 'Should contain "дрон"');
                    Assert.contains(result, 'беспилотник', 'Should contain "беспилотник"');
                    Assert.contains(result, 'квадрокоптер', 'Should contain "квадрокоптер"');
                    Assert.contains(result, '|', 'Should use alternation');
                }
            },
            {
                name: 'Один триггер',
                fn: async function() {
                    const triggers = ['дрон'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.equals(result, 'дрон', 'Should return single trigger');
                    Assert.notContains(result, '|', 'Should not have alternation');
                }
            },
            {
                name: 'Пустой массив триггеров',
                fn: async function() {
                    const triggers = [];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    Assert.throws(() => {
                        convertSimpleTriggers(triggers, options);
                    }, 'Should throw error for empty array');
                }
            },
            {
                name: 'Удаление пробелов и пустых строк',
                fn: async function() {
                    const triggers = ['дрон', '  ', '', 'беспилотник', '   квадрокоптер   '];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.notContains(result, '  ', 'Should not contain spaces');
                    Assert.contains(result, 'квадрокоптер', 'Should trim whitespace');
                }
            },
            {
                name: 'Удаление дубликатов',
                fn: async function() {
                    const triggers = ['дрон', 'дрон', 'беспилотник', 'дрон'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    const matches = result.match(/дрон/g);
                    Assert.equals(matches.length, 1, 'Should contain "дрон" only once');
                }
            },
            {
                name: 'Регистронезависимость',
                fn: async function() {
                    const triggers = ['ДРОН', 'Беспилотник', 'квадрокоптер'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    // Should normalize to lowercase
                    Assert.notContains(result, 'ДРОН', 'Should be lowercase');
                    Assert.contains(result, 'дрон', 'Should contain lowercase');
                }
            },
            {
                name: 'Спецсимволы regex должны экранироваться',
                fn: async function() {
                    const triggers = ['test.com', 'price$100', 'a+b'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '\\.', 'Should escape dot');
                    Assert.contains(result, '\\$', 'Should escape dollar');
                    Assert.contains(result, '\\+', 'Should escape plus');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 2: ОПТИМИЗАЦИЯ TYPE 1 (ВАРИАЦИИ)
    // ============================================
    
    runner.registerSuite({
        name: '2. Оптимизация Type 1 (Вариации лат↔кир)',
        tests: [
            {
                name: 'Базовая замена о→[oо]',
                fn: async function() {
                    const triggers = ['дрон'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[oо]', 'Should contain [oо]');
                }
            },
            {
                name: 'Множественные замены',
                fn: async function() {
                    const triggers = ['дрон'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[dд]', 'Should contain [dд]');
                    Assert.contains(result, '[pр]', 'Should contain [pр]');
                    Assert.contains(result, '[oо]', 'Should contain [oо]');
                }
            },
            {
                name: 'Буква а → [aа]',
                fn: async function() {
                    const triggers = ['актёр'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[aа]', 'Should contain [aа]');
                }
            },
            {
                name: 'Буква е → [eе]',
                fn: async function() {
                    const triggers = ['тест'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[eе]', 'Should contain [eе]');
                }
            },
            {
                name: 'Комбинация с другими оптимизациями',
                fn: async function() {
                    const triggers = ['дрон'];
                    const options = { type1: true, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[dд]', 'Should have Type1');
                    Assert.contains(result, '(', 'Should have Type4 declensions');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 3: ОПТИМИЗАЦИЯ TYPE 2 (ОБЩИЙ КОРЕНЬ)
    // ============================================
    
    runner.registerSuite({
        name: '3. Оптимизация Type 2 (Общий корень)',
        tests: [
            {
                name: 'Базовое группирование: книга, книги → книг[аи]',
                fn: async function() {
                    const triggers = ['книга', 'книги'];
                    const options = { type1: false, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'книг', 'Should contain root');
                    Assert.contains(result, '[аи]', 'Should group endings');
                    Assert.notContains(result, '|', 'Should not use alternation');
                }
            },
            {
                name: 'Окончания длиной 1-2 буквы',
                fn: async function() {
                    const triggers = ['кот', 'кота', 'коты'];
                    const options = { type1: false, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'кот', 'Should contain root');
                }
            },
            {
                name: 'Не группирует длинные окончания',
                fn: async function() {
                    const triggers = ['работа', 'работать'];
                    const options = { type1: false, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    // Should use alternation instead of grouping
                    Assert.contains(result, '|', 'Should use alternation for long endings');
                }
            },
            {
                name: 'Разные корни - альтернация',
                fn: async function() {
                    const triggers = ['дрон', 'беспилотник'];
                    const options = { type1: false, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '|', 'Should use alternation for different roots');
                }
            },
            {
                name: 'Три триггера с общим корнем',
                fn: async function() {
                    const triggers = ['дом', 'дома', 'домик'];
                    const options = { type1: false, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'дом', 'Should contain root');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 4: ОПТИМИЗАЦИЯ TYPE 4 (СКЛОНЕНИЯ)
    // ============================================
    
    runner.registerSuite({
        name: '4. Оптимизация Type 4 (Склонения)',
        tests: [
            {
                name: 'Базовое склонение: дрон',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['дрон'];
                    const options = { type1: false, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '(', 'Should have declension group');
                    Assert.contains(result, 'а|', 'Should contain genitive');
                    Assert.contains(result, 'ом', 'Should contain instrumental');
                }
            },
            {
                name: 'Существительное женского рода',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['книга'];
                    const options = { type1: false, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '(', 'Should have declension group');
                }
            },
            {
                name: 'Множественное число',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['дрон'];
                    const options = { type1: false, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'ов', 'Should contain genitive plural');
                }
            },
            {
                name: 'Комбинация с Type 1',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['дрон'];
                    const options = { type1: true, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[dд]', 'Should have Type1 variations');
                    Assert.contains(result, '(', 'Should have Type4 declensions');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 5: ОПТИМИЗАЦИЯ TYPE 5 (ОПЦИОНАЛЬНЫЙ СИМВОЛ)
    // ============================================
    
    runner.registerSuite({
        name: '5. Оптимизация Type 5 (Опциональный символ)',
        tests: [
            {
                name: 'Базовая оптимизация: пассивный → пасс?ивный',
                fn: async function() {
                    const triggers = ['пассивный'];
                    const options = { type1: false, type2: false, type4: false, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'с?', 'Should make doubled letter optional');
                }
            },
            {
                name: 'Множественные удвоения',
                fn: async function() {
                    const triggers = ['аллея'];
                    const options = { type1: false, type2: false, type4: false, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'л?', 'Should handle multiple doubled letters');
                }
            },
            {
                name: 'Удвоенная буква в разных позициях',
                fn: async function() {
                    const triggers = ['масса'];
                    const options = { type1: false, type2: false, type4: false, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'с?', 'Should handle doubled letter in middle');
                }
            },
            {
                name: 'Нет удвоений - без изменений',
                fn: async function() {
                    const triggers = ['дрон'];
                    const options = { type1: false, type2: false, type4: false, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.notContains(result, '?', 'Should not add ? if no doubled letters');
                }
            },
            {
                name: 'Комбинация с Type 4 (склонения)',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['пассивный'];
                    const options = { type1: false, type2: false, type4: true, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'с?', 'Should have Type5 optional');
                    Assert.contains(result, '(', 'Should have Type4 declensions');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 6: АВТОЗАМЕНА Ё → [ЁЕ]
    // ============================================
    
    runner.registerSuite({
        name: '6. Автозамена ё → [её]',
        tests: [
            {
                name: 'Базовая замена: актёр → акт[её]р',
                fn: async function() {
                    const triggers = ['актёр'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[её]', 'Should replace ё with [её]');
                }
            },
            {
                name: 'Множественные ё в слове',
                fn: async function() {
                    const triggers = ['ёлочка'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    const matches = result.match(/\[её\]/g);
                    Assert.truthy(matches, 'Should replace all ё');
                }
            },
            {
                name: 'Заглавная Ё',
                fn: async function() {
                    const triggers = ['Ёлка'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    // Should be lowercase and replaced
                    Assert.contains(result, '[её]', 'Should replace uppercase Ё');
                }
            },
            {
                name: 'Комбинация с Type 1',
                fn: async function() {
                    const triggers = ['актёр'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[её]', 'Should have ё replacement');
                    Assert.contains(result, '[aа]', 'Should have Type1 variations');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 7: СВЯЗАННЫЕ ТРИГГЕРЫ - БАЗОВЫЕ
    // ============================================
    
    runner.registerSuite({
        name: '7. Связанные триггеры - Базовые функции',
        tests: [
            {
                name: 'Создание простой связанной группы',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] }
                            ],
                            distance: '.{1,7}'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, 'военный', 'Should contain first trigger');
                    Assert.contains(result, '.{1,7}', 'Should contain distance');
                    Assert.contains(result, 'дрон', 'Should contain second trigger');
                }
            },
            {
                name: 'Две подгруппы с альтернацией внутри',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный', 'боевой'] },
                                { triggers: ['дрон', 'бпла'] }
                            ],
                            distance: '.{1,7}'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, '(военный|боевой)', 'Should group first subgroup');
                    Assert.contains(result, '(дрон|бпла)', 'Should group second subgroup');
                }
            },
            {
                name: 'Три подгруппы',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['большой'] },
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] }
                            ],
                            distance: '.{1,7}'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, 'большой', 'Should contain first');
                    Assert.contains(result, 'военный', 'Should contain second');
                    Assert.contains(result, 'дрон', 'Should contain third');
                    
                    // Should have two distance connectors
                    const matches = result.match(/\.{1,7}/g);
                    Assert.equals(matches.length, 2, 'Should have 2 distance connectors');
                }
            },
            {
                name: 'Пустая группа - ошибка',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [],
                            distance: '.{1,7}'
                        }
                    ];
                    
                    Assert.throws(() => {
                        convertLinkedTriggers(groups, {});
                    }, 'Should throw for empty subgroups');
                }
            },
            {
                name: 'Одна подгруппа - ошибка',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['дрон'] }
                            ],
                            distance: '.{1,7}'
                        }
                    ];
                    
                    Assert.throws(() => {
                        convertLinkedTriggers(groups, {});
                    }, 'Should throw for single subgroup');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 8: СВЯЗАННЫЕ ТРИГГЕРЫ - РЕЖИМЫ СВЯЗИ (v3.0)
    // ============================================
    
    runner.registerSuite({
        name: '8. Связанные триггеры - Режимы связи (v3.0)',
        tests: [
            {
                name: 'Режим: Individual (индивидуальные связи)',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный'], connection: '.{1,5}' },
                                { triggers: ['дрон'], connection: '.{1,10}' },
                                { triggers: ['атака'] }
                            ],
                            mode: 'individual'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, '.{1,5}', 'Should have first distance');
                    Assert.contains(result, '.{1,10}', 'Should have second distance');
                }
            },
            {
                name: 'Режим: Common (общий параметр)',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] },
                                { triggers: ['атака'] }
                            ],
                            mode: 'common',
                            commonDistance: '.{1,7}'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    // Should have same distance for all
                    const matches = result.match(/\.{1,7}/g);
                    Assert.equals(matches.length, 2, 'Should have 2 identical distances');
                }
            },
            {
                name: 'Режим: Alternation (без связей)',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] }
                            ],
                            mode: 'alternation'
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, '|', 'Should use alternation');
                    Assert.notContains(result, '.{', 'Should not have distance');
                }
            },
            {
                name: 'Несколько групп с разными режимами',
                fn: async function() {
                    const groups = [
                        {
                            id: 1,
                            subgroups: [
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] }
                            ],
                            mode: 'common',
                            commonDistance: '.{1,5}'
                        },
                        {
                            id: 2,
                            subgroups: [
                                { triggers: ['большой'] },
                                { triggers: ['беспилотник'] }
                            ],
                            mode: 'individual',
                            connections: ['.{1,10}']
                        }
                    ];
                    
                    const result = convertLinkedTriggers(groups, {});
                    
                    Assert.contains(result, '.{1,5}', 'Should have common distance');
                    Assert.contains(result, '.{1,10}', 'Should have individual distance');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 9: ИНДИВИДУАЛЬНЫЕ НАСТРОЙКИ ТРИГГЕРОВ
    // ============================================
    
    runner.registerSuite({
        name: '9. Индивидуальные настройки триггеров',
        tests: [
            {
                name: 'Триггер с индивидуальными оптимизациями',
                fn: async function() {
                    const triggers = [
                        { text: 'дрон', settings: { type1: true, type2: false, type4: false, type5: false } },
                        { text: 'беспилотник', settings: { type1: false, type2: false, type4: false, type5: false } }
                    ];
                    
                    const result = convertWithIndividualSettings(triggers, {});
                    
                    Assert.contains(result, '[dд]', 'First trigger should have Type1');
                    // Second trigger should be plain
                    Assert.contains(result, 'беспилотник', 'Second trigger should be plain');
                }
            },
            {
                name: 'Переопределение глобальных настроек',
                fn: async function() {
                    const triggers = [
                        { text: 'дрон', settings: { type1: false } } // Override global
                    ];
                    
                    const globalOptions = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertWithIndividualSettings(triggers, globalOptions);
                    
                    Assert.notContains(result, '[dд]', 'Should override global Type1');
                }
            },
            {
                name: 'Частичное переопределение',
                fn: async function() {
                    const triggers = [
                        { text: 'дрон', settings: { type4: true } } // Only override Type4
                    ];
                    
                    const globalOptions = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertWithIndividualSettings(triggers, globalOptions);
                    
                    Assert.contains(result, '[dд]', 'Should keep global Type1');
                    Assert.contains(result, '(', 'Should have Type4 from individual');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 10: ВАЛИДАЦИЯ И ОШИБКИ
    // ============================================
    
    runner.registerSuite({
        name: '10. Валидация и обработка ошибок',
        tests: [
            {
                name: 'Пустой массив триггеров',
                fn: async function() {
                    Assert.throws(() => {
                        convertSimpleTriggers([], {});
                    }, 'Should throw for empty array');
                }
            },
            {
                name: 'Null вместо массива',
                fn: async function() {
                    Assert.throws(() => {
                        convertSimpleTriggers(null, {});
                    }, 'Should throw for null');
                }
            },
            {
                name: 'Undefined вместо массива',
                fn: async function() {
                    Assert.throws(() => {
                        convertSimpleTriggers(undefined, {});
                    }, 'Should throw for undefined');
                }
            },
            {
                name: 'Слишком длинный триггер (>100 символов)',
                fn: async function() {
                    const longTrigger = 'a'.repeat(101);
                    
                    Assert.throws(() => {
                        convertSimpleTriggers([longTrigger], {});
                    }, 'Should throw for too long trigger');
                }
            },
            {
                name: 'Спецсимволы в триггерах',
                fn: async function() {
                    const triggers = ['test$regex^pattern'];
                    
                    Assert.doesNotThrow(() => {
                        convertSimpleTriggers(triggers, {});
                    }, 'Should handle special characters');
                }
            },
            {
                name: 'Связанная группа без подгрупп',
                fn: async function() {
                    const groups = [
                        { id: 1, subgroups: [], distance: '.{1,7}' }
                    ];
                    
                    Assert.throws(() => {
                        convertLinkedTriggers(groups, {});
                    }, 'Should throw for empty subgroups');
                }
            },
            {
                name: 'Связанная группа с одной подгруппой',
                fn: async function() {
                    const groups = [
                        { 
                            id: 1, 
                            subgroups: [{ triggers: ['дрон'] }], 
                            distance: '.{1,7}' 
                        }
                    ];
                    
                    Assert.throws(() => {
                        convertLinkedTriggers(groups, {});
                    }, 'Should throw for single subgroup');
                }
            },
            {
                name: 'Невалидная дистанция в связанной группе',
                fn: async function() {
                    const groups = [
                        { 
                            id: 1, 
                            subgroups: [
                                { triggers: ['военный'] },
                                { triggers: ['дрон'] }
                            ], 
                            distance: 'invalid' 
                        }
                    ];
                    
                    // Should still convert but might produce invalid regex
                    const result = convertLinkedTriggers(groups, {});
                    Assert.truthy(result, 'Should produce result even with invalid distance');
                }
            },
            {
                name: 'Более 15 подгрупп в группе',
                fn: async function() {
                    const subgroups = [];
                    for (let i = 0; i < 16; i++) {
                        subgroups.push({ triggers: [`trigger${i}`] });
                    }
                    
                    const groups = [
                        { id: 1, subgroups: subgroups, distance: '.{1,7}' }
                    ];
                    
                    Assert.throws(() => {
                        convertLinkedTriggers(groups, {});
                    }, 'Should throw for too many subgroups');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 11: КОМБИНАЦИИ ОПТИМИЗАЦИЙ
    // ============================================
    
    runner.registerSuite({
        name: '11. Комбинации оптимизаций',
        tests: [
            {
                name: 'Type 1 + Type 2',
                fn: async function() {
                    const triggers = ['книга', 'книги'];
                    const options = { type1: true, type2: true, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'книг', 'Should have Type2 root');
                    // Type1 should apply to grouped result
                }
            },
            {
                name: 'Type 1 + Type 4',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['дрон'];
                    const options = { type1: true, type2: false, type4: true, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '[dд]', 'Should have Type1');
                    Assert.contains(result, '(', 'Should have Type4');
                }
            },
            {
                name: 'Type 4 + Type 5',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['пассивный'];
                    const options = { type1: false, type2: false, type4: true, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, 'с?', 'Should have Type5');
                    Assert.contains(result, '(', 'Should have Type4');
                }
            },
            {
                name: 'Все оптимизации сразу',
                fn: async function() {
                    if (typeof RussianNouns === 'undefined') {
                        console.warn('⚠️ RussianNouns library not loaded, skipping test');
                        return;
                    }
                    
                    const triggers = ['пассивный'];
                    const options = { type1: true, type2: true, type4: true, type5: true };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.truthy(result.length > 0, 'Should produce result');
                    // Check that result is valid regex
                    Assert.doesNotThrow(() => {
                        new RegExp(result);
                    }, 'Should produce valid regex');
                }
            }
        ]
    });
    
    // ============================================
    // SUITE 12: EDGE CASES
    // ============================================
    
    runner.registerSuite({
        name: '12. Edge Cases и крайние случаи',
        tests: [
            {
                name: 'Очень короткий триггер (1 символ)',
                fn: async function() {
                    const triggers = ['а'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.equals(result, 'а', 'Should handle single character');
                }
            },
            {
                name: 'Триггер только из цифр',
                fn: async function() {
                    const triggers = ['123'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.contains(result, '123', 'Should handle numbers');
                }
            },
            {
                name: 'Смешанная кириллица и латиница',
                fn: async function() {
                    const triggers = ['drон'];
                    const options = { type1: true, type2: false, type4: false, type5: false };
                    
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.truthy(result, 'Should handle mixed scripts');
                }
            },
            {
                name: 'Эмодзи в триггерах',
                fn: async function() {
                    const triggers = ['🚁дрон'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    Assert.doesNotThrow(() => {
                        convertSimpleTriggers(triggers, options);
                    }, 'Should handle emoji');
                }
            },
            {
                name: 'Максимальное количество триггеров (100)',
                fn: async function() {
                    const triggers = [];
                    for (let i = 0; i < 100; i++) {
                        triggers.push(`trigger${i}`);
                    }
                    
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    Assert.doesNotThrow(() => {
                        convertSimpleTriggers(triggers, options);
                    }, 'Should handle 100 triggers');
                }
            },
            {
                name: 'Более 100 триггеров - ошибка',
                fn: async function() {
                    const triggers = [];
                    for (let i = 0; i < 101; i++) {
                        triggers.push(`trigger${i}`);
                    }
                    
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    Assert.throws(() => {
                        convertSimpleTriggers(triggers, options);
                    }, 'Should throw for >100 triggers');
                }
            },
            {
                name: 'Триггер с переносом строки',
                fn: async function() {
                    const triggers = ['дрон\nбеспилотник'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    // Should split on newline
                    const result = convertSimpleTriggers(triggers, options);
                    
                    Assert.notContains(result, '\n', 'Should not contain newline');
                }
            },
            {
                name: 'Unicode символы',
                fn: async function() {
                    const triggers = ['тест™'];
                    const options = { type1: false, type2: false, type4: false, type5: false };
                    
                    Assert.doesNotThrow(() => {
                        convertSimpleTriggers(triggers, options);
                    }, 'Should handle unicode');
                }
            }
        ]
    });
    
    console.log('✅ All test suites registered');
    console.log(`📊 Total tests: ${runner.results.total}`);
    
})();
