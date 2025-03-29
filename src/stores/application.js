import { reactive, ref } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { defineStore } from "pinia";
import { saveApplication } from "@/mocks/domains/applications/model";

dayjs.extend(customParseFormat);

export const useApplicationStore = defineStore(
  "application",
  () => {
    const applicationForm = reactive({
      name: {
        value: "",
        err: false,
        errMsg: "",
        maxLength: 4,
        required: true,
        label: "姓名",
      },
      id: {
        value: "",
        err: false,
        errMsg: "",
        maxLength: 999,
        required: true,
        label: "學號",
      },
      email: {
        value: "",
        err: false,
        errMsg: "",
        maxLength: 999,
        required: true,
        label: "Email",
      },
      tel: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "電話",
        mask: "####-###-###",
      },
      applicationDate: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        mask: "####/##/##",
        rules: [(val) => !!val && dayjs(val, "YYYY/MM/DD", true)],
        label: "申請日期",
      },
      // fromDate: {
      //   value: "",
      //   err: false,
      //   errMsg: "",
      //   required: true,
      //   mask: "####/##/##",
      // },
      // toDate: {
      //   value: "",
      //   err: false,
      //   errMsg: "",
      //   mask: "####/##/##",
      //   required: true,
      // },
      internshipProviderName: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習機構名稱",
      },
      internshipProviderAddress: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習機構地址",
      },
      internshipProviderContactPerson: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習機構聯絡人",
      },
      internshipProviderContactPersonTel: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習機構聯絡人電話",
        mask: "####-###-###",
      },
      internshipProviderContactPersonEmail: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習機構聯絡人Email",
      },
      internshipStartDate: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        mask: "####/##/##",
        label: "實習開始日期",
      },
      internshipEndDate: {
        value: "",
        err: false,
        errMsg: "",
        mask: "####/##/##",
        required: true,
        label: "實習結束日期",
      },
      internshipHours: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習時數",
      },
      internshipOverview: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "實習概述",
      },
      subsidyType: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        options: [
          {
            label: "學費補助",
            value: "type1",
          },
          {
            label: "住宿補助",
            value: "type2",
          },
          {
            label: "交通補助",
            value: "type3",
          },
          {
            label: "其他補助",
            value: "type4",
          },
        ],
        label: "補助類型",
      },
      subsidyAmount: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "補助金額",
      },
      receipts: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "收據",
      },
      supportingDocuments: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "證明文件",
      },
      supplementaryMaterials: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "相關附件",
      },
      leaveStartDate: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        mask: "####/##/##",
        label: "休假開始日期",
      },
      leaveEndDate: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        mask: "####/##/##",
        label: "休假結束日期",
      },
      reasonForLeave: {
        value: "",
        err: false,
        errMsg: "",
        required: true,
        label: "休假原因",
      },
    });

    const applicationList = ref([]);
    const loading = ref(false);
    const error = ref(null);

    /**
     * Reset all form fields to their initial empty state
     */
    const resetForm = () => {
      // Loop through all form fields and reset their values
      Object.keys(applicationForm).forEach((key) => {
        applicationForm[key].value = "";
        applicationForm[key].err = false;
        applicationForm[key].errMsg = "";
      });
    };

    /**
     * Submit the application form
     * @param {string} type - The type of application (internship, leave, subsidy)
     * @returns {Promise} A promise that resolves when the form is submitted
     */
    const submitForm = async (type) => {
      try {
        // Validate the form first
        const isValid = validateForm(type);
        if (!isValid) {
          throw new Error("表單驗證失敗");
        }

        // Prepare the application data
        const formData = {};

        // Get the appropriate fields for this application type
        const fields =
          type === "internship"
            ? intershipApplicationForm
            : type === "leave"
            ? leaveApplicationForm
            : subsidyApplicationForm;

        // Extract field values
        fields.forEach((fieldName) => {
          formData[fieldName] = applicationForm[fieldName].value;
        });

        // Add application type
        formData.type = type;

        // Add studentId field from id field
        formData.studentId = applicationForm.id.value;

        // Save to session storage
        const savedApplication = saveApplication(formData);

        // Reset the form after successful submission
        resetForm();

        return savedApplication;
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    /**
     * Validate the form fields for the given type
     * @param {string} type - The type of application (internship, leave, subsidy)
     * @returns {boolean} Whether the form is valid
     */
    const validateForm = (type) => {
      // Determine which fields to validate based on the application type
      const fieldsToValidate =
        type === "internship"
          ? intershipApplicationForm
          : type === "leave"
          ? leaveApplicationForm
          : subsidyApplicationForm;

      let isValid = true;

      // Check each required field
      fieldsToValidate.forEach((fieldName) => {
        const field = applicationForm[fieldName];

        // Skip if the field doesn't exist
        if (!field) return;

        // Reset error status
        field.err = false;
        field.errMsg = "";

        // Check if required and empty
        if (field.required && !field.value) {
          field.err = true;
          field.errMsg = `${field.label}為必填欄位`;
          isValid = false;
        }

        // Check custom validation rules if provided
        if (field.rules && field.value) {
          for (const rule of field.rules) {
            const result = rule(field.value);
            if (!result) {
              field.err = true;
              field.errMsg = `${field.label}格式不正確`;
              isValid = false;
              break;
            }
          }
        }
      });

      return isValid;
    };

    /**
     * Fetch the application list from the API
     */
    const getApplicationList = async () => {
      loading.value = true;
      error.value = null;

      try {
        // 從 API 獲取應用數據
        const response = await fetch("/applicationList");
        const data = await response.json();

        if (data.success) {
          applicationList.value.length = 0; // 清空當前列表

          // 合併應用數據和會話存儲數據
          const applications = data.data;

          // 添加所有應用數據到列表
          applications.forEach((app) => {
            applicationList.value.push(app);
          });
        } else {
          error.value = data.message || "獲取申請列表失敗";
          throw new Error(error.value);
        }
      } catch (err) {
        error.value = err.message || "獲取申請列表時發生錯誤";
        throw err;
      } finally {
        loading.value = false;
      }
    };

    /**
     * Update an application's status
     * @param {string} id - The application ID
     * @param {string} status - The new status (PENDING, APPROVED, REJECTED)
     * @param {Object} reviewData - Additional review data (reviewer, reviewDate, reviewComment)
     * @returns {Object} The updated application
     */
    const updateApplicationStatus = async (id, status, reviewData = {}) => {
      try {
        loading.value = true;
        error.value = null;

        // Find the application in the list
        const appIndex = applicationList.value.findIndex(
          (app) => app.id === id
        );
        if (appIndex === -1) {
          throw new Error(`找不到 ID 為 ${id} 的申請`);
        }

        // Create updated application
        const updatedApp = {
          ...applicationList.value[appIndex],
          status,
          ...reviewData,
        };

        applicationList.value[appIndex] = updatedApp;

        return updatedApp;
      } catch (err) {
        error.value = err.message || "更新申請狀態時發生錯誤";
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      applicationForm,
      intershipApplicationForm,
      leaveApplicationForm,
      subsidyApplicationForm,
      applicationList,
      loading,
      error,

      resetForm,
      submitForm,
      getApplicationList,
      updateApplicationStatus,
    };
  },
  {
    persist: false,
  }
);

const intershipApplicationForm = [
  "name",
  "id",
  "email",
  "tel",
  "internshipProviderName",
  "internshipProviderAddress",
  "internshipProviderContactPerson",
  "internshipProviderContactPersonTel",
  "internshipProviderContactPersonEmail",
  "internshipStartDate",
  "internshipEndDate",
  "internshipHours",
  "internshipOverview",
];

const leaveApplicationForm = [
  "name",
  "id",
  "email",
  "tel",
  "leaveStartDate",
  "leaveEndDate",
  "reasonForLeave",
  "supplementaryMaterials",
];

const subsidyApplicationForm = [
  "name",
  "id",
  "email",
  "tel",
  "subsidyType",
  "subsidyAmount",
  "receipts",
  "supportingDocuments",
  "supplementaryMaterials",
];
