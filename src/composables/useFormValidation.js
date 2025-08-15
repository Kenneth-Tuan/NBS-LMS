import { ref, computed } from "vue";

/**
 * 表單驗證composable
 * @param {Object} initialValues - 表單初始值
 * @param {Object} validationSchema - 驗證規則模式
 * @returns {Object} 表單驗證方法和狀態
 */
export function useFormValidation(initialValues = {}, validationSchema = {}) {
  // 表單數據和錯誤
  const values = ref({ ...initialValues });
  const errors = ref({});
  const touched = ref({});

  // 表單是否有效
  const isValid = computed(() => Object.keys(errors.value).length === 0);

  // 設置表單字段值
  const setValue = (field, value) => {
    values.value[field] = value;
    validate(field);
  };

  // 標記字段為已觸碰
  const setTouched = (field) => {
    touched.value[field] = true;
    validate(field);
  };

  // 驗證單個字段
  const validate = (field) => {
    if (!validationSchema[field]) return;

    const value = values.value[field];
    const fieldSchema = validationSchema[field];

    // 清除現有錯誤
    if (errors.value[field]) {
      delete errors.value[field];
    }

    // 必填項驗證
    if (
      fieldSchema.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      errors.value[field] = fieldSchema.required;
      return;
    }

    // 最小長度驗證
    if (fieldSchema.minLength && value.length < fieldSchema.minLength.value) {
      errors.value[field] = fieldSchema.minLength.message;
      return;
    }

    // 模式匹配驗證
    if (fieldSchema.pattern && !fieldSchema.pattern.value.test(value)) {
      errors.value[field] = fieldSchema.pattern.message;
      return;
    }

    // 自定義驗證函數
    if (fieldSchema.validator && typeof fieldSchema.validator === "function") {
      const customError = fieldSchema.validator(value, values.value);
      if (customError) {
        errors.value[field] = customError;
        return;
      }
    }
  };

  // 驗證整個表單
  const validateForm = () => {
    Object.keys(validationSchema).forEach((field) => {
      validate(field);
      touched.value[field] = true;
    });

    return isValid.value;
  };

  // 重置表單
  const resetForm = () => {
    values.value = { ...initialValues };
    errors.value = {};
    touched.value = {};
  };

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validate,
    validateForm,
    resetForm,
  };
}
