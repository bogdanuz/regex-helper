/**
 * validation.js
 * Модуль валидации входных данных для RegexHelper v4.0
 * Проверка лимитов, пустых значений, корректности данных
 */

/**
 * Константы лимитов
 */
const LIMITS = {
  MAX_GROUPS: 15,
  MAX_SUBGROUPS: 15,
  MAX_TRIGGERS_IN_SUBGROUP: 100,
  MAX_SIMPLE_TRIGGERS: 1000,
  MIN_DISTANCE: 1,
  MAX_DISTANCE: 10000,
  MIN_ROOT_LENGTH: 2,
  MAX_ROOT_LENGTH: 10,
  MAX_HISTORY_ITEMS: 100
};

/**
 * Валидация количества групп
 * @param {number} count - Текущее количество групп
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateGroupCount(count) {
  if (typeof count !== 'number' || count < 0) {
    return {
      valid: false,
      error: 'Некорректное количество групп'
    };
  }

  if (count >= LIMITS.MAX_GROUPS) {
    return {
      valid: false,
      error: `Максимум ${LIMITS.MAX_GROUPS} групп`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация количества подгрупп в группе
 * @param {number} count - Текущее количество подгрупп
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateSubgroupCount(count) {
  if (typeof count !== 'number' || count < 0) {
    return {
      valid: false,
      error: 'Некорректное количество подгрупп'
    };
  }

  if (count >= LIMITS.MAX_SUBGROUPS) {
    return {
      valid: false,
      error: `Максимум ${LIMITS.MAX_SUBGROUPS} подгрупп в группе`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация количества триггеров в подгруппе
 * @param {number} count - Текущее количество триггеров
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateTriggerCount(count) {
  if (typeof count !== 'number' || count < 0) {
    return {
      valid: false,
      error: 'Некорректное количество триггеров'
    };
  }

  if (count >= LIMITS.MAX_TRIGGERS_IN_SUBGROUP) {
    return {
      valid: false,
      error: `Максимум ${LIMITS.MAX_TRIGGERS_IN_SUBGROUP} триггеров в подгруппе`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация количества простых триггеров
 * @param {number} count - Количество простых триггеров
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateSimpleTriggerCount(count) {
  if (typeof count !== 'number' || count < 0) {
    return {
      valid: false,
      error: 'Некорректное количество триггеров'
    };
  }

  if (count > LIMITS.MAX_SIMPLE_TRIGGERS) {
    return {
      valid: false,
      error: `Максимум ${LIMITS.MAX_SIMPLE_TRIGGERS} простых триггеров`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация текста триггера
 * @param {string} text - Текст триггера
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateTriggerText(text) {
  if (typeof text !== 'string') {
    return {
      valid: false,
      error: 'Триггер должен быть строкой'
    };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Триггер не может быть пустым'
    };
  }

  if (trimmed.length > 200) {
    return {
      valid: false,
      error: 'Триггер слишком длинный (макс. 200 символов)'
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация distance (min/max)
 * @param {number} min - Минимальное расстояние
 * @param {number} max - Максимальное расстояние
 * @returns {Object} {valid: boolean, error: string|null, warning: string|null}
 */
export function validateDistance(min, max) {
  // Проверка типов
  if (typeof min !== 'number' || typeof max !== 'number') {
    return {
      valid: false,
      error: 'Расстояние должно быть числом',
      warning: null
    };
  }

  // Проверка минимума
  if (min < LIMITS.MIN_DISTANCE) {
    return {
      valid: false,
      error: `Минимальное расстояние: ${LIMITS.MIN_DISTANCE}`,
      warning: null
    };
  }

  // Проверка максимума
  if (max > LIMITS.MAX_DISTANCE) {
    return {
      valid: false,
      error: `Максимальное расстояние: ${LIMITS.MAX_DISTANCE}`,
      warning: null
    };
  }

  // Проверка min <= max
  if (min > max) {
    return {
      valid: false,
      error: 'Минимум не может быть больше максимума',
      warning: null
    };
  }

  // Предупреждение для больших значений
  let warning = null;
  if (max > 1000) {
    warning = 'Большое расстояние может замедлить поиск';
  }

  return { valid: true, error: null, warning };
}

/**
 * Валидация длины общего корня
 * @param {number} length - Длина корня
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateRootLength(length) {
  if (typeof length !== 'number' || length < 0) {
    return {
      valid: false,
      error: 'Некорректная длина корня'
    };
  }

  if (length < LIMITS.MIN_ROOT_LENGTH) {
    return {
      valid: false,
      error: `Минимальная длина корня: ${LIMITS.MIN_ROOT_LENGTH} символа`
    };
  }

  if (length > LIMITS.MAX_ROOT_LENGTH) {
    return {
      valid: false,
      error: `Максимальная длина корня: ${LIMITS.MAX_ROOT_LENGTH} символов`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация индексов опциональных символов
 * @param {Array<number>} indices - Индексы символов
 * @param {number} textLength - Длина текста триггера
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateOptionalIndices(indices, textLength) {
  if (!Array.isArray(indices)) {
    return {
      valid: false,
      error: 'Индексы должны быть массивом'
    };
  }

  // Проверка: минимум 1 символ обязательный
  if (indices.length >= textLength) {
    return {
      valid: false,
      error: 'Минимум 1 символ должен быть обязательным'
    };
  }

  // Проверка корректности индексов
  for (const index of indices) {
    if (typeof index !== 'number' || index < 0 || index >= textLength) {
      return {
        valid: false,
        error: `Некорректный индекс: ${index}`
      };
    }
  }

  // Проверка уникальности
  const unique = new Set(indices);
  if (unique.size !== indices.length) {
    return {
      valid: false,
      error: 'Индексы должны быть уникальными'
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация префикса
 * @param {string} prefix - Префикс
 * @param {string} triggerText - Полный текст триггера
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validatePrefix(prefix, triggerText) {
  if (typeof prefix !== 'string') {
    return {
      valid: false,
      error: 'Префикс должен быть строкой'
    };
  }

  const trimmed = prefix.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'Префикс не может быть пустым'
    };
  }

  if (trimmed.length >= triggerText.length) {
    return {
      valid: false,
      error: 'Префикс не может быть длиннее триггера'
    };
  }

  if (!triggerText.startsWith(trimmed)) {
    return {
      valid: false,
      error: 'Префикс должен совпадать с началом триггера'
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация количества записей в истории
 * @param {number} count - Количество записей
 * @returns {Object} {valid: boolean, error: string|null}
 */
export function validateHistoryCount(count) {
  if (typeof count !== 'number' || count < 0) {
    return {
      valid: false,
      error: 'Некорректное количество записей'
    };
  }

  if (count > LIMITS.MAX_HISTORY_ITEMS) {
    return {
      valid: false,
      error: `Максимум ${LIMITS.MAX_HISTORY_ITEMS} записей в истории`
    };
  }

  return { valid: true, error: null };
}

/**
 * Валидация структуры группы (связанные триггеры)
 * @param {Object} group - Объект группы
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validateGroup(group) {
  const errors = [];

  // Проверка наличия обязательных полей
  if (!group.id) {
    errors.push('Группа должна иметь ID');
  }

  if (!group.name) {
    errors.push('Группа должна иметь название');
  }

  // Проверка подгрупп
  if (!Array.isArray(group.subgroups)) {
    errors.push('Подгруппы должны быть массивом');
  } else {
    if (group.subgroups.length === 0) {
      errors.push('Группа должна содержать хотя бы одну подгруппу');
    }

    // Валидация каждой подгруппы
    group.subgroups.forEach((subgroup, index) => {
      const subgroupErrors = validateSubgroup(subgroup);
      if (!subgroupErrors.valid) {
        errors.push(`Подгруппа ${index + 1}: ${subgroupErrors.errors.join(', ')}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Валидация структуры подгруппы
 * @param {Object} subgroup - Объект подгруппы
 * @returns {Object} {valid: boolean, errors: Array<string>}
 */
export function validateSubgroup(subgroup) {
  const errors = [];

  // Проверка наличия обязательных полей
  if (!subgroup.id) {
    errors.push('Подгруппа должна иметь ID');
  }

  if (!subgroup.name) {
    errors.push('Подгруппа должна иметь название');
  }

  // Проверка триггеров
  if (!Array.isArray(subgroup.triggers)) {
    errors.push('Триггеры должны быть массивом');
  } else {
    if (subgroup.triggers.length === 0) {
      errors.push('Подгруппа должна содержать хотя бы один триггер');
    }

    // Проверка каждого триггера
    subgroup.triggers.forEach((trigger, index) => {
      const validation = validateTriggerText(trigger);
      if (!validation.valid) {
        errors.push(`Триггер ${index + 1}: ${validation.error}`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Экспорт лимитов для использования в других модулях
 */
export { LIMITS };
