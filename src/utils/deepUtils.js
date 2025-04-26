/**
 * 深度複製和比較的工具函數
 */

/**
 * 深度複製一個物件或陣列
 * @param {*} obj - 要複製的物件或陣列
 * @returns {*} 複製後的物件或陣列
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 處理日期對象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // 處理陣列
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  // 處理對象
  const clonedObj = {};
  Object.keys(obj).forEach((key) => {
    clonedObj[key] = deepClone(obj[key]);
  });

  return clonedObj;
}

/**
 * 深度比較兩個物件或陣列是否相等
 * @param {*} obj1 - 第一個物件或陣列
 * @param {*} obj2 - 第二個物件或陣列
 * @returns {boolean} 是否相等
 */
export function deepCompare(obj1, obj2) {
  // 處理基本類型或引用相同
  if (obj1 === obj2) {
    return true;
  }

  // 如果其中一個為null或非對象，且它們不相等（由上面判斷）
  if (
    obj1 === null ||
    obj2 === null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    return false;
  }

  // 處理日期對象
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // 處理陣列
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }

    for (let i = 0; i < obj1.length; i++) {
      if (!deepCompare(obj1[i], obj2[i])) {
        return false;
      }
    }

    return true;
  }

  // 確保兩者都是對象或都是陣列
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  // 處理對象
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // 確保所有鍵都相同
  if (!keys1.every((key) => keys2.includes(key))) {
    return false;
  }

  // 比較每個鍵的值
  return keys1.every((key) => deepCompare(obj1[key], obj2[key]));
}

/**
 * 合併兩個物件，返回一個新物件
 * @param {Object} target - 目標物件
 * @param {Object} source - 源物件
 * @returns {Object} 合併後的新物件
 */
export function deepMerge(target, source) {
  const output = { ...target };

  if (!source) {
    return output;
  }

  Object.keys(source).forEach((key) => {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
}
