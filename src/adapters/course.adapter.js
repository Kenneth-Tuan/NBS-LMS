/**
 * Course Adapter - Maps between API and Frontend field names
 */

// API to Frontend field mapping
const apiToFrontendMap = {
  name: "title",
  class_mode: "classMode",
  duration: "duration",
  credit: "credit",
  teacher_id: "instructor",
  start_date: "startDate",
  end_date: "endDate",
  enrollment_limit: "enrollmentLimit",
  weekly_schedule: "weeklySchedule",
  prerequisite_course_ids: "prerequisites",
  description: "description",
  outline_files: "outlineFile",
  code: "code",
  prerequisite_course_codes: "prerequisite_course_codes",
  required_for_departments: "required_for_departments",
};

// Frontend to API field mapping (reverse mapping)
const frontendToApiMap = {
  title: "name",
  classMode: "class_mode",
  duration: "duration",
  credit: "credit",
  instructor: "teacher_id",
  startDate: "start_date",
  endDate: "end_date",
  enrollmentLimit: "enrollment_limit",
  weeklySchedule: "weekly_schedule",
  prerequisites: "prerequisite_course_ids",
  description: "description",
  outlineFile: "outline_files",
  code: "code",
  prerequisite_course_codes: "prerequisite_course_codes",
  required_for_departments: "required_for_departments",
};

/**
 * Convert API response to Frontend format
 * @param {Object} apiData - Data from API
 * @returns {Object} - Data formatted for frontend
 */
export const apiToFrontend = (apiData) => {
  if (!apiData) return null;

  // Handle array of courses
  if (Array.isArray(apiData)) {
    return apiData.map((course) => apiToFrontend(course));
  }

  const frontendData = {};

  Object.entries(apiData).forEach(([apiKey, value]) => {
    const frontendKey = apiToFrontendMap[apiKey];

    if (frontendKey && value !== null && value !== "" && value !== undefined) {
      // No special handling for weekly_schedule - keep the same structure
      frontendData[frontendKey] = value;
    }
  });

  return frontendData;
};

/**
 * Convert Frontend data to API format
 * @param {Object} frontendData - Data from frontend
 * @returns {Object} - Data formatted for API
 */
export const frontendToApi = (frontendData) => {
  if (!frontendData) return null;

  // Handle array of courses
  if (Array.isArray(frontendData)) {
    return frontendData.map((course) => frontendToApi(course));
  }

  const apiData = {};

  Object.entries(frontendData).forEach(([frontendKey, value]) => {
    const apiKey = frontendToApiMap[frontendKey];

    if (apiKey) {
      apiData[apiKey] = value;
    } else {
      // Keep fields that don't have mapping
      apiData[frontendKey] = value;
    }
  });

  return apiData;
};

// Export adapter functions
export default {
  apiToFrontend,
  frontendToApi,
};
