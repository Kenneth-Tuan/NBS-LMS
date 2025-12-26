import { baseApiHelper } from "@/utils/axios";

export default {
  getUserProfile() {
    return baseApiHelper.get("/user/profile");
  },

  // Update an existing user
  updateUser(data) {
    return baseApiHelper.put(`/users/${data.id}`, data);
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
