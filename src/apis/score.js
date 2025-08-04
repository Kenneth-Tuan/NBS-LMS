import { baseApiHelper } from "@/utils/axios";

export default {
  getScoreSheet(course_id) {
    return baseApiHelper.get(`/score/list-sheet?course_id=${course_id}`);
  },
  getScoreItem(course_id) {
    return baseApiHelper.get(`/score/list-item?course_id=${course_id}`);
  },
  addScoreItem(course_id, item_name) {
    return baseApiHelper.post(`/score/add-item?course_id=${course_id}`, {
      item_name,
    });
  },
  reorderScoreItem(course_id) {
    return baseApiHelper.post(`/score/reorder-item?course_id=${course_id}`);
  },
  deleteScoreItem(item_id) {
    return baseApiHelper.delete(`/score/delete-item?item_id=${item_id}`);
  },
  submitScore(params) {
    return baseApiHelper.post("/score/submit-score", params);
  },
  getMyScore(course_id) {
    return baseApiHelper.post(`/score/my-score?course_id=${course_id}`);
  },
};
