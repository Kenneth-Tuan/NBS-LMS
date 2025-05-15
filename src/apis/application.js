import { baseApiHelper } from "@/utils/axios";

export default {
  getApplicationList() {
    return baseApiHelper.get("/application/list");
  },
  getApplicationDetail(id) {
    return baseApiHelper.get(`/application/${id}`);
  },
  createApplication(data) {
    return baseApiHelper.post("/application", data);
  },
  updateApplication(id, data) {
    return baseApiHelper.put(`/application/${id}`, data);
  },
  deleteApplication(id) {
    return baseApiHelper.delete(`/application/${id}`);
  },
};
