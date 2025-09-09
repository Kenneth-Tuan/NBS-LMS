import { ref } from "vue";

import { UserStatus } from "@/enums/appEnums";

// Initial state for the user form
export const initialUserFormState = () =>
  ref({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: null,
    status: UserStatus.Active,
    password: "",
    confirmPassword: "",
  });

// Password validator function
export function validatePasswordConfirmation(formRef) {
  return (rule, value) => {
    // Only validate if password field has value
    if (formRef.value.password && value !== formRef.value.password) {
      return Promise.reject("兩次輸入的密碼不一致");
    }
    return Promise.resolve();
  };
}

// Form validation rules
export const getUserFormRules = (formRef, formMode) => ({
  name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入有效的電子郵件", trigger: "blur" },
  ],
  role: [{ required: true, message: "請選擇角色", trigger: "change" }],
  phone: [
    { required: true, message: "請輸入電話", trigger: "blur" },
    {
      validator: (rule, value, cb) => {
        if (value.length !== 10) {
          return cb(true);
        }
        if (Number.isNaN(Number(value))) {
          return cb(true);
        }
        return cb();
      },
      message: "請輸入有效的電話號碼",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: formMode.value === "create",
      message: "請輸入密碼",
      trigger: "blur",
    },
    // Add complexity rules if needed, e.g., length, characters
    // { min: 8, message: '密碼長度至少8位', trigger: 'blur' }
  ],
  confirmPassword: [
    {
      // Required only if password is also required (i.e., in create mode or if password field is filled)
      required: formMode.value === "create" || !!formRef.value.password,
      message: "請確認密碼",
      trigger: "blur",
    },
    {
      validator: validatePasswordConfirmation(formRef),
      trigger: ["blur", "change"],
    }, // Validate on blur and change
  ],
});
