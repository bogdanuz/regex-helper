// ========================================
// REGEX HELPER v4.0 - УПРОЩЕННЫЙ ГЛОБАЛЬНЫЙ ТЕСТ
// БЕЗ ИМПОРТОВ - работает независимо от модулей
// Файл: tests/test-suite-global.js
// ========================================

console.log('🚀 Загрузка ГЛОБАЛЬНОГО упрощенного теста...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(msg) {
  console.log(`✅ ${msg}`);
  passedTests++;
  totalTests++;
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  failedTests++;
  totalTests++;
}

function warn(msg) {
  console.warn(`⚠️ ${msg}`);
  totalTests++;
}

// ========================================
// БЛОК 1: ПРОВЕРКА HTML ЗАГРУЗКИ
// ========================================
console.log('\n📄 БЛОК 1: ПРОВЕРКА HTML');

try {
  if (document.body) {
    pass('document.body существует');
  } else {
    fail('document.body НЕ существует');
  }
} catch(e) {
  fail(`Ошибка проверки body: ${e.message}`);
}

try {
  if (document.title) {
    pass(`Заголовок страницы: "${document.title}"`);
  } else {
    warn('Заголовок страницы не установлен');
  }
} catch(e) {
  fail(`Ошибка проверки title: ${e.message}`);
}

// ========================================
// БЛОК 2: ПРОВЕРКА CSS ФАЙЛОВ
// ========================================
console.log('\n🎨 БЛОК 2: ПРОВЕРКА CSS ФАЙЛОВ');

const expectedCSS = [
  'common.css',
  'converter.css',
  'panels.css',
  'modals.css',
  'history.css',
  'tester.css',
  'case-converter.css',
  'responsive.css'
];

try {
  const loadedSheets = Array.from(document.styleSheets).map(sheet => {
    try {
      return sheet.href || null;
    } catch(e) {
      return null;
    }
  }).filter(Boolean);

  if (loadedSheets.length > 0) {
    pass(`Загружено ${loadedSheets.length} CSS файл(ов)`);
    
    expectedCSS.forEach(cssFile => {
      const isLoaded = loadedSheets.some(href => href.includes(cssFile));
      if (isLoaded) {
        pass(`CSS найден: ${cssFile}`);
      } else {
        fail(`CSS НЕ НАЙДЕН: ${cssFile}`);
      }
    });
  } else {
    fail('НИ ОДИН CSS файл не загружен!');
  }
} catch(e) {
  fail(`Ошибка проверки CSS: ${e.message}`);
}

// Проверка применения стилей
try {
  const bodyStyle = window.getComputedStyle(document.body);
  if (bodyStyle.fontFamily && bodyStyle.fontFamily !== 'Times New Roman') {
    pass('Стили применены к <body>');
  } else {
    fail('Стили НЕ применены к <body> (используется дефолтный шрифт)');
  }
} catch(e) {
  fail(`Ошибка проверки стилей body: ${e.message}`);
}

// ========================================
// БЛОК 3: ПРОВЕРКА JS МОДУЛЕЙ
// ========================================
console.log('\n📦 БЛОК 3: ПРОВЕРКА JS ФАЙЛОВ');

try {
  const scripts = Array.from(document.scripts);
  
  if (scripts.length > 0) {
    pass(`Найдено ${scripts.length} <script> тег(ов)`);
    
    // Проверка main.js
    const mainScript = scripts.find(s => s.src && s.src.includes('main.js'));
    if (mainScript) {
      pass('main.js подключен');
      
      if (mainScript.type === 'module') {
        pass('main.js имеет type="module"');
      } else {
        fail('main.js НЕ имеет type="module"');
      }
    } else {
      fail('main.js НЕ подключен');
    }
  } else {
    fail('НИ ОДИН <script> не найден');
  }
} catch(e) {
  fail(`Ошибка проверки JS: ${e.message}`);
}

// ========================================
// БЛОК 4: ПРОВЕРКА HEADER
// ========================================
console.log('\n🏗️ БЛОК 4: ПРОВЕРКА HEADER');

const headerSelectors = {
  '.main-header': 'Header контейнер',
  '.logo': 'Логотип',
  '.main-nav': 'Навигация',
  '#btnRegulations': 'Кнопка Regulations',
  '#btnWiki': 'Кнопка Wiki',
  '#btnResetAll': 'Кнопка Reset All'
};

Object.entries(headerSelectors).forEach(([selector, name]) => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      pass(`${name} найден (${selector})`);
    } else {
      fail(`${name} НЕ найден (${selector})`);
    }
  } catch(e) {
    fail(`Ошибка поиска ${name}: ${e.message}`);
  }
});

// ========================================
// БЛОК 5: ПРОВЕРКА ПАНЕЛИ 1 (INPUT)
// ========================================
console.log('\n🎯 БЛОК 5: ПРОВЕРКА ПАНЕЛИ 1 (INPUT)');

const panel1Selectors = {
  '#panelInput': 'Панель 1: Input',
  '#modeIndividual': 'Radio: Individual',
  '#modeCommon': 'Radio: Common',
  '#modeAlternation': 'Radio: Alternation',
  '#commonDistance': 'Select: Common Distance',
  '#linkedGroupsContainer': 'Контейнер связанных групп',
  '#btnAddGroup': 'Кнопка добавления группы',
  '#simpleTriggersInput': 'Textarea: Simple Triggers',
  '#btnClearSimple': 'Кнопка очистки Simple Triggers'
};

Object.entries(panel1Selectors).forEach(([selector, name]) => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      pass(`${name} найден`);
    } else {
      fail(`${name} НЕ найден`);
    }
  } catch(e) {
    fail(`Ошибка: ${e.message}`);
  }
});

// ========================================
// БЛОК 6: ПРОВЕРКА ПАНЕЛИ 2 (OPTIMIZATIONS)
// ========================================
console.log('\n⚙️ БЛОК 6: ПРОВЕРКА ПАНЕЛИ 2 (OPTIMIZATIONS)');

const panel2Selectors = {
  '#panelOptimizations': 'Панель 2: Optimizations',
  '#type1Checkbox': 'Checkbox: Type 1',
  '#type2Checkbox': 'Checkbox: Type 2',
  '#type4Checkbox': 'Checkbox: Type 4',
  '#type5Checkbox': 'Checkbox: Type 5',
  '#type6Checkbox': 'Checkbox: Type 6',
  '#type6Modes': 'Контейнер режимов Type 6',
  '#type6ModeWildcard': 'Radio: Wildcard',
  '#type6ModeExact': 'Radio: Exact',
  '#wildcardOptions': 'Опции Wildcard',
  '#wildcardCyrillic': 'Checkbox: Кириллица',
  '#wildcardLatin': 'Checkbox: Латиница'
};

Object.entries(panel2Selectors).forEach(([selector, name]) => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      pass(`${name} найден`);
    } else {
      fail(`${name} НЕ найден`);
    }
  } catch(e) {
    fail(`Ошибка: ${e.message}`);
  }
});

// ========================================
// БЛОК 7: ПРОВЕРКА ПАНЕЛИ 3 (RESULT)
// ========================================
console.log('\n📊 БЛОК 7: ПРОВЕРКА ПАНЕЛИ 3 (RESULT)');

const panel3Selectors = {
  '#panelResult': 'Панель 3: Result',
  '#regexOutput': 'Textarea: Regex Output',
  '#btnConvert': 'Кнопка Convert',
  '#btnCopy': 'Кнопка Copy',
  '#btnExport': 'Кнопка Export',
  '#btnClearResult': 'Кнопка Clear Result'
};

Object.entries(panel3Selectors).forEach(([selector, name]) => {
  try {
    const el = document.querySelector(selector);
    if (el) {
      pass(`${name} найден`);
    } else {
      fail(`${name} НЕ найден`);
    }
  } catch(e) {
    fail(`Ошибка: ${e.message}`);
  }
});

// ========================================
// БЛОК 8: ПРОВЕРКА FOOTER
// ========================================
console.log('\n🦶 БЛОК 8: ПРОВЕРКА FOOTER');

try {
  const footer = document.querySelector('.main-footer');
  if (footer) {
    pass('Footer найден');
  } else {
    fail('Footer НЕ найден');
  }
} catch(e) {
  fail(`Ошибка проверки footer: ${e.message}`);
}

// ========================================
// БЛОК 9: ПРОВЕРКА МОДАЛЬНЫХ ОКОН
// ========================================
console.log('\n🪟 БЛОК 9: ПРОВЕРКА МОДАЛЬНЫХ ОКОН');

const modals = [
  'confirmModal',
  'regulationsModal',
  'wikiModal',
  'panelHelpModal',
  'exportModal',
  'historyDetailsModal',
  'groupSettingsModal'
];

modals.forEach(modalId => {
  try {
    const modal = document.getElementById(modalId);
    if (modal) {
      pass(`Модальное окно найдено: ${modalId}`);
      
      // Проверка структуры
      const hasContent = modal.querySelector('.modal-content') !== null;
      const hasHeader = modal.querySelector('.modal-header') !== null;
      const hasBody = modal.querySelector('.modal-body') !== null;
      
      if (hasContent && hasHeader && hasBody) {
        pass(`  └─ Структура ${modalId} корректна`);
      } else {
        warn(`  └─ Структура ${modalId} неполная`);
      }
    } else {
      fail(`Модальное окно НЕ найдено: ${modalId}`);
    }
  } catch(e) {
    fail(`Ошибка проверки ${modalId}: ${e.message}`);
  }
});

// ========================================
// БЛОК 10: ПРОВЕРКА ПУТЕЙ К ФАЙЛАМ
// ========================================
console.log('\n🔗 БЛОК 10: ПРОВЕРКА ПУТЕЙ В HTML');

try {
  const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  cssLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      if (href.startsWith('css/') || href.startsWith('./css/') || href.startsWith('/css/')) {
        pass(`Путь к CSS: ${href}`);
      } else {
        warn(`Возможно неправильный путь: ${href}`);
      }
    }
  });
  
  const jsScripts = Array.from(document.querySelectorAll('script[src]'));
  jsScripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src) {
      if (src.startsWith('js-new/') || src.startsWith('./js-new/') || src.startsWith('/js-new/')) {
        pass(`Путь к JS: ${src}`);
      } else {
        warn(`Возможно неправильный путь: ${src}`);
      }
    }
  });
} catch(e) {
  fail(`Ошибка проверки путей: ${e.message}`);
}

// ========================================
// БЛОК 11: ФУНКЦИОНАЛЬНЫЕ ТЕСТЫ
// ========================================
console.log('\n🧪 БЛОК 11: ФУНКЦИОНАЛЬНЫЕ ТЕСТЫ');

// Тест 1: Работа с textarea
try {
  const textarea = document.getElementById('simpleTriggersInput');
  if (textarea) {
    const oldValue = textarea.value;
    textarea.value = 'тест';
    
    if (textarea.value === 'тест') {
      pass('Textarea Simple Triggers работает');
    } else {
      fail('Textarea Simple Triggers НЕ работает');
    }
    
    textarea.value = oldValue; // Восстановить
  }
} catch(e) {
  fail(`Ошибка теста textarea: ${e.message}`);
}

// Тест 2: Проверка кнопки Convert
try {
  const btnConvert = document.getElementById('btnConvert');
  if (btnConvert) {
    if (!btnConvert.disabled) {
      pass('Кнопка Convert доступна');
    } else {
      warn('Кнопка Convert заблокирована');
    }
  }
} catch(e) {
  fail(`Ошибка проверки кнопки Convert: ${e.message}`);
}

// Тест 3: Проверка модального окна
try {
  const modal = document.getElementById('confirmModal');
  if (modal) {
    const isHidden = modal.getAttribute('aria-hidden') === 'true';
    if (isHidden) {
      pass('Confirm Modal скрыт по умолчанию');
    } else {
      warn('Confirm Modal видим (должен быть скрыт)');
    }
  }
} catch(e) {
  fail(`Ошибка проверки модального окна: ${e.message}`);
}

// ========================================
// БЛОК 12: ПРОВЕРКА БИБЛИОТЕК
// ========================================
console.log('\n📚 БЛОК 12: ПРОВЕРКА ВНЕШНИХ БИБЛИОТЕК');

try {
  if (typeof RussianNouns !== 'undefined' || typeof window.RussianNouns !== 'undefined') {
    pass('Библиотека russian-nouns загружена');
  } else {
    warn('Библиотека russian-nouns НЕ загружена');
  }
} catch(e) {
  warn(`russian-nouns не найдена (может не требоваться): ${e.message}`);
}

try {
  if (typeof Diagram !== 'undefined' || typeof window.Diagram !== 'undefined') {
    pass('Библиотека railroad-diagrams загружена');
  } else {
    warn('Библиотека railroad-diagrams НЕ загружена');
  }
} catch(e) {
  warn(`railroad-diagrams не найдена (для визуализатора): ${e.message}`);
}

// ========================================
// ИТОГОВЫЙ ОТЧЕТ
// ========================================
console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ');
console.log('='.repeat(60));
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);
console.log(`📝 Всего тестов: ${totalTests}`);

const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0.0';
console.log(`📈 Процент успеха: ${passRate}%`);
console.log('='.repeat(60));

if (failedTests === 0) {
  console.log('\n🎉 Отлично! Все тесты пройдены!');
} else if (failedTests < 10) {
  console.log('\n⚠️ Есть проблемы, но большинство компонентов работает');
} else if (failedTests < 30) {
  console.log('\n🔧 Требуется доработка - много ошибок');
} else {
  console.log('\n🚨 КРИТИЧНО! Приложение не работает');
}

console.log('\n📋 РЕКОМЕНДАЦИИ:');
if (failedTests > 0) {
  console.log('1. Проверь пути к CSS файлам в index.html');
  console.log('2. Проверь пути к JS модулям');
  console.log('3. Убедись, что все файлы на месте');
  console.log('4. Проверь консоль браузера на ошибки');
}

console.log('\n💾 СКОПИРУЙ ВЕСЬ ВЫВОД И ОТПРАВЬ РАЗРАБОТЧИКУ!');
console.log(`\n📊 ${passedTests}/${totalTests}`);

// Финальный вывод для парсинга
console.log(`FINAL: ${passedTests}/${totalTests} (${passRate}%)`);
