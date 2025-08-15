import { dummyApplicationData } from "./data";

/**
 * Retrieves the list of applications, combining dummy data with any saved in session storage
 * @returns {Array} Combined list of applications
 */
export const getApplicationList = () => {
  // Get applications from dummy data
  const applications = [...dummyApplicationData];

  // Check if there are any applications saved in session storage
  try {
    const sessionApplications = JSON.parse(
      sessionStorage.getItem("userApplications") || "[]"
    );
    if (sessionApplications.length > 0) {
      // Add the session applications to the list
      applications.push(...sessionApplications);
    }
  } catch (error) {
    console.error("Error retrieving applications from session storage:", error);
  }

  return applications;
};

/**
 * Saves a new application to session storage
 * @param {Object} application The application data to save
 */
export const saveApplication = (application) => {
  try {
    // Get existing applications from session storage
    const existingApplications = JSON.parse(
      sessionStorage.getItem("userApplications") || "[]"
    );

    // Generate a unique ID for the application based on type
    const now = new Date();
    const year = now.getFullYear();
    const idPrefix =
      application.type === "internship"
        ? "INT"
        : application.type === "leave"
        ? "LEA"
        : "SUB";

    // Simple ID generation (in reality, this should be more robust)
    const count = existingApplications.length + 1;
    const id = `${idPrefix}-${year}-${count.toString().padStart(3, "0")}`;

    // Add additional fields to the application
    const newApplication = {
      ...application,
      id,
      applicationDate: now.toISOString().split("T")[0].replace(/-/g, "/"),
      status: 0, // Pending
      reviewDate: "",
      reviewer: "",
    };

    // Add to the existing applications and save back to session storage
    existingApplications.push(newApplication);
    sessionStorage.setItem(
      "userApplications",
      JSON.stringify(existingApplications)
    );

    return newApplication;
  } catch (error) {
    console.error("Error saving application to session storage:", error);
    throw error;
  }
};

// 更新申請狀態
export const updateApplication = (
  applicationId,
  newStatus,
  reviewData = {}
) => {
  try {
    // 獲取已保存的申請列表
    const savedApplications = JSON.parse(
      sessionStorage.getItem("userApplications") || "[]"
    );

    // 尋找要更新的申請
    const appIndex = savedApplications.findIndex(
      (app) => app.id === applicationId
    );

    if (appIndex === -1) {
      // 從基本數據中尋找
      const allApplications = getApplicationList();
      const baseApp = allApplications.find((app) => app.id === applicationId);

      if (!baseApp) {
        throw new Error(`找不到 ID 為 ${applicationId} 的申請`);
      }

      // 更新狀態並加入審核數據
      const updatedApp = {
        ...baseApp,
        status: newStatus,
        ...reviewData,
      };

      // 添加到保存的申請中
      savedApplications.push(updatedApp);
    } else {
      // 更新現有申請
      savedApplications[appIndex] = {
        ...savedApplications[appIndex],
        status: newStatus,
        ...reviewData,
      };
    }

    // 保存回 sessionStorage
    sessionStorage.setItem(
      "userApplications",
      JSON.stringify(savedApplications)
    );

    // 返回更新後的申請列表
    return getApplicationList();
  } catch (error) {
    console.error("更新申請狀態出錯:", error);
    throw error;
  }
};
