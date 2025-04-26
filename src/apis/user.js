import { apiHelper } from "@/utils/axios";

export default {
  getUserProfile() {
    return apiHelper.get("/userprofile");
  },

  // Get all users with pagination and filtering
  getUsers(params) {
    return apiHelper.get("/users", { params });
  },

  // Get a specific user by ID
  getUser(id) {
    return apiHelper.get(`/users/${id}`);
  },

  // Create a new user
  createUser(data) {
    return apiHelper.post("/users", data);
  },

  // Update an existing user
  updateUser(data) {
    return apiHelper.put(`/users/${data.id}`, data);
  },

  // Delete a user
  deleteUser(id) {
    return apiHelper.delete(`/users/${id}`);
  },
};
