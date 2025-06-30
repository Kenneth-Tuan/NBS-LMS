import { baseApiHelper } from "@/utils/axios";

export default {
  getUserProfile() {
    return baseApiHelper.get("/userprofile");
  },

  // Get all users with pagination and filtering
  getUsers(params) {
    return baseApiHelper.get("/users", { params });
  },

  // Get a specific user by ID
  getUser(id) {
    return baseApiHelper.get(`/users/${id}`);
  },

  // Create a new user
  createUser(data) {
    return baseApiHelper.post("/users", data);
  },

  // Update an existing user
  updateUser(data) {
    return baseApiHelper.put(`/users/${data.id}`, data);
  },

  // Delete a user
  deleteUser(id) {
    return baseApiHelper.delete(`/users/${id}`);
  },

  // Export users as CSV
  exportUsersAsCsv() {
    return baseApiHelper.get("/users/export/csv", {
      responseType: "blob",
    });
  },

  // Bulk operations (delete, activate, deactivate)
  bulkOperateUsers(operation, userIds) {
    return baseApiHelper.post("/users/bulk", { operation, userIds });
  },

  userList(params) {
    return baseApiHelper.post("/user-management/get-list", params);
  },

  createUser(params) {
    return baseApiHelper.post("/user-management/create-one", params);
  },

  updateUser(params) {
    const { id, ...rest } = params;
    return baseApiHelper.patch(`/user-management/edit-one?user_id=${id}`, rest);
  },

  deleteUser(id) {
    return baseApiHelper.delete(`/user-management/delete-one?user_id=${id}`);
  },

  resetPassword(params) {
    const { id, ...rest } = params;
    return baseApiHelper.post(
      `/user-management/reset-password?user_id=${id}`,
      rest
    );
  },
};
