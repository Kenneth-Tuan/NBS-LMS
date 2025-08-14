import { reactive, ref } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { defineStore } from "pinia";

import applicationApi from "@/apis/application";
import { ApplicationType } from "@/enums/appEnums";

dayjs.extend(customParseFormat);

export const useApplicationStore = defineStore(
  "application",
  () => {
    const internshipApplicationForm = reactive({
      organization_name: "",
      organization_address: "",
      contact_person_name: "",
      contact_person_phone: "",
      contact_person_email: "",
      internship_date_range: [],
      internship_hours: "",
      internship_description: "",
    });

    const leaveApplicationForm = reactive({
      course_id: "",
      leave_type: "",
      leave_date_range: [],
      leave_reason: "",
      attachments: [],
    });

    const subsidyApplicationForm = reactive({
      subsidy_type: "",
      attachments: [],
    });

    const otherApplicationForm = reactive({
      other_application_id: "",
      attachments: [],
    });

    const applicationList = ref([]);
    const otherApplicationItems = ref([]);
    const loading = ref(false);

    /**
     * Reset all form fields to their initial empty state
     */

    const resetInternshipForm = () => {
      internshipApplicationForm.organization_name = "";
      internshipApplicationForm.organization_address = "";
      internshipApplicationForm.contact_person_name = "";
      internshipApplicationForm.contact_person_phone = "";
      internshipApplicationForm.contact_person_email = "";
      internshipApplicationForm.internship_date_range = [];
      internshipApplicationForm.internship_hours = "";
      internshipApplicationForm.internship_description = "";
    };

    const resetLeaveForm = () => {
      leaveApplicationForm.course_id = "";
      leaveApplicationForm.leave_type = "";
      leaveApplicationForm.leave_date_range = [];
      leaveApplicationForm.leave_reason = "";
      leaveApplicationForm.attachments = [];
    };

    const resetSubsidyForm = () => {
      subsidyApplicationForm.subsidy_type = "";
      subsidyApplicationForm.attachments = [];
    };

    const resetOtherForm = () => {
      otherApplicationForm.other_application_id = "";
      otherApplicationForm.attachments = [];
    };

    const submitInternshipForm = async () => {
      const internship_start_date = dayjs(
        internshipApplicationForm.internship_date_range[0]
      ).format("YYYY-MM-DDTHH:mm:ssZ");
      const internship_end_date = dayjs(
        internshipApplicationForm.internship_date_range[1]
      ).format("YYYY-MM-DDTHH:mm:ssZ");

      const formData = {
        ...internshipApplicationForm,
        internship_start_date: internship_start_date,
        internship_end_date: internship_end_date,
      };

      delete formData.internship_date_range;

      try {
        const submitResult = await applicationApi.applyInternship(formData);
        if (submitResult.status === 200) {
          return submitResult.data;
        } else {
          throw new Error(submitResult.message || "實習申請提交失敗");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    const submitLeaveForm = async () => {
      const leave_start_date = dayjs(
        leaveApplicationForm.leave_date_range[0]
      ).format("YYYY-MM-DDTHH:mm:ssZ");
      const leave_end_date = dayjs(
        leaveApplicationForm.leave_date_range[1]
      ).format("YYYY-MM-DDTHH:mm:ssZ");
      const attachments = leaveApplicationForm.attachments
        .filter((file) => file.isUploaded)
        .map((file) => file.url);

      const formData = {
        ...leaveApplicationForm,
        leave_start_date: leave_start_date,
        leave_end_date: leave_end_date,
        attachments,
      };

      delete formData.leave_date_range;

      try {
        const submitResult = await applicationApi.applyLeave(formData);
        if (submitResult.status === 200) {
          return submitResult.data;
        } else {
          throw new Error(submitResult.message || "請假申請提交失敗");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    const submitSubsidyForm = async () => {
      const attachments = subsidyApplicationForm.attachments
        .filter((file) => file.isUploaded)
        .map((file) => file.url);

      const formData = {
        ...subsidyApplicationForm,
        attachments,
      };

      try {
        const submitResult = await applicationApi.applySubsidy(formData);
        if (submitResult.status === 200) {
          return submitResult.data;
        } else {
          throw new Error(submitResult.message || "補助申請提交失敗");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    const submitOtherForm = async () => {
      const attachments = otherApplicationForm.attachments
        .filter((file) => file.isUploaded)
        .map((file) => file.url);

      const formData = {
        ...otherApplicationForm,
        attachments,
      };

      try {
        const submitResult = await applicationApi.applyOthers(formData);
        if (submitResult.status === 200) {
          return submitResult.data;
        } else {
          throw new Error(submitResult.message || "其他申請提交失敗");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        throw error;
      }
    };

    /**
     * Fetch the application list from the API
     */
    const getApplicationList = async (
      applicationType = "all",
      page = 1,
      page_size = 30
    ) => {
      loading.value = true;

      try {
        const params = {
          paged_info: {
            page,
            page_size,
          },
          filter: {
            type: applicationType,
          },
        };
        const response = await applicationApi.getApplicationList(params);
        if (response.status === 200) {
          const {
            data: {
              data: { list },
            },
          } = response;
          applicationList.value = list;
        } else {
          throw new Error(response.message || "獲取申請列表失敗");
        }
      } catch (err) {
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const fetchOtherApplicationItems = async () => {
      if (otherApplicationItems.value.length > 0) return;
      try {
        const response = await applicationApi.getOthersApplicationList();
        if (response.status === 200) {
          const {
            data: {
              data: { list },
            },
          } = response;
          otherApplicationItems.value = list;
        } else {
          throw new Error(response.message || "獲取其他申請列表失敗");
        }
      } catch (err) {
        throw err;
      }
    };

    const getApplicationDetail = async (id, applicationType) => {
      try {
        let response = null;
        if (applicationType === ApplicationType.Internship) {
          response = await applicationApi.getInternshipDetail(id);
        } else if (applicationType === ApplicationType.Leave) {
          response = await applicationApi.getLeaveDetail(id);
        } else if (applicationType === ApplicationType.Subsidy) {
          response = await applicationApi.getSubsidyDetail(id);
        } else if (applicationType === ApplicationType.Others) {
          response = await applicationApi.getOthersDetail(id);
        }

        if (response.status === 200) {
          const {
            data: { data },
          } = response;
          data.info.attachments = data.info.attachments.map((file) => {
            if (!file) return null;
            const fileName = file?.split("_").pop();
            const fileType = fileName?.split(".").pop();

            return {
              uid: "-1",
              name: fileName,
              status: "done",
              url: file,
              fileType,
              isUploaded: true,
            };
          });
          return data;
        } else {
          throw new Error(response.message || "獲取申請詳細資訊失敗");
        }
      } catch (err) {
        throw err;
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
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const reviewApplication = async (
      application_id,
      applicationType,
      reviewData = {}
    ) => {
      if (
        !application_id ||
        !applicationType ||
        !reviewData.action ||
        !reviewData.note
      ) {
        throw new Error("參數不完整");
      }

      try {
        loading.value = true;

        const params = {
          type: applicationType,
          action: reviewData.action,
          note: reviewData.note,
        };

        const response = await applicationApi.reviewApplication(
          application_id,
          params
        );
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error(response.message || "審核申請失敗");
        }
      } catch (err) {
        throw err;
      } finally {
        loading.value = false;
      }
    };

    return {
      internshipApplicationForm,
      leaveApplicationForm,
      subsidyApplicationForm,
      otherApplicationForm,
      applicationList,
      otherApplicationItems,
      loading,

      resetInternshipForm,
      resetLeaveForm,
      resetSubsidyForm,
      resetOtherForm,
      submitInternshipForm,
      submitLeaveForm,
      submitSubsidyForm,
      submitOtherForm,
      getApplicationList,
      getApplicationDetail,
      updateApplicationStatus,
      fetchOtherApplicationItems,
      reviewApplication,
    };
  },
  {
    persist: false,
  }
);
