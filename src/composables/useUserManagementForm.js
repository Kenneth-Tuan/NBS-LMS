import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useUserManagementStore } from "@/stores/userManagement";
import { getUserFormRules } from "@/schemas/userManagementForm.schema";
import { roleOptions, statusOptions } from "@/utils/mappers"; // Import options

export function useUserManagementForm() {
  const store = useUserManagementStore();
  const formRef = ref(null); // For ant design form instance

  const { userForm, formVisible, formMode, formLoading } = storeToRefs(store);
  const { submitForm, hideForm } = store;

  const formTitle = computed(() =>
    formMode.value === "create" ? "新增使用者" : "編輯使用者"
  );

  const formRules = computed(() => getUserFormRules(userForm, formMode));

  // --- Form Actions ---
  const handleFormSubmit = async () => {
    try {
      await formRef.value.validate(); // Validate Ant Design form
      await submitForm(); // Call store action to submit data
      formRef.value.resetFields(); // Reset fields on success
    } catch (errorInfo) {
      console.log("Form validation failed:", errorInfo);
      // Error message is handled within the store's submitForm action
    }
  };

  const handleFormCancel = () => {
    hideForm();
    formRef.value.resetFields(); // Reset fields on cancel
  };

  return {
    // Form state refs from store
    userForm,
    formVisible,
    formMode,
    formLoading,

    // Computed
    formTitle,
    formRules,

    // Static options for dropdowns
    roleOptions,
    statusOptions,

    // Form ref for validation
    formRef,

    // Methods
    handleFormSubmit,
    handleFormCancel,
  };
}
