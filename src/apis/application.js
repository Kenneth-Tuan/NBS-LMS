import { apiHelper } from "@/utils/axios";

export default {
  getApplicationList() {
    return apiHelper.get("/application/list");
  },
  getApplicationDetail(id) {
    return apiHelper.get(`/application/${id}`);
  },
  createApplication(data) {
    return apiHelper.post("/application", data);
  },
  updateApplication(id, data) {
    return apiHelper.put(`/application/${id}`, data);
  },
  deleteApplication(id) {
    return apiHelper.delete(`/application/${id}`);
  },
};
