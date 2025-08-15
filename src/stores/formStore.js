import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiToFormMapper, formToApiMapper } from "../schemas/userForm.schema";
import { apiService } from "../services/api.service";

/**
 * 表單狀態管理，包含錯誤處理
 */
export const useFormStore = defineStore("form", () => {
  // 表單數據
  const formData = ref({});
  // 表單錯誤
  const formErrors = ref({});
  // 表單提交狀態
  const isSubmitting = ref(false);
  // 表單保存成功
  const saveSuccess = ref(false);

  // 當前表單是否有效
  const isFormValid = computed(
    () => Object.keys(formErrors.value).length === 0
  );

  /**
   * 初始化表單數據
   */
  const initForm = (initialData = {}) => {
    formData.value = { ...initialData };
    formErrors.value = {};
    isSubmitting.value = false;
    saveSuccess.value = false;
  };

  /**
   * 從API加載表單數據
   */
  const loadFormData = async (id) => {
    try {
      isSubmitting.value = true;
      const response = await apiService.get(`/users/${id}`);
      formData.value = apiToFormMapper(response);
      formErrors.value = {};
    } catch (error) {
      formErrors.value._global = "載入資料失敗";
      console.error("載入表單數據錯誤:", error);
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * 更新表單字段
   */
  const updateField = (field, value) => {
    formData.value[field] = value;
    // 清除該字段的錯誤
    if (formErrors.value[field]) {
      delete formErrors.value[field];
    }
  };

  /**
   * 設置表單錯誤
   */
  const setError = (field, error) => {
    formErrors.value[field] = error;
  };

  /**
   * 提交表單
   */
  const submitForm = async () => {
    try {
      isSubmitting.value = true;
      const apiData = formToApiMapper(formData.value);

      // 根據是否有ID決定創建或更新
      if (formData.value.id) {
        await apiService.put(`/users/${formData.value.id}`, apiData);
      } else {
        await apiService.post("/users", apiData);
      }

      saveSuccess.value = true;
      return true;
    } catch (error) {
      formErrors.value._global = "保存失敗";
      if (error.response?.data?.errors) {
        // 處理後端傳回的表單錯誤
        Object.entries(error.response.data.errors).forEach(
          ([field, message]) => {
            formErrors.value[field] = message;
          }
        );
      }
      console.error("提交表單錯誤:", error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };

  /**
   * 重置表單
   */
  const resetForm = () => {
    initForm();
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    saveSuccess,
    isFormValid,
    initForm,
    loadFormData,
    updateField,
    setError,
    submitForm,
    resetForm,
  };
});
