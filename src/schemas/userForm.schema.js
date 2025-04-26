/**
 * 用戶表單schema - 定義表單欄位、驗證規則和映射轉換
 */

// 表單欄位定義和驗證規則
export const userFormSchema = {
  username: {
    label: "用戶名",
    required: "用戶名為必填項",
    minLength: {
      value: 3,
      message: "用戶名最少需要3個字符",
    },
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message: "用戶名只能包含字母、數字和下劃線",
    },
  },
  email: {
    label: "電子郵件",
    required: "電子郵件為必填項",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "請輸入有效的電子郵件地址",
    },
  },
  password: {
    label: "密碼",
    required: "密碼為必填項",
    minLength: {
      value: 8,
      message: "密碼最少需要8個字符",
    },
    validator: (value) => {
      if (!/[A-Z]/.test(value)) {
        return "密碼需要至少一個大寫字母";
      }
      if (!/[0-9]/.test(value)) {
        return "密碼需要至少一個數字";
      }
      return null;
    },
  },
  confirmPassword: {
    label: "確認密碼",
    required: "請確認密碼",
    validator: (value, formValues) => {
      if (value !== formValues.password) {
        return "兩次輸入的密碼不一致";
      }
      return null;
    },
  },
  role: {
    label: "角色",
    required: "請選擇角色",
  },
};

// API數據映射到表單數據
export const apiToFormMapper = (apiData) => {
  return {
    username: apiData.username || "",
    email: apiData.email || "",
    role: apiData.role || "",
  };
};

// 表單數據映射到API數據
export const formToApiMapper = (formData) => {
  const apiData = {
    username: formData.username,
    email: formData.email,
    role: formData.role,
  };

  // 只有在新增用戶時才包含密碼
  if (formData.password) {
    apiData.password = formData.password;
  }

  return apiData;
};
